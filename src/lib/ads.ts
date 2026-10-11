/**
 * Player posters on the streets of the game: a small advertising business.
 *
 * An advertiser uploads a poster, picks where it goes (a billboard or a wall
 * poster), a city (or nationwide) and how many weeks, then pays the owner
 * offline using the owner's payment instructions. The owner reviews every
 * submission in the Ad manager and approves it; only then does it appear in
 * the 3D scenes. No payment details ever pass through the game.
 *
 * Storage (claude.ai `db`), images kept inside the documents as compressed JPEG:
 *   adsubmit/<advertiser>            who submitted (so the owner can list them)
 *   adsubmit/<advertiser>/posters/<id>  each submission (private to the advertiser and the owner)
 *   adlive/<id>                      approved posters everyone sees
 *   adsettings/main                  prices and payment instructions (owner only)
 *   hunts/<id>                       sponsored clue hunts everyone can play (owner writes them on approval)
 * Outside claude.ai everything lives in this browser's storage and the local
 * player is treated as the owner, so the whole flow can be tried in dev.
 */

import type { CityId } from "./cities";

export type AdPlacement = "billboard" | "signboard" | "banner" | "poster";
export type AdCity = CityId | "all";
export type AdStatus = "pending" | "live" | "rejected" | "expired";

export interface AdSubmission {
  id: string;
  by: string;
  business: string;
  phone: string;
  placement: AdPlacement;
  city: AdCity;
  weeks: number;
  /** How many boards (or posters) the advertiser bought: more boards, more places in every scene. */
  count?: number;
  price: number;
  ref: string;
  image: string;
  /** Optional: the advertiser's website or social page (https only), a short description, and whether to show a WhatsApp button. */
  website?: string;
  blurb?: string;
  whatsapp?: boolean;
  status: AdStatus;
  note?: string;
  createdAt: number;
  liveUntil?: number;
  /** Also run a sponsored clue hunt: players find the brand's tokens to unlock this offer. */
  hunt?: HuntOffer;
}

export interface HuntOffer {
  /** What players unlock, e.g. "10% off any jollof pack". */
  offer: string;
  /** The code they show or type at the shop (the same for everyone). */
  code: string;
  /** Tokens to find (3–8). */
  tokens: number;
}

/** A live sponsored hunt. */
export interface Hunt extends HuntOffer {
  id: string;
  brand: string;
  image: string;
  placement: AdPlacement;
  city: AdCity;
  /** The case whose scene the hunt takes place in. */
  caseId: string;
  website?: string;
  phone?: string;
  start: number;
  end: number;
}

export interface LiveAd {
  id: string;
  business: string;
  placement: AdPlacement;
  city: AdCity;
  image: string;
  start: number;
  end: number;
  /** Boards bought; the poster takes this many slots in each scene where there are enough. */
  count: number;
  website?: string;
  blurb?: string;
  /** Digits for a wa.me link, only when the advertiser chose to show it. */
  phone?: string;
}

/**
 * A safe web link from what the advertiser typed: "mamaput.ng" becomes
 * "https://mamaput.ng". Only http(s) links to a real-looking host pass;
 * anything else (javascript:, data:, a bare word) is refused with "".
 */
export function cleanUrl(input: string): string {
  let t = input.trim();
  if (!t) return "";
  if (!/^[a-z][a-z0-9+.-]*:/i.test(t)) t = `https://${t}`;
  try {
    const u = new URL(t);
    if (u.protocol !== "https:" && u.protocol !== "http:") return "";
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(u.hostname)) return "";
    if (u.username || u.password) return "";
    const out = u.toString();
    return out.length <= 200 ? out : "";
  } catch {
    return "";
  }
}

/** A Nigerian number as digits for wa.me: 0803 123 4567 becomes 2348031234567. */
export function waDigits(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("234")) return d;
  if (d.startsWith("0")) return `234${d.slice(1)}`;
  return d;
}

export interface AdSettings {
  /** Naira per week, per city, for each size. */
  billboard: number;
  signboard: number;
  banner: number;
  poster: number;
  /** Price multiplier for nationwide. */
  nationwide: number;
  /** How to pay: bank, account name and number, or a contact. Written by the owner. */
  payment: string;
  /** Advertising is open to new submissions. */
  open: boolean;
  /** Naira per week for adding a sponsored clue hunt to a poster. */
  hunt?: number;
}

