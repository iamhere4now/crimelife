/**
 * Bonus evidence: three extra scraps hidden in every scene, on top of the case's
 * own clues. What they are fits the case: a torn bank-van manifest at a heist,
 * pieces of a SIM wallet at a cyber crime, an owambe invitation at a big-man
 * case, a market ledger page in a market. Each scrap pays a little; the third
 * completes the item and points at a statement worth challenging, like a free
 * tip. Generated from the case itself, so every case has them and none of the
 * case's own clues or story change.
 */

import { kitOf } from "@/three/sceneKits";
import type { CrimeCase, GameState } from "./types";

export const BONUS_REWARD = 5_000;

export interface BonusFind {
  id: string;
  name: string;
  x: number;
  y: number;
  /** What it says when picked up (the last one carries the lead). */
  note: string;
}

interface Theme {
  /** "torn bank-van manifest" */
  item: string;
  /** Short title for the panel: "Torn manifest". */
  title: string;
  /** What the second piece shows. */
  second: string;
  /** What the whole thing proves, before the lead. */
  whole: string;
}

const THEMES: Record<string, Theme[]> = {
  heists: [
    { item: "torn cash-van manifest", title: "Torn manifest", second: "a column of times and bag numbers, one of them crossed out twice", whole: "The manifest is whole: the bag counts were changed after the van left." },
    { item: "ripped vault floor plan", title: "Ripped floor plan", second: "the vault door, with a red arrow drawn to a side corridor", whole: "The plan is whole: someone inside marked the quickest way out." },
  ],
  cyber: [
    { item: "snapped SIM-card wallet", title: "SIM-card wallet", second: "two more SIM slots, the numbers scratched off with a key", whole: "The SIM wallet is whole: the numbers match the ones used in the scam." },
    { item: "torn phone-shop receipt", title: "Phone-shop receipt", second: "a list of burner phones bought for cash the same afternoon", whole: "The receipt is whole: the phones were bought by someone close to this case." },
  ],
  vip: [
    { item: "torn owambe invitation card", title: "Owambe invitation", second: "a VIP table number and half a name in gold letters", whole: "The invitation is whole: the guest list doesn't add up." },
    { item: "ripped aso-ebi receipt", title: "Aso-ebi receipt", second: "a payment of fabric money into a personal account", whole: "The receipt is whole: the money went somewhere it shouldn't." },
  ],
  alley: [
    { item: "torn market ledger page", title: "Market ledger page", second: "a column of daily takings with one day missing", whole: "The ledger page is whole: the missing day is the day of the crime." },
    { item: "ripped danfo ticket stub", title: "Danfo ticket stub", second: "a route and a time printed in faded ink", whole: "The ticket is whole: someone was not where they said they were." },
  ],
  naija: [
    { item: "torn Clockwork Club note", title: "Clockwork note", second: "a sketch of a brass cog and a time: 00:07", whole: "The note is whole: the Club was watching this case too." },
    { item: "ripped newspaper cutting", title: "Newspaper cutting", second: "half a headline about the Millennium Mint", whole: "The cutting is whole: someone here has been following the old robbery." },
  ],
};

/** Floor spots around the scene for scraps when the props are all taken. */
const SPARE_SPOTS: [number, number][] = [
  [16, 90],
  [84, 88],
  [50, 93],
  [30, 76],
  [70, 78],
  [62, 66],
  [38, 66],
];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** What this case's bonus scraps are pieces of. */
export function bonusTheme(c: CrimeCase): Theme {
  const list = THEMES[c.categories[0]] ?? THEMES.alley;
  return list[hash(c.id) % list.length];
}

/** A lie the player hasn't caught yet, to point them at. */
function leadFor(c: CrimeCase, s: GameState | null): string {
  const caught = s?.caught[c.id] ?? [];
  for (const sus of [...c.suspects].sort((a, b) => Number(b.id === c.culpritId) - Number(a.id === c.culpritId))) {
    for (const st of sus.statements) {
      if (!st.lie || caught.includes(st.id)) continue;
      const clue = c.clues.find((k) => k.id === st.lie!.clueId);
      if (!clue) continue;
      return `It doesn't match ${sus.name}'s story that "${st.text}" Challenge that statement with the ${clue.name.toLowerCase()}.`;
    }
  }
  return "Every story has been tested already. Go and make your arrest.";
}

