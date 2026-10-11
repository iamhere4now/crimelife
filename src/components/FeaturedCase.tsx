"use client";

import { BadgeCheck, Maximize, Play, Volume2, VolumeX } from "lucide-react";
import { money } from "@/lib/format";
import type { CrimeCase } from "@/lib/types";
import { useLiveCount } from "@/lib/useLiveCount";
import { Avatar } from "./Avatar";
import { SceneThumb } from "./scenes/SceneThumb";
import { LiveBadge, Tag, Watching } from "./ui";

interface Props {
  theCase: CrimeCase;
  found: number;
  solved: boolean;
  muted: boolean;
  onEnter: () => void;
  onToggleMute: () => void;
}

/** The big "live stream" hero card for the case the player should work next. */
export function FeaturedCase({ theCase, found, solved, muted, onEnter, onToggleMute }: Props) {
  const watching = useLiveCount(theCase.id);

  return (
    <section className="px-4 pt-4" aria-label="Featured live case">
      <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-card">
        <button onClick={onEnter} className="absolute inset-0" aria-label={`Enter scene: ${theCase.title}`}>
          <SceneThumb theCase={theCase} className="size-full transition duration-500 group-hover:scale-[1.03]" />
        </button>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2">
          <LiveBadge label={solved ? "REPLAY" : "LIVE CRIME SCENE"} />
          {watching > 0 && <Watching n={watching} label="here now" />}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="flex items-center gap-2.5">
            <div className="size-11 shrink-0 overflow-hidden rounded-full ring-2 ring-kick">
              <Avatar face={theCase.lead.face} className="size-full" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-[15px] font-bold">
                {theCase.lead.name}
                <BadgeCheck className="size-4 fill-sky-500 text-white" />
              </div>
              <div className="truncate text-xs text-neutral-600">
                Bounty <span className="font-bold text-kick">{money(theCase.bounty)}</span> · Clues {found}/{theCase.clues.length}
              </div>
            </div>
          </div>

          <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight">{theCase.title}</h1>
          <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{theCase.hook}</p>

          <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto">
            {theCase.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={onEnter}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-kick font-extrabold text-ink shadow-[0_10px_24px_-14px_rgba(20,22,27,0.6)] transition hover:brightness-110 active:scale-95"
            >
              <Play className="size-4 fill-ink" />
              {solved ? "Check am again" : found ? "Continue the gbege" : "Oya, enter!"}
            </button>
            <button
              onClick={onToggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
              className="grid size-11 place-items-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/20 active:scale-90"
            >
              {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
            </button>
            <button
              onClick={onEnter}
              aria-label="Open full scene"
              className="grid size-11 place-items-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/20 active:scale-90"
            >
              <Maximize className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
