/**
 * The state case generator: about 20 cases for every state outside Lagos,
 * built from the storylines (storylines.ts) set in each state's real places
 * (statePacks.ts), with local names and products. Deterministic: the same
 * cases every time, so saves, co-op rooms and leaderboards all agree.
 */

import { Banknote, BookOpen, Camera, Cctv, ClipboardList, CreditCard, Droplets, Fish, Footprints, Fuel, Gem, KeyRound, Laptop, Megaphone, Package, Pill, Receipt, Scale, ScrollText, Shirt, Smartphone, Stamp, Ticket, Truck, Wheat, Wrench, Zap, type LucideIcon } from "lucide-react";
import { moneyShort } from "../format";
import type { CaseId, CrimeCase, Face, KitProp, KitScene, LabGame, PropKind, Statement, Suspect } from "../types";
import { NAMES, PACKS, type PlaceKind, type StatePack } from "./statePacks";
import { SLOTS, STORYLINES, type IconKey, type Storyline } from "./storylines";

/** Cases each state should have in all (hand-written ones count). */
const TARGET = 20;

const ICONS: Record<IconKey, LucideIcon> = {
  cash: Banknote, cctv: Cctv, list: ClipboardList, card: CreditCard, steps: Footprints, key: KeyRound, laptop: Laptop, megaphone: Megaphone,
  box: Package, receipt: Receipt, scale: Scale, scroll: ScrollText, phone: Smartphone, stamp: Stamp, ticket: Ticket, tool: Wrench, power: Zap,
  fish: Fish, grain: Wheat, drop: Droplets, gem: Gem, truck: Truck, fuel: Fuel, pill: Pill, shirt: Shirt, book: BookOpen, camera: Camera,
};

/* ---------------------------------------------------------------- scenes for each kind of place */

type Backdrop = KitScene["backdrop"];

function backdropFor(kind: PlaceKind, pack: StatePack): Backdrop {
  const wall = tint(pack.colors.b, 0.75);
  const trim = pack.colors.a;
  switch (kind) {
    case "market":
    case "craft":
      return { kind: "outdoor", sky: "day", ground: "dirt", horizon: "city" };
    case "motorpark":
    case "campus":
      return { kind: "outdoor", sky: "day", ground: "concrete", horizon: "city" };
    case "square":
      return { kind: "outdoor", sky: "night", ground: "concrete", horizon: "city" };
    case "palace":
      return { kind: "outdoor", sky: "day", ground: "sand", horizon: "none" };
    case "rocks":
      return { kind: "outdoor", sky: "day", ground: "dirt", horizon: "rocks" };
    case "hills":
      return { kind: "outdoor", sky: "dawn", ground: "grass", horizon: "hills" };
    case "falls":
      return { kind: "outdoor", sky: "day", ground: "grass", horizon: "hills" };
    case "lake":
      return { kind: "outdoor", sky: "dusk", ground: "grass", horizon: "sea" };
    case "waterfront":
      return { kind: "outdoor", sky: "dusk", ground: "deck", horizon: "sea" };
    case "beach":
      return { kind: "outdoor", sky: "day", ground: "sand", horizon: "sea" };
    case "park":
      return { kind: "outdoor", sky: "day", ground: "grass", horizon: "city" };
    case "reserve":
    case "farm":
      return { kind: "outdoor", sky: "day", ground: kind === "farm" ? "dirt" : "grass", horizon: "savanna" };
    case "stadium":
      return { kind: "outdoor", sky: "night", ground: "grass", horizon: "city" };
    case "bridge":
      return { kind: "outdoor", sky: "dusk", ground: "road", horizon: "bridge" };
    case "museum":
      return { kind: "indoor", decor: "hall", wall, floor: "#6a5a4a", trim, window: "none" };
    case "mall":
      return { kind: "indoor", decor: "shop", wall, floor: "#8a8a8a", trim, window: "city-day" };
    case "hotel":
      return { kind: "indoor", decor: "luxury", wall, floor: "#5a3a2a", trim, window: "city-night" };
    case "office":
      return { kind: "indoor", decor: "office", wall, floor: "#6a7078", trim, window: "city-day" };
    case "factory":
      return { kind: "indoor", decor: "warehouse", wall: tint(pack.colors.b, 0.55), floor: "#7a6a52", trim, window: "hills" };
  }
}

