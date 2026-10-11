/**
 * Career ladder: up through the Nigeria Police, then across into the Army.
 * Merit (XP) comes from arrests, broken lies and sweep stars. Five losses in a
 * row (wrong arrests or failed sweeps) knock you down one rank.
 */

export interface Rank {
  name: string;
  short: string;
  branch: "Police" | "Army";
  xp: number;
}

export const RANKS: Rank[] = [
  { name: "Constable", short: "PC", branch: "Police", xp: 0 },
  { name: "Corporal", short: "CPL", branch: "Police", xp: 100 },
  { name: "Sergeant", short: "SGT", branch: "Police", xp: 200 },
  { name: "Inspector", short: "INSP", branch: "Police", xp: 320 },
  { name: "Assistant Superintendent", short: "ASP", branch: "Police", xp: 450 },
  { name: "Deputy Superintendent", short: "DSP", branch: "Police", xp: 600 },
  { name: "Commissioner", short: "CP", branch: "Police", xp: 750 },
  { name: "Lieutenant", short: "LT", branch: "Army", xp: 900 },
  { name: "Captain", short: "CAPT", branch: "Army", xp: 1050 },
  { name: "Major", short: "MAJ", branch: "Army", xp: 1200 },
  { name: "Colonel", short: "COL", branch: "Army", xp: 1350 },
  { name: "General", short: "GEN", branch: "Army", xp: 1500 },
];

export const XP_ARREST = 120;
export const XP_LIE = 20;
export const XP_STAR = 10;
export const LOSS_LIMIT = 5;
/** A demotion also takes this share of the wallet, even at Constable. */
export const DEMOTION_FINE_RATE = 0.1;

export function rankIndex(xp: number): number {
  let i = 0;
  while (i + 1 < RANKS.length && xp >= RANKS[i + 1].xp) i++;
  return i;
}

export function rankFor(xp: number): Rank {
  return RANKS[rankIndex(xp)];
}

/** Progress (0–1) from the current rank to the next; 1 at General. */
export function rankProgress(xp: number): number {
  const i = rankIndex(xp);
  if (i === RANKS.length - 1) return 1;
  return (xp - RANKS[i].xp) / (RANKS[i + 1].xp - RANKS[i].xp);
}

export interface RankEvent {
  id: number;
  kind: "promoted" | "demoted";
  from: Rank;
  /** Same as `from` when a Constable is demoted: no lower rank, but the fine still lands. */
  to: Rank;
  /** Naira taken by a demotion (0 for a promotion). */
  fine: number;
  /** Modes that locked again because the fine dropped the wallet below their price. */
  closed: string[];
}
