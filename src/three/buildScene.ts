/**
 * Turns a KitScene into a three.js scene. Each prop is placed so the centre
 * of its bounding box sits on the default camera's ray through its (x%, y%),
 * standing on the floor, hanging on the back wall, hanging from the ceiling,
 * or resting on the nearest table.
 */

import * as THREE from "three";
import type { KitProp, KitScene, PropKind } from "@/lib/types";
import { CEILING_KINDS, WALL_KINDS, makeProp } from "./props";
import { BRIDGE, DETECTIVE, LAB_TECH, buildBackdrop, cyl, defaultCamera, makeDog, makePerson, signBoard, walkPose, wallAd, type PersonLook } from "./world";

/** Small things that rest on a table if there is one nearby. */
const TABLETOP = new Set<PropKind>([
  "inhaler", "cog", "glass", "wine", "knife", "laptop", "monitor", "router", "cup", "phone", "paper", "card",
  "playingcard", "chip", "books", "camera", "spray", "goldbars", "lunchbox", "hardhat", "terracotta", "bowl",
  "gourd", "orchid", "flyer", "jewelbox",
]);

/** Furniture that things can rest on, and the height of its top (unscaled). */
const SURFACE_TOP: Partial<Record<PropKind, number>> = {
  desk: 0.85, dining: 0.9, banquet: 0.9, counter: 0.98, chess: 0.77, pedestal: 1.18, cabinet: 1.5, safe: 1.1,
  crate: 0.9, console: 0.9, djbooth: 1.14, bench: 0.57, chest: 1.35, stall: 1.02, chair: 0.6, kiosk: 0.95, sewing: 0.82,
};

export interface PlacedProp {
  prop: KitProp;
  index: number;
  obj: THREE.Object3D;
}

export interface BuiltScene {
  scene: THREE.Scene;
  tickers: ((t: number) => void)[];
  props: PlacedProp[];
  /** World point for a 2D (x%, y%) position, on whatever is there in the default view. */
  anchor: (x: number, y: number) => THREE.Vector3;
  /** The detective and his dog, when the scene has them. */
  cast?: CastControl;
  /** Detectives from other branches working the same scene live (with the cast). */
  crew?: CrewControl;
  dispose: () => void;
}

function rayFor(cam: THREE.PerspectiveCamera, x: number, y: number) {
  const p = new THREE.Vector3(x / 50 - 1, 1 - y / 50, 0.5).unproject(cam);
  return new THREE.Ray(cam.position.clone(), p.sub(cam.position).normalize());
}

function localBox(obj: THREE.Object3D) {
  obj.updateMatrixWorld(true);
  return new THREE.Box3().setFromObject(obj);
}

/** Streets with cars driving past (the bridge has its own traffic). */
function hasStreetTraffic(kit: KitScene) {
  const b = kit.backdrop;
  return b.kind === "outdoor" && (b.horizon === "city" || b.horizon === "none" || b.horizon === undefined) && (b.ground === "road" || b.ground === "concrete" || b.ground === "dirt");
}

/** Scenes with a road and traffic in them, which get the road sound. */
export function hasRoad(kit: KitScene) {
  const b = kit.backdrop;
  return hasStreetTraffic(kit) || (b.kind === "outdoor" && b.horizon === "mainland");
}

/** The same scene after dark: night sky outside, city lights in the window indoors. */
export function nightKit(kit: KitScene): KitScene {
  const b = kit.backdrop;
  if (b.kind === "outdoor") return { ...kit, backdrop: { ...b, sky: "night" } };
  if (b.kind === "indoor") return { ...kit, backdrop: { ...b, window: b.window === "none" ? "none" : "city-night" } };
  return kit;
}

