/**
 * What each rank opens up, so climbing the ladder changes how the game plays,
 * not only the badge. Looks (hats, outfits, hair) unlock by rank too: see the
 * `rank` on each part in lib/looks.
 */

import { RANKS, rankIndex } from "./ranks";

export type UnlockId = "night" | "lens" | "spin2" | "lab" | "leader" | "frame" | "streak2" | "army" | "legend";

export interface Unlock {
  id: UnlockId;
  /** Rank index that opens it. */
  rank: number;
  name: string;
  emoji: string;
  what: string;
}

export const UNLOCKS: Unlock[] = [
  { id: "night", rank: 1, name: "Night Shift", emoji: "🌙", what: "Switch any crime scene to night, with street lights and neon." },
  { id: "lens", rank: 2, name: "Eagle Lens", emoji: "🔎", what: "Bonus scraps shine brighter, and the scene tells you how many are left." },
  { id: "spin2", rank: 3, name: "Lucky Hands", emoji: "🎡", what: "The daily Lucky Spin gives a second spin every day." },
  { id: "lab", rank: 4, name: "Lab Express", emoji: "🧪", what: "Lab scans come back instantly, no waiting." },
  { id: "leader", rank: 5, name: "Squad Leader", emoji: "🛡️", what: "Squad bonuses pay 50% more when you close a case with other branches." },
  { id: "frame", rank: 6, name: "Gold Frame", emoji: "🥇", what: "A gold frame around your face on the leaderboard, for everyone to see." },
  { id: "army", rank: 7, name: "Army Kit", emoji: "🎖️", what: "Desert camo and army green outfits for your detective." },
  { id: "streak2", rank: 8, name: "Officer's Mess", emoji: "🍲", what: "Daily streak rewards are doubled." },
  { id: "legend", rank: 11, name: "Living Legend", emoji: "👑", what: "Gold background for your portrait. Everybody go know you." },
];

export function hasUnlock(xp: number, id: UnlockId) {
  const u = UNLOCKS.find((x) => x.id === id);
  return !!u && rankIndex(xp) >= u.rank;
}

/** Unlocks gained between two XP totals (for the promotion screen). */
export function newUnlocks(fromXp: number, toXp: number): Unlock[] {
  const a = rankIndex(fromXp);
  const b = rankIndex(toXp);
  return UNLOCKS.filter((u) => u.rank > a && u.rank <= b);
}

export const rankName = (i: number) => RANKS[Math.max(0, Math.min(RANKS.length - 1, i))].name;
