"use client";

import { useEffect, useRef, useState, type MutableRefObject, type ReactNode } from "react";
import * as THREE from "three";
import type { CrimeCase } from "@/lib/types";
import { adOfMesh, openAd } from "@/three/adSlots";
import { buildKitScene, nightKit, type BuiltScene } from "@/three/buildScene";
import { lightScene, makePipeline, setupRenderer, type Pipeline } from "@/three/render";
import { kitOf } from "@/three/sceneKits";
import { CAMERA_POS, CAMERA_TARGET, FOV, type PersonLook } from "@/three/world";
import { CaseScene } from "./CrimeScene";
import { setLiveScene } from "./SceneThumb";

export interface Anchor {
  id: string;
  x: number;
  y: number;
}

export interface Scene3DHandle {
  /** Where an anchor shows right now, as % of the scene box. */
  project: (id: string) => { x: number; y: number } | null;
  resetView: () => void;
  /** Which kit prop is under a point (% of the scene box), in 3D only. */
  pick?: (x: number, y: number) => { kind: string; index: number } | null;
  /** Send the detective to look at an anchor; `arrived` fires when he is studying it (at once without 3D). */
  walkTo?: (id: string, arrived: () => void) => void;
}

/** Another player's detective in the scene, heading to the anchor it is studying. */
export interface CrewSpec {
  key: string;
  label: string;
  look: number;
  /** Their own designed look, when they have one. */
  person?: PersonLook;
  at: string | null;
}

