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
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const fail = (code: string, status: number) => json({ code }, status);

/* ---------------------------------------------------------------- database setup */

let ready: Promise<unknown> | null = null;
function schema(env: Env) {
  ready ??= env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS docs (path TEXT PRIMARY KEY, parent TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, updated INTEGER NOT NULL)").bind(),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS docs_parent ON docs(parent)").bind(),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS players (uid TEXT PRIMARY KEY, token_hash TEXT NOT NULL, created INTEGER NOT NULL)").bind(),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS usage (uid TEXT NOT NULL, day TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (uid, day))").bind(),
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

/** The player behind a request: "uid.token" in the Authorization header (or ?auth= for WebSockets). */
async function caller(req: Request, env: Env): Promise<{ uid: string; owner: boolean } | null> {
  const url = new URL(req.url);
  const raw = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "") || url.searchParams.get("auth") || "";
  const [uid, token] = raw.split(".");
  if (!uid || !token || !/^[a-z0-9]{8,40}$/.test(uid)) return null;
  const row = await env.DB.prepare("SELECT token_hash FROM players WHERE uid = ?").bind(uid).first<{ token_hash: string }>();
  if (!row || !sameText(row.token_hash, await sha256(token))) return null;
  const key = req.headers.get("x-admin-key") ?? "";
  const owner = !!env.ADMIN_KEY && key.length > 0 && sameText(await sha256(key), await sha256(env.ADMIN_KEY));
  return { uid, owner };
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

/** Poster pictures go to R2 (when it's set up); the document keeps a /media/ link. */
async function storeImages(env: Env, data: Record<string, unknown>) {
  if (!env.MEDIA) return data;
  const out: Record<string, unknown> = { ...data };
  for (const [k, v] of Object.entries(out)) {
    if (typeof v !== "string" || !v.startsWith("data:image/jpeg;base64,")) continue;
    const b64 = v.slice("data:image/jpeg;base64,".length);
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const key = `img/${(await sha256(b64)).slice(0, 32)}.jpg`;
    await env.MEDIA.put(key, bytes, { httpMetadata: { contentType: "image/jpeg" } });
    out[k] = `/media/${key}`;
  }
  return out;
}

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
    const uid = randomId(10);
    const token = randomId(24);
    await env.DB.prepare("INSERT INTO players (uid, token_hash, created) VALUES (?, ?, ?)").bind(uid, await sha256(token), Date.now()).run();
    return json({ uid, token });
  }

  const who = await caller(req, env);
  if (!who) return fail("not_signed_in", 401);

  if (route === "me") return json({ uid: who.uid, owner: who.owner, ownerSet: !!env.ADMIN_KEY });

  if (route.startsWith("room/")) {
    const name = route.slice(5);
    if (!/^[a-z0-9][a-z0-9_.-]{0,47}$/.test(name)) return fail("invalid_argument", 400);
    if (req.headers.get("upgrade") !== "websocket") return fail("expected_websocket", 426);
    const stub = env.ROOMS.get(env.ROOMS.idFromName(name));
    const fwd = new Request(`https://room/connect?by=${who.uid}`, req);
    return stub.fetch(fwd);
  }

  if (route === "ask" && req.method === "POST") return ask(req, env, who.uid);

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
      await env.DB.prepare("DELETE FROM docs WHERE path = ? OR path LIKE ?").bind(path, `${path}/%`).run();
      notify(env, ctx, parent);
      return json({ ok: true });
    }
    if (req.method === "PUT") {
      const text = await req.text();
      if (text.length > 1_500_000) return fail("too_large", 413);
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        return fail("invalid_argument", 400);
      }
      if (!data || typeof data !== "object" || Array.isArray(data)) return fail("invalid_argument", 400);
      const stored = await storeImages(env, data as Record<string, unknown>);
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

const ASKS_PER_DAY = 40;

async function ask(req: Request, env: Env, uid: string) {
  if (!env.ANTHROPIC_API_KEY) return fail("not_granted", 501);
  const day = new Date().toISOString().slice(0, 10);
  const used = await env.DB.prepare("SELECT n FROM usage WHERE uid = ? AND day = ?").bind(uid, day).first<{ n: number }>();
  if ((used?.n ?? 0) >= ASKS_PER_DAY) return fail("rate_limited", 429);
  await env.DB.prepare("INSERT INTO usage (uid, day, n) VALUES (?, ?, 1) ON CONFLICT(uid, day) DO UPDATE SET n = n + 1").bind(uid, day).run();
  const { prompt } = (await req.json().catch(() => ({}))) as { prompt?: unknown };
  if (typeof prompt !== "string" || !prompt.trim()) return fail("invalid_argument", 400);
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
        return new Response(obj.body, { headers: { "content-type": obj.httpMetadata?.contentType ?? "image/jpeg", "cache-control": "public, max-age=31536000, immutable" } });
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
    const next = { ...me.presence };
    for (const [k, v] of Object.entries(msg.patch)) {
      if (!/^[A-Za-z_][A-Za-z0-9_-]{0,63}$/.test(k)) continue;
      if (v === null) delete next[k];
      else next[k] = v;
    }
    if (JSON.stringify(next).length > 4096) return;
    (ws as any).serializeAttachment({ ...me, presence: next, updatedAt: Date.now() });
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
