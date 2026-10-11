import {
  Anchor,
  Archive,
  Armchair,
  Banknote,
  BookOpen,
  Brush,
  Building2,
  Cake,
  Camera,
  Castle,
  Cctv,
  ClipboardList,
  Clock,
  CreditCard,
  CupSoda,
  DoorClosed,
  DoorOpen,
  Droplets,
  Drum,
  Flag,
  Flower,
  Footprints,
  Gem,
  Hammer,
  HardHat,
  Lamp,
  Link,
  LockOpen,
  Luggage,
  Mail,
  Mic,
  Palette,
  PawPrint,
  Pill,
  Popcorn,
  Projector,
  Radio,
  Sailboat,
  ScanEye,
  ScrollText,
  Shirt,
  Shovel,
  Smartphone,
  Soup,
  SprayCan,
  Thermometer,
  Ticket,
  Timer,
  Truck,
  Utensils,
  Wine,
  Crown,
} from "lucide-react";
import type { CrimeCase, Face, Suspect } from "../types";

/**
 * THE NAIJA FILES
 *
 * On New Year's Eve 1999 the Millennium Mint in Abuja was robbed at exactly
 * 00:07. Pa Tunji Aremu, the Lagos Island watchmaker who serviced its
 * time-lock, took the blame and served 20 years. Now he's out, known as
 * Baba Aago ("Mr. Clock"), and his Clockwork Club is pulling off clever,
 * harmless jobs across Nigeria to gather proof of who really did it, leaving a
 * brass cog stamped 00:07 each time. Copycats drop cogs at their own crimes to
 * blame the Club. One name keeps turning up: Chief Ayo Bankole.
 */
export const NAIJA_FILES_INTRO = {
  title: "The Naija Files",
  summary:
    "1999. The Millennium Mint in Abuja is robbed at 00:07, and a Lagos watchmaker, Pa Tunji Aremu, takes the blame. Twenty years later “Baba Aago” is out, and his Clockwork Club is leaving brass cogs at mysteries across Nigeria. Some cases are the Club hunting for the truth; others are copycats hiding behind a cog. Close the files, follow the cogs and unmask the real 1999 thief.",
  finaleGate: 12,
};

const BISI: Face = { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "short", shirt: "#53FC18", bg: "#1f2a1a", acc: "fedora", mood: "smirk" };
const CHIDI: Face = { skin: "#5C3A1E", hair: "#2b1b10", hairStyle: "curly", shirt: "#53FC18", bg: "#1f2a1a", acc: "monocle", mood: "smile" };
const OKAFOR: Face = { skin: "#5C3A1E", hair: "#111111", hairStyle: "buzz", shirt: "#53FC18", bg: "#1f2a1a", acc: "cap", mood: "smile" };
const TOLU: Face = { skin: "#8D5524", hair: "#ff7af5", hairStyle: "bun", shirt: "#53FC18", bg: "#1f2a1a", acc: "visor", mood: "smile" };
const LEAD = {
  bisi: { name: "Insp. Bisi Adewale", face: BISI },
  chidi: { name: "Insp. Chidi Okonkwo", face: CHIDI },
  okafor: { name: "Sgt. Okafor", face: OKAFOR },
  tolu: { name: "Det. Tolu “Byte” Bakare", face: TOLU },
};

/** The recurring face of the Naija Files. */
const BANKOLE_FACE: Face = { skin: "#4a2c17", hair: "#cfcfcf", hairStyle: "short", shirt: "#5a1a3a", bg: "#2a1a2a", acc: "fila", accColor: "#c0182b", mood: "smirk" };
function bankole(role: string, motive: string, alibi: string, statements: Suspect["statements"]): Suspect {
  return {
    id: "bankole",
    name: "Chief Ayo Bankole",
    role,
    face: BANKOLE_FACE,
    motive,
    alibi,
    background: "Respected investor and philanthropist, owner of AB Holdings. Nobody remembers where his first money came from.",
    quote: "I am a respected man. I give to charity. Every year!",
    statements,
  };
}

