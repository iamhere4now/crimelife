"use client";

import { ChevronRight } from "lucide-react";
import { NAIJA_FILES, NAIJA_FILES_INTRO } from "@/lib/content/naijaFiles";
import { moneyShort } from "@/lib/format";
import { isModeOpen, MODE_BY_ID } from "@/lib/modes";
import type { GameState } from "@/lib/types";

/** The campaign's story card: the 1999 mystery, cogs collected so far, and a way in. */
export function NaijaFilesCard({ state, onPlay }: { state: GameState; onPlay: () => void }) {
  const mode = MODE_BY_ID.naija;
  const open = isModeOpen(mode, state);
  const closed = NAIJA_FILES.filter((c) => state.solved.includes(c.id)).length;
  const states = [...new Set(NAIJA_FILES.map((c) => c.region?.state ?? "Lagos"))];

  return (
    <section className="soft mx-5 mt-4 overflow-hidden rounded-3xl bg-[radial-gradient(120%_80%_at_0%_0%,rgba(201,163,74,0.16),transparent)] bg-card p-4">
      <div className="flex items-start gap-3">
        <svg viewBox="-20 -20 40 40" className="size-12 shrink-0 animate-[spin_12s_linear_infinite]" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x="-3" y="-17" width="6" height="8" fill="#c9a34a" transform={`rotate(${i * 45})`} />
          ))}
          <circle r="11" fill="#e6c35a" stroke="#8a6a2a" strokeWidth="2" />
          <text y="3.5" textAnchor="middle" fontSize="7" fontWeight="900" fill="#3a2a10">00:07</text>
        </svg>
        <div className="min-w-0">
          <div className="text-[11px] font-black uppercase tracking-widest text-[#a37a1c]">Story campaign</div>
          <h3 className="text-lg font-black leading-tight">{NAIJA_FILES_INTRO.title}</h3>
          <p className="mt-1 text-[13px] leading-snug text-neutral-600">{NAIJA_FILES_INTRO.summary}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {states.map((s) => (
          <span key={s} className="rounded-full bg-raise px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
            {s}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex justify-between text-[11px] font-bold text-muted">
            <span>Cogs collected</span>
            <span className="tabular-nums text-[#a37a1c]">
              {closed}/{NAIJA_FILES.length}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-[#e6c35a]" style={{ width: `${(closed / NAIJA_FILES.length) * 100}%` }} />
          </div>
        </div>
        <button
          onClick={onPlay}
          className="flex h-10 shrink-0 items-center gap-1 rounded-full bg-kick px-4 text-sm font-bold text-ink transition active:scale-95"
        >
          {open ? "Open the files" : `Need ${moneyShort(mode.cost)}`}
          <ChevronRight className="size-4" />
        </button>
      </div>
    </section>
  );
}
