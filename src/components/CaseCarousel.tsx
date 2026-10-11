"use client";

import { ChevronLeft, ChevronRight, CircleCheckBig, Lock, Play, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { regionOf } from "@/lib/cases";
import { moneyShort } from "@/lib/format";
import { gateRemaining, isCaseOpen, isModeOpen, modeOf } from "@/lib/modes";
import type { CaseId, CategoryId, CrimeCase, GameState } from "@/lib/types";
import { SceneThumb } from "./scenes/SceneThumb";
import { LiveBadge } from "./ui";

/* ---------------------------------------------------------------- category tabs */

export const CATEGORY_TABS: { id: CategoryId | null; label: string }[] = [
  { id: null, label: "All" },
  { id: "heists", label: "Heists" },
  { id: "cyber", label: "Cyber" },
  { id: "vip", label: "Big Man" },
  { id: "alley", label: "Market" },
  { id: "naija", label: "Naija Files" },
];

/** Text tabs with a dot under the active one. */
export function CategoryTabs({ active, onSelect }: { active: CategoryId | null; onSelect: (id: CategoryId | null) => void }) {
  return (
    <div className="no-scrollbar flex gap-6 overflow-x-auto px-5 pt-1" role="tablist" aria-label="Categories">
      {CATEGORY_TABS.map((t) => {
        const on = active === t.id;
        return (
          <button
            key={t.label}
            role="tab"
            aria-selected={on}
            onClick={() => onSelect(t.id)}
            className={`flex shrink-0 flex-col items-center gap-1.5 pb-1 text-[15px] transition ${on ? "font-bold text-fg" : "font-medium text-muted hover:text-fg"}`}
          >
            {t.label}
            <span className={`size-1.5 rounded-full transition ${on ? "bg-kick" : "bg-transparent"}`} />
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- big carousel */

function subtitle(c: CrimeCase) {
  const r = regionOf(c);
  return `${r.place === r.state ? r.state : `${r.place}, ${r.state}`} · ${modeOf(c.id).name.replace(" Mode", "")}`;
}

/** Tall swipeable case cards; the centred one is full size and its neighbours peek in. */
export function CaseCarousel({ cases, state, onOpen }: { cases: CrimeCase[]; state: GameState; onOpen: (id: CaseId) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const key = cases.map((c) => c.id).join();

  useEffect(() => {
    track.current?.scrollTo({ left: 0 });
    setCurrent(0);
  }, [key]);

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestD = Infinity;
    [...el.children].forEach((child, i) => {
      const c = child as HTMLElement;
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    if (best !== current) setCurrent(best);
  };

  if (cases.length === 0) return <p className="px-5 py-16 text-center text-sm text-muted">No case match am. Try another thing.</p>;

  const page = (dir: number) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <div className="relative">
      <div
        ref={track}
        onScroll={onScroll}
        className="no-scrollbar flex snap-x snap-mandatory items-center gap-3 overflow-x-auto px-[17%] py-4 lg:scroll-px-14 lg:gap-5 lg:px-14 lg:py-6"
      >
        {cases.map((c, i) => (
          <BigCard key={c.id} theCase={c} state={state} onOpen={onOpen} focused={i === current} />
        ))}
      </div>
      <button onClick={() => page(-1)} aria-label="Previous cases" className="soft absolute left-1 top-1/2 z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-card transition hover:scale-105 lg:grid">
        <ChevronLeft className="size-5" />
      </button>
      <button onClick={() => page(1)} aria-label="More cases" className="soft absolute right-1 top-1/2 z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-card transition hover:scale-105 lg:grid">
        <ChevronRight className="size-5" />
      </button>
      <div className="flex justify-center gap-1 lg:hidden" aria-hidden="true">
        {cases.slice(0, 12).map((c, i) => (
          <span key={c.id} className={`h-1.5 rounded-full transition-all ${i === Math.min(current, 11) ? "w-5 bg-kick" : "w-1.5 bg-line"}`} />
        ))}
      </div>
    </div>
  );
}

function BigCard({ theCase, state, onOpen, focused }: { theCase: CrimeCase; state: GameState; onOpen: (id: CaseId) => void; focused: boolean }) {
  const unlocked = isCaseOpen(theCase.id, state);
  const solved = state.solved.includes(theCase.id);
  const found = state.found[theCase.id]?.length ?? 0;
  const mode = modeOf(theCase.id);
  return (
    <button
      onClick={() => onOpen(theCase.id)}
      aria-label={`${theCase.title}${unlocked ? "" : " (locked)"}`}
      className={`relative aspect-[3/4.1] w-[66vw] max-w-[290px] shrink-0 snap-center overflow-hidden rounded-[30px] bg-night text-left transition duration-300 lg:w-[clamp(170px,calc((100dvh-260px)*0.73),250px)] lg:snap-start lg:scale-100 lg:opacity-100 lg:shadow-[0_24px_40px_-24px_rgba(20,22,27,0.7)] lg:hover:-translate-y-1 ${
        focused ? "scale-100 shadow-[0_24px_40px_-24px_rgba(20,22,27,0.7)]" : "scale-[0.86] opacity-70"
      }`}
    >
      <SceneThumb theCase={theCase} className={`absolute inset-0 size-full ${unlocked ? "" : "blur-[3px] grayscale"}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />

      <div className="absolute left-3.5 top-3.5 flex items-center gap-1.5">
        {solved ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-extrabold text-fg">
            <CircleCheckBig className="size-3 text-go" /> CLOSED
            {[1, 2, 3].map((k) => (
              <Star key={k} className={`size-2.5 ${k <= (state.sweepStars[theCase.id] ?? 0) ? "fill-[#F5A524] text-[#F5A524]" : "text-neutral-300"}`} />
            ))}
          </span>
        ) : unlocked ? (
          <LiveBadge />
        ) : null}
      </div>
      <span className="glass absolute right-3.5 top-3.5 rounded-full px-2 py-0.5 text-[11px] font-bold text-white">{moneyShort(theCase.bounty)}</span>

      {!unlocked && (
        <div className="absolute inset-0 grid place-items-center px-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <span className="glass grid size-12 place-items-center rounded-full text-white">
              <Lock className="size-5" />
            </span>
            <span className="text-xs font-semibold text-white">
              {isModeOpen(mode, state) ? `Close ${gateRemaining(theCase.id, state)} more Naija Files` : `${mode.name} · ${moneyShort(mode.cost)}`}
            </span>
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="line-clamp-3 text-xl font-bold leading-tight text-white lg:text-[clamp(15px,2.6dvh,20px)]">{theCase.title.replace(/^The /, "")}</div>
          <div className="mt-0.5 truncate text-sm font-light text-white/85">{subtitle(theCase)}</div>
          {unlocked && !solved && found > 0 && (
            <div className="mt-2 h-1 w-24 overflow-hidden rounded-full bg-white/25">
              <div className="h-full rounded-full bg-white" style={{ width: `${(found / theCase.clues.length) * 100}%` }} />
            </div>
          )}
        </div>
        <span className="glass grid size-12 shrink-0 place-items-center rounded-2xl text-white">
          <Play className="size-5 fill-white" />
        </span>
      </div>
    </button>
  );
}

/* ---------------------------------------------------------------- small cards */

/** A row of small portrait cards, like "similar games". */
export function MiniCases({ cases, state, onOpen }: { cases: CrimeCase[]; state: GameState; onOpen: (id: CaseId) => void }) {
  return (
    <div className="no-scrollbar flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-3">
      {cases.map((c) => {
        const unlocked = isCaseOpen(c.id, state);
        const solved = state.solved.includes(c.id);
        return (
          <button
            key={c.id}
            onClick={() => onOpen(c.id)}
            aria-label={`${c.title}${unlocked ? "" : " (locked)"}`}
            className="soft relative aspect-[3/4] w-[30%] max-w-[130px] shrink-0 snap-start lg:w-[140px] lg:max-w-none overflow-hidden rounded-[20px] bg-night text-left transition active:scale-95"
          >
            <SceneThumb theCase={c} cast={false} className={`absolute inset-0 size-full ${unlocked ? "" : "blur-[2px] grayscale"}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            <span className="glass absolute right-2 top-2 grid size-7 place-items-center rounded-full text-white">
              {unlocked ? solved ? <CircleCheckBig className="size-3.5" /> : <Play className="size-3 fill-white" /> : <Lock className="size-3.5" />}
            </span>
            <div className="absolute inset-x-0 bottom-0 p-2.5">
              <div className="line-clamp-2 text-xs font-bold leading-tight text-white">{c.title.replace(/^The /, "")}</div>
              <div className="truncate text-[10px] font-light text-white/80">{regionOf(c).state}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