export const DEFAULT_SETTINGS: AdSettings = {
  billboard: 15_000,
  signboard: 8_000,
  banner: 6_000,
  poster: 5_000,
  nationwide: 3,
  payment: "",
  open: true,
  hunt: 20_000,
};

export const HUNT_PRICE = (s: AdSettings) => s.hunt ?? DEFAULT_SETTINGS.hunt ?? 20_000;

/** The banner sizes on sale. Image sizes match the shapes in the 3D scenes. */
export const SHAPES: Record<AdPlacement, { w: number; h: number; label: string; size: string; where: string }> = {
  billboard: { w: 1024, h: 434, label: "Big billboard", size: "6.6 m × 2.8 m", where: "High above the street, seen from far away" },
  signboard: { w: 900, h: 600, label: "Sign board", size: "3 m × 2 m", where: "On two posts by the roadside" },
  banner: { w: 1200, h: 300, label: "Street banner", size: "4.4 m × 1.1 m", where: "A long cloth banner hung between poles" },
  poster: { w: 600, h: 800, label: "Wall poster", size: "1.5 m × 2 m", where: "Pasted on the walls of buildings" },
};

export const PLACEMENT_ORDER: AdPlacement[] = ["billboard", "signboard", "banner", "poster"];

export const AD_RULES =
  "Posters and links are reviewed before they go live. No nudity, violence, gambling, political campaigns, hate, fake products, scam links, or logos and photos you don't have the right to use.";

/** Money off for buying many boards at once. */
export function bulkDiscount(count: number) {
  return count >= 10 ? 0.2 : count >= 5 ? 0.1 : 0;
}

export const MAX_BOARDS = 20;

export function priceOf(s: AdSettings, placement: AdPlacement, city: AdCity, weeks: number, count = 1) {
  const base = s[placement] ?? DEFAULT_SETTINGS[placement];
  const n = Math.max(1, Math.min(MAX_BOARDS, Math.round(count)));
  return Math.round(base * weeks * n * (1 - bulkDiscount(n)) * (city === "all" ? s.nationwide : 1));
}

/** A short code the advertiser quotes when paying, so the owner can match the payment. */
export function makeRef() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let r = "ND-";
  for (let i = 0; i < 6; i++) r += letters[Math.floor(Math.random() * letters.length)];
  return r;
}

/* ---------------------------------------------------------------- images */

/** Open the advertiser's picture. */
export async function loadPicture(file: File): Promise<HTMLImageElement> {
  if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.type)) throw new Error("Please choose a PNG, JPG or WebP picture.");
  if (file.size > 15 * 1024 * 1024) throw new Error("That picture is too big. Please use one under 15 MB.");
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("That picture could not be opened."));
      i.src = url;
    });
  } finally {
    // the decoded image stays usable after the object URL is released
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

/** How the picture sits on the banner: its size (1 = shrunk to fit), where its centre is (0..1), and the colour around it. */
export interface Framing {
  zoom: number;
  x: number;
  y: number;
  bg: string;
}

/** The scale that shrinks the whole picture to fit inside the banner (nothing cut off). */
export function fitScale(img: HTMLImageElement, placement: AdPlacement) {
  const { w, h } = SHAPES[placement];
  return Math.min(w / img.naturalWidth, h / img.naturalHeight);
}

/** The zoom (relative to fit) at which the picture fills the whole banner. */
export function fillZoom(img: HTMLImageElement, placement: AdPlacement) {
  const { w, h } = SHAPES[placement];
  return Math.max(w / img.naturalWidth, h / img.naturalHeight) / fitScale(img, placement);
}

/** The average colour around the picture's edge: a background that blends with it. */
export function edgeColour(img: HTMLImageElement) {
  const c = document.createElement("canvas");
  c.width = c.height = 16;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0, 16, 16);
  const d = ctx.getImageData(0, 0, 16, 16).data;
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      if (x > 0 && x < 15 && y > 0 && y < 15) continue;
      const k = (y * 16 + x) * 4;
      r += d[k];
      g += d[k + 1];
      b += d[k + 2];
      n++;
    }
  const hex = (v: number) => Math.round(v / n).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

