/**
 * Low-poly 3D world for the crime scenes, in the spirit of 3rd Mainland Biker:
 * flat-shaded primitives, soft sky, fog for depth, warm lights.
 *
 * Every scene is laid out in the same 2D percentages the old SVG scenes used.
 * `placeAt` casts a ray from the default camera through that screen point, so
 * an object at (x%, y%) appears exactly there in the default view, but now has
 * real depth when you drag to look around.
 */

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { adFor, startAdScene } from "./adSlots";
import type { Decor, KitScene, Look } from "@/lib/types";

export const ASPECT = 360 / 400;
export const CAMERA_POS = new THREE.Vector3(0, 4.2, 11.5);
export const CAMERA_TARGET = new THREE.Vector3(0, 1.2, -1);
export const FOV = 48;

export function defaultCamera(aspect = ASPECT) {
  const cam = new THREE.PerspectiveCamera(FOV, aspect, 0.1, 200);
  cam.position.copy(CAMERA_POS);
  cam.lookAt(CAMERA_TARGET);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return cam;
}

/* ---------------------------------------------------------------- materials + primitives */

const mats = new Map<string, THREE.Material>();

export interface MatOpts {
  emissive?: string;
  emissiveIntensity?: number;
  metal?: number;
  rough?: number;
  opacity?: number;
  map?: THREE.Texture;
}

/** Smooth-shaded physical material, cached by its settings. */
export function mat(color: string, opts: MatOpts = {}) {
  const key = `${color}|${opts.emissive ?? ""}|${opts.emissiveIntensity ?? ""}|${opts.metal ?? ""}|${opts.rough ?? ""}|${opts.opacity ?? ""}|${opts.map?.uuid ?? ""}`;
  let m = mats.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: opts.rough ?? 0.86,
      metalness: opts.metal ?? 0,
      emissive: opts.emissive ? new THREE.Color(opts.emissive) : new THREE.Color(0),
      // glowing things go above 1 so the bloom pass picks them up
      emissiveIntensity: opts.emissiveIntensity ?? 1,
      transparent: opts.opacity !== undefined,
      opacity: opts.opacity ?? 1,
      map: opts.map ?? null,
    });
    mats.set(key, m);
  }
  return m;
}

function shadow<T extends THREE.Object3D>(o: T, cast = true, receive = true) {
  o.castShadow = cast;
  o.receiveShadow = receive;
  return o;
}

/** Box with softly rounded edges, its base at y. */
export function box(g: THREE.Object3D, w: number, h: number, d: number, color: string | THREE.Material, x = 0, y = 0, z = 0) {
  const small = Math.min(w, h, d);
  const geo = small > 0.05 ? new RoundedBoxGeometry(w, h, d, 2, Math.min(0.022, small * 0.12)) : new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(geo, typeof color === "string" ? mat(color) : color);
  m.position.set(x, y + h / 2, z);
  g.add(shadow(m));
  return m;
}

/** More segments than the old low-poly look, so round things read as round. */
function smooth(seg: number, r: number) {
  return seg < 8 ? (r > 0.06 ? 14 : 8) : Math.min(48, seg * 2);
}

/** Cylinder with its base at y. */
export function cyl(g: THREE.Object3D, rTop: number, rBot: number, h: number, color: string | THREE.Material, x = 0, y = 0, z = 0, seg = 10) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, smooth(seg, Math.max(rTop, rBot))), typeof color === "string" ? mat(color) : color);
  m.position.set(x, y + h / 2, z);
  g.add(shadow(m));
  return m;
}

export function sphere(g: THREE.Object3D, r: number, color: string | THREE.Material, x = 0, y = 0, z = 0, seg = 8) {
  const n = Math.max(16, seg * 2);
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, n, Math.round(n * 0.75)), typeof color === "string" ? mat(color) : color);
  m.position.set(x, y, z);
  g.add(shadow(m));
  return m;
}

export function cone(g: THREE.Object3D, r: number, h: number, color: string, x = 0, y = 0, z = 0, seg = 8) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, smooth(seg, r)), mat(color));
  m.position.set(x, y + h / 2, z);
  g.add(shadow(m));
  return m;
}

/** A capsule (rounded rod) centred at (x, y, z). */
export function capsule(g: THREE.Object3D, r: number, len: number, color: string | THREE.Material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 16), typeof color === "string" ? mat(color) : color);
  m.position.set(x, y, z);
  g.add(shadow(m));
  return m;
}

/* ---------------------------------------------------------------- text + canvas textures */

/**
 * Canvas textures, shared between scenes. Kept to the most recently used
 * TEX_LIMIT: older ones are freed (a scene still using one just uploads it
 * again), so walking through 120 scenes doesn't fill a phone's memory.
 */
const TEX_LIMIT = 140;
const texStore = new Map<string, THREE.Texture>();
const texCache = {
  get(key: string) {
    const t = texStore.get(key);
    if (t) {
      texStore.delete(key);
      texStore.set(key, t);
    }
    return t;
  },
  set(key: string, t: THREE.Texture) {
    texStore.set(key, t);
    while (texStore.size > TEX_LIMIT) {
      const [oldKey, old] = texStore.entries().next().value as [string, THREE.Texture];
      texStore.delete(oldKey);
      old.dispose();
    }
  },
};

export function textTexture(text: string, fg: string, bg: string, w = 512, h = 128, font = "900 64px Inter, Arial, sans-serif") {
  const key = `${text}|${fg}|${bg}|${w}|${h}|${font}`;
  const cached = texCache.get(key);
  if (cached) return cached;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = fg;
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let size = parseInt(font.match(/(\d+)px/)?.[1] ?? "64", 10);
  while (ctx.measureText(text).width > w * 0.9 && size > 12) {
    size -= 4;
    ctx.font = font.replace(/\d+px/, `${size}px`);
  }
  ctx.shadowColor = fg;
  ctx.shadowBlur = bg === "transparent" ? 0 : 12;
  ctx.fillText(text, w / 2, h / 2 + 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  texCache.set(key, t);
  return t;
}

/** A flat panel showing text, facing +z, centred at (x, y, z). */
export function textPanel(g: THREE.Object3D, text: string, w: number, h: number, fg: string, bg: string, x = 0, y = 0, z = 0, glow = false) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    glow
      ? new THREE.MeshBasicMaterial({ map: textTexture(text, fg, bg, 512, Math.round((512 * h) / w)) })
      : new THREE.MeshStandardMaterial({ map: textTexture(text, fg, bg, 512, Math.round((512 * h) / w)), roughness: 0.8 }),
  );
  m.position.set(x, y, z);
  g.add(m);
  return m;
}

function gradientTexture(top: string, bottom: string) {
  const key = `grad|${top}|${bottom}`;
  const cached = texCache.get(key);
  if (cached) return cached;
  const c = document.createElement("canvas");
  c.width = 2;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  const gr = ctx.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, top);
  gr.addColorStop(1, bottom);
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, 2, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, t);
  return t;
}

/* ---------------------------------------------------------------- surface textures */

export type SurfaceKind = "planks" | "tiles" | "asphalt" | "dirt" | "sand" | "grass" | "concrete" | "plaster" | "brick";

function shade(color: string, l: number) {
  return new THREE.Color(color).offsetHSL(0, 0, l).getStyle();
}

