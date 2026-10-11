"use client";

import { ChevronDown, ChevronUp, Flame } from "lucide-react";
import { useMemo } from "react";
import { moneyShort } from "@/lib/format";
import { LOSS_LIMIT, RANKS, rankFor, rankIndex, rankProgress, type Rank, type RankEvent } from "@/lib/ranks";
import type { Face } from "@/lib/types";
import { PARTS } from "@/lib/looks";
import { UNLOCKS } from "@/lib/unlocks";
import { Avatar } from "./Avatar";

/** Shoulder-board style badge: police ranks in green, army ranks in khaki with gold stars. */
export function Insignia({ rank, className = "size-12" }: { rank: Rank; className?: string }) {
  const i = RANKS.indexOf(rank);
  const army = rank.branch === "Army";
  // Police: 0–3 chevrons for the junior ranks, then stars. Army: stars by seniority.
  const marks = army ? i - 6 : i;
  const stars = Math.max(1, army ? marks : i - 3);
  const starAt = (k: number) => {
    const row = Math.floor(k / 3);
    const inRow = Math.min(3, stars - row * 3);
    return { x: 24 + ((k % 3) - (inRow - 1) / 2) * 10, y: 17 + row * 11 };
  };
  return (
    <svg viewBox="0 0 48 48" className={className} aria-label={rank.name}>
      <path d="M8 6 H40 V36 L24 44 L8 36 Z" fill={army ? "#5a5a2a" : "#123a20"} stroke={army ? "#e6c35a" : "#53FC18"} strokeWidth="2.5" />
      {!army && i <= 3
        ? Array.from({ length: i }, (_, k) => (
            <path key={k} d={`M14 ${14 + k * 7} L24 ${20 + k * 7} L34 ${14 + k * 7}`} stroke="#53FC18" strokeWidth="3" fill="none" strokeLinecap="round" />
          ))
        : Array.from({ length: stars }, (_, k) => {
            const { x, y } = starAt(k);
            return (
              <path
                key={k}
                transform={`translate(${x} ${y}) scale(0.32)`}
                d="M0 -12 L3.5 -3.7 L12 -3.7 L5.2 1.6 L7.6 10 L0 5 L-7.6 10 L-5.2 1.6 L-12 -3.7 L-3.5 -3.7 Z"
                fill={army ? "#e6c35a" : "#53FC18"}
              />
            );
          })}
    </svg>
  );
}

/** Home-screen strip: who you are, your rank, progress to the next, and any losing streak. */
export function RankStrip({ name, face, xp, lossStreak, onOpen }: { name: string; face: Face; xp: number; lossStreak: number; onOpen: () => void }) {
  const rank = rankFor(xp);
  const i = rankIndex(xp);
  const next = RANKS[i + 1];
  return (
    <button onClick={onOpen} className="soft mx-5 flex w-[calc(100%-2.5rem)] items-center gap-3 rounded-3xl bg-card p-3 text-left transition active:scale-[0.99]">
      <div className="size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-line">
        <Avatar face={face} className="size-full" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-extrabold">
            {rank.short} {name}
          </span>
          <span className={`rounded px-1.5 py-px text-[9px] font-black uppercase ${rank.branch === "Army" ? "bg-[#5a5a2a] text-[#e6c35a]" : "bg-kick/15 text-kick"}`}>
            {rank.branch}
          </span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-kick" style={{ width: `${rankProgress(xp) * 100}%` }} />
        </div>
        <div className="mt-1 flex justify-between gap-2 text-[10px] font-semibold text-muted">
          <span className="truncate">{rank.name}</span>
          <span className="shrink-0">{next ? `${next.xp - xp} XP to ${next.short}` : "Top of the ladder!"}</span>
        </div>
      </div>
      {lossStreak > 0 ? (
        <span className="flex shrink-0 flex-col items-center rounded-xl bg-danger/15 px-2 py-1 text-danger" title="Losing streak">
          <Flame className="size-4" />
          <span className="text-[10px] font-black tabular-nums">
            {lossStreak}/{LOSS_LIMIT}
          </span>
        </span>
      ) : (
        <Insignia rank={rank} className="size-10 shrink-0" />
      )}
    </button>
  );
}

