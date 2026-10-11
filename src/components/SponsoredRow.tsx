"use client";

import { Megaphone, Sparkles } from "lucide-react";
import type { Hunt } from "@/lib/ads";
import type { GameState } from "@/lib/types";

/**
 * Home's sponsored hunts: brands put their poster in a crime scene and hide
 * tokens; find them all to unlock their offer. Clearly marked as sponsored.
 */
export function SponsoredRow({ hunts, state, onOpen, onAdvertise }: { hunts: Hunt[]; state: GameState; onOpen: (h: Hunt) => void; onAdvertise: () => void }) {
  return (
    <div className="no-scrollbar flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1">
      {hunts.map((h) => {
        const got = Math.min(h.tokens, state.hunts?.[h.id]?.length ?? 0);
        const done = got >= h.tokens;
        return (
          <button
            key={h.id}
            onClick={() => onOpen(h)}
            className="soft relative w-[78%] max-w-[320px] shrink-0 snap-start overflow-hidden rounded-3xl bg-card text-left transition active:scale-[0.98] lg:w-[300px]"
            aria-label={`Sponsored hunt by ${h.brand}: ${h.offer}`}
          >
            <div className="relative aspect-[2.2/1] bg-raise">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={h.image} alt="" className="size-full object-cover" />
              <div className="sponsor-shine pointer-events-none absolute inset-0" />
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#f5c518] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-ink">
                <Sparkles className="size-3" /> Sponsored
              </span>
              {done && <span className="absolute right-2 top-2 rounded-full bg-go px-2 py-0.5 text-[10px] font-black text-white">UNLOCKED</span>}
            </div>
            <div className="p-3">
              <div className="truncate text-sm font-bold">{h.brand}</div>
              <div className="truncate text-xs text-neutral-600">🎁 {h.offer}</div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex flex-1 gap-0.5">
                  {Array.from({ length: h.tokens }, (_, i) => (
                    <span key={i} className={`h-1.5 flex-1 rounded-full ${i < got ? "bg-[#f5c518]" : "bg-line"}`} />
                  ))}
                </div>
                <span className="text-[11px] font-bold tabular-nums text-muted">
                  {got}/{h.tokens} tokens
                </span>
              </div>
            </div>
          </button>
        );
      })}
      <button
        onClick={onAdvertise}
        className="flex w-[60%] max-w-[220px] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-line p-4 text-center transition active:scale-[0.98] lg:w-[220px]"
      >
        <Megaphone className="size-6 text-muted" />
        <span className="text-sm font-bold">Your brand here</span>
        <span className="text-[11px] text-muted">Run a clue hunt with a discount for players</span>
      </button>
    </div>
  );
}
