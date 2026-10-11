import type { LucideIcon } from "lucide-react";

export type CaseId =
  | "neon-alley"
  | "penthouse"
  | "bank-vault"
  | "livestream"
  | "gallery"
  | "ransom"
  | "danfo"
  | "market"
  | "owambe"
  | "pos"
  | "park-dues"
  | "agege"
  | "yaba-hostel"
  | "afrobeats"
  | "aso-ebi"
  | "nollywood"
  | "eko-atlantic"
  | "airport"
  | "jankara-gold"
  | "crypto"
  // The Naija Files campaign
  | "lawyer"
  | "kano-market"
  | "link-bridge"
  | "enugu-dinner"
  | "ife-library"
  | "abuja-vault"
  | "plateau-village"
  | "artist-studio"
  | "kaduna-train"
  | "benin-palace"
  | "calabar-beach"
  | "data-center"
  | "abuja-dinner"
  | "greenhouse"
  | "ph-wedding"
  | "yacht"
  | "ibadan-radio"
  | "jos-museum"
  | "abuja-site"
  | "cinema"
  // city cases
  | "aba-ariaria" | "aba-gown" | "aba-ngwa" | "abj-gala" | "abj-jabi" | "abj-wuse" | "abk-adire" | "abk-kuto" | "abk-olumo" | "ben-bdc" | "ben-igun" | "ben-uniben" | "enu-coal" | "enu-milliken" | "enu-ogbete" | "iba-cocoa" | "iba-dugbe" | "iba-mokola" | "ilo-dam" | "ilo-pottery" | "ilo-ram" | "kano-dye" | "kano-kwari" | "kano-makama" | "ph-boatclub" | "ph-mileone" | "ph-tanker"
  // more Lagos
  | "lag-mainland" | "lag-oshodi" | "lag-makoko" | "lag-tollgate"
  // one for every other state
  | "kad-refinery" | "kat-feeding" | "zam-gold" | "keb-rice" | "sok-hajj" | "bau-yankari" | "gom-fertilizer" | "bor-relief" | "yob-grain" | "jig-solar" | "bnu-snake" | "kog-ghost" | "nas-lithium" | "ngr-ponzi" | "pla-potato" | "ada-notes" | "tar-yam" | "ana-drugs" | "imo-mace" | "del-pipeline" | "bay-kpofire" | "akw-pension" | "crs-carnival" | "ebo-rice" | "eki-exam" | "ond-kidnap" | "osu-grove"
  // a second case for the states
  | "kat-phones" | "zam-cards" | "keb-fishing" | "sok-rams" | "bau-tickets" | "gom-borehole" | "bor-notes" | "yob-goats" | "jig-transformer" | "ngr-scholarship" | "ada-papers" | "bnu-scale" | "kog-dredge" | "nas-garri" | "ana-parts" | "imo-wedding" | "del-land" | "bay-skimmer" | "akw-jobs" | "ebo-salt" | "eki-raffle" | "ond-cocoa";

/** Original background loops in each region's style (see lib/music.ts). */
export type MusicStyle = "lagos" | "sahel" | "highlife" | "rivers" | "fuji" | "juju" | "abuja" | "plateau" | "calabar" | "benin";

export interface Region {
  /** e.g. "Kano", "Enugu". */
  state: string;
  /** Neighbourhood or town shown in the header. */
  place: string;
  music: MusicStyle;
}

export type PropKind =
  | "desk" | "door" | "bookshelf" | "cabinet" | "clock" | "cog" | "safe" | "cctv" | "laptop" | "phone" | "paper" | "inhaler"
  | "stall" | "sack" | "pyramid" | "hole" | "suv" | "ladder" | "boat" | "dining" | "chandelier" | "knife" | "books" | "lamp"
  | "cup" | "vault" | "pedestal" | "terracotta" | "panel" | "hut" | "goat" | "stake" | "easel" | "paint" | "carriage"
  | "coupling" | "luggage" | "throne" | "cushion" | "gourd" | "bonfire" | "drum" | "guitar" | "server" | "smashed" | "chair"
  | "spray" | "banquet" | "bowl" | "coatrack" | "plant" | "orchid" | "tank" | "greenhouse" | "arch" | "seats" | "cake"
  | "jewelbox" | "camera" | "yacht" | "chess" | "lifebuoy" | "console" | "mic" | "onair" | "crate" | "crane" | "lunchbox"
  | "hardhat" | "mixer" | "screen" | "popcorn" | "projector" | "wine" | "footprints" | "flyer"
  // used by the 3D versions of the nine original scenes
  | "sign" | "pipe" | "bin" | "puddle" | "chalk" | "scorch" | "chip" | "monitor" | "ringlight" | "router" | "painting"
  | "rope" | "stove" | "fridge" | "counter" | "dogbed" | "bus" | "lamppost" | "umbrella" | "barrow" | "generator"
  | "chicken" | "speaker" | "djbooth" | "notes" | "laser" | "goldbars" | "card" | "playingcard" | "glass" | "rug"
  | "bench" | "spotlight" | "pans" | "chest" | "hawker"
  // city scenes
  | "keke" | "okada" | "adire" | "dyepit" | "furnace" | "bronze" | "shoerack" | "sewing" | "kiosk" | "boulder" | "tanker"
  // roads and the lagoon
  | "cone" | "tape" | "patrol" | "diversion" | "car" | "van" | "canoe" | "tollbooth" | "coil" | "lantern" | "snake" | "tusk";

