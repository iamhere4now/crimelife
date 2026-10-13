"use client";

import { Share2, ShieldAlert, Star, Trophy, Unlock } from "lucide-react";
import { useMemo, useState } from "react";
import { shareResult, solveTime } from "@/lib/shareCard";
import { CASE_BY_ID } from "@/lib/cases";
import { moneyShort } from "@/lib/format";
import { LOSS_LIMIT } from "@/lib/ranks";
import type { Verdict } from "@/lib/types";
import { Avatar } from "./Avatar";

interface Props {
  verdict: Verdict;
  /** The detective's losing streak after this verdict, for the demotion warning. */
  lossStreak: number;
  onContinue: () => void;
  /** For the share card: how long the case took and who solved it. */
  share?: { seconds: number; detective: string; rank: string };
}

export function VerdictOverlay({ verdict, lossStreak, onContinue, share }: Props) {
  const [sharing, setSharing] = useState<"" | "busy" | "saved" | "failed">("");
  const theCase = CASE_BY_ID[verdict.caseId];
  const suspect = theCase.suspects.find((s) => s.id === verdict.suspectId)!;
  const correct = verdict.kind === "correct";
  const lossesLeft = LOSS_LIMIT - lossStreak;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/40 px-5 fade-in ${
        correct ? "" : "alarm-flash"
      }`}
      role="alertdialog"
      aria-label={correct ? "Case closed" : "Internal Affairs penalty"}
    >
      {correct && <Confetti />}
      <div
        className={`pop-in relative w-full max-w-md rounded-3xl border bg-card p-6 text-center ${
          correct ? "border-kick shadow-[0_10px_24px_-14px_rgba(20,22,27,0.6)]" : "shake border-danger shadow-[0_0_60px_-10px_#ff3b4e]"
        }`}
      >
        <div className="relative mx-auto size-24">
          <div className={`size-24 overflow-hidden rounded-2xl ring-4 ${correct ? "ring-kick" : "ring-danger"}`}>
            <Avatar face={suspect.face} className={`size-full ${correct ? "" : "grayscale"}`} />
          </div>
          <span
            className={`stamp absolute -bottom-3 left-1/2 -ml-[58px] w-[116px] rounded-md border-2 py-0.5 text-xs font-black tracking-widest ${
              correct ? "border-kick bg-ink text-kick" : "border-danger bg-ink text-danger"
            }`}
          >
            {correct ? "ARRESTED" : "INNOCENT"}
          </span>
        </div>

        {correct ? (
          <>
            <h2 className="neon-text mt-7 text-3xl font-black italic tracking-tight text-kick">E DON CAST!</h2>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-muted">Case closed</p>
            <p className="mt-2 text-sm text-neutral-600">{theCase.solution}</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Stat icon={<Trophy className="size-4" />} label="Bounty" value={verdict.bounty ? `+${moneyShort(verdict.bounty)}` : "Paid already"} good />
              <Stat icon={<Star className="size-4" />} label="Rating" value={verdict.ratingDelta ? `+${verdict.ratingDelta.toFixed(1)}★` : "±0"} good />
            </div>
            {verdict.opened.map((name) => (
              <div key={name} className="pop-in mt-3 flex items-center gap-2 rounded-xl bg-kick/10 p-3 text-left text-sm">
                <Unlock className="size-5 shrink-0 text-kick" />
                <span>
                  <span className="font-bold text-kick">{name} don open! </span>
                  Your money don reach. Go flex am.
                </span>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="mt-7 flex items-center justify-center gap-2 text-danger">
              <ShieldAlert className="size-6" />
              <h2 className="text-2xl font-black uppercase italic tracking-tight">Wahala dey!</h2>
            </div>
            <p className="mt-1 text-sm font-bold text-fg">Internal Affairs misconduct penalty</p>
            <p className="mt-2 text-sm text-neutral-600">
              {suspect.name} no do anything o. Them don release am, and IA don fine your department.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Stat icon={<ShieldAlert className="size-4" />} label="Fine" value={`-${moneyShort(verdict.fine)}`} />
              <Stat icon={<Star className="size-4" />} label="Rating" value={`${verdict.ratingDelta.toFixed(1)}★`} />
            </div>
            {verdict.closed.map((name) => (
              <p key={name} className="mt-3 rounded-xl bg-danger/10 p-2.5 text-xs font-bold text-danger">
                {name} don lock! Your money no reach again. Earn am back to enter.
              </p>
            ))}
            {lossStreak > 0 && (
              <p className="mt-3 rounded-xl bg-danger/10 p-2.5 text-xs font-bold text-danger">
                Losing streak: {lossStreak}/{LOSS_LIMIT}.{" "}
                {lossesLeft === 1 ? "One more loss and dem go demote you!" : `${lossesLeft} more losses and dem go demote you.`}
              </p>
            )}
          </>
        )}

        {correct && share && (
          <>
            <p className="mt-4 text-xs font-bold text-muted">Cracked in {solveTime(share.seconds)}</p>
            <button
              onClick={async () => {
                setSharing("busy");
                const r = await shareResult({ theCase, seconds: share.seconds, detective: share.detective, rank: share.rank, bounty: verdict.kind === "correct" ? verdict.bounty || theCase.bounty : theCase.bounty });
                setSharing(r === "saved" ? "saved" : r === "failed" ? "failed" : "");
              }}
              disabled={sharing === "busy"}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] font-extrabold text-white transition active:scale-95 disabled:opacity-60"
            >
              <Share2 className="size-5" />
              {sharing === "busy" ? "Making your card…" : "Share your win"}
            </button>
            {sharing === "saved" && <p className="mt-1.5 text-[11px] text-muted">Picture saved. Post it on WhatsApp Status or Instagram with the message we opened.</p>}
            {sharing === "failed" && <p className="mt-1.5 text-[11px] text-danger">Couldn&apos;t make the picture on this phone.</p>}
          </>
        )}

        <button
          onClick={onContinue}
          className={`mt-6 h-12 w-full rounded-full font-extrabold transition active:scale-95 ${correct ? "bg-kick text-ink" : "bg-white text-fg ring-1 ring-line"}`}
        >
          {correct ? "Back to Panti" : "Go back check the evidence"}
        </button>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, good }: { icon: React.ReactNode; label: string; value: string; good?: boolean }) {
  return (
    <div className={`rounded-xl p-3 ${good ? "bg-kick/10" : "bg-danger/10"}`}>
      <div className={`flex items-center justify-center gap-1 text-[11px] font-bold uppercase ${good ? "text-kick" : "text-danger"}`}>
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-lg font-black tabular-nums">{value}</div>
    </div>
  );
}

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        color: ["#53FC18", "#ffffff", "#c6ff9e", "#2A323D"][i % 4],
        rotate: Math.random() * 360,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti"
          style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, rotate: `${p.rotate}deg` }}
        />
      ))}
    </div>
  );
}