/** A repeating, hand-made-looking surface painted on a canvas: planks, tiles, asphalt... */
export function surfaceTexture(kind: SurfaceKind, color: string, repeat: [number, number]) {
  const key = `surf|${kind}|${color}|${repeat.join("x")}`;
  const cached = texCache.get(key);
  if (cached) return cached;
  const S = 256;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const ctx = c.getContext("2d")!;
  let seed = kind.length * 977 + color.length * 31;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, S, S);
  const speckle = (n: number, size: number, spread: number) => {
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = shade(color, (rnd() - 0.5) * spread);
      ctx.globalAlpha = 0.35 + rnd() * 0.4;
      ctx.fillRect(rnd() * S, rnd() * S, size * (0.5 + rnd()), size * (0.5 + rnd()));
    }
    ctx.globalAlpha = 1;
  };
  if (kind === "planks") {
    const rows = 8;
    for (let r = 0; r < rows; r++) {
      const y = (r * S) / rows;
      ctx.fillStyle = shade(color, (rnd() - 0.5) * 0.08);
      ctx.fillRect(0, y, S, S / rows);
      for (let k = 0; k < 6; k++) {
        ctx.strokeStyle = shade(color, -0.06 - rnd() * 0.05);
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        const gy = y + rnd() * (S / rows);
        ctx.moveTo(0, gy);
        ctx.bezierCurveTo(S * 0.3, gy + 2, S * 0.6, gy - 2, S, gy + 1);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = shade(color, -0.2);
      ctx.fillRect(0, y, S, 2);
      ctx.fillRect(((r * 97) % S) | 0, y, 2, S / rows);
    }
  } else if (kind === "tiles") {
    const n = 4;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        ctx.fillStyle = shade(color, (rnd() - 0.5) * 0.06);
        ctx.fillRect((i * S) / n, (j * S) / n, S / n, S / n);
      }
    speckle(500, 2, 0.08);
    ctx.fillStyle = shade(color, -0.15);
    for (let i = 0; i <= n; i++) {
      ctx.fillRect((i * S) / n - 1.5, 0, 3, S);
      ctx.fillRect(0, (i * S) / n - 1.5, S, 3);
    }
  } else if (kind === "asphalt") {
    speckle(4000, 1.6, 0.25);
    ctx.strokeStyle = shade(color, -0.12);
    ctx.globalAlpha = 0.6;
    for (let k = 0; k < 4; k++) {
      ctx.beginPath();
      let x = rnd() * S;
      let y = rnd() * S;
      ctx.moveTo(x, y);
      for (let i = 0; i < 6; i++) ctx.lineTo((x += (rnd() - 0.5) * 40), (y += (rnd() - 0.5) * 40));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else if (kind === "dirt" || kind === "sand") {
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = shade(color, (rnd() - 0.5) * (kind === "dirt" ? 0.14 : 0.06));
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(rnd() * S, rnd() * S, 10 + rnd() * 30, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    speckle(kind === "dirt" ? 1500 : 3000, kind === "dirt" ? 2.5 : 1.2, 0.3);
  } else if (kind === "grass") {
    speckle(600, 4, 0.1);
    for (let i = 0; i < 2500; i++) {
      ctx.strokeStyle = shade(color, (rnd() - 0.4) * 0.22);
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      const x = rnd() * S;
      const y = rnd() * S;
      ctx.moveTo(x, y);
      ctx.lineTo(x + (rnd() - 0.5) * 3, y - 3 - rnd() * 5);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else if (kind === "concrete") {
    speckle(2500, 1.5, 0.15);
    ctx.fillStyle = shade(color, -0.12);
    ctx.fillRect(0, S / 2 - 1, S, 2);
    ctx.fillRect(S / 2 - 1, 0, 2, S);
  } else if (kind === "plaster") {
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = shade(color, (rnd() - 0.5) * 0.06);
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(rnd() * S, rnd() * S, 15 + rnd() * 40, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    speckle(700, 1.2, 0.08);
  } else if (kind === "brick") {
    const bh = 22;
    const bw = 56;
    ctx.fillStyle = shade(color, 0.12);
    ctx.fillRect(0, 0, S, S);
    for (let r = 0; r * bh < S; r++)
      for (let k = -1; k * bw < S; k++) {
        ctx.fillStyle = shade(color, (rnd() - 0.5) * 0.12);
        ctx.fillRect(k * bw + (r % 2 ? bw / 2 : 0) + 2, r * bh + 2, bw - 4, bh - 4);
      }
    speckle(800, 1.5, 0.15);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  texCache.set(key, t);
  return t;
}

/** A material whose colour comes from a surface texture. */
export function surfaceMat(kind: SurfaceKind, color: string, repeat: [number, number], rough = 0.85) {
  return mat("#ffffff", { map: surfaceTexture(kind, color, repeat), rough });
}

function isWarm(color: string) {
  const c = new THREE.Color(color);
  return c.r > c.b * 1.15;
}

/* ---------------------------------------------------------------- placement */

export type Surface = "floor" | "wall";

export function backZ(kit: KitScene) {
  return kit.backdrop.kind === "outdoor" ? -20 : -9;
}

/** Where the default camera sees the 2D point (x%, y%): on the floor, or on the back wall. */
export function placeAt(x: number, y: number, back: number): { point: THREE.Vector3; surface: Surface } {
  const cam = defaultCamera();
  const ndc = new THREE.Vector3(x / 50 - 1, 1 - y / 50, 0.5).unproject(cam);
  const dir = ndc.sub(cam.position).normalize();
  if (dir.y < -0.0001) {
    const t = -cam.position.y / dir.y;
    const p = cam.position.clone().addScaledVector(dir, t);
    if (p.z > back) return { point: p, surface: "floor" };
  }
  const t = (back - cam.position.z) / dir.z;
  const p = cam.position.clone().addScaledVector(dir, t);
  p.y = Math.max(p.y, 0.2);
  return { point: p, surface: "wall" };
}

/* ---------------------------------------------------------------- backdrops */

// Soft, warm, matte light in the spirit of Danfo Run: a gradient sky, gentle sun,
// a coloured sky/ground fill, and fog that only touches the far distance.
const SKIES = {
  day: { top: "#4f9fe0", bottom: "#d6e9f4", fog: "#d2e2ea", sun: "#fff0d8", sunI: 2.4, sky: "#d8ecff", ground: "#9a8a72", hemi: 1.15, env: 0.25 },
  dawn: { top: "#4b5a98", bottom: "#f3c29c", fog: "#d8b8a4", sun: "#ffd2a4", sunI: 2.0, sky: "#f4d4bc", ground: "#6e5e54", hemi: 1.0, env: 0.22 },
  dusk: { top: "#2e2b60", bottom: "#e49a74", fog: "#a8849a", sun: "#ffb98a", sunI: 1.8, sky: "#d0aac8", ground: "#5e4e56", hemi: 1.0, env: 0.2 },
  night: { top: "#161c44", bottom: "#4c3d72", fog: "#352f58", sun: "#b4c0ff", sunI: 0.9, sky: "#7a78b8", ground: "#2e2c3e", hemi: 1.05, env: 0.14 },
};

// red laterite in the south, pale sand in the north
const DIRT: Record<Look, string> = { lagos: "#a87a52", sahel: "#c9a06a", capital: "#a88a62", brownroof: "#9a6a48", south: "#a8553a" };

const GROUND = { dirt: "#a87a52", sand: "#dcc292", grass: "#6a9a4a", road: "#45474c", concrete: "#9a9a96", rails: "#7a6a52", deck: "#c79b6b" };

export interface Built {
  scene: THREE.Scene;
  /** Things to animate each frame. */
  tickers: ((t: number) => void)[];
}

/** A tiny deterministic random generator, so a scene looks the same every time. */
function rng(seed: number) {
  let s = (seed * 9301 + 49297) % 233280 || 1;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

function seedOf(kit: KitScene) {
  let h = 7;
  for (const p of kit.props) h = (h * 31 + p.x * 7 + p.y * 13 + p.kind.length) % 100000;
  return h;
}

export function buildBackdrop(kit: KitScene): Built {
  const scene = new THREE.Scene();
  const tickers: Built["tickers"] = [];
  const b = kit.backdrop;
  const rand = rng(seedOf(kit));
  LOOK = kit.look ?? "lagos";
  CITY = kit.city;
  startAdScene(seedOf(kit));

  if (b.kind === "indoor") {
    room(scene, b, tickers, rand);
  } else {
    const night = b.kind === "alley" || b.sky === "night";
    const sky = SKIES[b.kind === "alley" ? "night" : b.sky];
    scene.background = gradientTexture(sky.top, sky.bottom);
    const onBridge = b.kind === "outdoor" && b.horizon === "mainland";
    const haze = LOOK === "sahel" && b.kind === "outdoor" && b.sky !== "night";
    scene.fog = haze
      ? new THREE.Fog("#e2cfae", 34, 130)
      : new THREE.Fog(sky.fog, b.kind === "alley" ? 30 : onBridge ? 60 : 48, b.kind === "alley" ? 90 : onBridge ? 195 : 160);
    if (haze) scene.background = gradientTexture("#c8c4b4", "#ead8b8");
    if (!onBridge) {
      const groundColor = b.ground === "dirt" ? DIRT[LOOK] : GROUND[b.ground];
      const surface: Record<string, SurfaceKind> = { dirt: "dirt", sand: "sand", grass: "grass", road: "asphalt", concrete: "concrete", rails: "dirt", deck: "planks" };
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(160, 160),
        surfaceMat(surface[b.ground], groundColor, [44, 44], b.ground === "road" ? (night ? 0.55 : 0.85) : 0.95),
      );
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);
      if (b.kind !== "alley") groundDetails(scene, b.ground, rand);
    }

    scene.add(new THREE.HemisphereLight(sky.sky, sky.ground, sky.hemi));
    scene.userData.envIntensity = sky.env;
    const sun = new THREE.DirectionalLight(sky.sun, sky.sunI);
    sun.position.set(-9, 16, 8);
    sun.target.position.set(0, 0, -4);
    enableShadow(sun, 18);
    scene.add(sun, sun.target);
    if (night) stars(scene);
    else clouds(scene, rand, b.kind === "outdoor" ? b.sky : "day");
    const orb = new THREE.Mesh(new THREE.SphereGeometry(night ? 2.2 : 3.4, 24, 16), new THREE.MeshBasicMaterial({ color: night ? "#f5f0d8" : "#fff6d0", fog: false }));
    orb.position.set(24, b.kind !== "alley" && (b.sky === "dusk" || b.sky === "dawn") ? 8 : 26, -95);
    scene.add(orb);

    if (b.kind === "alley") alley(scene, b.wall, tickers, rand);
    else if (onBridge) mainland(scene, night, tickers, rand);
    else horizon(scene, b.horizon ?? "none", night, tickers, rand);
  }
  return { scene, tickers };
}

function enableShadow(l: THREE.DirectionalLight, size: number) {
  l.castShadow = true;
  l.shadow.mapSize.set(2048, 2048);
  l.shadow.camera.left = -size;
  l.shadow.camera.right = size;
  l.shadow.camera.top = size;
  l.shadow.camera.bottom = -size;
  l.shadow.camera.far = 70;
  l.shadow.bias = -0.0005;
  l.shadow.normalBias = 0.03;
}

/* ---------------------------------------------------------------- rooms */

/**
 * A room in one of several styles, so an office, a recording studio, a
 * warehouse, an event hall, a shop and a luxury flat each look like themselves.
 */
function room(scene: THREE.Scene, b: Extract<KitScene["backdrop"], { kind: "indoor" }>, tickers: Built["tickers"], rand: () => number) {
  const decor: Decor = b.decor ?? "office";
  scene.background = new THREE.Color(b.wall).multiplyScalar(0.55);
  const floorKind: SurfaceKind = decor === "warehouse" ? "concrete" : isWarm(b.floor) ? "planks" : "tiles";
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), surfaceMat(floorKind, b.floor, decor === "luxury" ? [4, 4] : [7, 7], decor === "luxury" ? 0.25 : isWarm(b.floor) ? 0.7 : 0.45));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, 3);
  floor.receiveShadow = true;
  scene.add(floor);

  // the walls
  const lower = new THREE.Color(b.trim ?? b.wall).lerp(new THREE.Color(b.wall), 0.35).multiplyScalar(0.8).getStyle();
  const wallMap = (side: boolean): THREE.Texture => {
    const tone = side ? new THREE.Color(b.wall).multiplyScalar(0.92).getStyle() : b.wall;
    if (decor === "luxury") return surfaceTexture("plaster", tone, [4, 2]);
    if (decor === "warehouse") return surfaceTexture("brick", tone, [6, 3]);
    if (decor === "studio") return foamTexture(tone);
    if (decor === "hall") return drapeTexture(tone, b.trim ?? "#c9a34a");
    if (decor === "shop") return tileWallTexture(tone);
    return dadoTexture(tone, lower, [3, 1]);
  };
  const back = new THREE.Mesh(new THREE.PlaneGeometry(26, 10), mat("#ffffff", { map: wallMap(false), rough: decor === "luxury" ? 0.6 : 0.95 }));
  back.position.set(0, 5, -9);
  back.receiveShadow = true;
  scene.add(back);
  for (const side of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(26, 10), mat("#ffffff", { map: wallMap(true), rough: decor === "luxury" ? 0.6 : 0.95 }));
    w.rotation.y = (-side * Math.PI) / 2;
    w.position.set(side * 11, 5, 3);
    w.receiveShadow = true;
    scene.add(w);
  }
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), mat(decor === "studio" ? "#1a1a22" : decor === "warehouse" ? "#6a6e72" : "#e8e4dc", { rough: 1 }));
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, 9, 3);
  scene.add(ceil);
  box(scene, 22, 0.22, 0.06, b.trim ?? "#5a3a1a", 0, 0, -8.96);
  for (const side of [-1, 1]) {
    const sk = box(scene, 26, 0.22, 0.06, b.trim ?? "#5a3a1a", side * 10.96, 0, 3);
    sk.rotation.y = Math.PI / 2;
  }
  if (decor === "luxury") {
    // wainscot rail and crown moulding
    const trim = mat(b.trim ?? "#c9a34a", { rough: 0.5, metal: 0.2 });
    box(scene, 22, 0.08, 0.08, trim, 0, 1.1, -8.94);
    box(scene, 22, 0.25, 0.25, mat("#f4f0e6", { rough: 0.8 }), 0, 8.75, -8.88);
  }
  if (b.window && b.window !== "none") indoorWindow(scene, b.window, decor === "luxury" || decor === "studio");

  // the lights
  const lights: Record<Decor, () => void> = {
    office: () => tubes(scene, "#eef6ff"),
    shop: () => tubes(scene, "#f4fbff"),
    luxury: () => {
      // recessed warm downlights and two pendant lamps
      for (const x of [-6, -2, 2, 6])
        for (const z of [-5, 1]) {
          const d = new THREE.Mesh(new THREE.CircleGeometry(0.16, 20), new THREE.MeshBasicMaterial({ color: "#fff2d8" }));
          d.rotation.x = Math.PI / 2;
          d.position.set(x, 8.98, z);
          scene.add(d);
        }
      for (const x of [-4, 4]) {
        cyl(scene, 0.01, 0.01, 2.4, "#2b2f36", x, 6.6, -2, 4);
        const shadeMesh = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.5, 24, 1, true), mat(b.trim ?? "#c9a34a", { rough: 0.4, metal: 0.5 }));
        shadeMesh.position.set(x, 6.4, -2);
        scene.add(shadeMesh);
        const l = new THREE.PointLight("#ffd9a8", 34, 20, 1.4);
        l.position.set(x, 6.1, -2);
        scene.add(l);
      }
      const fill = new THREE.PointLight("#fff0dc", 26, 26, 1.4);
      fill.position.set(0, 8.4, 2);
      scene.add(fill);
    },
    studio: () => {
      // coloured LED strips along the walls
      for (const [y, c] of [[8.5, "#7a3aff"], [0.3, "#2a8aff"]] as const) {
        const strip = new THREE.Mesh(new THREE.BoxGeometry(22, 0.06, 0.06), new THREE.MeshBasicMaterial({ color: c }));
        strip.position.set(0, y, -8.85);
        scene.add(strip);
      }
      for (const [x, c] of [[-6, "#7a3aff"], [6, "#2a8aff"], [0, "#ff5ab4"]] as const) {
        const l = new THREE.PointLight(c, 30, 18, 1.4);
        l.position.set(x, 6, -4);
        scene.add(l);
      }
      const l = new THREE.PointLight("#fff4e6", 22, 22, 1.4);
      l.position.set(0, 8, 3);
      scene.add(l);
    },
    warehouse: () => {
      // industrial high-bay lamps, one flickering
      for (const [i, x] of [-6, 0, 6].entries()) {
        cyl(scene, 0.02, 0.02, 1.4, "#2b2f36", x, 7.6, -2, 4);
        const shadeMesh = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.6, 24, 1, true), mat("#5a6068", { metal: 0.6, rough: 0.4 }));
        shadeMesh.position.set(x, 7.3, -2);
        scene.add(shadeMesh);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), new THREE.MeshBasicMaterial({ color: "#fff6e0" }));
        bulb.position.set(x, 7.05, -2);
        scene.add(bulb);
        const l = new THREE.PointLight("#fff2dc", 38, 22, 1.4);
        l.position.set(x, 6.8, -2);
        scene.add(l);
        if (i === 2) tickers.push((t) => (l.intensity = Math.sin(t * 23) > 0.96 || Math.sin(t * 3.1) > 0.995 ? 6 : 38));
      }
      // a roller shutter on the back wall
      const shutter = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.6), mat("#ffffff", { map: shutterTexture(), rough: 0.6, metal: 0.4 }));
      shutter.position.set(6.6, 2.3, -8.94);
      scene.add(shutter);
    },
    hall: () => {
      // strings of fairy lights across the ceiling, twinkling, and coloured uplights
      const bulbs: THREE.MeshBasicMaterial[] = [];
      for (let k = 0; k < 4; k++) {
        const z = -7 + k * 3.4;
        for (let i = 0; i <= 18; i++) {
          const x = -10 + (i * 20) / 18;
          const y = 8.6 - Math.sin((i / 18) * Math.PI) * 0.9;
          const m = new THREE.MeshBasicMaterial({ color: "#ffe2a0" });
          const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), m);
          bulb.position.set(x, y, z);
          scene.add(bulb);
          bulbs.push(m);
        }
      }
      tickers.push((t) => bulbs.forEach((m, i) => m.color.setScalar(0.65 + 0.35 * Math.max(0, Math.sin(t * 2 + i * 1.7)))));
      for (const [x, c] of [[-9, "#ff5ab4"], [9, "#7a3aff"], [0, "#ffb347"]] as const) {
        const l = new THREE.PointLight(c, 26, 16, 1.4);
        l.position.set(x, 1, -7.5);
        scene.add(l);
      }
      const l = new THREE.PointLight("#fff0dc", 34, 26, 1.4);
      l.position.set(0, 8, 1);
      scene.add(l);
    },
  };
  lights[decor]();

  // a ceiling fan in ordinary offices and shops
  if (decor === "office" || decor === "shop") {
    const fan = new THREE.Group();
    fan.position.set(-5, 8.2, 1);
    cyl(fan, 0.03, 0.03, 0.8, "#d8d8d0", 0, 0, 0, 8);
    cyl(fan, 0.18, 0.2, 0.18, "#e8e8e0", 0, -0.05, 0, 16);
    const blades = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const blade = box(blades, 1.4, 0.03, 0.22, "#f0ece0", 0.75, 0, 0);
      blade.position.x = 0.75;
      const arm = new THREE.Group();
      arm.add(blade);
      arm.rotation.y = (i * Math.PI * 2) / 3;
      blades.add(arm);
    }
    blades.position.y = 0.02;
    fan.add(blades);
    scene.add(fan);
    tickers.push((t) => (blades.rotation.y = t * 5));

    // a calendar on the side wall (seen when you turn)
    const cal = new THREE.Group();
    box(cal, 0.06, 1.6, 1.1, "#ffffff", 0, 0, 0);
    const calFace = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.5), new THREE.MeshStandardMaterial({ map: calendarTexture(), roughness: 0.9 }));
    calFace.rotation.y = Math.PI / 2;
    calFace.position.set(0.035, 0.8, 0);
    cal.add(calFace);
    cal.position.set(-10.95, 3.2, -2 + rand() * 3);
    scene.add(cal);
  }
  if (decor !== "studio" && decor !== "hall") {
    const clockG = new THREE.Group();
    const face = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.06, 32), mat("#f6f2e6"));
    face.rotation.z = Math.PI / 2;
    clockG.add(face);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.04, 8, 32), mat("#2b2f36"));
    rim.rotation.y = Math.PI / 2;
    clockG.add(rim);
    // the minute hand really goes round
    const hand = new THREE.Group();
    box(hand, 0.02, 0.36, 0.03, "#1a1a1a", -0.05, 0, 0);
    hand.position.set(-0.05, 0, 0);
    clockG.add(hand);
    clockG.position.set(10.95, 6, -1);
    scene.add(clockG);
    tickers.push((t) => (hand.rotation.x = -t * 0.05));
  }

  const hemi: Record<Decor, number> = { office: 1.2, shop: 1.25, luxury: 1.0, studio: 0.55, warehouse: 0.9, hall: 0.8 };
  scene.add(new THREE.HemisphereLight(decor === "warehouse" ? "#e8f0f6" : "#fff4e6", new THREE.Color(b.floor).multiplyScalar(0.9).getStyle(), hemi[decor]));
  scene.userData.envIntensity = decor === "luxury" ? 0.4 : 0.25;
  const key = new THREE.DirectionalLight("#fff1dc", decor === "studio" ? 0.6 : 1.3);
  key.position.set(5, 10, 9);
  key.target.position.set(0, 0, -2);
  enableShadow(key, 13);
  scene.add(key, key.target);
  scene.fog = new THREE.Fog(new THREE.Color(b.wall).multiplyScalar(0.55), 26, 44);
}

/** Fluorescent tubes, the light of every Nigerian office and shop. */
function tubes(scene: THREE.Scene, color: string) {
  for (const z of [-3.5, 3]) {
    box(scene, 2.4, 0.08, 0.32, "#d8dde0", 0, 8.86, z);
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 12), new THREE.MeshBasicMaterial({ color: "#f4fbff" }));
    tube.rotation.z = Math.PI / 2;
    tube.position.set(0, 8.78, z);
    scene.add(tube);
    const l = new THREE.PointLight(color, 40, 24, 1.4);
    l.position.set(0, 8.2, z);
    scene.add(l);
  }
}

function canvasTex(key: string, w: number, h: number, repeat: [number, number], draw: (ctx: CanvasRenderingContext2D) => void) {
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  texCache.set(key, t);
  return t;
}

/** Acoustic foam panels: a checkerboard of wedges. */
function foamTexture(color: string) {
  return canvasTex(`foam|${color}`, 128, 128, [10, 4], (ctx) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 128, 128);
    for (let r = 0; r < 4; r++)
      for (let k = 0; k < 4; k++) {
        const vertical = (r + k) % 2 === 0;
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = i % 2 ? shade(color, -0.08) : shade(color, 0.05);
          if (vertical) ctx.fillRect(k * 32 + i * 8, r * 32, 8, 32);
          else ctx.fillRect(k * 32, r * 32 + i * 8, 32, 8);
        }
        ctx.strokeStyle = shade(color, -0.15);
        ctx.strokeRect(k * 32, r * 32, 32, 32);
      }
  });
}

