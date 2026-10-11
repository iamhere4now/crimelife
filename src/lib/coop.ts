/**
 * Co-op: detectives from other branches working the same case at the same
 * time. Everyone with a case open joins a live room named after the case and
 * shares a small "presence": who they are, which branch, what they're
 * studying and which clues they've bagged. Nothing is stored and nothing is
 * trusted: it only moves other detectives about the scene and shows who found
 * what. On claude.ai this is the artifact's `room` capability; in the dev
 * build the tabs on this computer talk over a BroadcastChannel instead.
 */

/** The published game, for invites. */
export const GAME_URL = "https://claude.ai/artifact/SqZf6mfG9T1ajNERQnCYhh";

export interface CoopMe {
  name: string;
  /** Profile look index (coat and hat). */
  look: number;
  /** Branch (city) the player works from. */
  branch: string;
  /** Their designed look, as a face code (lib/looks). */
  face?: string;
}

export interface Partner {
  /** Stable for that open game (their room peer). */
  key: string;
  name: string;
  branch: string;
  look: number;
  /** The clue or scrap they're studying, if any. */
  at: string | null;
  /** Their designed look (face code), if any; check it with decodeFace. */
  face?: string;
  /** Clue ids they've found on this case. */
  found: string[];
  /** Bonus scraps they've picked up. */
  bonus: number;
  /** Last quick phrase they sent: its index and a counter that changes with each send. */
  said: { index: number; seq: number } | null;
  guest: boolean;
}

export interface CoopStatus {
  /** Live link to other branches is up. */
  online: boolean;
  partners: Partner[];
}

export interface CoopSession {
  update: (patch: { at?: string | null; found?: string[]; bonus?: number }) => void;
  /** Send a quick phrase (by index into PHRASES). */
  say: (index: number) => void;
  leave: () => void;
}

type Presence = Record<string, unknown>;
type Peer = { peer: string; isMe: boolean; guest: boolean; presence: Presence };
type NamedRoom = {
  presence(patch: Presence): Promise<void>;
  peers(): readonly Peer[];
  onPeers(fn: (c: { peers: readonly Peer[] }) => void, onError?: (e: { code: string }) => void): () => void;
  connected(): boolean;
  onConnection(fn: (connected: boolean) => void): () => void;
  leave(): Promise<void>;
};
type Room = { join(name: string): Promise<NamedRoom> };
type Runtime = { use(name: string): Promise<unknown> };

const isDev = () => typeof location !== "undefined" && /^(localhost|127\.0\.0\.1|\[::1\])$|\.localhost$/.test(location.hostname);

// --- reading what other pages sent (untrusted) ---

const clean = (v: unknown, max: number) =>
  typeof v === "string"
    ? v
        .replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩]/g, "")
        .trim()
        .slice(0, max)
    : "";
const idOk = (v: unknown): v is string => typeof v === "string" && /^[a-z0-9][a-z0-9-]{0,39}$/i.test(v);

function partnerOf(key: string, p: Presence, guest: boolean): Partner | null {
  if (p.v !== 1) return null;
  const name = clean(p.n, 22);
  if (!name) return null;
  const look = typeof p.l === "number" && Number.isFinite(p.l) ? Math.max(0, Math.min(11, Math.floor(p.l))) : 0;
  const found = Array.isArray(p.f) ? p.f.filter(idOk).slice(0, 24) : [];
  const bonus = typeof p.x === "number" && Number.isFinite(p.x) ? Math.max(0, Math.min(3, Math.floor(p.x))) : 0;
  const q = Array.isArray(p.q) && p.q.length === 2 && p.q.every((v) => typeof v === "number" && Number.isFinite(v)) ? { index: Math.floor(p.q[0] as number), seq: Math.floor(p.q[1] as number) } : null;
  const face = typeof p.c === "string" && /^f1-[0-9a-z]{8}$/.test(p.c) ? p.c : undefined;
  return { key, name, branch: clean(p.b, 20) || "HQ", look, face, at: idOk(p.a) ? p.a : null, found, bonus, said: q, guest };
}

function mine(me: CoopMe): Presence {
  return { v: 1, n: clean(me.name, 22) || "Detective", b: clean(me.branch, 20), l: me.look, c: me.face ?? null, a: null, f: [], x: 0 };
}