export function buildKitScene(kit: KitScene, opts: { cast?: boolean; detective?: PersonLook } = {}): BuiltScene {
  const { scene, tickers } = buildBackdrop(kit);
  const cam = defaultCamera();
  const kind = kit.backdrop.kind;
  const outdoor = kind === "outdoor";
  const wallZ = kind === "alley" ? -9.08 : -8.98;
  const backLimit = outdoor ? -18 : wallZ;
  const sideLimit = kind === "alley" ? 5.9 : kind === "indoor" ? 10.8 : 40;
  const placed: PlacedProp[] = [];

  // furniture and big things first, so small things can rest on them
  const order = kit.props.map((p, i) => [p, i] as const).sort(([a], [b]) => Number(TABLETOP.has(a.kind)) - Number(TABLETOP.has(b.kind)));

  for (const [p, index] of order) {
    const obj = makeProp(p, tickers);
    const raw = localBox(obj).getSize(new THREE.Vector3());
    let s = p.s ?? 1;
    if (TABLETOP.has(p.kind) || Math.max(raw.x, raw.y, raw.z) < 0.7) s *= 1.3;
    obj.scale.setScalar(s);
    if (p.flip) obj.scale.x *= -1;
    const box = localBox(obj);
    const c = box.getCenter(new THREE.Vector3());
    const ray = rayFor(cam, p.x, p.y);
    const pos = new THREE.Vector3();

    const surface = TABLETOP.has(p.kind) ? nearestSurface(p, placed) : undefined;

    if (WALL_KINDS.has(p.kind) && !outdoor) {
      const zc = wallZ - box.min.z + c.z;
      const q = ray.at((zc - ray.origin.z) / ray.direction.z, new THREE.Vector3());
      pos.set(q.x - c.x, q.y - c.y, wallZ - box.min.z);
    } else if (WALL_KINDS.has(p.kind)) {
      // outdoors: on a post (or two) standing on the ground
      const zc = -6;
      const q = ray.at((zc - ray.origin.z) / ray.direction.z, new THREE.Vector3());
      pos.set(q.x - c.x, Math.max(0.6, q.y - c.y), zc - c.z);
      const width = box.max.x - box.min.x;
      const posts = width > 2.4 ? [box.min.x + 0.3, box.max.x - 0.3] : [c.x];
      for (const px of posts) cyl(scene, 0.07, 0.09, pos.y + box.min.y, "#4c5660", pos.x + px, 0, pos.z + box.min.z, 6);
    } else if (CEILING_KINDS.has(p.kind)) {
      const h = outdoor ? 6 : 6.6;
      const t = ray.direction.y > 0.02 ? (h - ray.origin.y) / ray.direction.y : (-4 - ray.origin.z) / ray.direction.z;
      const q = ray.at(t, new THREE.Vector3());
      q.z = Math.max(q.z, backLimit + 1);
      pos.set(q.x - c.x, q.y - c.y, q.z - c.z);
      if (!outdoor) {
        const top = pos.y + box.max.y;
        cyl(scene, 0.02, 0.02, 9 - top, "#c9a34a", pos.x + c.x, top, pos.z + c.z, 4);
      }
    } else if (surface) {
      const sb = localBox(surface.obj);
      const top = surface.obj.position.y + (SURFACE_TOP[surface.prop.kind] ?? 0.9) * surface.obj.scale.y;
      const hc = top + (c.y - box.min.y);
      const q = ray.direction.y < -0.001 ? ray.at((hc - ray.origin.y) / ray.direction.y, new THREE.Vector3()) : sb.getCenter(new THREE.Vector3());
      const mx = Math.min((box.max.x - box.min.x) / 2, (sb.max.x - sb.min.x) / 2 - 0.05);
      const mz = Math.min((box.max.z - box.min.z) / 2, (sb.max.z - sb.min.z) / 2 - 0.05);
      q.x = THREE.MathUtils.clamp(q.x, sb.min.x + mx, sb.max.x - mx);
      q.z = THREE.MathUtils.clamp(q.z, sb.min.z + mz, sb.max.z - mz);
      pos.set(q.x - c.x, top - box.min.y, q.z - c.z);
    } else {
      // standing on the floor
      const hc = c.y - box.min.y;
      let q: THREE.Vector3;
      let lift = 0;
      if (ray.direction.y < -0.001 && hc < ray.origin.y) q = ray.at((hc - ray.origin.y) / ray.direction.y, new THREE.Vector3());
      else q = ray.at((backLimit + 3 - ray.origin.z) / ray.direction.z, new THREE.Vector3());
      const backEdge = q.z - c.z + box.min.z;
      if (backEdge < backLimit) {
        const zc = backLimit - box.min.z + c.z;
        q = ray.at((zc - ray.origin.z) / ray.direction.z, new THREE.Vector3());
        lift = Math.max(0, q.y - hc);
      }
      if (q.z > 8) q.z = 8;
      pos.set(q.x - c.x, lift - box.min.y, q.z - c.z);
    }

    const halfW = (box.max.x - box.min.x) / 2;
    if (Math.abs(pos.x + c.x) + halfW > sideLimit) pos.x = Math.sign(pos.x + c.x) * (sideLimit - halfW) - c.x;
    obj.position.copy(pos);
    obj.userData.propIndex = index;
    scene.add(obj);
    placed.push({ prop: p, index, obj });
  }
  placed.sort((a, b) => a.index - b.index);
  scene.updateMatrixWorld(true);

  // anchors are worked out before the cast arrives, so people never block a clue
  const propObjs = placed.map((p) => p.obj);
  const background = scene.children.filter((o) => !propObjs.includes(o));
  const raycaster = new THREE.Raycaster();
  const solid = (h: THREE.Intersection) => {
    const m = h.object as THREE.Mesh;
    if (!m.isMesh) return false;
    const material = m.material as THREE.Material;
    return !(material.transparent && material.opacity < 0.5);
  };
  const anchor = (x: number, y: number) => {
    const ray = rayFor(cam, x, y);
    raycaster.set(ray.origin, ray.direction);
    const hit = raycaster.intersectObjects(propObjs, true).find(solid);
    if (hit) return hit.point.addScaledVector(ray.direction, -0.15);
    let best: PlacedProp | undefined;
    let bestD = 10;
    for (const p of placed) {
      const d = Math.hypot(p.prop.x - x, p.prop.y - y);
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    if (best) {
      const b = new THREE.Box3().setFromObject(best.obj);
      if (b.getSize(new THREE.Vector3()).length() < 6) return b.getCenter(new THREE.Vector3());
    }
    const bg = raycaster.intersectObjects(background, true).find(solid);
    if (bg) return bg.point.addScaledVector(ray.direction, -0.15);
    return ray.at(15, new THREE.Vector3());
  };

  addFeaturedAd(scene, kit, placed);
  const cast = opts.cast ? addCast(scene, kit, cam, tickers, placed, opts.detective ?? DETECTIVE) : undefined;
  const crew = opts.cast ? addCrew(scene, kit, cam, tickers, placed) : undefined;
  addLife(scene, kit, tickers, placed);

  return {
    scene,
    tickers,
    props: placed,
    anchor,
    cast,
    crew,
    dispose: () => {
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
    },
  };
}

/**
 * Scenes without a street behind them still get an advert slot in view: a
 * framed poster on a room's back wall, or a sign board by the road at the beach,
 * in the hills or on the bridge. It goes where no case prop is.
 */
function addFeaturedAd(scene: THREE.Scene, kit: KitScene, placed: PlacedProp[]) {
  const b = kit.backdrop;
  const boxes = placed.map((p) => new THREE.Box3().setFromObject(p.obj));
  const free = (minX: number, maxX: number, minY: number, maxY: number, minZ: number, maxZ: number) =>
    !boxes.some((bx) => bx.max.x > minX && bx.min.x < maxX && bx.max.y > minY && bx.min.y < maxY && bx.max.z > minZ && bx.min.z < maxZ);
  const seed = kit.props.length * 37 + Math.round(kit.props[0]?.x ?? 0);
  if (b.kind === "indoor") {
    // a framed poster on the back wall, where nothing hangs or stands in front of it
    const local = !b.decor || b.decor === "office" || b.decor === "shop" || b.decor === "warehouse";
    const spots: [number, number][] = [[-6.6, 3.6], [6.6, 3.6], [-4.4, 3.6], [4.4, 3.6], [-8.4, 3.6], [8.4, 3.6], [-6.6, 6.4], [6.6, 6.4], [-8.4, 6.4], [8.4, 6.4]];
    for (const [x, y] of spots) {
      if (b.window && b.window !== "none" && Math.abs(x) < 4.6) continue;
      if (free(x - 0.9, x + 0.9, y - 1.4, y + 1.2, -9.5, -6.5)) {
        wallAd(scene, x, y, seed, local);
        return;
      }
    }
    return;
  }
  if (b.kind !== "outdoor" || b.ground === "deck") return;
  const street = b.horizon === "city" || b.horizon === "none" || b.horizon === undefined;
  if (street) return;
  const z = b.horizon === "mainland" ? -16.3 : -14;
  for (const x of [6.5, -6.5, 9, -9, 4.5, -4.5]) {
    if (free(x - 1.7, x + 1.7, 0, 4.5, z - 1, z + 1)) {
      signBoard(scene, x, z, seed);
      return;
    }
  }
}

function nearestSurface(p: KitProp, placed: PlacedProp[]) {
  let best: PlacedProp | undefined;
  let bestD = 15;
  for (const q of placed) {
    if (SURFACE_TOP[q.prop.kind] === undefined) continue;
    const d = Math.hypot(q.prop.x - p.x, q.prop.y - p.y);
    if (d < bestD) {
      bestD = d;
      best = q;
    }
  }
  return best;
}

/** Put a person or dog on the floor so its middle shows at (x%, y%). */
function stand(scene: THREE.Scene, cam: THREE.PerspectiveCamera, obj: THREE.Object3D, x: number, y: number, faceIn: number) {
  obj.scale.setScalar(0.85);
  const box = localBox(obj);
  const c = box.getCenter(new THREE.Vector3());
  const ray = rayFor(cam, x, y);
  const q = ray.at((c.y - ray.origin.y) / ray.direction.y, new THREE.Vector3());
  obj.position.set(q.x - c.x, 0, Math.min(q.z, 8) - c.z);
  obj.rotation.y = faceIn;
  obj.traverse((o) => {
    o.castShadow = true;
    o.receiveShadow = true;
  });
  scene.add(obj);
  return obj;
}

/** Lets the page send the detective (and his dog) to look at something. */
export interface CastControl {
  /** Walk over to a point, crouch and study it; `arrived` fires once he is looking at it. */
  goTo: (target: THREE.Vector3, arrived?: () => void) => void;
}

/** Where people can stand in each kind of scene. */
function standArea(kit: KitScene) {
  const b = kit.backdrop;
  if (b.kind === "indoor") return { minX: -9.6, maxX: 9.6, minZ: -7.9, maxZ: 7.6 };
  if (b.kind === "alley") return { minX: -4.6, maxX: 4.6, minZ: -8.2, maxZ: 7.4 };
  if (b.horizon === "mainland") return { minX: -12, maxX: 14, minZ: -6.1, maxZ: 6.3 };
  return { minX: -14, maxX: 14, minZ: -15.5, maxZ: 7.6 };
}

const ease = (x: number) => x * x * (3 - 2 * x);

type Footprint = { minX: number; maxX: number; minZ: number; maxZ: number };

/** Does the segment a→b (on the ground) pass through the box? */
function crosses(ax: number, az: number, bx: number, bz: number, f: Footprint) {
  let t0 = 0;
  let t1 = 1;
  const dx = bx - ax;
  const dz = bz - az;
  for (const [p, d, lo, hi] of [
    [ax, dx, f.minX, f.maxX],
    [az, dz, f.minZ, f.maxZ],
  ] as const) {
    if (Math.abs(d) < 1e-9) {
      if (p < lo || p > hi) return false;
    } else {
      let u = (lo - p) / d;
      let v = (hi - p) / d;
      if (u > v) [u, v] = [v, u];
      t0 = Math.max(t0, u);
      t1 = Math.min(t1, v);
      if (t0 > t1) return false;
    }
  }
  return true;
}

/** A way from a to b that steps round the first thing in the way (cars, stalls, desks). */
function route(a: THREE.Vector3, b: THREE.Vector3, obstacles: Footprint[]): THREE.Vector3[] {
  const block = obstacles.find((f) => crosses(a.x, a.z, b.x, b.z, f) && !(a.x > f.minX && a.x < f.maxX && a.z > f.minZ && a.z < f.maxZ));
  if (!block) return [b];
  const corners = [
    [block.minX, block.minZ],
    [block.maxX, block.minZ],
    [block.minX, block.maxZ],
    [block.maxX, block.maxZ],
  ].map(([x, z]) => new THREE.Vector3(x, 0, z));
  let best: THREE.Vector3 | null = null;
  let bestLen = Infinity;
  for (const c of corners) {
    // nudge the corner outwards so he passes the edge, not scrapes it
    c.x += c.x === block.minX ? -0.15 : 0.15;
    c.z += c.z === block.minZ ? -0.15 : 0.15;
    if (crosses(a.x, a.z, c.x, c.z, { minX: block.minX + 0.05, maxX: block.maxX - 0.05, minZ: block.minZ + 0.05, maxZ: block.maxZ - 0.05 })) continue;
    const len = a.distanceTo(c) + c.distanceTo(b);
    if (len < bestLen) {
      bestLen = len;
      best = c;
    }
  }
  return best ? [best, b] : [b];
}

/** What stands on the floor and has to be walked round (not flat things like rugs or papers). */
function footprints(placed: PlacedProp[]): Footprint[] {
  return placed
    .map((p) => new THREE.Box3().setFromObject(p.obj))
    .filter((b) => b.max.y - b.min.y > 0.35 && b.min.y < 0.6 && (b.max.x - b.min.x) * (b.max.z - b.min.z) < 80)
    .map((b) => ({ minX: b.min.x - 0.4, maxX: b.max.x + 0.4, minZ: b.min.z - 0.4, maxZ: b.max.z + 0.4 }));
}

/** Where to stand to look at `target` from `from`: a step back from it, clear of things. */
function standOff(from: THREE.Vector3, target: THREE.Vector3, area: ReturnType<typeof standArea>, obstacles: Footprint[]) {
  const clampX = (x: number) => Math.min(area.maxX, Math.max(area.minX, x));
  const clampZ = (z: number) => Math.min(area.maxZ, Math.max(area.minZ, z));
  const ground = new THREE.Vector3(target.x, 0, target.z);
  const dir = new THREE.Vector3(from.x, 0, from.z).sub(ground);
  if (dir.lengthSq() < 0.01) dir.set(0, 0, 1);
  dir.normalize();
  const spot = ground.addScaledVector(dir, target.y > 2 ? 1.6 : 1.0);
  spot.set(clampX(spot.x), 0, clampZ(spot.z));
  for (const f of obstacles) {
    if (spot.x > f.minX && spot.x < f.maxX && spot.z > f.minZ && spot.z < f.maxZ) {
      const out = [
        [f.minX - 0.05, spot.z],
        [f.maxX + 0.05, spot.z],
        [spot.x, f.minZ - 0.05],
        [spot.x, f.maxZ + 0.05],
      ].sort((p, q) => Math.hypot(p[0] - spot.x, p[1] - spot.z) - Math.hypot(q[0] - spot.x, q[1] - spot.z))[0];
      spot.set(clampX(out[0]), 0, clampZ(out[1]));
    }
  }
  return spot;
}

/** Turn `a` towards `b` by at most `step` radians, the short way round. */
function turnTowards(a: number, b: number, step: number) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + Math.max(-step, Math.min(step, d));
}