/** Draped fabric on the walls of an event hall, with gold swags. */
function drapeTexture(color: string, accent: string) {
  return canvasTex(`drape|${color}|${accent}`, 256, 256, [5, 1], (ctx) => {
    for (let x = 0; x < 256; x++) {
      const v = Math.sin((x / 256) * Math.PI * 8);
      ctx.fillStyle = shade(color, v * 0.1);
      ctx.fillRect(x, 0, 1, 256);
    }
    ctx.strokeStyle = accent;
    ctx.lineWidth = 6;
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 128, 20);
      ctx.quadraticCurveTo(i * 128 + 64, 70, i * 128 + 128, 20);
      ctx.stroke();
    }
  });
}

/** White tiles up to shoulder height, paint above: a shop or bakery wall. */
function tileWallTexture(color: string) {
  return canvasTex(`tilewall|${color}`, 256, 256, [6, 1], (ctx) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = "#f2f2ee";
    ctx.fillRect(0, 140, 256, 116);
    ctx.fillStyle = "#c9cdd0";
    for (let x = 0; x <= 256; x += 32) ctx.fillRect(x, 140, 2, 116);
    for (let y = 140; y <= 256; y += 29) ctx.fillRect(0, y, 256, 2);
    ctx.fillStyle = "#1d4a8a";
    ctx.fillRect(0, 134, 256, 6);
  });
}

function shutterTexture() {
  return canvasTex("shutter", 128, 128, [1, 1], (ctx) => {
    ctx.fillStyle = "#9aa0a6";
    ctx.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 6) {
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillRect(0, y, 128, 2);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(0, y + 3, 128, 1.5);
    }
    ctx.fillStyle = "#f5c518";
    ctx.fillRect(0, 118, 128, 10);
    ctx.fillStyle = "#141414";
    for (let x = 0; x < 128; x += 16) ctx.fillRect(x, 118, 8, 10);
  });
}

function indoorWindow(scene: THREE.Scene, view: "city-night" | "city-day" | "sea" | "hills", smart = false) {
  const frame = mat("#e8e4dc", { rough: 0.7 });
  box(scene, 7.4, 0.22, 0.3, frame, 0, 1.9, -8.85);
  box(scene, 7.4, 0.22, 0.3, frame, 0, 6.35, -8.85);
  box(scene, 0.22, 4.6, 0.3, frame, -3.6, 1.9, -8.85);
  box(scene, 0.22, 4.6, 0.3, frame, 3.6, 1.9, -8.85);
  box(scene, 0.12, 4.3, 0.2, frame, 0, 2.1, -8.85);
  if (!smart) {
    // burglar-proof bars
    const bars = mat("#2b2f36", { metal: 0.5, rough: 0.5 });
    for (let i = -3; i <= 3; i++) box(scene, 0.05, 4.3, 0.05, bars, i * 0.95, 2.1, -8.7);
    for (const y of [3.3, 4.7]) box(scene, 7, 0.05, 0.05, bars, 0, y, -8.7);
  }
  // curtains: heavy in ordinary rooms, light and sheer in smart ones
  for (const side of [-1, 1]) {
    const c = box(scene, 1.2, 4.9, 0.08, mat(smart ? "#f2ece0" : "#8a2a3a", { rough: 1, opacity: smart ? 0.85 : undefined }), side * 4.2, 1.7, -8.6);
    c.scale.z = 1;
  }
  const night = view === "city-night";
  const pane = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 4.4),
    new THREE.MeshBasicMaterial({ map: view.startsWith("city") ? windowViewTexture(night) : gradientTexture(view === "sea" ? "#6fb4e0" : "#8fc4ee", view === "sea" ? "#1d6a9a" : "#5a9a4a") }),
  );
  pane.position.set(0, 4.15, -8.96);
  scene.add(pane);
}

/* ---------------------------------------------------------------- ground + sky */

function groundDetails(scene: THREE.Scene, ground: keyof typeof GROUND, rand: () => number) {
  if (ground === "road" && LOOK === "capital") {
    // a well-kept road: centre dashes and edge lines
    const paint = mat("#f2efe2", { rough: 0.8 });
    for (let i = -14; i <= 14; i++) box(scene, 2, 0.015, 0.22, paint, i * 4, 0, -4.5);
    for (const z of [3.2, -12.5]) box(scene, 120, 0.015, 0.2, mat("#f5c518", { rough: 0.8 }), 0, 0, z);
  } else if (ground === "road") {
    // paint worn to a few faded dashes, potholes and patches
    const paint = mat("#d8d4c8", { rough: 0.9, opacity: 0.55 });
    for (let i = -14; i <= 14; i++) if (rand() < 0.55) box(scene, 1.4 + rand(), 0.012, 0.18, paint, i * 4, 0, -4.5);
    roadWear(scene, rand);
  } else if (ground === "concrete" || ground === "dirt") roadWear(scene, rand);
  if (ground === "rails") {
    for (let i = 0; i < 34; i++) box(scene, 4.2, 0.12, 0.45, "#4a3424", 0, 0, 10 - i * 1.6);
    for (const x of [-1.4, 1.4]) box(scene, 0.16, 0.2, 70, mat("#9aa3ab", { metal: 0.7, rough: 0.4 }), x, 0.1, -18);
  }
  if (ground === "deck") {
    box(scene, 0.4, 1, 26, "#f2f2e8", -8.6, 0, -2);
    box(scene, 0.4, 1, 26, "#f2f2e8", 8.6, 0, -2);
    box(scene, 17, 1, 0.4, "#f2f2e8", 0, 0, -15);
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), mat("#1f6c98", { rough: 0.35 }));
    sea.rotation.x = -Math.PI / 2;
    sea.position.y = -1.5;
    scene.add(sea);
  }
}

function stars(scene: THREE.Scene) {
  const pts: number[] = [];
  for (let i = 0; i < 320; i++) {
    const a = Math.random() * Math.PI - Math.PI / 2;
    pts.push(Math.sin(a) * 110, 20 + Math.random() * 50, -60 - Math.random() * 40);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: "#ffffff", size: 0.35, fog: false, transparent: true, opacity: 0.85 })));
}

function clouds(scene: THREE.Scene, rand: () => number, sky: "day" | "dawn" | "dusk" | "night") {
  const tint = sky === "day" ? "#ffffff" : sky === "dusk" ? "#f2c4c0" : "#f6d8c4";
  const m = new THREE.MeshBasicMaterial({ color: tint, transparent: true, opacity: 0.85, fog: false });
  for (let i = 0; i < 9; i++) {
    const c = new THREE.Group();
    for (let k = 0; k < 5; k++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(3 + rand() * 3, 14, 10), m);
      puff.position.set(k * 4 - 8 + rand() * 2, rand() * 2, rand() * 2);
      puff.scale.y = 0.55;
      c.add(puff);
    }
    c.position.set(-110 + i * 28 + rand() * 10, 34 + rand() * 14, -120 - rand() * 30);
    scene.add(c);
  }
}

/* ---------------------------------------------------------------- the street behind the scene */

const PLASTER = ["#ead9b4", "#d9c39c", "#c7d3bc", "#cfd8df", "#e7c8a4", "#d7b7a0", "#bfcdae", "#e2d2be", "#c9b9cf", "#e4dcc4", "#cfe0d8"];
const SIGN_COLORS = [["#c0182b", "#ffffff"], ["#1d4a8a", "#ffffff"], ["#f5c518", "#141414"], ["#1d6a3a", "#ffffff"], ["#ffffff", "#c0182b"], ["#7a1f6a", "#ffffff"], ["#141414", "#f5c518"]];
const SHOPS = [
  "OLUWASEUN PAINTS", "MAMA T PROVISIONS", "GOD'S TIME BUSINESS CENTRE", "BLESSED PHONES", "JESUS IS LORD AUTOS", "ALHAJI SULE & SONS",
  "EXCEL PHARMACY", "DIVINE TOUCH SALON", "NO CONDITION IS PERMANENT", "CHOP LIFE RESTAURANT", "FAVOUR POS & CHARGING", "ADEX ELECTRICALS",
  "DEBORAH FASHION HOUSE", "SUPREME BUKKA", "GLORY PRINTING PRESS", "HAPPY DAYS SUPERMARKET", "IYA BASIRAT AMALA SPOT", "MIGHTY BUILDING MATERIALS",
  "BABA IJEBU", "OKEY SPARE PARTS", "EMEKA & BROS", "UNCLE JOE BARBING SALON", "TRUST GOD FABRICS", "KAMSI CHEMIST",
];

/* ---------------------------------------------------------------- regional looks */

/** Set by buildBackdrop: which part of Nigeria the street belongs to. */
let LOOK: Look = "lagos";
/** The city the scene is in, for city-targeted posters. */
let CITY: string | undefined;

const PALETTES: Record<Look, string[]> = {
  lagos: PLASTER,
  // sun-baked earth plaster of the north
  sahel: ["#c98a52", "#b97a46", "#d4a26a", "#c4925e", "#b3764a", "#d8b07a", "#c08050"],
  // clean modern paint and stone in the capital
  capital: ["#e8e6e0", "#d8dade", "#c9ccd0", "#efe9dc", "#dcd4c4"],
  // old, faded paint under rusty brown roofs
  brownroof: ["#d8c8a8", "#c9b48e", "#b9a888", "#cdbfa4", "#bfae94", "#d4c09a", "#c8b8a0"],
  // bright paint and balconies in the south and east
  south: ["#f0e2c0", "#e8d0d8", "#d0e4e8", "#f2d8a8", "#d8e8c8", "#e6d4f0", "#f4e8d0", "#cfe6f0"],
};

const SHOP_NAMES: Record<Look, string[]> = {
  lagos: SHOPS,
  sahel: ["ALHAJI SULE & SONS", "MAI SHAYI TEA SPOT", "DANLADI PROVISIONS", "KANTIN KWARI FABRICS", "BABA GANA SUYA", "AREWA PHONES", "MALLAM AUDU CHEMIST", "NASARA TRADING CO.", "SANNU SUPERMARKET", "DAN AZUMI TAILORING"],
  capital: ["MAITAMA SUITES", "GARKI PLAZA", "WUSE BUSINESS HUB", "CAPITAL MART", "UNITY PHARMACY", "FCT TECH CENTRE", "CENTRAL AREA LOUNGE", "ASO VIEW CAFE"],
  brownroof: ["IYA BASIRAT AMALA SPOT", "OLUWASEUN PAINTS", "GOD'S TIME BUSINESS CENTRE", "ADEX ELECTRICALS", "MOKOLA PROVISIONS", "BABA IJEBU", "ORE OFE FABRICS", "ALAAFIN CHEMIST", "OLUYOLE PRINTING PRESS"],
  south: ["OKEY SPARE PARTS", "EMEKA & BROS", "KAMSI CHEMIST", "OGA NNAMDI ELECTRONICS", "EBUBE FASHION", "GARDEN CITY PHONES", "OSAS BUKKA", "CHIDINMA SUPERMARKET", "NGOZI HAIR WORLD", "ONYEKA BUILDING MATERIALS"],
};

const lookBase = (seed: number) => PALETTES[LOOK][seed % PALETTES[LOOK].length];