export interface KitProp {
  kind: PropKind;
  /** Centre, as % of the 360×400 scene. */
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  color?: string;
  /** What the timed sweep calls it. Leave out for scenery that isn't findable. */
  name?: string;
  /** Text for signs, screens and labelled boxes. */
  label?: string;
}

/** Which part of Nigeria a street looks like. */
export type Look = "lagos" | "sahel" | "capital" | "brownroof" | "south";
/** What kind of room an indoor scene is. */
export type Decor = "office" | "luxury" | "studio" | "warehouse" | "hall" | "shop";

export interface KitScene {
  /** Regional architecture for streets; filled in from the case's city. */
  look?: Look;
  /** The case's city, for city-targeted player posters; filled in from the case. */
  city?: string;
  backdrop:
    | { kind: "indoor"; wall: string; floor: string; trim?: string; window?: "none" | "city-night" | "city-day" | "sea" | "hills"; decor?: Decor }
    | {
        kind: "outdoor";
        sky: "day" | "dawn" | "dusk" | "night";
        ground: "dirt" | "sand" | "grass" | "road" | "concrete" | "rails" | "deck";
        horizon?: "none" | "city" | "sea" | "hills" | "rocks" | "savanna" | "bridge" | "mainland";
      }
    /** A night alley: sky above, buildings either side and a wall at the end. */
    | { kind: "alley"; wall: string; ground: "road" | "dirt" };
  props: KitProp[];
  castSide?: "left" | "right" | "center";
  /** Where a forensic tech stands, as % (optional). */
  tech?: [number, number];
}

/** The nine drawn scenes. Later cases reuse one with clues on different objects. */
export type SceneId = "neon-alley" | "penthouse" | "bank-vault" | "livestream" | "gallery" | "ransom" | "danfo" | "market" | "owambe";
export type CategoryId = "heists" | "cyber" | "vip" | "alley" | "naija";

/** Parts for the cartoon portraits drawn by <Avatar />. */
export interface Face {
  skin: string;
  hair: string;
  hairStyle: "short" | "long" | "bun" | "buzz" | "curly" | "bald" | "mohawk" | "slick";
  shirt: string;
  bg: string;
  acc?: "glasses" | "shades" | "visor" | "goggles" | "mask" | "cap" | "fedora" | "beard" | "monocle" | "earring" | "gele" | "fila";
  /** Colour for fabric accessories (gele, fila). */
  accColor?: string;
  mood?: "smile" | "smirk" | "flat" | "worried";
  dog?: boolean;
}

export interface Clue {
  id: string;
  name: string;
  icon: LucideIcon;
  /** Hotspot position as a percentage of the scene's width and height. */
  x: number;
  y: number;
  description: string;
  /** Label on the forensic action button, e.g. "Dust for prints". */
  action: string;
  /** What the lab says once the action finishes. */
  finding: string;
  /** Suspect this clue points at (or clears), for the dossier. */
  suspectId?: string;
  /** A hands-on lab mini-game in place of the plain scan. */
  lab?: LabGame;
}

export type LabGame =
  | { kind: "prints"; shape: "finger" | "boot" }
  | { kind: "torn"; style: "ledger" | "ransom"; title: string; lines: string[] };

/** One line of a suspect's testimony. Lies can be broken with the right analysed clue. */
export interface Statement {
  id: string;
  text: string;
  /** Extra detail when the player presses ("Doubt"). */
  press?: string;
  lie?: { clueId: string; reveal: string };
}

/** Something findable in a scene's timed sweep. Positions are percentages; r is the hit radius in % of width. */
export interface SweepItem {
  id: string;
  name: string;
  x: number;
  y: number;
  r?: number;
}