/** Draw the picture onto a banner-shaped canvas. */
export function drawPoster(ctx: CanvasRenderingContext2D, img: HTMLImageElement, placement: AdPlacement, f: Framing, w: number, h: number) {
  const { w: W } = SHAPES[placement];
  const k = w / W;
  const s = fitScale(img, placement) * f.zoom * k;
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  ctx.fillStyle = f.bg;
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, f.x * w - dw / 2, f.y * h - dh / 2, dw, dh);
}

/** The finished banner as a JPEG small enough to live in a database document. */
export function renderPoster(img: HTMLImageElement, placement: AdPlacement, f: Framing): string {
  const { w, h } = SHAPES[placement];
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  drawPoster(c.getContext("2d")!, img, placement, f, w, h);
  for (const q of [0.82, 0.7, 0.58, 0.45]) {
    const data = c.toDataURL("image/jpeg", q);
    if (data.length < 190_000) return data;
  }
  throw new Error("That picture is too detailed to fit. Try a simpler design.");
}

/* ---------------------------------------------------------------- storage */

type Unsub = () => void;
type Snap = { id: string; exists: boolean; data(): Record<string, unknown> | undefined };
type DocRef = { set(d: Record<string, unknown>): Promise<void>; get(): Promise<Snap>; delete(): Promise<void>; collection(p: string): ColRef };
type ColRef = { doc(id: string): DocRef; get(): Promise<{ docs: Snap[] }>; onSnapshot(next: (s: { docs: Snap[] }) => void, err?: (e: { code: string }) => void): Unsub };
type Db = { collection(p: string): ColRef; doc(p: string): DocRef };
type User = { id(): Promise<string | null>; isOwner(): Promise<boolean> };
type Runtime = { use(name: string): Promise<unknown> };

async function use<T>(name: string): Promise<T | null> {
  try {
    const c = (window as unknown as { claude?: Runtime }).claude;
    return c?.use ? (((await c.use(name)) as T | null) ?? null) : null;
  } catch {
    return null;
  }
}

export interface AdStore {
  /** Where the data lives: shared on claude.ai, or only this browser. */
  mode: "shared" | "local";
  myId: string;
  isOwner: boolean;
  settings(): Promise<AdSettings>;
  saveSettings(s: AdSettings): Promise<void>;
  submit(sub: Omit<AdSubmission, "id" | "by" | "status" | "createdAt">): Promise<void>;
  mine(): Promise<AdSubmission[]>;
  /** Owner: every submission. */
  all(): Promise<AdSubmission[]>;
  approve(sub: AdSubmission): Promise<void>;
  reject(sub: AdSubmission, note: string): Promise<void>;
  takeDown(sub: AdSubmission): Promise<void>;
  watchLive(cb: (ads: LiveAd[]) => void): Unsub;
  /** Live sponsored hunts. */
  watchHunts(cb: (hunts: Hunt[]) => void): Unsub;
}

const str = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const PLACEMENTS = new Set(["billboard", "signboard", "banner", "poster"]);

function toSubmission(id: string, by: string, d: Record<string, unknown>): AdSubmission | null {
  const image = str(d.image, 260_000);
  if (!image.startsWith("data:image/jpeg;base64,") || !PLACEMENTS.has(String(d.placement))) return null;
  return {
    id,
    by,
    business: str(d.business, 60),
    phone: str(d.phone, 24),
    placement: d.placement as AdPlacement,
    city: str(d.city, 20) as AdCity,
    weeks: Math.max(1, Math.min(52, num(d.weeks))),
    count: Math.max(1, Math.min(MAX_BOARDS, num(d.count) || 1)),
    price: num(d.price),
    ref: str(d.ref, 12),
    image,
    status: (["pending", "live", "rejected", "expired"].includes(String(d.status)) ? d.status : "pending") as AdStatus,
    note: str(d.note, 200) || undefined,
    website: cleanUrl(str(d.website, 220)) || undefined,
    blurb: str(d.blurb, 140) || undefined,
    whatsapp: d.whatsapp === true,
    createdAt: num(d.createdAt),
    liveUntil: num(d.liveUntil) || undefined,
    hunt: toHuntOffer(d.hunt),
  };
}

