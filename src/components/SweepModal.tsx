"use client";

import { Check, ChevronLeft, RotateCcw, Star, Timer, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { money } from "@/lib/format";
import { sfx } from "@/lib/SoundEffects";
import { MISS_PENALTY, propItemId, starsFor, SWEEP_SECONDS, SWEEP_TARGETS, sweepItemsFor } from "@/lib/sweep";
import type { CrimeCase, SweepItem } from "@/lib/types";
import { HUSTLE_PER_STAR, STAR_REWARD } from "@/lib/useGameState";
import { SCENE_H, SCENE_W } from "./scenes/CrimeScene";
import { hasWebGL, Scene3D, type Scene3DHandle } from "./scenes/Scene3D";

interface Props {
  theCase: CrimeCase;
  best: number;
  onClose: () => void;
  /** Returns the payout for new stars. */
  onFinish: (stars: number) => number;
  /** The clock ran out: counts toward the losing streak. */
  onFail: () => void;
}

type Phase = "ready" | "playing" | "won" | "lost";

function pick(items: SweepItem[]) {
  return [...items].sort(() => Math.random() - 0.5).slice(0, SWEEP_TARGETS);
}

/** Criminal Case-style timed hunt: find the listed objects before the clock runs out. */
export function SweepModal({ theCase, best, onClose, onFinish, onFail }: Props) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [threeD] = useState(() => hasWebGL());
  const [targets, setTargets] = useState(() => pick(sweepItemsFor(theCase, threeD)));
  const api = useRef<Scene3DHandle | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [left, setLeft] = useState(SWEEP_SECONDS);
  const [misses, setMisses] = useState<{ id: number; x: number; y: number }[]>([]);
  const [result, setResult] = useState<{ stars: number; reward: number } | null>(null);
  const deadline = useRef(0);
  const lastTick = useRef(0);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const failRef = useRef(onFail);
  failRef.current = onFail;

  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => {
      const remaining = Math.max(0, (deadline.current - Date.now()) / 1000);
      setLeft(remaining);
      const whole = Math.ceil(remaining);
      if (remaining > 0 && whole <= 10 && whole !== lastTick.current) {
        lastTick.current = whole;
        sfx.tick();
      }
      if (remaining <= 0) {
        setPhase("lost");
        sfx.error();
        failRef.current();
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [phase]);

  const start = () => {
    sfx.whoosh();
    setTargets(pick(sweepItemsFor(theCase, threeD)));
    setFound([]);
    setMisses([]);
    setResult(null);
    setLeft(SWEEP_SECONDS);
    lastTick.current = 0;
    deadline.current = Date.now() + SWEEP_SECONDS * 1000;
    setPhase("playing");
  };

  const tap = (x: number, y: number) => {
    if (phase !== "playing") return;
    const px = (x / 100) * SCENE_W;
    const py = (y / 100) * SCENE_H;
    const open = targets.filter((t) => !found.includes(t.id));

    // in 3D, tapping anywhere on the object counts; otherwise near its marker
    const picked = api.current?.pick?.(x, y);
    const direct = picked ? open.find((t) => t.id === propItemId(picked.kind, picked.index)) : undefined;
    const hit = direct
      ? { t: direct }
      : open
          .map((t) => {
            const at = api.current?.project(t.id) ?? { x: t.x, y: t.y };
            return { t, d: Math.hypot((at.x / 100) * SCENE_W - px, (at.y / 100) * SCENE_H - py) };
          })
          .filter(({ t, d }) => d <= ((t.r ?? 7) / 100) * SCENE_W)
          .sort((a, b) => a.d - b.d)[0];

    if (hit) {
      sfx.clue();
      const next = [...found, hit.t.id];
      setFound(next);
      if (next.length === targets.length) {
        const remaining = Math.max(0, (deadline.current - Date.now()) / 1000);
        const stars = starsFor(remaining);
        const reward = finishRef.current(stars);
        setLeft(remaining);
        setResult({ stars, reward });
        setPhase("won");
        sfx.success();
      }
    } else {
      sfx.miss();
      deadline.current -= MISS_PENALTY * 1000;
      const id = Date.now();
      setMisses((m) => [...m.slice(-4), { id, x: (px / SCENE_W) * 100, y: (py / SCENE_H) * 100 }]);
    }
  };

  const pct = (left / SWEEP_SECONDS) * 100;

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-ink fade-in lg:mx-auto lg:max-w-lg lg:shadow-2xl" role="dialog" aria-label="Timed sweep">
      <div className="flex items-center gap-2 border-b border-line/60 px-3 pb-2.5 pt-[max(env(safe-area-inset-top),10px)]">
        <button onClick={onClose} aria-label="Back to the case" className="grid size-10 place-items-center rounded-full transition hover:bg-raise active:scale-90">
          <ChevronLeft className="size-6" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-extrabold">Timed Sweep</div>
          <div className="truncate text-[11px] text-muted">{theCase.title}</div>
        </div>
        <div className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-black tabular-nums ${left <= 10 && phase === "playing" ? "bg-danger text-white live-dot" : "bg-raise"}`}>
          <Timer className="size-4" />
          {Math.ceil(left)}s
        </div>
      </div>
      <div className="h-1.5 bg-line">
        <div className={`h-full transition-[width] duration-100 ${left <= 10 ? "bg-danger" : "bg-kick"}`} style={{ width: `${pct}%` }} />
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto">
        <div className="relative aspect-[9/10] w-full cursor-crosshair overflow-hidden bg-night">
          <Scene3D theCase={theCase} anchors={targets} apiRef={api} onTap={tap} intro={false} className="absolute inset-0 size-full">
          {targets
            .filter((t) => found.includes(t.id))
            .map((t) => (
              <span
                key={t.id}
                data-anchor={t.id}
                className="pop-in pointer-events-none absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-kick bg-kick/25 shadow-[0_10px_24px_-14px_rgba(20,22,27,0.6)]"
                style={{ left: `${t.x}%`, top: `${t.y}%` }}
              >
                <Check className="size-4 text-kick" strokeWidth={3} />
              </span>
            ))}
          {misses.map((m) => (
            <span
              key={m.id}
              className="rise pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-sm font-black text-danger"
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
            >
              <X className="mx-auto size-6" strokeWidth={3} />-{MISS_PENALTY}s
            </span>
          ))}
          </Scene3D>
        </div>

        <div className="px-4 pt-4">
          <div className="flex items-center justify-between text-sm font-extrabold">
            <span>Find these sharp-sharp</span>
            <span className="tabular-nums">
              <span className="text-kick">{found.length}</span>/{targets.length}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {targets.map((t) => {
              const got = found.includes(t.id);
              return (
                <div
                  key={t.id}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold ${
                    got ? "border-kick/50 bg-kick/10 text-kick line-through" : "border-line bg-card"
                  }`}
                >
                  {got ? <Check className="size-4 shrink-0" /> : <span className="size-2 shrink-0 rounded-full bg-muted" />}
                  <span className="truncate">{phase === "ready" ? "???" : t.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {phase !== "playing" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 px-6 fade-in">
          <div className="pop-in w-full rounded-3xl border border-kick/50 bg-card p-6 text-center">
            {phase === "ready" ? (
              <>
                <Timer className="mx-auto size-10 text-kick" />
                <h3 className="mt-2 text-2xl font-black">Sweep the scene sharp-sharp</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Find {SWEEP_TARGETS} objects in {SWEEP_SECONDS} seconds. Wrong taps cost {MISS_PENALTY}s. Every star pays {money(HUSTLE_PER_STAR)} hustle money, and each new best star adds
                  {money(STAR_REWARD)}. Running low? Sweep am again.
                </p>
                <StarRow stars={best} label="Your best" />
              </>
            ) : phase === "won" && result ? (
              <>
                <h3 className="neon-text text-3xl font-black italic text-kick">CLEAN SWEEP!</h3>
                <StarRow stars={result.stars} big />
                <p className="mt-2 text-sm text-neutral-600">{Math.ceil(left)} seconds remain. You too fast!</p>
                <p className={`mt-1 text-lg font-black ${result.reward ? "text-kick" : "text-muted"}`}>
                  {result.reward ? `+${money(result.reward)}` : ""}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-3xl font-black italic text-danger">TIME DON FINISH!</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  You find {found.length} of {targets.length}. That one na loss o. Try am again?
                </p>
              </>
            )}
            <div className="mt-5 flex gap-2">
              <button onClick={onClose} className="h-12 flex-1 rounded-full bg-raise font-bold transition active:scale-95">
                Back
              </button>
              <button
                onClick={start}
                className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-full bg-kick font-extrabold text-ink transition hover:brightness-110 active:scale-95"
              >
                {phase === "ready" ? <Timer className="size-5" /> : <RotateCcw className="size-5" />}
                {phase === "ready" ? "Oya, start!" : "Run am again"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function StarRow({ stars, big, label }: { stars: number; big?: boolean; label?: string }) {
  return (
    <div className="mt-3 flex flex-col items-center gap-1">
      {label && <span className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</span>}
      <div className="flex gap-1" aria-label={`${stars} of 3 stars`}>
        {[1, 2, 3].map((i) => (
          <Star key={i} className={`${big ? "size-10" : "size-5"} ${i <= stars ? "fill-kick text-kick" : "text-line"} ${big && i <= stars ? "pop-in" : ""}`} />
        ))}
      </div>
    </div>
  );
}
