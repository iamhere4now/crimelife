/**
 * Approved player posters, ready for the 3D scenes. The app feeds the live
 * list in with `setLiveAds`; billboards, sign boards and wall posters ask for
 * one with `adFor`, which prefers posters for the scene's city, then
 * nationwide ones, and otherwise shows an "Advertise here" poster.
 */

import { countView } from "@/lib/board";
import * as THREE from "three";
import type { AdPlacement, LiveAd } from "@/lib/ads";

let live: LiveAd[] = [];
// a sponsored hunt's poster takes every slot of its size while its scene is open
let sponsor: { id: string; image: string; placement: AdPlacement } | null = null;

/** Put a sponsor's poster on every matching board in the next scene built (null to stop). */
export function setSponsor(s: { id: string; image: string; placement: AdPlacement } | null) {
  sponsor = s;
}
// which slot of each kind the scene being built is filling, so posters spread across its boards
let sceneSeed = 0;
const slotNo: Record<string, number> = {};

/** Called as each scene starts building: its boards are then filled in order. */
export function startAdScene(seed: number) {
  sceneSeed = seed;
  for (const k of Object.keys(slotNo)) delete slotNo[k];
}
const textures = new Map<string, THREE.Texture>();

export function setLiveAds(ads: LiveAd[]) {
  live = ads;
}

function imageTexture(id: string, src: string) {
  const hit = textures.get(id);
  if (hit) return hit;
  const t = new THREE.Texture();
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  // so a tap on the poster knows which advert it is
  t.userData.ad = id;
  if (typeof Image !== "undefined") {
    const img = new Image();
    img.onload = () => {
      t.image = img;
      t.needsUpdate = true;
    };
    img.src = src;
  }
  textures.set(id, t);
  return t;
}

const HOUSE_SIZE: Record<AdPlacement, [number, number]> = { billboard: [512, 217], signboard: [450, 300], banner: [600, 150], poster: [300, 400] };

