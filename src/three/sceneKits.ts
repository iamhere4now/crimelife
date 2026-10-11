/**
 * 3D layouts for the nine hand-drawn scenes. Props sit at the same x/y
 * percentages as the old SVG art, so every clue position in the Lagos cases
 * still lands on the right object in the default 3D view.
 */

import { regionOf, sceneOf } from "@/lib/cases";
import { cityOf, type CityId } from "@/lib/cities";
import type { CrimeCase, KitScene, Look, SceneId } from "@/lib/types";

export const SCENE_KITS: Record<SceneId, KitScene> = {
  "neon-alley": {
    backdrop: { kind: "alley", wall: "#2a1a3a", ground: "road" },
    castSide: "left",
    props: [
      { kind: "sign", x: 83, y: 25, label: "SUYA", color: "#ff3df0", name: "Suya sign" },
      { kind: "sign", x: 50, y: 37, label: "POS 24/7", color: "#53FC18", name: "POS 24/7 sign" },
      { kind: "door", x: 50, y: 52, color: "#3a2a4a", name: "Back door" },
      { kind: "pipe", x: 28, y: 34, name: "Drainpipe" },
      { kind: "cctv", x: 28, y: 20, name: "Security camera" },
      { kind: "scorch", x: 20, y: 40, name: "Scorch mark" },
      { kind: "bin", x: 83, y: 61, label: "LAWMA", name: "LAWMA bin" },
      { kind: "chip", x: 83, y: 73, name: "Memory chip" },
      { kind: "chalk", x: 51, y: 78, name: "Chalk outline" },
      { kind: "paper", x: 62, y: 79, name: "Receipt" },
      { kind: "puddle", x: 41, y: 88, name: "Puddle" },
    ],
  },
  penthouse: {
    backdrop: { kind: "indoor", decor: "luxury", wall: "#2a2440", floor: "#4a3a32", trim: "#c9a34a", window: "city-night" },
    castSide: "right",
    props: [
      { kind: "chandelier", x: 50, y: 8, name: "Chandelier" },
      { kind: "cctv", x: 12, y: 15, name: "Security camera" },
      { kind: "safe", x: 84, y: 38, name: "Wall safe" },
      { kind: "rug", x: 50, y: 76, color: "#6a1a2a" },
      { kind: "dining", x: 50, y: 70, name: "Dining table" },
      { kind: "orchid", x: 36, y: 62, color: "#c0182b", name: "Rose" },
      { kind: "glass", x: 47, y: 68, name: "Champagne flute" },
      { kind: "plant", x: 14, y: 60, name: "Potted palm" },
      { kind: "paper", x: 16, y: 85, name: "Torn page" },
    ],
  },
  "bank-vault": {
    backdrop: { kind: "indoor", decor: "warehouse", wall: "#2b333b", floor: "#454c55", trim: "#c9a34a", window: "none" },
    castSide: "left",
    props: [
      { kind: "sign", x: 47, y: 10, label: "VAULT 7", color: "#e6c35a", name: "VAULT 7 sign" },
      { kind: "vault", x: 72, y: 33, name: "Vault door" },
      { kind: "goldbars", x: 47, y: 44, name: "Gold bars" },
      { kind: "laser", x: 14, y: 47, name: "Laser emitter" },
      { kind: "desk", x: 83, y: 64, color: "#3b4148", name: "Security desk" },
      { kind: "monitor", x: 77, y: 55, s: 0.6, label: "TIME-LOCK", color: "#53FC18", name: "Time-lock screen" },
      { kind: "monitor", x: 89, y: 55, s: 0.6, label: "BTC ▲▼", color: "#f5c518", name: "Graph monitor" },
      { kind: "card", x: 30, y: 84, name: "Fake ID" },
      { kind: "playingcard", x: 58, y: 87, name: "Ace of spades" },
    ],
  },
  livestream: {
    backdrop: { kind: "indoor", decor: "studio", wall: "#1d1830", floor: "#2b2440", trim: "#7a3aff", window: "none" },
    castSide: "left",
    props: [
      { kind: "onair", x: 77, y: 10, name: "ON AIR sign" },
      { kind: "ringlight", x: 16, y: 44, name: "Ring light" },
      { kind: "monitor", x: 50, y: 37, s: 1.6, label: "STREAM OFFLINE", color: "#ff3b4e", name: "“Stream offline” screen" },
      { kind: "desk", x: 40, y: 57, color: "#2b2440" },
      { kind: "desk", x: 78, y: 55, color: "#2b2440" },
      { kind: "monitor", x: 74, y: 44, s: 0.7, label: "CHAT ▮▮▮", color: "#53FC18", name: "Chat monitor" },
      { kind: "laptop", x: 34, y: 58, color: "#7a3aff", name: "Mod tablet" },
      { kind: "cup", x: 75, y: 53, color: "#53FC18", name: "Energy drinks" },
      { kind: "router", x: 83, y: 50, name: "Router" },
      { kind: "chair", x: 50, y: 66, color: "#7a3aff", name: "Gaming chair" },
      { kind: "paper", x: 70, y: 86, name: "Clipboard" },
      { kind: "door", x: 91, y: 70, color: "#2b2440", name: "Closet door" },
    ],
  },
  gallery: {
    backdrop: { kind: "indoor", decor: "luxury", wall: "#efe9df", floor: "#b08a62", trim: "#c9a34a", window: "none" },
    castSide: "right",
    props: [
      { kind: "spotlight", x: 50, y: 4, name: "Spotlight" },
      { kind: "painting", x: 50, y: 33, label: "lady", color: "#1f5a3a", name: "The Gele Queen" },
      { kind: "painting", x: 15, y: 28, color: "#3a6a9a", name: "Mountain painting" },
      { kind: "painting", x: 85, y: 28, color: "#c0582b", name: "Abstract painting" },
      { kind: "rope", x: 50, y: 62, name: "Velvet rope" },
      { kind: "pedestal", x: 81, y: 58, name: "Glass case" },
      { kind: "bench", x: 26, y: 62 },
      { kind: "paint", x: 42, y: 52, name: "Wet paint drip" },
      { kind: "card", x: 28, y: 73, name: "Photo strip" },
      { kind: "crate", x: 60, y: 86, label: "FRAGILE", name: "Courier crate" },
    ],
  },
  ransom: {
    backdrop: { kind: "indoor", decor: "shop", wall: "#cfd6dc", floor: "#8a949c", trim: "#4c5660", window: "none" },
    castSide: "center",
    props: [
      { kind: "pans", x: 14, y: 13, name: "Copper pans" },
      { kind: "sign", x: 62, y: 21, label: "LOADING DOCK", color: "#f5c518", name: "Loading dock sign" },
      { kind: "stove", x: 18, y: 54, name: "Oven" },
      { kind: "fridge", x: 87, y: 36, s: 1.2, name: "Walk-in fridge" },
      { kind: "counter", x: 50, y: 60, name: "Prep counter" },
      { kind: "paper", x: 50, y: 54, name: "Ransom note" },
      { kind: "knife", x: 63, y: 52, name: "Knife block" },
      { kind: "bin", x: 14, y: 68, s: 0.5, color: "#4c5660", name: "Trash bin" },
      { kind: "sack", x: 15, y: 80, name: "Flour sack" },
      { kind: "footprints", x: 31, y: 86, name: "Floury footprints" },
      { kind: "chip", x: 83, y: 83, name: "GPS tag" },
      { kind: "dogbed", x: 72, y: 90, name: "Empty dog bed" },
      { kind: "bowl", x: 90, y: 86, name: "Water bowl" },
    ],
  },
  danfo: {
    backdrop: { kind: "outdoor", sky: "dusk", ground: "road", horizon: "city" },
    castSide: "right",
    props: [
      { kind: "bus", x: 50, y: 50, name: "Danfo bus" },
      { kind: "lamppost", x: 12, y: 42, name: "Street lamp" },
      { kind: "sign", x: 88, y: 55, s: 0.6, label: "NO SHAKING", color: "#f5c518", name: "NO SHAKING sign" },
      { kind: "hawker", x: 6, y: 58, name: "Gala hawker" },
      { kind: "paper", x: 23, y: 88, name: "Invoice" },
      { kind: "cup", x: 58, y: 84, color: "#dff4ff", name: "Pure water sachet" },
    ],
  },
  market: {
    backdrop: { kind: "outdoor", sky: "day", ground: "dirt", horizon: "city" },
    castSide: "left",
    props: [
      { kind: "sign", x: 50, y: 10, label: "BALOGUN MARKET", color: "#f5c518", name: "BALOGUN MARKET sign" },
      { kind: "sign", x: 15, y: 30, s: 0.7, label: "POS", color: "#53FC18", name: "POS board" },
      { kind: "umbrella", x: 8, y: 46, color: "#c0182b", name: "Red umbrella" },
      { kind: "umbrella", x: 34, y: 40, color: "#f5c518", name: "Yellow umbrella" },
      { kind: "stall", x: 20, y: 54, color: "#3a8a4a", name: "Provision stall" },
      { kind: "stall", x: 70, y: 54, color: "#1d6a8a", name: "Fabric stall" },
      { kind: "cabinet", x: 91, y: 46, color: "#5a3a1a", name: "Night logbook box" },
      { kind: "chest", x: 50, y: 55, label: "AJO", name: "Ajo box" },
      { kind: "clock", x: 66, y: 72, name: "Grandfather clock" },
      { kind: "chair", x: 21, y: 76, color: "#5a3a1a", name: "Stool" },
      { kind: "books", x: 21, y: 74, name: "Ledger" },
      { kind: "generator", x: 36, y: 83, name: "Generator" },
      { kind: "barrow", x: 80, y: 84, name: "Wheelbarrow" },
      { kind: "chicken", x: 58, y: 88, name: "Market chicken" },
    ],
  },
  owambe: {
    backdrop: { kind: "indoor", decor: "hall", wall: "#4a1a3a", floor: "#d9c7a0", trim: "#e6c35a", window: "none" },
    castSide: "left",
    props: [
      { kind: "chandelier", x: 50, y: 8, name: "Chandelier" },
      { kind: "sign", x: 50, y: 24, label: "#TemTunForever", color: "#ff7af5", name: "#TemTunForever banner" },
      { kind: "throne", x: 42, y: 44, name: "Couple's thrones" },
      { kind: "throne", x: 58, y: 44 },
      { kind: "cake", x: 28, y: 50, name: "Wedding cake" },
      { kind: "speaker", x: 95, y: 50, name: "Speaker tower" },
      { kind: "djbooth", x: 82, y: 58, label: "DJ JAGGA", name: "DJ booth" },
      { kind: "laptop", x: 85, y: 47, color: "#53FC18", name: "DJ laptop" },
      { kind: "chest", x: 70, y: 61, label: "SPRAY", color: "#c0182b", name: "Spray box" },
      { kind: "cushion", x: 23, y: 64, color: "#e6c35a", name: "Gold gele" },
      { kind: "cup", x: 57, y: 80, color: "#ff7a3a", name: "Glass of Chapman" },
      { kind: "notes", x: 50, y: 86, name: "Naira notes" },
      { kind: "paper", x: 41, y: 86, name: "IOU note" },
    ],
  },
};

