"use client";

import { ChevronLeft, ChevronRight, Heart, MessageCircle, Pointer, Send, Share2 } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { CASE_BY_ID } from "@/lib/cases";
import { PLAYER_LOOKS } from "@/lib/looks";
import { sfx } from "@/lib/SoundEffects";
import type { CaseId } from "@/lib/types";
import { Avatar } from "./Avatar";
import { SceneThumb } from "./scenes/SceneThumb";
import { BrandMark } from "./ui";

/** The front door's blue (buttons, dots, highlights). */
export const DOOR_BLUE = "#2457e6";

/* ---------------------------------------------------------------- hand-drawn doodles */

const ink = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Faint line drawings scattered behind the light screens: magnifiers, prints, footsteps, question marks. */
export function Doodles({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 860" preserveAspectRatio="xMidYMid slice" className={`pointer-events-none absolute inset-0 size-full text-[#cdd3df] ${className}`} aria-hidden>
      {/* magnifier */}
      <g transform="translate(300 70) rotate(18)" {...ink}>
        <circle cx="0" cy="0" r="22" />
        <path d="M16 16 L40 40" strokeWidth="5" />
      </g>
      {/* fingerprint */}
      <g transform="translate(40 180)" {...ink}>
        <path d="M0 20 C0 0 30 0 30 20 C30 36 20 44 18 52" />
        <path d="M8 22 C8 10 22 10 22 24 C22 34 14 42 12 48" />
        <path d="M15 24 C15 30 12 38 8 44" />
      </g>
      {/* footsteps */}
      <g transform="translate(330 300) rotate(-20)" {...ink}>
        <ellipse cx="0" cy="0" rx="7" ry="11" />
        <ellipse cx="18" cy="-26" rx="7" ry="11" />
        <ellipse cx="2" cy="-52" rx="7" ry="11" />
      </g>
      {/* question mark */}
      <g transform="translate(60 560)" {...ink}>
        <path d="M0 10 C0 -6 24 -6 24 10 C24 22 12 22 12 34" />
        <circle cx="12" cy="46" r="1.5" />
      </g>
      {/* squiggles and stars */}
      <path d="M330 600 q10 -14 20 0 t20 0 t20 0" {...ink} />
      <path d="M20 400 q12 -10 24 0 t24 0" {...ink} />
      <g transform="translate(350 760)" {...ink}>
        <path d="M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3 Z" />
      </g>
      <g transform="translate(70 760) rotate(-12)" {...ink}>
        <rect x="-18" y="-12" width="36" height="24" rx="4" />
        <path d="M-10 -4 H10 M-10 4 H4" />
      </g>
      <g transform="translate(200 40)" {...ink}>
        <path d="M-30 0 q10 -16 20 0 q10 16 20 0 q10 -16 20 0" />
      </g>
    </svg>
  );
}

/** The crown-wearing smiley sticker. */
function CrownSmiley({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 70" className={className} aria-hidden>
      <g {...ink} stroke="#14161b" strokeWidth="2.4">
        <path d="M18 18 L24 6 L32 15 L38 4 L44 15 L52 6 L56 18 Z" fill="#fff" />
        <circle cx="36" cy="38" r="16" fill="#fff" />
        <circle cx="30" cy="35" r="1.6" fill="#14161b" />
        <circle cx="42" cy="35" r="1.6" fill="#14161b" />
        <path d="M29 43 q7 6 14 0" />
        <path d="M14 56 q6 -6 12 0 q-6 8 -12 0" fill="#fff" />
      </g>
    </svg>
  );
}

/** The green flower-star sticker. */
function Sparkle({ className = "", color = "#22c55e" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="-50 -50 100 100" className={className} aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={i} cx="0" cy="-24" rx="10" ry="22" fill={color} transform={`rotate(${i * 45})`} />
      ))}
      <circle r="10" fill={color} />
    </svg>
  );
}

/** A pinned photo, slightly turned. */
function Polaroid({ id, rotate, className = "", pin = "#e11d48" }: { id: CaseId; rotate: number; className?: string; pin?: string }) {
  const c = CASE_BY_ID[id];
  if (!c) return null;
  return (
    <div className={`absolute rounded-md bg-white p-1.5 pb-4 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.45)] ${className}`} style={{ transform: `rotate(${rotate}deg)` }}>
      <span className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full shadow" style={{ background: pin }} />
      <SceneThumb theCase={c} cast={false} className="aspect-[4/3] w-full rounded-sm" />
    </div>
  );
}

/* ---------------------------------------------------------------- the three intro screens */

const SLIDES = 3;

/**
 * Three intro screens before sign-up: what the game is (a scene posted like a photo),
 * the case file (a pinned board over a scene) and playing with other branches.
 * Swipe or tap Next; Skip goes straight to sign-up.
 */