/** Painted front of a building, in the style of the region: windows, a shop at street level, grime and rust. */
function facadeTextures(seed: number, w: number, h: number, night: boolean, shop: boolean) {
  const key = `facade|${LOOK}|${seed}|${w}|${h}|${night}|${shop}`;
  const hit = texCache.get(key);
  if (hit) return { map: hit, emissive: texCache.get(key + "|e") ?? null };
  const rand = rng(seed);
  const W = 256;
  const H = Math.min(1024, Math.round((W * h) / w));
  const floors = Math.max(1, Math.round(h / 3.2));
  const fh = H / floors;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const e = document.createElement("canvas");
  e.width = W;
  e.height = H;
  const ex = e.getContext("2d")!;
  ex.fillStyle = "#000";
  ex.fillRect(0, 0, W, H);
  const pal = PALETTES[LOOK];
  const base = pal[Math.floor(rand() * pal.length)];
  const glassTower = LOOK === "capital" && !shop && h > 9;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  if (glassTower) {
    // a glass curtain wall with a mullion grid
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#a9c8dc");
    g.addColorStop(0.5, "#5f84a0");
    g.addColorStop(1, "#86a8bf");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const cols = 8;
    const rows = floors * 2;
    for (let r = 0; r < rows; r++)
      for (let k = 0; k < cols; k++) {
        if (rand() < 0.18) {
          ctx.fillStyle = "rgba(255,255,255,0.12)";
          ctx.fillRect((k * W) / cols, (r * H) / rows, W / cols, H / rows);
        }
        if (night && rand() < 0.3) {
          ctx.fillStyle = "#ffe2a8";
          ctx.fillRect((k * W) / cols + 2, (r * H) / rows + 2, W / cols - 4, H / rows - 4);
          ex.fillStyle = "#ffd890";
          ex.fillRect((k * W) / cols + 2, (r * H) / rows + 2, W / cols - 4, H / rows - 4);
        }
      }
    ctx.fillStyle = "#d4dde3";
    for (let k = 0; k <= cols; k++) ctx.fillRect((k * W) / cols - 1.5, 0, 3, H);
    for (let r = 0; r <= rows; r++) ctx.fillRect(0, (r * H) / rows - 1.5, W, 3);
  } else {
    // weathering blotches (heavier on old buildings, none on new ones)
    const blotches = LOOK === "capital" ? 6 : LOOK === "brownroof" ? 40 : 26;
    for (let i = 0; i < blotches; i++) {
      ctx.fillStyle = shade(base, (rand() - 0.6) * (LOOK === "brownroof" ? 0.2 : 0.12));
      ctx.globalAlpha = LOOK === "brownroof" ? 0.45 : 0.35;
      ctx.beginPath();
      ctx.arc(rand() * W, rand() * H, 10 + rand() * 40, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // parapet, with rust streaks below it (not on the tidy capital buildings)
    ctx.fillStyle = shade(base, -0.12);
    ctx.fillRect(0, 0, W, 10);
    if (LOOK !== "capital")
      for (let i = 0; i < (LOOK === "brownroof" ? 22 : 14); i++) {
        const x = rand() * W;
        const g = ctx.createLinearGradient(0, 8, 0, 8 + 30 + rand() * 60);
        g.addColorStop(0, "rgba(110,60,30,0.45)");
        g.addColorStop(1, "rgba(110,60,30,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x, 8, 2 + rand() * 4, 90);
      }
    if (LOOK === "sahel") {
      // a band of raised geometric relief under the roof line
      ctx.strokeStyle = shade(base, 0.16);
      ctx.lineWidth = 3;
      for (let x = 0; x < W; x += 22) {
        ctx.beginPath();
        ctx.moveTo(x, 26);
        ctx.lineTo(x + 11, 14);
        ctx.lineTo(x + 22, 26);
        ctx.stroke();
      }
      ctx.fillStyle = shade(base, 0.12);
      ctx.fillRect(0, 30, W, 3);
    }
    // windows on the upper floors
    const n = Math.max(1, Math.round(w / (LOOK === "sahel" ? 3.2 : 2.4)));
    for (let f = shop ? 1 : 0; f < floors; f++) {
      const y0 = H - (f + 1) * fh;
      for (let i = 0; i < n; i++) {
        const cx = ((i + 0.5) * W) / n;
        const small = LOOK === "sahel" ? 0.6 : 1;
        const ww = Math.min((W / n) * 0.55, 60) * small;
        const wh = fh * 0.52 * small;
        const wx = cx - ww / 2;
        const wy = y0 + fh * (LOOK === "sahel" ? 0.3 : 0.2);
        const lit = night && rand() < 0.45;
        if (LOOK === "sahel") {
          // a small arched window with wooden shutters and a raised frame
          ctx.fillStyle = shade(base, 0.14);
          ctx.beginPath();
          ctx.moveTo(wx - 6, wy + wh + 6);
          ctx.lineTo(wx - 6, wy);
          ctx.arc(cx, wy, ww / 2 + 6, Math.PI, 0);
          ctx.lineTo(wx + ww + 6, wy + wh + 6);
          ctx.fill();
          ctx.fillStyle = lit ? "#ffd98a" : "#4a2e1a";
          ctx.beginPath();
          ctx.moveTo(wx, wy + wh);
          ctx.lineTo(wx, wy);
          ctx.arc(cx, wy, ww / 2, Math.PI, 0);
          ctx.lineTo(wx + ww, wy + wh);
          ctx.fill();
          if (!lit) {
            ctx.fillStyle = "rgba(0,0,0,0.35)";
            ctx.fillRect(cx - 1, wy - ww / 2, 2, wh + ww / 2);
          } else {
            ex.fillStyle = "#ffcf80";
            ex.fillRect(wx, wy, ww, wh);
          }
          continue;
        }
        ctx.fillStyle = shade(base, 0.12);
        ctx.fillRect(wx - 4, wy - 4, ww + 8, wh + 8);
        const glass = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh);
        glass.addColorStop(0, lit ? "#ffd98a" : LOOK === "capital" ? "#6f93ad" : "#2e3e4c");
        glass.addColorStop(1, lit ? "#f0a850" : LOOK === "capital" ? "#9dbbd0" : "#55707e");
        ctx.fillStyle = glass;
        ctx.fillRect(wx, wy, ww, wh);
        if (lit) {
          ex.fillStyle = "#ffcf80";
          ex.fillRect(wx, wy, ww, wh);
        }
        if (LOOK === "brownroof" && !lit) {
          // wooden louvre shutters, half open
          ctx.fillStyle = rand() < 0.5 ? "#3f5a3a" : "#6a4a2a";
          ctx.fillRect(wx, wy, ww * 0.48, wh);
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          for (let ly = wy + 3; ly < wy + wh; ly += 5) ctx.fillRect(wx, ly, ww * 0.48, 1.5);
        }
        if (LOOK !== "capital") {
          // burglar bars
          ctx.fillStyle = "rgba(25,25,28,0.85)";
          for (let bx = wx + 5; bx < wx + ww; bx += 7) ctx.fillRect(bx, wy, 1.6, wh);
          ctx.fillRect(wx, wy + wh / 2, ww, 1.6);
        }
        // sill and a dirty streak under it
        ctx.fillStyle = shade(base, 0.15);
        ctx.fillRect(wx - 6, wy + wh + 4, ww + 12, 4);
        if (LOOK !== "capital") {
          const st = ctx.createLinearGradient(0, wy + wh + 8, 0, wy + wh + 8 + fh * 0.4);
          st.addColorStop(0, "rgba(40,30,20,0.25)");
          st.addColorStop(1, "rgba(40,30,20,0)");
          ctx.fillStyle = st;
          ctx.fillRect(wx + 4, wy + wh + 8, ww - 8, fh * 0.4);
        }
        // an air conditioner now and then
        if (rand() < (LOOK === "capital" ? 0.1 : 0.25)) {
          ctx.fillStyle = "#e6e6e2";
          ctx.fillRect(wx + ww + 6, wy + wh * 0.5, Math.min(26, W / n / 4), 16);
          ctx.fillStyle = "#9a9a96";
          ctx.fillRect(wx + ww + 8, wy + wh * 0.5 + 4, Math.min(22, W / n / 4 - 4), 2);
        }
      }
      // floor band
      ctx.fillStyle = shade(base, -0.06);
      ctx.fillRect(0, y0 + fh - 4, W, 4);
    }
    // red earth splashed up the bottom of walls in the south, dust in the north
    if (LOOK === "south" || LOOK === "sahel") {
      const g = ctx.createLinearGradient(0, H - fh * 0.35, 0, H);
      g.addColorStop(0, "rgba(150,70,40,0)");
      g.addColorStop(1, LOOK === "south" ? "rgba(150,70,40,0.45)" : "rgba(140,100,60,0.35)");
      ctx.fillStyle = g;
      ctx.fillRect(0, H - fh * 0.35, W, fh * 0.35);
    }
  }
  // the shop at street level
  if (shop) {
    const y0 = H - fh;
    const [bg, fg] = SIGN_COLORS[Math.floor(rand() * SIGN_COLORS.length)];
    const names = SHOP_NAMES[LOOK];
    const name = names[Math.floor(rand() * names.length)];
    ctx.fillStyle = bg;
    ctx.fillRect(6, y0 + 6, W - 12, fh * 0.24);
    ctx.fillStyle = fg;
    let size = Math.floor(fh * 0.15);
    ctx.font = `900 ${size}px Inter, Arial, sans-serif`;
    while (ctx.measureText(name).width > W - 30 && size > 8) {
      size -= 1;
      ctx.font = `900 ${size}px Inter, Arial, sans-serif`;
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(name, W / 2, y0 + 6 + fh * 0.12);
    if (night) {
      ex.fillStyle = "#6a6a6a";
      ex.fillRect(6, y0 + 6, W - 12, fh * 0.24);
    }
    const top = y0 + 6 + fh * 0.24 + 4;
    const open = rand() < (LOOK === "capital" ? 0.7 : 0.45);
    if (open && LOOK === "capital") {
      // a glass shopfront
      const g = ctx.createLinearGradient(14, top, W - 14, H);
      g.addColorStop(0, night ? "#ffe2b0" : "#9fc0d4");
      g.addColorStop(1, night ? "#e0a860" : "#5f7f96");
      ctx.fillStyle = g;
      ctx.fillRect(14, top, W - 28, H - top);
      ctx.fillStyle = "#d4dde3";
      for (let x = 14; x < W - 14; x += (W - 28) / 4) ctx.fillRect(x, top, 3, H - top);
      if (night) {
        ex.fillStyle = "#8a7050";
        ex.fillRect(14, top, W - 28, H - top);
      }
    } else if (open) {
      ctx.fillStyle = "#2a2622";
      ctx.fillRect(14, top, W - 28, H - top);
      const goods = ["#c0182b", "#f5c518", "#1d4a8a", "#3a8a4a", "#e8e0d0", "#7a3aff", "#ff7a3a"];
      for (let r = 0; r < 4; r++)
        for (let k = 0; k < 9; k++) {
          ctx.fillStyle = goods[Math.floor(rand() * goods.length)];
          ctx.fillRect(18 + k * ((W - 36) / 9), top + 6 + r * ((H - top - 12) / 4), (W - 36) / 9 - 3, (H - top - 12) / 4 - 4);
        }
      if (night) {
        ex.fillStyle = "#806040";
        ex.fillRect(14, top, W - 28, H - top);
      }
    } else if (LOOK === "sahel") {
      // a wide arched doorway into a dark shop
      ctx.fillStyle = shade(base, 0.14);
      ctx.fillRect(W * 0.2 - 6, top + 10, W * 0.6 + 12, H - top - 10);
      ctx.fillStyle = "#3a2414";
      ctx.beginPath();
      ctx.moveTo(W * 0.2, H);
      ctx.lineTo(W * 0.2, top + 40);
      ctx.arc(W / 2, top + 40, W * 0.3, Math.PI, 0);
      ctx.lineTo(W * 0.8, H);
      ctx.fill();
    } else {
      // rolled-down shutter
      ctx.fillStyle = "#8a8f94";
      ctx.fillRect(14, top, W - 28, H - top);
      ctx.fillStyle = "rgba(30,32,36,0.35)";
      for (let y = top; y < H; y += 5) ctx.fillRect(14, y, W - 28, 1.5);
      ctx.fillStyle = "rgba(120,60,30,0.35)";
      ctx.fillRect(14, H - 14, W - 28, 14);
    }
    if (LOOK !== "sahel") {
      ctx.fillStyle = shade(base, -0.1);
      ctx.fillRect(0, top, 14, H - top);
      ctx.fillRect(W - 14, top, 14, H - top);
    }
  }
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  texCache.set(key, map);
  let emissive: THREE.Texture | null = null;
  if (night) {
    emissive = new THREE.CanvasTexture(e);
    emissive.colorSpace = THREE.SRGBColorSpace;
    texCache.set(key + "|e", emissive);
  }
  return { map, emissive };
}

/** A building whose front (+z, or the side given by `face`) is a painted facade, with a roof in the regional style. */
function building(scene: THREE.Scene, x: number, z: number, w: number, h: number, d: number, seed: number, night: boolean, shop: boolean, face: "front" | "left" | "right" = "front") {
  const rand = rng(seed + 11);
  const faceW = face === "front" ? w : d;
  const { map, emissive } = facadeTextures(seed, faceW, h, night, shop);
  const wall = lookBase(seed);
  const plaster = mat("#ffffff", { map: surfaceTexture("plaster", wall, [Math.max(1, Math.round(d / 4)), Math.max(1, Math.round(h / 4))]), rough: 0.95 });
  // at night the walls sit in shadow and only lit windows and signs shine
  const facade = new THREE.MeshStandardMaterial({ map, color: night ? "#9a96a8" : "#ffffff", roughness: LOOK === "capital" ? 0.55 : 0.92, metalness: LOOK === "capital" && h > 9 && !shop ? 0.2 : 0, emissiveMap: emissive, emissive: emissive ? new THREE.Color("#ffffff") : new THREE.Color("#000000"), emissiveIntensity: emissive ? 0.9 : 0 });
  const roof = mat("#7a7a76", { rough: 1 });
  // BoxGeometry face order: +x, -x, +y, -y, +z, -z
  const mats: THREE.Material[] = [plaster, plaster, roof, roof, plaster, plaster];
  mats[face === "front" ? 4 : face === "left" ? 0 : 1] = facade;
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats);
  m.position.set(x, h / 2, z);
  shadow(m);
  scene.add(m);
  const front = face === "front";

  if (LOOK === "brownroof" && h < 8) {
    // a pitched roof of rusty brown zinc
    const zinc = mat("#a8683e", { map: zincTexture(), rough: 0.8, metal: 0.2 });
    for (const side of [-1, 1]) {
      const r = new THREE.Mesh(new THREE.BoxGeometry(w + 0.7, 0.1, d / 2 + 0.6), zinc);
      r.position.set(x, h + 0.75, z + side * (d / 4 + 0.05));
      r.rotation.x = side * 0.42;
      shadow(r);
      scene.add(r);
    }
    return;
  }
  // parapet lip
  box(scene, w + 0.2, 0.35, d + 0.2, mat(LOOK === "lagos" ? PLASTER[(seed + 3) % PLASTER.length] : shade(wall, -0.06), { rough: 1 }), x, h, z);
  if (LOOK === "sahel") {
    // crenellated parapet and horn-like pinnacles at the corners
    const earth = mat(shade(wall, -0.04), { rough: 1 });
    if (front && rand() < 0.4) {
      for (let px = -w / 2 + 0.3; px <= w / 2 - 0.3; px += 0.9) box(scene, 0.4, 0.45, 0.4, earth, x + px, h + 0.35, z + d / 2 - 0.2);
      for (const sx of [-1, 1]) {
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.1, 10), earth);
        horn.position.set(x + sx * (w / 2 - 0.15), h + 0.9, z + d / 2 - 0.15);
        shadow(horn);
        scene.add(horn);
      }
    }
    // drain spouts sticking out of the wall
    if (front) for (let px = -w / 2 + 1.2; px < w / 2; px += 2.6) cyl(scene, 0.07, 0.07, 0.7, "#6a4a2a", x + px, h - 0.4, z + d / 2 + 0.3, 8).rotation.x = Math.PI / 2;
    if (rand() < 0.15) cyl(scene, 0.85, 0.85, 1.6, mat("#1c1c1e", { rough: 0.6 }), x, h + 0.35, z, 24);
    return;
  }
  if (LOOK === "south" && front && h > 5) {
    // balconies with white railings on the upper floors
    const slab = mat("#d8d4cc", { rough: 0.9 });
    const rail = mat("#f4f2ee", { rough: 0.6 });
    for (let fy = 3.3; fy < h - 1; fy += 3.3) {
      box(scene, w * 0.7, 0.14, 1.0, slab, x, fy, z + d / 2 + 0.5);
      box(scene, w * 0.7, 0.08, 0.08, rail, x, fy + 0.95, z + d / 2 + 0.96);
      for (let px = -w * 0.35; px <= w * 0.35; px += 0.3) box(scene, 0.05, 0.9, 0.05, rail, x + px, fy + 0.1, z + d / 2 + 0.96);
    }
  }
  if (LOOK === "capital") return;
  if ((LOOK === "lagos" || LOOK === "south") && h > 6 && rand() < 0.35) {
    // an unfinished floor on top: column stubs with rusty rods sticking up
    const rod = mat("#6a3a24", { rough: 0.8, metal: 0.4 });
    for (let px = -w / 2 + 0.4; px <= w / 2 - 0.3; px += Math.max(1.6, w / 4)) {
      box(scene, 0.35, 0.8, 0.35, "#9a978e", x + px, h + 0.35, z + d / 2 - 0.4);
      for (const ox of [-0.1, 0.1]) cyl(scene, 0.02, 0.02, 1.4, rod, x + px + ox, h + 1.1, z + d / 2 - 0.4, 4);
    }
  }
  // roof clutter: a black water tank, a dish
  if (rand() < 0.55) {
    const tx = x + (rand() - 0.5) * (w - 2);
    const tz = z + (rand() - 0.5) * (d - 2);
    for (const [ox, oz] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) box(scene, 0.12, 1.2, 0.12, "#4c5660", tx + ox, h + 0.35, tz + oz);
    cyl(scene, 0.85, 0.85, 1.6, mat("#1c1c1e", { rough: 0.6 }), tx, h + 1.55, tz, 24);
  }
  if (rand() < 0.35) {
    const dish = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3), mat("#e6e6e2", { rough: 0.5 }));
    dish.rotation.x = -1.1;
    dish.position.set(x - w / 3, h + 0.9, z);
    scene.add(dish);
  }
}

/** A flat-roofed or zinc-roofed bungalow for towns and villages. */
function bungalow(scene: THREE.Scene, x: number, z: number, w: number, d: number, seed: number, night: boolean, mud: boolean) {
  const h = 3.2;
  if (mud || LOOK === "sahel") {
    box(scene, w, h, d, surfaceMat("plaster", "#b0784a", [2, 1], 1), x, 0, z);
  } else building(scene, x, z, w, h, d, seed, night, false);
  // corrugated zinc roof, a bit rusty
  const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, 0.12, d + 0.8), mat("#ffffff", { map: zincTexture(), rough: 0.7, metal: 0.3 }));
  roof.position.set(x, h + 0.55, z);
  roof.rotation.x = -0.18;
  shadow(roof);
  scene.add(roof);
  box(scene, 0.9, 1.9, 0.08, "#5a3a1a", x, 0, z + d / 2 + 0.02);
}

function palm(scene: THREE.Scene, x: number, z: number, h: number, tickers: Built["tickers"]) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const trunkMat = mat("#7a6048", { rough: 1 });
  for (let i = 0; i < 8; i++) cyl(g, 0.17 - i * 0.008, 0.2 - i * 0.008, h / 8, trunkMat, Math.sin(i * 0.4) * 0.15, (i * h) / 8, 0, 10);
  const crown = new THREE.Group();
  crown.position.set(Math.sin(3.2) * 0.15, h, 0);
  const leaf = mat("#3f7a34", { rough: 0.9 });
  for (let i = 0; i < 9; i++) {
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.28, 3.2, 4, 1), leaf);
    f.geometry.translate(0, 1.6, 0);
    f.rotation.z = 1.15;
    const arm = new THREE.Group();
    arm.rotation.y = (i / 9) * Math.PI * 2;
    arm.add(f);
    crown.add(arm);
    f.castShadow = true;
  }
  g.add(crown);
  scene.add(g);
  tickers.push((t) => (crown.rotation.z = Math.sin(t * 0.8 + x) * 0.04));
}