/** A detective from another branch who is in this scene right now. */
export interface CrewMember {
  /** Stable per visitor (their room peer). */
  key: string;
  /** Shown on the name tag ("Det. Ada · Kano"). Plain text. */
  label: string;
  /** Their profile look (index), for coat and hat. */
  look: number;
  /** Their own designed look, when they have one (wins over `look`). */
  person?: PersonLook;
  /** What they are studying, or null to stand by. */
  target: THREE.Vector3 | null;
}

export interface CrewControl {
  set: (list: CrewMember[]) => void;
}

/** Coats and hats for visiting detectives, one per profile look, so each one is easy to tell apart. */
const CREW_LOOKS: PersonLook[] = [
  { skin: "#8D5524", top: "#2f5d8a", bottom: "#23272e", hat: "fedora", hatColor: "#1d2a3a", hold: "magnifier" },
  { skin: "#6b4226", top: "#8a2f4a", bottom: "#2b2f36", hat: "gele", hatColor: "#53FC18", hold: "magnifier" },
  { skin: "#4a2c17", top: "#3d6b3a", bottom: "#1f2328", hat: "cap", hatColor: "#1f2328", hold: "magnifier" },
  { skin: "#A0703C", top: "#6a4a8a", bottom: "#2b2f36", hold: "magnifier" },
  { skin: "#5C3A1E", top: "#b0642a", bottom: "#2b2f36", hat: "fila", hatColor: "#c0182b", hold: "magnifier" },
  { skin: "#8D5524", top: "#2a7a7a", bottom: "#23272e", hat: "cap", hatColor: "#53FC18", hold: "magnifier" },
];

