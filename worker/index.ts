/**
 * Naija Detective on Cloudflare: the backend that replaces the claude.ai runtime.
 *
 *   /api/auth             make a player (anonymous id + secret token, kept in their browser)
 *   /api/me               who am I, and am I the owner (admin key)
 *   /api/doc?path=        get / put / delete one document          (D1)
 *   /api/col?path=        list the documents in a collection       (D1)
 *   /api/room/<name>      live room over a WebSocket: presence     (Durable Object)
 *   /api/ask              the Senior Inspector's answers           (Claude API, optional)
 *   /media/<key>          poster images                            (R2, optional)
 * Everything else is the game itself (static assets in ./cloudflare).
 *
 * Access rules mirror the claude.ai ones the game was built for:
 *   data/users/<me>/...   private to me
 *   chat/<me>, board/<me>, adstats/<me>      everyone reads, I write mine
 *   adsubmit/<me>/...     me and the owner; only the owner lists everyone's
 *   adlive, adsettings, hunts                everyone reads, the owner writes
 *   signups/<me>          sign-up name and email: me and the owner only
 */

import { DurableObject } from "cloudflare:workers";

/* eslint-disable @typescript-eslint/no-explicit-any */
type D1 = {
  prepare(sql: string): { bind(...v: unknown[]): { first<T = any>(): Promise<T | null>; all<T = any>(): Promise<{ results: T[] }>; run(): Promise<unknown> } };
  batch(stmts: unknown[]): Promise<unknown>;
};
type R2 = {
  put(key: string, value: ArrayBuffer | Uint8Array, opts?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  get(key: string): Promise<{ body: ReadableStream; httpMetadata?: { contentType?: string }; httpEtag?: string } | null>;
};
interface Env {
  DB: D1;
  MEDIA?: R2;
  ROOMS: { idFromName(n: string): unknown; get(id: unknown): { fetch(req: Request | string, init?: RequestInit): Promise<Response> } };
  ASSETS: { fetch(req: Request): Promise<Response> };
  /** Owner password for the Ad manager (set with `wrangler secret put ADMIN_KEY`). */
  ADMIN_KEY?: string;
  /** Optional: lets Claude answer the Senior Inspector questions. */
  ANTHROPIC_API_KEY?: string;
  ASK_MODEL?: string;
  /** Most Senior Inspector questions the whole game may ask Claude per day (default 300). */
  ASK_DAILY_LIMIT?: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store", "x-content-type-options": "nosniff" } });
const fail = (code: string, status: number) => json({ code }, status);

/* ---------------------------------------------------------------- database setup */

let ready: Promise<unknown> | null = null;
function schema(env: Env) {
  ready ??= env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS docs (path TEXT PRIMARY KEY, parent TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, updated INTEGER NOT NULL)").bind(),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS docs_parent ON docs(parent)").bind(),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS players (uid TEXT PRIMARY KEY, token_hash TEXT NOT NULL, created INTEGER NOT NULL)").bind(),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS usage (uid TEXT NOT NULL, day TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (uid, day))").bind(),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, n INTEGER NOT NULL, reset INTEGER NOT NULL)").bind(),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS tickets (ticket TEXT PRIMARY KEY, uid TEXT NOT NULL, exp INTEGER NOT NULL)").bind(),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS bans (uid TEXT PRIMARY KEY, at INTEGER NOT NULL, note TEXT)").bind(),
  ]).catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

/* ---------------------------------------------------------------- who is calling */