function toHuntOffer(v: unknown): HuntOffer | undefined {
  if (!v || typeof v !== "object") return undefined;
  const h = v as Record<string, unknown>;
  const offer = str(h.offer, 90).trim();
  const code = str(h.code, 24).trim();
  if (!offer || !code) return undefined;
  return { offer, code, tokens: Math.max(3, Math.min(8, Math.round(num(h.tokens)) || 5)) };
}

function toHunt(id: string, d: Record<string, unknown>): Hunt | null {
  const image = str(d.image, 260_000);
  const offer = toHuntOffer(d);
  if (!offer || !image.startsWith("data:image/jpeg;base64,") || !PLACEMENTS.has(String(d.placement))) return null;
  const phone = str(d.phone, 16).replace(/\D/g, "");
  return {
    id,
    ...offer,
    brand: str(d.brand, 60) || "Sponsor",
    image,
    placement: d.placement as AdPlacement,
    city: str(d.city, 20) as AdCity,
    caseId: str(d.caseId, 40),
    website: cleanUrl(str(d.website, 220)) || undefined,
    phone: phone.length >= 10 ? phone : undefined,
    start: num(d.start),
    end: num(d.end),
  };
}

/** The public hunt made from an approved poster that asked for one. */
function huntDoc(sub: AdSubmission, end: number, caseId: string) {
  return {
    brand: sub.business,
    offer: sub.hunt!.offer,
    code: sub.hunt!.code,
    tokens: sub.hunt!.tokens,
    image: sub.image,
    placement: sub.placement,
    city: sub.city,
    caseId,
    website: sub.website ? cleanUrl(sub.website) || undefined : undefined,
    phone: sub.whatsapp ? waDigits(sub.phone) : undefined,
    start: Date.now(),
    end,
  };
}

/** Pick the case a hunt is set in: an outdoor scene in the poster's city (Lagos for nationwide). */
let pickCase: (city: AdCity, seed: string) => string = () => "";
export function setHuntCasePicker(fn: (city: AdCity, seed: string) => string) {
  pickCase = fn;
}

function toLive(id: string, d: Record<string, unknown>): LiveAd | null {
  const image = str(d.image, 260_000);
  if (!image.startsWith("data:image/jpeg;base64,") || !PLACEMENTS.has(String(d.placement))) return null;
  const phone = str(d.phone, 16).replace(/\D/g, "");
  return {
    id,
    business: str(d.business, 60),
    placement: d.placement as AdPlacement,
    city: str(d.city, 20) as AdCity,
    image,
    start: num(d.start),
    end: num(d.end),
    count: Math.max(1, Math.min(MAX_BOARDS, num(d.count) || 1)),
    website: cleanUrl(str(d.website, 220)) || undefined,
    blurb: str(d.blurb, 140) || undefined,
    phone: phone.length >= 10 ? phone : undefined,
  };
}

const plain = (o: object) => JSON.parse(JSON.stringify(o)) as Record<string, unknown>;

/** The public part of an approved poster: no private phone unless the advertiser chose to show it. */
function liveDoc(sub: AdSubmission, end: number) {
  return {
    business: sub.business,
    placement: sub.placement,
    city: sub.city,
    image: sub.image,
    start: Date.now(),
    end,
    count: sub.count ?? 1,
    website: sub.website ? cleanUrl(sub.website) || undefined : undefined,
    blurb: sub.blurb || undefined,
    phone: sub.whatsapp ? waDigits(sub.phone) : undefined,
  };
}
const WEEK = 7 * 24 * 3600 * 1000;

