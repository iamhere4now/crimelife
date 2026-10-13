"use client";

import { Bot, Clock, Crown, Gift, Medal, Trophy, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { watchBoard, type BoardRow } from "@/lib/board";
import { BADGES } from "@/lib/badges";
import { decodeFace, lookFace } from "@/lib/looks";
import { hasUnlock } from "@/lib/unlocks";
import { lastWeekId, timeLeft, weekId } from "@/lib/week";
import { rankFor } from "@/lib/ranks";
import { money } from "@/lib/format";
import type { Face, GameState } from "@/lib/types";
import { Avatar } from "./Avatar";

// Practice rivals: clearly marked bots to chase when few real players are around.
const BOTS: { name: string; balance: number; rating: number; xp: number; face: Face }[] = [
  { name: "Insp. Adaeze “Noir” Obi", balance: 9_400_000, rating: 4.9, xp: 1560, face: { skin: "#6b4226", hair: "#111", hairStyle: "bun", shirt: "#1a1a1a", bg: "#2a2a2a", acc: "gele", accColor: "#c0182b", mood: "smirk" } },
  { name: "Ace Adekunle", balance: 7_250_000, rating: 4.7, xp: 1110, face: { skin: "#4a2c17", hair: "#111", hairStyle: "curly", shirt: "#4a1a1a", bg: "#3a1d1d", acc: "shades", mood: "smile" } },
  { name: "Fingerprint Funmi", balance: 4_900_000, rating: 4.6, xp: 780, face: { skin: "#A0703C", hair: "#53FC18", hairStyle: "bun", shirt: "#e8e8e8", bg: "#1a2a22", acc: "goggles", mood: "smile" } },
  { name: "Sgt. Biscuit", balance: 2_300_000, rating: 4.5, xp: 470, face: { skin: "#d9a066", hair: "#7a4a1a", hairStyle: "short", shirt: "#1d2f5a", bg: "#2a221a", dog: true, mood: "smile" } },
  { name: "Rookie Tobi", balance: 410_000, rating: 3.9, xp: 120, face: { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "short", shirt: "#3a2a5a", bg: "#2a1d3a", acc: "fila", accColor: "#1d6a8a", mood: "worried" } },
];

type Sort = "week" | "balance" | "xp" | "solved";

export function LeaderboardView({ state, name, look, face, branch }: { state: GameState; name: string; look: number; face?: string; branch: string }) {
  const [rows, setRows] = useState<BoardRow[] | null | "loading">("loading");
  const [sort, setSort] = useState<Sort>("week");
  useEffect(() => watchBoard(setRows), []);
  // the weekly tournament's prize, set by the owner
  const [prize, setPrize] = useState("");
  useEffect(() => {
    void (async () => {
      try {
        const rt = (window as unknown as { claude?: { use(n: string): Promise<unknown> } }).claude;
        const db = (await rt?.use("db")) as { doc(p: string): { get(): Promise<{ data(): Record<string, unknown> | undefined }> } } | null;
        const d = db ? (await db.doc("adsettings/main").get()).data() : undefined;
        if (typeof d?.prize === "string") setPrize(d.prize.slice(0, 120));
      } catch {
        // no prize shown
      }
    })();
  }, []);
  const thisWeek = weekId();
  const myWeekXp = state.week?.id === thisWeek ? Math.max(0, state.xp - state.week.xp) : 0;

  // always show yourself with your latest numbers, even before your row reaches the board
  const you: BoardRow = { id: "you", name, look, face, balance: state.balance, rating: state.rating, xp: state.xp, solved: state.solved.length, branch, badges: state.badges?.length ?? 0, week: thisWeek, weekXp: myWeekXp, updatedAt: Date.now(), me: true };
  const all = Array.isArray(rows) ? [...rows.filter((r) => !r.me), you] : [you];
  // this week's tournament only counts rows that have played this week
  const real = sort === "week" ? all.filter((r) => r.me || r.week === thisWeek) : all;
  const key = (r: BoardRow) => (sort === "week" ? (r.week === thisWeek ? (r.weekXp ?? 0) : 0) : sort === "balance" ? r.balance : sort === "xp" ? r.xp : r.solved);
  const champions = (Array.isArray(rows) ? rows : [])
    .filter((r) => r.prevWeek === lastWeekId() && (r.prevWeekXp ?? 0) > 0)
    .sort((a, b) => (b.prevWeekXp ?? 0) - (a.prevWeekXp ?? 0))
    .slice(0, 3);
  real.sort((a, b) => key(b) - key(a) || b.rating - a.rating);
  const myPlace = real.findIndex((r) => r.me) + 1;
  const live = Array.isArray(rows);

  return (
    <div className="px-4 pt-5">
      <h1 className="flex items-center gap-2 text-2xl font-black">
        <Trophy className="size-6 text-kick" /> Naija Leaderboard
      </h1>
      <p className="mt-1 text-sm text-muted">Real detectives playing this game, from every branch. Your row updates itself as you play.</p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex rounded-full bg-raise p-1" role="tablist" aria-label="Rank by">
          {(
            [
              ["week", "This week"],
              ["balance", "Money"],
              ["xp", "Merit"],
              ["solved", "Cases"],
            ] as [Sort, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={sort === id}
              onClick={() => setSort(id)}
              className={`h-8 rounded-full px-3 text-xs font-bold transition ${sort === id ? "bg-fg text-white" : "text-neutral-600"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className={`flex items-center gap-1 text-[11px] font-bold ${live ? "text-go" : "text-muted"}`}>
          {live ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
          {rows === "loading" ? "Connecting…" : live ? `${real.length} detective${real.length === 1 ? "" : "s"}` : "Offline"}
        </span>
      </div>

      {sort === "week" && (
        <div className="mt-3 overflow-hidden rounded-3xl p-4 text-white shadow-[0_14px_30px_-18px_rgba(0,0,0,0.6)]" style={{ background: "linear-gradient(120deg, #2457e6, #7a1f6a)" }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/75">Weekly tournament · {thisWeek}</div>
              <div className="mt-0.5 text-xl font-black">Earn the most merit this week</div>
              <div className="mt-1 text-xs text-white/85">Merit from arrests, broken lies, sweeps, bonus sets, the daily challenge and squad cases all count. Resets Monday 12am.</div>
            </div>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold">
              <Clock className="size-3.5" /> {timeLeft()}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="rounded-full bg-black/25 px-2.5 py-1">You: {myWeekXp} XP this week</span>
            {prize && (
              <span className="flex items-center gap-1 rounded-full bg-[#f5c518] px-2.5 py-1 text-ink">
                <Gift className="size-3.5" /> {prize}
              </span>
            )}
          </div>
        </div>
      )}

      {sort === "week" && champions.length > 0 && (
        <div className="mt-3 rounded-2xl bg-raise p-3">
          <div className="text-[11px] font-bold uppercase tracking-wide text-muted">Last week&apos;s champions</div>
          <div className="mt-2 flex gap-2">
            {champions.map((c, i) => (
              <div key={c.id} className="flex min-w-0 flex-1 flex-col items-center rounded-2xl bg-card p-2 text-center">
                <span className="text-lg" aria-hidden>
                  {["🥇", "🥈", "🥉"][i]}
                </span>
                <span className="size-10 overflow-hidden rounded-full ring-1 ring-line">
                  <Avatar face={decodeFace(c.face) ?? lookFace(c.look)} className="size-full" />
                </span>
                <span className="mt-1 w-full truncate text-xs font-bold">{c.name}</span>
                <span className="text-[10px] text-muted">{c.prevWeekXp} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {myPlace > 0 && real.length > 1 && (
        <p className="mt-3 rounded-2xl bg-kick/10 px-3 py-2 text-sm font-semibold">
          You are <span className="font-black">#{myPlace}</span> of {real.length}.{myPlace > 1 ? ` Beat ${real[myPlace - 2].name} to move up.` : " Na you be Oga!"}
        </p>
      )}

      <ol className="mt-3 space-y-2">
        {real.slice(0, 100).map((r, i) => (
          <li
            key={r.id}
            className={`flex items-center gap-3 rounded-2xl border p-3 ${r.me ? "border-kick bg-kick/10 shadow-[0_10px_24px_-14px_rgba(20,22,27,0.6)]" : "border-line bg-card"}`}
          >
            <span className={`w-6 text-center text-lg font-black tabular-nums ${i === 0 ? "text-kick" : "text-muted"}`}>{sort === "week" && i < 3 ? ["🥇", "🥈", "🥉"][i] : i === 0 ? <Crown className="mx-auto size-5" /> : i + 1}</span>
            <div
              className={`size-11 shrink-0 overflow-hidden rounded-full ${hasUnlock(r.xp, "frame") ? "ring-[3px] ring-[#e6b422] shadow-[0_0_10px_rgba(230,180,34,0.7)]" : r.me ? "ring-2 ring-kick" : "ring-1 ring-line"}`}
              title={hasUnlock(r.xp, "frame") ? "Gold Frame (Commissioner and up)" : undefined}
            >
              <Avatar face={decodeFace(r.face) ?? lookFace(r.look)} className="size-full" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-extrabold">
                {r.name}
                {r.me ? " (you)" : ""}
              </div>
              <div className="truncate text-xs text-muted">
                {rankFor(r.xp).name} · ★ {r.rating.toFixed(1)}
                {r.branch ? ` · ${r.branch}` : ""} · {r.solved} closed
                {r.badges ? (
                  <>
                    {" · "}
                    <Medal className="inline size-3 align-[-2px]" /> {r.badges}
                  </>
                ) : null}
              </div>
            </div>
            <span className={`text-sm font-black tabular-nums ${r.balance < 0 ? "text-danger" : r.me ? "text-kick" : ""}`}>
              {sort === "week" ? `${Math.round(key(r))} XP` : sort === "balance" ? money(r.balance) : sort === "xp" ? `${Math.round(r.xp)} XP` : `${r.solved}`}
            </span>
          </li>
        ))}
      </ol>

      {!live && rows !== "loading" && (
        <p className="mt-3 rounded-2xl bg-raise px-3 py-2 text-xs text-muted">Open the game on claude.ai to see the other detectives. Here you can only see yourself.</p>
      )}

      <h2 className="mt-7 flex items-center gap-1.5 text-sm font-bold text-muted">
        <Bot className="size-4" /> Practice rivals (bots)
      </h2>
      <p className="text-xs text-muted">Not real players: targets to chase when the board is quiet.</p>
      <ol className="mt-2 space-y-1.5">
        {BOTS.map((b) => {
          const beaten = state.balance >= b.balance;
          return (
            <li key={b.name} className="flex items-center gap-3 rounded-2xl bg-raise px-3 py-2 opacity-90">
              <div className="size-8 shrink-0 overflow-hidden rounded-full ring-1 ring-line">
                <Avatar face={b.face} className="size-full" />
              </div>
              <div className="min-w-0 flex-1 truncate text-sm font-bold">{b.name}</div>
              <span className="text-xs font-bold tabular-nums">{money(b.balance)}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${beaten ? "bg-go/15 text-go" : "bg-card text-muted"}`}>{beaten ? "Beaten" : "Ahead"}</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 pb-4 text-center text-[11px] text-muted">{BADGES.length} badges to earn: see Profile.</p>
    </div>
  );
}
