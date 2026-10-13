/**
 * Shared, live data for the published game beyond the cloud save:
 * - the real leaderboard: each player keeps one public row at `board/<id>`
 *   (everyone reads, each player writes only their own);
 * - poster stats: each viewer adds up how often they saw and tapped each
 *   paid poster in `adstats/<id>`, and advertisers see the sums.
 * Outside claude.ai the leaderboard is just you and stats stay in this browser.
 */

type Unsub = () => void;
type Snap = { id: string; exists: boolean; data(): Record<string, unknown> | undefined };
type DocRef = { set(data: Record<string, unknown>): Promise<void>; get(): Promise<Snap> };
type CollectionRef = {
  get(): Promise<{ docs: Snap[] }>;
  onSnapshot(next: (s: { docs: Snap[] }) => void, error?: (e: { code: string }) => void): Unsub;
};
type Db = { doc(path: string): DocRef; collection(path: string): CollectionRef };
type User = { id(): Promise<string | null> };
type Runtime = { use(name: string): Promise<unknown> };

const isDev = () => typeof location !== "undefined" && /^(localhost|127\.0\.0\.1|\[::1\])$|\.localhost$/.test(location.hostname);

async function waitForRuntime(ms: number): Promise<Runtime | null> {
  const start = Date.now();
  for (;;) {
    const c = (window as unknown as { claude?: Runtime }).claude;
    if (c?.use) return c;
    if (Date.now() - start > ms) return null;
    await new Promise((r) => window.setTimeout(r, 150));
  }
}

let sharedPromise: Promise<{ db: Db; id: string } | null> | null = null;
function shared() {
  sharedPromise ??= (async () => {
    const rt = await waitForRuntime(isDev() ? 300 : 6000);
    if (!rt) return null;
    const [db, user] = await Promise.all([rt.use("db").catch(() => null) as Promise<Db | null>, rt.use("user").catch(() => null) as Promise<User | null>]);
    const id = user ? await user.id().catch(() => null) : null;
    return db && id ? { db, id } : null;
  })().catch(() => null);
  return sharedPromise;
}

const str = (v: unknown, n: number) =>
  typeof v === "string"
    ? v
        .replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩]/g, "")
        .trim()
        .slice(0, n)
    : "";
const num = (v: unknown, lo = -1e12, hi = 1e12) => (typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : 0);

/* ---------------------------------------------------------------- leaderboard */

export interface BoardRow {
  id: string;
  name: string;
  look: number;
  /** Their designed look (face code), if any. */
  face?: string;
  balance: number;
  rating: number;
  xp: number;
  solved: number;
  branch: string;
  badges: number;
  /** Weekly tournament: the week this row's weekly score belongs to, and the score (merit gained that week). */
  week?: string;
  weekXp?: number;
  /** Last week's final score, for the champions list. */
  prevWeek?: string;
  prevWeekXp?: number;
  updatedAt: number;
  me: boolean;
}

export type BoardEntry = Omit<BoardRow, "id" | "me" | "updatedAt">;

/** Put (or refresh) this player's public leaderboard row. */
export async function publishBoard(row: BoardEntry) {
  const s = await shared();
  if (!s) return;
  try {
    await s.db.doc(`board/${s.id}`).set({
      name: str(row.name, 24) || "Detective",
      look: Math.floor(num(row.look, 0, 11)),
      face: typeof row.face === "string" && /^f1-[0-9a-z]{8}$/.test(row.face) ? row.face : null,
      balance: Math.round(num(row.balance)),
      rating: num(row.rating, 0, 5),
      xp: Math.round(num(row.xp, 0)),
      solved: Math.round(num(row.solved, 0, 999)),
      branch: str(row.branch, 20),
      badges: Math.round(num(row.badges, 0, 99)),
      week: typeof row.week === "string" ? row.week.slice(0, 8) : null,
      weekXp: Math.round(num(row.weekXp, 0, 50_000)),
      prevWeek: typeof row.prevWeek === "string" ? row.prevWeek.slice(0, 8) : null,
      prevWeekXp: Math.round(num(row.prevWeekXp, 0, 50_000)),
      updatedAt: Date.now(),
    });
  } catch {
    // best effort: the board refreshes next time
  }
}