function tree(scene: THREE.Scene, x: number, z: number, s: number, night: boolean) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  cyl(g, 0.18 * s, 0.26 * s, 2.4 * s, "#5a4430", 0, 0, 0, 10);
  const leaves = mat(night ? "#24361e" : "#4e7e3a", { rough: 1 });
  for (const [ox, oy, oz, r] of [[0, 3.2, 0, 1.5], [0.9, 2.8, 0.3, 1.1], [-0.9, 2.9, -0.2, 1.1], [0.2, 3.9, -0.3, 1]] as const) sphere(g, r * s, leaves, ox * s, oy * s, oz * s, 8);
  scene.add(g);
}

function powerLine(scene: THREE.Scene, z: number, from: number, to: number) {
  const pole = mat("#6a5a4a", { rough: 1 });
  const xs: number[] = [];
  for (let x = from; x <= to; x += 14) xs.push(x);
  for (const x of xs) {
    cyl(scene, 0.11, 0.14, 8.6, pole, x, 0, z, 10);
    box(scene, 2.2, 0.12, 0.12, pole, x, 7.9, z);
  }
  const wire = new THREE.LineBasicMaterial({ color: "#1d1d20" });
  for (const off of [-0.9, 0, 0.9])
    for (let i = 0; i < xs.length - 1; i++) {
      const a = new THREE.Vector3(xs[i] + off, 8.0, z);
      const b = new THREE.Vector3(xs[i + 1] + off, 8.0, z);
      const mid = a.clone().add(b).multiplyScalar(0.5);
      mid.y -= 0.7;
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(16)), wire));
    }
}

const BILLBOARDS = ["MAMA PUT: FOOD IS READY!", "BUY NAIJA, GROW THE NAIRA", "PAY YOUR TAX, BUILD YOUR STATE", "SUPER EAGLES FOR THE CUP!", "CRUSADE THIS SUNDAY: ALL ARE WELCOME", "EKO ATLANTIC: OWN A PIECE OF LAGOS"];

function billboard(scene: THREE.Scene, x: number, z: number, rand: () => number) {
  const pole = mat("#4c5660", { metal: 0.4, rough: 0.6 });
  for (const ox of [-2, 2]) cyl(scene, 0.15, 0.15, 4.4, pole, x + ox, 0, z, 10);
  box(scene, 7, 3.2, 0.3, "#1d1d20", x, 4.0, z);
  const texts = BILLBOARD_TEXT[LOOK];
  const text = texts[Math.floor(rand() * texts.length)];
  const ad = adFor("billboard", CITY, Math.floor(rand() * 1000), rand() < 0.35 ? "house" : "none");
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 2.8), new THREE.MeshStandardMaterial({ map: ad ?? billboardTexture(text, rand), roughness: 0.8 }));
  panel.position.set(x, 5.6, z + 0.17);
  scene.add(panel);
}

const BILLBOARD_TEXT: Record<Look, string[]> = {
  lagos: BILLBOARDS,
  sahel: ["SANNU DA ZUWA: WELCOME", "BUY NAIJA, GROW THE NAIRA", "TOMATO SEASON: GOOD PRICE!", "SUPER EAGLES FOR THE CUP!", "DURBAR FESTIVAL THIS SALLAH"],
  capital: ["WELCOME TO THE CENTRE OF UNITY", "ABUJA: CITY OF DREAMS", "PAY YOUR TAX, BUILD YOUR STATE", "SUPER EAGLES FOR THE CUP!", "NEW ESTATE: OWN YOUR HOME IN MAITAMA"],
  brownroof: ["AMALA AND EWEDU, HOT HOT!", "BUY NAIJA, GROW THE NAIRA", "CRUSADE THIS SUNDAY: ALL ARE WELCOME", "SUPER EAGLES FOR THE CUP!", "OKE ADO GRAND SALE"],
  south: ["ABACHA AND UGBA SPECIAL!", "MADE IN ABA, WORN EVERYWHERE", "CRUSADE THIS SUNDAY: ALL ARE WELCOME", "SUPER EAGLES FOR THE CUP!", "GARDEN CITY FESTIVAL"],
};

/* ---------------------------------------------------------------- street-level detail, from Street View */

const RUSTY_ZINC = () => mat("#9a7a5a", { map: zincTexture(), rough: 0.8, metal: 0.25 });
const TARPS = ["#2a6ab0", "#1d4a8a", "#3a8acf", "#2a7a5a", "#c0182b"];
const GOODS = ["#c0182b", "#f5c518", "#1d4a8a", "#3a8a4a", "#e8e0d0", "#7a3aff", "#ff7a3a", "#f2f2ee", "#1a1a1a"];

/** A roadside kiosk: plank walls, a lean-to of rusty zinc, a blue tarp, and goods hanging at the front. */
function kiosk(scene: THREE.Scene, x: number, z: number, w: number, rand: () => number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const wood = mat("#ffffff", { map: surfaceTexture("planks", rand() < 0.5 ? "#8a6a48" : "#6e5a44", [2, 1]), rough: 1 });
  const d = 1.5;
  const h = 2.2;
  box(g, w, h, 0.08, wood, 0, 0, -d / 2);
  for (const sx of [-1, 1]) box(g, 0.08, h, d, wood, (sx * w) / 2, 0, 0);
  for (const sx of [-1, 1]) box(g, 0.1, h + 0.3, 0.1, "#5a4030", (sx * w) / 2, 0, d / 2);
  // counter with goods on it
  box(g, w - 0.1, 0.9, 0.5, wood, 0, 0, d / 2 - 0.3);
  for (let i = 0; i < Math.floor(w * 2.4); i++) box(g, 0.18 + rand() * 0.12, 0.12 + rand() * 0.22, 0.18, GOODS[Math.floor(rand() * GOODS.length)], -w / 2 + 0.25 + i * 0.4, 0.9, d / 2 - 0.3 + (rand() - 0.5) * 0.2);
  // lean-to roof of rusty zinc, sloping to the front
  const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 0.05, d + 0.9), RUSTY_ZINC());
  roof.position.set(0, h + 0.25, 0.25);
  roof.rotation.x = 0.16;
  shadow(roof);
  g.add(roof);
  // a tarp awning, often
  if (rand() < 0.6) {
    const tarp = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.3, 1.3), new THREE.MeshStandardMaterial({ color: TARPS[Math.floor(rand() * TARPS.length)], roughness: 0.8, side: THREE.DoubleSide }));
    tarp.rotation.x = -Math.PI / 2 + 0.35;
    tarp.position.set(0, h - 0.1, d / 2 + 0.6);
    tarp.castShadow = true;
    g.add(tarp);
  }
  // strips of sachets or clothes hanging from the front
  const clothes = rand() < 0.4;
  for (let i = 0; i < Math.floor(w * 3); i++) {
    const c = GOODS[Math.floor(rand() * GOODS.length)];
    if (clothes) box(g, 0.32, 0.55, 0.02, c, -w / 2 + 0.25 + i * 0.36, h - 0.75, d / 2 + 0.06);
    else box(g, 0.1, 0.7 + rand() * 0.3, 0.02, c, -w / 2 + 0.2 + i * 0.3, h - 1.0, d / 2 + 0.06);
  }
  scene.add(g);
}

/** A stretch of wall on the pavement with two posters pasted on it (a players' advert slot). */
function posterWall(scene: THREE.Scene, x: number, z: number, seed: number, modern: boolean) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  if (modern) {
    // a steel advert box, as at Abuja bus stops
    box(g, 3.4, 2.9, 0.3, "#2b2f36", 0, 0, 0);
  } else {
    box(g, 3.6, 2.7, 0.25, mat("#ffffff", { map: surfaceTexture("plaster", "#bdb4a2", [1, 1]), rough: 1 }), 0, 0, 0);
    box(g, 3.7, 0.12, 0.32, "#9a978e", 0, 2.7, 0);
  }
  for (const [i, px] of [-0.84, 0.84].entries()) {
    const tex = adFor("poster", CITY, seed + i, i === 0 && seed % 3 === 0 ? "house" : "local");
    const poster = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.0), new THREE.MeshStandardMaterial({ map: tex, roughness: modern ? 0.3 : 0.85, emissive: modern ? "#ffffff" : "#000000", emissiveMap: modern ? tex : null, emissiveIntensity: modern ? 0.25 : 0 }));
    poster.position.set(px, modern ? 1.5 : 1.4, modern ? 0.16 : 0.135);
    poster.rotation.z = modern ? 0 : (i ? 0.02 : -0.025);
    g.add(poster);
  }
  scene.add(g);
}

/** A roadside sign board on two posts, carrying a player's poster. */
export function signBoard(scene: THREE.Scene, x: number, z: number, seed: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const metal = mat("#4c5660", { metal: 0.4, rough: 0.6 });
  for (const px of [-1.3, 1.3]) cyl(g, 0.08, 0.08, 4.3, metal, px, 0, 0, 8);
  box(g, 3.14, 2.14, 0.1, "#1d1d20", 0, 2.0, -0.03);
  const tex = adFor("signboard", CITY, seed, "house");
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 2.0), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }));
  panel.position.set(0, 3.07, 0.03);
  g.add(panel);
  scene.add(g);
}

/** A long cloth banner tied between two poles, gently moving in the breeze. */
function streetBanner(scene: THREE.Scene, x: number, z: number, seed: number, tickers: Built["tickers"]) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const pole = mat("#6a5a4a", { rough: 1 });
  for (const px of [-2.35, 2.35]) cyl(g, 0.06, 0.07, 5.9, pole, px, 0, 0, 8);
  const tex = adFor("banner", CITY, seed, "local");
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.1, 16, 1), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, side: THREE.DoubleSide }));
  cloth.position.set(0, 5.0, 0);
  cloth.castShadow = true;
  g.add(cloth);
  for (const px of [-2.3, 2.3]) for (const py of [4.45, 5.55]) box(g, 0.12, 0.02, 0.02, "#e8e0d0", px, py, 0);
  scene.add(g);
  const pos = cloth.geometry.attributes.position as THREE.BufferAttribute;
  tickers.push((t) => {
    for (let k = 0; k < pos.count; k++) {
      const vx = pos.getX(k);
      const edge = 1 - (vx / 2.2) ** 2;
      pos.setZ(k, Math.sin(t * 1.8 + vx * 1.4 + seed) * 0.12 * edge);
    }
    pos.needsUpdate = true;
  });
}

/**
 * A framed poster on a room's back wall, for indoor scenes: a paid poster for
 * the scene's city, or (in ordinary offices, shops and warehouses) a local one.
 * Returns false when the slot stays empty.
 */
export function wallAd(scene: THREE.Scene, x: number, y: number, seed: number, local: boolean) {
  const tex = adFor("poster", CITY, seed, local ? "local" : "none");
  if (!tex) return false;
  box(scene, 1.62, 2.12, 0.06, "#1d1d20", x, y - 1.06, -8.95);
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.0), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }));
  poster.position.set(x, y, -8.9);
  scene.add(poster);
  return true;
}

/** A broad umbrella tree, the kind that shades half a street. */
function shadeTree(scene: THREE.Scene, x: number, z: number, s: number, night: boolean) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  cyl(g, 0.25 * s, 0.4 * s, 4.2 * s, "#5a4a3a", 0, 0, 0, 12);
  for (const [ax, rz] of [[-1, 0.5], [1, -0.45], [0.2, 0.1]] as const) {
    const branch = cyl(g, 0.12 * s, 0.18 * s, 2.4 * s, "#5a4a3a", 0, 3.6 * s, 0, 8);
    branch.rotation.z = rz;
    branch.position.x = ax * 0.6 * s;
  }
  const leaves = mat(night ? "#22341c" : "#4f7e36", { rough: 1 });
  const dark = mat(night ? "#1a2a16" : "#3e6a2c", { rough: 1 });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const r = i === 0 ? 0 : 2.4 * s;
    const blob = sphere(g, (2.2 + (i % 3) * 0.4) * s, i % 2 ? leaves : dark, Math.cos(a) * r, 6 * s + (i % 2) * 0.5 * s, Math.sin(a) * r * 0.6, 10);
    blob.scale.y = 0.45;
  }
  scene.add(g);
}

/** Small things left on a Nigerian pavement: jerrycans, plastic chairs, a handcart, a rubbish heap. */
function clutter(scene: THREE.Scene, x: number, z: number, rand: () => number) {
  const r = rand();
  if (r < 0.3) {
    for (let i = 0; i < 2 + Math.floor(rand() * 3); i++) {
      const c = box(scene, 0.32, 0.42, 0.22, ["#f0c419", "#2a7a3a", "#d0d0c8"][i % 3], x + i * 0.38, 0, z + (rand() - 0.5) * 0.3);
      c.rotation.y = rand() - 0.5;
      box(scene, 0.06, 0.08, 0.14, "#2b2f36", x + i * 0.38, 0.42, z);
    }
  } else if (r < 0.55) {
    for (let i = 0; i < 2; i++) {
      const g = new THREE.Group();
      const c = i ? "#c0182b" : "#1d4a8a";
      box(g, 0.48, 0.05, 0.48, c, 0, 0.45, 0);
      box(g, 0.48, 0.45, 0.05, c, 0, 0.5, -0.22);
      for (const [lx, lz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) box(g, 0.04, 0.45, 0.04, c, lx, 0, lz);
      g.position.set(x + i * 0.7, 0, z);
      g.rotation.y = rand() - 0.5;
      scene.add(g);
    }
  } else if (r < 0.75) {
    // a wooden handcart
    const g = new THREE.Group();
    box(g, 1.6, 0.12, 0.9, "#7a5a3a", 0, 0.55, 0);
    for (const sz of [-0.45, 0.45]) box(g, 1.6, 0.25, 0.06, "#6a4a2a", 0, 0.62, sz);
    box(g, 1.2, 0.06, 0.06, "#6a4a2a", 1.3, 0.6, -0.3);
    box(g, 1.2, 0.06, 0.06, "#6a4a2a", 1.3, 0.6, 0.3);
    for (const sz of [-0.5, 0.5]) {
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 8, 20), mat("#2b2f36"));
      wheel.position.set(-0.3, 0.3, sz);
      g.add(wheel);
    }
    for (let i = 0; i < 6; i++) box(g, 0.28, 0.24, 0.28, GOODS[Math.floor(rand() * GOODS.length)], -0.55 + (i % 3) * 0.4, 0.67, i < 3 ? -0.2 : 0.2);
    g.position.set(x, 0, z);
    g.rotation.y = (rand() - 0.5) * 0.6;
    scene.add(g);
  } else {
    // a small rubbish heap
    for (let i = 0; i < 6; i++) {
      const b = sphere(scene, 0.15 + rand() * 0.15, ["#2b2f36", "#e8e8e0", "#3a6ab0", "#6a5a3a"][i % 4], x + (rand() - 0.5) * 0.9, 0.1, z + (rand() - 0.5) * 0.5, 6);
      b.scale.y = 0.6;
    }
  }
}

/**
 * What Street View shows along real Nigerian streets: an open concrete gutter
 * with plank crossings, roadside kiosks, clutter, and a big shade tree. In
 * Abuja it is fenced compounds and grass verges instead.
 */