export function Onboarding({ onDone, onSignIn }: { onDone: () => void; onSignIn: () => void }) {
  const [i, setI] = useState(0);
  const touch = useRef<number | null>(null);
  const go = (n: number) => {
    if (n < 0) return;
    sfx.whoosh();
    if (n >= SLIDES) return onDone();
    setI(n);
  };
  const dark = i === 1;

  return (
    <div
      className={`relative mx-auto flex min-h-dvh max-w-md flex-col overflow-hidden transition-colors duration-500 ${dark ? "bg-[#0d2a6b] text-white" : "bg-[#f3f5f8] text-[#14161b]"}`}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const start = touch.current;
        touch.current = null;
        if (start === null) return;
        const dx = e.changedTouches[0].clientX - start;
        if (dx < -50) go(i + 1);
        else if (dx > 50) go(i - 1);
      }}
      aria-roledescription="carousel"
      aria-label="Welcome to Naija Detective"
    >
      {/* backgrounds */}
      {i === 1 ? (
        <div key="photo" className="fade-in absolute inset-0">
          <SceneThumb theCase={CASE_BY_ID["abk-olumo" as CaseId] ?? CASE_BY_ID["lag-mainland" as CaseId]} cast className="absolute inset-0 size-full translate-y-16 scale-125 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1d4ed8]/40 via-transparent to-[#0d2a6b]" />
        </div>
      ) : (
        <Doodles />
      )}

      {/* top bar: logo and Skip */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),18px)]">
        <span className="w-14" />
        <span className="flex items-center gap-2">
          <BrandMark className="size-7" />
          <span className="text-lg font-black tracking-tight">Naija Detective</span>
        </span>
        <button onClick={() => go(SLIDES)} className={`w-14 text-right text-sm font-bold ${dark ? "text-white/80" : "text-[#5b6475]"}`}>
          Skip
        </button>
      </div>

      {/* the picture */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-4">
        {i === 0 && <PostSlide />}
        {i === 1 && <BoardSlide />}
        {i === 2 && <SquadSlide />}
      </div>

      {/* words, dots and the button */}
      <div className="relative z-10 px-7 pb-[max(env(safe-area-inset-bottom),22px)] text-center" aria-live="polite">
        <h1 key={`t${i}`} className="fade-in text-[28px] font-extrabold leading-tight tracking-tight">
          {["Crack real Naija cases", "Your case file, all in one place", "Hunt clues with your squad"][i]}
        </h1>
        <p key={`p${i}`} className={`fade-in mx-auto mt-2 max-w-xs text-[15px] leading-snug ${dark ? "text-white/85" : "text-[#5b6475]"}`}>
          {
            [
              "Walk live 3D crime scenes from Lagos to Kano, find the clues, break the lies and arrest the right person.",
              "Track the cases you've cracked, the cities you've visited and the badges you've earned on your way to General.",
              "Detectives from other branches join you live in the same scene. Close the case together for a squad bonus.",
            ][i]
          }
        </p>
        <div className="mt-5 flex justify-center gap-1.5" role="tablist" aria-label="Screens">
          {Array.from({ length: SLIDES }, (_, k) => (
            <button
              key={k}
              role="tab"
              aria-selected={k === i}
              aria-label={`Screen ${k + 1}`}
              onClick={() => go(k)}
              className={`h-2 rounded-full transition-all ${k === i ? "w-5" : "w-2"}`}
              style={{ background: k === i ? (dark ? "#fff" : DOOR_BLUE) : dark ? "rgba(255,255,255,0.45)" : "#cdd3df" }}
            />
          ))}
        </div>
        <div className="mt-5 flex items-center gap-3">
          {i > 0 && (
            <button onClick={() => go(i - 1)} aria-label="Back" className={`grid size-14 shrink-0 place-items-center rounded-full transition active:scale-95 ${dark ? "bg-white/15 text-white" : "bg-white text-[#14161b] shadow-sm"}`}>
              <ChevronLeft className="size-5" />
            </button>
          )}
          <button onClick={() => go(i + 1)} className="flex h-14 flex-1 items-center justify-center gap-1.5 rounded-full text-[17px] font-bold text-white shadow-[0_12px_24px_-12px_rgba(36,87,230,0.8)] transition active:scale-[0.98]" style={{ background: DOOR_BLUE }}>
            {i === SLIDES - 1 ? "Get started" : "Next"}
            <ChevronRight className="size-5" />
          </button>
        </div>
        <button onClick={onSignIn} className={`mt-4 text-sm font-semibold ${dark ? "text-white/85" : "text-[#5b6475]"}`}>
          I already have an account · <span className="font-bold underline" style={{ color: dark ? "#fff" : DOOR_BLUE }}>Sign in</span>
        </button>
      </div>
    </div>
  );
}

