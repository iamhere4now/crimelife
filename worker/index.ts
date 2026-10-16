/**
 * Naija Detective on Cloudflare: the backend that replaces the claude.ai runtime.
 *
 *   /api/auth             make a player (anonymous id + secret token, kept in their browser)
 *   /api/account/...      email + password accounts: register, login (any device), password, logout
 *   /api/me               who am I, and am I the owner (admin key)
 *   /api/doc?path=        get / put / delete one document          (D1)
 *   /api/col?path=        list the documents in a collection       (D1)
 *   /api/room/<name>      live room over a WebSocket: presence     (Durable Object)
 *   /api/ask              the Senior Inspector's answers           (Claude API, optional)
 *   /api/push/...         home-screen reminders (Web Push), sent by the cron trigger
 *   /api/pay/...          advertisers pay for posters with Paystack (optional)
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
import { maskRude, safeName } from "../src/lib/clean";

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
  /** Optional: Paystack secret key (sk_live_... or sk_test_...) so advertisers can pay online. */
  PAYSTACK_SECRET_KEY?: string;
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
    env.DB.prepare("CREATE TABLE IF NOT EXISTS accounts (email TEXT PRIMARY KEY, uid TEXT NOT NULL UNIQUE, pw_hash TEXT NOT NULL, salt TEXT NOT NULL, iters INTEGER NOT NULL, full_name TEXT, created INTEGER NOT NULL, changed INTEGER NOT NULL)").bind(),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, uid TEXT NOT NULL, created INTEGER NOT NULL)").bind(),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL)").bind(),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS push_subs (endpoint TEXT PRIMARY KEY, uid TEXT NOT NULL, created INTEGER NOT NULL)").bind(),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS push_subs_uid ON push_subs(uid)").bind(),
    env.DB.prepare(
      "CREATE TABLE IF NOT EXISTS push_jobs (id INTEGER PRIMARY KEY AUTOINCREMENT, kind TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, created INTEGER NOT NULL, started INTEGER, finished INTEGER, cursor TEXT NOT NULL DEFAULT '', sent INTEGER NOT NULL DEFAULT 0, gone INTEGER NOT NULL DEFAULT 0)",
    ).bind(),
    // Paystack payments: only the Worker writes here, so a player can't mark their own poster paid
    env.DB.prepare(
      "CREATE TABLE IF NOT EXISTS payments (ref TEXT PRIMARY KEY, uid TEXT NOT NULL, sub_id TEXT NOT NULL, amount INTEGER NOT NULL, email TEXT NOT NULL, hunt_case TEXT, status TEXT NOT NULL, created INTEGER NOT NULL, paid_at INTEGER, channel TEXT)",
    ).bind(),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS payments_uid ON payments(uid)").bind(),
    env.DB.prepare(
      "CREATE TABLE IF NOT EXISTS reports (id INTEGER PRIMARY KEY AUTOINCREMENT, uid TEXT NOT NULL, kind TEXT NOT NULL, text TEXT NOT NULL, context TEXT, created INTEGER NOT NULL, done INTEGER NOT NULL DEFAULT 0)",
    ).bind(),
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
  const hashed = await sha256(token);
  const row = await env.DB.prepare("SELECT token_hash FROM players WHERE uid = ?").bind(uid).first<{ token_hash: string }>();
  if (!row) return null;
  if (!sameText(row.token_hash, hashed)) {
    // signed in on another device with email and password
    const sess = await env.DB.prepare("SELECT uid FROM sessions WHERE token_hash = ?").bind(hashed).first<{ uid: string }>();
    if (!sess || sess.uid !== uid) return null;
  }
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

/* ---------------------------------------------------------------- passwords */

const PBKDF2_ITERS = 100_000;
const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

/** PBKDF2-SHA-256: a slow, salted one-way hash, so stored passwords can't be read back. */
async function hashPassword(password: string, salt: Uint8Array, iters = PBKDF2_ITERS) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: iters }, key, 256);
  return b64(new Uint8Array(bits));
}

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const goodPassword = (pw: unknown): pw is string => typeof pw === "string" && pw.length >= 8 && pw.length <= 128;