export const NAIJA_FILES: CrimeCase[] = [
  /* 1 ------------------------------------------------------------------ Lagos */
  {
    id: "lawyer",
    tier: 21,
    title: "The Locked Chambers",
    hook: "A top Lagos lawyer found dead in his Ikoyi chambers. The door was locked from the inside.",
    region: { state: "Lagos", place: "Ikoyi", music: "lagos" },
    categories: ["naija"],
    tags: ["Lagos", "Locked Room", "Copycat Cog"],
    bounty: 600_000,
    inspecting: 64100,
    lead: LEAD.bisi,
    victim: "Barrister Ebun Adeola, SAN, 61",
    briefing:
      "At 07:30 the cleaners found Barrister Adeola slumped at his desk in his 12th-floor chambers. The smart lock showed the door locked from inside, the windows don't open, and there's no mark on him. On his desk: a brass cog stamped 00:07. In 2000, he defended Chief Ayo Bankole at the Millennium Mint inquiry.",
    kit: {
      backdrop: { kind: "indoor", wall: "#2a2f3a", floor: "#3a2a22", window: "city-night" },
      props: [
        { kind: "cctv", x: 12, y: 9, name: "Corridor camera" },
        { kind: "cabinet", x: 15, y: 58, name: "Filing cabinet" },
        { kind: "desk", x: 48, y: 72, name: "Desk" },
        { kind: "inhaler", x: 40, y: 66, s: 1.1, name: "Inhaler" },
        { kind: "cog", x: 56, y: 67, s: 0.7, name: "Brass cog" },
        { kind: "door", x: 86, y: 52, color: "#5a3a1a", name: "Smart-lock door" },
      ],
    },
    clues: [
      { id: "lock", name: "Smart lock", icon: LockOpen, x: 86, y: 50, description: "The door's smart lock. Its little light still blinks green.", action: "Pull the lock's app log", finding: "The door wasn't locked from inside at all. At 23:58 it was re-locked remotely through the lock's app, from a phone registered to Dapo Ilori.", suspectId: "dapo" },
      { id: "inhaler", name: "Asthma inhaler", icon: Pill, x: 40, y: 66, description: "The barrister's inhaler, still in his hand when he was found.", action: "Analyze the inhaler", finding: "The inhaler was refilled with a heart drug that leaves no mark. The pharmacy refill slip is initialled “D. I.”", suspectId: "dapo" },
      { id: "camera", name: "Corridor camera", icon: Cctv, x: 12, y: 9, description: "The camera covering the corridor outside the chambers.", action: "Enhance the footage", finding: "Mrs. Ani left at 20:40, upset, and never came back. At 20:52 Dapo Ilori walked in with a pharmacy bag and out again two minutes later.", suspectId: "grace" },
      { id: "deed", name: "Partnership deed", icon: ScrollText, x: 15, y: 58, description: "A deed torn up and stuffed at the back of the filing cabinet.", action: "Reassemble the deed", lab: { kind: "torn", style: "ledger", title: "PARTNERSHIP DEED", lines: ["Adeola & Co.", "Senior: E. Adeola", "On death of the", "senior partner,", "ALL shares pass", "to: D. Ilori", "(cancel Monday?)"] }, finding: "If the senior partner died, every share in the firm went to Dapo Ilori. A note in Adeola's hand says he planned to cancel the deal on Monday.", suspectId: "dapo" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "dapo", name: "Barr. Dapo Ilori", role: "Junior partner", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "slick", shirt: "#1a1a1a", bg: "#1a1f2a", acc: "glasses", mood: "smirk" }, motive: "Inherits the whole firm if the senior partner dies, and the deal was about to be cancelled.", alibi: "Says he left at 18:00 for dinner in Victoria Island.", background: "Brilliant, ambitious and tired of being “the junior”.", quote: "Oga Adeola was like a father to me. Who would do this?", statements: [
        { id: "dapo-1", text: "I left at six and never came back.", lie: { clueId: "camera", reveal: "I dropped off his inhaler refill. He asked me to! I was in and out in two minutes." } },
        { id: "dapo-2", text: "I've never touched the door app.", lie: { clueId: "lock", reveal: "I have admin access, yes. Everyone in IT… okay, only me." } },
        { id: "dapo-3", text: "Look at the cog! The Clockwork gang did this.", lie: { clueId: "deed", reveal: "Fine, the deed favours me. And I bought the cog from a souvenir seller. That doesn't make me a killer!" } },
      ] },
      { id: "grace", name: "Mrs. Grace Ani", role: "Secretary", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#5a1a3a", bg: "#3a1d2a", acc: "gele", accColor: "#5a1a3a", mood: "worried" }, motive: "He shouted at her in front of clients that evening.", alibi: "Went home to Surulere at 20:40.", background: "Twenty years as his secretary. Knows every file in the building.", quote: "He shouted at me, yes. But I would never…", statements: [
        { id: "grace-1", text: "I left at twenty to nine and went home.", press: "I cried all the way home in the danfo. Ask anybody on the Surulere route." },
        { id: "grace-2", text: "The barrister was afraid of somebody.", press: "He said, “The clock is ticking for some people.” I thought he meant Chief Bankole's old case." },
      ] },
      { id: "funmi", name: "Barr. Funmi Agu", role: "Rival lawyer", face: { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "long", shirt: "#0f4a3a", bg: "#1d3a2a", acc: "earring", mood: "smirk" }, motive: "Lost a huge case to him last week.", alibi: "At a book launch in Ikoyi until midnight.", background: "His fiercest rival in court, and his former student.", quote: "I beat people in court, not in their offices.", statements: [
        { id: "funmi-1", text: "I was at a book launch until midnight.", press: "Photos everywhere. I was the loudest person there." },
        { id: "funmi-2", text: "I didn't know he had a heart problem.", press: "Nobody knew. He hid everything. Even his inhaler." },
      ] },
    ],
    culpritId: "dapo",
    solution:
      "Dapo Ilori swapped the barrister's inhaler for one laced with a heart drug at 20:52, then re-locked the door from his phone at 23:58 to make it look impossible. He dropped a souvenir cog on the desk to blame the Clockwork Club. The Club had nothing to do with it, but Adeola's link to Bankole's old case is now in the file.",
  },

  /* 2 ------------------------------------------------------------------ Kano */
  {
    id: "kano-market",
    tier: 22,
    title: "The Empty Kurmi Market",
    hook: "Kano's busiest market, empty at dawn. Every stall full of goods. Not one trader in sight.",
    region: { state: "Kano", place: "Kurmi Market", music: "sahel" },
    categories: ["naija", "alley"],
    tags: ["Kano", "Market", "Clockwork Club"],
    bounty: 700_000,
    inspecting: 58200,
    lead: LEAD.okafor,
    victim: "The traders of Kurmi Market, Kano (no goods missing)",
    briefing:
      "At dawn, Kurmi Market should be roaring. Today it's silent: stalls full of cloth, spices and groundnuts, padlocks untouched, nobody there. The traders turn up at noon, confused, from the stadium across town. Under the cloth stall: a hole, and a brass cog stamped 00:07.",
    kit: {
      backdrop: { kind: "outdoor", sky: "dawn", ground: "dirt", horizon: "city" },
      castSide: "right",
      props: [
        { kind: "stall", x: 18, y: 55, color: "#c0182b", name: "Spice stall" },
        { kind: "pyramid", x: 50, y: 60, s: 0.9, name: "Groundnut pyramid" },
        { kind: "stall", x: 82, y: 50, color: "#1d6a8a", name: "Cloth stall" },
        { kind: "phone", x: 10, y: 84, name: "Dropped phone" },
        { kind: "flyer", x: 30, y: 88, color: "#f5c518", name: "Flyer" },
        { kind: "hole", x: 56, y: 84, name: "Hole in the ground" },
        { kind: "sack", x: 40, y: 74, name: "Grain sack" },
      ],
    },
    clues: [
      { id: "voicenote", name: "Voice note", icon: Smartphone, x: 10, y: 84, description: "A trader's phone, dropped in the rush. A voice note is still on screen.", action: "Play the voice note", finding: "Sent to every trader at 04:00: “Free fertilizer and rice at the stadium, first come first served!” Behind the voice a generator hums: the same rare model that powers Zara Danladi's workshop.", suspectId: "zara" },
      { id: "flyer", name: "Free rice flyer", icon: ScrollText, x: 30, y: 88, description: "A torn flyer stuck to the ground.", action: "Reassemble the flyer", lab: { kind: "torn", style: "ledger", title: "FREE RICE TODAY!", lines: ["FREE FERTILIZER", "& RICE FOR ALL", "Kano Stadium", "05:00 SHARP", "First come,", "first served", "— Market Assoc."] }, finding: "It claims to be from the market association, but Secretary Sani Bawa always signs with his full title, and the paper came from an engineering print shop.", suspectId: "sani" },
      { id: "hole", name: "Hole under the stall", icon: Shovel, x: 56, y: 84, description: "A neat shaft beside the cloth stall, freshly dug.", action: "Climb down and look", finding: "It leads into an old colonial strongroom under the market. An empty shelf shows the dust outline of a ledger, and there are size-38 boot prints. Zara wears size 38.", suspectId: "zara" },
      { id: "padlock", name: "Spice stall padlock", icon: LockOpen, x: 18, y: 55, description: "Every stall's padlock is still locked.", action: "Dust for prints", lab: { kind: "prints", shape: "finger" }, finding: "Only the owners' prints on every padlock. Alhaji Dahiru's are on his own stall, as expected. Nothing was stolen from the traders.", suspectId: "dahiru" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "zara", name: "Zara “Sparks” Danladi", role: "Engineer, Clockwork Club", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#f5c518", bg: "#2a2a1a", acc: "goggles", mood: "smirk" }, motive: "Needed the market empty for an hour to reach the old strongroom underneath.", alibi: "Says she was asleep in her workshop.", background: "Builds generators, drones and anything else that hums. A member of the Clockwork Club.", quote: "Nobody was hurt. Nobody lost one naira. Check am!", statements: [
        { id: "zara-1", text: "I've never been under Kurmi Market.", lie: { clueId: "hole", reveal: "Okay, I went down. A ledger from 1999 was hidden there. It belongs to the truth, not to a hole." } },
        { id: "zara-2", text: "I didn't send any voice note.", lie: { clueId: "voicenote", reveal: "A small trick! And everybody got real free rice. I paid for it myself." } },
        { id: "zara-3", text: "Baba Aago is innocent. You'll see.", press: "Twenty years for a crime he didn't commit. The clock is still ticking." },
      ] },
      { id: "sani", name: "Mallam Sani Bawa", role: "Market association secretary", face: { skin: "#5C3A1E", hair: "#e6e6e6", hairStyle: "short", shirt: "#e8e0d0", bg: "#2a2a1a", acc: "fila", accColor: "#e8e0d0", mood: "worried" }, motive: "His association's name was on the flyer.", alibi: "At dawn prayers, then at home.", background: "Has kept the market's records for thirty years.", quote: "That flyer is not mine! I sign with my full title!", statements: [
        { id: "sani-1", text: "I never wrote that flyer.", press: "Look at the signature. I always write “Secretary, Kurmi Traders”." },
        { id: "sani-2", text: "There's an old strongroom under the market.", press: "From colonial days. Bricked up since before I was born." },
      ] },
      { id: "dahiru", name: "Alhaji Dahiru", role: "Spice trader", face: { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#1d6a3a", bg: "#1d2a1a", acc: "fila", accColor: "#1d6a3a", mood: "smirk" }, motive: "Was the last trader to leave last night.", alibi: "Closed his stall at 21:00, then went home.", background: "The richest spice trader on the row. Suspicious of everybody.", quote: "My stall is full, my padlock is locked. Why are you looking at me?", statements: [
        { id: "dahiru-1", text: "I locked up at nine and went home.", press: "My padlock, my key. Nobody else." },
        { id: "dahiru-2", text: "I went to the stadium for the free rice too.", press: "Everybody went! Free rice is free rice." },
      ] },
    ],
    culpritId: "zara",
    solution:
      "Zara “Sparks” Danladi of the Clockwork Club sent a fake free-rice voice note at 04:00 and paid for real rice at the stadium, so the market emptied for a few hours. She slipped into the colonial strongroom under the cloth stall and took a ledger hidden there since 1999: the Mint's stolen serial numbers. Nothing was taken from the traders. Evidence #1 for the Club.",
  },

  /* 3 ------------------------------------------------------------------ Lagos */
  {
    id: "link-bridge",
    tier: 23,
    title: "The Idling SUV",
    hook: "A black SUV idling on the Lekki–Ikoyi Link Bridge at midnight. Engine running. Driver gone.",
    region: { state: "Lagos", place: "Lekki–Ikoyi Link Bridge", music: "lagos" },
    categories: ["naija", "cyber"],
    tags: ["Lagos", "Vanishing", "Copycat Cog"],
    bounty: 800_000,
    inspecting: 71300,
    lead: LEAD.tolu,
    victim: "Kene Ezeh, 38, fintech founder (missing)",
    briefing:
      "At 00:15 a patrol found Kene Ezeh's black SUV on the Link Bridge: engine running, headlights on, driver's door open, phone on the seat. Investors say ₦4 billion left his company last week. On the dashboard: a brass cog stamped 00:07.",
    kit: {
      backdrop: { kind: "outdoor", sky: "night", ground: "road", horizon: "bridge" },
      props: [
        { kind: "suv", x: 50, y: 64, color: "#1a1a1a", name: "Black SUV" },
        { kind: "camera", x: 62, y: 56, s: 0.6, name: "Dashcam" },
        { kind: "phone", x: 36, y: 60, s: 0.8, name: "Phone on the seat" },
        { kind: "cog", x: 46, y: 54, s: 0.55, name: "Brass cog" },
        { kind: "ladder", x: 88, y: 56, name: "Rope ladder" },
        { kind: "boat", x: 80, y: 47, s: 0.55, name: "Speedboat" },
      ],
    },
    clues: [
      { id: "dashcam", name: "Dashcam", icon: Camera, x: 62, y: 56, description: "The SUV's dashcam records the road and the cabin.", action: "Pull the footage", finding: "At 00:02 Kene parks, calmly takes a bag from the boot, climbs over the rail and down a rope ladder. A woman's voice calls: “Oya quick, the boat is waiting.” It's Lola's.", suspectId: "lola" },
      { id: "ladder", name: "Rope ladder", icon: Anchor, x: 88, y: 56, description: "A rope ladder knotted to the railing, hanging down to the water.", action: "Dust for prints", lab: { kind: "prints", shape: "finger" }, finding: "Two sets of prints: Kene's, and Lola Ogedengbe's. She tied the knots.", suspectId: "lola" },
      { id: "phone", name: "Kene's phone", icon: Smartphone, x: 36, y: 60, description: "His phone, face down on the driver's seat.", action: "Recover deleted messages", finding: "Chief Ayo Bankole, 23:40: “Pay my ₦500m by Friday or you're finished.” Kene, 23:41: “I'm finished either way.”", suspectId: "bankole" },
      { id: "boat", name: "Speedboat", icon: Sailboat, x: 80, y: 47, description: "Patrol cameras caught an unlit speedboat leaving from under the bridge.", action: "Trace the boat", finding: "Rented under a fake name, paid from Lola Ogedengbe's personal account. It docked in Badagry at 02:30.", suspectId: "lola" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "lola", name: "Lola Ogedengbe", role: "Kene's personal assistant", face: { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "long", shirt: "#c9a34a", bg: "#3a2a1d", acc: "earring", mood: "smirk" }, motive: "Was promised a share of the ₦4 billion for helping Kene vanish.", alibi: "Says she was at home in Ajah all night.", background: "Knows every password and every secret in the company.", quote: "I'm just the PA. I book flights, I don't plan disappearances.", statements: [
        { id: "lola-1", text: "I was at home in Ajah all night.", lie: { clueId: "dashcam", reveal: "Okay, I was there. He asked me to help! He said the investors would finish him." } },
        { id: "lola-2", text: "I've never rented a boat in my life.", lie: { clueId: "boat", reveal: "It was a business boat. For… business." } },
        { id: "lola-3", text: "The cog proves the Clockwork gang took him.", lie: { clueId: "ladder", reveal: "I tied the ladder. And I bought the cog from a souvenir seller in Balogun. Happy?" } },
      ] },
      bankole("Angry investor", "Lost ₦500 million in Kene's company and threatened him.", "At his Ikoyi house hosting a card game.", [
        { id: "bank-1", text: "I never threatened Kene.", lie: { clueId: "phone", reveal: "Business talk! In Lagos, “you're finished” means “let's talk tomorrow”." } },
        { id: "bank-2", text: "My money is clean. Ask anybody.", press: "Since 2000 I've built schools, hospitals… Why are you looking at me like that?" },
      ]),
      { id: "idowu", name: "Sgt. Idowu", role: "Bridge patrol", face: { skin: "#5C3A1E", hair: "#111111", hairStyle: "buzz", shirt: "#1d2f5a", bg: "#1d2a3a", acc: "cap", mood: "flat" }, motive: "Found the car, and ₦2 million in cash is missing from its glovebox.", alibi: "On patrol along the bridge all night.", background: "Twelve years on bridge patrol. Has seen everything twice.", quote: "I found the car. I didn't find any money.", statements: [
        { id: "idowu-1", text: "The glovebox was empty when I found the car.", press: "Empty, I swear. Check my bodycam." },
        { id: "idowu-2", text: "I saw a speedboat heading towards Badagry.", press: "No lights. Fast. Around half twelve." },
      ] },
    ],
    culpritId: "lola",
    solution:
      "Kene Ezeh wasn't taken. With Lola's help he faked his own disappearance: she tied the ladder, rented the speedboat and bought a souvenir cog to blame the Clockwork Club. Kene was found in Badagry and the ₦4 billion is frozen. And Chief Bankole's threat is now on record.",
  },

  /* 4 ------------------------------------------------------------------ Enugu */
  {
    id: "enugu-dinner",
    tier: 24,
    title: "Dinner for Ten",
    hook: "An Enugu mansion with dinner laid for ten, still warm. The homeowners have vanished.",
    region: { state: "Enugu", place: "Independence Layout", music: "highlife" },
    categories: ["naija", "vip"],
    tags: ["Enugu", "Mansion", "Copycat Cog"],
    bounty: 900_000,
    inspecting: 47600,
    lead: LEAD.chidi,
    victim: "Chief & Lolo Udeh (missing), and the safe upstairs",
    briefing:
      "Ten guests arrived at Chief and Lolo Udeh's mansion in Independence Layout for dinner at 20:00. The table was set and the ofe nsala still steaming, but the hosts were nowhere. By the time Panti arrived, the safe upstairs was empty. On a plate: a brass cog stamped 00:07.",
    kit: {
      backdrop: { kind: "indoor", decor: "luxury", wall: "#3a2418", floor: "#4a3424", trim: "#e6c35a", window: "none" },
      castSide: "right",
      props: [
        { kind: "chandelier", x: 50, y: 12, name: "Chandelier" },
        { kind: "safe", x: 14, y: 36, name: "Wall safe" },
        { kind: "panel", x: 12, y: 64, s: 0.8, color: "#ff7a1a", name: "Oven timer" },
        { kind: "dining", x: 50, y: 60, name: "Dinner table" },
        { kind: "cog", x: 62, y: 57, s: 0.55, name: "Brass cog" },
        { kind: "door", x: 88, y: 50, color: "#3a2a1a", name: "Cellar door" },
        { kind: "knife", x: 34, y: 82, name: "Bent knife" },
      ],
    },
    clues: [
      { id: "cellar", name: "Cellar door", icon: DoorClosed, x: 88, y: 50, description: "A heavy door to the wine cellar. Is that knocking?", action: "Listen at the door", finding: "Chief and Lolo Udeh are locked in the wine cellar, unharmed and very angry. They say the chef asked them to “check a special wine” at 19:30, then the latch turned from outside.", suspectId: "kachi" },
      { id: "oven", name: "Oven timer", icon: Timer, x: 12, y: 64, description: "The kitchen oven's digital log.", action: "Read the oven log", finding: "Everything was cooked and plated by 18:45, over an hour early, as if the chef planned to be gone before the guests came.", suspectId: "kachi" },
      { id: "safe", name: "Wall safe", icon: LockOpen, x: 14, y: 36, description: "The upstairs safe, open and empty.", action: "Dust for prints", lab: { kind: "prints", shape: "finger" }, finding: "Prints on the dial belong to the chef, Kachi Mbah. Chief Udeh says Kachi has never been upstairs.", suspectId: "kachi" },
      { id: "knife", name: "Bent table knife", icon: Utensils, x: 34, y: 82, description: "One of the ten table knives, on the floor, bent at the tip.", action: "Examine the knife", finding: "Used to force the cellar's old latch from outside. Ugo was at a football viewing centre all evening, and there's no trace of him on it.", suspectId: "ugo" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "kachi", name: "Kachi Mbah", role: "Private chef", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "short", shirt: "#e8e8e8", bg: "#2a221a", acc: "beard", mood: "flat" }, motive: "Owes ₦15 million to a loan shark at Ogbete Market.", alibi: "Says he left after serving at 19:45.", background: "Makes the best ofe nsala in Enugu. Joined the Udeh household three months ago.", quote: "I cook, I serve, I go. Nothing more.", statements: [
        { id: "kachi-1", text: "I never went upstairs.", lie: { clueId: "safe", reveal: "I took… a look. Only a look!" } },
        { id: "kachi-2", text: "I served dinner at the normal time.", lie: { clueId: "oven", reveal: "I finished early. Is cooking fast a crime now?" } },
        { id: "kachi-3", text: "The Clockwork people did this. See the cog!", press: "Everybody knows about the cogs. It was on the news." },
      ] },
      { id: "ugo", name: "Ugo Udeh", role: "The Udehs' son", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "mohawk", shirt: "#1d6a8a", bg: "#1d2a3a", acc: "earring", mood: "worried" }, motive: "His parents cut his allowance last month.", alibi: "Watching a football match at a viewing centre.", background: "Final-year student, home for the weekend.", quote: "I was watching the match! We lost 2–1!", statements: [
        { id: "ugo-1", text: "I was at the viewing centre all evening.", press: "Forty people saw me shouting at the referee." },
        { id: "ugo-2", text: "My parents would never just leave their guests.", press: "Mummy plans dinners for weeks. Something happened." },
      ] },
      { id: "obinna", name: "Obinna", role: "Driver", face: { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#3a3a3a", bg: "#2a2a2a", acc: "cap", mood: "smile" }, motive: "Has keys to the gate and the garage.", alibi: "Collecting two guests from the airport at 19:30.", background: "Twenty years driving the Chief. Knows every pothole in Enugu.", quote: "Me? I was at the airport. Check my fuel!", statements: [
        { id: "obinna-1", text: "I was collecting guests from the airport.", press: "The flight was late, as usual." },
        { id: "obinna-2", text: "Chef Kachi kept asking about the safe.", press: "He asked what time Chief opens it. I told him nothing." },
      ] },
    ],
    culpritId: "kachi",
    solution:
      "Chef Kachi Mbah cooked early, lured the Udehs into the wine cellar at 19:30, forced the latch shut with a table knife and emptied the safe to pay his loan shark. He left a cog on a plate to blame the Clockwork Club. The Udehs are free, and dinner was eventually eaten.",
  },

  /* 5 ------------------------------------------------------------------ Osun */
  {
    id: "ife-library",
    tier: 25,
    title: "The Coded Letter",
    hook: "A student found unconscious in a university library, clutching a coded letter.",
    region: { state: "Osun", place: "Ile-Ife", music: "juju" },
    categories: ["naija"],
    tags: ["Ile-Ife", "Library", "Code"],
    bounty: 1_000_000,
    inspecting: 39800,
    lead: LEAD.tolu,
    victim: "Moyo Fadahunsi, 21, maths student (in hospital, recovering)",
    briefing:
      "At closing time the librarian found Moyo asleep among the shelves and couldn't wake her. No injury. In her hand: a letter in strange code, signed with a drawing of a cog. Doctors found a strong sleeping drug in her blood.",
    kit: {
      backdrop: { kind: "indoor", wall: "#2a2418", floor: "#4a3a2a", window: "none" },
      props: [
        { kind: "bookshelf", x: 12, y: 46, name: "Bookshelf" },
        { kind: "bookshelf", x: 88, y: 46, name: "Second bookshelf" },
        { kind: "lamp", x: 50, y: 54, name: "Reading lamp" },
        { kind: "desk", x: 50, y: 72, name: "Reading table" },
        { kind: "cup", x: 36, y: 66, color: "#7a1a3a", name: "Zobo cup" },
        { kind: "paper", x: 60, y: 66, name: "Coded letter" },
        { kind: "books", x: 70, y: 86, name: "Pile of books" },
      ],
    },
    clues: [
      { id: "zobo", name: "Zobo cup", icon: CupSoda, x: 36, y: 66, description: "A half-finished cup of zobo on the reading table.", action: "Analyze the zobo", finding: "Laced with crushed sleeping tablets. The cup came from the campus café, where Bolaji Adesina bought two zobos at 17:50.", suspectId: "bolaji" },
      { id: "letter", name: "Coded letter", icon: ScrollText, x: 60, y: 66, description: "The letter from her hand, torn as they lifted her.", action: "Reassemble and decode", lab: { kind: "torn", style: "ransom", title: "", lines: ["THE CLOCK", "STILL TICKS", "ABUJA VAULT", "00:07", "TRUST", "BABA AAGO"] }, finding: "Decoded: “The clock still ticks. Abuja vault. 00:07. Trust Baba Aago.” Moyo was helping the Clockwork Club crack an old code. Whoever drugged her wanted her notes, not the letter." },
      { id: "books", name: "Borrowing log", icon: BookOpen, x: 70, y: 86, description: "Books on codes and ciphers, piled on the floor.", action: "Check the borrowing log", finding: "Moyo's notebook of code workings is missing. An hour after she fell asleep, Bolaji borrowed the same three code-breaking books she'd been using.", suspectId: "bolaji" },
      { id: "lamp", name: "Reading lamp", icon: Lamp, x: 50, y: 54, description: "The lamp over her table was switched off.", action: "Dust for prints", lab: { kind: "prints", shape: "finger" }, finding: "Prints on the switch belong to Mr. Oyelaran, the librarian, who switched it off at closing. Expected.", suspectId: "oyelaran" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "bolaji", name: "Bolaji Adesina", role: "Rival student", face: { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "short", shirt: "#3a2a5a", bg: "#2a1d3a", acc: "glasses", mood: "smirk" }, motive: "Heard Moyo had cracked a code linked to a famous heist reward, and wanted the credit.", alibi: "Says he was at the sports centre.", background: "Second in every maths exam, always behind Moyo.", quote: "Moyo is my friend. Kind of. A rival-friend.", statements: [
        { id: "bol-1", text: "I haven't bought zobo in weeks.", lie: { clueId: "zobo", reveal: "Okay, two zobos. One was a gift! A friendly gift!" } },
        { id: "bol-2", text: "I've never touched her notebook.", lie: { clueId: "books", reveal: "I borrowed it. For safekeeping. Very safe keeping." } },
        { id: "bol-3", text: "I was at the sports centre.", press: "Doing… sport. Generally." },
      ] },
      { id: "oyelaran", name: "Mr. Oyelaran", role: "Librarian", face: { skin: "#4a2c17", hair: "#cfcfcf", hairStyle: "short", shirt: "#1d2f5a", bg: "#1d2a3a", acc: "glasses", mood: "flat" }, motive: "Fined Moyo for late books, and they argued.", alibi: "At the issue desk all evening.", background: "Has run the library for 28 years. Shushes people for fun.", quote: "Shhh. Even now. This is a library.", statements: [
        { id: "oye-1", text: "I found her at closing time.", press: "21:00 exactly. I check every aisle." },
        { id: "oye-2", text: "She was reading about old codes all week.", press: "Clocks, ciphers, the Millennium something. A strange girl. A brilliant girl." },
      ] },
      { id: "tega", name: "Tega", role: "Ex-boyfriend", face: { skin: "#5C3A1E", hair: "#53FC18", hairStyle: "mohawk", shirt: "#1a1a1a", bg: "#1a1f2a", acc: "earring", mood: "worried" }, motive: "They broke up on Monday.", alibi: "Rehearsing with his band off campus.", background: "Plays bass in a campus band. Still in love.", quote: "We broke up, but I would never hurt her!", statements: [
        { id: "tega-1", text: "I was rehearsing all evening.", press: "Our drummer can confirm. Loudly." },
        { id: "tega-2", text: "Moyo said someone was copying her work.", press: "She said Bolaji kept looking over her shoulder." },
      ] },
    ],
    culpritId: "bolaji",
    solution:
      "Bolaji Adesina drugged Moyo's zobo and took her notebook, hoping to claim her code-breaking for himself. Moyo is recovering. The letter she was decoding is the Clockwork Club's next move: the Abuja vault, at 00:07.",
  },

  /* 6 ------------------------------------------------------------------ Abuja */
  {
    id: "abuja-vault",
    tier: 26,
    title: "The Clock in the Vault",
    hook: "An Abuja vault opened with no explosives. Inside: only an antique clock, stopped at 00:07.",
    region: { state: "FCT", place: "Central Business District, Abuja", music: "abuja" },
    categories: ["naija", "heists"],
    tags: ["Abuja", "Vault", "Clockwork Club"],
    bounty: 1_400_000,
    inspecting: 82400,
    lead: LEAD.okafor,
    victim: "Federal Trust Bank, Abuja (vault B-7 and a sealed box)",
    briefing:
      "Monday morning, vault B-7 at Federal Trust Bank stood open. No explosives, no forced locks. The only thing inside was an antique clock frozen at 00:07, the exact minute of the Millennium Mint robbery. The vault had held one sealed box labelled “Mint inquiry, 2000”. It's gone.",
    kit: {
      backdrop: { kind: "indoor", decor: "warehouse", wall: "#1b2530", floor: "#161d24", trim: "#9aa3ab", window: "none" },
      props: [
        { kind: "cctv", x: 88, y: 8, name: "Camera" },
        { kind: "vault", x: 30, y: 38, name: "Vault door" },
        { kind: "panel", x: 88, y: 40, name: "Time-lock panel" },
        { kind: "clock", x: 66, y: 56, name: "Antique clock" },
        { kind: "paper", x: 60, y: 84, name: "Visitor log" },
      ],
    },
    clues: [
      { id: "clock", name: "Antique clock", icon: Clock, x: 66, y: 56, description: "A beautiful old clock, stopped at 00:07. Something rattles inside.", action: "Open the clock case", finding: "A note in neat watchmaker's handwriting: “Panti, the box held the Mint's real time-lock log. It shows who opened the Mint in 1999. Ask who wanted it hidden.” Signed with a cog.", suspectId: "bitrus" },
      { id: "timelock", name: "Time-lock panel", icon: Timer, x: 88, y: 40, description: "The vault's time-lock, showing an overnight opening.", action: "Pull the time-lock log", finding: "Opened at 03:00 with a 25-year-old engineer's override code, last used by the vault's installer: Engr. Bitrus Gyang.", suspectId: "bitrus" },
      { id: "visitors", name: "Visitor log", icon: ClipboardList, x: 60, y: 84, description: "The vault's private visitor book.", action: "Check the visitor log", finding: "Last month, deputy manager Hauwa Lawan signed in Chief Ayo Bankole for a “private viewing” of vault B-7. He asked to see the inquiry box.", suspectId: "hauwa" },
      { id: "wheel", name: "Vault wheel", icon: LockOpen, x: 30, y: 38, description: "The big wheel on the vault door.", action: "Dust for prints", lab: { kind: "prints", shape: "finger" }, finding: "Prints belong to Engr. Bitrus Gyang, who installed the vault in 1998, and to nobody else this week.", suspectId: "bitrus" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "bitrus", name: "Engr. Bitrus Gyang", role: "Retired vault engineer, Clockwork Club", face: { skin: "#5C3A1E", hair: "#e6e6e6", hairStyle: "short", shirt: "#3a5a2a", bg: "#1d2a1a", acc: "glasses", mood: "smile" }, motive: "Built the Mint's time-lock in 1998, and always knew it was opened with an insider code.", alibi: "Says he was asleep in Jos.", background: "Retired after 30 years building vaults. Old friend of Pa Tunji Aremu.", quote: "I took nothing that belonged to the bank. I took back the truth.", statements: [
        { id: "bit-1", text: "I was asleep in Jos on Sunday night.", lie: { clueId: "timelock", reveal: "I drove down. My override still works. Twenty-five years, and nobody changed it!" } },
        { id: "bit-2", text: "I've never heard of Baba Aago.", lie: { clueId: "clock", reveal: "Pa Tunji is my friend. He's innocent, and that log proves it." } },
      ] },
      { id: "hauwa", name: "Mrs. Hauwa Lawan", role: "Deputy manager", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#1d2f5a", bg: "#1d2a3a", acc: "gele", accColor: "#1d2f5a", mood: "flat" }, motive: "Let a powerful client see a sealed box without paperwork.", alibi: "At home in Maitama.", background: "Rising star at the bank. Very good at keeping VIPs happy.", quote: "I follow procedure. Mostly.", statements: [
        { id: "hau-1", text: "Nobody has viewed vault B-7 this year.", lie: { clueId: "visitors", reveal: "Chief Bankole is a very important client! He only looked." } },
        { id: "hau-2", text: "The vault codes change every year.", press: "Every year. Except… the engineer override. That one is fixed." },
      ] },
      { id: "ochai", name: "Major (rtd) Ochai", role: "Head of security", face: { skin: "#4a2c17", hair: "#cfcfcf", hairStyle: "buzz", shirt: "#3a3a2a", bg: "#2a2a1a", acc: "cap", mood: "flat" }, motive: "The cameras were “under maintenance” that night.", alibi: "Night shift in the control room.", background: "Retired army officer. Runs bank security like a barracks.", quote: "My men saw nothing. Because there was nothing to see!", statements: [
        { id: "och-1", text: "The cameras were off for scheduled maintenance.", press: "Scheduled weeks ago. A coincidence." },
        { id: "och-2", text: "I heard a clock ticking in the vault on Monday morning.", press: "Ticking. Louder than my heart." },
      ] },
    ],
    culpritId: "bitrus",
    solution:
      "Engr. Bitrus Gyang, who built the vault, opened it with his old engineer override and took the sealed Mint inquiry box: the real 1999 time-lock log. The clock was his message. The log shows the Mint was opened with an insider code, not by a watchmaker. Evidence #2 for the Club. And why did Chief Bankole want to look at that box?",
  },

  /* 7 ------------------------------------------------------------------ Plateau */
  {
    id: "plateau-village",
    tier: 27,
    title: "The Village That Went Quiet",
    hook: "A whole village near Jos, empty overnight. Goats in their pens, pots on cold fires, and nobody.",
    region: { state: "Plateau", place: "Kwi Hill, near Jos", music: "plateau" },
    categories: ["naija"],
    tags: ["Plateau", "Vanishing", "Land Grab"],
    bounty: 1_100_000,
    inspecting: 44900,
    lead: LEAD.bisi,
    victim: "The people of Kwi Hill village (all found safe)",
    briefing:
      "A delivery driver found Kwi Hill village silent at sunrise: goats in their pens, chickens wandering, pots of acha on cold fires. Not one person. By noon the villagers are found safe at a school hall in Jos, saying they were warned a landslide was coming.",
    kit: {
      backdrop: { kind: "outdoor", sky: "day", ground: "grass", horizon: "rocks" },
      castSide: "right",
      props: [
        { kind: "hut", x: 22, y: 56, name: "Hut" },
        { kind: "hut", x: 76, y: 54, name: "Second hut" },
        { kind: "goat", x: 50, y: 70, name: "Goat" },
        { kind: "phone", x: 36, y: 78, name: "Phone in a doorway" },
        { kind: "stake", x: 58, y: 84, name: "Survey stake" },
        { kind: "paper", x: 14, y: 86, name: "Map" },
      ],
    },
    clues: [
      { id: "sms", name: "Emergency SMS", icon: Smartphone, x: 36, y: 78, description: "A phone left in a doorway, still showing a message.", action: "Read the alert", finding: "At 21:00 every phone in the village got: “EMERGENCY: landslide tonight. Evacuate to Jos.” It came from a bulk-SMS account paid for by Clement Okpara.", suspectId: "clement" },
      { id: "stake", name: "Survey stake", icon: Flag, x: 58, y: 84, description: "Fresh survey stakes across the farms.", action: "Inspect the stake", finding: "Marked “TM-4”, the code of a tin-mining company that wants this land.", suspectId: "clement" },
      { id: "map", name: "Torn site plan", icon: ScrollText, x: 14, y: 86, description: "A torn map, half-buried by the path.", action: "Reassemble the map", lab: { kind: "torn", style: "ledger", title: "TM-4 SITE PLAN", lines: ["Kwi Hill farms", "= mining pit A", "School = office", "Fixer: C. Okpara", "Clear the village", "by Friday", "Fee: ₦30M"] }, finding: "A mining plan turning the farms into pits. Clement Okpara was paid ₦30 million to “clear the village”.", suspectId: "clement" },
      { id: "goats", name: "Fed animals", icon: PawPrint, x: 50, y: 70, description: "The goats are calm, fed and watered.", action: "Check the animals", finding: "Fed and watered at 20:00 by Mr. Pam Choji, the youth leader, before he led everyone out. He thought he was saving lives.", suspectId: "pam" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "clement", name: "Clement Okpara", role: "Land “consultant”", face: { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "slick", shirt: "#2b3440", bg: "#2a2a2a", acc: "shades", mood: "smirk" }, motive: "Paid ₦30 million to clear the land for tin mining.", alibi: "Says he was in a hotel in Jos.", background: "Fixes “land problems” for companies. Never stays in one state for long.", quote: "I'm a consultant. I consult.", statements: [
        { id: "cle-1", text: "I've never sent an SMS in my life.", lie: { clueId: "sms", reveal: "Bulk SMS is just marketing! It's legal!" } },
        { id: "cle-2", text: "I don't work for any mining company.", lie: { clueId: "map", reveal: "Consultancy fee, not bribe. Write it well!" } },
        { id: "cle-3", text: "The villagers left by themselves.", press: "Nobody forced anybody. People get scared." },
      ] },
      { id: "pam", name: "Mr. Pam Choji", role: "Youth leader", face: { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#3a8a4a", bg: "#1d2a1a", acc: "cap", mood: "worried" }, motive: "Led the whole village out in the night.", alibi: "With the villagers at the school hall.", background: "Runs the village football team and the harvest festival.", quote: "I thought a landslide was coming! I saved my people!", statements: [
        { id: "pam-1", text: "I fed the animals before we left.", press: "Goats first. Always goats first." },
        { id: "pam-2", text: "A man in a nice car came last week asking about our land.", press: "Sunglasses at night. Who wears sunglasses at night?" },
      ] },
      { id: "kure", name: "Mr. Ibrahim Kure", role: "Mining company manager", face: { skin: "#5C3A1E", hair: "#e6e6e6", hairStyle: "short", shirt: "#e8e0d0", bg: "#2a2a1a", acc: "glasses", mood: "flat" }, motive: "His company, TM-4, wants the land.", alibi: "In Abuja at a meeting.", background: "Has run TM-4 for ten years. Says he only buys land legally.", quote: "We buy land with paper and signatures, not with lies.", statements: [
        { id: "kure-1", text: "TM-4 never asked anyone to clear the village.", press: "We hired a consultant to “speak with the community”. Speak!" },
        { id: "kure-2", text: "I was in Abuja.", press: "Hotel receipt, flight ticket. Everything." },
      ] },
    ],
    culpritId: "clement",
    solution:
      "Clement Okpara sent a fake landslide alert so the village would flee and his mining clients could stake the farms. Everyone is home again, the goats included, and TM-4's plans are frozen. No cog here: just a greedy man.",
  },

  /* 8 ------------------------------------------------------------------ Lagos */
  {
    id: "artist-studio",
    tier: 28,
    title: "The Last Brushstroke",
    hook: "A famous painter found lifeless at his easel, brush still in hand, high above Victoria Island.",
    region: { state: "Lagos", place: "Victoria Island", music: "lagos" },
    categories: ["naija", "vip"],
    tags: ["Lagos", "Art World", "Poison"],
    bounty: 1_300_000,
    inspecting: 69700,
    lead: LEAD.chidi,
    victim: "Chuma Nwachukwu, 47, painter",
    briefing:
      "Chuma Nwachukwu painted every morning in his 30th-floor studio. His assistant found him slumped at the easel at noon, brush in hand, the city glittering below. The windows are sealed. The painting on the easel is half-finished: a figure in a wide red hat.",
    kit: {
      backdrop: { kind: "indoor", wall: "#2f3a3e", floor: "#5a4a3a", window: "city-day" },
      props: [
        { kind: "easel", x: 50, y: 60, color: "#c0182b", name: "Easel" },
        { kind: "paint", x: 26, y: 76, name: "Palette" },
        { kind: "plant", x: 88, y: 60, name: "Plant" },
        { kind: "paper", x: 76, y: 82, name: "Insurance policy" },
      ],
    },
    clues: [
      { id: "paint", name: "Green paint", icon: Palette, x: 26, y: 76, description: "His palette, heavy with a bright, old-fashioned green.", action: "Analyze the green paint", finding: "His usual green was swapped for Paris green, an old arsenic pigment. Painting for hours in a sealed room, he breathed it in. The tube came from a dealer who sells only to Rita Bassey.", suspectId: "rita" },
      { id: "painting", name: "Unfinished painting", icon: Brush, x: 50, y: 56, description: "His last painting: a figure in a wide red hat, holding a paint tube.", action: "Study the painting", finding: "Rita Bassey wears that exact wide red hat to every exhibition. He was painting who gave him the tube.", suspectId: "rita" },
      { id: "policy", name: "Insurance policy", icon: ScrollText, x: 76, y: 82, description: "Torn papers in the bin by the window.", action: "Reassemble the policy", lab: { kind: "torn", style: "ledger", title: "LIFE & ART POLICY", lines: ["Insured: C. Nwachukwu", "Paintings: 40", "Value: ₦200M", "On artist's death:", "value x5", "Beneficiary:", "R. Bassey (agent)"] }, finding: "If Chuma died, his paintings' insured value rose five times, and Rita Bassey collected as his agent.", suspectId: "rita" },
      { id: "window", name: "Sealed windows", icon: Building2, x: 50, y: 22, description: "Floor-to-ceiling windows that don't open.", action: "Check the windows", finding: "Sealed for the air-conditioning, so the fumes had nowhere to go. His ex-wife Ifeoma isn't on the building's visitor list at all this week.", suspectId: "ifeoma" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "rita", name: "Rita Bassey", role: "Art agent", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "long", shirt: "#c0182b", bg: "#3a1d1d", acc: "earring", mood: "smirk" }, motive: "Collects a fortune from the insurance and from his paintings' rising price.", alibi: "Says she was in Abuja for an art fair.", background: "Represents twelve painters. Famous for her wide red hats.", quote: "Chuma was my best client. You don't kill your best client.", statements: [
        { id: "rita-1", text: "I never touch his paints.", lie: { clueId: "paint", reveal: "I gave him a “vintage” green. As a gift! I didn't know what was in it." } },
        { id: "rita-2", text: "I don't benefit from his death.", lie: { clueId: "policy", reveal: "Every agent has a policy like that. Every one!" } },
        { id: "rita-3", text: "I don't even own a red hat any more.", lie: { clueId: "painting", reveal: "Fine. Twelve red hats. It's my brand." } },
      ] },
      { id: "lekan", name: "Mr. Lekan Ojeleye", role: "Gallery owner", face: { skin: "#5C3A1E", hair: "#cfcfcf", hairStyle: "short", shirt: "#1a1a1a", bg: "#2a2a2a", acc: "glasses", mood: "flat" }, motive: "Chuma was leaving his gallery for a bigger one.", alibi: "At his gallery hanging a show.", background: "Gave Chuma his first exhibition 20 years ago.", quote: "I discovered him. Why would I destroy him?", statements: [
        { id: "lek-1", text: "I was hanging a show all morning.", press: "Twelve staff, forty paintings, one very loud morning." },
        { id: "lek-2", text: "Rita changed everything for him.", press: "She chose his paints, his clothes, even his breakfast." },
      ] },
      { id: "ifeoma", name: "Ifeoma", role: "Ex-wife", face: { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "bun", shirt: "#3a8a4a", bg: "#1d2a1a", acc: "gele", accColor: "#3a8a4a", mood: "worried" }, motive: "Their divorce was bitter, and she wanted half his paintings.", alibi: "Teaching at a secondary school in Yaba.", background: "Was his muse in every painting before 2015.", quote: "I wanted half his paintings, not his life.", statements: [
        { id: "ife-1", text: "I haven't been to the studio in a year.", press: "Check the visitor list. I'm banned!" },
        { id: "ife-2", text: "He was very careful about paint fumes.", press: "He always opened windows… until he moved into that sealed tower." },
      ] },
    ],
    culpritId: "rita",
    solution:
      "Rita Bassey swapped Chuma's green for arsenic-laced Paris green, knowing he painted for hours in a sealed studio, so she could collect on his insurance and his rising prices. With his last strokes, Chuma painted her red hat.",
  },

  /* 9 ------------------------------------------------------------------ Kaduna */
  {
    id: "kaduna-train",
    tier: 29,
    title: "The Lost Carriage",
    hook: "A train carriage left alone on a remote track. Luggage still on the racks. Passengers gone.",
    region: { state: "Kaduna", place: "Abuja–Kaduna line", music: "sahel" },
    categories: ["naija", "heists"],
    tags: ["Kaduna", "Train", "Bonds"],
    bounty: 1_600_000,
    inspecting: 52300,
    lead: LEAD.okafor,
    victim: "Carriage 6 of the Kaduna express, and a mail sack of bank bonds",
    briefing:
      "When the Kaduna express pulled in, carriage 6 was missing. It was found an hour later on a remote stretch of track: luggage on the racks, nobody aboard. The 40 passengers turn up at sunset, happy and sunburnt, from a “surprise tour”. But the guard's mail sack, with ₦800 million in bank bonds, is gone.",
    kit: {
      backdrop: { kind: "outdoor", sky: "dusk", ground: "rails", horizon: "savanna" },
      castSide: "right",
      props: [
        { kind: "carriage", x: 46, y: 62, color: "#1d6a3a", name: "Carriage 6" },
        { kind: "coupling", x: 82, y: 66, name: "Coupling" },
        { kind: "luggage", x: 22, y: 88, color: "#c0182b", name: "Suitcase" },
        { kind: "flyer", x: 42, y: 90, color: "#f5c518", name: "Tour flyer" },
        { kind: "sack", x: 60, y: 88, name: "Empty mail sack" },
      ],
    },
    clues: [
      { id: "coupling", name: "Coupling", icon: Link, x: 82, y: 66, description: "Where carriage 6 used to join the train.", action: "Inspect the coupling", finding: "The pin was pulled out with a railway key, not broken. Only guards carry railway keys.", suspectId: "yakubu" },
      { id: "flyer", name: "Tour flyer", icon: Ticket, x: 42, y: 90, description: "A torn flyer stuck under the carriage step.", action: "Reassemble the flyer", lab: { kind: "torn", style: "ledger", title: "SURPRISE TOUR!", lines: ["Carriage 6 only", "FREE castle trip", "Lunch included", "Bus waiting at", "kilometre 92", "Ask your guard!", "— Hadiza Tours"] }, finding: "The tour was for carriage 6 only, with a bus waiting at kilometre 92. The flyer says “ask your guard”.", suspectId: "hadiza" },
      { id: "sack", name: "Mail sack", icon: Mail, x: 60, y: 88, description: "The guard's mail sack, seal cut, empty.", action: "Dust for prints", lab: { kind: "prints", shape: "finger" }, finding: "The only prints inside belong to the guard, Mr. Yakubu Tanko.", suspectId: "yakubu" },
      { id: "luggage", name: "Untouched luggage", icon: Luggage, x: 22, y: 88, description: "Passengers' bags, all still here.", action: "Search the luggage", finding: "Wallets, phones, even a bag of suya: all untouched. Whoever did this wanted only the bonds. Tour guide Hadiza's bag holds sunscreen and a payment receipt signed by Yakubu.", suspectId: "hadiza" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "yakubu", name: "Mr. Yakubu Tanko", role: "Train guard", face: { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#1d2f5a", bg: "#1d2a3a", acc: "cap", mood: "flat" }, motive: "Retiring next month on a tiny pension, and the bonds were in his care.", alibi: "Says he never left the guard's van at the back.", background: "Thirty years on the railway. Knows every bend between Abuja and Kaduna.", quote: "I guard trains. I don't lose carriages.", statements: [
        { id: "yak-1", text: "I never left the guard's van.", lie: { clueId: "coupling", reveal: "I used my railway key, yes. To check the coupling. Then it came off. By itself." } },
        { id: "yak-2", text: "Nobody opened the mail sack.", lie: { clueId: "sack", reveal: "I counted the bonds. For safety!" } },
        { id: "yak-3", text: "I've never heard of Hadiza Tours.", lie: { clueId: "luggage", reveal: "I paid for a tour. For the passengers. As a kindness." } },
      ] },
      { id: "hadiza", name: "Hadiza Kabir", role: "Tour guide", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#f5c518", bg: "#2a2a1a", acc: "gele", accColor: "#f5c518", mood: "smile" }, motive: "Ran the “tour” that emptied the carriage.", alibi: "Leading the castle tour all afternoon.", background: "Runs a small tour company. Thought she'd won a huge contract.", quote: "I just ran a tour! A very nice tour!", statements: [
        { id: "had-1", text: "Someone paid me to give carriage 6 a free tour.", press: "Cash, upfront. A man in a railway uniform." },
        { id: "had-2", text: "I never touched the train.", press: "My bus was at kilometre 92. I didn't even see the train leave." },
      ] },
      { id: "okolie", name: "Mr. Okolie", role: "Train driver", face: { skin: "#5C3A1E", hair: "#cfcfcf", hairStyle: "short", shirt: "#3a3a3a", bg: "#2a2a2a", acc: "cap", mood: "worried" }, motive: "Should have noticed a missing carriage.", alibi: "Driving the engine.", background: "Drives fast, eats faster, never looks back.", quote: "Look back? I'm driving a train, not a bicycle!", statements: [
        { id: "oko-1", text: "I felt a small jerk at kilometre 92.", press: "I thought it was a goat. Goats are everywhere." },
        { id: "oko-2", text: "The guard told me to stop at kilometre 92 for “checks”.", press: "Five minutes. Then he said, “Oya, carry go.”" },
      ] },
    ],
    culpritId: "yakubu",
    solution:
      "Guard Yakubu Tanko booked a free “surprise tour” for carriage 6, stopped the train at kilometre 92, uncoupled the carriage with his railway key and walked off with ₦800 million in bonds. The passengers had a lovely day out.",
  },

  /* 10 ----------------------------------------------------------------- Edo */
  {
    id: "benin-palace",
    tier: 30,
    title: "The Missing Coral Crown",
    hook: "A powerful chief found unresponsive in his palace. His coral-bead crown is gone.",
    region: { state: "Edo", place: "Benin City", music: "benin" },
    categories: ["naija", "vip"],
    tags: ["Benin City", "Palace", "Crown"],
    bounty: 1_800_000,
    inspecting: 61500,
    lead: LEAD.chidi,
    victim: "High Chief Osazee Ekhator (recovering), and his heirloom coral crown",
    briefing:
      "High Chief Osazee Ekhator was found slumped on his throne at dawn, alive but unresponsive. His coral-bead crown, worn by his family for six generations, was missing. Doctors found a sedative in his palm wine. A collector offered ₦1 billion for that crown last month.",
    kit: {
      backdrop: { kind: "indoor", decor: "hall", wall: "#4a1a1a", floor: "#3a2418", trim: "#e6c35a", window: "none" },
      castSide: "right",
      props: [
        { kind: "paper", x: 16, y: 54, name: "Letter" },
        { kind: "throne", x: 50, y: 50, name: "Throne" },
        { kind: "cushion", x: 50, y: 78, name: "Empty crown cushion" },
        { kind: "gourd", x: 24, y: 76, name: "Palm wine gourd" },
        { kind: "door", x: 86, y: 46, color: "#5a3a1a", name: "Side door" },
      ],
    },
    clues: [
      { id: "gourd", name: "Palm wine gourd", icon: Wine, x: 24, y: 76, description: "The chief's evening palm wine, half drunk.", action: "Analyze the palm wine", finding: "A strong sedative was stirred into it. The gourd was filled by the palace secretary, Mr. Ehis Omoruyi, at 22:00.", suspectId: "ehis" },
      { id: "cushion", name: "Crown cushion", icon: Crown, x: 50, y: 78, description: "The velvet cushion where the crown rests at night. Empty.", action: "Dust for prints", lab: { kind: "prints", shape: "finger" }, finding: "Prints on the cushion belong to Ehis Omoruyi. He says he has never touched the crown.", suspectId: "ehis" },
      { id: "letter", name: "Letter", icon: Mail, x: 16, y: 54, description: "A letter on palace paper, addressed to the secretary.", action: "Read the letter", finding: "From Chief Ayo Bankole to Ehis: “My offer stands. Bring it to Lagos by Sunday.”", suspectId: "bankole" },
      { id: "door", name: "Side door", icon: DoorOpen, x: 86, y: 46, description: "A small side door to the palace garden.", action: "Check the side door", finding: "Unlocked from inside at 23:40. Prince Osaro's car was seen at a party across town all night.", suspectId: "osaro" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "ehis", name: "Mr. Ehis Omoruyi", role: "Palace secretary", face: { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "short", shirt: "#e8e0d0", bg: "#3a1d1d", acc: "glasses", mood: "flat" }, motive: "Was promised ₦200 million to deliver the crown to a buyer.", alibi: "Says he went home at 22:30.", background: "Has kept the palace diary for fifteen years. Knows every door and key.", quote: "I serve the palace. I would never betray it.", statements: [
        { id: "ehis-1", text: "I never touched the crown.", lie: { clueId: "cushion", reveal: "I moved the cushion! To dust it! At midnight, yes." } },
        { id: "ehis-2", text: "I didn't prepare the palm wine.", lie: { clueId: "gourd", reveal: "I poured it. I always pour it. I didn't put anything inside… much." } },
        { id: "ehis-3", text: "I've never spoken to Chief Bankole.", lie: { clueId: "letter", reveal: "He wrote to me! I never replied. Okay, I replied once." } },
      ] },
      { id: "osaro", name: "Prince Osaro", role: "The chief's nephew", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "slick", shirt: "#c0182b", bg: "#3a1d1d", acc: "earring", mood: "smirk" }, motive: "Wants to be the next High Chief, and the crown would help.", alibi: "At a party across town.", background: "Flashy, loud and very proud of his car.", quote: "I want the title, not a stolen crown!", statements: [
        { id: "osa-1", text: "I was at a party all night.", press: "Ask the DJ. I requested twelve songs." },
        { id: "osa-2", text: "Uncle always left the crown on the cushion at night.", press: "Everybody in the palace knows that." },
      ] },
      bankole("Collector", "Offered ₦1 billion for the crown for his private collection.", "Says he was in Lagos all week.", [
        { id: "bank-1", text: "I only made a legal offer for the crown.", press: "A legal, generous offer. Nothing more." },
        { id: "bank-2", text: "I was in Lagos all week.", press: "My driver, my staff, my golf club. Everybody saw me." },
      ]),
    ],
    culpritId: "ehis",
    solution:
      "Palace secretary Ehis Omoruyi drugged the chief's palm wine and slipped out with the coral crown, meaning to sell it to Chief Bankole in Lagos. The crown was recovered from his car boot, and the High Chief is back on his throne. Bankole's name, again.",
  },

  /* 11 ----------------------------------------------------------------- Cross River */
  {
    id: "calabar-beach",
    tier: 31,
    title: "The Silent Bonfire",
    hook: "A beach bonfire still burning in Calabar. Drums and guitars on the sand. The band has vanished.",
    region: { state: "Cross River", place: "Calabar", music: "calabar" },
    categories: ["naija"],
    tags: ["Calabar", "Beach", "Smuggling"],
    bounty: 1_500_000,
    inspecting: 49300,
    lead: LEAD.bisi,
    victim: "The Henshaw Town Highlife Band (found safe)",
    briefing:
      "At midnight a fisherman found a roaring bonfire on the beach, drums and guitars dropped on the sand, and no musicians. The band had been playing for a crowd an hour earlier. By morning they're found at a hotel across town, waiting for a “record deal” that never came. That same night, an unlit boat landed on this beach.",
    kit: {
      backdrop: { kind: "outdoor", sky: "night", ground: "sand", horizon: "sea" },
      castSide: "right",
      props: [
        { kind: "boat", x: 82, y: 48, s: 0.7, color: "#1a1a1a", name: "Dark boat" },
        { kind: "bonfire", x: 50, y: 62, name: "Bonfire" },
        { kind: "drum", x: 30, y: 66, name: "Drum" },
        { kind: "guitar", x: 66, y: 70, name: "Guitar" },
        { kind: "flyer", x: 16, y: 84, color: "#53FC18", name: "Record deal flyer" },
        { kind: "footprints", x: 54, y: 86, name: "Footprints" },
      ],
    },
    clues: [
      { id: "flyer", name: "Record deal flyer", icon: Ticket, x: 16, y: 84, description: "A torn flyer half-buried in the sand.", action: "Reassemble the flyer", lab: { kind: "torn", style: "ledger", title: "RECORD DEAL!", lines: ["Calabar Records", "wants YOU!", "Audition tonight", "Hotel Marina", "11pm SHARP", "Bring the band", "— E. Ekpo"] }, finding: "A fake record-deal flyer signed by promoter Effiong Ekpo, calling the whole band to a hotel at 23:00, just when the boat was due.", suspectId: "effiong" },
      { id: "boat", name: "Unlit boat", icon: Sailboat, x: 82, y: 48, description: "An unlit boat, pulled up on the sand.", action: "Trace the boat", finding: "It carried smuggled goods and was booked to land on this exact beach at 23:15, through Effiong Ekpo's events company.", suspectId: "effiong" },
      { id: "drum", name: "Drum", icon: Drum, x: 30, y: 66, description: "The band's big drum, dropped mid-song.", action: "Examine the drum", finding: "A message scratched inside: “Sax, take the band to the hotel. Big money. —E.” Bassey “Sax” Henshaw thought it was real.", suspectId: "bassey" },
      { id: "prints", name: "Footprints", icon: Footprints, x: 54, y: 86, description: "Fresh prints from the waterline to the road.", action: "Dust & cast the print", lab: { kind: "prints", shape: "boot" }, finding: "Size-44 designer loafers, the style Effiong Ekpo wears to every show.", suspectId: "effiong" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "effiong", name: "Effiong Ekpo", role: "Show promoter", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "slick", shirt: "#7a3aff", bg: "#2a1d3a", acc: "shades", mood: "smirk" }, motive: "Was paid ₦20 million to clear the beach for a smuggling boat.", alibi: "Says he was at home in Calabar South.", background: "Promotes every big show in Calabar. Always carries three phones.", quote: "I make stars. I don't make trouble.", statements: [
        { id: "eff-1", text: "I never sent the band anywhere.", lie: { clueId: "flyer", reveal: "A small audition! I was going to give them a deal… someday." } },
        { id: "eff-2", text: "I don't know anything about any boat.", lie: { clueId: "boat", reveal: "Event equipment! The boat was bringing… speakers." } },
        { id: "eff-3", text: "I wasn't on the beach last night.", lie: { clueId: "prints", reveal: "I walked on the beach. For fresh air. In loafers." } },
      ] },
      { id: "bassey", name: "Bassey “Sax” Henshaw", role: "Band leader", face: { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#c9a34a", bg: "#3a2a1d", acc: "cap", mood: "worried" }, motive: "Left the fire burning and led the band away.", alibi: "Waiting in a hotel lobby for a record deal.", background: "Leader of the Henshaw Town Highlife Band for twenty years.", quote: "Twenty years we've waited for a record deal!", statements: [
        { id: "bas-1", text: "We left everything because we thought we'd be back in an hour.", press: "Who carries drums to an audition?" },
        { id: "bas-2", text: "Effiong told me it was our big chance.", press: "He said “record deal”. I heard “retirement”." },
      ] },
      { id: "arit", name: "Mrs. Arit Edet", role: "Hotel manager", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#1d6a8a", bg: "#1d2a3a", acc: "gele", accColor: "#1d6a8a", mood: "flat" }, motive: "Her hotel hosted the fake audition.", alibi: "At the front desk all night.", background: "Runs the busiest hotel on the Marina. Never forgets a face.", quote: "Someone booked my hall and never showed. That's all I know.", statements: [
        { id: "ari-1", text: "The hall was booked by Effiong's company.", press: "Paid in cash. Effiong always pays cash." },
        { id: "ari-2", text: "The band waited until four in the morning.", press: "I gave them tea. Poor men." },
      ] },
    ],
    culpritId: "effiong",
    solution:
      "Promoter Effiong Ekpo lured the band away with a fake record deal so a smuggling boat could land unseen. The band is back on the beach, with a real gig this time, paid for by the seized boat's cargo.",
  },

  /* 12 ----------------------------------------------------------------- Lagos */
  {
    id: "data-center",
    tier: 32,
    title: "The Dark Data Centre",
    hook: "A Lagos data centre goes dark. The guard remembers nothing, surrounded by smashed servers.",
    region: { state: "Lagos", place: "Ikeja", music: "lagos" },
    categories: ["naija", "cyber"],
    tags: ["Lagos", "Cyber", "Cover-up"],
    bounty: 1_700_000,
    inspecting: 58800,
    lead: LEAD.tolu,
    victim: "PrimeVault data centre, Ikeja (and ten years of records)",
    briefing:
      "At 02:00 the PrimeVault data centre went dark. The morning shift found the night guard, Mr. Ifeanyi Ugwu, sitting dazed among three smashed servers. He remembers nothing after midnight. Those servers held ten years of company records, including Chief Ayo Bankole's.",
    kit: {
      backdrop: { kind: "indoor", decor: "warehouse", wall: "#141a20", floor: "#1d2328", trim: "#53FC18", window: "none" },
      props: [
        { kind: "server", x: 18, y: 42, name: "Server rack" },
        { kind: "server", x: 38, y: 42, name: "Second rack" },
        { kind: "smashed", x: 62, y: 60, name: "Smashed rack" },
        { kind: "panel", x: 88, y: 34, name: "Access reader" },
        { kind: "chair", x: 84, y: 66, color: "#2b5a8a", name: "Guard's chair" },
        { kind: "spray", x: 54, y: 86, name: "Spray can" },
      ],
    },
    clues: [
      { id: "spray", name: "Spray can", icon: SprayCan, x: 54, y: 86, description: "A small spray can, rolled under a rack.", action: "Analyze the spray", finding: "A knockout spray that causes short memory loss. It was ordered online and delivered to Tunde Oyewole's office.", suspectId: "tunde" },
      { id: "reader", name: "Access reader", icon: CreditCard, x: 88, y: 34, description: "The card reader on the server hall door.", action: "Pull the access log", finding: "Only one card entered after midnight: contractor Tunde Oyewole's, at 01:47.", suspectId: "tunde" },
      { id: "racks", name: "Smashed rack", icon: Hammer, x: 62, y: 60, description: "A server rack beaten in with a hammer.", action: "Dust for prints", lab: { kind: "prints", shape: "finger" }, finding: "Tunde's prints on the panels, and hammer marks matching the toolkit in his van. The three servers smashed were the only ones holding records from 2000.", suspectId: "tunde" },
      { id: "chair", name: "Guard's chair", icon: Armchair, x: 84, y: 66, description: "The guard's chair, his flask and radio beside it.", action: "Check the guard's post", finding: "His tea is untouched and his radio log shows him calling in every hour until 01:45. He was attacked, not involved.", suspectId: "ifeanyi" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "tunde", name: "Tunde Oyewole", role: "IT contractor", face: { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "short", shirt: "#2b3440", bg: "#1a1f2a", acc: "glasses", mood: "smirk" }, motive: "Was paid in cash by “a client he won't name” to destroy old records before an inquiry.", alibi: "Says he was at home in Magodo.", background: "Built half of PrimeVault's network. Knows where every cable runs.", quote: "I build servers. I don't smash them.", statements: [
        { id: "tun-1", text: "My card wasn't used last night.", lie: { clueId: "reader", reveal: "Somebody cloned my card! …Okay, I went in. For maintenance." } },
        { id: "tun-2", text: "I don't own any knockout spray.", lie: { clueId: "spray", reveal: "It's for self-defence. In Lagos traffic." } },
        { id: "tun-3", text: "Nobody paid me anything.", press: "Ask my bank. Actually, don't ask my bank." },
      ] },
      { id: "ifeanyi", name: "Mr. Ifeanyi Ugwu", role: "Night guard", face: { skin: "#4a2c17", hair: "#cfcfcf", hairStyle: "short", shirt: "#1d2f5a", bg: "#1d2a3a", acc: "cap", mood: "worried" }, motive: "Was alone with the servers all night.", alibi: "Can't remember.", background: "Ten years as a guard. Brings his own tea and his own radio.", quote: "I remember the news at midnight. Then… nothing.", statements: [
        { id: "ifa-1", text: "I called in every hour, like always.", press: "Check the radio log. Every hour." },
        { id: "ifa-2", text: "I smelled something sweet before I fell asleep.", press: "Like perfume. Or a sweet spray." },
      ] },
      { id: "nike", name: "Mrs. Nike Adebisi", role: "Data centre manager", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#0f4a3a", bg: "#1d3a2a", acc: "glasses", mood: "flat" }, motive: "Her backups had failed, and she'd hidden it from clients.", alibi: "Asleep at home.", background: "Runs the centre with an iron hand and a bad backup system.", quote: "My backups are perfect! …Were perfect.", statements: [
        { id: "nik-1", text: "Those records had backups.", press: "Had. Past tense. The backups were on the same three servers." },
        { id: "nik-2", text: "Chief Bankole asked last week how long we keep old records.", press: "I said ten years. He smiled. I didn't like the smile." },
      ] },
    ],
    culpritId: "tunde",
    solution:
      "Tunde Oyewole knocked out the guard with spray, let himself in with his own card and smashed the only servers holding records from 2000, paid in cash by “a client”. A forensic team recovered fragments. One file name survived: “AB Holdings 2000”.",
  },

  /* 13 ----------------------------------------------------------------- Abuja */
  {
    id: "abuja-dinner",
    tier: 33,
    title: "The Sleeping Diplomats",
    hook: "Every guest at a diplomatic dinner in Abuja, slumped over their plates.",
    region: { state: "FCT", place: "Maitama, Abuja", music: "abuja" },
    categories: ["naija", "vip"],
    tags: ["Abuja", "Dinner", "Clockwork Club"],
    bounty: 2_000_000,
    inspecting: 77200,
    lead: LEAD.chidi,
    victim: "Twelve guests at the Maitama trade dinner (all recovered)",
    briefing:
      "At 21:30 every guest at a private trade dinner in Maitama fell asleep at once, faces in the pepper soup. Poison was feared, but all twelve woke an hour later with headaches. Only one thing was touched: the coat of guest Chief Ayo Bankole, whose inside pocket held a sealed letter.",
    kit: {
      backdrop: { kind: "indoor", decor: "luxury", wall: "#2a2018", floor: "#3a2a22", trim: "#e6c35a", window: "city-night" },
      castSide: "right",
      props: [
        { kind: "chandelier", x: 50, y: 10, name: "Chandelier" },
        { kind: "banquet", x: 48, y: 64, name: "Banquet table" },
        { kind: "bowl", x: 30, y: 60, s: 0.9, name: "Pepper soup" },
        { kind: "wine", x: 66, y: 57, name: "Wine bottle" },
        { kind: "coatrack", x: 88, y: 54, color: "#1a1a1a", name: "Coat rack" },
        { kind: "camera", x: 14, y: 84, s: 0.7, name: "Tiny camera" },
        { kind: "paper", x: 54, y: 86, name: "Seating chart" },
      ],
    },
    clues: [
      { id: "soup", name: "Pepper soup", icon: Soup, x: 30, y: 60, description: "The pepper soup everyone ate at 21:15.", action: "Analyze the soup", finding: "A gentle sleeping herb: enough for an hour's nap and a headache, no more. It was stirred in at the serving table run by Chef Halima Yusuf.", suspectId: "halima" },
      { id: "coat", name: "Bankole's coat", icon: Shirt, x: 88, y: 54, description: "Chief Bankole's coat on the rack. The letter in its pocket was resealed.", action: "Dust for prints", lab: { kind: "prints", shape: "finger" }, finding: "Prints on the letter's seal belong to Chef Halima Yusuf. It was opened, photographed and sealed again.", suspectId: "halima" },
      { id: "camera", name: "Tiny camera", icon: Camera, x: 14, y: 84, description: "A tiny camera hidden behind a curtain.", action: "Develop the photo", finding: "One photo: Bankole's letter. A 2000 bank transfer from the Millennium Mint account to “AB Holdings”. AB: Ayo Bankole.", suspectId: "bankole" },
      { id: "chart", name: "Seating chart", icon: ClipboardList, x: 54, y: 86, description: "A torn seating chart under the table.", action: "Reassemble the chart", lab: { kind: "torn", style: "ledger", title: "TABLE 1 · 21:00", lines: ["Seat 1: Amb. Pierce", "Seat 2: Chief Bankole", "Coat: rack by door", "Soup at 21:15", "Lights down 21:25", "One photo only", "— H."] }, finding: "In the chef's handwriting: Bankole's coat marked, and “lights down 21:25”, five minutes before everyone fell asleep.", suspectId: "halima" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "halima", name: "Chef Halima Yusuf", role: "Caterer, Clockwork Club", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#e8e8e8", bg: "#2a221a", acc: "gele", accColor: "#c9a34a", mood: "smile" }, motive: "Needed one photo of the letter in Bankole's coat.", alibi: "Says she was in the kitchen all night.", background: "Cooks for every embassy in Abuja. Quietly a member of the Clockwork Club.", quote: "Everybody had a good nap and a bad headache. Nobody was harmed.", statements: [
        { id: "hal-1", text: "I never left the kitchen.", lie: { clueId: "soup", reveal: "I served the soup myself. With a small extra herb. A sleeping herb, not poison!" } },
        { id: "hal-2", text: "I never touched anybody's coat.", lie: { clueId: "coat", reveal: "One letter. One photo. For Pa Tunji." } },
        { id: "hal-3", text: "Ask Chief Bankole about AB Holdings.", press: "Twenty-five years he's been hiding that name." },
      ] },
      { id: "pierce", name: "Ambassador Jonathan Pierce", role: "Guest of honour", face: { skin: "#FFDBAC", hair: "#cfcfcf", hairStyle: "slick", shirt: "#1d2f5a", bg: "#1d2a3a", acc: "glasses", mood: "worried" }, motive: "Was negotiating a secret deal with Bankole.", alibi: "Asleep at the table like everyone else.", background: "Visiting trade ambassador. Loves pepper soup, now nervous about it.", quote: "I came for trade talks and woke up in my soup.", statements: [
        { id: "pie-1", text: "My deal with Chief Bankole is perfectly legal.", press: "Shipping contracts. Boring. Legal. Boring." },
        { id: "pie-2", text: "Chief Bankole was very nervous about his coat.", press: "He checked the pocket twice before dinner." },
      ] },
      bankole("Guest", "Was carrying a letter he very much wanted kept secret.", "Asleep at the table like everyone else.", [
        { id: "bank-1", text: "That letter was private business.", lie: { clueId: "camera", reveal: "AB Holdings is an old company. Very old. Closed. I don't remember it." } },
        { id: "bank-2", text: "I don't know anybody called Baba Aago.", press: "Never heard the name. Never. Why are you asking twice?" },
      ]),
    ],
    culpritId: "halima",
    solution:
      "Chef Halima Yusuf of the Clockwork Club put a sleeping herb in the pepper soup, dimmed the lights at 21:25 and photographed the letter in Chief Bankole's coat: a 2000 transfer from the Millennium Mint account to AB Holdings. Everybody woke up fine. Evidence #3 for the Club, and Bankole is now very, very nervous.",
  },

  /* 14 ----------------------------------------------------------------- Taraba */
  {
    id: "greenhouse",
    tier: 34,
    title: "The Dry Greenhouse",
    hook: "A rare-plant scientist found dehydrated in a greenhouse on the Mambilla Plateau. The door was never locked.",
    region: { state: "Taraba", place: "Mambilla Plateau", music: "plateau" },
    categories: ["naija"],
    tags: ["Taraba", "Greenhouse", "Rare Orchid"],
    bounty: 1_900_000,
    inspecting: 38300,
    lead: LEAD.okafor,
    victim: "Dr. Laraba Tukur, botanist (recovering)",
    briefing:
      "Dr. Laraba Tukur spent nights in her greenhouse on the cool Mambilla Plateau, guarding a rare orchid worth millions to perfume companies. A tea farmer found her collapsed and dehydrated at noon. The door opened easily, but she never woke to open it. The orchid was gone, the water tank empty, the heating set to 45°C.",
    kit: {
      backdrop: { kind: "outdoor", sky: "day", ground: "grass", horizon: "hills" },
      castSide: "right",
      props: [
        { kind: "greenhouse", x: 50, y: 58, name: "Greenhouse" },
        { kind: "plant", x: 20, y: 70, name: "Tea plant" },
        { kind: "orchid", x: 46, y: 66, color: "#ff7af5", name: "Orchid cutting" },
        { kind: "panel", x: 66, y: 48, color: "#ff7a1a", name: "Climate panel" },
        { kind: "tank", x: 80, y: 64, name: "Water tank" },
        { kind: "cup", x: 34, y: 82, color: "#53FC18", name: "Energy drink" },
      ],
    },
    clues: [
      { id: "panel", name: "Climate panel", icon: Thermometer, x: 66, y: 48, description: "The greenhouse climate control, still set to 45°C.", action: "Read the climate log", finding: "At 01:00 it was switched to 45°C “dry mode” with the admin PIN shared only by Dr. Tukur and her lab partner, Dr. Kelvin Amadi.", suspectId: "kelvin" },
      { id: "drink", name: "Energy drink", icon: CupSoda, x: 34, y: 82, description: "A half-drunk energy drink by her chair.", action: "Analyze the drink", finding: "A sleeping powder, strong enough to keep her down through the hottest hours. The can came from Kelvin's own cooler.", suspectId: "kelvin" },
      { id: "tank", name: "Water tank", icon: Droplets, x: 80, y: 64, description: "The greenhouse water tank, drained dry.", action: "Dust for prints", lab: { kind: "prints", shape: "finger" }, finding: "The drain valve was opened by hand, and the prints on it belong to Kelvin Amadi.", suspectId: "kelvin" },
      { id: "orchid", name: "Orchid cutting", icon: Flower, x: 46, y: 66, description: "One cutting of the rare orchid, left behind, wrapped for shipping.", action: "Check the shipping label", finding: "A courier label to a perfume company, booked through Kabiru the courier for “Dr. K. A.”", suspectId: "kabiru" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "kelvin", name: "Dr. Kelvin Amadi", role: "Lab partner", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "short", shirt: "#e8e8e8", bg: "#1a2a22", acc: "glasses", mood: "flat" }, motive: "A perfume company offered ₦300 million for the orchid, if he alone held the rights.", alibi: "Says he was in Gembu town all night.", background: "Brilliant, impatient and always second author on Laraba's papers.", quote: "Laraba is my partner. I would never leave her to dry out!", statements: [
        { id: "kel-1", text: "I haven't touched the climate panel in weeks.", lie: { clueId: "panel", reveal: "I adjusted it! For research. Very hot research." } },
        { id: "kel-2", text: "That drink isn't mine.", lie: { clueId: "drink", reveal: "Okay, it's mine. I gave her one. As a friend. A sleepy friend." } },
        { id: "kel-3", text: "I was in Gembu all night.", lie: { clueId: "tank", reveal: "I came back at one to check the water. I… made a mistake with the valve." } },
      ] },
      { id: "bulus", name: "Mr. Bulus Adamu", role: "Tea farm manager", face: { skin: "#4a2c17", hair: "#cfcfcf", hairStyle: "buzz", shirt: "#3a8a4a", bg: "#1d2a1a", acc: "cap", mood: "worried" }, motive: "Wanted the greenhouse land for more tea.", alibi: "In the tea fields from dawn.", background: "Thirty years on the Mambilla tea estates. Found Dr. Tukur at noon.", quote: "I found her! Without me, she'd be gone.", statements: [
        { id: "bul-1", text: "I found her at noon and called for help.", press: "I carried her out myself. My back still hurts." },
        { id: "bul-2", text: "Dr. Kelvin's car left at sunrise.", press: "Fast. Very fast. Mambilla roads are not for fast." },
      ] },
      { id: "kabiru", name: "Kabiru", role: "Courier", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#f5c518", bg: "#2a2a1a", acc: "cap", mood: "smile" }, motive: "Booked a shipment of the orchid.", alibi: "At the courier depot in Gembu.", background: "Delivers everything on the plateau. Talks to everyone.", quote: "I deliver boxes. I don't ask what's inside.", statements: [
        { id: "kab-1", text: "The package was booked by “Dr. K. A.”", press: "Paid extra for “fast and quiet”." },
        { id: "kab-2", text: "I never went inside the greenhouse.", press: "Too hot! Even the door handle was hot." },
      ] },
    ],
    culpritId: "kelvin",
    solution:
      "Dr. Kelvin Amadi drugged his partner's drink, set the greenhouse to desert mode, drained the water and shipped the orchid to a perfume company in his own name. Dr. Tukur is recovering, and the orchid is back where it belongs.",
  },

  /* 15 ----------------------------------------------------------------- Rivers */
  {
    id: "ph-wedding",
    tier: 35,
    title: "The Vanishing Couple",
    hook: "A Port Harcourt wedding hall, fully decorated, guests seated. The bride and groom have vanished.",
    region: { state: "Rivers", place: "Port Harcourt GRA", music: "rivers" },
    categories: ["naija", "vip"],
    tags: ["Port Harcourt", "Wedding", "Jewel Theft"],
    bounty: 2_100_000,
    inspecting: 63800,
    lead: LEAD.bisi,
    victim: "Ebi & Soye (found safe), and the bride's family coral jewellery",
    briefing:
      "Three hundred guests waited in a decorated hall in GRA Port Harcourt. The bride and groom never walked in. At 17:00 they were found on a stranded boat at a Bonny Island jetty, after a “surprise pre-wedding photo shoot”. While everyone searched, the bride's family coral jewellery vanished from the hall.",
    kit: {
      backdrop: { kind: "indoor", decor: "hall", wall: "#3a2a3a", floor: "#2a1a22", trim: "#e6c35a", window: "none" },
      props: [
        { kind: "arch", x: 50, y: 50, color: "#ff7af5", name: "Flower arch" },
        { kind: "cake", x: 16, y: 56, name: "Wedding cake" },
        { kind: "camera", x: 32, y: 66, name: "Photographer's bag" },
        { kind: "jewelbox", x: 84, y: 62, name: "Empty jewellery box" },
        { kind: "seats", x: 58, y: 86, s: 0.6, color: "#c9a34a", name: "Guest chairs" },
        { kind: "flyer", x: 88, y: 86, color: "#ff7af5", name: "Photo-shoot flyer" },
      ],
    },
    clues: [
      { id: "bag", name: "Photographer's bag", icon: Camera, x: 32, y: 66, description: "The “photographer's” camera bag, left by the cake table.", action: "Search the bag", finding: "No memory card, no photos: an empty camera and a boat hire receipt to Bonny Island in the name of Tari Douglas.", suspectId: "tari" },
      { id: "box", name: "Jewellery box", icon: Gem, x: 84, y: 62, description: "The velvet box that held the coral set. Empty.", action: "Dust for prints", lab: { kind: "prints", shape: "finger" }, finding: "Prints on the box belong to Tari Douglas, who says he never came inside the hall.", suspectId: "tari" },
      { id: "flyer", name: "Photo-shoot flyer", icon: Ticket, x: 88, y: 86, description: "A torn flyer under the front row.", action: "Reassemble the flyer", lab: { kind: "torn", style: "ledger", title: "SURPRISE SHOOT!", lines: ["Bride & groom ONLY", "Bonny jetty, 2pm", "Golden-hour photos", "Boat provided", "Don't tell anybody!", "— Flash Studios", "(Tari D.)"] }, finding: "Tari lured the couple to Bonny Island for a “secret” shoot and left them on a boat with no fuel, so the jewellery would be unguarded during the panic.", suspectId: "tari" },
      { id: "cake", name: "Cake table", icon: Cake, x: 16, y: 56, description: "Five tiers, untouched, and the planner's clipboard.", action: "Check the cake table", finding: "The planner, Mrs. Ibiere West, never left the cake table: three ushers and the cake maker confirm it.", suspectId: "ibiere" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "tari", name: "Tari “Flash” Douglas", role: "“Photographer”", face: { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "mohawk", shirt: "#1a1a1a", bg: "#1a1f2a", acc: "shades", mood: "smirk" }, motive: "The coral set is worth ₦150 million.", alibi: "Says he was waiting at the jetty for the couple.", background: "Calls himself a photographer. Has never published one photo.", quote: "I'm an artist! I capture moments!", statements: [
        { id: "tar-1", text: "I never came inside the hall.", lie: { clueId: "box", reveal: "I came in to check the lighting. For the photos." } },
        { id: "tar-2", text: "The shoot was the couple's idea.", lie: { clueId: "flyer", reveal: "Okay, it was my idea. A very romantic idea." } },
        { id: "tar-3", text: "I'm a professional photographer.", lie: { clueId: "bag", reveal: "Professional… in training." } },
      ] },
      { id: "ibiere", name: "Mrs. Ibiere West", role: "Wedding planner", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#ff7af5", bg: "#3a1d2a", acc: "gele", accColor: "#ff7af5", mood: "worried" }, motive: "Her reputation is ruined if the wedding fails.", alibi: "At the cake table all afternoon.", background: "Port Harcourt's most famous wedding planner.", quote: "In twenty years, I have never lost a bride!", statements: [
        { id: "ibi-1", text: "I never left the cake table.", press: "Three ushers and the cake maker will swear it." },
        { id: "ibi-2", text: "I didn't book any photographer called Flash.", press: "The groom's friend recommended him. I hate surprises." },
      ] },
      { id: "soala", name: "Soala", role: "Best man", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#1d2f5a", bg: "#1d2a3a", acc: "earring", mood: "smile" }, motive: "Recommended the fake photographer.", alibi: "With the groom's family all afternoon.", background: "The groom's best friend since primary school. Recommends people too easily.", quote: "I recommended him because he was cheap! Cheap, not criminal!", statements: [
        { id: "soa-1", text: "Flash told me he did weddings in Lagos.", press: "He showed me photos. Probably stolen photos." },
        { id: "soa-2", text: "I never touched the jewellery.", press: "I don't even know what coral looks like. Red? Red rocks?" },
      ] },
    ],
    culpritId: "tari",
    solution:
      "Tari “Flash” Douglas lured the couple to Bonny Island for a fake photo shoot, left them stranded and walked off with the coral jewellery in the panic. The couple were rescued, the coral recovered, and the wedding went ahead the next day with a real photographer.",
  },

  /* 16 ----------------------------------------------------------------- Lagos */
  {
    id: "yacht",
    tier: 36,
    title: "The Ghost Yacht",
    hook: "A luxury yacht drifting off Lagos. Spotless. A chess game frozen mid-move. No crew.",
    region: { state: "Lagos", place: "Off the Lagos coast", music: "lagos" },
    categories: ["naija", "heists"],
    tags: ["Lagos", "Yacht", "Clockwork Club"],
    bounty: 2_400_000,
    inspecting: 74600,
    lead: LEAD.tolu,
    victim: "The yacht “Ayo's Pride” (owned by Chief Ayo Bankole)",
    briefing:
      "A fishing boat found the yacht “Ayo's Pride” drifting 10 km off Lagos at dawn: spotless, engines off, a chess game frozen mid-move, nobody aboard. The six crew turn up in Badagry after a “free beach party”. The captain's safe is open and the yacht's 1999 logbook is gone. The owner is Chief Ayo Bankole.",
    kit: {
      backdrop: { kind: "outdoor", sky: "day", ground: "deck", horizon: "sea" },
      props: [
        { kind: "safe", x: 16, y: 44, name: "Captain's safe" },
        { kind: "lifebuoy", x: 86, y: 38, name: "Lifebuoy" },
        { kind: "chair", x: 60, y: 60, color: "#f2f2e8", name: "Deck chair" },
        { kind: "chess", x: 40, y: 64, name: "Chess board" },
        { kind: "ladder", x: 88, y: 66, name: "Lifeboat ropes" },
        { kind: "paper", x: 62, y: 86, name: "Party invitation" },
      ],
    },
    clues: [
      { id: "chess", name: "Frozen chess game", icon: Castle, x: 40, y: 64, description: "A chess game stopped mid-move. The position makes no sense.", action: "Study the position", finding: "It isn't a real game. Read as a grid, the pieces spell 00:07, the Clockwork Club's signature.", suspectId: "dimeji" },
      { id: "safe", name: "Captain's safe", icon: LockOpen, x: 16, y: 44, description: "The safe that held the yacht's old logbooks. Open.", action: "Dust for prints", lab: { kind: "prints", shape: "finger" }, finding: "Prints belong to Captain Dimeji Lawson, a retired navy officer who captained this yacht in 1999, before Bankole bought it.", suspectId: "dimeji" },
      { id: "invite", name: "Party invitation", icon: Ticket, x: 62, y: 86, description: "An invitation left on the deck.", action: "Read the invitation", finding: "A free beach party in Badagry for the crew, “from the owner”, with a speedboat to take them. Chief Bankole never sent it.", suspectId: "dimeji" },
      { id: "ropes", name: "Lifeboat ropes", icon: Anchor, x: 88, y: 66, description: "The lifeboat is gone; its ropes hang loose.", action: "Check the ropes", finding: "Lowered properly, by someone who knew what they were doing. Steward Sunday Akpan steered it, as the crew's most sober member.", suspectId: "sunday" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "dimeji", name: "Capt. Dimeji Lawson", role: "Retired navy captain, Clockwork Club", face: { skin: "#4a2c17", hair: "#e6e6e6", hairStyle: "short", shirt: "#f2f2e8", bg: "#1d2a3a", acc: "cap", mood: "smile" }, motive: "Needed the yacht's 1999 logbook, which shows where it sailed on the night of the Mint robbery.", alibi: "Says he was fishing in Epe.", background: "Captained this yacht in 1999. Old friend of Pa Tunji.", quote: "The sea keeps records too, detective.", statements: [
        { id: "dim-1", text: "I haven't been on that yacht since 2000.", lie: { clueId: "safe", reveal: "I went aboard to fetch the truth in that logbook." } },
        { id: "dim-2", text: "I don't know anything about any party.", lie: { clueId: "invite", reveal: "The crew deserved a holiday. Bankole never gives them one." } },
        { id: "dim-3", text: "Check where this yacht sailed on New Year's Eve 1999.", press: "Lagos to Abuja's river jetty, then back with heavy cargo by New Year's Day. Ask who was on board." },
      ] },
      { id: "sunday", name: "Sunday Akpan", role: "Steward", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#f2f2e8", bg: "#1d2a3a", acc: "cap", mood: "worried" }, motive: "Left the yacht drifting.", alibi: "At the beach party with the crew.", background: "Has served on the yacht for eight years. Makes excellent zobo.", quote: "Free party! Who says no to a free party?", statements: [
        { id: "sun-1", text: "We all left on the lifeboat for the party.", press: "I steered. I was the only sober one." },
        { id: "sun-2", text: "Chief Bankole hates anybody touching that logbook.", press: "Even the captain. Locked in the safe, always." },
      ] },
      { id: "remi", name: "Skipper Remi Alade", role: "Current captain", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "short", shirt: "#1d2f5a", bg: "#1d2a3a", acc: "beard", mood: "flat" }, motive: "Should have been on board, and wasn't.", alibi: "Ashore in Victoria Island, “unwell”.", background: "Bankole's captain for five years. Very loyal. Very quiet.", quote: "I was sick. Very sick. Suddenly well now.", statements: [
        { id: "rem-1", text: "I was sick at home in Victoria Island.", press: "Pepper soup disagreed with me." },
        { id: "rem-2", text: "Chief told me never to open the old logbook.", press: "He said, “Some years are better forgotten.”" },
      ] },
    ],
    culpritId: "dimeji",
    solution:
      "Captain Dimeji Lawson of the Clockwork Club sent the crew to a free beach party, left the chess board spelling 00:07 and took the yacht's 1999 logbook. It shows “Ayo's Pride” carrying heavy cargo on New Year's Day 2000, with Ayo Bankole aboard. Evidence #4 for the Club.",
  },

  /* 17 ----------------------------------------------------------------- Oyo */
  {
    id: "ibadan-radio",
    tier: 37,
    title: "End of Transmission",
    hook: "Ibadan's favourite radio station goes silent mid-show. The console just says: END OF TRANSMISSION.",
    region: { state: "Oyo", place: "Ibadan", music: "fuji" },
    categories: ["naija", "cyber"],
    tags: ["Ibadan", "Radio", "Clockwork Club"],
    bounty: 2_200_000,
    inspecting: 81900,
    lead: LEAD.okafor,
    victim: "Oke-Ado FM (fictional), and host Baba Radio (found safe)",
    briefing:
      "At 08:07, mid-way through the morning show, Ibadan's biggest radio station cut to a crackly old recording: a man confessing that he drove a getaway car on New Year's Eve 1999 for “a big chief”. Then silence. The console read END OF TRANSMISSION. Host Ayinde “Baba Radio” Oladipo was found locked, unharmed, in the record archive.",
    kit: {
      backdrop: { kind: "indoor", decor: "studio", wall: "#1a1430", floor: "#2a2440", trim: "#7a3aff", window: "none" },
      castSide: "right",
      props: [
        { kind: "onair", x: 50, y: 9, name: "ON AIR sign" },
        { kind: "console", x: 50, y: 56, color: "#53FC18", name: "Console" },
        { kind: "mic", x: 22, y: 62, name: "Microphone" },
        { kind: "door", x: 88, y: 48, color: "#3a3346", name: "Archive door" },
        { kind: "crate", x: 16, y: 84, s: 0.8, name: "Tape crate" },
      ],
    },
    clues: [
      { id: "console", name: "Console", icon: Radio, x: 50, y: 56, description: "The broadcast desk, frozen on END OF TRANSMISSION.", action: "Pull the broadcast log", finding: "The confession tape played from a USB stick plugged in at 08:06, under the sound engineer's login: Kehinde “Knobs” Alabi.", suspectId: "kehinde" },
      { id: "tape", name: "Tape crate", icon: Archive, x: 16, y: 84, description: "A crate of old tapes, one box empty.", action: "Play the original tape", finding: "A 1999 tape of a driver named Waheed confessing he drove “Chief A.B.” away from the Abuja Mint at 00:15 on New Year's Day. Station manager Mrs. Taiwo Ogundipe catalogued it in 2000 as “Do not air”.", suspectId: "taiwo" },
      { id: "door", name: "Archive door", icon: DoorClosed, x: 88, y: 48, description: "The archive door, bolted from outside.", action: "Dust for prints", lab: { kind: "prints", shape: "finger" }, finding: "Prints on the bolt belong to Kehinde Alabi. Baba Radio was locked in gently, with a chair, a fan and a plate of amala.", suspectId: "kehinde" },
      { id: "mic", name: "Microphone", icon: Mic, x: 22, y: 62, description: "Baba Radio's microphone, switched off.", action: "Check the mic channel", finding: "Switched off from the console at 08:05, while Baba Radio was mid-sentence about the price of tomatoes. He was genuinely surprised.", suspectId: "ayinde" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "kehinde", name: "Kehinde “Knobs” Alabi", role: "Sound engineer, Clockwork Club", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#7a3aff", bg: "#2a1d3a", acc: "earring", mood: "smirk" }, motive: "Wanted all of Ibadan to hear the confession tape the station had hidden for 25 years.", alibi: "Says he was fixing a cable in the basement.", background: "Can fix any radio with a paperclip. A member of the Clockwork Club.", quote: "The truth was sitting in a box for 25 years. I just pressed play.", statements: [
        { id: "keh-1", text: "I was in the basement fixing a cable.", lie: { clueId: "console", reveal: "I pressed play. Somebody had to." } },
        { id: "keh-2", text: "I never touched the archive door.", lie: { clueId: "door", reveal: "I gave Baba Radio amala and a fan! It was a very comfortable… pause." } },
        { id: "keh-3", text: "Ask who hid that tape.", press: "Twenty-five years in a box marked “Do not air”." },
      ] },
      { id: "taiwo", name: "Mrs. Taiwo Ogundipe", role: "Station manager", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#1d6a8a", bg: "#1d2a3a", acc: "gele", accColor: "#1d6a8a", mood: "worried" }, motive: "Hid the confession tape for 25 years.", alibi: "In her office during the show.", background: "Has run the station for 26 years.", quote: "I was following orders! The owners said: never air that tape.", statements: [
        { id: "tai-1", text: "I'd never heard that tape before today.", lie: { clueId: "tape", reveal: "I catalogued it in 2000. One of the station's owners said it would “cause trouble”." } },
        { id: "tai-2", text: "Our owners never interfere with the news.", press: "Mostly. One very angry owner called me this morning. A chief from Lagos." },
      ] },
      { id: "ayinde", name: "Ayinde “Baba Radio” Oladipo", role: "Morning show host", face: { skin: "#4a2c17", hair: "#cfcfcf", hairStyle: "short", shirt: "#c9a34a", bg: "#3a2a1d", acc: "fila", accColor: "#c9a34a", mood: "smile" }, motive: "Ratings were falling, and the drama doubled them.", alibi: "Locked in the archive.", background: "Ibadan's favourite voice for 30 years. Loves tomatoes and gossip.", quote: "Best ratings of my life, and I was locked in a cupboard!", statements: [
        { id: "ayi-1", text: "Somebody bolted the door when I went to fetch an old record.", press: "They even left me amala. Very thoughtful." },
        { id: "ayi-2", text: "I knew nothing about the tape.", press: "1999? I was presenting the New Year countdown that night!" },
      ] },
    ],
    culpritId: "kehinde",
    solution:
      "Kehinde “Knobs” Alabi of the Clockwork Club locked Baba Radio in the archive with lunch and a fan, then played the hidden 1999 confession of Waheed, the getaway driver, to all of Ibadan. Evidence #5 for the Club. “Chief A.B.” has a lot of explaining to do.",
  },

  /* 18 ----------------------------------------------------------------- Plateau */
  {
    id: "jos-museum",
    tier: 38,
    title: "The Nok Head Vanishes",
    hook: "A priceless Nok terracotta head swapped at a Jos museum. No alarms. No break-in.",
    region: { state: "Plateau", place: "Jos", music: "plateau" },
    categories: ["naija", "heists"],
    tags: ["Jos", "Museum", "Heritage"],
    bounty: 2_600_000,
    inspecting: 56900,
    lead: LEAD.chidi,
    victim: "The Jos Heritage Museum (fictional) and its 2,000-year-old Nok head",
    briefing:
      "On Tuesday a visiting professor stopped in front of the Jos Heritage Museum's famous 2,000-year-old Nok terracotta head and frowned. Too smooth. Too orange. Tests showed it was a modern copy. The alarms never rang, because the real one may have been gone for weeks.",
    kit: {
      backdrop: { kind: "indoor", decor: "luxury", wall: "#2a2418", floor: "#4a3a2a", trim: "#c9a34a", window: "none" },
      props: [
        { kind: "cctv", x: 12, y: 9, name: "Gallery camera" },
        { kind: "pedestal", x: 50, y: 62, name: "Display pedestal" },
        { kind: "terracotta", x: 50, y: 48, s: 1.1, name: "Nok head" },
        { kind: "crate", x: 84, y: 80, name: "Shipping crate" },
        { kind: "paper", x: 42, y: 88, name: "Restoration log" },
      ],
    },
    clues: [
      { id: "head", name: "The Nok head", icon: ScanEye, x: 50, y: 48, description: "The terracotta head on display. Too perfect.", action: "Test the terracotta", finding: "Modern clay, fired last month, made from a 3D scan taken during “restoration” in March, signed off by the curator, Dr. Nanle Pam.", suspectId: "nanle" },
      { id: "log", name: "Restoration log", icon: ScrollText, x: 42, y: 88, description: "Pages torn from the restoration logbook.", action: "Reassemble the log", lab: { kind: "torn", style: "ledger", title: "RESTORATION LOG", lines: ["Item: Nok head #3", "Out: 2 March", "Back: 30 March", "Work: “cleaning”", "Signed: N. Pam", "Courier: Lagos", "Buyer ref: A.B."] }, finding: "The real head left for “cleaning” on 2 March and a copy came back on 30 March. A courier went to Lagos, with a buyer reference: A.B.", suspectId: "nanle" },
      { id: "crate", name: "Shipping crate", icon: Truck, x: 84, y: 80, description: "A crate with a Lagos courier label.", action: "Trace the crate", finding: "Delivered to a private warehouse in Ikoyi owned by AB Holdings: Chief Ayo Bankole's company.", suspectId: "bankole" },
      { id: "camera", name: "Gallery camera", icon: Cctv, x: 12, y: 9, description: "The camera watching the Nok gallery.", action: "Review the footage", finding: "The guard, Mr. Davou Choji, did every round. The only person near the head after hours in March was the curator, with the cameras “off for restoration”.", suspectId: "davou" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "nanle", name: "Dr. Nanle Pam", role: "Curator", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#0f4a3a", bg: "#1d3a2a", acc: "glasses", mood: "flat" }, motive: "Sold the real head to a private collector for ₦800 million.", alibi: "Says the head only went out for cleaning.", background: "The museum's star curator. Wrote the book on Nok terracottas.", quote: "I have given my life to protecting our heritage!", statements: [
        { id: "nan-1", text: "The head on the pedestal is the original.", lie: { clueId: "head", reveal: "It's a very good copy. For safety! The original is safe. Somewhere." } },
        { id: "nan-2", text: "The head never left the building.", lie: { clueId: "log", reveal: "It went for cleaning. In Lagos. For a month." } },
      ] },
      { id: "davou", name: "Mr. Davou Choji", role: "Museum guard", face: { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#1d2f5a", bg: "#1d2a3a", acc: "cap", mood: "worried" }, motive: "Was on duty every night it could have been swapped.", alibi: "Doing his rounds, as logged.", background: "Guards the museum and knows every exhibit's story.", quote: "I can tell you the story of every pot here. I didn't take one!", statements: [
        { id: "dav-1", text: "I did every round, every night.", press: "The log has my signature every hour." },
        { id: "dav-2", text: "The curator turned the cameras off in March.", press: "She said: “Restoration. Dust is bad for cameras.”" },
      ] },
      bankole("Private collector", "Collects rare African art for his private galleries.", "Says he has never set foot in Jos.", [
        { id: "bank-1", text: "I've never bought a Nok head.", lie: { clueId: "crate", reveal: "AB Holdings bought a… decorative item. A clay thing. Very decorative." } },
        { id: "bank-2", text: "My collection is all legal.", press: "Every piece has paperwork. Some paperwork." },
      ]),
    ],
    culpritId: "nanle",
    solution:
      "Curator Dr. Nanle Pam sent the real Nok head to Lagos for “cleaning”, had a copy made from a 3D scan, and sold the original to AB Holdings. It has been recovered from Bankole's Ikoyi warehouse and is home in Jos.",
  },

  /* 19 ----------------------------------------------------------------- Abuja */
  {
    id: "abuja-site",
    tier: 39,
    title: "The Vanished Crew",
    hook: "An Abuja building crew vanishes at midday. Lunchboxes still open. Cement still turning.",
    region: { state: "FCT", place: "Central Business District, Abuja", music: "abuja" },
    categories: ["naija", "heists"],
    tags: ["Abuja", "Building Site", "Clockwork Club"],
    bounty: 2_800_000,
    inspecting: 47100,
    lead: LEAD.bisi,
    victim: "Forty workers on the CBD Tower site (found safe), and the bank next door",
    briefing:
      "At 12:30 a building site in Abuja's Central Business District fell silent: forty workers gone, lunchboxes half-eaten, the cement mixer still turning. They're found at 16:00 at a buka in Wuse, happily eating amala, each paid a ₦50,000 “bonus” to take the afternoon off. Next door is Federal Trust Bank.",
    kit: {
      backdrop: { kind: "outdoor", sky: "day", ground: "dirt", horizon: "city" },
      props: [
        { kind: "crane", x: 22, y: 58, color: "#f5c518", name: "Crane" },
        { kind: "mixer", x: 70, y: 62, name: "Cement mixer" },
        { kind: "paper", x: 38, y: 72, name: "Pay envelope" },
        { kind: "lunchbox", x: 48, y: 86, color: "#c0182b", name: "Lunchbox" },
        { kind: "hardhat", x: 60, y: 80, name: "Hard hat" },
        { kind: "hole", x: 86, y: 80, name: "Shaft by the fence" },
      ],
    },
    clues: [
      { id: "envelope", name: "Pay envelope", icon: Banknote, x: 38, y: 72, description: "An empty “bonus” envelope blowing across the site.", action: "Count the bonuses", finding: "Forty envelopes of ₦50,000, handed out by foreman Ishaya Joseph at 12:25, “from the client”. The client sent no such money.", suspectId: "ishaya" },
      { id: "shaft", name: "Shaft by the fence", icon: Shovel, x: 86, y: 80, description: "A narrow shaft by the fence, covered with planks.", action: "Inspect the shaft", finding: "It runs into an old service tunnel under Federal Trust Bank, to a fresh hole into vault B-7's cable duct. A brass cog is fixed to the wall.", suspectId: "ishaya" },
      { id: "mixer", name: "Cement mixer", icon: Timer, x: 70, y: 62, description: "Still turning on its own.", action: "Check the timer", finding: "Left running on a timer so the site would sound busy from the road. The timer is crane operator Blessing's, but it was set with the foreman's site PIN.", suspectId: "blessing" },
      { id: "hardhat", name: "Muddy hard hat", icon: HardHat, x: 60, y: 80, description: "A hard hat with deep red mud inside.", action: "Dust for prints", lab: { kind: "prints", shape: "finger" }, finding: "The mud comes from deep underground. The prints belong to foreman Ishaya Joseph.", suspectId: "ishaya" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "ishaya", name: "Foreman Ishaya Joseph", role: "Site foreman, Clockwork Club", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#f5c518", bg: "#2a2a1a", acc: "cap", mood: "smile" }, motive: "Needed four quiet hours to finish the Clockwork Club's backup tunnel under the bank.", alibi: "Says he was buying cement in Kubwa.", background: "Builds roads, bridges and secret tunnels. The Club's digger.", quote: "Nobody lost a naira. They got paid AND fed!", statements: [
        { id: "ish-1", text: "I was buying cement in Kubwa all afternoon.", lie: { clueId: "hardhat", reveal: "I was underground. Digging for justice." } },
        { id: "ish-2", text: "That bonus came from the client.", lie: { clueId: "envelope", reveal: "Pa Tunji's friends paid it. The men deserved a long lunch." } },
        { id: "ish-3", text: "Vault B-7 is already empty, you know.", press: "We dug a backup plan. Bitrus got there first with the clock." },
      ] },
      { id: "mustapha", name: "Alhaji Mustapha", role: "Site owner", face: { skin: "#4a2c17", hair: "#e6e6e6", hairStyle: "short", shirt: "#e8e0d0", bg: "#2a2a1a", acc: "fila", accColor: "#e8e0d0", mood: "worried" }, motive: "Behind schedule and over budget.", alibi: "In meetings at his office in Garki.", background: "Has built a dozen towers in Abuja. Hates delays.", quote: "Four hours lost! Do you know how much four hours cost?", statements: [
        { id: "mus-1", text: "I sent no bonus to anybody.", press: "A bonus? In this economy?" },
        { id: "mus-2", text: "Foreman Ishaya asked about the bank's old tunnels last month.", press: "He said it was for drainage. Drainage!" },
      ] },
      { id: "blessing", name: "Blessing Eke", role: "Crane operator", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#ff7a1a", bg: "#3a2a1d", acc: "cap", mood: "smile" }, motive: "Her timer kept the mixer running.", alibi: "At the buka with the crew.", background: "The only crane operator in Abuja who never drops a load.", quote: "My timer, yes! But I didn't set it. I was eating amala!", statements: [
        { id: "ble-1", text: "The foreman borrowed my timer in the morning.", press: "He said, “For the cement, small time.”" },
        { id: "ble-2", text: "I was at the buka from one o'clock.", press: "Two wraps of amala and gbegiri. No regrets." },
      ] },
    ],
    culpritId: "ishaya",
    solution:
      "Foreman Ishaya Joseph of the Clockwork Club paid his crew a long lunch so he could finish a backup tunnel to vault B-7, in case Bitrus's plan failed. Nobody was hurt, and the bank has finally changed its engineer override. The Club's evidence is complete. All that's left is to bring it to Lagos.",
  },

  /* 20 ----------------------------------------------------------------- Lagos: finale */
  {
    id: "cinema",
    tier: 40,
    gate: 12,
    title: "The Final Screening",
    hook: "A lone moviegoer found lifeless in a Lagos cinema. On screen: only static.",
    region: { state: "Lagos", place: "Ikeja", music: "lagos" },
    categories: ["naija"],
    tags: ["Lagos", "Finale", "The Truth"],
    bounty: 10_000_000,
    inspecting: 128400,
    lead: LEAD.bisi,
    victim: "Pa Tunji Aremu, 74, “Baba Aago” (revived in the ambulance)",
    briefing:
      "Midnight, Screen 3, a Lagos cinema, showing an old 1999 newsreel. When the usher checked, the only patron was slumped in his seat, the screen hissing static. He was revived in the ambulance: Pa Tunji Aremu, Baba Aago himself. In his pocket, every piece of evidence the Clockwork Club gathered. Somebody wanted him silent before the reel ended.",
    kit: {
      backdrop: { kind: "indoor", decor: "studio", wall: "#0b0e0f", floor: "#1a1420", trim: "#c0182b", window: "none" },
      props: [
        { kind: "screen", x: 50, y: 26, name: "Static screen" },
        { kind: "projector", x: 88, y: 10, s: 0.8, name: "Projector booth" },
        { kind: "seats", x: 52, y: 68, color: "#7a1f2a", name: "Cinema seats" },
        { kind: "popcorn", x: 42, y: 86, name: "Popcorn" },
        { kind: "paper", x: 58, y: 88, name: "Ticket stub" },
        { kind: "cup", x: 72, y: 88, color: "#c0182b", name: "Soda cup" },
      ],
    },
    clues: [
      { id: "soda", name: "Soda cup", icon: CupSoda, x: 72, y: 88, description: "A soda cup on the floor by Pa Tunji's seat.", action: "Analyze the soda", finding: "The same sleeping-herb family as the Abuja dinner, but ten times stronger: enough to stop an old man's heart. It was bought with a VIP card in the name of Chief Ayo Bankole.", suspectId: "bankole" },
      { id: "projector", name: "Projector", icon: Projector, x: 88, y: 10, description: "The projector booth above the seats.", action: "Check the reel", finding: "The film was cut at the exact frame showing a young man in a red fila beside the Mint's cash truck in 1999. Projectionist Ugonna admits a “big man” paid him ₦1 million to cut it.", suspectId: "ugonna" },
      { id: "stub", name: "Ticket stubs", icon: Ticket, x: 58, y: 88, description: "Torn ticket stubs under the seats.", action: "Reassemble the stubs", lab: { kind: "torn", style: "ledger", title: "SCREEN 3 · 00:00", lines: ["MILLENNIUM MINT:", "THE NEWSREEL", "Seat F7: 1 adult", "Seat F9: VIP", "Card: A. BANKOLE", "Paid: ₦25,000", "Snacks: 1 soda"] }, finding: "Two tickets, not one: seat F7 for Pa Tunji, and seat F9, VIP, paid with Chief Ayo Bankole's card, with one soda.", suspectId: "bankole" },
      { id: "popcorn", name: "Popcorn tub", icon: Popcorn, x: 42, y: 86, description: "An untouched tub of popcorn on seat F9.", action: "Dust for prints", lab: { kind: "prints", shape: "finger" }, finding: "Prints belong to Peju the ticket seller, who served it. A second set on the lid: Bankole's.", suspectId: "peju" },
    ],
    requiredClues: 3,
    suspects: [
      bankole("Investor and philanthropist", "The newsreel and the Club's evidence prove he robbed the Millennium Mint in 1999 and let Pa Tunji take the blame.", "Says he was at home in Ikoyi.", [
        { id: "bank-1", text: "I was at home in Ikoyi all night.", lie: { clueId: "stub", reveal: "I went to the cinema. Is watching a film a crime? Old films. For nostalgia." } },
        { id: "bank-2", text: "I never bought anything for that old man.", lie: { clueId: "soda", reveal: "A soda! I bought a soda! It's a cinema!" } },
        { id: "bank-3", text: "I had nothing to do with the Millennium Mint.", lie: { clueId: "projector", reveal: "…I paid the boy to cut the film. That frame proves nothing! Many men wear red filas!" } },
      ]),
      { id: "ugonna", name: "Ugonna", role: "Projectionist", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "short", shirt: "#1a1a1a", bg: "#1a1f2a", acc: "glasses", mood: "worried" }, motive: "Was paid ₦1 million to cut the film.", alibi: "In the projection booth, then outside “on break”.", background: "Student by day, projectionist by night. Loves old films.", quote: "I cut the film, I didn't touch the old man! I swear!", statements: [
        { id: "ugo-1", text: "Nobody paid me anything.", lie: { clueId: "projector", reveal: "₦1 million! He said it was a “private screening request”!" } },
        { id: "ugo-2", text: "A man in a red fila sat two seats from the old man.", press: "Old money. Didn't touch his popcorn." },
      ] },
      { id: "peju", name: "Peju", role: "Ticket seller", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#c0182b", bg: "#3a1d1d", acc: "earring", mood: "smile" }, motive: "Sold the tickets and the snacks.", alibi: "At the ticket counter all night.", background: "Knows every regular. Pa Tunji came every Friday.", quote: "I sell tickets and popcorn. That's my whole life.", statements: [
        { id: "pej-1", text: "I sold two tickets for Screen 3 tonight.", press: "One for Pa Tunji, one for a VIP with a gold card." },
        { id: "pej-2", text: "Pa Tunji always said the truth would show on this screen one day.", press: "Every Friday. I thought it was an old man's joke." },
      ] },
    ],
    culpritId: "bankole",
    solution:
      "Chief Ayo Bankole followed Pa Tunji to the midnight newsreel, paid the projectionist to cut the frame showing him at the Mint truck, and poisoned the old man's soda. Pa Tunji survived. With the Kano ledger, the time-lock log, the AB Holdings letter, the yacht's logbook and the confession tape, the case is closed: Bankole robbed the Millennium Mint in 1999 and let a watchmaker take the blame. Pa Tunji Aremu is a free and innocent man. The clock has finally stopped ticking.",
  },
];
