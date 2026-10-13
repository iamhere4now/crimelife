"use client";

import { ChevronRight, Flame, Lock, LogOut, Megaphone, Shirt, Volume2, VolumeX } from "lucide-react";
import { BADGES } from "@/lib/badges";
import { UNLOCKS, rankName } from "@/lib/unlocks";
import { CASES } from "@/lib/cases";
import { money } from "@/lib/format";
import { LOSS_LIMIT, RANKS, rankFor, rankIndex, rankProgress, XP_ARREST, XP_LIE, XP_STAR } from "@/lib/ranks";
import type { Face, GameState } from "@/lib/types";
import { AccountCard } from "./AccountCard";
import { AppSettings } from "./AppSettings";
import { Avatar } from "./Avatar";
import { Insignia } from "./RankViews";
import { Stars } from "./ui";

interface Props {
  state: GameState;
  name: string;
  face: Face;
  onToggleMute: () => void;
  onSwitch: () => void;
  onAdvertise: () => void;
  onEditLook: () => void;
  /** Sign-up details, for the account card (the game's own site). */
  account?: { fullName?: string; email?: string };
}

export function ProfileView({ state, name, face, onToggleMute, onSwitch, onAdvertise, onEditLook, account }: Props) {
  const { stats } = state;
  const accuracy = stats.accusations ? Math.round((stats.correct / stats.accusations) * 100) : 0;
  const rank = rankFor(state.xp);
  const current = rankIndex(state.xp);
  const next = RANKS[current + 1];

  return (
    <div className="px-4 pt-5">
      <div className="flex flex-col items-center rounded-3xl border border-line bg-card p-6 text-center">
        <div className="relative">
          <div className="size-24 overflow-hidden rounded-full bg-kick p-1 shadow-[0_10px_24px_-14px_rgba(20,22,27,0.6)]">
            <div className="size-full overflow-hidden rounded-full border-2 border-ink">
              <Avatar face={face} className="size-full" />
            </div>
          </div>
          <Insignia rank={rank} className="absolute -bottom-2 -right-3 size-11" />
        </div>
        <button onClick={onEditLook} className="mt-3 flex h-9 items-center gap-1.5 rounded-full bg-kick px-4 text-xs font-black text-ink transition active:scale-95">
          <Shirt className="size-4" /> Edit my look
        </button>
        <div className="mt-3 text-xl font-black">
          {rank.short} {name}
        </div>
        <div className="mt-0.5 rounded-full bg-kick px-2.5 py-0.5 text-xs font-extrabold text-ink">
          {rank.name} · {rank.branch}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Stars rating={state.rating} className="size-5" />
          <span className="text-sm font-bold tabular-nums">{state.rating.toFixed(1)} / 5.0</span>
        </div>
        <div className={`mt-3 text-3xl font-black tabular-nums ${state.balance < 0 ? "text-danger" : "text-kick neon-text"}`}>{money(state.balance)}</div>
        <div className="text-xs text-muted">Your money</div>
      </div>

      <AccountCard fullName={account?.fullName} email={account?.email} />

      {/* advertise on the game's streets */}
      <button onClick={onAdvertise} className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-kick p-4 text-left text-white transition active:scale-[0.98]">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/15">
          <Megaphone className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-extrabold">Advertise your business</span>
          <span className="block text-xs text-white/70">Put your poster on billboards and walls in the crime scenes</span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-white/60" />
      </button>

      {/* what each rank unlocks */}
      <section className="mt-4 rounded-2xl border border-line bg-card p-4" aria-label="Rank unlocks">
        <h2 className="text-sm font-extrabold">Rank unlocks</h2>
        <p className="text-[11px] text-muted">Climb the ladder to open new powers. New hats, hair and outfits unlock at every rank too.</p>
        <ul className="mt-3 space-y-2">
          {UNLOCKS.map((u) => {
            const open = current >= u.rank;
            return (
              <li key={u.id} className={`flex items-start gap-3 rounded-2xl p-2.5 ${open ? "bg-kick/10" : "bg-raise"}`}>
                <span className={`text-2xl ${open ? "" : "opacity-40 grayscale"}`} aria-hidden>
                  {u.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-sm font-extrabold">
                    {u.name}
                    {!open && (
                      <span className="flex items-center gap-0.5 rounded-full bg-card px-1.5 py-0.5 text-[10px] font-bold text-muted">
                        <Lock className="size-3" /> {rankName(u.rank)}
                      </span>
                    )}
                  </span>
                  <span className="block text-[11px] leading-snug text-neutral-600">{u.what}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* badges */}
      <section className="mt-4 rounded-2xl border border-line bg-card p-4" aria-label="Badges">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-extrabold">Badges</h2>
          <span className="text-xs font-bold tabular-nums text-muted">
            {state.badges?.length ?? 0}/{BADGES.length}
          </span>
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-3">
          {BADGES.map((b) => {
            const got = state.badges?.includes(b.id);
            const [have, need] = b.progress(state);
            return (
              <li key={b.id} className={`rounded-2xl p-2.5 ${got ? "bg-kick/10 ring-1 ring-kick/40" : "bg-raise"}`} title={b.how}>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl ${got ? "" : "opacity-35 grayscale"}`} aria-hidden>
                    {b.emoji}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-extrabold">{b.name}</span>
                    <span className="block text-[10px] leading-tight text-muted">{b.how}</span>
                  </span>
                </div>
                {!got && (
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line" aria-label={`${have} of ${need}`}>
                    <div className="h-full bg-kick" style={{ width: `${Math.round((have / need) * 100)}%` }} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* promotion ladder */}
      <section className="mt-4 rounded-2xl border border-line bg-card p-4" aria-label="Rank ladder">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-extrabold">Promotion ladder</h2>
          <span className="text-xs font-bold tabular-nums text-kick">{state.xp} XP</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-kick" style={{ width: `${rankProgress(state.xp) * 100}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-muted">
          {next ? `${next.xp - state.xp} XP more and you go become ${next.name}.` : "General! Nobody fit pass you again."} Arrest +{XP_ARREST}, lie caught +{XP_LIE}, sweep star +{XP_STAR}.
        </p>
        <div className={`mt-3 flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold ${state.lossStreak ? "bg-danger/10 text-danger" : "bg-raise text-neutral-600"}`}>
          <Flame className="size-4 shrink-0" />
          {state.lossStreak
            ? `Losing streak ${state.lossStreak}/${LOSS_LIMIT}. Lose ${LOSS_LIMIT - state.lossStreak} more in a row and dem go demote you, plus 10% of your money.`
            : `No losing streak. Lose ${LOSS_LIMIT} cases or sweeps in a row and you go drop one rank and pay 10% of your money.`}
        </div>
        <ol className="mt-3 grid grid-cols-2 gap-1.5">
          {RANKS.map((r, i) => (
            <li
              key={r.name}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${
                i === current ? "bg-kick/15 font-extrabold text-kick ring-1 ring-kick" : i < current ? "text-neutral-600" : "text-muted"
              }`}
            >
              <Insignia rank={r} className={`size-6 shrink-0 ${i > current ? "opacity-35" : ""}`} />
              <span className="min-w-0 truncate">{r.name}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <Tile label="Cases closed" value={`${state.solved.length}/${CASES.length}`} />
        <Tile label="Accuracy" value={stats.accusations ? `${accuracy}%` : "—"} />
        <Tile label="Money earned" value={money(stats.earned)} good />
        <Tile label="IA fines" value={stats.fines ? `-${money(stats.fines)}` : "₦0"} bad={stats.fines > 0} />
      </div>

      <AppSettings />

      <div className="mt-4 divide-y divide-line/60 rounded-2xl border border-line bg-card">
        <button onClick={onToggleMute} className="flex w-full items-center justify-between p-4 text-left">
          <span className="flex items-center gap-3 font-semibold">
            {state.muted ? <VolumeX className="size-5 text-muted" /> : <Volume2 className="size-5 text-kick" />}
            Sound effects
          </span>
          <span className={`relative h-6 w-11 rounded-full transition ${state.muted ? "bg-line" : "bg-kick"}`}>
            <span className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${state.muted ? "left-0.5" : "left-[22px]"}`} />
          </span>
        </button>
        <button onClick={onSwitch} className="flex w-full items-center gap-3 p-4 text-left font-semibold">
          <LogOut className="size-5 text-kick" /> Switch detective (sign in or sign up)
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-muted">Progress saves automatically.</p>
    </div>
  );
}

function Tile({ label, value, good, bad }: { label: string; value: string; good?: boolean; bad?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-3.5">
      <div className="text-xs font-semibold text-muted">{label}</div>
      <div className={`mt-1 text-xl font-black tabular-nums ${good ? "text-kick" : bad ? "text-danger" : ""}`}>{value}</div>
    </div>
  );
}