function streetside(scene: THREE.Scene, z0: number, side: number | null, night: boolean, rand: () => number, tickers: Built["tickers"]) {
  if (LOOK === "capital") {
    // grass verge, and compound walls with black railings and gates
    const verge = new THREE.Mesh(new THREE.BoxGeometry(150, 0.16, 1.4), surfaceMat("grass", "#6a8a4a", [40, 1], 1));
    verge.position.set(0, 0.08, z0 + 3.3);
    verge.receiveShadow = true;
    scene.add(verge);
    const wall = mat("#e8e4da", { rough: 0.9 });
    const rail = mat("#1d1f22", { metal: 0.5, rough: 0.5 });
    for (let x = -70; x < 70; x += 12) {
      if (side !== null && Math.abs(x + 6 - side) < 8) continue;
      box(scene, 8.5, 1.2, 0.25, wall, x + 4.25, 0, z0 + 0.5);
      box(scene, 8.5, 0.06, 0.06, rail, x + 4.25, 2.1, z0 + 0.5);
      for (let k = 0; k <= 34; k++) box(scene, 0.04, 0.9, 0.04, rail, x + k * 0.25, 1.2, z0 + 0.5);
      box(scene, 3, 2.2, 0.08, rail, x + 10.2, 0, z0 + 0.5);
      for (const px of [8.6, 11.8]) box(scene, 0.4, 2.5, 0.4, wall, x + px, 0, z0 + 0.5);
    }
    const s = side !== null ? -Math.sign(side) : rand() < 0.5 ? -1 : 1;
    billboard(scene, s * 7.5, z0 + 2.6, rand);
    for (const bx of [s * 22, -s * 24]) if (side === null || Math.abs(bx - side) > 7) billboard(scene, bx, z0 + 2.6, rand);
    posterWall(scene, -s * 3, z0 + 2.2, Math.floor(rand() * 1000), true);
    signBoard(scene, -s * 8, z0 + 3.4, Math.floor(rand() * 1000));
    return;
  }
  // the open gutter between pavement and road
  const gz = z0 + 4.65;
  const channel = new THREE.Mesh(new THREE.BoxGeometry(150, 0.02, 0.55), mat("#2a2622", { rough: 0.6 }));
  channel.position.set(0, 0.005, gz);
  scene.add(channel);
  const concrete = mat("#ffffff", { map: surfaceTexture("concrete", "#9a978e", [40, 1]), rough: 1 });
  for (const off of [-0.33, 0.33]) box(scene, 150, 0.2, 0.12, concrete, 0, 0, gz + off);
  for (let i = 0; i < 9; i++) {
    const px = -40 + i * 10 + rand() * 4;
    const plank = box(scene, 0.9 + rand() * 0.6, 0.06, 0.9, "#7a5a3a", px, 0.2, gz);
    plank.rotation.y = (rand() - 0.5) * 0.25;
  }
  // sand drifted along the edge of the road
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(150, 0.9), mat(LOOK === "south" ? "#a8603e" : LOOK === "sahel" ? "#c9a06a" : "#a89a7a", { rough: 1, opacity: 0.7 }));
  sand.rotation.x = -Math.PI / 2;
  sand.position.set(0, 0.012, gz + 0.8);
  scene.add(sand);

  // the advert slots, all inside the starting view: a billboard on one side, a sign
  // board on the other, a street banner and two poster walls between them
  const s = side !== null ? -Math.sign(side) : rand() < 0.5 ? -1 : 1;
  billboard(scene, s * 7.5, z0 + 2.6, rand);
  signBoard(scene, -s * 7, z0 + 3.5, Math.floor(rand() * 1000));
  streetBanner(scene, -s * 2.2, z0 + 3.7, Math.floor(rand() * 1000), tickers);
  // more roadside billboards down the street, seen as you look around
  for (const bx of [s * 21, -s * 23, s * 34]) if (side === null || Math.abs(bx - side) > 7) billboard(scene, bx, z0 + 2.6, rand);
  signBoard(scene, s * 14.5, z0 + 3.5, Math.floor(rand() * 1000));
  const walls = [s * 2.6, -s * 11.5].filter((wx) => side === null || Math.abs(wx - side) > 6);
  walls.forEach((wx, i) => posterWall(scene, wx, z0 + 0.9, Math.floor(rand() * 1000) + i * 7, false));

  // roadside kiosks in front of the shops, with clutter between them
  let x = -46;
  while (x < 46) {
    const w = 1.6 + Math.floor(rand() * 3) * 0.5;
    if (side !== null && x + w > side - 4.2 && x < side + 4.2) {
      x = side + 4.4;
      continue;
    }
    const wall = walls.find((wx) => x + w > wx - 2.1 && x < wx + 2.1);
    if (wall !== undefined) {
      x = wall + 2.2;
      continue;
    }
    if (rand() < 0.62) kiosk(scene, x + w / 2, z0 + 1.0, w, rand);
    else clutter(scene, x + w / 2, z0 + 1.4, rand);
    x += w + 0.4 + rand() * 1.6;
  }
  // a big shade tree or two
  for (let i = 0; i < 2; i++) {
    const tx = (i ? 1 : -1) * (14 + rand() * 18);
    if (side !== null && Math.abs(tx - side) < 6) continue;
    shadeTree(scene, tx, z0 + 3.0, LOOK === "sahel" ? 0.85 : 1, night);
  }
}

/** Potholes and patched asphalt, and road paint worn away, on all but the capital's roads. */
function roadWear(scene: THREE.Scene, rand: () => number) {
  const hole = mat("#4a4844", { rough: 0.4, metal: 0.15, opacity: 0.6 });
  const patch = mat("#5e6064", { rough: 0.95, opacity: 0.75 });
  for (let i = 0; i < 9; i++) {
    const p = new THREE.Mesh(new THREE.CircleGeometry(0.4 + rand() * 0.6, 14), i % 3 ? hole : patch);
    p.rotation.x = -Math.PI / 2;
    p.scale.set(1 + rand(), 0.6 + rand() * 0.5, 1);
    p.position.set(-30 + rand() * 60, 0.008, -15 + rand() * 13);
    p.receiveShadow = true;
    scene.add(p);
  }
}

/** Pavement, painted kerb, a row of shops and houses, poles and cables: a Nigerian street behind the action, in the region's style. */
function street(scene: THREE.Scene, night: boolean, tickers: Built["tickers"], rand: () => number, opts: { tall: boolean; z?: number }) {
  const z0 = opts.z ?? -21.5;
  // pavement and kerb
  const pave = new THREE.Mesh(new THREE.BoxGeometry(150, 0.14, 4.2), surfaceMat("concrete", LOOK === "capital" ? "#b8b4aa" : "#a8a49a", [40, 1.2], 0.95));
  pave.position.set(0, 0.07, z0 + 2.1);
  pave.receiveShadow = true;
  scene.add(pave);
  const kerb = new THREE.Mesh(new THREE.BoxGeometry(150, 0.26, 0.3), mat("#ffffff", { map: kerbTexture(), rough: 0.8 }));
  kerb.position.set(0, 0.13, z0 + 4.2);
  shadow(kerb);
  scene.add(kerb);

  // now and then a side street runs back from the main road, between the buildings
  const side = rand() < 0.5 ? (rand() < 0.5 ? -1 : 1) * (9 + rand() * 6) : null;
  if (side !== null) {
    const road = new THREE.Mesh(new THREE.BoxGeometry(7, 0.02, 60), surfaceMat("asphalt", "#4a4c50", [2, 16], 0.85));
    road.position.set(side, 0.15, z0 - 28);
    road.receiveShadow = true;
    scene.add(road);
    let sz = z0 - 6;
    let s = 4000 + Math.floor(rand() * 500);
    while (sz > z0 - 55) {
      const d = 6 + Math.floor(rand() * 4);
      const floors = 1 + Math.floor(rand() * (LOOK === "capital" ? 5 : 3));
      building(scene, side - 3.5 - 3.5, sz - d / 2, 7, floors * 3.3, d, s++, night, rand() < 0.5, "left");
      building(scene, side + 3.5 + 3.5, sz - d / 2, 7, floors * 3.3, d, s++, night, rand() < 0.5, "right");
      sz -= d + 0.6;
    }
  }

  // the row of buildings
  const maxFloors = LOOK === "capital" ? 5 : LOOK === "sahel" || LOOK === "brownroof" ? 2 : opts.tall ? 4 : 2.6;
  let x = -70;
  let seed = Math.floor(rand() * 1000);
  while (x < 70) {
    const w = 5 + Math.floor(rand() * 5);
    if (side !== null && x + w > side - 3.6 && x < side + 3.6) {
      x = side + 3.8;
      continue;
    }
    const floors = 1 + Math.floor(rand() * maxFloors);
    building(scene, x + w / 2, z0 - 3.5, w, floors * 3.3, 7, seed++, night, true);
    x += w + 0.4 + rand() * 0.8;
  }

  streetside(scene, z0, side, night, rand, tickers);

  // what rises behind the street
  if (LOOK === "capital") {
    // glass towers, and Aso Rock watching over the city
    let xx = -80;
    while (xx < 80) {
      const w = 8 + Math.floor(rand() * 8);
      const h = 18 + Math.floor(rand() * 30);
      building(scene, xx + w / 2, z0 - 20, w, h, 10, seed++, night, false);
      xx += w + 4 + rand() * 5;
    }
    const rock = new THREE.Mesh(new THREE.SphereGeometry(30, 32, 20), mat(night ? "#2a2a34" : "#8a8a84", { rough: 1 }));
    rock.scale.set(1.4, 0.75, 0.8);
    rock.position.set(-30, -4, -110);
    scene.add(rock);
  } else if (LOOK === "brownroof" || LOOK === "sahel") {
    // a sea of low roofs and hills (Ibadan, Abeokuta) or flat earth roofs and neem trees (the north)
    let xx = -90;
    while (xx < 90) {
      const w = 6 + Math.floor(rand() * 5);
      building(scene, xx + w / 2, z0 - 14 - rand() * 8, w, 3.3 * (1 + Math.floor(rand() * 2)), 7, seed++, night, false);
      xx += w + 1 + rand() * 3;
    }
    if (LOOK === "brownroof")
      for (let i = 0; i < 7; i++) {
        const s = new THREE.Mesh(new THREE.SphereGeometry(16 + (i % 3) * 6, 24, 16), mat(night ? "#1e3324" : i % 2 ? "#5a8a48" : "#6a9a52", { rough: 1 }));
        s.position.set(-70 + i * 24, -7, -75 - (i % 2) * 10);
        s.scale.y = 0.5;
        scene.add(s);
      }
    else for (let i = 0; i < 8; i++) tree(scene, -60 + i * 17 + rand() * 6, z0 - 10 - rand() * 6, 1.2 + rand() * 0.5, night);
  } else if (opts.tall) {
    // taller blocks further back
    let xx = -80;
    while (xx < 80) {
      const w = 7 + Math.floor(rand() * 8);
      const h = LOOK === "south" ? 9 + Math.floor(rand() * 10) : 14 + Math.floor(rand() * 18);
      building(scene, xx + w / 2, z0 - 18, w, h, 9, seed++, night, false);
      xx += w + 2 + rand() * 4;
    }
    if (LOOK === "south")
      for (let i = 0; i < 6; i++) palm(scene, -50 + i * 20 + rand() * 6, z0 - 12, 9 + rand() * 3, tickers);
  }

  if (LOOK !== "capital") powerLine(scene, z0 + 3.5, -63, 63);
  // trees along the pavement: palms by the coast, neem in the north, neat rows in Abuja
  for (let i = 0; i < 4; i++) {
    const tx = -40 + i * 26 + rand() * 6;
    if (side !== null && Math.abs(tx - side) < 5) continue;
    if (LOOK === "sahel" || LOOK === "capital") tree(scene, tx, z0 + 2.4, LOOK === "capital" ? 1.1 : 1.3, night);
    else palm(scene, tx, z0 + 2.4, 6 + rand() * 2.5, tickers);
  }
  for (let i = 0; i < 5; i++) lampPost(scene, -44 + i * 22, z0 + 3.8, night);
}

function horizon(scene: THREE.Scene, kind: string, night: boolean, tickers: Built["tickers"], rand: () => number) {
  if (kind === "city" || kind === "none") street(scene, night, tickers, rand, { tall: kind === "city" });
  if (kind === "bridge") street(scene, night, tickers, rand, { tall: true, z: -44 });
  if (kind === "sea" || kind === "bridge") {
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(260, 70), mat(night ? "#0f2c4a" : "#2a76a8", { rough: 0.35 }));
    sea.rotation.x = -Math.PI / 2;
    sea.position.set(0, 0.03, kind === "bridge" ? -30 : -58);
    scene.add(sea);
    const caps: THREE.Mesh[] = [];
    for (let i = 0; i < 30; i++) {
      const c = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.08), mat("#ffffff", { opacity: 0.45 }));
      c.rotation.x = -Math.PI / 2;
      c.position.set(((i * 53) % 70) - 35, 0.05, -26 - ((i * 29) % 30));
      scene.add(c);
      caps.push(c);
    }
    tickers.push((t) => caps.forEach((c, i) => (c.position.x += Math.sin(t * 0.6 + i) * 0.004)));
    if (kind === "sea") {
      // fishermen's shacks and palms along the shore
      for (let i = 0; i < 6; i++) bungalow(scene, -36 + i * 14 + rand() * 4, -26 - rand() * 3, 4 + rand() * 2, 3.5, 900 + i, night, false);
      for (let i = 0; i < 6; i++) palm(scene, -42 + i * 15 + rand() * 4, -22 - rand() * 2, 6 + rand() * 3, tickers);
    }
  }
  if (kind === "bridge") {
    const g = new THREE.Group();
    g.position.set(7, 0, -28);
    box(g, 1.2, 22, 1.2, "#cfd6dc", 0, 0, 0);
    for (let i = 0; i < 8; i++) {
      const pts = [new THREE.Vector3(0, 20 - i * 1.6, 0), new THREE.Vector3(-12 + i * 1.4, 0.8, 4)];
      const pts2 = [new THREE.Vector3(0, 20 - i * 1.6, 0), new THREE.Vector3(12 - i * 1.4, 0.8, -4)];
      for (const p of [pts, pts2]) g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p), new THREE.LineBasicMaterial({ color: "#e8eef2" })));
    }
    scene.add(g);
    box(scene, 0.25, 1, 60, "#aab3bb", -9.5, 0, -10);
    box(scene, 0.25, 1, 60, "#aab3bb", 9.5, 0, -10);
    for (let i = 0; i < 12; i++) lampPost(scene, i % 2 ? 9.2 : -9.2, -2 - i * 6, night);
  }
  if (kind === "hills") {
    for (let i = 0; i < 9; i++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(12 + (i % 3) * 5, 24, 16), mat(night ? "#1e3324" : i % 2 ? "#5a8a48" : "#6a9a52", { rough: 1 }));
      s.position.set(-60 + i * 15, -5, -70 - (i % 2) * 10);
      s.scale.y = 0.55;
      scene.add(s);
    }
    village(scene, night, rand, tickers);
  }
  if (kind === "rocks") {
    for (let i = 0; i < 9; i++) {
      const r = new THREE.Mesh(new THREE.DodecahedronGeometry(3 + (i % 4) * 1.4, 1), mat(night ? "#3a3a48" : i % 2 ? "#8e8070" : "#9e907e", { rough: 1 }));
      r.position.set(-40 + i * 10, 1.4, -42 - (i % 3) * 6);
      r.scale.y = 0.75;
      r.rotation.set(i, i * 2, 0);
      shadow(r);
      scene.add(r);
    }
    village(scene, night, rand, tickers);
  }
  if (kind === "savanna") {
    for (let i = 0; i < 12; i++) tree(scene, -48 + i * 8.5 + rand() * 3, -28 - rand() * 14, 1.3 + rand() * 0.6, night);
    village(scene, night, rand, tickers, true);
  }
}