/** "Your business here", in the shape of the slot. */
function houseAd(placement: AdPlacement) {
  const key = `house|${placement}`;
  const hit = textures.get(key);
  if (hit) return hit;
  const [w, h] = HOUSE_SIZE[placement];
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#14161b";
    ctx.fillRect(0, 0, w, h);
    const bar = Math.max(8, h * 0.045);
    ctx.fillStyle = "#53FC18";
    ctx.fillRect(0, 0, w, bar);
    ctx.fillRect(0, h - bar, w, bar);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lines: [string, string, number][] =
      placement === "poster"
        ? [["YOUR", "#ffffff", 40], ["POSTER", "#ffffff", 40], ["HERE", "#ffffff", 40], ["Advertise on", "#53FC18", 22], ["Naija Detective", "#53FC18", 22], ["Profile › Advertise", "#c9ccd0", 17]]
        : placement === "banner"
          ? [["YOUR BANNER HERE  •  Advertise on Naija Detective", "#ffffff", 30]]
          : [["YOUR BUSINESS HERE", "#ffffff", placement === "billboard" ? 46 : 40], ["Advertise on Naija Detective", "#53FC18", 24], ["Profile  ›  Advertise", "#c9ccd0", 18]];
    const total = lines.reduce((n, [, , size]) => n + size * 1.25, 0);
    let y = h / 2 - total / 2;
    for (const [text, colour, size] of lines) {
      ctx.fillStyle = colour;
      ctx.font = `${size > 30 ? 900 : 700} ${size}px Inter, Arial, sans-serif`;
      y += size * 0.625;
      ctx.fillText(text, w / 2, y, w - 30);
      y += size * 0.625;
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  // a tap on an empty slot opens the Advertise form
  t.userData.house = true;
  textures.set(key, t);
  return t;
}

const STREET_BANNERS = [
  { bg: "#f5c518", fg: "#7a1f6a", text: "HAPPY 50TH BIRTHDAY MAMA! WE LOVE YOU" },
  { bg: "#1d4a8a", fg: "#ffffff", text: "CONGRATULATIONS BARR. TOLU ON YOUR CALL TO BAR" },
  { bg: "#14161b", fg: "#f5c518", text: "CELEBRATION OF LIFE: PA ADEBAYO (1938–2026)" },
  { bg: "#c0182b", fg: "#ffffff", text: "GRAND CRUSADE • THIS SUNDAY • ALL ARE WELCOME" },
];

/** An ordinary street banner (a birthday, a call to bar, a burial), for banner slots nobody has bought. */
function localBanner(seed: number) {
  const k = Math.abs(seed) % STREET_BANNERS.length;
  const key = `localbanner|${k}`;
  const hit = textures.get(key);
  if (hit) return hit;
  const b = STREET_BANNERS[k];
  const c = document.createElement("canvas");
  c.width = 600;
  c.height = 150;
  const ctx = c.getContext("2d");
  if (ctx) {
    ctx.fillStyle = b.bg;
    ctx.fillRect(0, 0, 600, 150);
    ctx.fillStyle = b.fg;
    ctx.fillRect(0, 10, 600, 4);
    ctx.fillRect(0, 136, 600, 4);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 34px Inter, Arial, sans-serif";
    ctx.fillText(b.text, 300, 76, 570);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  textures.set(key, t);
  return t;
}

const LOCAL = [
  { bg: "#7a1f6a", fg: "#ffffff", accent: "#f5c518", lines: ["HOLY GHOST", "CRUSADE", "THIS FRIDAY", "ALL ARE WELCOME"] },
  { bg: "#f5c518", fg: "#14161b", accent: "#c0182b", lines: ["LAUGH", "WELL WELL!", "COMEDY NIGHT", "GATE: N2,000"] },
  { bg: "#1d4a8a", fg: "#ffffff", accent: "#53FC18", lines: ["WAEC/JAMB", "LESSONS", "ENROL NOW", "CALL 0803 000 0000"] },
  { bg: "#c0182b", fg: "#ffffff", accent: "#f5c518", lines: ["GRAND", "OPENING", "MAMA T", "PROVISIONS"] },
  { bg: "#1d6a3a", fg: "#ffffff", accent: "#f5c518", lines: ["LEARN", "TAILORING", "6 MONTHS", "CERTIFICATE"] },
  { bg: "#14161b", fg: "#f5c518", accent: "#ffffff", lines: ["OWAMBE", "DJ NIGHT", "SATURDAY", "COME AND ENJOY"] },
];

/** An ordinary street poster (a crusade, a comedy show, a lesson centre), for slots nobody has bought. */
function localPoster(seed: number) {
  const k = Math.abs(seed) % LOCAL.length;
  const key = `local|${k}`;
  const hit = textures.get(key);
  if (hit) return hit;
  const p = LOCAL[k];
  const c = document.createElement("canvas");
  c.width = 300;
  c.height = 400;
  const ctx = c.getContext("2d");
  if (ctx) {
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, 300, 400);
    ctx.fillStyle = p.accent;
    ctx.fillRect(0, 300, 300, 100);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    p.lines.forEach((line, i) => {
      ctx.fillStyle = i === 3 ? p.bg : i === 2 ? p.accent : p.fg;
      ctx.font = `900 ${i < 2 ? 44 : 26}px Inter, Arial, sans-serif`;
      ctx.fillText(line, 150, [80, 140, 230, 350][i], 280);
    });
    // a bit of weather on the paper
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    for (let i = 0; i < 8; i++) ctx.fillRect(((i * 97) % 280) + 5, ((i * 53) % 380) + 5, 30, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  textures.set(key, t);
  return t;
}

/**
 * The poster for one slot. `seed` spreads different posters across slots and
 * scenes; `fallback` says what an empty slot shows: the "Advertise here"
 * poster, an ordinary street poster, or nothing (null: keep its own art).
 */
export function adFor(placement: AdPlacement, city: string | undefined, seed: number, fallback: "house" | "local" | "none"): THREE.Texture | null {
  if (sponsor && sponsor.placement === placement) return imageTexture(sponsor.id, sponsor.image);
  const now = Date.now();
  const fit = live.filter((a) => a.placement === placement && a.end > now && (a.city === "all" || a.city === city));
  if (fit.length) {
    // each poster appears as many times as the boards bought; the city's own posters first
    const ordered = [...fit].sort((a, b) => Number(b.city === city) - Number(a.city === city) || a.id.localeCompare(b.id));
    const pool = ordered.flatMap((a) => Array.from({ length: Math.max(1, a.count || 1) }, () => a));
    const n = slotNo[placement] ?? 0;
    slotNo[placement] = n + 1;
    const ad = pool[(Math.abs(sceneSeed) + n) % pool.length];
    void seed;
    countView(ad.id);
    return imageTexture(ad.id, ad.image);
  }
  if (fallback === "house") return houseAd(placement);
  if (fallback === "local" && placement === "poster") return localPoster(seed);
  if (fallback === "local" && placement === "banner") return localBanner(seed);
  return null;
}

/** Which advert (or "advertise here" slot) a mesh shows, if any. */
export function adOfMesh(o: THREE.Object3D): { ad?: string; house?: boolean } | null {
  const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
  const map = m && !Array.isArray(m) ? m.map : null;
  if (!map) return null;
  if (map.userData.ad) return { ad: map.userData.ad as string };
  if (map.userData.house) return { house: true };
  return null;
}

/** Ask the app to show an advert's details (or the Advertise form). */
export function openAd(hit: { ad?: string; house?: boolean }) {
  window.dispatchEvent(new CustomEvent("nd:ad", { detail: hit }));
}