const MAX_CREW = 4;

function nameTag(text: string) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 112;
  const g = c.getContext("2d");
  if (g) {
    g.font = "bold 44px system-ui, sans-serif";
    const w = Math.min(496, g.measureText(text).width + 72);
    const x = (512 - w) / 2;
    g.fillStyle = "rgba(20,22,27,0.82)";
    g.beginPath();
    if (g.roundRect) g.roundRect(x, 18, w, 76, 38);
    else g.rect(x, 18, w, 76);
    g.fill();
    g.fillStyle = "#53FC18";
    g.beginPath();
    g.arc(x + 32, 56, 9, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#ffffff";
    g.textBaseline = "middle";
    g.fillText(text, x + 52, 58, w - 72);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  sprite.scale.set(2.6, 0.57, 1);
  sprite.renderOrder = 10;
  sprite.raycast = () => {};
  return sprite;
}

/**
 * Other players' detectives. Each one walks in from the edge of the scene,
 * goes to whatever its player is studying (round things in the way) and
 * crouches over it, then wanders back to stand by when the player is idle.
 */
function addCrew(scene: THREE.Scene, kit: KitScene, cam: THREE.PerspectiveCamera, tickers: BuiltScene["tickers"], placed: PlacedProp[]): CrewControl {
  const side = kit.castSide ?? "left";
  // where visitors stand by: across from the player's own detective
  const homes: [number, number][] =
    side === "right" ? [[30, 84], [44, 88], [18, 80], [56, 86]] : side === "center" ? [[30, 82], [18, 86], [42, 88], [84, 84]] : [[70, 84], [56, 88], [82, 80], [44, 86]];
  const area = standArea(kit);
  const obstacles = footprints(placed);
  type Walker = {
    key: string;
    label: string;
    obj: THREE.Object3D;
    tag: THREE.Sprite;
    slot: number;
    home: THREE.Vector3;
    baseY: number;
    heading: number;
    stride: number;
    lean: number;
    target: THREE.Vector3 | null;
    path: THREE.Vector3[];
    studying: boolean;
  };
  const crew = new Map<string, Walker>();
  let last = 0;

  const plan = (w: Walker) => {
    const from = new THREE.Vector3(w.obj.position.x, 0, w.obj.position.z);
    const to = w.target ? standOff(from, w.target, area, obstacles) : w.home.clone();
    w.path = route(from, to, obstacles);
    w.studying = false;
  };

  const remove = (w: Walker) => {
    scene.remove(w.obj);
    w.tag.material.map?.dispose();
    w.tag.material.dispose();
    crew.delete(w.key);
  };

  tickers.push((t) => {
    const dt = Math.min(0.1, Math.max(0, t - last));
    last = t;
    for (const w of crew.values()) {
      let moving = 0;
      const next = w.path[0];
      if (next) {
        const dx = next.x - w.obj.position.x;
        const dz = next.z - w.obj.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 0.1) {
          w.path.shift();
          if (!w.path.length && w.target) w.studying = true;
        } else {
          const want = Math.atan2(dx, dz);
          w.heading = turnTowards(w.heading, want, dt * 6);
          const speed = 2.1 * Math.max(0.15, Math.cos(w.heading - want)) * Math.min(1, dist / 0.5 + 0.3);
          const step = Math.min(dist, speed * dt);
          w.obj.position.x += Math.sin(w.heading) * step;
          w.obj.position.z += Math.cos(w.heading) * step;
          moving = Math.min(1.2, speed / 1.6);
          w.stride += step * 5.2;
        }
      } else if (w.studying && w.target) {
        w.heading = turnTowards(w.heading, Math.atan2(w.target.x - w.obj.position.x, w.target.z - w.obj.position.z), dt * 5);
      } else {
        // stand by, facing into the scene, shifting about
        w.heading = turnTowards(w.heading, (w.home.x < 0 ? 0.4 : -0.4) + Math.sin(t * 0.4 + w.slot) * 0.5, dt * 1.2);
      }
      w.lean += ((w.studying ? 1 : 0) - w.lean) * Math.min(1, dt * 5);
      w.obj.rotation.y = w.heading;
      w.obj.rotation.x = w.lean * 0.22;
      w.obj.position.y = w.baseY + (moving ? Math.abs(Math.sin(w.stride)) * 0.035 * moving : Math.sin(t * 1.5 + w.slot) * 0.006) - w.lean * 0.08;
      walkPose(w.obj, w.stride, moving);
      const limbs = w.obj.userData.limbs as { armR: THREE.Object3D; head: THREE.Object3D } | undefined;
      if (limbs) {
        limbs.armR.rotation.x = moving ? -0.6 + Math.sin(w.stride) * 0.25 : -0.9 - w.lean * 0.75;
        limbs.head.rotation.x = w.studying ? 0.35 : limbs.head.rotation.x * 0.9;
        limbs.head.rotation.y = w.studying ? Math.sin(t * 2.2) * 0.1 : Math.sin(t * 0.6 + w.slot) * 0.35;
      }
    }
  });

  return {
    set: (list) => {
      const wanted = list.slice(0, MAX_CREW);
      const keep = new Set(wanted.map((m) => m.key));
      for (const w of [...crew.values()]) if (!keep.has(w.key)) remove(w);
      for (const m of wanted) {
        let w = crew.get(m.key);
        if (w && w.label !== m.label) {
          remove(w);
          w = undefined;
        }
        if (!w) {
          const used = new Set([...crew.values()].map((x) => x.slot));
          const slot = [0, 1, 2, 3].find((i) => !used.has(i)) ?? 0;
          const [hx, hy] = homes[slot];
          const obj = stand(scene, cam, makePerson(m.person ?? CREW_LOOKS[Math.abs(Math.floor(m.look)) % CREW_LOOKS.length]), hx, hy, 0);
          const home = obj.position.clone();
          // walk in from the near side of the scene
          obj.position.x = home.x < 0 ? area.minX : area.maxX;
          obj.position.z = Math.min(area.maxZ, home.z + 1.5);
          const tag = nameTag(m.label);
          tag.position.set(0, 2.55, 0);
          obj.add(tag);
          w = {
            key: m.key,
            label: m.label,
            obj,
            tag,
            slot,
            home: new THREE.Vector3(home.x, 0, home.z),
            baseY: home.y,
            heading: home.x < 0 ? Math.PI / 2 : -Math.PI / 2,
            stride: 0,
            lean: 0,
            target: m.target,
            path: [],
            studying: false,
          };
          crew.set(m.key, w);
          plan(w);
          continue;
        }
        const same = w.target && m.target ? w.target.distanceToSquared(m.target) < 0.01 : w.target === m.target;
        if (!same) {
          w.target = m.target;
          plan(w);
        }
      }
    },
  };
}