function sharedStore(db: Db, myId: string, isOwner: boolean): AdStore {
  const mineCol = () => db.collection(`adsubmit/${myId}/posters`);
  const listAll = async () => {
    const people = await db.collection("adsubmit").get();
    const out: AdSubmission[] = [];
    for (const p of people.docs) {
      const posts = await db.collection(`adsubmit/${p.id}/posters`).get();
      for (const d of posts.docs) {
        const s = d.data() && toSubmission(d.id, p.id, d.data()!);
        if (s) out.push(s);
      }
    }
    return out.sort((a, b) => b.createdAt - a.createdAt);
  };
  return {
    mode: "shared",
    myId,
    isOwner,
    async settings() {
      const d = (await db.doc("adsettings/main").get()).data();
      return d ? { ...DEFAULT_SETTINGS, ...(d as Partial<AdSettings>) } : DEFAULT_SETTINGS;
    },
    saveSettings: (s) => db.doc("adsettings/main").set(plain(s)),
    async submit(sub) {
      const id = `p${Date.now().toString(36)}`;
      await db.doc(`adsubmit/${myId}`).set({ updatedAt: Date.now() });
      await mineCol().doc(id).set(plain({ ...sub, status: "pending", createdAt: Date.now() }));
    },
    async mine() {
      const r = await mineCol().get();
      return r.docs.map((d) => d.data() && toSubmission(d.id, myId, d.data()!)).filter((x): x is AdSubmission => !!x).sort((a, b) => b.createdAt - a.createdAt);
    },
    all: listAll,
    async approve(sub) {
      const end = Date.now() + sub.weeks * WEEK;
      await db.doc(`adlive/${sub.id}`).set(plain(liveDoc(sub, end)));
      if (sub.hunt) await db.doc(`hunts/${sub.id}`).set(plain(huntDoc(sub, end, pickCase(sub.city, sub.id))));
      await db.doc(`adsubmit/${sub.by}/posters/${sub.id}`).set(plain({ ...sub, status: "live", liveUntil: end }));
    },
    async reject(sub, note) {
      await db.doc(`adsubmit/${sub.by}/posters/${sub.id}`).set(plain({ ...sub, status: "rejected", note }));
    },
    async takeDown(sub) {
      await db.doc(`adlive/${sub.id}`).delete();
      if (sub.hunt) await db.doc(`hunts/${sub.id}`).delete().catch(() => {});
      await db.doc(`adsubmit/${sub.by}/posters/${sub.id}`).set(plain({ ...sub, status: "expired" }));
    },
    watchLive(cb) {
      return db.collection("adlive").onSnapshot(
        (s) => cb(s.docs.map((d) => d.data() && toLive(d.id, d.data()!)).filter((x): x is LiveAd => !!x && x.end > Date.now())),
        () => {},
      );
    },
    watchHunts(cb) {
      return db.collection("hunts").onSnapshot(
        (s) => cb(s.docs.map((d) => d.data() && toHunt(d.id, d.data()!)).filter((x): x is Hunt => !!x && x.end > Date.now())),
        () => cb([]),
      );
    },
  };
}

/** The same thing in this browser's storage, for playing outside claude.ai. */
function localStore(): AdStore {
  const KEY = "crime-life:ads-local";
  type Local = { subs: AdSubmission[]; live: LiveAd[]; hunts?: Hunt[]; settings: AdSettings };
  const read = (): Local => {
    try {
      const v = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
      if (v && Array.isArray(v.subs)) return { settings: DEFAULT_SETTINGS, live: [], ...v };
    } catch {
      // fall through
    }
    return { subs: [], live: [], settings: DEFAULT_SETTINGS };
  };
  const listeners = new Set<(ads: LiveAd[]) => void>();
  const huntListeners = new Set<(hunts: Hunt[]) => void>();
  const liveHunts = (v: Local) => (v.hunts ?? []).filter((h) => h.end > Date.now()).map((h) => toHunt(h.id, h as unknown as Record<string, unknown>)).filter((x): x is Hunt => !!x);
  const write = (v: Local) => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(v));
    } catch {
      throw new Error("This browser has no room left to save the poster.");
    }
    listeners.forEach((cb) => cb(v.live.filter((a) => a.end > Date.now()).map((a) => toLive(a.id, a as unknown as Record<string, unknown>)).filter((x): x is LiveAd => !!x)));
    huntListeners.forEach((cb) => cb(liveHunts(v)));
  };
  return {
    mode: "local",
    myId: "local",
    isOwner: true,
    settings: async () => read().settings,
    saveSettings: async (s) => write({ ...read(), settings: s }),
    async submit(sub) {
      const v = read();
      v.subs.unshift({ ...sub, id: `p${Date.now().toString(36)}`, by: "local", status: "pending", createdAt: Date.now() });
      write(v);
    },
    mine: async () => read().subs,
    all: async () => read().subs,
    async approve(sub) {
      const v = read();
      const end = Date.now() + sub.weeks * WEEK;
      v.live = [...v.live.filter((a) => a.id !== sub.id), { id: sub.id, ...(liveDoc(sub, end) as Omit<LiveAd, "id">) }];
      if (sub.hunt) v.hunts = [...(v.hunts ?? []).filter((h) => h.id !== sub.id), { id: sub.id, ...(huntDoc(sub, end, pickCase(sub.city, sub.id)) as Omit<Hunt, "id">) }];
      v.subs = v.subs.map((s) => (s.id === sub.id ? { ...s, status: "live", liveUntil: end } : s));
      write(v);
    },
    async reject(sub, note) {
      const v = read();
      v.subs = v.subs.map((s) => (s.id === sub.id ? { ...s, status: "rejected", note } : s));
      write(v);
    },
    async takeDown(sub) {
      const v = read();
      v.live = v.live.filter((a) => a.id !== sub.id);
      v.hunts = (v.hunts ?? []).filter((h) => h.id !== sub.id);
      v.subs = v.subs.map((s) => (s.id === sub.id ? { ...s, status: "expired" } : s));
      write(v);
    },
    watchLive(cb) {
      listeners.add(cb);
      cb(read().live.filter((a) => a.end > Date.now()).map((a) => toLive(a.id, a as unknown as Record<string, unknown>)).filter((x): x is LiveAd => !!x));
      return () => listeners.delete(cb);
    },
    watchHunts(cb) {
      huntListeners.add(cb);
      cb(liveHunts(read()));
      return () => huntListeners.delete(cb);
    },
  };
}