async function sha256(s: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function sameText(a: string, b: string) {
  if (a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}

const randomId = (bytes: number) => [...crypto.getRandomValues(new Uint8Array(bytes))].map((b) => b.toString(36).padStart(2, "0")).join("").slice(0, bytes * 2);

const ipOf = (req: Request) => req.headers.get("cf-connecting-ip") ?? "local";

/** Count one more use of `key`; false once it has been used `max` times within `windowMs`. */
async function allow(env: Env, key: string, max: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  const row = await env.DB.prepare(
    "INSERT INTO limits (key, n, reset) VALUES (?1, 1, ?2) ON CONFLICT(key) DO UPDATE SET n = CASE WHEN reset < ?3 THEN 1 ELSE n + 1 END, reset = CASE WHEN reset < ?3 THEN ?2 ELSE reset END RETURNING n",
  )
    .bind(key, now + windowMs, now)
    .first<{ n: number }>();
  return (row?.n ?? 1) <= max;
}

/** Has `key` already reached `max` (without counting this one)? */
async function blocked(env: Env, key: string, max: number): Promise<boolean> {
  const row = await env.DB.prepare("SELECT n, reset FROM limits WHERE key = ?").bind(key).first<{ n: number; reset: number }>();
  return !!row && row.reset > Date.now() && row.n >= max;
}

/** The player behind a request: "uid.token" in the Authorization header. */
async function caller(req: Request, env: Env): Promise<{ uid: string; owner: boolean; banned?: boolean } | null> {
  const raw = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const [uid, token] = raw.split(".");
  if (!uid || !token || !/^[a-z0-9]{8,40}$/.test(uid) || token.length > 80) return null;
  const row = await env.DB.prepare("SELECT token_hash FROM players WHERE uid = ?").bind(uid).first<{ token_hash: string }>();
  if (!row || !sameText(row.token_hash, await sha256(token))) return null;
  // the owner password: 10 wrong tries an hour from one address locks that address out for the hour
  const key = req.headers.get("x-admin-key") ?? "";
  let owner = false;
  if (key && env.ADMIN_KEY) {
    const lock = `admin-fail:${ipOf(req)}`;
    if (!(await blocked(env, lock, 10))) {
      owner = sameText(await sha256(key), await sha256(env.ADMIN_KEY));
      if (!owner) await allow(env, lock, 10, 3_600_000);
    }
  }
  const ban = owner ? null : await env.DB.prepare("SELECT 1 AS x FROM bans WHERE uid = ?").bind(uid).first();
  return { uid, owner, banned: !!ban };
}

/* ---------------------------------------------------------------- access rules */

const PATH = /^[A-Za-z0-9_.-]{1,64}(\/[A-Za-z0-9_.-]{1,64}){0,7}$/;
const PUBLIC_READ = new Set(["chat", "board", "adstats", "adlive", "adsettings", "hunts"]);
const OWN_DOC = new Set(["chat", "board", "adstats"]);
const OWNER_WRITE = new Set(["adlive", "adsettings", "hunts"]);

function canRead(seg: string[], who: { uid: string; owner: boolean }) {
  const [top, second] = seg;
  if (top === "data") return seg[1] === "users" && seg[2] === who.uid;
  if (top === "adsubmit") return seg.length === 1 ? who.owner : second === who.uid || who.owner;
  if (top === "signups") return seg.length === 1 ? who.owner : second === who.uid || who.owner;
  return PUBLIC_READ.has(top);
}

function canWrite(seg: string[], who: { uid: string; owner: boolean }) {
  const [top, second] = seg;
  if (top === "data") return seg[1] === "users" && seg[2] === who.uid && seg.length >= 4;
  if (top === "adsubmit") return second === who.uid || who.owner;
  if (top === "signups") return seg.length === 2 && (second === who.uid || who.owner);
  if (OWN_DOC.has(top)) return seg.length === 2 && (second === who.uid || who.owner);
  if (OWNER_WRITE.has(top)) return who.owner;
  return false;
}

/**
 * Approved poster pictures go to R2 (when it's set up); the document keeps a /media/ link.
 * Only owner-published documents (adlive, hunts) move images to R2, so nobody can
 * use the bucket as free image hosting: submissions stay inside the database until
 * the owner approves them.
 */
async function storeImages(env: Env, seg: string[], data: Record<string, unknown>) {
  if (!env.MEDIA || !OWNER_WRITE.has(seg[0])) return data;
  const out: Record<string, unknown> = { ...data };
  for (const [k, v] of Object.entries(out)) {
    if (k !== "image" || typeof v !== "string" || !v.startsWith("data:image/jpeg;base64,")) continue;
    const b64 = v.slice("data:image/jpeg;base64,".length);
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const key = `img/${(await sha256(b64)).slice(0, 32)}.jpg`;
    await env.MEDIA.put(key, bytes, { httpMetadata: { contentType: "image/jpeg" } });
    out[k] = `/media/${key}`;
  }
  return out;
}

/** Largest document each player may write, by where it lives (the owner may write up to 1.5 MB). */
function maxBytes(seg: string[]) {
  if (seg[0] === "adsubmit") return 400_000; // a poster picture
  if (seg[0] === "data") return 600_000; // the cloud save
  return 64_000;
}

/** How many documents a player may keep in their own collections. */
const MAX_OWN_DOCS: Record<string, number> = { adsubmit: 40, data: 20 };

const clampNum = (v: unknown, lo: number, hi: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo);

/** Leaderboard rows are written by players, so keep them within what the game can reach. */
function tidy(seg: string[], data: Record<string, unknown>, owner: boolean) {
  if (owner || seg[0] !== "board") return data;
  return {
    ...data,
    balance: clampNum(data.balance, -100_000_000, 2_000_000_000),
    rating: clampNum(data.rating, 0, 5),
    xp: clampNum(data.xp, 0, 50_000),
    solved: clampNum(data.solved, 0, 500),
    badges: clampNum(data.badges, 0, 100),
  };
}

const likeEscape = (s: string) => s.replace(/[\\%_]/g, (c) => "\\" + c);

/** Tell everyone in the lobby that a collection changed, so their lists refresh. */
function notify(env: Env, ctx: { waitUntil(p: Promise<unknown>): void }, parent: string) {
  if (parent.startsWith("data/")) return;
  const stub = env.ROOMS.get(env.ROOMS.idFromName("lobby"));
  ctx.waitUntil(stub.fetch("https://room/notify", { method: "POST", body: parent }).catch(() => undefined));
}

/* ---------------------------------------------------------------- the API */

async function api(req: Request, env: Env, ctx: { waitUntil(p: Promise<unknown>): void }): Promise<Response> {
  await schema(env);
  const url = new URL(req.url);
  const route = url.pathname.replace(/^\/api\//, "");

  if (route === "health") return json({ ok: true, media: !!env.MEDIA, ask: !!env.ANTHROPIC_API_KEY });

  if (route === "auth" && req.method === "POST") {
    if (!(await allow(env, `auth:${ipOf(req)}`, 30, 3_600_000))) return fail("rate_limited", 429);
    const uid = randomId(10);
    const token = randomId(24);
    await env.DB.prepare("INSERT INTO players (uid, token_hash, created) VALUES (?, ?, ?)").bind(uid, await sha256(token), Date.now()).run();
    return json({ uid, token });
  }

  // live rooms: a WebSocket can't send headers, so it brings a one-minute, one-use ticket
  if (route.startsWith("room/")) {
    const name = route.slice(5);
    if (!/^[a-z0-9][a-z0-9_.-]{0,47}$/.test(name)) return fail("invalid_argument", 400);
    if (req.headers.get("upgrade") !== "websocket") return fail("expected_websocket", 426);
    const ticket = url.searchParams.get("ticket") ?? "";
    const row = await env.DB.prepare("DELETE FROM tickets WHERE ticket = ? RETURNING uid, exp").bind(ticket).first<{ uid: string; exp: number }>();
    if (!row || row.exp < Date.now()) return fail("not_signed_in", 401);
    const stub = env.ROOMS.get(env.ROOMS.idFromName(name));
    return stub.fetch(new Request(`https://room/connect?by=${row.uid}`, req));
  }

  const who = await caller(req, env);
  if (!who) return fail("not_signed_in", 401);
  // banned players can still read (play), but can't write anything or join live rooms
  if (who.banned && (req.method !== "GET" || route === "ticket")) return fail("banned", 403);

  /* ---- the owner console (needs the owner password) */
  if (route.startsWith("admin/")) {
    if (!who.owner) return fail("not_permitted", 403);
    if (route === "admin/overview") {
      const players = await env.DB.prepare("SELECT COUNT(*) AS n FROM players").bind().first<{ n: number }>();
      const today = await env.DB.prepare("SELECT COUNT(*) AS n FROM players WHERE created > ?").bind(Date.now() - 86_400_000).first<{ n: number }>();
      const bans = await env.DB.prepare("SELECT uid, at, note FROM bans ORDER BY at DESC LIMIT 200").bind().all<{ uid: string; at: number; note: string }>();
      return json({ players: players?.n ?? 0, newToday: today?.n ?? 0, bans: bans.results, media: !!env.MEDIA, ask: !!env.ANTHROPIC_API_KEY });
    }
    if (route === "admin/ban" && req.method === "POST") {
      const body = (await req.json().catch(() => ({}))) as { uid?: unknown; ban?: unknown; wipe?: unknown; note?: unknown };
      const uid = typeof body.uid === "string" && /^[a-z0-9]{8,40}$/.test(body.uid) ? body.uid : "";
      if (!uid) return fail("invalid_argument", 400);
      if (body.ban === false) {
        await env.DB.prepare("DELETE FROM bans WHERE uid = ?").bind(uid).run();
        return json({ ok: true });
      }
      const note = typeof body.note === "string" ? body.note.slice(0, 120) : "";
      await env.DB.prepare("INSERT INTO bans (uid, at, note) VALUES (?, ?, ?) ON CONFLICT(uid) DO UPDATE SET at = excluded.at, note = excluded.note").bind(uid, Date.now(), note).run();
      if (body.wipe) {
        // take down what they put in public: leaderboard row and chat
        await env.DB.batch([env.DB.prepare("DELETE FROM docs WHERE path = ?").bind(`board/${uid}`), env.DB.prepare("DELETE FROM docs WHERE path = ?").bind(`chat/${uid}`)]);
        notify(env, ctx, "board");
        notify(env, ctx, "chat");
      }
      return json({ ok: true });
    }
    return fail("not_found", 404);
  }

  if (route === "ticket" && req.method === "POST") {
    if (!(await allow(env, `ticket:${who.uid}`, 120, 3_600_000))) return fail("rate_limited", 429);
    const ticket = randomId(20);
    await env.DB.batch([
      env.DB.prepare("DELETE FROM tickets WHERE exp < ?").bind(Date.now()),
      env.DB.prepare("INSERT INTO tickets (ticket, uid, exp) VALUES (?, ?, ?)").bind(ticket, who.uid, Date.now() + 60_000),
    ]);
    return json({ ticket });
  }

  if (route === "me") return json({ uid: who.uid, owner: who.owner, ownerSet: !!env.ADMIN_KEY });

  if (route === "ask" && req.method === "POST") return ask(req, env, who.uid, ipOf(req));

  const path = url.searchParams.get("path") ?? "";
  if (!PATH.test(path)) return fail("invalid_argument", 400);
  const seg = path.split("/");

  if (route === "col") {
    if (seg.length % 2 !== 1) return fail("invalid_argument", 400);
    if (!canRead([...seg, who.uid], who) && !canRead(seg, who)) return fail("not_permitted", 403);
    // a private collection lists only what the caller may read
    const rows = await env.DB.prepare("SELECT id, data FROM docs WHERE parent = ? ORDER BY updated DESC LIMIT 500").bind(path).all<{ id: string; data: string }>();
    const docs = rows.results.filter((r) => canRead([...seg, r.id], who)).map((r) => ({ id: r.id, data: JSON.parse(r.data) }));
    return json({ docs });
  }

  if (route === "doc") {
    if (seg.length % 2 !== 0) return fail("invalid_argument", 400);
    const parent = seg.slice(0, -1).join("/");
    const id = seg[seg.length - 1];
    if (req.method === "GET") {
      if (!canRead(seg, who)) return fail("not_permitted", 403);
      const row = await env.DB.prepare("SELECT data FROM docs WHERE path = ?").bind(path).first<{ data: string }>();
      return json({ exists: !!row, data: row ? JSON.parse(row.data) : null });
    }
    if (!canWrite(seg, who)) return fail("not_permitted", 403);
    if (req.method === "DELETE") {
      await env.DB.prepare("DELETE FROM docs WHERE path = ? OR path LIKE ? ESCAPE '\\'").bind(path, `${likeEscape(path)}/%`).run();
      notify(env, ctx, parent);
      return json({ ok: true });
    }
    if (req.method === "PUT") {
      const text = await req.text();
      if (text.length > (who.owner ? 1_500_000 : maxBytes(seg))) return fail("too_large", 413);
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        return fail("invalid_argument", 400);
      }
      if (!data || typeof data !== "object" || Array.isArray(data)) return fail("invalid_argument", 400);
      // a cap on how many documents a player keeps (new documents only)
      const cap = MAX_OWN_DOCS[seg[0]];
      if (cap && !who.owner) {
        const exists = await env.DB.prepare("SELECT 1 AS x FROM docs WHERE path = ?").bind(path).first();
        if (!exists) {
          const mine = seg[0] === "data" ? `data/users/${who.uid}/` : `adsubmit/${who.uid}/`;
          const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM docs WHERE path LIKE ? ESCAPE '\\'").bind(`${likeEscape(mine)}%`).first<{ n: number }>();
          if ((n?.n ?? 0) >= cap) return fail("quota_exceeded", 429);
        }
      }
      const stored = await storeImages(env, seg, tidy(seg, data as Record<string, unknown>, who.owner));
      await env.DB.prepare("INSERT INTO docs (path, parent, id, data, updated) VALUES (?, ?, ?, ?, ?) ON CONFLICT(path) DO UPDATE SET data = excluded.data, updated = excluded.updated")
        .bind(path, parent, id, JSON.stringify(stored), Date.now())
        .run();
      notify(env, ctx, parent);
      return json({ ok: true });
    }
  }
  return fail("not_found", 404);
}

/* ---------------------------------------------------------------- the Senior Inspector (Claude API) */

const ASKS_PER_DAY = 20;
const ASKS_PER_ADDRESS = 40;
const DAY = 86_400_000;

async function ask(req: Request, env: Env, uid: string, ip: string) {
  if (!env.ANTHROPIC_API_KEY) return fail("not_granted", 501);
  const { prompt } = (await req.json().catch(() => ({}))) as { prompt?: unknown };
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 6000) return fail("invalid_argument", 400);
  // free accounts are easy to make, so the limits also count per address and for the whole game
  const whole = Math.max(1, Number(env.ASK_DAILY_LIMIT) || 300);
  if (!(await allow(env, `ask:uid:${uid}`, ASKS_PER_DAY, DAY))) return fail("rate_limited", 429);
  if (!(await allow(env, `ask:ip:${ip}`, ASKS_PER_ADDRESS, DAY))) return fail("rate_limited", 429);
  if (!(await allow(env, "ask:all", whole, DAY))) return fail("rate_limited", 429);
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: env.ASK_MODEL || "claude-haiku-5-5", max_tokens: 400, messages: [{ role: "user", content: prompt.slice(0, 8000) }] }),
  });
  if (!r.ok) return fail("upstream_error", 502);
  const out = (await r.json()) as { content?: { type: string; text?: string }[] };
  return json({ text: (out.content ?? []).filter((c) => c.type === "text").map((c) => c.text).join("") });
}

