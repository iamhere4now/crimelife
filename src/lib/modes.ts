import { CASE_BY_ID, GENERATED } from "./cases";
import { NAIJA_FILES } from "./content/naijaFiles";
import type { CaseId, GameState } from "./types";

export type ModeId = "street" | "vip" | "heist" | "naija";

export interface Mode {
  id: ModeId;
  name: string;
  tagline: string;
  /** Money you must have right now to enter. Drop below it and the mode locks again. */
  cost: number;
  caseIds: CaseId[];
}

/** Cases are free-roam inside a mode: play them in any order. */
export const MODES: Mode[] = [
  {
    id: "street",
    name: "Street Mode",
    tagline: "Street hustle in every city. Free entry.",
    cost: 0,
    caseIds: ["neon-alley", "livestream", "market", "pos", "park-dues", "agege", "yaba-hostel", "lag-mainland", "lag-oshodi", "lag-makoko", "lag-tollgate", "kad-refinery", "kat-feeding", "zam-gold", "keb-rice", "sok-hajj", "bau-yankari", "gom-fertilizer", "bor-relief", "yob-grain", "jig-solar", "bnu-snake", "kog-ghost", "nas-lithium", "ngr-ponzi", "pla-potato", "ada-notes", "tar-yam", "ana-drugs", "imo-mace", "del-pipeline", "bay-kpofire", "akw-pension", "crs-carnival", "ebo-rice", "eki-exam", "ond-kidnap", "osu-grove", "kat-phones", "zam-cards", "keb-fishing", "sok-rams", "bau-tickets", "gom-borehole", "bor-notes", "yob-goats", "jig-transformer", "ngr-scholarship", "ada-papers", "bnu-scale", "kog-dredge", "nas-garri", "ana-parts", "imo-wedding", "del-land", "bay-skimmer", "akw-jobs", "ebo-salt", "eki-raffle", "ond-cocoa", "abj-wuse", "abj-jabi", "kano-dye", "kano-kwari", "ilo-ram", "ilo-pottery", "iba-mokola", "iba-dugbe", "abk-adire", "abk-olumo", "ben-igun", "ben-bdc", "ph-mileone", "ph-tanker", "aba-ariaria", "aba-ngwa", "enu-coal", "enu-ogbete", ...GENERATED.map((c) => c.id)],
  },
  {
    id: "vip",
    name: "VIP Mode",
    tagline: "Big man wahala, from Ikoyi to Maitama.",
    cost: 1_000_000,
    caseIds: ["penthouse", "ransom", "owambe", "aso-ebi", "nollywood", "afrobeats", "abj-gala", "kano-makama", "ilo-dam", "iba-cocoa", "abk-kuto", "ben-uniben", "ph-boatclub", "aba-gown", "enu-milliken"],
  },
  {
    id: "heist",
    name: "Heist Mode",
    tagline: "Big money jobs. Na only real ogas fit enter.",
    cost: 5_000_000,
    caseIds: ["bank-vault", "gallery", "danfo", "eko-atlantic", "airport", "jankara-gold", "crypto"],
  },
  {
    id: "naija",
    name: "Naija Files",
    tagline: "Follow the brass cogs across Nigeria.",
    cost: 500_000,
    caseIds: NAIJA_FILES.map((c) => c.id),
  },
];

export const MODE_BY_ID = Object.fromEntries(MODES.map((m) => [m.id, m])) as Record<ModeId, Mode>;

export function modeOf(caseId: CaseId): Mode {
  return MODES.find((m) => m.caseIds.includes(caseId)) ?? MODES[0];
}

export function isModeOpen(mode: Mode, s: Pick<GameState, "balance">): boolean {
  return mode.cost === 0 || s.balance >= mode.cost;
}

/** Naija Files cases still to close before a gated case (the finale) opens. 0 when open. */
export function gateRemaining(caseId: CaseId, s: Pick<GameState, "solved">): number {
  const gate = CASE_BY_ID[caseId]?.gate;
  if (!gate) return 0;
  const closed = MODE_BY_ID.naija.caseIds.filter((id) => id !== caseId && s.solved.includes(id)).length;
  return Math.max(0, gate - closed);
}

export function isCaseOpen(caseId: CaseId, s: Pick<GameState, "balance" | "solved">): boolean {
  return isModeOpen(modeOf(caseId), s) && gateRemaining(caseId, s) === 0;
}

/** Names of modes a balance change from `before` to `after` opens. */
export function modesOpened(before: number, after: number): string[] {
  return MODES.filter((m) => m.cost > 0 && before < m.cost && after >= m.cost).map((m) => m.name);
}

/** Names of modes a balance change from `before` to `after` locks again. */
export function modesClosed(before: number, after: number): string[] {
  return MODES.filter((m) => m.cost > 0 && before >= m.cost && after < m.cost).map((m) => m.name);
}