/** Live leaderboard rows, or null when this view has no shared board. */
export function watchBoard(cb: (rows: BoardRow[] | null) => void): Unsub {
  let stop: Unsub | null = null;
  let dead = false;
  void shared().then((s) => {
    if (dead) return;
    if (!s) return cb(null);
    stop = s.db.collection("board").onSnapshot(
      ({ docs }) =>
        cb(
          docs
            .map((d) => {
              const v = d.data();
              if (!v) return null;
              const name = str(v.name, 24);
              if (!name) return null;
              return {
                id: d.id,
                name,
                look: Math.floor(num(v.look, 0, 11)),
                face: typeof v.face === "string" && /^f1-[0-9a-z]{8}$/.test(v.face) ? v.face : undefined,
                balance: num(v.balance),
                rating: num(v.rating, 0, 5),
                xp: num(v.xp, 0),
                solved: num(v.solved, 0, 999),
                branch: str(v.branch, 20),
                badges: num(v.badges, 0, 99),
                week: typeof v.week === "string" ? v.week.slice(0, 8) : undefined,
                weekXp: num(v.weekXp, 0, 50_000),
                prevWeek: typeof v.prevWeek === "string" ? v.prevWeek.slice(0, 8) : undefined,
                prevWeekXp: num(v.prevWeekXp, 0, 50_000),
                updatedAt: num(v.updatedAt, 0, 1e13),
                me: d.id === s.id,
              } as BoardRow;
            })
            .filter((r): r is BoardRow => !!r),
        ),
      () => cb(null),
    );
  });
  return () => {
    dead = true;
    stop?.();
  };
}

/* ---------------------------------------------------------------- poster stats */

export interface AdCount {
  /** Times shown in a scene. */
  v: number;
  /** Times tapped. */
  t: number;
}

const LOCAL_STATS = "crime-life:adstats";
const pending = new Map<string, AdCount>();
let flushTimer: number | null = null;
let mineLoaded: Record<string, AdCount> | null = null;

function bump(id: string, key: keyof AdCount) {
  if (typeof window === "undefined" || !/^[a-z0-9]{1,40}$/i.test(id)) return;
  const c = pending.get(id) ?? { v: 0, t: 0 };
  c[key]++;
  pending.set(id, c);
  flushTimer ??= window.setTimeout(() => void flushStats(), 20_000);
}

/** A paid poster was put up in a scene this viewer is looking at. */
export const countView = (id: string) => bump(id, "v");
/** A paid poster was tapped open. */
export const countTap = (id: string) => bump(id, "t");

function readCounts(v: unknown): Record<string, AdCount> {
  const out: Record<string, AdCount> = {};
  if (!v || typeof v !== "object") return out;
  for (const [id, c] of Object.entries(v as Record<string, unknown>)) {
    if (!/^[a-z0-9]{1,40}$/i.test(id) || !c || typeof c !== "object") continue;
    const x = c as Record<string, unknown>;
    out[id] = { v: Math.round(num(x.v, 0)), t: Math.round(num(x.t, 0)) };
  }
  return out;
}

function add(into: Record<string, AdCount>, from: Iterable<[string, AdCount]>) {
  for (const [id, c] of from) {
    const was = into[id] ?? { v: 0, t: 0 };
    into[id] = { v: was.v + c.v, t: was.t + c.t };
  }
  return into;
}

async function flushStats() {
  flushTimer = null;
  if (!pending.size) return;
  const batch = [...pending];
  pending.clear();
  const s = await shared();
  try {
    if (!s) {
      const mine = readCounts(JSON.parse(window.localStorage.getItem(LOCAL_STATS) ?? "null"));
      window.localStorage.setItem(LOCAL_STATS, JSON.stringify(add(mine, batch)));
      return;
    }
    const ref = s.db.doc(`adstats/${s.id}`);
    if (!mineLoaded) {
      const snap = await ref.get();
      mineLoaded = readCounts(snap.exists ? snap.data()?.ads : null);
    }
    // keep the document small: only the 60 most-seen posters
    const merged = add(mineLoaded, batch);
    const top = Object.entries(merged)
      .sort((a, b) => b[1].v - a[1].v)
      .slice(0, 60);
    mineLoaded = Object.fromEntries(top);
    await ref.set({ ads: mineLoaded, updatedAt: Date.now() });
  } catch {
    // put them back for the next try
    for (const [id, c] of batch) {
      const was = pending.get(id) ?? { v: 0, t: 0 };
      pending.set(id, { v: was.v + c.v, t: was.t + c.t });
    }
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => void flushStats());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void flushStats();
  });
}

/** Total views and taps for every poster, across all players. */
export async function readAdStats(): Promise<Record<string, AdCount>> {
  await flushStats();
  const s = await shared();
  const total: Record<string, AdCount> = {};
  try {
    if (!s) return readCounts(JSON.parse(window.localStorage.getItem(LOCAL_STATS) ?? "null"));
    const all = await s.db.collection("adstats").get();
    for (const d of all.docs) add(total, Object.entries(readCounts(d.data()?.ads)));
  } catch {
    // whatever we have
  }
  return total;
}
