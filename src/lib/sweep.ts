import { SCENE_KITS } from "@/three/sceneKits";
import { sceneOf } from "./cases";
import type { CrimeCase, SceneId, SweepItem } from "./types";

/** Objects drawn in each scene that a timed sweep can ask for. x/y are % of the 360×400 scene. */
export const SWEEP_ITEMS: Record<SceneId, SweepItem[]> = {
  "neon-alley": [
    { id: "noodle", name: "Suya sign", x: 83, y: 25 },
    { id: "dumpster", name: "LAWMA bin", x: 83, y: 61 },
    { id: "door", name: "Back door", x: 50, y: 51 },
    { id: "open", name: "POS 24/7 sign", x: 50, y: 37 },
    { id: "chalk", name: "Chalk outline", x: 51, y: 78 },
    { id: "pipe", name: "Drainpipe", x: 28, y: 20 },
    { id: "magnifier", name: "Magnifying glass", x: 23, y: 82, r: 5 },
    { id: "dog", name: "K9 officer", x: 29, y: 91, r: 6 },
    { id: "scorch", name: "Scorch mark", x: 20, y: 40 },
    { id: "puddle", name: "Puddle", x: 41, y: 88 },
  ],
  penthouse: [
    { id: "chandelier", name: "Chandelier", x: 50, y: 10 },
    { id: "moon", name: "Moon", x: 59, y: 19, r: 5 },
    { id: "camera", name: "Security camera", x: 12, y: 15 },
    { id: "safe", name: "Wall safe", x: 84, y: 38 },
    { id: "vase", name: "Rose", x: 36, y: 61, r: 5 },
    { id: "glass", name: "Champagne flute", x: 47, y: 68, r: 6 },
    { id: "ledger", name: "Torn page", x: 16, y: 85 },
    { id: "photo", name: "Forensic camera", x: 69, y: 76, r: 5 },
    { id: "skyline", name: "City skyline", x: 28, y: 42 },
  ],
  "bank-vault": [
    { id: "wheel", name: "Vault wheel", x: 72, y: 35 },
    { id: "gold", name: "Gold bars", x: 47, y: 40 },
    { id: "sign", name: "VAULT 7 sign", x: 47, y: 10 },
    { id: "emitter", name: "Laser emitter", x: 14, y: 47 },
    { id: "timelock", name: "Time-lock screen", x: 77, y: 54, r: 5 },
    { id: "graph", name: "Graph monitor", x: 89, y: 54, r: 5 },
    { id: "id", name: "Fake ID", x: 30, y: 84 },
    { id: "ace", name: "Ace of spades", x: 58, y: 87 },
    { id: "dog", name: "K9 officer", x: 83, y: 89 },
    { id: "labcam", name: "Forensic camera", x: 42, y: 63, r: 5 },
  ],
  livestream: [
    { id: "ring", name: "Ring light", x: 16, y: 35 },
    { id: "onair", name: "ON AIR sign", x: 77, y: 10 },
    { id: "monitor", name: "“Stream offline” screen", x: 50, y: 37 },
    { id: "chat", name: "Chat monitor", x: 75, y: 40, r: 6 },
    { id: "cans", name: "Energy drinks", x: 75, y: 53, r: 5 },
    { id: "router", name: "Router", x: 83, y: 50, r: 5 },
    { id: "chair", name: "Gaming chair", x: 50, y: 58 },
    { id: "tablet", name: "Mod tablet", x: 34, y: 58, r: 6 },
    { id: "clipboard", name: "Clipboard", x: 70, y: 86 },
    { id: "knob", name: "Closet doorknob", x: 91, y: 76, r: 5 },
    { id: "dog", name: "K9 officer", x: 31, y: 91, r: 6 },
  ],
  gallery: [
    { id: "lady", name: "The Gele Queen", x: 50, y: 33 },
    { id: "mountains", name: "Mountain painting", x: 15, y: 28 },
    { id: "abstract", name: "Abstract painting", x: 85, y: 28 },
    { id: "spot", name: "Spotlight", x: 50, y: 3, r: 5 },
    { id: "rope", name: "Velvet rope", x: 50, y: 65 },
    { id: "case", name: "Glass case", x: 81, y: 58 },
    { id: "strip", name: "Photo strip", x: 28, y: 72, r: 6 },
    { id: "crate", name: "Courier crate", x: 60, y: 86 },
    { id: "drip", name: "Wet paint drip", x: 42, y: 52, r: 5 },
  ],
  ransom: [
    { id: "pan", name: "Copper pan", x: 12, y: 13 },
    { id: "jollof", name: "Pot of jollof", x: 23, y: 35, r: 6 },
    { id: "dock", name: "Loading dock sign", x: 64, y: 21 },
    { id: "oven", name: "Oven", x: 17, y: 56 },
    { id: "note", name: "Ransom note", x: 50, y: 53, r: 5 },
    { id: "knives", name: "Knife block", x: 65, y: 49, r: 5 },
    { id: "fridge", name: "Walk-in fridge", x: 87, y: 25 },
    { id: "bin", name: "Trash bin", x: 14, y: 70 },
    { id: "flour", name: "Flour sack", x: 15, y: 80, r: 5 },
    { id: "bed", name: "Empty dog bed", x: 75, y: 88 },
    { id: "bowl", name: "Water bowl", x: 89, y: 83, r: 5 },
    { id: "garlic", name: "Garlic", x: 38, y: 51, r: 5 },
  ],
  danfo: [
    { id: "route", name: "OSHODI–CMS board", x: 30, y: 32 },
    { id: "tower", name: "Tallest tower", x: 49, y: 27, r: 5 },
    { id: "lamp", name: "Street lamp", x: 13, y: 30, r: 5 },
    { id: "sticker", name: "NO SHAKING sticker", x: 88, y: 55, r: 5 },
    { id: "wheel", name: "Danfo wheel", x: 26, y: 71 },
    { id: "mirror", name: "Side mirror", x: 8, y: 42, r: 5 },
    { id: "tray", name: "Gala tray", x: 5, y: 53, r: 5 },
    { id: "sachet", name: "Pure water sachet", x: 58, y: 84, r: 5 },
    { id: "sleeper", name: "Sleeping courier", x: 49, y: 41, r: 5 },
    { id: "phone", name: "Phone camera", x: 76, y: 44, r: 5 },
    { id: "dog", name: "K9 officer", x: 53, y: 91, r: 6 },
  ],
  market: [
    { id: "sign", name: "BALOGUN MARKET sign", x: 50, y: 8 },
    { id: "red", name: "Red umbrella", x: 11, y: 21 },
    { id: "yellow", name: "Yellow umbrella", x: 36, y: 21 },
    { id: "pos", name: "POS board", x: 15, y: 30, r: 5 },
    { id: "ajo", name: "Ajo box", x: 50, y: 52, r: 6 },
    { id: "clock", name: "Fallen clock", x: 68, y: 73, r: 5 },
    { id: "gen", name: "Generator", x: 34, y: 83 },
    { id: "barrow", name: "Wheelbarrow", x: 80, y: 84 },
    { id: "chicken", name: "Market chicken", x: 58, y: 88, r: 5 },
    { id: "stool", name: "Stool", x: 21, y: 76, r: 5 },
    { id: "log", name: "Night logbook", x: 89, y: 40, r: 5 },
    { id: "dog", name: "K9 officer", x: 12, y: 92, r: 6 },
  ],
  owambe: [
    { id: "chandelier", name: "Chandelier", x: 50, y: 8 },
    { id: "banner", name: "#TemTunForever banner", x: 50, y: 24 },
    { id: "cake", name: "Wedding cake", x: 29, y: 48 },
    { id: "thrones", name: "Couple's thrones", x: 42, y: 43, r: 6 },
    { id: "speaker", name: "Speaker tower", x: 97, y: 50, r: 5 },
    { id: "headphones", name: "DJ headphones", x: 78, y: 47, r: 5 },
    { id: "box", name: "Spray box", x: 71, y: 60, r: 6 },
    { id: "gele", name: "Gold gele", x: 23, y: 62, r: 6 },
    { id: "chapman", name: "Glass of Chapman", x: 57, y: 80, r: 5 },
    { id: "dog", name: "K9 officer", x: 85, y: 91, r: 6 },
  ],
};

/**
 * Findable objects for a case: the named props of its kit (in 3D every case
 * has one), or, for the flat fallback, the drawn scene's list.
 */
export function sweepItemsFor(c: CrimeCase, threeD = false): SweepItem[] {
  const kit = c.kit ?? (threeD ? SCENE_KITS[sceneOf(c)] : undefined);
  if (kit) {
    return kit.props
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => p.name)
      .map(({ p, i }) => ({ id: propItemId(p.kind, i), name: p.name!, x: p.x, y: p.y, r: 7 }));
  }
  return SWEEP_ITEMS[sceneOf(c)];
}

export function propItemId(kind: string, index: number) {
  return `${kind}-${index}`;
}

export const SWEEP_SECONDS = 60;
export const SWEEP_TARGETS = 6;
export const MISS_PENALTY = 3;

export function starsFor(secondsLeft: number): number {
  if (secondsLeft >= 30) return 3;
  if (secondsLeft >= 15) return 2;
  return 1;
}