/** Screen 1: a crime scene "posted" like a photo, with stickers. */
function PostSlide() {
  const c = CASE_BY_ID["neon-alley" as CaseId];
  return (
    <div className="fade-in relative w-full max-w-[290px]">
      <CrownSmiley className="absolute -left-10 -top-14 size-20 rotate-[-8deg]" />
      <Sparkle className="absolute -right-6 -top-8 size-16 rotate-12" />
      <Sparkle className="absolute -bottom-6 -left-9 size-7" />
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_24px_50px_-24px_rgba(20,22,27,0.5)]">
        <div className="flex items-center gap-1.5 px-3 py-2">
          <BrandMark className="size-4" />
          <span className="text-xs font-bold">Naija Detective</span>
          <span className="ml-auto rounded-full bg-[#e11d48] px-1.5 py-0.5 text-[9px] font-black text-white">LIVE</span>
        </div>
        {c && <SceneThumb theCase={c} className="aspect-[4/3] w-full" />}
        <div className="relative flex items-center gap-3 px-3 py-2.5 text-[#5b6475]">
          <Heart className="size-[18px] fill-current" style={{ color: DOOR_BLUE }} />
          <MessageCircle className="size-[18px]" />
          <Share2 className="size-[18px]" />
          <Send className="ml-auto size-[18px]" />
          <Pointer className="absolute left-5 top-6 size-7 rotate-[-12deg] fill-white text-[#14161b]" />
        </div>
      </div>
    </div>
  );
}

/** Screen 2: the case file board with pinned scene photos. */
function BoardSlide() {
  const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  return (
    <div className="fade-in relative w-full max-w-[300px] text-[#14161b]">
      <div className="rounded-2xl bg-white/95 p-3 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.6)] backdrop-blur">
        <div className="flex items-center justify-between">
          <span className="text-sm font-extrabold">Case file · Lagos</span>
          <span className="flex gap-2 text-[#9aa2b1]">
            <ChevronLeft className="size-4" />
            <ChevronRight className="size-4" />
          </span>
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#5b6475]">
          {days.map((d) => (
            <span key={d}>{d}</span>
          ))}
          {Array.from({ length: 28 }, (_, k) => {
            const n = k + 1;
            const hot = n === 18;
            const solved = [3, 9, 12, 22, 26].includes(n);
            return (
              <span key={n} className={`grid aspect-square place-items-center rounded-md text-[11px] ${hot ? "font-black text-white" : solved ? "bg-[#e8eefc] font-bold" : "border border-[#eef0f4]"}`} style={hot ? { background: DOOR_BLUE } : undefined}>
                {n}
              </span>
            );
          })}
        </div>
      </div>
      <Polaroid id={"danfo" as CaseId} rotate={-14} className="-left-8 top-16 w-28" />
      <Polaroid id={"market" as CaseId} rotate={9} className="-right-6 top-6 w-24" pin="#16a34a" />
      <Polaroid id={"owambe" as CaseId} rotate={-6} className="-bottom-8 right-6 w-28" pin="#f59e0b" />
      <span className="absolute -left-4 -top-6 rotate-[-12deg] font-black italic text-white drop-shadow" style={{ fontFamily: "Comic Sans MS, cursive" }}>
        OYA!
      </span>
      <span className="absolute -bottom-10 left-2 rotate-[-8deg] text-lg font-black italic text-white drop-shadow" style={{ fontFamily: "Comic Sans MS, cursive" }}>
        BLAM!
      </span>
    </div>
  );
}

/** Screen 3: detectives from other branches around a shared scene. */
function SquadSlide() {
  const c = CASE_BY_ID["market" as CaseId];
  const bubble = (text: string, cls: string) => (
    <span className={`absolute whitespace-nowrap rounded-2xl bg-white px-2.5 py-1 text-[11px] font-bold shadow-md ${cls}`}>{text}</span>
  );
  const face = (k: number, cls: string, ring: string): ReactNode => (
    <span className={`absolute size-14 overflow-hidden rounded-full border-[3px] bg-white shadow-lg ${cls}`} style={{ borderColor: ring }}>
      <Avatar face={PLAYER_LOOKS[k]} className="size-full" />
    </span>
  );
  return (
    <div className="fade-in relative w-full max-w-[280px]">
      <div className="overflow-hidden rounded-3xl bg-white p-2 shadow-[0_24px_50px_-24px_rgba(20,22,27,0.5)]">
        {c && <SceneThumb theCase={c} className="aspect-square w-full rounded-2xl" />}
      </div>
      {face(1, "-left-6 -top-6", DOOR_BLUE)}
      {face(2, "-right-5 top-10", "#22c55e")}
      {face(4, "-bottom-6 left-8", "#f59e0b")}
      {bubble("Over here! 👀", "-left-2 top-12")}
      {bubble("Na this one! 🔥", "-right-8 top-28")}
      {bubble("Ẹ kú iṣẹ́! 👏", "-bottom-9 left-24")}
      <Sparkle className="absolute -right-4 -bottom-4 size-10" color={DOOR_BLUE} />
    </div>
  );
}