/** The kit a case is drawn with in 3D: its own, or its drawn scene's 3D layout. */
const LOOK_OF_CITY: Record<CityId, Look> = {
  lagos: "lagos",
  abuja: "capital",
  kano: "sahel",
  ilorin: "sahel",
  ibadan: "brownroof",
  abeokuta: "brownroof",
  benin: "south",
  portharcourt: "south",
  aba: "south",
  enugu: "south",
  kaduna: "sahel",
  katsina: "sahel",
  gusau: "sahel",
  birninkebbi: "sahel",
  sokoto: "sahel",
  bauchi: "sahel",
  gombe: "sahel",
  maiduguri: "sahel",
  damaturu: "sahel",
  dutse: "sahel",
  makurdi: "brownroof",
  lokoja: "brownroof",
  lafia: "brownroof",
  minna: "sahel",
  jos: "brownroof",
  yola: "sahel",
  jalingo: "brownroof",
  onitsha: "south",
  owerri: "south",
  warri: "south",
  yenagoa: "south",
  uyo: "south",
  calabar: "south",
  abakaliki: "south",
  adoekiti: "brownroof",
  akure: "brownroof",
  osogbo: "brownroof",
};
const NORTHERN = /Kano|Kaduna|Katsina|Sokoto|Kebbi|Zamfara|Jigawa|Bauchi|Gombe|Borno|Yobe|Adamawa|Niger|Kwara|Plateau|Nasarawa|Taraba/;

/** The region's architecture for a case's streets. */
export function lookOf(c: CrimeCase): Look {
  const city = cityOf(c);
  if (city) return LOOK_OF_CITY[city];
  return NORTHERN.test(regionOf(c).state) ? "sahel" : "south";
}

export function kitOf(c: CrimeCase): KitScene {
  const kit = c.kit ?? SCENE_KITS[sceneOf(c)];
  return { ...kit, look: kit.look ?? lookOf(c), city: kit.city ?? cityOf(c) ?? undefined };
}