/* ---------------------------------------------------------------- Third Mainland Bridge */

/**
 * Lanes on the bridge, in world units. The bridge runs left to right; the crime
 * scene closes the near carriageway, so its traffic is pushed through a gap in
 * the median into a contraflow lane on the far side.
 */
export const BRIDGE = {
  /** Diverted cars: along the last open lane, through the median gap, then contraflow. */
  diverted: [[-150, -4.3], [-12, -4.3], [-6, -10.4], [150, -10.4]] as [number, number][],
  /** Normal traffic on the far carriageway, heading the other way. */
  oncoming: [[150, -14.3], [-150, -14.3]] as [number, number][],
};

const LASTMA: PersonLook = { skin: "#5C3A1E", top: "#f0c419", bottom: "#6a1a2a", hat: "cap", hatColor: "#6a1a2a" };
const POLICE: PersonLook = { skin: "#4a2c17", top: "#1d2126", bottom: "#1d2126", hat: "cap", hatColor: "#1d2126" };

function mainland(scene: THREE.Scene, night: boolean, tickers: Built["tickers"], rand: () => number) {
  // the deck: a long, low concrete bridge across the lagoon
  const deck = new THREE.Mesh(new THREE.BoxGeometry(330, 1.4, 25.6), surfaceMat("asphalt", "#4a4c51", [90, 7], night ? 0.6 : 0.88));
  deck.position.set(0, -0.7, -4.6);
  deck.receiveShadow = true;
  scene.add(deck);
  const concrete = mat("#ffffff", { map: surfaceTexture("concrete", "#a9a8a2", [40, 1]), rough: 0.95 });
  box(scene, 330, 1.2, 0.7, concrete, 0, -2.5, -17.2);
  for (let x = -154; x <= 154; x += 22) {
    for (const z of [-15.5, 6]) cyl(scene, 0.9, 1.1, 5, "#8f8e88", x, -7.6, z, 16);
    box(scene, 1.4, 1.1, 24, "#8f8e88", x, -2.6, -4.6);
  }

  // the lagoon, with a lazy shimmer
  const water = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), mat(night ? "#10293a" : "#3d7783", { rough: 0.28, metal: 0.1 }));
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, -6, -200);
  scene.add(water);
  const glints: THREE.Mesh[] = [];
  const glint = mat("#ffffff", { opacity: night ? 0.18 : 0.4 });
  for (let i = 0; i < 70; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2 + rand() * 2.4, 0.09), glint);
    m.rotation.x = -Math.PI / 2;
    m.position.set(-90 + rand() * 180, -5.95, -22 - rand() * 90);
    scene.add(m);
    glints.push(m);
  }
  tickers.push((t) => glints.forEach((m, i) => (m.position.x += Math.sin(t * 0.5 + i) * 0.006)));

  // road paint: edge lines, lane dashes, and the dashes either side of the contraflow
  const white = mat("#f2efe2", { rough: 0.8 });
  const yellow = mat("#f5c518", { rough: 0.8 });
  for (const z of [6.6, -6.6, -8.2, -16.3]) box(scene, 330, 0.012, 0.18, yellow, 0, 0, z);
  for (let i = -40; i <= 40; i++) for (const z of [2.2, -2.2]) box(scene, 2.6, 0.012, 0.16, white, i * 4, 0, z);
  for (let i = -40; i <= 40; i++) box(scene, 2.6, 0.012, 0.16, white, i * 4 + 2, 0, -12.3);

  // parapets: a concrete wall with a steel rail on both edges
  const steel = mat("#c9ced2", { metal: 0.5, rough: 0.4 });
  for (const z of [7.4, -16.9]) {
    box(scene, 330, 0.85, 0.42, concrete, 0, 0, z);
    box(scene, 330, 0.08, 0.1, steel, 0, 1.05, z);
    for (let x = -160; x <= 160; x += 2.5) box(scene, 0.07, 0.25, 0.07, "#a9aeb2", x, 0.82, z);
  }

  // the median: a jersey barrier with a gap where the police push traffic across
  const gap: [number, number] = [-11, -5];
  for (const [a, b] of [[-165, gap[0]], [gap[1], 165]]) {
    const len = b - a;
    box(scene, len, 0.82, 0.55, concrete, a + len / 2, 0, -7.4);
    box(scene, len, 0.22, 0.78, concrete, a + len / 2, 0, -7.4);
  }
  // median lamps, double-armed, every 30 m
  const metal = mat("#3c434c", { metal: 0.4, rough: 0.6 });
  const bulbMat = new THREE.MeshBasicMaterial({ color: night ? "#ffe2a0" : "#f4f2ea" });
  for (let x = -135; x <= 150; x += 30) {
    cyl(scene, 0.1, 0.13, 8.5, metal, x, 0.8, -7.4, 12);
    for (const side of [-1, 1]) {
      box(scene, 0.12, 0.08, 1.9, metal, x, 9.2, -7.4 + side * 0.9);
      const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, 0.6), bulbMat);
      bulb.position.set(x, 9.15, -7.4 + side * 1.8);
      scene.add(bulb);
    }
    if (night && Math.abs(x) <= 45) {
      const l = new THREE.PointLight("#ffd79a", 40, 26, 1.4);
      l.position.set(x, 8.6, -5);
      scene.add(l);
    }
  }

  // diversion: a cone taper closing the near lanes, and cones shutting the lane after the gap
  const coneMat = mat("#ff6a1a", { rough: 0.6 });
  const band = mat("#f4f4f0", { rough: 0.5 });
  const trafficCone = (x: number, z: number) => {
    box(scene, 0.42, 0.04, 0.42, "#1d1f22", x, 0, z);
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.72, 18), coneMat);
    c.position.set(x, 0.4, z);
    shadow(c);
    scene.add(c);
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.115, 0.09, 18), band);
    b.position.set(x, 0.45, z);
    scene.add(b);
  };
  for (let i = 0; i <= 12; i++) trafficCone(-42 + i * 2.4, 6 - i * 0.66);
  for (let x = -13; x < -10; x += 1.2) trafficCone(x, -2.0);
  for (let i = 0; i < 5; i++) trafficCone(-4.4, -2.4 - i * 0.95);
  for (let x = -3; x < 150; x += 5) trafficCone(x, -12.3);

  // DIVERSION boards facing the drivers, and a police barrier across the closed lanes
  const board = (x: number, z: number, text: string, rot: number) => {
    const g = new THREE.Group();
    for (const lx of [-0.8, 0.8]) box(g, 0.08, 1.1, 0.08, "#2b2f36", lx, 0, 0);
    box(g, 2.2, 1.0, 0.06, "#141414", 0, 1.05, -0.01);
    textPanel(g, text, 2.1, 0.9, "#141414", "#f5c518", 0, 1.55, 0.03);
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    scene.add(g);
  };
  board(-24, 1.6, "DIVERSION →", -Math.PI / 2 + 0.5);
  board(-16, -0.6, "KEEP RIGHT", -Math.PI / 2 + 0.5);
  const barrier = new THREE.Group();
  for (const z of [-1.5, 5.8]) box(barrier, 0.14, 1.05, 0.5, "#2b2f36", 0, 0, z);
  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.32, 7.6),
    new THREE.MeshStandardMaterial({ map: textTexture("POLICE • ROAD CLOSED • POLICE", "#ffffff", "#c0182b", 1024, 48), roughness: 0.7 }),
  );
  bar.position.set(0, 1.0, 2.15);
  shadow(bar);
  barrier.add(bar);
  barrier.position.set(-7.6, 0, 0);
  scene.add(barrier);

  // a LASTMA officer on the median end waving cars through the gap, and a policeman at the barrier
  const officer = makePerson(LASTMA);
  officer.position.set(-4.2, 0.82, -7.3);
  officer.rotation.y = -0.9;
  scene.add(officer);
  const cop = makePerson(POLICE);
  cop.position.set(-9.4, 0, 1.4);
  cop.rotation.y = 0.9;
  scene.add(cop);
  for (const p of [officer, cop]) p.traverse((o) => (o.castShadow = true));
  tickers.push((t) => {
    const arm = officer.userData.limbs?.armL as THREE.Object3D | undefined;
    if (arm) {
      arm.rotation.z = 1.9 + Math.sin(t * 4.2) * 0.55;
      arm.rotation.x = -0.4;
    }
    const head = officer.userData.limbs?.head as THREE.Object3D | undefined;
    if (head) head.rotation.y = Math.sin(t * 0.8) * 0.5;
    const copHead = cop.userData.limbs?.head as THREE.Object3D | undefined;
    if (copHead) copHead.rotation.y = Math.sin(t * 0.5 + 1) * 0.4;
  });

  // billboards along the far parapet, facing the traffic and the camera
  for (const bx of [-14, 26, 48]) billboard(scene, bx, -17.6, rand);

  // a big green road sign on the far side
  const sign = new THREE.Group();
  for (const px of [-2.6, 2.6]) cyl(sign, 0.1, 0.12, 5.2, metal, px, 0, 0, 12);
  box(sign, 6.4, 2.1, 0.1, "#ffffff", 0, 4.4, -0.06);
  textPanel(sign, "THIRD MAINLAND BRIDGE", 6.2, 0.95, "#ffffff", "#1d6a3a", 0, 5.95, 0.01);
  textPanel(sign, "← OWORONSHOKI     ADEKUNLE / CMS →", 6.2, 0.95, "#ffffff", "#1d6a3a", 0, 4.95, 0.01);
  sign.position.set(9, 0.85, -16.9);
  scene.add(sign);

  // across the water: Makoko on stilts to the left, the Island skyline to the right
  const wood = mat("#6a4a2e", { rough: 1 });
  const zinc = mat("#ffffff", { map: zincTexture(), rough: 0.7, metal: 0.3 });
  for (let i = 0; i < 26; i++) {
    const x = -120 + (i % 13) * 7 + rand() * 3;
    const z = -48 - Math.floor(i / 13) * 9 - rand() * 4;
    const w = 3 + rand() * 2;
    for (const [px, pz] of [[-w / 2 + 0.2, -1], [w / 2 - 0.2, -1], [-w / 2 + 0.2, 1], [w / 2 - 0.2, 1]]) cyl(scene, 0.07, 0.07, 2.4, wood, x + px, -6, z + pz, 6);
    box(scene, w, 2.1, 2.6, i % 3 ? wood : "#7a5a3e", x, -3.6, z);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.1, 3.2), zinc);
    roof.position.set(x, -1.35, z);
    roof.rotation.x = -0.12;
    scene.add(roof);
  }
  let sx = 20;
  let seed = 3100;
  while (sx < 150) {
    const w = 8 + Math.floor(rand() * 8);
    const h = 12 + Math.floor(rand() * 26);
    building(scene, sx + w / 2, -165 - rand() * 15, w, h, 10, seed++, night, false);
    sx += w + 3 + rand() * 6;
  }
  // and fishermen's canoes drifting on the lagoon
  for (let i = 0; i < 5; i++) {
    const g = new THREE.Group();
    box(g, 4.2, 0.4, 0.8, "#5a3a22", 0, 0, 0);
    box(g, 3.6, 0.06, 0.6, "#3a2414", 0, 0.38, 0);
    const fisher = makePerson({ skin: "#4a2c17", top: ["#c0182b", "#1d4a8a", "#f2efe6"][i % 3], bottom: "#2b2f36", hat: i % 2 ? "cap" : undefined, hatColor: "#f5c518" });
    fisher.scale.setScalar(0.9);
    fisher.position.set(-1.2, 0.05, 0);
    fisher.rotation.y = Math.PI / 2;
    g.add(fisher);
    box(g, 0.06, 0.06, 2.2, "#8a6a42", -0.6, 0.9, 0.4).rotation.x = 0.8;
    const x0 = -60 + i * 28 + rand() * 10;
    const z0 = -30 - rand() * 40;
    g.position.set(x0, -5.95, z0);
    g.rotation.y = rand() * Math.PI;
    scene.add(g);
    tickers.push((t) => {
      g.position.x = x0 + Math.sin(t * 0.05 + i) * 6;
      g.rotation.z = Math.sin(t * 1.1 + i) * 0.04;
    });
  }
}

function village(scene: THREE.Scene, night: boolean, rand: () => number, tickers: Built["tickers"], mud = false) {
  for (let i = 0; i < 7; i++) bungalow(scene, -42 + i * 13 + rand() * 4, -26 - rand() * 6, 5 + rand() * 2.5, 4.5, 700 + i, night, mud || rand() < 0.3);
  for (let i = 0; i < 5; i++) tree(scene, -46 + i * 21 + rand() * 6, -22 - rand() * 3, 1 + rand() * 0.5, night);
  palm(scene, 28 + rand() * 8, -21, 7, tickers);
}

/* ---------------------------------------------------------------- the alley */

function alley(scene: THREE.Scene, wall: string, tickers: Built["tickers"], rand: () => number) {
  // painted buildings either side and one closing the alley; shops at street level
  building(scene, -9, -4, 6, 14, 30, 501 + Math.floor(rand() * 50), true, true, "left");
  building(scene, 9, -4, 6, 14, 30, 601 + Math.floor(rand() * 50), true, true, "right");
  building(scene, 0, -10.1, 14, 12, 2, 701 + Math.floor(rand() * 50), true, false, "front");
  // posters pasted on the alley walls at eye level
  for (const [i, [px, pz]] of ([[-5.98, -2.5], [5.98, -5.5]] as const).entries()) {
    const tex = adFor("poster", CITY, Math.floor(rand() * 1000) + i, i ? "local" : "house");
    const poster = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.34), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, emissive: "#ffffff", emissiveMap: tex, emissiveIntensity: 0.15 }));
    poster.position.set(px, 1.9, pz);
    poster.rotation.y = px < 0 ? Math.PI / 2 : -Math.PI / 2;
    scene.add(poster);
  }
  // a lit window glow and shop lights
  const lamp = new THREE.PointLight("#ffd29a", 30, 24, 1.5);
  lamp.position.set(-2, 7.5, 1);
  scene.add(lamp);
  const neon = new THREE.PointLight("#ff4fd8", 16, 16, 1.6);
  neon.position.set(5, 5, -6);
  scene.add(neon);
  const green = new THREE.PointLight("#5cff2a", 7, 10, 1.8);
  green.position.set(0, 4, -7);
  scene.add(green);
  // cables between the buildings
  const wire = new THREE.LineBasicMaterial({ color: "#141418" });
  for (let i = 0; i < 4; i++) {
    const z = -8 + i * 4.5;
    const a = new THREE.Vector3(-6, 9 + i * 0.4, z);
    const b = new THREE.Vector3(6, 9.4 - i * 0.3, z + 1);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    mid.y -= 1.2;
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(16)), wire));
  }
  // light rain
  const drops: THREE.Mesh[] = [];
  const dropMat = new THREE.MeshBasicMaterial({ color: "#c8c0ff", transparent: true, opacity: 0.22 });
  for (let i = 0; i < 70; i++) {
    const d = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.45, 0.015), dropMat);
    d.position.set(((i * 53) % 12) - 6, (i * 7) % 12, ((i * 31) % 13) - 9);
    scene.add(d);
    drops.push(d);
  }
  tickers.push(() => drops.forEach((d) => (d.position.y = d.position.y < 0 ? 12 : d.position.y - 0.25)));
  void wall;
}

