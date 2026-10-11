"use client";

import { Lightbulb, X } from "lucide-react";
import { SQUADS } from "@/lib/cases";
import type { CrimeCase } from "@/lib/types";
import { Avatar } from "./Avatar";
import { LiveBadge } from "./ui";

interface Props {
  activeCase: CrimeCase;
  selected: string | null;
  onSelect: (id: string | null) => void;
}

/** Kick-style row of "live" avatars: precinct squads that hand out tips. */
export function DetectiveRow({ activeCase, selected, onSelect }: Props) {
  const squad = SQUADS.find((s) => s.id === selected);

  return (
    <section aria-label="Precinct squads">
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1 pt-4">
        {SQUADS.map((s) => {
          const isActive = s.id === selected;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(isActive ? null : s.id)}
              aria-pressed={isActive}
              className="flex w-[60px] shrink-0 flex-col items-center gap-1.5 transition active:scale-90"
            >
              <span className="relative">
                <span
                  className={`block size-[58px] overflow-hidden rounded-full p-[2.5px] transition ${
                    s.live ? "bg-kick" : "bg-line"
                  } ${isActive ? "shadow-[0_10px_24px_-14px_rgba(20,22,27,0.6)]" : ""}`}
                >
                  <span className="block size-full overflow-hidden rounded-full border-2 border-ink">
                    <Avatar face={s.face} className="size-full" title={s.name} />
                  </span>
                </span>
                {s.live && <LiveBadge className="absolute -top-1 left-1/2 -translate-x-1/2 scale-90 px-1 py-0 text-[8px]" />}
              </span>
              <span className={`w-full truncate text-center text-[11px] font-semibold ${isActive ? "text-kick" : "text-neutral-600"}`}>
                {s.name}
              </span>
            </button>
          );
        })}
      </div>

      {squad && (
        <div className="pop-in mx-4 mt-3 flex gap-3 rounded-2xl border border-kick/40 bg-card p-3">
          <div className="size-11 shrink-0 overflow-hidden rounded-full ring-2 ring-kick">
            <Avatar face={squad.face} className="size-full" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-kick">
              <Lightbulb className="size-3.5" />
              {squad.name} tip · {activeCase.title}
            </div>
            <p className="mt-1 text-sm leading-snug text-neutral-700">{squad.tips[activeCase.id] ?? squad.fallback}</p>
          </div>
          <button onClick={() => onSelect(null)} aria-label="Close tip" className="self-start text-muted hover:text-fg">
            <X className="size-4" />
          </button>
        </div>
      )}
    </section>
  );
}