function addCast(scene: THREE.Scene, kit: KitScene, cam: THREE.PerspectiveCamera, tickers: BuiltScene["tickers"], placed: PlacedProp[], look: PersonLook): CastControl {
  const side = kit.castSide ?? "left";
  const spots = {
    left: { det: [9, 72], dog: [21, 80], turn: 0.5 },
    right: { det: [91, 72], dog: [79, 80], turn: -0.5 },
    center: { det: [60, 70], dog: [70, 76], turn: -0.3 },
  }[side];
  const det = stand(scene, cam, makePerson(look), spots.det[0], spots.det[1], spots.turn);
  const dog = stand(scene, cam, makeDog(), spots.dog[0], spots.dog[1], spots.turn * 1.6);
  const area = standArea(kit);
  // what stands on the floor and has to be walked round (not flat things like rugs or papers)
  const obstacles = footprints(placed);
  const clampX = (x: number) => Math.min(area.maxX, Math.max(area.minX, x));
  const clampZ = (z: number) => Math.min(area.maxZ, Math.max(area.minZ, z));
  const baseY = det.position.y;
  const limbs = det.userData.limbs as { armR: THREE.Object3D; armL: THREE.Object3D; head: THREE.Object3D; legL: THREE.Object3D; legR: THREE.Object3D } | undefined;
  const dogHead = dog.userData.head as THREE.Object3D | undefined;
  const dogTail = dog.userData.tail as THREE.Object3D | undefined;
  const dogLegs = dog.userData.legs as THREE.Object3D[] | undefined;

  // what he is doing: standing about, walking somewhere, or studying something
  type Plan =
    | { mode: "idle"; until: number }
    | { mode: "walk"; to: THREE.Vector3; via: THREE.Vector3[]; look: THREE.Vector3 | null; speed: number; arrived?: () => void }
    | { mode: "study"; look: THREE.Vector3; since: number; arrived?: () => void; told: boolean };
  let plan: Plan = { mode: "idle", until: 6 + Math.random() * 5 };
  let heading = det.rotation.y;
  let dogHeading = dog.rotation.y;
  let stride = 0;
  let dogStride = 0;
  let last = 0;
  let lean = 0;
  let pendingGo: { target: THREE.Vector3; arrived?: () => void } | null = null;

  const go = (target: THREE.Vector3, arrived?: () => void) => {
    // stand a little way back from the thing, on the side nearest to where he is now
    const from = new THREE.Vector3(det.position.x, 0, det.position.z);
    const spot = standOff(from, target, area, obstacles);
    const path = route(from, spot, obstacles);
    plan = { mode: "walk", to: path[0], via: path.slice(1), look: target.clone(), speed: 2.3, arrived };
  };

  tickers.push((t) => {
    const dt = Math.min(0.1, Math.max(0, t - last));
    last = t;
    if (pendingGo) {
      go(pendingGo.target, pendingGo.arrived);
      pendingGo = null;
    }
    let moving = 0;
    let studying = 0;

    if (plan.mode === "idle") {
      // breathe, shift weight, look around; now and then wander a step or two
      if (t > plan.until) {
        const a = Math.random() * Math.PI * 2;
        const r = 0.6 + Math.random() * 1.2;
        const to = new THREE.Vector3(clampX(det.position.x + Math.cos(a) * r), 0, clampZ(det.position.z + Math.sin(a) * r * 0.6));
        const path = route(new THREE.Vector3(det.position.x, 0, det.position.z), to, obstacles);
        plan = { mode: "walk", to: path[0], via: path.slice(1), look: null, speed: 0.9 };
      }
    } else if (plan.mode === "walk") {
      const dx = plan.to.x - det.position.x;
      const dz = plan.to.z - det.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.15 && plan.via.length) {
        plan.to = plan.via.shift()!;
      } else if (dist < 0.08) {
        plan = plan.look ? { mode: "study", look: plan.look, since: t, arrived: plan.arrived, told: false } : { mode: "idle", until: t + 7 + Math.random() * 7 };
      } else {
        const want = Math.atan2(dx, dz);
        heading = turnTowards(heading, want, dt * 7);
        // slow down to turn, and ease in at the end
        const facing = Math.cos(heading - want);
        // brisk when it is far (counting the corners still to go), easing in at the end
        const head = plan.to;
        const left = dist + plan.via.reduce((n, p, i, arr) => n + p.distanceTo(i ? arr[i - 1] : head), 0);
        const pace = plan.look ? Math.min(3.4, plan.speed + left * 0.12) : plan.speed;
        const speed = pace * Math.max(0.15, facing) * Math.min(1, dist / 0.5 + 0.3);
        const step = Math.min(dist, speed * dt);
        det.position.x += Math.sin(heading) * step;
        det.position.z += Math.cos(heading) * step;
        moving = Math.min(1.25, speed / 1.6);
        stride += step * 5.2;
      }
    } else if (plan.mode === "study") {
      const dx = plan.look.x - det.position.x;
      const dz = plan.look.z - det.position.z;
      heading = turnTowards(heading, Math.atan2(dx, dz), dt * 5);
      const k = t - plan.since;
      studying = ease(Math.min(1, k / 0.45));
      if (!plan.told && k > 0.75) {
        plan.told = true;
        plan.arrived?.();
      }
      if (k > 2.6) plan = { mode: "idle", until: t + 8 + Math.random() * 6 };
    }

    // the detective's body
    lean += ((studying ? 1 : 0) - lean) * Math.min(1, dt * 6);
    det.rotation.y = heading + (plan.mode === "idle" ? Math.sin(t * 0.45) * 0.12 : 0);
    det.rotation.x = lean * 0.22;
    det.rotation.z = plan.mode === "idle" ? Math.sin(t * 0.7) * 0.015 : 0;
    det.position.y = baseY + (moving ? Math.abs(Math.sin(stride)) * 0.035 * moving : Math.sin(t * 1.6) * 0.006) - lean * 0.08;
    walkPose(det, stride, moving);
    if (limbs) {
      if (moving) limbs.armR.rotation.x = -0.6 + Math.sin(stride) * 0.25;
      else limbs.armR.rotation.x = -0.9 - lean * 0.75;
      if (plan.mode === "study") {
        // look at it: down at the ground, up at a camera on the wall
        const p = plan.look;
        const d = Math.max(0.5, Math.hypot(p.x - det.position.x, p.z - det.position.z));
        limbs.head.rotation.x = THREE.MathUtils.clamp(-Math.atan2(p.y - 1.6, d), -0.6, 0.7) * 0.8 + lean * 0.15;
        limbs.head.rotation.y = Math.sin(t * 2.2) * 0.08;
      } else {
        limbs.head.rotation.x *= 0.9;
        limbs.head.rotation.y = moving ? Math.sin(t * 1.3) * 0.15 : Math.sin(t * 0.7) * 0.4;
      }
    }

    // the dog: keeps to his side, then noses in at whatever he is studying
    const sideOff = new THREE.Vector3(Math.sin(heading + 1.4), 0, Math.cos(heading + 1.4)).multiplyScalar(0.9);
    const behind = new THREE.Vector3(Math.sin(heading), 0, Math.cos(heading)).multiplyScalar(-0.35);
    let dogTo = det.position.clone().add(sideOff).add(behind);
    let sniff = false;
    if (plan.mode === "study") {
      const p = plan.look;
      const toward = new THREE.Vector3(p.x - det.position.x, 0, p.z - det.position.z);
      const len = toward.length();
      if (len > 0.01) toward.multiplyScalar(Math.min(len, 0.8) / len);
      dogTo = det.position.clone().add(toward).add(sideOff.clone().multiplyScalar(0.6));
      sniff = true;
    }
    dogTo.x = clampX(dogTo.x);
    dogTo.z = clampZ(dogTo.z);
    const ddx = dogTo.x - dog.position.x;
    const ddz = dogTo.z - dog.position.z;
    const dd = Math.hypot(ddx, ddz);
    let dogMoving = 0;
    if (dd > 0.12) {
      const want = Math.atan2(ddx, ddz);
      dogHeading = turnTowards(dogHeading, want, dt * 9);
      const speed = Math.min(3.2, 0.6 + dd * 2.2);
      const step = Math.min(dd, speed * dt);
      dog.position.x += Math.sin(dogHeading) * step;
      dog.position.z += Math.cos(dogHeading) * step;
      dogMoving = Math.min(1, speed / 1.5);
      dogStride += step * 9;
    } else if (sniff) {
      const p = (plan as { look: THREE.Vector3 }).look;
      dogHeading = turnTowards(dogHeading, Math.atan2(p.x - dog.position.x, p.z - dog.position.z), dt * 5);
    } else {
      dogHeading = turnTowards(dogHeading, heading + Math.sin(t * 0.4) * 0.6, dt * 1.5);
    }
    dog.rotation.y = dogHeading;
    dog.position.y = dogMoving ? Math.abs(Math.sin(dogStride)) * 0.04 : 0;
    dogLegs?.forEach((l, i) => (l.rotation.x = dogMoving ? Math.sin(dogStride + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.55 * dogMoving : l.rotation.x * 0.8));
    const idleSniff = plan.mode === "idle" && t % 12 > 3 && t % 12 < 6;
    if (dogHead) {
      dogHead.rotation.x = sniff || idleSniff ? 0.5 + Math.sin(t * 10) * 0.06 : dogMoving ? Math.sin(dogStride * 2) * 0.05 : Math.sin(t * 2.1) * 0.08;
      dogHead.rotation.y = sniff ? Math.sin(t * 2.5) * 0.35 : Math.sin(t * 0.6) * 0.2;
    }
    if (dogTail) dogTail.rotation.z = Math.sin(t * (sniff ? 17 : dogMoving ? 13 : 8)) * (sniff ? 0.75 : 0.45);
  });

  if (kit.tech) {
    const tech = stand(scene, cam, makePerson(LAB_TECH), kit.tech[0], Math.max(kit.tech[1], 60), -spots.turn);
    const ty = tech.position.y;
    const arm = (tech.userData.limbs as { armR: THREE.Object3D } | undefined)?.armR;
    // the forensic photographer crouches, aims and fires the flash
    const flash = new THREE.PointLight("#ffffff", 0, 7, 1.6);
    flash.position.set(0, 1.4, 0.6);
    tech.add(flash);
    tickers.push((t) => {
      const c = t % 4.6;
      const crouch = c < 2.4 ? ease(Math.min(1, c / 0.5, (2.4 - c) / 0.5)) : 0;
      tech.position.y = ty - crouch * 0.12;
      tech.rotation.x = crouch * 0.18;
      if (arm) arm.rotation.x = -1.2 - crouch * 0.35;
      flash.intensity = c > 1.2 && c < 1.32 ? 30 : 0;
    });
  }

  // requests are applied on the next frame, so they always use the latest position
  return { goTo: (target, arrived) => (pendingGo = { target, arrived }) };
}