/**
 * An older version could keep posters in the browser by mistake on claude.ai.
 * Send any such posters to the shared board as new submissions (once), so the
 * owner sees them in the Ad manager.
 */
async function moveLocalPosters(store: AdStore) {
  const KEY = "crime-life:ads-local";
  let old: { subs?: AdSubmission[]; live?: LiveAd[] } | null = null;
  try {
    old = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
  } catch {
    return;
  }
  const subs = (old?.subs ?? []).filter((x) => x && x.status !== "rejected" && x.status !== "expired" && typeof x.image === "string");
  if (!subs.length) return;
  for (const x of subs) {
    try {
      await store.submit({ business: x.business, phone: x.phone, placement: x.placement, city: x.city, weeks: x.weeks, count: x.count, price: x.price, ref: x.ref, image: x.image, website: x.website, blurb: x.blurb, whatsapp: x.whatsapp });
    } catch {
      return;
    }
  }
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // nothing more to do
  }
}

let storePromise: Promise<AdStore | null> | null = null;

/** Why posters can't be saved in this view (shown in the Advertise sheet), or "" when they can. */
export let adProblem = "";

const isDev = () => typeof location !== "undefined" && /^(localhost|127\.0\.0\.1|\[::1\])$|\.localhost$/.test(location.hostname);

/** The claude.ai runtime can arrive a moment after the page starts: wait for it rather than give up. */
async function waitForRuntime(ms: number): Promise<Runtime | null> {
  const start = Date.now();
  for (;;) {
    const c = (window as unknown as { claude?: Runtime }).claude;
    if (c?.use) return c;
    if (Date.now() - start > ms) return null;
    await new Promise((r) => window.setTimeout(r, 150));
  }
}

/**
 * The ad store for this view. On claude.ai it is always the shared database, so
 * every player sees the same posters; only when playing the dev build on this
 * computer does it fall back to the browser. Resolves null (with `adProblem` set)
 * when the shared database can't be reached; the next call tries again.
 */
export function adStore(): Promise<AdStore | null> {
  storePromise ??= (async () => {
    const rt = await waitForRuntime(isDev() ? 400 : 6000);
    if (!rt) {
      if (isDev()) return localStore();
      adProblem = "Posters can only be saved when the game is opened on claude.ai. Please open the game link in your browser and try again.";
      return null;
    }
    const [db, user] = await Promise.all([use<Db>("db"), use<User>("user")]);
    const id = user ? await user.id().catch(() => null) : null;
    if (!db || !user || !id) {
      adProblem = !id ? "Please sign in to claude.ai to advertise." : "The poster database isn't available in this view. Please reload the game and try again.";
      return null;
    }
    adProblem = "";
    const owner = await user.isOwner().catch(() => false);
    const store = sharedStore(db, id, owner);
    await moveLocalPosters(store);
    return store;
  })().then((store) => {
    // don't keep a failure: try again next time
    if (!store) storePromise = null;
    return store;
  });
  return storePromise;
}