/** The three bonus scraps for a case, placed away from its clues and the detective. */
export function bonusFor(c: CrimeCase, s: GameState | null = null): BonusFind[] {
  const kit = kitOf(c);
  const theme = bonusTheme(c);
  const castSpots: [number, number][] = kit.castSide === "right" ? [[91, 72], [79, 80]] : kit.castSide === "center" ? [[60, 70], [70, 76]] : [[9, 72], [21, 80]];
  const taken = [...c.clues.map((k) => [k.x, k.y] as [number, number]), ...castSpots];
  const free = (x: number, y: number) => taken.every(([tx, ty]) => Math.hypot(tx - x, ty - y) > 9) && y > 45 && y < 95 && x > 6 && x < 94;
  // props first (scraps tucked by things in the scene), then spare floor spots
  const candidates: { at: [number, number]; near: string }[] = [
    ...kit.props.filter((p) => p.y > 45).map((p) => ({ at: [Math.min(92, p.x + 4), Math.min(93, p.y + 6)] as [number, number], near: p.name ?? "" })),
    ...SPARE_SPOTS.map((at) => ({ at, near: "" })),
  ];
  const h = hash(c.id);
  const picked: { at: [number, number]; near: string }[] = [];
  for (let i = 0; i < candidates.length && picked.length < 3; i++) {
    const cand = candidates[(i + h) % candidates.length];
    const [x, y] = cand.at;
    if (!free(x, y)) continue;
    picked.push(cand);
    taken.push([x, y]);
  }
  const where = (near: string) => (near ? `by the ${near.toLowerCase()}` : "on the ground");
  return picked.map(({ at: [x, y], near }, i) => ({
    id: `bonus-${i + 1}`,
    name: `${theme.title} · piece ${i + 1} of 3`,
    x,
    y,
    note:
      i === 0
        ? `A corner of a ${theme.item}, ${where(near)}. Someone dropped it in a hurry. Find the other pieces.`
        : i === 1
          ? `Another piece of the ${theme.item}, ${where(near)}: ${theme.second}.`
          : `${theme.whole} ${leadFor(c, s)}`,
  }));
}

/** Spots for a sponsored hunt's tokens in a case's scene (the case's own clues are hidden there). */
export function huntSpots(c: CrimeCase, n: number, salt: string): { id: string; x: number; y: number }[] {
  const kit = kitOf(c);
  const castSpots: [number, number][] = kit.castSide === "right" ? [[91, 72], [79, 80]] : kit.castSide === "center" ? [[60, 70], [70, 76]] : [[9, 72], [21, 80]];
  const taken: [number, number][] = [...castSpots];
  const free = (x: number, y: number) => taken.every(([tx, ty]) => Math.hypot(tx - x, ty - y) > 10) && y > 30 && y < 94 && x > 6 && x < 94;
  const candidates: [number, number][] = [
    ...kit.props.map((p) => [Math.min(92, Math.max(8, p.x + (p.x > 50 ? -3 : 3))), Math.min(92, p.y + 4)] as [number, number]),
    ...c.clues.map((k) => [k.x, k.y] as [number, number]),
    [16, 90], [84, 88], [50, 93], [30, 76], [70, 78], [62, 66], [38, 66], [50, 50], [24, 58], [76, 58], [40, 84], [60, 84],
  ];
  const h = hash(c.id + salt);
  const out: { id: string; x: number; y: number }[] = [];
  for (let i = 0; i < candidates.length && out.length < n; i++) {
    const [x, y] = candidates[(i * 7 + h) % candidates.length];
    if (!free(x, y)) continue;
    taken.push([x, y]);
    out.push({ id: `token-${out.length + 1}`, x, y });
  }
  return out;
}
