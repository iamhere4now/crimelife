import { CASES_1_TO_3 } from "./content/cases1to3";
import { CASES_4_TO_6 } from "./content/cases4to6";
import { CASES_7_TO_9 } from "./content/cases7to9";
import { CASES_10_TO_20 } from "./content/cases10to20";
import { CITY_CASES_NORTH } from "./content/citiesNorth";
import { CITY_CASES_SOUTH } from "./content/citiesSouth";
import { CITY_CASES_WEST } from "./content/citiesWest";
import { LAGOS_MORE } from "./content/lagosMore";
import { STATE_CASES_MIDDLE } from "./content/statesMiddle";
import { STATE_CASES_NORTH } from "./content/statesNorth";
import { STATE_CASES_SOUTH } from "./content/statesSouth";
import { STATE_CASES_MORE_NORTH } from "./content/statesMoreNorth";
import { STATE_CASES_MORE_SOUTH } from "./content/statesMoreSouth";
import { NAIJA_FILES } from "./content/naijaFiles";
import { generateStateCases } from "./content/stateGames";
import type { CaseId, Category, CrimeCase, Region, SceneId, Squad } from "./types";

const WRITTEN: CrimeCase[] = [...CASES_1_TO_3, ...CASES_4_TO_6, ...CASES_7_TO_9, ...CASES_10_TO_20, ...LAGOS_MORE, ...NAIJA_FILES, ...CITY_CASES_NORTH, ...CITY_CASES_WEST, ...CITY_CASES_SOUTH, ...STATE_CASES_NORTH, ...STATE_CASES_MIDDLE, ...STATE_CASES_SOUTH, ...STATE_CASES_MORE_NORTH, ...STATE_CASES_MORE_SOUTH];

/** About 20 cases for every state outside Lagos, generated from storylines and each state's real places. */
export const GENERATED: CrimeCase[] = generateStateCases(WRITTEN);

export const CASES: CrimeCase[] = [...WRITTEN, ...GENERATED];

/** The drawn scene a case uses. */
export function sceneOf(c: CrimeCase): SceneId {
  return c.scene ?? (c.id as SceneId);
}

const LAGOS: Region = { state: "Lagos", place: "Lagos", music: "lagos" };

/** Where a case happens, and its music. The original cases are all in Lagos. */
export function regionOf(c: CrimeCase): Region {
  return c.region ?? LAGOS;
}

export const CASE_BY_ID = Object.fromEntries(CASES.map((c) => [c.id, c])) as Record<CaseId, CrimeCase>;

export const CATEGORIES: Category[] = [
  { id: "heists", name: "Island Heists", wordmark: "HEISTS", tags: ["Broad Street", "Third Mainland"], watching: 21700, scene: "danfo" },
  { id: "cyber", name: "Yaba Cyber Crimes", wordmark: "CYBER", tags: ["Ikeja", "Lekki"], watching: 15200, scene: "neon-alley" },
  { id: "vip", name: "Big Man VIP", wordmark: "VIP", tags: ["Banana Island", "Owambe"], watching: 9800, scene: "owambe" },
  { id: "alley", name: "Market Wahala", wordmark: "MARKET", tags: ["Balogun", "Computer Village"], watching: 7400, scene: "market" },
  { id: "naija", name: "The Naija Files", wordmark: "NAIJA", tags: ["Kano", "Calabar", "Abuja"], watching: 38600, scene: "bank-vault" },
];

