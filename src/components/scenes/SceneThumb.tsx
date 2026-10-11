"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { sceneOf } from "@/lib/cases";
import type { CrimeCase, KitScene } from "@/lib/types";
import { buildKitScene } from "@/three/buildScene";
import { lightScene, makePipeline, setupRenderer } from "@/three/render";
import { kitOf } from "@/three/sceneKits";
import { defaultCamera } from "@/three/world";
import { CaseScene } from "./CrimeScene";
import { hasWebGL } from "./Scene3D";

/**
 * Still 3D renders for cards and tiles. One hidden renderer draws each scene
 * once, a few at a time when the browser is idle, and the image is cached.
 */

const cache = new Map<string, string>();
type Job = { kit: KitScene; cast: boolean; done: ((url: string) => void)[]; urgent: boolean };
const waiting = new Map<string, Job>();
const failures = new Map<string, number>();
let renderer: THREE.WebGLRenderer | null = null;
let busy = false;
let releaseTimer = 0;
// while a case's live 3D scene is open, thumbnails wait (two 3D engines at once is too much for phones)
let liveScenes = 0;

/** Scene3D calls this as a live scene opens and closes. */
export function setLiveScene(open: boolean) {
  liveScenes = Math.max(0, liveScenes + (open ? 1 : -1));
  if (liveScenes) release();
  else pump();
}

/** Give the hidden renderer's graphics memory back; it is made again when needed. */
function release() {
  window.clearTimeout(releaseTimer);
  if (!renderer) return;
  renderer.dispose();
  renderer.forceContextLoss();
  renderer = null;
}

/** The next job: anything on screen first, then the rest in the background. */
function next(): [string, Job] | undefined {
  for (const entry of waiting) if (entry[1].urgent) return entry;
  return waiting.entries().next().value;
}

function pump() {
  if (busy || liveScenes > 0) return;
  if (waiting.size === 0) {
    // idle for a moment: free the graphics memory
    window.clearTimeout(releaseTimer);
    releaseTimer = window.setTimeout(release, 2500);
    return;
  }
  window.clearTimeout(releaseTimer);
  busy = true;
  const first = next()!;
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback;
  const run = () => {
    if (liveScenes > 0) {
      busy = false;
      return;
    }
    const [key, job] = next() ?? first;
    waiting.delete(key);
    let url = "";
    try {
      if (!renderer || renderer.getContext().isContextLost()) {
        renderer?.dispose();
        renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
        renderer.setSize(450, 500, false);
        setupRenderer(renderer);
      }
      const built = buildKitScene(job.kit, { cast: job.cast });
      lightScene(renderer, built.scene);
      built.tickers.forEach((t) => t(1.2));
      const pipeline = makePipeline(renderer, built.scene, defaultCamera());
      pipeline.render();
      pipeline.dispose();
      url = renderer.domElement.toDataURL("image/jpeg", 0.82);
      built.dispose();
    } catch (e) {
      console.warn("[thumb] failed", key, e);
      url = "";
    }
    if (url) {
      cache.set(key, url);
      job.done.forEach((d) => d(url));
    } else {
      // try again later (a lost graphics context recovers), but not forever
      const n = (failures.get(key) ?? 0) + 1;
      failures.set(key, n);
      if (n < 3) window.setTimeout(() => waiting.set(key, job), 1500 * n);
    }
    busy = false;
    pump();
  };
  if (idle) idle(run, { timeout: first[1].urgent ? 200 : 500 });
  else setTimeout(run, first[1].urgent ? 30 : 200);
}

function request(key: string, kit: KitScene, cast: boolean, urgent: boolean, done: (url: string) => void) {
  const hit = cache.get(key);
  if (hit) return done(hit);
  const job = waiting.get(key);
  if (job) {
    job.done.push(done);
    job.urgent ||= urgent;
  } else waiting.set(key, { kit, cast, done: [done], urgent });
  pump();
}

/** A case's scene as a still 3D picture, with the drawn scene until it's ready. */
export function SceneThumb({ theCase, cast = true, className = "" }: { theCase: CrimeCase; cast?: boolean; className?: string }) {
  const key = `${theCase.kit ? theCase.id : `scene:${sceneOf(theCase)}`}|${cast}`;
  const [url, setUrl] = useState(() => cache.get(key) ?? "");
  const ref = useRef<HTMLDivElement>(null);
  // null until mounted: the shimmer shows first, the drawn scene only where there is no WebGL
  const [gl, setGl] = useState<boolean | null>(null);
  useEffect(() => setGl(hasWebGL()), []);

  useEffect(() => {
    if (cache.get(key)) {
      setUrl(cache.get(key)!);
      return;
    }
    if (!hasWebGL() || !ref.current) return;
    let live = true;
    const done = (u: string) => live && setUrl(u);
    // queue it quietly now (so cards further along a carousel are ready when scrolled to) ...
    request(key, kitOf(theCase), cast, false, done);
    // ... and move it to the front as soon as it is on screen
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      request(key, kitOf(theCase), cast, true, done);
    }, { rootMargin: "200px" });
    io.observe(ref.current);
    return () => {
      live = false;
      io.disconnect();
    };
  }, [key, theCase, cast]);

  return (
    <div ref={ref} className={`${className.includes("absolute") ? "" : "relative"} overflow-hidden ${className}`}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="absolute inset-0 size-full object-cover" />
      ) : gl !== false ? (
        // a soft shimmer while the 3D picture is drawn (the old drawings looked out of place)
        <div className="thumb-wait absolute inset-0" aria-hidden="true" />
      ) : (
        <CaseScene theCase={theCase} fit="slice" cast={cast} className="absolute inset-0 size-full" />
      )}
    </div>
  );
}