/* ---------------------------------------------------------------- the Worker */

export default {
  async fetch(req: Request, env: Env, ctx: { waitUntil(p: Promise<unknown>): void }) {
    const url = new URL(req.url);
    try {
      if (url.pathname.startsWith("/api/")) return await api(req, env, ctx);
      if (url.pathname.startsWith("/media/")) {
        if (!env.MEDIA) return new Response("Not found", { status: 404 });
        const obj = await env.MEDIA.get(url.pathname.slice("/media/".length));
        if (!obj) return new Response("Not found", { status: 404 });
        return new Response(obj.body, {
          headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff", "content-security-policy": "default-src 'none'" },
        });
      }
    } catch (e) {
      console.error(e);
      return fail("server_error", 500);
    }
    return env.ASSETS.fetch(req);
  },
};

/* ---------------------------------------------------------------- live rooms */

interface Attachment {
  peer: string;
  by: string;
  presence: Record<string, unknown>;
  updatedAt: number;
  /** Flood control: messages in the current 5-second window. */
  burst?: number;
  burstAt?: number;
}

/**
 * One live room (the lobby, or a case's co-op room). Each open game is a
 * WebSocket peer with a small presence object; the room sends everyone the
 * full list whenever someone joins, changes or leaves. The lobby also passes
 * on "this collection changed" notes so open games refresh their lists.
 */
