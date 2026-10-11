/** The daily Lucky Spin: one spin a day (two from Inspector up). */

export interface Prize {
  label: string;
  emoji: string;
  money: number;
  xp: number;
  /** Relative chance. */
  weight: number;
  color: string;
}

export const PRIZES: Prize[] = [
  { label: "₦5k", emoji: "💵", money: 5_000, xp: 0, weight: 26, color: "#53FC18" },
  { label: "+10 XP", emoji: "⭐", money: 0, xp: 10, weight: 20, color: "#f5c518" },
  { label: "₦10k", emoji: "💰", money: 10_000, xp: 0, weight: 18, color: "#1d6a8a" },
  { label: "+25 XP", emoji: "🌟", money: 0, xp: 25, weight: 10, color: "#e2730a" },
  { label: "₦25k", emoji: "🤑", money: 25_000, xp: 0, weight: 9, color: "#7a1f6a" },
  { label: "Jara!", emoji: "🎁", money: 15_000, xp: 15, weight: 12, color: "#c0182b" },
  { label: "₦100k", emoji: "💎", money: 100_000, xp: 0, weight: 2, color: "#14161b" },
  { label: "₦2k", emoji: "🪙", money: 2_000, xp: 0, weight: 3, color: "#8a8a8a" },
];

/** Pick a prize index by weight. */
export function rollPrize(rand = Math.random()): number {
  const total = PRIZES.reduce((n, x) => n + x.weight, 0);
  let r = rand * total;
  for (let i = 0; i < PRIZES.length; i++) {
    r -= PRIZES[i].weight;
    if (r < 0) return i;
  }
  return 0;
}
