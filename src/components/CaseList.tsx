"use client";

import { BadgeCheck, CircleCheckBig, Lock, Star, Timer, Users } from "lucide-react";
import { gateRemaining, isCaseOpen, isModeOpen, modeOf } from "@/lib/modes";
import { compact, money, moneyShort } from "@/lib/format";
import type { CaseId, CrimeCase, GameState } from "@/lib/types";
import { useLiveCount } from "@/lib/useLiveCount";
import { Avatar } from "./Avatar";
import { SceneThumb } from "./scenes/SceneThumb";
import { LiveBadge, Tag } from "./ui";

interface Props {
  cases: CrimeCase[];
  state: GameState;
  onOpen: (id: CaseId) => void;
  layout?: "row" | "stack";
}

/** Streamer-style case cards, as a swipeable row or a vertical list. */
export function CaseList({ cases, state, onOpen, layout = "row" }: Props) {
  if (cases.length === 0) {
    return <p className="px-4 py-6 text-center text-sm text-muted">No case match am. Try another thing.</p>;
  }
  return (
    <div
      className={
        layout === "row"
          ? "no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2"
          : "flex flex-col gap-6 px-5"
      }
    >
      {cases.map((c) => (
        <CaseCard key={c.id} theCase={c} state={state} onOpen={onOpen} wide={layout === "stack"} />
      ))}
    </div>
  );
}

function CaseCard({ theCase, state, onOpen, wide }: { theCase: CrimeCase; state: GameState; onOpen: (id: CaseId) => void; wide: boolean }) {
  const unlocked = isCaseOpen(theCase.id, state);
  const mode = modeOf(theCase.id);
  const solved = state.solved.includes(theCase.id);
  const found = state.found[theCase.id]?.length ?? 0;
  const watching = useLiveCount(theCase.id);

  return (
    <button
      onClick={() => onOpen(theCase.id)}
      className={`${wide ? "w-full" : "w-[82%] shrink-0 snap-start"} text-left transition active:scale-[0.98]`}
      aria-label={`${theCase.title}${unlocked ? "" : " (locked)"}`}
    >
      <div className={`relative aspect-video overflow-hidden soft rounded-3xl bg-card`}>
        <SceneThumb theCase={theCase} className={`size-full ${unlocked ? "" : "blur-[3px] grayscale"}`} />
        <div className="absolute left-2 top-2">
          {solved ? (
            <span className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-extrabold text-fg">
                <CircleCheckBig className="size-3" /> CASE CLOSED
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-neon">
                <Timer className="size-3" />
                {[1, 2, 3].map((i) => (
                  <Star key={i} className={`size-2.5 ${i <= (state.sweepStars[theCase.id] ?? 0) ? "fill-neon" : "text-neutral-400"}`} />
                ))}
              </span>
            </span>
          ) : unlocked ? (
            <LiveBadge />
          ) : null}
        </div>
        {watching > 0 && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold" title="Detectives on this case right now">
            <Users className="size-3" /> {compact(watching)} here now
          </span>
        )}
        <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-bold text-neon">
          {money(theCase.bounty)}
        </span>
        {unlocked && !solved && found > 0 && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-black/60">
            <div className="h-full bg-kick" style={{ width: `${(found / theCase.clues.length) * 100}%` }} />
          </div>
        )}
        {!unlocked && (
          <div className="absolute inset-0 grid place-items-center bg-black/55">
            <div className="flex flex-col items-center gap-1.5 px-6 text-center">
              <span className="grid size-10 place-items-center rounded-full bg-raise ring-1 ring-line">
                <Lock className="size-5 text-muted" />
              </span>
              <span className="text-xs font-semibold text-neutral-600">
                {isModeOpen(mode, state)
                  ? `Finale · Close ${gateRemaining(theCase.id, state)} more Naija Files to unlock`
                  : `${mode.name} · You need ${moneyShort(mode.cost)} to enter`}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2.5 flex gap-2.5">
        <div className="size-9 shrink-0 overflow-hidden rounded-full ring-2 ring-line">
          <Avatar face={theCase.lead.face} className="size-full" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-[15px] font-bold">
            {theCase.lead.name}
            <BadgeCheck className="size-4 fill-sky-500 text-white" />
          </div>
          <div className="truncate text-xs font-semibold uppercase tracking-wide text-neutral-600">Investigating {theCase.title}!</div>
          <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto">
            {theCase.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}
