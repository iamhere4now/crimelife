/**
 * The game's online features on the owner's own Cloudflare backend (worker/index.ts).
 *
 * The game was built against the claude.ai artifact runtime (`window.claude.use("db" |
 * "user" | "room" | "sample")`). On Cloudflare there is no claude.ai, so this file
 * provides the same small interface over the Worker's API: documents in D1, poster
 * images in R2, live rooms in Durable Objects and the Senior Inspector through the
 * Claude API. Every module that talks to `window.claude` works unchanged.
 *
 * Players are anonymous: the first visit creates an id and a secret token kept in
 * this browser. The owner unlocks the Ad manager with the ADMIN_KEY they set on
 * the Worker (kept in this browser only).
 */

type Json = Record<string, unknown>;
type Unsub = () => void;
type Snap = { id: string; exists: boolean; data(): Json | undefined };

const AUTH_KEY = "nd:cf-auth";
const ADMIN_KEY = "nd:cf-admin";

const store = {
  get(k: string) {
    try {
      return window.localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string | null) {
    try {
      if (v === null) window.localStorage.removeItem(k);
      else window.localStorage.setItem(k, v);
    } catch {
      // private mode: the session still works, it just isn't remembered
    }
  },
};

/* ---------------------------------------------------------------- sign-in */

let authPromise: Promise<{ uid: string; token: string }> | null = null;

function auth() {
  authPromise ??= (async () => {
    const saved = store.get(AUTH_KEY);
    if (saved) {
      try {
        const v = JSON.parse(saved) as { uid?: string; token?: string };
        if (v.uid && v.token) return { uid: v.uid, token: v.token };
      } catch {
        // make a new one
      }
    }
    const r = await fetch("/api/auth", { method: "POST" });
    if (!r.ok) throw new Error("sign-in failed");
    const v = (await r.json()) as { uid: string; token: string };
    store.set(AUTH_KEY, JSON.stringify(v));
    return v;
  })().catch((e) => {
    authPromise = null;
    throw e;
  });
  return authPromise;
}

async function call(path: string, init: RequestInit = {}) {
  const a = await auth();
  const headers = new Headers(init.headers);
  headers.set("authorization", `Bearer ${a.uid}.${a.token}`);
  const admin = store.get(ADMIN_KEY);
  if (admin) headers.set("x-admin-key", admin);
  const r = await fetch(path, { ...init, headers });
  if (r.status === 401) {
    // the saved player was lost on the server: start a fresh one next time
    store.set(AUTH_KEY, null);
    authPromise = null;
  }
  if (!r.ok) {
    const body = (await r.json().catch(() => ({}))) as { code?: string };
    throw Object.assign(new Error(body.code ?? `http_${r.status}`), { code: body.code === "not_permitted" ? "invalid_argument" : (body.code ?? "upstream_error") });
  }
  return r.json();
}

/* ---------------------------------------------------------------- email + password accounts */

export type AccountError = "email_taken" | "already_registered" | "bad_email" | "weak_password" | "wrong_login" | "rate_limited" | "banned" | "offline";

const errCode = (e: unknown): AccountError => {
  const c = (e as { code?: string })?.code ?? "";
  return (["email_taken", "already_registered", "bad_email", "weak_password", "wrong_login", "rate_limited", "banned"].includes(c) ? c : "offline") as AccountError;
};

/** Give this player (and their progress) an email and password, so they can sign in anywhere. */
export async function accountRegister(email: string, password: string, fullName: string): Promise<AccountError | null> {
  try {
    await call("/api/account/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password, fullName }) });
    return null;
  } catch (e) {
    return errCode(e);
  }
}

/** Sign in with email and password on this device: the game reloads with that player's progress. */
export async function accountLogin(email: string, password: string): Promise<AccountError | null> {
  try {
    const r = await fetch("/api/account/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
    const body = (await r.json().catch(() => ({}))) as { uid?: string; token?: string; code?: string };
    if (!r.ok || !body.uid || !body.token) return errCode({ code: body.code ?? (r.status === 401 ? "wrong_login" : "offline") });
    store.set(AUTH_KEY, JSON.stringify({ uid: body.uid, token: body.token }));
    authPromise = null;
    return null;
  } catch {
    return "offline";
  }
}

/** Sign out on this device; the next visit starts as a new player until they sign in again. */
export async function accountLogout() {
  try {
    await call("/api/account/logout", { method: "POST" });
  } catch {
    // signed out locally either way
  }
  store.set(AUTH_KEY, null);
  authPromise = null;
}

export async function accountChangePassword(old: string, password: string): Promise<AccountError | null> {
  try {
    const r = (await call("/api/account/password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ old, password }) })) as { token?: string };
    const a = await auth();
    if (r.token) {
      store.set(AUTH_KEY, JSON.stringify({ uid: a.uid, token: r.token }));
      authPromise = null;
    }
    return null;
  } catch (e) {
    return errCode(e);
  }
}

/** The signed-in email for this player, or null when they haven't set one. */
export async function accountEmail(): Promise<string | null> {
  try {
    return ((await call("/api/me")) as { email?: string | null }).email ?? null;
  } catch {
    return null;
  }
}

export const ACCOUNT_MESSAGES: Record<AccountError, string> = {
  email_taken: "That email already has an account. Sign in instead.",
  already_registered: "This player already has an email and password.",
  bad_email: "That email doesn't look right.",
  weak_password: "Use a password of at least 8 characters.",
  wrong_login: "Wrong email or password.",
  rate_limited: "Too many tries. Please wait a while and try again.",
  banned: "This account has been suspended.",
  offline: "Couldn't reach the server. Check your connection and try again.",
};

/** Owner-only calls (the owner console): overview, bans. */
export function adminCall(path: string, body?: unknown) {
  return call(`/api/admin/${path}`, body === undefined ? {} : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}

/** The owner types their admin key once on this device to open the Ad manager. */
export function setAdminKey(key: string | null) {
  store.set(ADMIN_KEY, key && key.trim() ? key.trim() : null);
}

export async function checkOwner(): Promise<{ owner: boolean; ownerSet: boolean }> {
  try {
    const me = (await call("/api/me")) as { owner: boolean; ownerSet: boolean };
    return { owner: !!me.owner, ownerSet: !!me.ownerSet };
  } catch {
    return { owner: false, ownerSet: false };
  }
}

/* ---------------------------------------------------------------- live connection (lobby + rooms) */

type Peer = { peer: string; by: string | null; isMe: boolean; sameTab: boolean; kind: "viewer"; guest: boolean; presence: Json; updatedAt: number };
type PeersChange = { peers: readonly Peer[]; joined: readonly Peer[]; left: readonly Peer[]; updated: readonly Peer[] };

class LiveRoom {
  readonly name: string;
  private ws: WebSocket | null = null;
  private myPeer = "";
  private mine: Json = {};
  private list: readonly Peer[] = Object.freeze([]);
  private peerFns = new Set<(c: PeersChange) => void>();
  private connFns = new Set<(c: boolean) => void>();
  private changeFns = new Set<(col: string) => void>();
  private open = false;
  private closed = false;
  private retry = 0;
  private sendTimer = 0;

  constructor(name: string) {
    this.name = name;
    void this.connect();
  }

  private async connect() {
    if (this.closed) return;
    let a: { uid: string; token: string };
    let ticket: string;
    try {
      a = await auth();
      // a one-minute, one-use ticket, so the player's secret never goes in a web address
      ticket = ((await call("/api/ticket", { method: "POST" })) as { ticket: string }).ticket;
    } catch {
      return this.later();
    }
    const proto = location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${proto}//${location.host}/api/room/${this.name}?ticket=${encodeURIComponent(ticket)}`);
    this.ws = ws;
    ws.onmessage = (e) => {
      let msg: { t?: string; peer?: string; peers?: { peer: string; by: string; presence: Json; updatedAt: number }[]; col?: string };
      try {
        msg = JSON.parse(String(e.data));
      } catch {
        return;
      }
      if (msg.t === "hello" && msg.peer) {
        this.myPeer = msg.peer;
        this.retry = 0;
        this.setOpen(true);
        if (Object.keys(this.mine).length) this.flush();
      } else if (msg.t === "peers" && Array.isArray(msg.peers)) {
        const before = new Map(this.list.map((p) => [p.peer, p]));
        const next = msg.peers.map((p) => {
          const old = before.get(p.peer);
          if (old && old.updatedAt === p.updatedAt) return old;
          return Object.freeze({ peer: p.peer, by: p.by || null, isMe: p.by === a.uid, sameTab: p.peer === this.myPeer, kind: "viewer" as const, guest: false, presence: Object.freeze({ ...(p.presence ?? {}) }), updatedAt: p.updatedAt });
        });
        const after = new Set(next.map((p) => p.peer));
        const change: PeersChange = {
          peers: Object.freeze(next),
          joined: next.filter((p) => !before.has(p.peer)),
          left: [...before.values()].filter((p) => !after.has(p.peer)),
          updated: next.filter((p) => before.has(p.peer) && before.get(p.peer) !== p),
        };
        this.list = change.peers;
        this.peerFns.forEach((fn) => fn(change));
      } else if (msg.t === "changed" && typeof msg.col === "string") {
        this.changeFns.forEach((fn) => fn(msg.col!));
      }
    };
    ws.onclose = () => {
      this.setOpen(false);
      this.later();
    };
    ws.onerror = () => ws.close();
  }

  private later() {
    if (this.closed) return;
    this.retry = Math.min(this.retry + 1, 6);
    window.setTimeout(() => void this.connect(), 500 * 2 ** this.retry);
  }

  private setOpen(v: boolean) {
    if (this.open === v) return;
    this.open = v;
    this.connFns.forEach((fn) => fn(v));
  }

  private flush() {
    window.clearTimeout(this.sendTimer);
    // at most ~10 updates a second
    this.sendTimer = window.setTimeout(() => {
      if (this.ws?.readyState === 1) this.ws.send(JSON.stringify({ t: "presence", patch: this.mine }));
    }, 100);
  }

  /* the claude.ai room API */
  presence(patch: Record<string, unknown | null>) {
    for (const [k, v] of Object.entries(patch)) {
      if (v === null) delete this.mine[k];
      else this.mine[k] = v;
    }
    if (JSON.stringify(this.mine).length > 4096) return Promise.reject(Object.assign(new Error("too big"), { code: "invalid_argument" }));
    this.flush();
    return Promise.resolve();
  }
  peers() {
    return this.list;
  }
  onPeers(fn: (c: PeersChange) => void): Unsub {
    this.peerFns.add(fn);
    queueMicrotask(() => fn({ peers: this.list, joined: this.list, left: [], updated: [] }));
    return () => this.peerFns.delete(fn);
  }
  connected() {
    return this.open;
  }
  onConnection(fn: (c: boolean) => void): Unsub {
    this.connFns.add(fn);
    queueMicrotask(() => fn(this.open));
    return () => this.connFns.delete(fn);
  }
  onChanged(fn: (col: string) => void): Unsub {
    this.changeFns.add(fn);
    return () => this.changeFns.delete(fn);
  }
  emit() {
    return Promise.resolve();
  }
  on(): Unsub {
    return () => {};
  }
  leave() {
    this.closed = true;
    rooms.delete(this.name);
    this.ws?.close();
    return Promise.resolve();
  }
}

const rooms = new Map<string, LiveRoom>();
let lobby: LiveRoom | null = null;
const getLobby = () => (lobby ??= new LiveRoom("lobby"));

/* ---------------------------------------------------------------- documents */

const snap = (id: string, data: Json | null): Snap => ({ id, exists: !!data, data: () => (data ? { ...data } : undefined) });

function docRef(path: string) {
  const id = path.split("/").pop() ?? "";
  return {
    async get() {
      const r = (await call(`/api/doc?path=${encodeURIComponent(path)}`)) as { exists: boolean; data: Json | null };
      return snap(id, r.exists ? r.data : null);
    },
    async set(data: Json) {
      await call(`/api/doc?path=${encodeURIComponent(path)}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    },
    async update(data: Json) {
      const cur = await this.get();
      await this.set({ ...(cur.data() ?? {}), ...data });
    },
    async delete() {
      await call(`/api/doc?path=${encodeURIComponent(path)}`, { method: "DELETE" });
    },
    collection(sub: string) {
      return colRef(`${path}/${sub}`);
    },
  };
}

function colRef(path: string) {
  const list = async () => {
    const r = (await call(`/api/col?path=${encodeURIComponent(path)}`)) as { docs: { id: string; data: Json }[] };
    return { docs: r.docs.map((d) => snap(d.id, d.data)) };
  };
  return {
    doc: (id: string) => docRef(`${path}/${id}`),
    get: list,
    onSnapshot(next: (s: { docs: Snap[] }) => void, err?: (e: { code: string }) => void): Unsub {
      let dead = false;
      let busy = false;
      let again = false;
      const load = async () => {
        if (dead) return;
        if (busy) {
          again = true;
          return;
        }
        busy = true;
        try {
          const s = await list();
          if (!dead) next(s);
        } catch (e) {
          if (!dead) err?.({ code: (e as { code?: string }).code ?? "upstream_error" });
        } finally {
          busy = false;
          if (again) {
            again = false;
            void load();
          }
        }
      };
      void load();
      // refresh when the lobby says this collection changed, and now and then anyway
      const off = getLobby().onChanged((col) => {
        if (col === path || col.startsWith(path + "/")) void load();
      });
      const timer = window.setInterval(load, 60_000);
      return () => {
        dead = true;
        off();
        window.clearInterval(timer);
      };
    },
  };
}

/* ---------------------------------------------------------------- install */

let installed = false;

/** True when the game runs on the owner's Cloudflare backend (not claude.ai). */
export function isCloudflareRuntime() {
  return installed;
}

/** Give the game a `window.claude` backed by the Cloudflare Worker. Call before rendering. */
export function installCloudflareRuntime() {
  if (typeof window === "undefined" || (window as unknown as { claude?: unknown }).claude) return;
  installed = true;
  const namespaces: Record<string, () => unknown> = {
    db: () => ({ doc: docRef, collection: colRef }),
    user: () => ({
      id: async () => (await auth().catch(() => null))?.uid ?? null,
      isOwner: async () => (await checkOwner()).owner,
      canEdit: async () => (await checkOwner()).owner,
      can: async () => true,
      me: async () => ({ id: (await auth().catch(() => null))?.uid ?? null, name: "" }),
    }),
    room: () => {
      const l = getLobby();
      return {
        presence: (p: Json) => l.presence(p),
        peers: () => l.peers(),
        onPeers: (fn: (c: PeersChange) => void) => l.onPeers(fn),
        connected: () => l.connected(),
        onConnection: (fn: (c: boolean) => void) => l.onConnection(fn),
        emit: () => Promise.resolve(),
        on: () => () => {},
        join: async (name: string) => {
          if (!/^[a-z0-9][a-z0-9_.-]{0,47}$/.test(name)) throw Object.assign(new Error("bad name"), { code: "invalid_argument" });
          let r = rooms.get(name);
          if (!r) {
            r = new LiveRoom(name);
            rooms.set(name, r);
          }
          return r;
        },
      };
    },
    sample: () => {
      const fn = async (input: string | { role: string; content: string }[], opts: { onText?: (u: { text: string; delta: string }) => void; signal?: AbortSignal } = {}) => {
        const prompt = typeof input === "string" ? input : input.map((t) => t.content).join("\n\n");
        const r = (await call("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt }), signal: opts.signal }).catch((e) => {
          if (opts.signal?.aborted) throw Object.assign(new Error("cancelled"), { code: "cancelled" });
          throw e;
        })) as { text: string };
        opts.onText?.({ text: r.text, delta: r.text });
        return { text: r.text, truncated: false };
      };
      return fn;
    },
  };
  (window as unknown as { claude: { use(name: string): Promise<unknown> } }).claude = {
    use: async (name: string) => namespaces[name]?.() ?? null,
  };
}