let webgl: boolean | undefined;
export function hasWebGL() {
  if (webgl === undefined) {
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

const YAW_MAX = 1.15;
const PITCH_MIN = -0.3;
const PITCH_MAX = 0.6;
const ZOOM_MIN = 0.42;
const ZOOM_MAX = 1.3;

/**
 * A live 3D crime scene. Drag to look around; children with `data-anchor="id"`
 * are kept pinned over that anchor's spot in the scene as the camera moves.
 * Without WebGL it falls back to the flat drawn scene with the same anchors.
 */
export function Scene3D({
  theCase,
  anchors,
  cast = true,
  intro = true,
  onTap,
  apiRef,
  children,
  className = "",
  chipInset = 8,
  fullTouch = false,
  crew,
  detective,
  night = false,
}: {
  theCase: CrimeCase;
  anchors: Anchor[];
  cast?: boolean;
  intro?: boolean;
  onTap?: (x: number, y: number) => void;
  apiRef?: MutableRefObject<Scene3DHandle | null>;
  children?: ReactNode;
  className?: string;
  /** Distance of the hint and reset chips from the bottom edge, in px. */
  chipInset?: number;
  /** Let one finger look up and down too (the page won't scroll under it). */
  fullTouch?: boolean;
  /** Other players' detectives to show walking the scene. */
  crew?: CrewSpec[];
  /** How the player's own detective looks (their designed look). */
  detective?: PersonLook;
  /** Show the scene at night (the Night Shift unlock). */
  night?: boolean;
}) {
  const detectiveKey = detective ? JSON.stringify(detective) : "";
  const detectiveRef = useRef(detective);
  detectiveRef.current = detective;
  const wrap = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [moved, setMoved] = useState(false);
  const anchorsRef = useRef(anchors);
  anchorsRef.current = anchors;
  const crewRef = useRef(crew);
  crewRef.current = crew;
  const applyCrew = () => {
    const w = world.current;
    if (!w?.built.crew) return;
    w.built.crew.set((crewRef.current ?? []).map((m) => ({ key: m.key, label: m.label, look: m.look, person: m.person, target: (m.at && w.points.get(m.at)) || null })));
  };
  const anchorKey = anchors.map((a) => `${a.id}@${a.x},${a.y}`).join("|");
  const world = useRef<{ built: BuiltScene; points: Map<string, THREE.Vector3>; camera: THREE.PerspectiveCamera } | null>(null);
  const view = useRef({
    yaw: 0,
    pitch: 0,
    zoom: 1,
    tYaw: 0,
    tPitch: 0,
    tZoom: 1,
    velYaw: 0,
    dragging: false,
    target: CAMERA_TARGET.clone(),
    tTarget: CAMERA_TARGET.clone(),
  });
  const fullTouchRef = useRef(fullTouch);
  fullTouchRef.current = fullTouch;
  const onTapRef = useRef(onTap);
  onTapRef.current = onTap;

  // fallback: 2D positions straight from the anchors
  useEffect(() => {
    if (!failed) return;
    if (apiRef)
      apiRef.current = {
        project: (id) => {
          const a = anchorsRef.current.find((x) => x.id === id);
          return a ? { x: a.x, y: a.y } : null;
        },
        resetView: () => {},
      };
    overlay.current?.querySelectorAll<HTMLElement>("[data-anchor]").forEach((el) => {
      const a = anchorsRef.current.find((x) => x.id === el.dataset.anchor);
      if (a) {
        el.style.left = `${a.x}%`;
        el.style.top = `${a.y}%`;
      }
    });
  });

  useEffect(() => {
    if (!hasWebGL()) {
      setFailed(true);
      return;
    }
    const el = wrap.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    } catch {
      setFailed(true);
      return;
    }
    // phones: a little softer, a lot less memory
    const touch = window.matchMedia?.("(pointer: coarse)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, touch ? 1.4 : 1.75));
    setLiveScene(true);
    setupRenderer(renderer);
    const canvas = renderer.domElement;
    canvas.className = "absolute inset-0 size-full";
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    // if the phone takes the graphics memory back, show the drawn scene instead of a black box
    const onLost = (e: Event) => {
      e.preventDefault();
      setFailed(true);
    };
    canvas.addEventListener("webglcontextlost", onLost);

    const kit = night ? nightKit(kitOf(theCase)) : kitOf(theCase);
    const built = buildKitScene(kit, { cast, detective: detectiveRef.current });
    lightScene(renderer, built.scene);
    const points = new Map<string, THREE.Vector3>();
    const camera = new THREE.PerspectiveCamera(FOV, 0.9, 0.1, 200);
    world.current = { built, points, camera };
    let pipeline: Pipeline | null = null;
    // keep the camera inside the room (or the alley) however far you turn
    const kind = kit.backdrop.kind;
    const inside = (p: THREE.Vector3) =>
      p.y > 0.5 &&
      (kind === "indoor" ? Math.abs(p.x) < 10.2 && p.z < 15.5 && p.y < 8.5 : kind === "alley" ? Math.abs(p.x) < 5.5 && p.y < 11 : true);
    const base = CAMERA_POS.clone().sub(CAMERA_TARGET);
    const v = view.current;
    if (intro) {
      v.yaw = 0.55;
      v.pitch = 0.18;
      v.zoom = 1.35;
    }

    const size = () => {
      const w = el.clientWidth || 360;
      const h = el.clientHeight || 400;
      renderer.setSize(w, h, false);
      pipeline?.setSize(w, h);
      camera.aspect = w / h;
      // On a screen taller than the designed 9:10 box, widen the view so the
      // whole width of the scene (and every clue) still fits.
      const design = 0.9;
      camera.fov =
        camera.aspect < design ? (2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * (design / camera.aspect)) * 180) / Math.PI : FOV;
      camera.updateProjectionMatrix();
    };
    size();
    pipeline = makePipeline(renderer, built.scene, camera);
    const ro = new ResizeObserver(size);
    ro.observe(el);

    const tmp = new THREE.Vector3();
    const toScreen = (p: THREE.Vector3) => {
      tmp.copy(p).project(camera);
      return { x: (tmp.x + 1) * 50, y: (1 - tmp.y) * 50, behind: tmp.z > 1 };
    };
    const project = (id: string) => {
      const p = points.get(id);
      if (!p) return null;
      const s = toScreen(p);
      return s.behind ? null : { x: s.x, y: s.y };
    };
    const raycaster = new THREE.Raycaster();
    const propObjs = built.props.map((p) => p.obj);
    const pick = (x: number, y: number) => {
      raycaster.setFromCamera(new THREE.Vector2(x / 50 - 1, 1 - y / 50), camera);
      for (const hit of raycaster.intersectObjects(propObjs, true)) {
        let o: THREE.Object3D | null = hit.object;
        while (o && o.userData.propIndex === undefined) o = o.parent;
        if (!o) continue;
        const placed = built.props.find((p) => p.index === o!.userData.propIndex);
        if (placed) return { kind: placed.prop.kind, index: placed.index };
      }
      return null;
    };
    if (apiRef)
      apiRef.current = {
        project,
        pick,
        walkTo: (id, arrived) => {
          const p = points.get(id);
          if (!p || !built.cast) return arrived();
          built.cast.goTo(p, arrived);
        },
        resetView: () => {
          v.tYaw = 0;
          v.tPitch = 0;
          v.tZoom = 1;
          v.velYaw = 0;
          v.tTarget.copy(CAMERA_TARGET);
          setMoved(false);
        },
      };

    let raf = 0;
    const t0 = performance.now();
    let last = t0;
    const offset = new THREE.Vector3();
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const now = performance.now();
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (document.hidden) return;
      const box = el.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight || box.width === 0) return;
      const t = (now - t0) / 1000;
      const ease = 1 - Math.pow(0.0015, dt);
      // a flick keeps turning a little after you let go
      if (!v.dragging && Math.abs(v.velYaw) > 0.001) {
        v.tYaw = THREE.MathUtils.clamp(v.tYaw + v.velYaw * dt, -YAW_MAX, YAW_MAX);
        v.velYaw *= Math.pow(0.03, dt);
      }
      const k = Math.min(1, ease * 2.2);
      v.yaw += (v.tYaw - v.yaw) * k;
      v.pitch += (v.tPitch - v.pitch) * k;
      v.zoom += (v.tZoom - v.zoom) * k;
      v.target.lerp(v.tTarget, k);
      const sway = Math.sin(t * 0.35) * 0.012;
      offset.copy(base).multiplyScalar(v.zoom);
      offset.applyAxisAngle(new THREE.Vector3(1, 0, 0), -v.pitch);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), v.yaw + sway);
      camera.position.copy(v.target).add(offset);
      for (let i = 0; i < 14 && !inside(camera.position); i++) {
        offset.multiplyScalar(0.9);
        camera.position.copy(v.target).add(offset);
      }
      camera.lookAt(v.target);
      camera.updateMatrixWorld();
      for (const tick of built.tickers) tick(t);
      if (pipeline) pipeline.render();
      else renderer.render(built.scene, camera);
      overlay.current?.querySelectorAll<HTMLElement>("[data-anchor]").forEach((node) => {
        const s = points.get(node.dataset.anchor ?? "");
        if (!s) return;
        const sp = toScreen(s);
        node.style.left = `${sp.x}%`;
        node.style.top = `${sp.y}%`;
        node.style.visibility = sp.behind || sp.x < -5 || sp.x > 105 || sp.y < -5 || sp.y > 105 ? "hidden" : "";
      });
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      pipeline?.dispose();
      built.dispose();
      canvas.removeEventListener("webglcontextlost", onLost);
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      setLiveScene(false);
      world.current = null;
      if (apiRef) apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theCase.id, cast, night, detectiveKey]);

  // (re)compute the 3D points for the anchors
  useEffect(() => {
    const w = world.current;
    if (!w) return;
    w.points.clear();
    for (const a of anchorsRef.current) w.points.set(a.id, w.built.anchor(a.x, a.y));
    applyCrew();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorKey, theCase.id, cast, failed, night, detectiveKey]);

  // other players' detectives
  const crewKey = (crew ?? []).map((m) => `${m.key}:${m.label}:${m.look}:${m.at}:${m.person ? JSON.stringify(m.person) : ""}`).join("|");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(applyCrew, [crewKey]);

  // drag to look around, pinch or wheel to zoom, tap to pick
  useEffect(() => {
    const el = wrap.current;
    if (!el || failed) return;
    const pointers = new Map<number, { x: number; y: number }>();
    let start: { x: number; y: number; t: number; yaw: number; pitch: number } | null = null;
    let lastMove = { x: 0, t: 0 };
    let lastTap = { x: 0, y: 0, t: 0 };
    let pinch: { d: number; zoom: number } | null = null;
    let dragged = false;
    const v = view.current;

    /** The advert poster under a screen point, if it is the nearest thing there. */
    const adRay = new THREE.Raycaster();
    const adExactly = (cx: number, cy: number) => {
      const w = world.current;
      if (!w) return null;
      const r = el.getBoundingClientRect();
      adRay.setFromCamera(new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, 1 - ((cy - r.top) / r.height) * 2), w.camera);
      const first = adRay.intersectObjects(w.built.scene.children, true).find((h) => (h.object as THREE.Mesh).isMesh);
      return first ? adOfMesh(first.object) : null;
    };
    // posters far down the street are small, so a tap close to one counts too
    const adAt = (cx: number, cy: number, slack = 10) => {
      const exact = adExactly(cx, cy);
      if (exact || !slack) return exact;
      for (const [dx, dy] of [[slack, 0], [-slack, 0], [0, slack], [0, -slack], [slack, slack], [-slack, -slack], [slack, -slack], [-slack, slack]]) {
        const near = adExactly(cx + dx, cy + dy);
        if (near?.ad) return near;
      }
      return null;
    };
    // a pointing hand over posters, for mouse users
    let hoverAt = 0;
    const hover = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || pointers.size || onTapRef.current) return;
      const now = performance.now();
      if (now - hoverAt < 90) return;
      hoverAt = now;
      el.style.cursor = adAt(e.clientX, e.clientY, 0) ? "pointer" : "";
    };
    el.addEventListener("pointermove", hover);

    const down = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) {
        start = { x: e.clientX, y: e.clientY, t: performance.now(), yaw: v.tYaw, pitch: v.tPitch };
        lastMove = { x: e.clientX, t: performance.now() };
        dragged = false;
        v.dragging = true;
        v.velYaw = 0;
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), zoom: v.tZoom };
      }
    };
    const move = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pointers.size >= 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        v.tZoom = THREE.MathUtils.clamp((pinch.zoom * pinch.d) / Math.max(d, 1), ZOOM_MIN, ZOOM_MAX);
        dragged = true;
        setMoved(true);
        return;
      }
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (!dragged && Math.hypot(dx, dy) < 8) return;
      dragged = true;
      setMoved(true);
      const w = el.clientWidth || 360;
      v.tYaw = THREE.MathUtils.clamp(start.yaw - (dx / w) * 2.2, -YAW_MAX, YAW_MAX);
      const now = performance.now();
      if (now - lastMove.t > 0) v.velYaw = (-(e.clientX - lastMove.x) / w) * 2.2 * (1000 / Math.max(16, now - lastMove.t));
      lastMove = { x: e.clientX, t: now };
      if (e.pointerType === "mouse" || fullTouchRef.current) v.tPitch = THREE.MathUtils.clamp(start.pitch + (dy / w) * 1.4, PITCH_MIN, PITCH_MAX);
    };
    const up = (e: PointerEvent) => {
      const wasTap = start && !dragged && pointers.size === 1 && performance.now() - start.t < 500;
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (pointers.size === 0) {
        start = null;
        v.dragging = false;
        if (performance.now() - lastMove.t > 120) v.velYaw = 0;
      }
      // a tap on a poster opens its details (not during a timed sweep)
      if (wasTap && e.type === "pointerup" && !onTapRef.current) {
        const hit = adAt(e.clientX, e.clientY);
        if (hit) {
          openAd(hit);
          lastTap = { x: 0, y: 0, t: 0 };
          return;
        }
      }
      // double-tap (without a sweep running) zooms in on that spot; double-tap again to come back
      if (wasTap && e.type === "pointerup" && !onTapRef.current) {
        const now = performance.now();
        if (now - lastTap.t < 320 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 30) {
          const w = world.current;
          if (w) {
            if (v.tZoom < 0.8) {
              v.tTarget.copy(CAMERA_TARGET);
              v.tZoom = 1;
            } else {
              const r = el.getBoundingClientRect();
              const ray = new THREE.Raycaster();
              ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, 1 - ((e.clientY - r.top) / r.height) * 2), w.camera);
              const hit = ray.intersectObjects(w.built.scene.children, true).find((h) => (h.object as THREE.Mesh).isMesh);
              if (hit) {
                v.tTarget.copy(hit.point);
                v.tTarget.y = Math.max(0.4, hit.point.y);
                v.tZoom = 0.5;
                setMoved(true);
              }
            }
          }
          lastTap = { x: 0, y: 0, t: 0 };
        } else lastTap = { x: e.clientX, y: e.clientY, t: now };
      }
      if (wasTap && e.type === "pointerup" && onTapRef.current) {
        const r = el.getBoundingClientRect();
        onTapRef.current(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
      }
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      v.tZoom = THREE.MathUtils.clamp(v.tZoom * (1 + e.deltaY * 0.001), ZOOM_MIN, ZOOM_MAX);
      setMoved(true);
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", hover);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
    };
  }, [failed]);

  return (
    <div ref={wrap} className={`${className.includes("absolute") ? "" : "relative"} select-none overflow-hidden ${className}`} style={{ touchAction: fullTouch ? "none" : "pan-y" }}>
      {failed && <CaseScene theCase={theCase} className="absolute inset-0 size-full" cast={cast} />}
      <div ref={overlay} className="pointer-events-none absolute inset-0">
        {children}
      </div>
      {!failed && !moved && (
        <div className="pointer-events-none absolute inset-x-0 flex justify-center" style={{ bottom: chipInset }}>
          <span className="fade-in rounded-full bg-black/45 px-2.5 py-1 backdrop-blur text-[10px] font-bold text-white/90">↔ Drag to look around · double-tap to zoom</span>
        </div>
      )}
      {!failed && moved && (
        <button
          onClick={() => {
            const v = view.current;
            v.tYaw = v.tPitch = 0;
            v.tZoom = 1;
            v.velYaw = 0;
            v.tTarget.copy(CAMERA_TARGET);
            setMoved(false);
          }}
          style={{ bottom: chipInset }}
          className="pointer-events-auto absolute left-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur transition active:scale-95"
        >
          Reset view
        </button>
      )}
    </div>
  );
}