/** Background things that make each kind of place recognisable (kept clear of the clue spots). */
const SCENERY: Record<PlaceKind, PropKind[]> = {
  market: ["stall", "umbrella", "barrow"],
  craft: ["kiosk", "furnace", "umbrella"],
  motorpark: ["bus", "keke", "okada"],
  campus: ["bench", "lamppost", "kiosk"],
  square: ["lamppost", "bench", "umbrella"],
  palace: ["arch", "drum", "plant"],
  rocks: ["boulder", "hut", "boulder"],
  hills: ["boulder", "plant", "hut"],
  falls: ["boulder", "plant", "bench"],
  lake: ["canoe", "bench", "plant"],
  waterfront: ["boat", "canoe", "lamppost"],
  beach: ["umbrella", "canoe", "plant"],
  park: ["bench", "plant", "lamppost"],
  reserve: ["hut", "plant", "goat"],
  farm: ["sack", "hut", "goat"],
  stadium: ["seats", "spotlight", "speaker"],
  bridge: ["lamppost", "car", "cone"],
  museum: ["painting", "cabinet", "plant"],
  mall: ["shoerack", "plant", "counter"],
  hotel: ["chandelier", "plant", "chair"],
  office: ["cabinet", "plant", "clock"],
  factory: ["crate", "generator", "crate"],
};
const SCENERY_AT: [number, number][] = [
  [14, 46],
  [84, 46],
  [50, 38],
];

/** The main city of each state (matches lib/cities, which can't be imported here). */
const CITY_NAME: Record<string, string> = {
  FCT: "Abuja", Kano: "Kano", Oyo: "Ibadan", Rivers: "Port Harcourt", Kwara: "Ilorin", Ogun: "Abeokuta", Edo: "Benin City", Abia: "Aba",
  Enugu: "Enugu", Kaduna: "Kaduna", Katsina: "Katsina", Zamfara: "Gusau", Kebbi: "Birnin Kebbi", Sokoto: "Sokoto", Bauchi: "Bauchi",
  Gombe: "Gombe", Borno: "Maiduguri", Yobe: "Potiskum", Jigawa: "Dutse", Benue: "Makurdi", Kogi: "Lokoja", Nasarawa: "Lafia", Niger: "Minna",
  Plateau: "Jos", Adamawa: "Yola", Taraba: "Wukari", Anambra: "Onitsha", Imo: "Owerri", Delta: "Warri", Bayelsa: "Yenagoa",
  "Akwa Ibom": "Uyo", "Cross River": "Calabar", Ebonyi: "Abakaliki", Ekiti: "Ado-Ekiti", Ondo: "Akure", Osun: "Osogbo",
};

/** Who works at each kind of place (fills {staff}). */
const STAFF: Record<PlaceKind, string> = {
  market: "Market union official", craft: "Workshop master", motorpark: "Park official", campus: "Bursary officer", square: "Event organiser",
  palace: "Palace secretary", rocks: "Tour guide", hills: "Tour guide", falls: "Park ranger", lake: "Boat operator", waterfront: "Jetty manager",
  beach: "Beach manager", park: "Park manager", reserve: "Park ranger", farm: "Farm manager", stadium: "Stadium manager", bridge: "Traffic officer",
  museum: "Curator", mall: "Shop manager", hotel: "Hotel manager", office: "Accounts officer", factory: "Warehouse supervisor",
};