/* ---------------------------------------------------------------- life: passers-by, traffic, birds, dust */

const PASSERS: PersonLook[] = [
  { skin: "#6b4226", top: "#c0182b", bottom: "#c0182b", hat: "gele", hatColor: "#f5c518", pattern: "ankara", patternColor: "#f5c518" },
  { skin: "#4a2c17", top: "#1d6a8a", bottom: "#e8e0d0", hat: "cap", hatColor: "#141414", carry: "phone" },
  { skin: "#8D5524", top: "#3a8a4a", bottom: "#3a2a1a", pattern: "stripes", patternColor: "#f2efe6" },
  { skin: "#5C3A1E", top: "#e07a2a", bottom: "#2b2f36", pattern: "ankara", patternColor: "#1d4a8a", carry: "basin" },
  { skin: "#5C3A1E", top: "#f2f2e8", bottom: "#f2f2e8", hat: "fila", hatColor: "#8a1a2a" },
  { skin: "#7a4a2a", top: "#1d2f5a", bottom: "#1d2f5a", hat: "gele", hatColor: "#e07a2a", pattern: "ankara", patternColor: "#e07a2a" },
  { skin: "#5a3418", top: "#e8e0d0", bottom: "#2b2f36", pattern: "stripes", patternColor: "#1d4a8a", carry: "phone" },
  { skin: "#6b4226", top: "#7a1f6a", bottom: "#7a1f6a", pattern: "ankara", patternColor: "#f2efe6", carry: "basin" },
];