export function lampPost(g: THREE.Object3D, x: number, z: number, night: boolean) {
  const metal = mat("#3c434c", { metal: 0.4, rough: 0.6 });
  cyl(g, 0.08, 0.11, 6.2, metal, x, 0, z, 12);
  const dir = Math.sign(x) || 1;
  box(g, 1.3, 0.08, 0.14, metal, x - dir * 0.55, 6.1, z);
  const head = box(g, 0.6, 0.14, 0.32, metal, x - dir * 1.15, 5.98, z);
  head.castShadow = false;
  const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.04, 0.24), new THREE.MeshBasicMaterial({ color: night ? "#ffe2a0" : "#f4f2ea" }));
  bulb.position.set(x - dir * 1.15, 5.96, z);
  g.add(bulb);
  if (night) {
    const l = new THREE.PointLight("#ffd79a", 12, 12, 1.5);
    l.position.set(x - dir * 1.15, 5.6, z);
    g.add(l);
  }
}

/* ---------------------------------------------------------------- small textures */

function dadoTexture(top: string, bottom: string, repeat: [number, number]) {
  const key = `dado|${top}|${bottom}`;
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, 128, 512);
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = shade(top, (Math.random() - 0.5) * 0.05);
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(Math.random() * 128, Math.random() * 512, 6 + Math.random() * 20, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const split = 512 * 0.85;
  ctx.fillStyle = bottom;
  ctx.fillRect(0, split, 128, 512 - split);
  ctx.fillStyle = shade(bottom, -0.15);
  ctx.fillRect(0, split - 4, 128, 4);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, t);
  return t;
}

function kerbTexture() {
  const key = "kerb";
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 8;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#f2f2ec";
  ctx.fillRect(0, 0, 64, 8);
  ctx.fillStyle = "#1a1a1c";
  ctx.fillRect(32, 0, 32, 8);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.repeat.set(75, 1);
  t.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, t);
  return t;
}

function zincTexture() {
  const key = "zinc";
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#9aa0a4";
  ctx.fillRect(0, 0, 128, 128);
  for (let x = 0; x < 128; x += 8) {
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fillRect(x, 0, 3, 128);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(x + 4, 0, 2, 128);
  }
  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = `rgba(${130 + Math.random() * 40},${60 + Math.random() * 20},30,0.45)`;
    ctx.beginPath();
    ctx.arc(Math.random() * 128, Math.random() * 128, 6 + Math.random() * 16, 0, Math.PI * 2);
    ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, t);
  return t;
}

function calendarTexture() {
  const key = "calendar";
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 192;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 128, 192);
  const g = ctx.createLinearGradient(0, 0, 128, 90);
  g.addColorStop(0, "#1d6a3a");
  g.addColorStop(1, "#f5c518");
  ctx.fillStyle = g;
  ctx.fillRect(6, 6, 116, 84);
  ctx.fillStyle = "#c0182b";
  ctx.font = "900 16px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("2026", 64, 108);
  ctx.fillStyle = "#333";
  for (let r = 0; r < 5; r++) for (let k = 0; k < 7; k++) ctx.fillRect(10 + k * 16, 118 + r * 14, 10, 8);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, t);
  return t;
}

function windowViewTexture(night: boolean) {
  const key = `winview|${night}`;
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 160;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 160);
  g.addColorStop(0, night ? "#141a40" : "#6fb2e6");
  g.addColorStop(1, night ? "#4a3a70" : "#d8ecf6");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 160);
  for (let i = 0; i < 14; i++) {
    const w = 14 + Math.random() * 18;
    const h = 40 + Math.random() * 90;
    const x = i * 19 - 6;
    ctx.fillStyle = night ? "#1e2238" : ["#8a96a4", "#a8b0b8", "#7a8898"][i % 3];
    ctx.fillRect(x, 160 - h, w, h);
    for (let y = 160 - h + 6; y < 156; y += 9)
      for (let xx = x + 3; xx < x + w - 3; xx += 6) {
        ctx.fillStyle = night ? (Math.random() < 0.4 ? "#ffd98a" : "#2a2e48") : "rgba(40,60,80,0.5)";
        ctx.fillRect(xx, y, 3, 4);
      }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, t);
  return t;
}

function billboardTexture(text: string, rand: () => number) {
  const key = `bill|${text}`;
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 220;
  const ctx = c.getContext("2d")!;
  const [bg, fg] = SIGN_COLORS[Math.floor(rand() * SIGN_COLORS.length)];
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 220);
  ctx.fillStyle = fg;
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.arc(430, 60, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.font = "900 44px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const tryLine = line ? `${line} ${w}` : w;
    if (ctx.measureText(tryLine).width > 470 && line) {
      lines.push(line);
      line = w;
    } else line = tryLine;
  }
  lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l, 256, 110 + (i - (lines.length - 1) / 2) * 52));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, t);
  return t;
}

/* ---------------------------------------------------------------- characters */

export interface PersonLook {
  skin: string;
  top: string;
  bottom: string;
  hat?: "fedora" | "cap" | "fila" | "gele" | "hood" | "hijab";
  /** A long kaftan or abaya over the legs. */
  robe?: boolean;
  hatColor?: string;
  hold?: "magnifier" | "camera" | "tray";
  /** Something carried while walking: a basin of goods on the head, or a phone at the ear. */
  carry?: "basin" | "phone";
  /** Print on the top: plain by default. */
  pattern?: "ankara" | "stripes";
  patternColor?: string;
}

function faceTexture(skin: string) {
  const key = `face|${skin}`;
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = skin;
  ctx.fillRect(0, 0, 64, 64);
  // brows, eyes, nose shadow, mouth
  ctx.fillStyle = "#1a120c";
  ctx.fillRect(14, 20, 12, 3);
  ctx.fillRect(38, 20, 12, 3);
  for (const x of [20, 44]) {
    ctx.fillStyle = "#f6f2ea";
    ctx.beginPath();
    ctx.ellipse(x, 29, 5.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#24160e";
    ctx.beginPath();
    ctx.arc(x, 29.5, 2.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = shade(skin, -0.1);
  ctx.fillRect(29, 31, 6, 10);
  ctx.strokeStyle = "#5a2a1c";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(32, 42, 8, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, t);
  return t;
}

function clothTexture(base: string, pattern: "ankara" | "stripes", accent: string) {
  const key = `cloth|${base}|${pattern}|${accent}`;
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = accent;
  ctx.strokeStyle = accent;
  if (pattern === "stripes") {
    for (let y = 0; y < 64; y += 10) ctx.fillRect(0, y, 64, 4);
  } else {
    // a simple wax-print: circles, leaves and dots
    ctx.lineWidth = 3;
    for (const [x, y] of [[16, 16], [48, 16], [32, 40], [0, 40], [64, 40], [16, 64], [48, 64], [16, 0], [48, 0]]) {
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = shade(accent, 0.2);
    for (const [x, y] of [[32, 14], [8, 28], [56, 28], [32, 60]]) {
      ctx.beginPath();
      ctx.ellipse(x, y, 6, 2.5, 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  texCache.set(key, t);
  return t;
}

/**
 * A person about 1.95 m tall, standing at the origin, facing +z. Clean blocky
 * shapes with a drawn face; arms and legs hang from pivots (userData.limbs).
 */
export function makePerson(look: PersonLook) {
  const g = new THREE.Group();
  const skin = mat(look.skin, { rough: 0.7 });
  const top = look.pattern ? mat("#ffffff", { map: clothTexture(look.top, look.pattern, look.patternColor ?? "#f5c518"), rough: 0.9 }) : mat(look.top, { rough: 0.9 });
  const bottom = mat(look.bottom, { rough: 0.9 });
  const shoe = mat("#1c1a18", { rough: 0.5 });

  const leg = (x: number) => {
    const hip = new THREE.Group();
    hip.position.set(x, 0.92, 0);
    box(hip, 0.18, 0.84, 0.2, bottom, 0, -0.86, 0);
    box(hip, 0.2, 0.1, 0.3, shoe, 0, -0.92, 0.04);
    g.add(hip);
    return hip;
  };
  const legL = leg(-0.11);
  const legR = leg(0.11);
  box(g, 0.46, 0.18, 0.26, bottom, 0, 0.84, 0);
  box(g, 0.52, 0.64, 0.28, top, 0, 0.98, 0);

  const arm = (x: number) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(x, 1.56, 0);
    box(shoulder, 0.15, 0.32, 0.16, top, 0, -0.32, 0);
    box(shoulder, 0.13, 0.3, 0.14, skin, 0, -0.6, 0);
    box(shoulder, 0.13, 0.12, 0.14, skin, 0, -0.72, 0.01);
    g.add(shoulder);
    return shoulder;
  };
  const armL = arm(-0.335);
  const armR = arm(0.335);

  box(g, 0.13, 0.08, 0.13, skin, 0, 1.62, 0);
  const head = new THREE.Group();
  head.position.set(0, 1.85, 0);
  const headMats = [skin, skin, skin, skin, mat("#ffffff", { map: faceTexture(look.skin), rough: 0.7 }), skin];
  const skull = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.34, 0.3, 2, 0.05), headMats);
  shadow(skull);
  head.add(skull);
  for (const sx of [-1, 1]) box(head, 0.04, 0.08, 0.06, skin, sx * 0.17, -0.04, 0);
  g.add(head);

  const hc = look.hatColor ?? "#4a3c2b";
  if (look.hat === "fedora") {
    cyl(head, 0.3, 0.3, 0.025, hc, 0, 0.15, 0, 24);
    cyl(head, 0.18, 0.2, 0.18, hc, 0, 0.16, 0, 24);
    cyl(head, 0.205, 0.205, 0.04, "#2b2f36", 0, 0.17, 0, 24);
  } else if (look.hat === "cap") {
    box(head, 0.34, 0.12, 0.32, hc, 0, 0.13, 0);
    box(head, 0.3, 0.025, 0.16, hc, 0, 0.14, 0.2);
  } else if (look.hat === "fila") {
    const f = box(head, 0.32, 0.16, 0.3, hc, 0.02, 0.14, 0);
    f.rotation.z = 0.18;
  } else if (look.hat === "gele") {
    const a = box(head, 0.5, 0.2, 0.36, hc, 0, 0.14, -0.02);
    a.rotation.z = 0.12;
    const b2 = box(head, 0.3, 0.22, 0.3, hc, 0.16, 0.26, -0.04);
    b2.rotation.z = -0.5;
  } else if (look.hat === "hijab") {
    box(head, 0.38, 0.44, 0.36, hc, 0, -0.2, -0.03);
    box(g, 0.62, 0.34, 0.36, hc, 0, 1.36, 0);
  } else if (look.hat === "hood") {
    box(head, 0.38, 0.42, 0.36, look.top, 0, -0.18, -0.03);
  } else {
    box(head, 0.33, 0.07, 0.31, "#16120e", 0, 0.15, -0.005);
  }

  if (look.hold === "magnifier") {
    box(armR, 0.035, 0.24, 0.035, "#5a4020", 0, -0.92, 0.04);
    const lens = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.018, 10, 24), mat("#d8b45a", { metal: 0.7, rough: 0.35 }));
    lens.position.set(0, -1.1, 0.06);
    lens.rotation.y = Math.PI / 2;
    armR.add(lens);
    armR.rotation.x = -0.9;
  } else if (look.hold === "camera") {
    box(armR, 0.24, 0.16, 0.14, "#2b2f36", 0, -0.82, 0.08);
    armR.rotation.x = -1.2;
  } else if (look.hold === "tray") {
    box(g, 0.66, 0.04, 0.46, "#c9a34a", 0, 2.12, 0);
    box(g, 0.14, 0.14, 0.14, "#c0182b", -0.15, 2.16, 0);
    box(g, 0.14, 0.14, 0.14, "#f5c518", 0.12, 2.16, 0.05);
    armL.rotation.z = 2.7;
    armR.rotation.z = -2.7;
  }
  if (look.robe) box(g, 0.56, 1.3, 0.32, top, 0, 0.12, 0);
  if (look.carry === "basin") {
    // an enamel basin of oranges balanced on a head-pad
    cyl(head, 0.16, 0.16, 0.05, "#e8e0d0", 0, 0.17, 0, 16);
    cyl(head, 0.34, 0.24, 0.16, mat("#2a7ab0", { rough: 0.35, metal: 0.2 }), 0, 0.22, 0, 24);
    for (const [ox, oz] of [[-0.12, -0.08], [0.1, -0.1], [0, 0.1], [0.14, 0.08], [-0.12, 0.1], [0, -0.02]]) sphere(head, 0.075, "#f08a1a", ox, 0.4, oz, 8);
  } else if (look.carry === "phone") {
    box(armR, 0.07, 0.14, 0.03, "#141414", 0, -0.8, 0.06);
  }
  g.userData.limbs = { legL, legR, armL, armR, head };
  return g;
}

/** Swing a person's arms and legs (phase in radians, amount 0..1). */
export function walkPose(person: THREE.Object3D, phase: number, amount = 1) {
  const l = person.userData.limbs as { legL: THREE.Object3D; legR: THREE.Object3D; armL: THREE.Object3D; armR: THREE.Object3D } | undefined;
  if (!l) return;
  const swing = Math.sin(phase) * 0.55 * amount;
  l.legL.rotation.x = swing;
  l.legR.rotation.x = -swing;
  l.armL.rotation.x = -swing * 0.8;
  l.armR.rotation.x = swing * 0.8;
}

export function makeDog() {
  const g = new THREE.Group();
  const fur = mat("#a87444", { rough: 0.95 });
  const dark = mat("#4a3020", { rough: 0.95 });
  box(g, 0.34, 0.34, 0.78, fur, 0, 0.36, 0);
  box(g, 0.37, 0.24, 0.46, "#1d2f5a", 0, 0.45, 0.04);
  const legs: THREE.Group[] = [];
  for (const [x, z] of [[-0.11, 0.28], [0.11, 0.28], [-0.11, -0.28], [0.11, -0.28]]) {
    const hip = new THREE.Group();
    hip.position.set(x, 0.38, z);
    box(hip, 0.1, 0.38, 0.1, fur, 0, -0.38, 0);
    g.add(hip);
    legs.push(hip);
  }
  g.userData.legs = legs;
  const head = new THREE.Group();
  head.position.set(0, 0.8, 0.42);
  box(head, 0.3, 0.28, 0.28, fur, 0, -0.14, 0);
  box(head, 0.18, 0.13, 0.18, "#e2c8a4", 0, -0.2, 0.2);
  box(head, 0.07, 0.05, 0.04, "#141414", 0, -0.12, 0.29);
  for (const sx of [-1, 1]) {
    box(head, 0.045, 0.045, 0.02, "#141414", sx * 0.07, -0.04, 0.14);
    const ear = box(head, 0.08, 0.14, 0.05, dark, sx * 0.12, 0.08, -0.04);
    ear.rotation.z = sx * 0.25;
  }
  g.add(head);
  const tail = new THREE.Group();
  tail.position.set(0, 0.62, -0.38);
  box(tail, 0.06, 0.26, 0.06, fur, 0, 0, -0.04).rotation.x = -0.6;
  g.add(tail);
  g.userData.tail = tail;
  g.userData.head = head;
  return g;
}

export const DETECTIVE: PersonLook = { skin: "#8D5524", top: "#a8865a", bottom: "#2b2f36", hat: "fedora", hatColor: "#3a2e22", hold: "magnifier" };
export const LAB_TECH: PersonLook = { skin: "#6b4226", top: "#f2f5f7", bottom: "#dfe6ea", hat: "hood", hold: "camera" };