/* ---------------------------------------------------------------- small helpers */

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** A small seeded random generator, so every build makes the same cases. */
function rng(seed: number) {
  let a = seed || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mix a colour towards white. */
function tint(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.round(v + (255 - v) * amount);
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

const SKINS = ["#4a2c17", "#5C3A1E", "#6b4226", "#8D5524", "#A0703C"];
const SHIRTS = ["#1d2f5a", "#7a1f6a", "#3a8a4a", "#c0182b", "#e8e0d0", "#1d6a8a", "#a8865a", "#2b3440", "#f0c419", "#5a3a8a"];

function faceFor(r: () => number, female: boolean, mood: Face["mood"]): Face {
  const pick = <T,>(l: T[]) => l[Math.floor(r() * l.length)];
  const hairStyle: Face["hairStyle"] = female ? pick(["bun", "long", "curly"] as const) : pick(["short", "buzz", "bald", "short"] as const);
  const acc: Face["acc"] | undefined = female ? pick(["gele", "glasses", undefined, "gele"] as const) : pick(["cap", "glasses", undefined, "fila", "beard"] as const);
  return { skin: pick(SKINS), hair: "#1b1b1b", hairStyle, shirt: pick(SHIRTS), bg: "#e7e9ed", acc, accColor: pick(["#c0182b", "#1d6a3a", "#7a1f6a", "#f0c419"]), mood };
}

/** Swap he/his/him for she/her (or back) to match a person. */
function pronouns(text: string, female: boolean) {
  if (female) return text.replace(/\b(he|He|his|His|him)\b/g, (w) => ({ he: "she", He: "She", his: "her", His: "Her", him: "her" })[w]!);
  return text.replace(/\b(she|She)\b/g, (w) => (w === "she" ? "he" : "He")).replace(/\bher\b/g, "his").replace(/\bHer\b/g, "His");
}

/* ---------------------------------------------------------------- one case */

interface Cast {
  name: string;
  first: string;
  female: boolean;
}

function person(pack: StatePack, r: () => number, used: Set<string>): Cast {
  for (let tries = 0; tries < 20; tries++) {
    const pool = NAMES[pack.pools[Math.min(pack.pools.length - 1, Math.floor(r() * r() * pack.pools.length * 1.5))]];
    const female = r() < 0.45;
    const first = (female ? pool.f : pool.m)[Math.floor(r() * (female ? pool.f : pool.m).length)];
    const last = pool.last[Math.floor(r() * pool.last.length)];
    const name = `${first} ${last}`;
    if (used.has(first) || used.has(last)) continue;
    used.add(first);
    used.add(last);
    return { name, first, female };
  }
  return { name: "Musa Bello", first: "Musa", female: false };
}

function buildCase(pack: StatePack, story: Storyline, place: { name: string; kind: PlaceKind }, n: number): CrimeCase {
  const id = `g-${pack.key}-${n}` as CaseId;
  const r = rng(hash(id));
  const used = new Set<string>();
  const C = person(pack, r, used);
  const H = person(pack, r, used);
  const W = person(pack, r, used);
  const V = person(pack, r, used);
  const lead = person(pack, r, used);
  const product = pack.products[Math.floor(r() * pack.products.length)];
  const [lo, hi] = story.amount;
  const amount = moneyShort(Math.round((lo + r() * (hi - lo)) / 10_000) * 10_000);
  const city = CITY_NAME[pack.state] ?? pack.state;

  const fill = (t: string, who: Cast = C) =>
    pronouns(
      t
        .replace(/\{place\}/g, place.name)
        .replace(/\{city\}/g, city)
        .replace(/\{state\}/g, pack.state === "FCT" ? "the FCT" : `${pack.state} State`)
        .replace(/\{nick\}/g, pack.nickname)
        .replace(/\{product\}/g, product)
        .replace(/\{amount\}/g, amount)
        .replace(/\{staff\}/g, STAFF[place.kind])
        .replace(/\{C\}/g, C.name)
        .replace(/\{Cf\}/g, C.first)
        .replace(/\{H\}/g, H.name)
        .replace(/\{Hf\}/g, H.first)
        .replace(/\{W\}/g, W.name)
        .replace(/\{Wf\}/g, W.first)
        .replace(/\{V\}/g, V.name),
      who.female,
    );
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // the scene: half the cases have the detective on the right, mirrored
  const mirror = r() < 0.5;
  const mx = (x: number) => (mirror ? 100 - x : x);
  const props: KitProp[] = [{ kind: "sign", x: 50, y: 14, label: place.name.replace(/\s*\(.*\)/, "").toUpperCase().slice(0, 28), color: pack.colors.a }];
  SCENERY[place.kind].forEach((kind, i) => props.push({ kind, x: mx(SCENERY_AT[i][0]), y: SCENERY_AT[i][1] }));
  const clues = story.clues.map((c) => {
    const [sx, sy] = SLOTS[c.slot];
    const x = mx(sx);
    props.push({ kind: c.prop, x, y: sy, name: cap(fill(c.name)), label: c.label ? fill(c.label).toUpperCase().slice(0, 16) : undefined });
    const lab: LabGame | undefined =
      c.lab === "prints" || c.lab === "boot" ? { kind: "prints", shape: c.lab === "boot" ? "boot" : "finger" } : Array.isArray(c.lab) ? { kind: "torn", style: "ledger", title: fill(c.name).toUpperCase().slice(0, 24), lines: c.lab.map((l) => fill(l)) } : undefined;
    const suspectId = c.who === "C" ? "c" : c.who === "H" ? "h" : "w";
    return { id: c.id, name: cap(fill(c.name)), icon: ICONS[c.icon], x, y: sy, description: fill(c.desc), action: c.action, finding: fill(c.finding), suspectId, lab };
  });

  const st = (sid: string, text: string, more?: string | [string, string]): Statement =>
    Array.isArray(more) ? { id: sid, text, lie: { clueId: more[0], reveal: more[1] } } : more ? { id: sid, text, press: more } : { id: sid, text };
  const sus = (sid: string, who: Cast, s: Storyline["helper"] | Storyline["culprit"], statements: Statement[], mood: Face["mood"]): Suspect => ({
    id: sid,
    name: who.name,
    role: cap(fill(s.role, who)),
    face: faceFor(r, who.female, mood),
    motive: fill(s.motive, who),
    alibi: fill(s.alibi, who),
    background: fill(s.background, who),
    quote: fill(s.quote, who),
    statements,
  });
  const suspects: Suspect[] = [
    sus("c", C, story.culprit, story.culprit.lies.map(([text, clue, reveal], i) => st(`c${i + 1}`, fill(text), [clue, fill(reveal)])), "smirk"),
    sus("h", H, story.helper, [st("h1", fill(story.helper.says[0]), fill(story.helper.says[1]))], "worried"),
    sus("w", W, story.witness, [st("w1", fill(story.witness.says[0]), fill(story.witness.says[1]))], "flat"),
  ];
  // shuffle the order suspects are listed in, so the culprit isn't always first
  const order = [0, 1, 2].sort(() => r() - 0.5);

  return {
    id,
    tier: 200 + n,
    title: fill(story.titles[Math.floor(r() * story.titles.length)]),
    hook: fill(story.hook),
    region: { state: pack.state, place: place.name, music: pack.music },
    inspiredBy: story.inspired,
    categories: [story.category],
    tags: [pack.state === "FCT" ? "Abuja" : pack.state, place.name, pack.nickname],
    bounty: Math.round((300_000 + r() * 500_000) / 10_000) * 10_000,
    inspecting: 0,
    lead: { name: `Insp. ${lead.name}`, face: faceFor(r, lead.female, "smile") },
    victim: fill(story.victim),
    briefing: fill(story.briefing),
    kit: { backdrop: backdropFor(place.kind, pack), castSide: mirror ? "right" : "left", props },
    clues,
    requiredClues: 3,
    suspects: order.map((i) => suspects[i]),
    culpritId: "c",
    solution: fill(story.solution),
  };
}

/* ---------------------------------------------------------------- every state */

/**
 * New cases for every state, topping each one up to about 20 (hand-written cases
 * count). Each state gets different storylines, spread over its places.
 */
export function generateStateCases(existing: CrimeCase[]): CrimeCase[] {
  const have = new Map<string, number>();
  for (const c of existing) {
    const s = c.region?.state;
    if (s) have.set(s, (have.get(s) ?? 0) + 1);
  }
  const out: CrimeCase[] = [];
  for (const pack of PACKS) {
    const need = Math.max(0, TARGET - (have.get(pack.state) ?? 0));
    if (!need) continue;
    const kinds = new Set(pack.places.map((p) => p.kind));
    const fits = STORYLINES.filter((s) => s.kinds.some((k) => kinds.has(k)));
    const start = hash(pack.state) % Math.max(1, fits.length);
    const usedPlaces = new Map<string, number>();
    for (let i = 0; i < need; i++) {
      const story = fits[(start + i) % fits.length];
      const options = pack.places.filter((p) => story.kinds.includes(p.kind));
      // the least used place that fits, so cases spread over the whole state
      const place = [...options].sort((a, b) => (usedPlaces.get(a.name) ?? 0) - (usedPlaces.get(b.name) ?? 0) || hash(a.name + i) - hash(b.name + i))[0];
      usedPlaces.set(place.name, (usedPlaces.get(place.name) ?? 0) + 1);
      out.push(buildCase(pack, story, place, i + 1));
    }
  }
  return out;
}

/** A state's pack (nickname, colours, places), for themed screens. */
export function packFor(state: string): StatePack | undefined {
  return PACKS.find((p) => p.state === state);
}