// in the north: kaftans, caps and hijabs
const NORTH_PASSERS: PersonLook[] = [
  { skin: "#5C3A1E", top: "#f2f2e8", bottom: "#f2f2e8", hat: "cap", hatColor: "#3a5a8a", robe: true },
  { skin: "#4a2c17", top: "#9ab8d0", bottom: "#9ab8d0", hat: "fila", hatColor: "#f2f2e8", robe: true },
  { skin: "#6b4226", top: "#3a2a5a", bottom: "#3a2a5a", hat: "hijab", hatColor: "#1d1f22", robe: true },
  { skin: "#5a3418", top: "#e8dcc0", bottom: "#e8dcc0", hat: "cap", hatColor: "#7a1f2a", robe: true, carry: "phone" },
  { skin: "#7a4a2a", top: "#2a5a6a", bottom: "#2a5a6a", hat: "hijab", hatColor: "#6a2a5a", robe: true, carry: "basin" },
  { skin: "#4a2c17", top: "#1d6a8a", bottom: "#e8e0d0", hat: "cap", hatColor: "#141414" },
];

const smooth = (x: number) => x * x * (3 - 2 * x);

/**
 * Someone walking a stretch of pavement: walk, slow down, pause and look around,
 * turn round, and walk back, with a bounce in the step.
 */
function walker(scene: THREE.Scene, look: PersonLook, lane: { z: number; half: number; y: number }, tickers: BuiltScene["tickers"], offset: number) {
  const p = makePerson(look);
  p.scale.setScalar(0.92 + Math.random() * 0.12);
  p.traverse((o) => (o.castShadow = true));
  scene.add(p);
  const limbs = p.userData.limbs as { armL: THREE.Object3D; armR: THREE.Object3D; head: THREE.Object3D } | undefined;
  const speed = look.carry === "basin" ? 0.8 + Math.random() * 0.2 : 1.0 + Math.random() * 0.45;
  const span = lane.half * 2 * (0.6 + Math.random() * 0.4);
  const start = -lane.half + Math.random() * (lane.half * 2 - span);
  const walkT = span / speed;
  const pause = 1.2 + Math.random() * 2.5;
  const turnT = 0.8;
  const leg = walkT + pause + turnT;
  const cycle = leg * 2;
  tickers.push((t) => {
    const c = (t + offset) % cycle;
    const back = c >= leg;
    const k = back ? c - leg : c;
    let x: number;
    let heading: number;
    let moving = 0;
    const dir = back ? -1 : 1;
    const from = back ? start + span : start;
    if (k < walkT) {
      // ease in and out at each end of the stretch
      const f = k / walkT;
      const eased = f < 0.08 ? smooth(f / 0.08) * 0.08 : f > 0.92 ? 0.92 + smooth((f - 0.92) / 0.08) * 0.08 : f;
      x = from + dir * eased * span;
      heading = dir * (Math.PI / 2);
      moving = f < 0.08 ? f / 0.08 : f > 0.92 ? (1 - f) / 0.08 : 1;
    } else {
      x = from + dir * span;
      const turning = k > walkT + pause ? smooth((k - walkT - pause) / turnT) : 0;
      heading = dir * (Math.PI / 2) - dir * turning * Math.PI;
    }
    p.position.set(x, lane.y + Math.abs(Math.sin((t + offset) * speed * 5.2)) * 0.03 * moving, lane.z);
    p.rotation.y = heading;
    p.rotation.x = moving * 0.04;
    walkPose(p, (t + offset) * speed * 5.2, moving);
    if (limbs) {
      if (look.carry === "phone") {
        limbs.armR.rotation.x = -2.5;
        limbs.armR.rotation.z = 0.35;
      }
      if (look.carry === "basin") limbs.armL.rotation.z = 2.75;
      // look around while standing
      limbs.head.rotation.y = moving < 0.5 ? Math.sin((t + offset) * 1.3) * 0.6 : Math.sin((t + offset) * 0.8) * 0.12;
    }
  });
}

/** Lanes where traffic can pass without driving through anything in the scene. */
function clearLanes(placed: PlacedProp[], lanes: number[]) {
  const boxes = placed.map((p) => new THREE.Box3().setFromObject(p.obj));
  return lanes.filter((z) => !boxes.some((b) => b.max.z > z - 1.3 && b.min.z < z + 1.3 && b.max.x > -60 && b.min.x < 60));
}

const TRAFFIC: KitProp[] = [
  { kind: "car", x: 0, y: 0, color: "#c8ccd0" },
  { kind: "okada", x: 0, y: 0, color: "#c0182b" },
  { kind: "bus", x: 0, y: 0, label: "OJUELEGBA–CMS" },
  { kind: "keke", x: 0, y: 0, color: "#f5c518" },
  { kind: "car", x: 0, y: 0, color: "#1d1f22" },
  { kind: "car", x: 0, y: 0, color: "#8a1a2a" },
];

/** A vehicle with a rider or driver where one would be seen. Faces +x. */
function vehicle(proto: KitProp, tickers: BuiltScene["tickers"]) {
  const g = new THREE.Group();
  const v = makeProp(proto, tickers);
  if (proto.kind === "okada" || proto.kind === "keke") v.rotation.y = Math.PI / 2;
  g.add(v);
  if (proto.kind === "okada" || proto.kind === "keke") {
    const rider = makePerson({ skin: "#4a2c17", top: proto.kind === "okada" ? "#2b2f36" : "#e8e0d0", bottom: "#1d2126", hat: "cap", hatColor: "#c0182b" });
    const l = rider.userData.limbs as { legL: THREE.Object3D; legR: THREE.Object3D; armL: THREE.Object3D; armR: THREE.Object3D };
    l.legL.rotation.x = l.legR.rotation.x = -1.3;
    l.armL.rotation.x = l.armR.rotation.x = -1.2;
    rider.scale.setScalar(0.9);
    rider.rotation.y = Math.PI / 2;
    rider.position.set(proto.kind === "okada" ? -0.15 : 0.35, proto.kind === "okada" ? -0.05 : 0.0, 0);
    g.add(rider);
    if (proto.kind === "okada") {
      // a passenger behind the rider
      const back = makePerson({ skin: "#6b4226", top: "#7a1f6a", bottom: "#7a1f6a", hat: "gele", hatColor: "#f5c518", pattern: "ankara", patternColor: "#f5c518" });
      const bl = back.userData.limbs as typeof l;
      bl.legL.rotation.x = bl.legR.rotation.x = -1.3;
      back.scale.setScalar(0.88);
      back.rotation.y = Math.PI / 2;
      back.position.set(-0.55, -0.02, 0);
      g.add(back);
    }
  }
  g.traverse((o) => (o.castShadow = true));
  return g;
}