export const SQUADS: Squad[] = [
  {
    id: "forensics",
    name: "Forensics",
    live: true,
    face: { skin: "#8D5524", hair: "#5a3a1a", hairStyle: "bun", shirt: "#e8e8e8", bg: "#1a2a22", acc: "goggles", mood: "smile" },
    fallback: "Dust everything wey get handle. Prints no dey lie.",
    tips: {
      "neon-alley": "Rain washes away prints but not tread. Cast that boot print before the gutter drains.",
      penthouse: "Lipstick tells you who drank from the glass, not who poisoned it. Check the timeline.",
      "bank-vault": "Every badge printer leaves a serial in its holograms. Fakes made in-house can be traced back.",
      livestream: "Light switches and power buttons hold thumbprints beautifully. Dust the router.",
      gallery: "Fresh varnish stays tacky for days in Lagos humidity. Whoever forged this painted it recently.",
      ransom: "Flour holds a footprint better than mud. Cast it before the cleaners arrive!",
      danfo: "Vinyl danfo seats hold prints for hours. Check who touched the seat behind him.",
      market: "Look at the key barrel, not the smashed body. A lock that was opened first tells a story.",
      owambe: "Fresh tape over an old seal? Lift it. Prints love the sticky side.",
    },
  },
  {
    id: "k9",
    name: "K9 Unit",
    live: true,
    face: { skin: "#b07a45", hair: "#5a3a1a", hairStyle: "short", shirt: "#1d2f5a", bg: "#2a221a", dog: true, mood: "smile" },
    fallback: "Woof! Rex says: follow the smell of fresh money.",
    tips: {
      "neon-alley": "Woof! Rex smelled suya and corporate perfume by the LAWMA bin.",
      penthouse: "Rex keeps sniffing at the balcony door. Somebody wasn't out there as long as they claim.",
      "bank-vault": "Rex found no trace of an outsider at the loading bay. Whoever did this came in through the staff entrance.",
      livestream: "Rex smells grape energy drink by the router. Somebody waited there a while.",
      gallery: "Rex followed a turpentine trail from the painting to the staff corridor.",
      ransom: "Rex is VERY interested in this case. He smells poodle and fried plantain at the loading dock.",
      danfo: "Rex sniffed every seat. The one behind the courier smells of expensive perfume, not sweat.",
      market: "Rex found a trail from the stall to the back gate, the one only staff use.",
      owambe: "Rex smelled money and jollof in the service corridor. Suspicious combination.",
    },
  },
  {
    id: "cyber",
    name: "Cyber Desk",
    live: true,
    face: { skin: "#A0703C", hair: "#53FC18", hairStyle: "mohawk", shirt: "#1a1a1a", bg: "#1a1f2a", acc: "visor", mood: "smirk" },
    fallback: "Check the logs. Phones, routers, cameras: everything dey talk.",
    tips: {
      "neon-alley": "Badge chips keep their last door log even when cracked. Decrypt it.",
      penthouse: "The safe keypad keeps a log. A real break-in doesn't start by typing the correct code.",
      "bank-vault": "Maintenance mode needs an admin code. Find out whose.",
      livestream: "A ban log that never stops looks busy. Check whether a human or a bot did the banning.",
      gallery: "The courier booking came from inside the gallery's own accounts.",
      ransom: "GPS collars ping every few minutes. The last ping tells you where she left from.",
      danfo: "Someone on that bus was filming for their WhatsApp status. Find that video.",
      market: "The ajo moved to a spreadsheet last year. Who keeps the books, keeps the secrets.",
      owambe: "DJs log every track. If the music never stopped, neither did the DJ.",
    },
  },
  {
    id: "coroner",
    name: "Coroner",
    live: false,
    face: { skin: "#5C3A1E", hair: "#9a9a9a", hairStyle: "bald", shirt: "#3a3a3a", bg: "#22222a", acc: "glasses", mood: "flat" },
    fallback: "Timelines win cases. Who was where, and when?",
    tips: {
      "neon-alley": "The victim's burns are from a stun weapon at close range. Whoever did it got right up close.",
      penthouse: "Oleander takes about ten minutes to act. Count backwards from 21:15.",
      "bank-vault": "No victims tonight. Just a very embarrassed bank manager.",
      livestream: "Pixie's fine, just furious. Whoever locked the closet knew which door sticks.",
      gallery: "The painting's fine, wherever it is. The insurance company is not.",
      ransom: "Puff-Puff is almost certainly being spoiled rotten. People who want a recipe don't hurt dogs.",
      danfo: "Nobody hurt, only pride. Mr. Obi swears he only closed his eyes for a second.",
      market: "No bodies, but two hundred angry traders. That's worse, honestly.",
      owambe: "The only casualty is the groom's uncle, who danced too hard. Focus on the money.",
    },
  },
  {
    id: "ballistics",
    name: "Ballistics",
    live: true,
    face: { skin: "#4a2c17", hair: "#111111", hairStyle: "buzz", shirt: "#4a3a1a", bg: "#2a2a1a", acc: "cap", mood: "smile" },
    fallback: "Tools leave signatures. Match the tool to the hand.",
    tips: {
      "neon-alley": "No shots fired. Check which weapons put out enough voltage to leave that scorch.",
      penthouse: "No weapon, but pry marks are a tool signature too. Which came first, the code or the crowbar?",
      "bank-vault": "Not a single round fired. This was a keyboard job, not a gun job.",
      livestream: "No weapons, just a flipped switch and a stuck closet door. An inside job, for sure.",
      gallery: "Brushstrokes are as personal as rifling on a bullet. Check which hand painted them.",
      ransom: "Scissor cuts on the note are clean and practised. Someone used to precise knife work.",
      danfo: "That cut isn't from a knife. Curved, shallow, precise: a tailor's tool.",
      market: "The padlock was hit after it was already open. The dents are on the wrong side.",
      owambe: "No weapons at an owambe, just very sharp elbows on the dance floor.",
    },
  },
  {
    id: "undercover",
    name: "Undercover",
    live: true,
    face: { skin: "#6b4226", hair: "#2b1b10", hairStyle: "long", shirt: "#2a1a3a", bg: "#2a1a2a", acc: "shades", mood: "smirk" },
    fallback: "Follow the debt. Somebody always owes somebody.",
    tips: {
      "neon-alley": "Word in Computer Village: Zenix security has been asking about Glitch all week.",
      penthouse: "The CFO has been booking one-way flights to London. Interesting, for someone so loyal.",
      "bank-vault": "Loan apps have been calling the bank switchboard for someone in engineering.",
      livestream: "Word is the head mod found out about the AI bot replacing her. She did not take it well.",
      gallery: "The restorer has been seen at the airport cargo office twice this month.",
      ransom: "The sous-chef was overheard saying “that jollof should be half mine.”",
      danfo: "A celebrity wedding gown is due Saturday, and its designer is broke. Just saying.",
      market: "KK has been seen at a car dealership in Ikeja. On a bookkeeper's pay?",
      owambe: "The hall owners have been chasing the planner for weeks. Loudly.",
    },
  },
];