async function waitForRuntime(ms: number): Promise<Runtime | null> {
  const start = Date.now();
  for (;;) {
    const c = (window as unknown as { claude?: Runtime }).claude;
    if (c?.use) return c;
    if (Date.now() - start > ms) return null;
    await new Promise((r) => window.setTimeout(r, 150));
  }
}

/** The case's room on claude.ai. */
async function joinRoom(caseId: string, me: CoopMe, onStatus: (s: CoopStatus) => void): Promise<CoopSession | null> {
  const rt = await waitForRuntime(isDev() ? 300 : 6000);
  if (!rt) return null;
  const room = (await rt.use("room").catch(() => null)) as Room | null;
  if (!room) return null;
  const named = await room.join(`case.${caseId}`.toLowerCase().slice(0, 48)).catch(() => null);
  if (!named) return null;
  let left = false;
  let seq = 0;
  const emit = () => {
    if (left) return;
    const partners: Partner[] = [];
    for (const p of named.peers()) {
      if (p.isMe) continue;
      const one = partnerOf(p.peer, p.presence, p.guest);
      if (one) partners.push(one);
    }
    onStatus({ online: named.connected(), partners });
  };
  const offPeers = named.onPeers(emit, () => onStatus({ online: false, partners: [] }));
  const offConn = named.onConnection(emit);
  named.presence(mine(me)).catch(() => {});
  return {
    update: (patch) => {
      if (left) return;
      const out: Presence = {};
      if ("at" in patch) out.a = patch.at ?? null;
      if (patch.found) out.f = patch.found.slice(0, 24);
      if (patch.bonus !== undefined) out.x = patch.bonus;
      named.presence(out).catch(() => {});
    },
    say: (index) => {
      if (!left) named.presence({ q: [index, ++seq] }).catch(() => {});
    },
    leave: () => {
      left = true;
      offPeers();
      offConn();
      named.leave().catch(() => {});
    },
  };
}

/** Dev build: the other tabs on this computer play the other branches. */
function joinTabs(caseId: string, me: CoopMe, onStatus: (s: CoopStatus) => void): CoopSession | null {
  if (typeof BroadcastChannel === "undefined") return null;
  const ch = new BroadcastChannel(`nd-coop-${caseId}`);
  const key = Math.random().toString(36).slice(2, 10);
  const state = mine(me);
  const others = new Map<string, { p: Presence; seen: number }>();
  const report = () => {
    const now = Date.now();
    for (const [k, o] of others) if (now - o.seen > 8000) others.delete(k);
    onStatus({ online: true, partners: [...others].map(([k, o]) => partnerOf(k, o.p, false)).filter((x): x is Partner => !!x) });
  };
  let closed = false;
  const send = (bye = false) => {
    if (!closed) ch.postMessage({ key, bye, p: state });
  };
  ch.onmessage = (e: MessageEvent) => {
    const d = e.data as { key?: unknown; bye?: unknown; p?: unknown; hello?: unknown };
    if (typeof d?.key !== "string" || d.key === key) return;
    if (d.bye) others.delete(d.key);
    else if (d.p && typeof d.p === "object") {
      const isNew = !others.has(d.key);
      others.set(d.key, { p: d.p as Presence, seen: Date.now() });
      if (isNew) send();
    }
    report();
  };
  const beat = window.setInterval(() => {
    send();
    report();
  }, 3000);
  send();
  window.setTimeout(report, 50);
  return {
    update: (patch) => {
      if ("at" in patch) state.a = patch.at ?? null;
      if (patch.found) state.f = patch.found.slice(0, 24);
      if (patch.bonus !== undefined) state.x = patch.bonus;
      send();
    },
    say: (index) => {
      const was = Array.isArray(state.q) ? (state.q[1] as number) : 0;
      state.q = [index, was + 1];
      send();
    },
    leave: () => {
      window.clearInterval(beat);
      send(true);
      closed = true;
      ch.close();
    },
  };
}

/**
 * Join the live room for a case. `onStatus` hears who else is on it as that
 * changes. Resolves null when no live link is possible in this view (the
 * game then plays exactly as before, solo).
 */
export async function joinCase(caseId: string, me: CoopMe, onStatus: (s: CoopStatus) => void): Promise<CoopSession | null> {
  const room = await joinRoom(caseId, me, onStatus).catch(() => null);
  if (room) return room;
  return isDev() ? joinTabs(caseId, me, onStatus) : null;
}