/** Cars, okadas, kekes and danfos going up and down the road behind the scene. */
function addStreetTraffic(scene: THREE.Scene, placed: PlacedProp[], tickers: BuiltScene["tickers"]) {
  const lanes = clearLanes(placed, [-15.0, -13.2]);
  let k = Math.floor(Math.random() * TRAFFIC.length);
  lanes.forEach((z, li) => {
    const dir = li === 0 ? 1 : -1;
    const speed = li === 0 ? 7.5 : 6;
    const count = 3;
    const loop = 180;
    for (let i = 0; i < count; i++) {
      const v = vehicle(TRAFFIC[k++ % TRAFFIC.length], tickers);
      if (dir < 0) v.rotation.y = Math.PI;
      scene.add(v);
      const offset = (i * loop) / count + Math.random() * 20;
      tickers.push((t) => {
        const d = (offset + t * speed) % loop;
        v.position.set(dir * (d - loop / 2), Math.sin(t * 11 + i) * 0.012, z);
        // a little sway, as on a Nigerian road
        v.rotation.z = Math.sin(t * 3 + i) * 0.008;
      });
    }
  });
}

function addLife(scene: THREE.Scene, kit: KitScene, tickers: BuiltScene["tickers"], placed: PlacedProp[]) {
  const b = kit.backdrop;
  const onBridge = b.kind === "outdoor" && b.horizon === "mainland";
  if (onBridge) addTraffic(scene, tickers);
  // people walking along the pavement at the back of streets and alleys
  if (b.kind !== "indoor" && !onBridge) {
    const lanes = b.kind === "alley" ? [{ z: -7.6, half: 4.6, y: 0 }] : [{ z: -19.6, half: 26, y: 0.14 }, { z: -18.5, half: 22, y: 0.14 }];
    const people = kit.look === "sahel" ? NORTH_PASSERS : PASSERS;
    let k = Math.floor(Math.random() * people.length);
    for (const lane of lanes) {
      const count = b.kind === "alley" ? 1 : 4;
      for (let i = 0; i < count; i++) walker(scene, people[k++ % people.length], { ...lane, z: lane.z + i * 0.35 }, tickers, Math.random() * 100);
    }
    if (hasStreetTraffic(kit)) addStreetTraffic(scene, placed, tickers);
  }

  // birds over daytime streets
  if (b.kind === "outdoor" && b.sky !== "night") {
    const wing = new THREE.MeshBasicMaterial({ color: "#1d2126", side: THREE.DoubleSide, fog: false });
    for (let i = 0; i < 5; i++) {
      const bird = new THREE.Group();
      for (const side of [-1, 1]) {
        const w = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.16), wing);
        w.position.x = side * 0.33;
        const pivot = new THREE.Group();
        pivot.add(w);
        pivot.userData.side = side;
        bird.add(pivot);
      }
      scene.add(bird);
      const r = 10 + i * 2.5;
      const h = 13 + (i % 3) * 1.6;
      const speed = 0.12 + i * 0.015;
      const phase = i * 1.3;
      tickers.push((t) => {
        const a = t * speed + phase;
        bird.position.set(Math.cos(a) * r, h + Math.sin(t * 0.7 + i) * 0.5, -28 + Math.sin(a) * r * 0.5);
        bird.rotation.y = -a;
        const flap = Math.sin(t * 9 + i) * 0.6;
        bird.children.forEach((c) => (c.rotation.z = (c.userData.side as number) * flap));
      });
    }
  }

  // dust floating in the light indoors
  if (b.kind === "indoor") {
    const n = 70;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = 0.4 + Math.random() * 5.5;
      pos[i * 3 + 2] = -8 + Math.random() * 15;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const dots = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ map: softDot(), size: 0.05, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending, color: "#ffe9c4" }),
    );
    scene.add(dots);
    tickers.push((t) => {
      dots.position.y = Math.sin(t * 0.15) * 0.25;
      dots.rotation.y = Math.sin(t * 0.05) * 0.05;
    });
  }
}

/* ---------------------------------------------------------------- traffic on the bridge */

const VEHICLES: KitProp[] = [
  { kind: "car", x: 0, y: 0, color: "#c8ccd0" },
  { kind: "bus", x: 0, y: 0, label: "OSHODI\u2013OBALENDE" },
  { kind: "car", x: 0, y: 0, color: "#1d1f22" },
  { kind: "suv", x: 0, y: 0, color: "#f2f2ec" },
  { kind: "car", x: 0, y: 0, color: "#8a1a2a" },
  { kind: "bus", x: 0, y: 0, label: "CMS\u2013OJOTA" },
  { kind: "car", x: 0, y: 0, color: "#1d4a8a" },
  { kind: "car", x: 0, y: 0, color: "#e8e0d0" },
  { kind: "suv", x: 0, y: 0, color: "#2b2f36" },
  { kind: "car", x: 0, y: 0, color: "#3a6a4a" },
];

/** A path as points with running distances, so a vehicle can be placed at any distance along it. */
function pathOf(points: [number, number][]) {
  const d = [0];
  for (let i = 1; i < points.length; i++) d.push(d[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
  const length = d[d.length - 1];
  const at = (dist: number) => {
    const x = ((dist % length) + length) % length;
    let i = 1;
    while (i < d.length - 1 && d[i] < x) i++;
    const f = (x - d[i - 1]) / (d[i] - d[i - 1]);
    const [ax, az] = points[i - 1];
    const [bx, bz] = points[i];
    return [ax + (bx - ax) * f, az + (bz - az) * f] as const;
  };
  return { length, at };
}

/**
 * Cars crawling through the diversion and racing the other way on the far carriageway.
 * Vehicles are evenly spaced along a loop, so they never run into each other.
 */
function addTraffic(scene: THREE.Scene, tickers: BuiltScene["tickers"]) {
  const lanes = [
    { path: pathOf(BRIDGE.diverted), count: 16, speed: 3.6 },
    { path: pathOf(BRIDGE.oncoming), count: 12, speed: 10.5 },
  ];
  let k = 0;
  for (const lane of lanes) {
    const gap = lane.path.length / lane.count;
    for (let i = 0; i < lane.count; i++) {
      const v = makeProp(VEHICLES[k++ % VEHICLES.length], tickers);
      scene.add(v);
      const start = i * gap + Math.random() * gap * 0.35;
      tickers.push((t) => {
        const d = start + t * lane.speed;
        const [x, z] = lane.path.at(d);
        const [ax, az] = lane.path.at(d + 2.5);
        const [bx, bz] = lane.path.at(d - 2.5);
        v.position.set(x, 0, z);
        // models face +x: point them along the road, wrapping cleanly at the ends
        if (Math.abs(ax - bx) < 50) v.rotation.y = Math.atan2(-(az - bz), ax - bx);
        v.position.y = Math.sin(t * 9 + i) * 0.012;
      });
    }
  }
}

let dot: THREE.Texture | null = null;
function softDot() {
  if (dot) return dot;
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  dot = new THREE.CanvasTexture(c);
  return dot;
}