export interface Suspect {
  id: string;
  name: string;
  role: string;
  face: Face;
  motive: string;
  alibi: string;
  background: string;
  /** Opening line when interrogated. */
  quote: string;
  statements: Statement[];
}

export interface CrimeCase {
  id: CaseId;
  /** Which drawn scene to use; defaults to the case's own id for the original nine. */
  scene?: SceneId;
  /** A kit-built scene (Naija Files); takes priority over `scene`. */
  kit?: KitScene;
  /** Where it happens and which music plays. Defaults to Lagos. */
  region?: Region;
  /** Naija Files cases you must close before this one opens (the finale). */
  gate?: number;
  tier: number;
  title: string;
  hook: string;
  categories: CategoryId[];
  tags: string[];
  bounty: number;
  inspecting: number;
  lead: { name: string; face: Face };
  victim: string;
  briefing: string;
  clues: Clue[];
  requiredClues: number;
  suspects: Suspect[];
  culpritId: string;
  /** Shown on the case-closed screen. */
  solution: string;
  /** For cases based on real kinds of incidents: what inspired it (names and details are invented). */
  inspiredBy?: string;
}

export interface Category {
  id: CategoryId;
  name: string;
  wordmark: string;
  tags: string[];
  watching: number;
  scene: SceneId;
}

export interface Squad {
  id: string;
  name: string;
  face: Face;
  live: boolean;
  tips: Partial<Record<CaseId, string>>;
  /** Said for any case without its own tip. */
  fallback: string;
}

export interface GameState {
  /** 2 = naira amounts. Version 1 saves were in dollars and get scaled on load. */
  version: 2;
  balance: number;
  rating: number;
  solved: CaseId[];
  /** Clue ids bagged per case. */
  found: Partial<Record<CaseId, string[]>>;
  /** Bonus evidence scraps picked up per case (extra finds that pay a little and unlock a lead). */
  bonus: Partial<Record<CaseId, string[]>>;
  /** Clue ids the lab has analysed per case. */
  analyzed: Partial<Record<CaseId, string[]>>;
  /** Suspects already wrongly accused per case (cleared by Internal Affairs). */
  wrong: Partial<Record<CaseId, string[]>>;
  muted: boolean;
  stats: { accusations: number; correct: number; earned: number; fines: number };
  /** Statement ids caught as lies, per case. */
  caught: Partial<Record<CaseId, string[]>>;
  /** Wrong evidence presented, per case and suspect. Three strikes and they lawyer up. */
  strikes: Partial<Record<CaseId, Record<string, number>>>;
  /** Best timed-sweep stars per case (1–3). */
  sweepStars: Partial<Record<CaseId, number>>;
  /** Merit points; the rank is derived from them (see lib/ranks). */
  xp: number;
  /** Losses in a row (wrong arrests, failed sweeps). Five means demotion and a 10% fine. */
  lossStreak: number;
  /** Background music switched off (sound effects follow `muted`). */
  musicOff: boolean;
  /** Cases closed with detectives from other branches on the scene. */
  squads: number;
  /** Daily check-in streak and the daily challenge (dates are local YYYY-MM-DD). */
  daily: DailyState;
  /** Badge ids already earned (see lib/badges). */
  badges: string[];
  /** Cases the player hearted. */
  favorites: CaseId[];
  /** Sponsored hunts: tokens found per hunt id. */
  hunts: Record<string, string[]>;
}

export interface DailyState {
  /** Last day the player opened the game. */
  day: string;
  streak: number;
  best: number;
  /** Day the streak reward was last claimed. */
  claimed: string;
  /** Day the daily challenge was last completed. */
  done: string;
  /** Day of the last Lucky Spin, and how many spins were used that day. */
  spun?: string;
  spins?: number;
}

/** One detective on this account. "Sign up" creates one, "sign in" picks one. */
export interface DetectiveProfile {
  id: string;
  name: string;
  /** Index into PLAYER_LOOKS (the sign-up preset). */
  look: number;
  /** The look the player designed in the editor, as a face code (lib/looks); wins over `look`. */
  face?: string;
  /** Collected at sign-up: kept private (only the player and the game's owner). */
  fullName?: string;
  email?: string;
  createdAt: number;
  state: GameState;
}

export interface SaveStore {
  version: 3;
  activeId: string | null;
  profiles: Record<string, DetectiveProfile>;
}

export type Verdict =
  | { kind: "correct"; caseId: CaseId; suspectId: string; bounty: number; ratingDelta: number; opened: string[] }
  | { kind: "wrong"; caseId: CaseId; suspectId: string; fine: number; ratingDelta: number; closed: string[] };
