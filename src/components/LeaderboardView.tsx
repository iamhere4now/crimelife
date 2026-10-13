"use client";

import { Banknote, Bot, Clock, FolderCheck, Gem, Gift, Medal, RefreshCw, Trophy, Wifi, WifiOff } from "lucide-react";
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
      <h1 className="text-center text-2xl font-black tracking-tight">Leaderboard</h1>
      <p className="mt-0.5 text-center text-sm text-muted">
        {sort === "week" ? `Weekly tournament · ends in ${timeLeft()}` : `${monthYear()} · every branch`}
      </p>

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
              className={`h-8 whitespace-nowrap rounded-full px-2.5 text-xs font-bold transition ${sort === id ? "bg-fg text-white" : "text-neutral-600"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className={`flex shrink-0 items-center gap-1 whitespace-nowrap text-[11px] font-bold ${live ? "text-go" : "text-muted"}`}>
          {live ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
          {rows === "loading" ? "…" : live ? real.length : "Offline"}
        </span>
      </div>

      <Podium top={real.slice(0, 3)} score={(r) => <Score sort={sort} value={key(r)} />} />

      <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-muted">
        <RefreshCw className="size-3" /> Leaderboard updated {ago(Math.max(0, ...real.filter((r) => !r.me).map((r) => r.updatedAt || 0)))}
      </p>

      {myPlace > 0 && real.length > 1 && (
        <p className="mt-3 rounded-2xl bg-kick/10 px-3 py-2 text-sm font-semibold">
          You are <span className="font-black">#{myPlace}</span> of {real.length}.{myPlace > 1 ? ` Beat ${real[myPlace - 2].name} to move up.` : " Na you be Oga!"}
        </p>
      )}

      <ol className="mt-3 space-y-2">
        {real.slice(3, 100).map((r, i) => (
          <li
            key={r.id}
            className={`flex items-center gap-3 rounded-2xl p-2.5 pr-3.5 shadow-[0_6px_18px_-14px_rgba(20,22,27,0.5)] ${r.me ? "bg-kick/10 ring-2 ring-kick" : "bg-card"}`}
          >
            <span className="flex w-9 shrink-0 items-center gap-0.5 text-sm font-black tabular-nums text-neutral-700">
              <Trophy className="size-3.5 text-neutral-400" />
              {i + 4}
            </span>
            <FaceTile row={r} className="size-12" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-extrabold">
                {r.name}
                {r.me ? " (you)" : ""}
              </div>
              <div className="truncate text-xs text-muted">
                {rankFor(r.xp).name}
                {r.branch ? ` · ${r.branch}` : ""} · {r.solved} closed
                {r.badges ? (
                  <>
                    {" · "}
                    <Medal className="inline size-3 align-[-2px]" /> {r.badges}
                  </>
                ) : null}
              </div>
            </div>
            <span className={`text-sm font-black tabular-nums ${sort === "balance" && r.balance < 0 ? "text-danger" : ""}`}>
              <Score sort={sort} value={key(r)} />
            </span>
          </li>
        ))}
      </ol>

      {sort === "week" && (
        <div className="mt-5 overflow-hidden rounded-3xl p-4 text-white shadow-[0_14px_30px_-18px_rgba(0,0,0,0.6)]" style={{ background: "linear-gradient(120deg, #2457e6, #7a1f6a)" }}>
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

const monthYear = () => new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" });

function ago(t: number) {
  if (!t) return "just now";
  const m = Math.floor((Date.now() - t) / 60_000);
  return m < 1 ? "just now" : m < 60 ? `${m}m ago` : m < 1440 ? `${Math.floor(m / 60)}h ago` : `${Math.floor(m / 1440)}d ago`;
}

/** The score with its little icon: merit as a gem, money in naira, cases as a folder. */
function Score({ sort, value }: { sort: Sort; value: number }) {
  if (sort === "balance")
    return (
      <span className="inline-flex items-center gap-1">
        <Banknote className="size-3.5 text-go" />
        {money(value)}
      </span>
    );
  if (sort === "solved")
    return (
      <span className="inline-flex items-center gap-1">
        <FolderCheck className="size-3.5 text-[#2457e6]" />
        {value}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1">
      <Gem className="size-3.5 fill-[#8fb8ff] text-[#2f6bff]" />
      {Math.round(value).toLocaleString()}
    </span>
  );
}

/** A detective's face on a soft rounded tile (gold ring for Commissioner and up). */
function FaceTile({ row, className = "" }: { row: BoardRow; className?: string }) {
  const gold = hasUnlock(row.xp, "frame");
  return (
    <span
      className={`relative block shrink-0 overflow-hidden rounded-2xl bg-white p-0.5 shadow-[0_4px_12px_-6px_rgba(20,22,27,0.4)] ${gold ? "ring-[3px] ring-[#e6b422]" : row.me ? "ring-2 ring-kick" : "ring-1 ring-black/5"} ${className}`}
      title={gold ? "Gold Frame (Commissioner and up)" : undefined}
    >
      <span className="block size-full overflow-hidden rounded-[13px] bg-[#eef0f4]">
        <Avatar face={decodeFace(row.face) ?? lookFace(row.look)} className="size-full" />
      </span>
    </span>
  );
}

const PODIUM = [
  // place 2 (left), 1 (middle), 3 (right)
  { place: 2, height: 112, face: "#b9c5ff", top: "#dfe5ff", ring: "#93a5f5" },
  { place: 1, height: 150, face: "#f8c514", top: "#fde68a", ring: "#e6b422" },
  { place: 3, height: 96, face: "#ffab8c", top: "#ffd6c7", ring: "#f08a66" },
];

/** A little laurel wreath under the podium numbers. */
function Laurel({ className = "" }: { className?: string }) {
  const leaves = [0, 1, 2, 3, 4];
  return (
    <svg viewBox="0 0 64 28" className={className} aria-hidden="true">
      {[-1, 1].map((side) => (
        <g key={side} transform={side === 1 ? "translate(64 0) scale(-1 1)" : undefined}>
          <path d="M30 26 C18 25 9 18 6 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          {leaves.map((i) => {
            const t = i / 4;
            const x = 30 - 24 * t + 2;
            const y = 26 - 20 * t * t - 1;
            return <ellipse key={i} cx={x - 3} cy={y - 2} rx="5" ry="2.2" transform={`rotate(${-35 - i * 12} ${x - 3} ${y - 2})`} fill="currentColor" />;
          })}
        </g>
      ))}
    </svg>
  );
}

/** The top three on a sunlit podium: gold in the middle, then silver-blue and coral. */
function Podium({ top, score }: { top: BoardRow[]; score: (r: BoardRow) => React.ReactNode }) {
  return (
    <div className="relative mt-3 overflow-hidden rounded-[28px] bg-[#fbf6ea] px-2 pt-5">
      {/* the sunburst behind the winners */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background: "repeating-conic-gradient(from 0deg at 50% 38%, rgba(255,255,255,0) 0deg 7deg, rgba(255,255,255,0.75) 7deg 11deg)",
          WebkitMaskImage: "radial-gradient(circle at 50% 38%, #000 0%, #000 30%, transparent 72%)",
          maskImage: "radial-gradient(circle at 50% 38%, #000 0%, #000 30%, transparent 72%)",
        }}
      />
      <div className="relative grid grid-cols-3 items-end">
        {PODIUM.map((p) => {
          const r = top[p.place - 1];
          return (
            <div key={p.place} className="flex min-w-0 flex-col items-center">
              {/* who stands here */}
              <div className="flex w-full min-w-0 flex-col items-center px-1 pb-2 text-center">
                <span className="relative">
                  <span className="absolute -top-1.5 left-1/2 z-10 size-2.5 -translate-x-1/2 rounded-full border-2 border-white" style={{ background: p.ring }} />
                  {r ? (
                    <FaceTile row={r} className={p.place === 1 ? "size-16" : "size-14"} />
                  ) : (
                    <span className={`grid place-items-center rounded-2xl border-2 border-dashed border-black/10 text-lg text-black/25 ${p.place === 1 ? "size-16" : "size-14"}`}>?</span>
                  )}
                </span>
                <span className="mt-1.5 w-full truncate text-[13px] font-extrabold">{r ? `${r.name}${r.me ? " (you)" : ""}` : "Open spot"}</span>
                <span className="text-xs font-bold text-neutral-600 tabular-nums">{r ? score(r) : "—"}</span>
              </div>
              {/* the block: a lighter top face, then the front fading into the page */}
              <div className="w-full">
                <div className="h-3.5 w-full" style={{ background: p.top, clipPath: p.place === 1 ? "polygon(4% 0, 96% 0, 100% 100%, 0 100%)" : p.place === 2 ? "polygon(10% 0, 100% 0, 100% 100%, 0 100%)" : "polygon(0 0, 90% 0, 100% 100%, 0 100%)" }} />
                <div
                  className="flex w-full flex-col items-center pt-3 text-white"
                  style={{ height: p.height, background: `linear-gradient(180deg, ${p.face} 0%, ${p.face} 45%, ${p.face}00 100%)` }}
                >
                  <span className="text-[9px] leading-none tracking-[0.2em] opacity-90" aria-hidden="true">★★★</span>
                  <span className={`font-black leading-none drop-shadow-[0_2px_0_rgba(0,0,0,0.08)] ${p.place === 1 ? "text-6xl" : "text-5xl"}`}>{p.place}</span>
                  <Laurel className="-mt-0.5 h-6 w-16 opacity-95" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
