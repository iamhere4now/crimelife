/**
 * Achievements. Each badge measures progress from the save itself, so old
 * saves earn what they already deserve the first time the game loads.
 */

import { CASE_BY_ID } from "./cases";
import { CITIES, cityOf } from "./cities";
import type { CaseId, GameState } from "./types";

export interface Badge {
  id: string;
  name: string;
  /** How to earn it. */
  how: string;
  emoji: string;
  /** Progress towards it: have / need. */
  progress: (s: GameState) => [number, number];
}

const count = (s: GameState, n: number) => (fn: (s: GameState) => number): [number, number] => [Math.min(n, fn(s)), n];

const citiesClosed = (s: GameState) => new Set(s.solved.map((id) => CASE_BY_ID[id as CaseId]).filter(Boolean).map((c) => cityOf(c))).size;
const photos = (s: GameState) => Object.values(s.bonus ?? {}).filter((ids) => (ids?.length ?? 0) >= 3).length;
const lies = (s: GameState) => Object.values(s.caught).reduce((n, ids) => n + (ids?.length ?? 0), 0);
const threeStars = (s: GameState) => Object.values(s.sweepStars).filter((v) => (v ?? 0) >= 3).length;

export const BADGES: Badge[] = [
  { id: "first-arrest", name: "First Arrest", how: "Close your first case.", emoji: "🚔", progress: (s) => count(s, 1)((x) => x.solved.length) },
  { id: "cracker", name: "Case Cracker", how: "Close 10 cases.", emoji: "🔓", progress: (s) => count(s, 10)((x) => x.solved.length) },
  { id: "veteran", name: "Panti Veteran", how: "Close 40 cases.", emoji: "🎖️", progress: (s) => count(s, 40)((x) => x.solved.length) },
  { id: "tour", name: "Naija Tour", how: "Close a case in 10 different cities.", emoji: "🗺️", progress: (s) => count(s, 10)(citiesClosed) },
  { id: "all-states", name: "One Nigeria", how: `Close a case in all ${CITIES.length} cities.`, emoji: "🏆", progress: (s) => count(s, CITIES.length)(citiesClosed) },
  { id: "lie-breaker", name: "Lie Breaker", how: "Catch 20 lies in interrogation.", emoji: "🤥", progress: (s) => count(s, 20)(lies) },
  { id: "photo", name: "Scrap Hunter", how: "Find all 3 bonus scraps in 5 cases.", emoji: "🧩", progress: (s) => count(s, 5)(photos) },
  { id: "photo-master", name: "Eagle Eye", how: "Find all 3 bonus scraps in 25 cases.", emoji: "🦅", progress: (s) => count(s, 25)(photos) },
  { id: "squad", name: "Squad Goals", how: "Close a case with a detective from another branch on the scene.", emoji: "🤝", progress: (s) => count(s, 1)((x) => x.squads ?? 0) },
  { id: "task-force", name: "Task Force", how: "Close 5 cases with other branches.", emoji: "🛡️", progress: (s) => count(s, 5)((x) => x.squads ?? 0) },
  { id: "sweeper", name: "Clean Sweep", how: "Get 3 stars on 5 timed sweeps.", emoji: "⏱️", progress: (s) => count(s, 5)(threeStars) },
  { id: "streak", name: "No Dey Dull", how: "Play 7 days in a row.", emoji: "🔥", progress: (s) => count(s, 7)((x) => x.daily?.best ?? 0) },
  { id: "odogwu", name: "Odogwu", how: "Hold ₦10M in your wallet.", emoji: "💰", progress: (s) => count(s, 10_000_000)((x) => Math.max(0, x.balance)) },
  { id: "clean", name: "Clean Hands", how: "Make 10 arrests without a single fine.", emoji: "🧼", progress: (s) => (s.stats.fines > 0 ? [0, 10] : count(s, 10)((x) => x.stats.correct)) },
];

export const BADGE_BY_ID = Object.fromEntries(BADGES.map((b) => [b.id, b])) as Record<string, Badge>;

/** Badges the save qualifies for. */
export function earnedBadges(s: GameState): string[] {
  return BADGES.filter((b) => {
    const [have, need] = b.progress(s);
    return have >= need;
  }).map((b) => b.id);
}
