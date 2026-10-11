"use client";

import { Flame, Gift, Puzzle } from "lucide-react";
import { hasUnlock } from "@/lib/unlocks";
import { moneyShort } from "@/lib/format";
import type { CrimeCase, GameState } from "@/lib/types";
import { DAILY_REWARD, STREAK_REWARD, today } from "@/lib/useGameState";

/**
 * Home's daily card: the check-in streak (collect once a day, it grows for a
 * week) and today's challenge, to find all three bonus scraps in one case.
 */
export function DailyCard({
  state,
  challenge,
  spinsLeft,
  onClaim,
  onOpen,
  onSpin,
}: {
  state: GameState;
  challenge: CrimeCase | null;
  spinsLeft: number;
  onClaim: () => void;
  onOpen: (c: CrimeCase) => void;
  onSpin: () => void;
}) {
  const d = state.daily;
  const t = today();
  const claimed = d.claimed === t;
  const streak = Math.max(1, d.day === t ? d.streak : 1);
  const reward = STREAK_REWARD * Math.min(7, streak) * (hasUnlock(state.xp, "streak2") ? 2 : 1);
  const doneToday = d.done === t;
  const pieces = challenge ? Math.min(3, state.bonus?.[challenge.id]?.length ?? 0) : 0;

  return (
    <section className="px-4 pt-6" aria-label="Daily">
      <div className="soft grid grid-cols-1 gap-3 rounded-3xl bg-card p-4 lg:grid-cols-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#ff6a1a]/15 text-[#e2560a]">
            <Flame className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold">
              {streak}-day streak{d.best > streak ? <span className="font-normal text-muted"> · best {d.best}</span> : null}
            </div>
            <div className="flex gap-1 pt-1" aria-hidden>
              {Array.from({ length: 7 }, (_, i) => (
                <span key={i} className={`h-1.5 flex-1 rounded-full ${i < Math.min(7, streak) ? "bg-[#ff6a1a]" : "bg-line"}`} />
              ))}
            </div>
            <div className="pt-1 text-[11px] text-muted">Come back every day: the reward grows to {moneyShort(STREAK_REWARD * 7)}.</div>
          </div>
          <button
            onClick={onClaim}
            disabled={claimed}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-kick px-3.5 text-xs font-bold text-ink transition enabled:active:scale-95 disabled:bg-raise disabled:text-muted"
          >
            <Gift className="size-4" />
            {claimed ? "Collected" : `+${moneyShort(reward)}`}
          </button>
        </div>

        <div className="flex min-w-0 items-center gap-3 border-t border-line pt-3 lg:border-l lg:border-t-0 lg:pl-3 lg:pt-0">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#F5A524]/20 text-[#a86a00]">
            <Puzzle className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold">Daily challenge</div>
            <div className="truncate text-xs text-neutral-600">
              {doneToday ? "Done for today. New challenge tomorrow!" : challenge ? `Find all 3 bonus scraps in “${challenge.title}”` : "Every bonus set is complete. Well done!"}
            </div>
            {!doneToday && challenge && <div className="text-[11px] font-semibold text-muted">{pieces}/3 found · pays {moneyShort(DAILY_REWARD)} + 15 XP</div>}
          </div>
          {!doneToday && challenge && (
            <button onClick={() => onOpen(challenge)} className="h-10 shrink-0 rounded-full bg-fg px-3.5 text-xs font-bold text-white active:scale-95">
              Go
            </button>
          )}
        </div>

        {/* the daily Lucky Spin */}
        <button
          onClick={onSpin}
          className="flex min-w-0 items-center gap-3 border-t border-line pt-3 text-left transition active:scale-[0.98] lg:col-span-2"
        >
          <span className={`grid size-12 shrink-0 place-items-center rounded-2xl bg-kick/15 text-2xl ${spinsLeft ? "wiggle" : ""}`} aria-hidden>
            🎡
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold">Lucky Spin</span>
            <span className="block truncate text-xs text-neutral-600">{spinsLeft ? `${spinsLeft} free spin${spinsLeft === 1 ? "" : "s"} today: cash, XP or jara!` : "You've spun today. Come back tomorrow!"}</span>
          </span>
          <span className={`h-10 shrink-0 rounded-full px-4 text-xs font-black leading-10 ${spinsLeft ? "bg-kick text-ink" : "bg-raise text-muted"}`}>{spinsLeft ? "SPIN" : "Done"}</span>
        </button>
      </div>
    </section>
  );
}