/** A new sign-in token for this player on this device. */
async function newSession(env: Env, uid: string) {
  const token = randomId(24);
  await env.DB.prepare("INSERT INTO sessions (token_hash, uid, created) VALUES (?, ?, ?)").bind(await sha256(token), uid, Date.now()).run();
  return token;
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

/**
 * Public rows are written by players: keep leaderboard numbers within what the game
 * can reach, and mask insults in names and chat before anyone else can read them.
 */
function tidy(seg: string[], data: Record<string, unknown>, owner: boolean) {
  if (owner) return data;
  if (seg[0] === "chat") {
    const msgs = Array.isArray(data.msgs) ? data.msgs : [];
    return {
      ...data,
      name: typeof data.name === "string" ? safeName(data.name) : data.name,
      msgs: msgs.map((m) => (m && typeof m === "object" && typeof (m as { text?: unknown }).text === "string" ? { ...m, text: maskRude((m as { text: string }).text) } : m)),
    };
  }
  if (seg[0] !== "board") return data;
  return {
    ...data,
    name: typeof data.name === "string" ? safeName(data.name) : data.name,
    balance: clampNum(data.balance, -100_000_000, 2_000_000_000),
    rating: clampNum(data.rating, 0, 5),
    xp: clampNum(data.xp, 0, 50_000),
    solved: clampNum(data.solved, 0, 500),
    badges: clampNum(data.badges, 0, 100),
    weekXp: clampNum(data.weekXp, 0, 50_000),
    prevWeekXp: clampNum(data.prevWeekXp, 0, 50_000),
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

  if (route === "health") return json({ ok: true, media: !!env.MEDIA, ask: !!env.ANTHROPIC_API_KEY, pay: !!env.PAYSTACK_SECRET_KEY });

  // the owner's support contact (Ad manager settings), for the privacy and terms pages
  if (route === "contact") {
    const s = await readDoc(env, "adsettings/main");
    return json({ support: typeof s?.support === "string" ? s.support.slice(0, 160) : "" });
  }

  // Paystack tells us about payments here; the signature proves it's them
  if (route === "pay/webhook" && req.method === "POST") return payWebhook(req, env, ctx);

  if (route === "auth" && req.method === "POST") {
    if (!(await allow(env, `auth:${ipOf(req)}`, 30, 3_600_000))) return fail("rate_limited", 429);
    const uid = randomId(10);
    const token = randomId(24);
    await env.DB.prepare("INSERT INTO players (uid, token_hash, created) VALUES (?, ?, ?)").bind(uid, await sha256(token), Date.now()).run();
    return json({ uid, token });
  }

  /* ---- signing in with email and password (any device) */
  if (route === "account/login" && req.method === "POST") {
    const body = (await req.json().catch(() => ({}))) as { email?: unknown; password?: unknown };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!EMAIL.test(email) || typeof body.password !== "string" || body.password.length > 128) return fail("invalid_argument", 400);
    // guessing: 20 tries an hour from one address, 10 an hour on one email
    if (!(await allow(env, `login:ip:${ipOf(req)}`, 20, 3_600_000)) || !(await allow(env, `login:email:${email}`, 10, 3_600_000))) return fail("rate_limited", 429);
    const acc = await env.DB.prepare("SELECT uid, pw_hash, salt, iters FROM accounts WHERE email = ?").bind(email).first<{ uid: string; pw_hash: string; salt: string; iters: number }>();
    // the same answer and about the same work whether or not the email exists
    const check = await hashPassword(body.password, acc ? unb64(acc.salt) : new Uint8Array(16), acc?.iters ?? PBKDF2_ITERS);
    if (!acc || !sameText(check, acc.pw_hash)) return fail("wrong_login", 401);
    const banned = await env.DB.prepare("SELECT 1 AS x FROM bans WHERE uid = ?").bind(acc.uid).first();
    if (banned) return fail("banned", 403);
    return json({ uid: acc.uid, token: await newSession(env, acc.uid), email });
  }

  /* ---- reminders: the public key for subscribing, and the message a push is about */
  if (route === "push/key") return json({ key: (await vapidKeys(env)).publicKey });
  if (route === "push/latest") {
    const row = await env.DB.prepare(
      "SELECT title, body FROM push_jobs WHERE started IS NOT NULL AND (finished IS NULL OR finished > ?) ORDER BY finished IS NULL DESC, finished DESC LIMIT 1",
    )
      .bind(Date.now() - 6 * 3_600_000)
      .first<{ title: string; body: string }>();
    return json(row ?? { title: "Naija Detective", body: "New cases are waiting for you, Detective." });
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
      const accounts = await env.DB.prepare("SELECT COUNT(*) AS n FROM accounts").bind().first<{ n: number }>();
      const subs = await env.DB.prepare("SELECT COUNT(*) AS n FROM push_subs").bind().first<{ n: number }>();
      const jobs = await env.DB.prepare("SELECT id, kind, title, body, created, finished, sent, gone FROM push_jobs ORDER BY id DESC LIMIT 6").bind().all();
      const auto = await env.DB.prepare("SELECT value FROM kv WHERE key = 'push:auto'").bind().first<{ value: string }>();
      return json({
        players: players?.n ?? 0,
        newToday: today?.n ?? 0,
        accounts: accounts?.n ?? 0,
        bans: bans.results,
        media: !!env.MEDIA,
        ask: !!env.ANTHROPIC_API_KEY,
        push: { subscribers: subs?.n ?? 0, auto: auto?.value !== "off", jobs: jobs.results },
      });
    }
    if (route === "admin/push" && req.method === "POST") {
      const body = (await req.json().catch(() => ({}))) as { title?: unknown; body?: unknown };
      const title = typeof body.title === "string" ? body.title.trim().slice(0, 60) : "";
      const text = typeof body.body === "string" ? body.body.trim().slice(0, 160) : "";
      if (!title || !text) return fail("invalid_argument", 400);
      const waiting = await env.DB.prepare("SELECT COUNT(*) AS n FROM push_jobs WHERE finished IS NULL").bind().first<{ n: number }>();
      if ((waiting?.n ?? 0) >= 3) return fail("rate_limited", 429);
      await env.DB.prepare("INSERT INTO push_jobs (kind, title, body, created) VALUES ('owner', ?, ?, ?)").bind(title, text, Date.now()).run();
      return json({ ok: true });
    }
    if (route === "admin/reports") {
      const rows = await env.DB.prepare("SELECT id, uid, kind, text, context, created, done FROM reports ORDER BY done, id DESC LIMIT 200").bind().all();
      return json({ reports: rows.results });
    }
    if (route === "admin/report-done" && req.method === "POST") {
      const body = (await req.json().catch(() => ({}))) as { id?: unknown };
      await env.DB.prepare("UPDATE reports SET done = 1 WHERE id = ?").bind(Number(body.id) || 0).run();
      return json({ ok: true });
    }
    if (route === "admin/payments") {
      const rows = await env.DB.prepare("SELECT ref, uid, sub_id, amount, status, paid_at, channel FROM payments WHERE status IN ('paid', 'mismatch') ORDER BY created DESC LIMIT 500").bind().all();
      return json({ payments: rows.results, enabled: !!env.PAYSTACK_SECRET_KEY });
    }
    if (route === "admin/push-auto" && req.method === "POST") {
      const body = (await req.json().catch(() => ({}))) as { on?: unknown };
      await env.DB.prepare("INSERT INTO kv (key, value) VALUES ('push:auto', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(body.on === false ? "off" : "on").run();
      return json({ ok: true });
    }
    if (route === "admin/reset-password" && req.method === "POST") {
      const body = (await req.json().catch(() => ({}))) as { email?: unknown; password?: unknown };
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      if (!EMAIL.test(email) || !goodPassword(body.password)) return fail("invalid_argument", 400);
      const acc = await env.DB.prepare("SELECT uid FROM accounts WHERE email = ?").bind(email).first<{ uid: string }>();
      if (!acc) return fail("not_found", 404);
      const salt = crypto.getRandomValues(new Uint8Array(16));
      await env.DB.batch([
        env.DB.prepare("UPDATE accounts SET pw_hash = ?, salt = ?, iters = ?, changed = ? WHERE email = ?").bind(await hashPassword(body.password, salt), b64(salt), PBKDF2_ITERS, Date.now(), email),
        env.DB.prepare("DELETE FROM sessions WHERE uid = ?").bind(acc.uid),
      ]);
      return json({ ok: true });
    }
    if (route === "admin/accounts") {
      const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM accounts").bind().first<{ n: number }>();
      return json({ accounts: n?.n ?? 0 });
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

  if (route === "me") {
    const acc = await env.DB.prepare("SELECT email FROM accounts WHERE uid = ?").bind(who.uid).first<{ email: string }>();
    return json({ uid: who.uid, owner: who.owner, ownerSet: !!env.ADMIN_KEY, email: acc?.email ?? null });
  }

  /* ---- paying for a poster */
  if (route.startsWith("pay/")) return pay(route, req, env, ctx, who.uid, url.origin);

  /* ---- "Report a problem" (players to the owner console) */
  if (route === "report" && req.method === "POST") {
    if (!(await allow(env, `report:${who.uid}`, 10, 86_400_000))) return fail("rate_limited", 429);
    const body = (await req.json().catch(() => ({}))) as { kind?: unknown; text?: unknown; context?: unknown };
    const kind = ["bug", "player", "payment", "idea", "other"].includes(String(body.kind)) ? String(body.kind) : "other";
    const text = typeof body.text === "string" ? body.text.trim().slice(0, 1000) : "";
    if (text.length < 5) return fail("invalid_argument", 400);
    const context = typeof body.context === "string" ? body.context.slice(0, 600) : "";
    await env.DB.prepare("INSERT INTO reports (uid, kind, text, context, created) VALUES (?, ?, ?, ?, ?)").bind(who.uid, kind, text, context, Date.now()).run();
    return json({ ok: true });
  }

  /* ---- "Delete my account": everything this player made, gone (payment records stay, by law) */
  if (route === "account/delete" && req.method === "POST") {
    if (!(await allow(env, `delete:${who.uid}`, 10, 3_600_000))) return fail("rate_limited", 429);
    const body = (await req.json().catch(() => ({}))) as { password?: unknown };
    const acc = await env.DB.prepare("SELECT pw_hash, salt, iters FROM accounts WHERE uid = ?").bind(who.uid).first<{ pw_hash: string; salt: string; iters: number }>();
    // with a password set, a borrowed phone isn't enough: ask for it again
    if (acc && (typeof body.password !== "string" || !sameText(await hashPassword(body.password, unb64(acc.salt), acc.iters), acc.pw_hash))) return fail("wrong_login", 401);
    const uid = who.uid;
    // their posters: take down any live ones too
    const subs = await env.DB.prepare("SELECT id FROM docs WHERE parent = ?").bind(`adsubmit/${uid}/posters`).all<{ id: string }>();
    await env.DB.batch([
      env.DB.prepare("DELETE FROM docs WHERE path LIKE ? ESCAPE '\\'").bind(`${likeEscape(`data/users/${uid}`)}/%`),
      env.DB.prepare("DELETE FROM docs WHERE path = ? OR path LIKE ? ESCAPE '\\'").bind(`adsubmit/${uid}`, `${likeEscape(`adsubmit/${uid}`)}/%`),
      ...["board", "chat", "adstats", "signups"].map((c) => env.DB.prepare("DELETE FROM docs WHERE path = ?").bind(`${c}/${uid}`)),
      ...subs.results.flatMap((s) => [env.DB.prepare("DELETE FROM docs WHERE path = ?").bind(`adlive/${s.id}`), env.DB.prepare("DELETE FROM docs WHERE path = ?").bind(`hunts/${s.id}`)]),
      env.DB.prepare("DELETE FROM push_subs WHERE uid = ?").bind(uid),
      env.DB.prepare("DELETE FROM reports WHERE uid = ?").bind(uid),
      env.DB.prepare("DELETE FROM sessions WHERE uid = ?").bind(uid),
      env.DB.prepare("DELETE FROM accounts WHERE uid = ?").bind(uid),
      env.DB.prepare("DELETE FROM players WHERE uid = ?").bind(uid),
      env.DB.prepare("DELETE FROM tickets WHERE uid = ?").bind(uid),
    ]);
    for (const c of ["board", "chat", "adlive", "hunts"]) notify(env, ctx, c);
    return json({ ok: true });
  }

  /* ---- reminders on this device */
  if (route === "push/subscribe" && req.method === "POST") {
    if (!(await allow(env, `push:${who.uid}`, 20, 3_600_000))) return fail("rate_limited", 429);
    const body = (await req.json().catch(() => ({}))) as { endpoint?: unknown };
    const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";
    if (!pushEndpointOk(endpoint)) return fail("invalid_argument", 400);
    await env.DB.batch([
      env.DB.prepare("INSERT INTO push_subs (endpoint, uid, created) VALUES (?, ?, ?) ON CONFLICT(endpoint) DO UPDATE SET uid = excluded.uid, created = excluded.created").bind(endpoint, who.uid, Date.now()),
      // at most 5 devices a player
      env.DB.prepare("DELETE FROM push_subs WHERE uid = ?1 AND endpoint NOT IN (SELECT endpoint FROM push_subs WHERE uid = ?1 ORDER BY created DESC LIMIT 5)").bind(who.uid),
      // the cron trigger signs its pushes with the game's address
      env.DB.prepare("INSERT INTO kv (key, value) VALUES ('site', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(url.origin),
    ]);
    return json({ ok: true });
  }
  if (route === "push/unsubscribe" && req.method === "POST") {
    const body = (await req.json().catch(() => ({}))) as { endpoint?: unknown };
    await env.DB.prepare("DELETE FROM push_subs WHERE endpoint = ? AND uid = ?").bind(typeof body.endpoint === "string" ? body.endpoint : "", who.uid).run();
    return json({ ok: true });
  }

  /* ---- email + password for this player (their progress stays with them) */
  if (route === "account/register" && req.method === "POST") {
    if (!(await allow(env, `register:${ipOf(req)}`, 10, 3_600_000))) return fail("rate_limited", 429);
    const body = (await req.json().catch(() => ({}))) as { email?: unknown; password?: unknown; fullName?: unknown };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!EMAIL.test(email)) return fail("bad_email", 400);
    if (!goodPassword(body.password)) return fail("weak_password", 400);
    const fullName = typeof body.fullName === "string" ? body.fullName.trim().slice(0, 80) : "";
    const taken = await env.DB.prepare("SELECT uid FROM accounts WHERE email = ?").bind(email).first<{ uid: string }>();
    if (taken) return fail("email_taken", 409);
    const mine = await env.DB.prepare("SELECT email FROM accounts WHERE uid = ?").bind(who.uid).first();
    if (mine) return fail("already_registered", 409);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const now = Date.now();
    await env.DB.prepare("INSERT INTO accounts (email, uid, pw_hash, salt, iters, full_name, created, changed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(email, who.uid, await hashPassword(body.password, salt), b64(salt), PBKDF2_ITERS, fullName, now, now)
      .run();
    return json({ ok: true, email });
  }

  if (route === "account/password" && req.method === "POST") {
    const body = (await req.json().catch(() => ({}))) as { old?: unknown; password?: unknown };
    if (!goodPassword(body.password) || typeof body.old !== "string") return fail("weak_password", 400);
    if (!(await allow(env, `pwchange:${who.uid}`, 10, 3_600_000))) return fail("rate_limited", 429);
    const acc = await env.DB.prepare("SELECT email, pw_hash, salt, iters FROM accounts WHERE uid = ?").bind(who.uid).first<{ email: string; pw_hash: string; salt: string; iters: number }>();
    if (!acc) return fail("not_found", 404);
    if (!sameText(await hashPassword(body.old, unb64(acc.salt), acc.iters), acc.pw_hash)) return fail("wrong_login", 401);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    await env.DB.batch([
      env.DB.prepare("UPDATE accounts SET pw_hash = ?, salt = ?, iters = ?, changed = ? WHERE uid = ?").bind(await hashPassword(body.password, salt), b64(salt), PBKDF2_ITERS, Date.now(), who.uid),
      // sign out every other device
      env.DB.prepare("DELETE FROM sessions WHERE uid = ?").bind(who.uid),
    ]);
    return json({ ok: true, token: await newSession(env, who.uid) });
  }

  if (route === "account/logout" && req.method === "POST") {
    const raw = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
    const token = raw.split(".")[1] ?? "";
    await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run();
    return json({ ok: true });
  }

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

/* ---------------------------------------------------------------- Paystack (posters paid online) */

/*
 * The advertiser sends a poster (adsubmit/<me>/posters/<id>, status "pending"),
 * then taps Pay: the Worker works out the price itself from the owner's
 * settings (never the price the page sent), starts a Paystack checkout and
 * sends them there. A payment counts once Paystack confirms it, either when
 * the advertiser comes back (/api/pay/verify asks Paystack) or by Paystack's
 * signed webhook, and only if the amount is exactly right. Paid posters wait
 * for the owner's review, unless the owner chose "publish straight away".
 */

const PAYSTACK = "https://api.paystack.co";
const AD_DEFAULTS: Record<string, number> = { billboard: 15_000, signboard: 8_000, banner: 6_000, poster: 5_000, nationwide: 3, hunt: 20_000 };
const PLACEMENT_SET = new Set(["billboard", "signboard", "banner", "poster"]);
const WEEK_MS = 7 * 86_400_000;

async function readDoc(env: Env, path: string): Promise<Record<string, any> | null> {
  const row = await env.DB.prepare("SELECT data FROM docs WHERE path = ?").bind(path).first<{ data: string }>();
  return row ? JSON.parse(row.data) : null;
}

async function writeDoc(env: Env, ctx: { waitUntil(p: Promise<unknown>): void }, path: string, data: Record<string, unknown>) {
  const seg = path.split("/");
  const parent = seg.slice(0, -1).join("/");
  await env.DB.prepare("INSERT INTO docs (path, parent, id, data, updated) VALUES (?, ?, ?, ?, ?) ON CONFLICT(path) DO UPDATE SET data = excluded.data, updated = excluded.updated")
    .bind(path, parent, seg[seg.length - 1], JSON.stringify(data), Date.now())
    .run();
  notify(env, ctx, parent);
}

/** The same sum as priceOf() + the hunt add-on in src/lib/ads.ts, from the owner's settings. */
function adPrice(settings: Record<string, any>, sub: Record<string, any>) {
  const n = (v: unknown, d: number) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : d);
  const placement = String(sub.placement);
  if (!PLACEMENT_SET.has(placement)) return 0;
  const weeks = Math.max(1, Math.min(52, Math.round(n(sub.weeks, 1))));
  const count = Math.max(1, Math.min(20, Math.round(n(sub.count, 1))));
  const discount = count >= 10 ? 0.2 : count >= 5 ? 0.1 : 0;
  const base = n(settings[placement], AD_DEFAULTS[placement]);
  const nationwide = sub.city === "all" ? Math.max(1, n(settings.nationwide, AD_DEFAULTS.nationwide)) : 1;
  const hunt = sub.hunt && typeof sub.hunt === "object" ? n(settings.hunt, AD_DEFAULTS.hunt) * weeks : 0;
  return Math.round(base * weeks * count * (1 - discount) * nationwide) + Math.round(hunt);
}

const paystack = (env: Env, path: string, init: RequestInit = {}) =>
  fetch(`${PAYSTACK}${path}`, { ...init, headers: { authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`, "content-type": "application/json", ...(init.headers ?? {}) } });

async function pay(route: string, req: Request, env: Env, ctx: { waitUntil(p: Promise<unknown>): void }, uid: string, origin: string): Promise<Response> {
  if (route === "pay/mine") {
    const rows = await env.DB.prepare("SELECT sub_id, amount, paid_at FROM payments WHERE uid = ? AND status = 'paid'").bind(uid).all();
    return json({ paid: rows.results });
  }
  if (!env.PAYSTACK_SECRET_KEY) return fail("not_granted", 501);
  if (req.method !== "POST") return fail("not_found", 404);
  const body = (await req.json().catch(() => ({}))) as { subId?: unknown; huntCase?: unknown; email?: unknown; ref?: unknown };

  if (route === "pay/start") {
    if (!(await allow(env, `pay:${uid}`, 20, 3_600_000))) return fail("rate_limited", 429);
    const subId = typeof body.subId === "string" && /^p[a-z0-9]{1,20}$/.test(body.subId) ? body.subId : "";
    if (!subId) return fail("invalid_argument", 400);
    const sub = await readDoc(env, `adsubmit/${uid}/posters/${subId}`);
    if (!sub) return fail("not_found", 404);
    if (sub.status !== "pending") return fail("not_pending", 409);
    if (await env.DB.prepare("SELECT 1 AS x FROM payments WHERE uid = ? AND sub_id = ? AND status = 'paid'").bind(uid, subId).first()) return fail("already_paid", 409);
    const settings = (await readDoc(env, "adsettings/main")) ?? {};
    if (settings.open === false) return fail("closed", 409);
    const amount = adPrice(settings, sub);
    if (amount < 100) return fail("invalid_argument", 400);
    // the email Paystack sends the receipt to: their account, their sign-up, or one they type
    const acc = await env.DB.prepare("SELECT email FROM accounts WHERE uid = ?").bind(uid).first<{ email: string }>();
    const signup = acc ? null : await readDoc(env, `signups/${uid}`);
    const typed = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const email = [acc?.email, typeof signup?.email === "string" ? signup.email.trim().toLowerCase() : "", typed].find((e) => e && EMAIL.test(e));
    if (!email) return fail("need_email", 400);
    const huntCase = typeof body.huntCase === "string" && /^[a-z0-9-]{1,40}$/.test(body.huntCase) ? body.huntCase : null;
    const ref = `ND-${subId}-${randomId(4)}`;
    const r = await paystack(env, "/transaction/initialize", {
      method: "POST",
      body: JSON.stringify({
        email,
        amount: amount * 100, // kobo
        currency: "NGN",
        reference: ref,
        callback_url: `${origin}/?paid=1`,
        metadata: { uid, sub_id: subId, business: String(sub.business ?? "").slice(0, 60), cancel_action: `${origin}/?paid=0` },
      }),
    });
    const out = (await r.json().catch(() => ({}))) as { status?: boolean; data?: { authorization_url?: string } };
    if (!r.ok || !out.status || !out.data?.authorization_url?.startsWith("https://")) {
      console.warn("[pay] initialize", r.status, JSON.stringify(out).slice(0, 300));
      return fail("upstream_error", 502);
    }
    await env.DB.prepare("INSERT INTO payments (ref, uid, sub_id, amount, email, hunt_case, status, created) VALUES (?, ?, ?, ?, ?, ?, 'started', ?)")
      .bind(ref, uid, subId, amount, email, huntCase, Date.now())
      .run();
    return json({ url: out.data.authorization_url, ref, amount });
  }

  if (route === "pay/verify") {
    if (!(await allow(env, `payv:${uid}`, 60, 3_600_000))) return fail("rate_limited", 429);
    const ref = typeof body.ref === "string" && /^ND-[A-Za-z0-9-]{1,40}$/.test(body.ref) ? body.ref : "";
    const row = ref ? await env.DB.prepare("SELECT status FROM payments WHERE ref = ? AND uid = ?").bind(ref, uid).first<{ status: string }>() : null;
    if (!row) return fail("not_found", 404);
    if (row.status === "paid") return json({ status: "paid" });
    const r = await paystack(env, `/transaction/verify/${encodeURIComponent(ref)}`);
    const out = (await r.json().catch(() => ({}))) as { data?: { status?: string; amount?: number; currency?: string; channel?: string } };
    if (!r.ok || !out.data) return fail("upstream_error", 502);
    if (out.data.status !== "success") return json({ status: out.data.status ?? "pending" });
    return json({ status: await settlePayment(env, ctx, ref, out.data.amount, out.data.currency, out.data.channel) });
  }
  return fail("not_found", 404);
}

async function payWebhook(req: Request, env: Env, ctx: { waitUntil(p: Promise<unknown>): void }) {
  if (!env.PAYSTACK_SECRET_KEY) return fail("not_granted", 501);
  const raw = await req.text();
  if (raw.length > 200_000) return fail("too_large", 413);
  // x-paystack-signature: HMAC-SHA512 of the body with the secret key
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.PAYSTACK_SECRET_KEY), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  const mac = [...new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw)))].map((b) => b.toString(16).padStart(2, "0")).join("");
  if (!sameText(mac, (req.headers.get("x-paystack-signature") ?? "").toLowerCase())) return fail("not_permitted", 401);
  let event: { event?: string; data?: { reference?: string; amount?: number; currency?: string; channel?: string; status?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return fail("invalid_argument", 400);
  }
  if (event.event === "charge.success" && event.data?.status === "success" && typeof event.data.reference === "string") {
    await settlePayment(env, ctx, event.data.reference, event.data.amount, event.data.currency, event.data.channel);
  }
  return json({ ok: true });
}

/** Paystack says this reference was paid: record it once, if the amount is exactly what we asked. */
async function settlePayment(env: Env, ctx: { waitUntil(p: Promise<unknown>): void }, ref: string, kobo: unknown, currency: unknown, channel: unknown): Promise<string> {
  const row = await env.DB.prepare("SELECT ref, uid, sub_id, amount, hunt_case, status FROM payments WHERE ref = ?")
    .bind(ref)
    .first<{ ref: string; uid: string; sub_id: string; amount: number; hunt_case: string | null; status: string }>();
  if (!row) return "unknown";
  if (row.status === "paid") return "paid";
  if (currency !== "NGN" || kobo !== row.amount * 100) {
    console.warn("[pay] amount mismatch", ref, kobo, currency);
    await env.DB.prepare("UPDATE payments SET status = 'mismatch' WHERE ref = ? AND status <> 'paid'").bind(ref).run();
    return "mismatch";
  }
  // the webhook and the advertiser's return can arrive together: only one of them settles it
  const won = await env.DB.prepare("UPDATE payments SET status = 'paid', paid_at = ?, channel = ? WHERE ref = ? AND status <> 'paid' RETURNING ref")
    .bind(Date.now(), typeof channel === "string" ? channel.slice(0, 20) : null, ref)
    .first();
  if (!won) return "paid";
  const settings = (await readDoc(env, "adsettings/main")) ?? {};
  if (settings.autoPublish === true) await publishPaid(env, ctx, row.uid, row.sub_id, row.hunt_case, row.amount, settings);
  return "paid";
}

const waDigits = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return d.startsWith("234") ? d : d.startsWith("0") ? `234${d.slice(1)}` : d;
};

/** Put a paid poster up (the owner chose not to review first): what the Ad manager's Approve does. */
async function publishPaid(env: Env, ctx: { waitUntil(p: Promise<unknown>): void }, uid: string, subId: string, huntCase: string | null, paid: number, settings: Record<string, any>) {
  const path = `adsubmit/${uid}/posters/${subId}`;
  const sub = await readDoc(env, path);
  if (!sub || sub.status !== "pending") return;
  // changed after paying (more weeks, more boards)? Leave it for the owner to look at
  if (adPrice(settings, sub) > paid) return;
  const now = Date.now();
  const weeks = Math.max(1, Math.min(52, Math.round(Number(sub.weeks) || 1)));
  const end = now + weeks * WEEK_MS;
  const text = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : undefined);
  const phone = sub.whatsapp === true && typeof sub.phone === "string" ? waDigits(sub.phone) : undefined;
  const live = {
    business: text(sub.business, 60),
    placement: sub.placement,
    city: text(sub.city, 20),
    image: sub.image,
    start: now,
    end,
    count: Math.max(1, Math.min(20, Math.round(Number(sub.count) || 1))),
    website: text(sub.website, 220),
    blurb: text(sub.blurb, 140),
    phone,
  };
  await writeDoc(env, ctx, `adlive/${subId}`, await storeImages(env, ["adlive"], live));
  const hunt = sub.hunt && typeof sub.hunt === "object" ? sub.hunt : null;
  if (hunt && huntCase) {
    const doc = { brand: live.business, offer: text(hunt.offer, 90), code: text(hunt.code, 24), tokens: hunt.tokens, image: sub.image, placement: sub.placement, city: live.city, caseId: huntCase, website: live.website, phone, start: now, end };
    await writeDoc(env, ctx, `hunts/${subId}`, await storeImages(env, ["hunts"], doc));
  }
  await writeDoc(env, ctx, path, { ...sub, status: "live", liveUntil: end });
}

/* ---------------------------------------------------------------- reminders (Web Push) */

/*
 * Pushes carry no message (so nothing needs encrypting): the phone wakes the
 * game's service worker, which asks /api/push/latest what to show. Each push is
 * signed with the game's own VAPID key, made once and kept in D1. The cron
 * trigger (every minute) sends one batch of the oldest waiting job per run,
 * within the free plan's 50 outside requests a run.
 */

const PUSH_BATCH = 40;

// only the browsers' own push services, so nobody can point the Worker at other addresses
const PUSH_HOSTS = [/^fcm\.googleapis\.com$/, /^android\.googleapis\.com$/, /^updates\.push\.services\.mozilla\.com$/, /^push\.services\.mozilla\.com$/, /(^|\.)push\.apple\.com$/, /\.notify\.windows\.com$/];

function pushEndpointOk(endpoint: string) {
  if (endpoint.length > 600) return false;
  try {
    const u = new URL(endpoint);
    return u.protocol === "https:" && !u.port && PUSH_HOSTS.some((h) => h.test(u.hostname));
  } catch {
    return false;
  }
}

const b64url = (bytes: Uint8Array) => b64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

type VapidKeys = { publicKey: string; jwk: JsonWebKey };

async function vapidKeys(env: Env): Promise<VapidKeys> {
  const row = await env.DB.prepare("SELECT value FROM kv WHERE key = 'vapid'").bind().first<{ value: string }>();
  if (row) return JSON.parse(row.value);
  const pair = (await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"])) as CryptoKeyPair;
  const publicKey = b64url(new Uint8Array((await crypto.subtle.exportKey("raw", pair.publicKey)) as ArrayBuffer));
  const jwk = (await crypto.subtle.exportKey("jwk", pair.privateKey)) as JsonWebKey;
  // two first calls at once: the first one written wins, and both read it back
  await env.DB.prepare("INSERT OR IGNORE INTO kv (key, value) VALUES ('vapid', ?)").bind(JSON.stringify({ publicKey, jwk })).run();
  const saved = await env.DB.prepare("SELECT value FROM kv WHERE key = 'vapid'").bind().first<{ value: string }>();
  return JSON.parse(saved!.value);
}

/** The Authorization header for pushes to one push service: a signed token good for 12 hours. */
async function vapidHeader(keys: VapidKeys, endpoint: string, site: string) {
  const enc = (o: unknown) => b64url(new TextEncoder().encode(JSON.stringify(o)));
  const unsigned = `${enc({ typ: "JWT", alg: "ES256" })}.${enc({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: site })}`;
  const key = await crypto.subtle.importKey("jwk", keys.jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(unsigned)));
  return `vapid t=${unsigned}.${b64url(sig)}, k=${keys.publicKey}`;
}

/** Nigerian time (WAT, UTC+1) for the daily reminder. */
function watNow(at: number) {
  const d = new Date(at + 3_600_000);
  return { day: d.toISOString().slice(0, 10), hour: d.getUTCHours(), weekday: d.getUTCDay() };
}

const DAILY_REMINDERS = [
  { title: "Today's daily challenge is waiting 🔍", body: "One case, one shot at a bonus. Can you crack it before midnight?" },
  { title: "Don't break your streak 🔥", body: "Claim today's streak reward and keep the fire burning, Detective." },
  { title: "Your lucky spin is ready 🎰", body: "Spin for cash, merit or a free hint before midnight." },
  { title: "Fresh wahala in your state 🚨", body: "New suspects, new lies. The precinct needs you back on the case." },
  { title: "The leaderboard is moving 🏆", body: "Other detectives are climbing this week's tournament. Don't fall behind." },
];

/** Once a day, between 6pm and 9pm WAT, queue the day's reminder (unless the owner turned them off). */
async function queueDailyReminder(env: Env, at: number) {
  const t = watNow(at);
  if (t.hour < 18 || t.hour > 20) return;
  const auto = await env.DB.prepare("SELECT value FROM kv WHERE key = 'push:auto'").bind().first<{ value: string }>();
  if (auto?.value === "off") return;
  // only the run that claims today queues it
  const claimed = await env.DB.prepare(
    "INSERT INTO kv (key, value) VALUES ('push:last-auto', ?1) ON CONFLICT(key) DO UPDATE SET value = excluded.value WHERE value <> excluded.value RETURNING value",
  )
    .bind(t.day)
    .first();
  if (!claimed) return;
  const msg =
    t.weekday === 0
      ? { title: "The weekly tournament ends tonight ⏳", body: "Last chance to climb this week's leaderboard. Every arrest counts." }
      : t.weekday === 1
        ? { title: "A new tournament week has started 🏆", body: "Everyone starts from zero. Get your first arrest in early." }
        : DAILY_REMINDERS[Math.floor(at / 86_400_000) % DAILY_REMINDERS.length];
  await env.DB.prepare("INSERT INTO push_jobs (kind, title, body, created) VALUES ('daily', ?, ?, ?)").bind(msg.title, msg.body, at).run();
}

/** Send the next batch of the oldest waiting job. */
async function sendPushBatch(env: Env, at: number) {
  const job = await env.DB.prepare("SELECT id, created, started, cursor FROM push_jobs WHERE finished IS NULL ORDER BY id LIMIT 1")
    .bind()
    .first<{ id: number; created: number; started: number | null; cursor: string }>();
  if (!job) return;
  // a reminder that couldn't go out within 12 hours is old news
  if (job.created < at - 12 * 3_600_000) {
    await env.DB.prepare("UPDATE push_jobs SET finished = ? WHERE id = ?").bind(at, job.id).run();
    return;
  }
  if (!job.started) await env.DB.prepare("UPDATE push_jobs SET started = ? WHERE id = ?").bind(at, job.id).run();
  const subs = await env.DB.prepare("SELECT endpoint FROM push_subs WHERE endpoint > ? ORDER BY endpoint LIMIT ?").bind(job.cursor, PUSH_BATCH).all<{ endpoint: string }>();
  const keys = await vapidKeys(env);
  const site = (await env.DB.prepare("SELECT value FROM kv WHERE key = 'site'").bind().first<{ value: string }>())?.value ?? "https://workers.dev";
  const signed = new Map<string, Promise<string>>();
  let sent = 0;
  const gone: string[] = [];
  await Promise.all(
    subs.results.map(async ({ endpoint }) => {
      try {
        const aud = new URL(endpoint).origin;
        if (!signed.has(aud)) signed.set(aud, vapidHeader(keys, endpoint, site));
        const r = await fetch(endpoint, { method: "POST", headers: { authorization: await signed.get(aud)!, ttl: "43200", urgency: "normal", "content-length": "0" } });
        if (r.ok) sent++;
        else if (r.status === 404 || r.status === 410) gone.push(endpoint);
        else console.warn("[push]", r.status, aud, await r.text().catch(() => ""));
      } catch (e) {
        console.warn("[push] failed", e);
      }
    }),
  );
  const last = subs.results[subs.results.length - 1]?.endpoint ?? job.cursor;
  await env.DB.batch([
    env.DB.prepare("UPDATE push_jobs SET cursor = ?, sent = sent + ?, gone = gone + ?, finished = ? WHERE id = ?").bind(last, sent, gone.length, subs.results.length < PUSH_BATCH ? Date.now() : null, job.id),
    // phones that uninstalled the game or turned its notifications off
    ...gone.map((e) => env.DB.prepare("DELETE FROM push_subs WHERE endpoint = ?").bind(e)),
  ]);
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

  /** The cron trigger (wrangler.jsonc): queue the daily reminder, then send a batch of pushes. */
  async scheduled(event: { scheduledTime: number }, env: Env, ctx: { waitUntil(p: Promise<unknown>): void }) {
    ctx.waitUntil(
      (async () => {
        await schema(env);
        // once an hour: forget expired rate-limit counters (they hold IP addresses), tickets, and reports over a year old
        if (new Date(event.scheduledTime).getUTCMinutes() === 0) {
          const now = Date.now();
          await env.DB.batch([
            env.DB.prepare("DELETE FROM limits WHERE reset < ?").bind(now),
            env.DB.prepare("DELETE FROM tickets WHERE exp < ?").bind(now),
            env.DB.prepare("DELETE FROM reports WHERE created < ?").bind(now - 365 * 86_400_000),
          ]);
        }
        await queueDailyReminder(env, event.scheduledTime);
        await sendPushBatch(env, event.scheduledTime);
      })().catch((e) => console.error("[cron]", e)),
    );
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