export class Room extends DurableObject {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/notify") {
      const col = await req.text();
      this.send({ t: "changed", col });
      return new Response("ok");
    }
    const by = url.searchParams.get("by") ?? "";
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair) as [WebSocket, WebSocket];
    const me: Attachment = { peer: randomId(8), by, presence: {}, updatedAt: Date.now() };
    (this.ctx as any).acceptWebSocket(server);
    (server as any).serializeAttachment(me);
    server.send(JSON.stringify({ t: "hello", peer: me.peer }));
    this.sendPeers();
    return new Response(null, { status: 101, webSocket: client } as ResponseInit);
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    if (typeof message !== "string" || message.length > 6000) return;
    let msg: { t?: string; patch?: Record<string, unknown> };
    try {
      msg = JSON.parse(message);
    } catch {
      return;
    }
    if (msg.t !== "presence" || !msg.patch || typeof msg.patch !== "object") return;
    const me = (ws as any).deserializeAttachment() as Attachment;
    const now = Date.now();
    const fresh = !me.burstAt || now - me.burstAt > 5000;
    const burst = fresh ? 1 : (me.burst ?? 0) + 1;
    if (burst > 40) return; // more than 8 a second: ignore until the window passes
    const next = { ...me.presence };
    for (const [k, v] of Object.entries(msg.patch)) {
      if (!/^[A-Za-z_][A-Za-z0-9_-]{0,63}$/.test(k)) continue;
      if (v === null) delete next[k];
      else next[k] = v;
    }
    if (JSON.stringify(next).length > 4096) return;
    (ws as any).serializeAttachment({ ...me, presence: next, updatedAt: now, burst, burstAt: fresh ? now : me.burstAt });
    this.sendPeers();
  }

  async webSocketClose(ws: WebSocket) {
    try {
      ws.close();
    } catch {
      // already closed
    }
    this.sendPeers(ws);
  }

  async webSocketError(ws: WebSocket) {
    this.sendPeers(ws);
  }

  private sockets(except?: WebSocket): WebSocket[] {
    return ((this.ctx as any).getWebSockets() as WebSocket[]).filter((w) => w !== except && w.readyState === 1);
  }

  private sendPeers(except?: WebSocket) {
    const peers = this.sockets(except)
      .slice(0, 256)
      .map((w) => (w as any).deserializeAttachment() as Attachment);
    this.send({ t: "peers", peers }, except);
  }

  private send(msg: unknown, except?: WebSocket) {
    const text = JSON.stringify(msg);
    for (const w of this.sockets(except)) {
      try {
        w.send(text);
      } catch {
        // gone
      }
    }
  }
}