/** Full-screen promotion or demotion announcement. */
export function RankOverlay({ event, onClose }: { event: RankEvent; onClose: () => void }) {
  const up = event.kind === "promoted";
  const crossed = up && event.from.branch === "Police" && event.to.branch === "Army";
  const sparks = useMemo(() => Array.from({ length: 24 }, () => ({ left: Math.random() * 100, delay: Math.random() * 0.6 })), []);
  return (
    <div className={`fixed inset-0 z-[55] flex items-center justify-center overflow-hidden bg-black/40 px-6 fade-in ${up ? "" : "alarm-flash"}`} role="alertdialog" aria-label={up ? "Promoted" : "Demoted"}>
      {up && (
        <div className="pointer-events-none absolute inset-0">
          {sparks.map((s, k) => (
            <span key={k} className="confetti" style={{ left: `${s.left}%`, background: k % 2 ? "#e6c35a" : "#53FC18", animationDelay: `${s.delay}s` }} />
          ))}
        </div>
      )}
      <div className={`pop-in relative w-full max-w-md rounded-3xl border bg-card p-6 text-center ${up ? "border-kick shadow-[0_10px_24px_-14px_rgba(20,22,27,0.6)]" : "shake border-danger shadow-[0_0_60px_-10px_#ff3b4e]"}`}>
        <div className="flex items-center justify-center gap-3">
          <Insignia rank={event.from} className="size-12 opacity-50" />
          {up ? <ChevronUp className="size-7 text-kick" /> : <ChevronDown className="size-7 text-danger" />}
          <Insignia rank={event.to} className="stamp size-20" />
        </div>
        <h2 className={`mt-4 text-3xl font-black italic tracking-tight ${up ? "neon-text text-kick" : "text-danger"}`}>
          {up ? "PROMOTED!" : "WAHALA DON LAND!"}
        </h2>
        <p className="mt-2 text-sm text-neutral-700">
          {up
            ? crossed
              ? `Na so! You don leave police reach Army. Welcome, ${event.to.name}!`
              : `Oga at the top! You don become ${event.to.name}.`
            : event.from === event.to
              ? "Five losses in a row! You don already reach Constable, so you no fit drop lower. But Oga still collect his 10%."
              : `Five losses in a row? Ah, Oga. Dem don drop you to ${event.to.name}. Pull yourself together!`}
        </p>
        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-muted">
          {up ? `${event.from.name} → ${event.to.name}` : event.from === event.to ? `Still ${event.to.name}` : `Demoted: ${event.from.name} → ${event.to.name}`}
        </p>
        {up && <Unlocked rank={RANKS.findIndex((r) => r.name === event.to.name)} />}
        {!up && (
          <div className="mt-4 rounded-xl bg-danger/10 p-3 text-sm">
            <div className="text-[11px] font-bold uppercase tracking-wide text-danger">Demotion fine (10% of your money)</div>
            <div className="mt-0.5 text-2xl font-black tabular-nums text-danger">-{moneyShort(event.fine)}</div>
            {event.closed.map((name) => (
              <div key={name} className="mt-1 text-xs font-bold text-danger">
                {name} don lock. Earn your money back to enter.
              </div>
            ))}
          </div>
        )}
        <button onClick={onClose} className={`mt-6 h-12 w-full rounded-full font-extrabold transition active:scale-95 ${up ? "bg-kick text-ink" : "bg-white text-fg ring-1 ring-line"}`}>
          {up ? "I don hear. Carry go!" : "I go do better"}
        </button>
      </div>
    </div>
  );
}

/** What a promotion opens up: rank perks and new items for the look editor. */
function Unlocked({ rank }: { rank: number }) {
  const perks = UNLOCKS.filter((u) => u.rank === rank);
  const items = Object.values(PARTS)
    .flat()
    .filter((p) => (p as { rank: number }).rank === rank)
    .map((p) => (p as { label: string }).label);
  if (!perks.length && !items.length) return null;
  return (
    <div className="mt-4 rounded-2xl bg-kick/10 p-3 text-left">
      <div className="text-[11px] font-bold uppercase tracking-wide text-muted">New unlocks</div>
      {perks.map((u) => (
        <div key={u.id} className="mt-1.5 flex items-start gap-2 text-sm">
          <span aria-hidden>{u.emoji}</span>
          <span>
            <b>{u.name}</b>: {u.what}
          </span>
        </div>
      ))}
      {items.length > 0 && (
        <div className="mt-1.5 text-sm">
          👕 New looks for your detective: {items.join(", ")}. Open Profile, Edit my look.
        </div>
      )}
    </div>
  );
}
