import {
  Banknote,
  BookOpen,
  Camera,
  Cctv,
  Coins,
  Droplets,
  Fingerprint,
  Flame,
  Footprints,
  Gauge,
  KeyRound,
  LockOpen,
  Package,
  Printer,
  Receipt,
  ScrollText,
  Shirt,
  Smartphone,
  Ticket,
  Truck,
  Wallet,
} from "lucide-react";
import type { CrimeCase, Face } from "../types";

/** City cases: Ibadan, Abeokuta and Benin City. */

const KUNLE: Face = { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "short", shirt: "#8a3a1a", bg: "#e7e9ed", acc: "fila", accColor: "#8a3a1a", mood: "smile" };
const FUNKE: Face = { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#3a5a8a", bg: "#e7e9ed", acc: "glasses", mood: "smile" };
const OSARO: Face = { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#8a1a2a", bg: "#e7e9ed", acc: "cap", mood: "smirk" };

const LEAD = {
  ibadan: { name: "Insp. Kunle Ajayi", face: KUNLE },
  abeokuta: { name: "Insp. Funke Sowemimo", face: FUNKE },
  benin: { name: "Insp. Osaro Igbinedion", face: OSARO },
};

const IBADAN = (place: string) => ({ state: "Oyo", place, music: "fuji" as const });
const ABEOKUTA = (place: string) => ({ state: "Ogun", place, music: "juju" as const });
const BENIN = (place: string) => ({ state: "Edo", place, music: "benin" as const });

export const CITY_CASES_WEST: CrimeCase[] = [
  /* ================================================================ IBADAN */
  {
    id: "iba-mokola",
    tier: 50,
    title: "The Mokola Roundabout POS",
    hook: "A POS agent at Mokola roundabout says gunmen took his ₦3.2M float. Nobody else at the busy roundabout saw a thing.",
    region: IBADAN("Mokola roundabout"),
    categories: ["cyber", "alley"],
    tags: ["Ibadan", "Mokola", "POS"],
    bounty: 360_000,
    inspecting: 27400,
    lead: LEAD.ibadan,
    victim: "Seun Ogundele's POS stand (₦3.2M float)",
    briefing:
      "At 19:05 Seun Ogundele ran into Mokola police post shouting that two men with guns took his whole float. Mokola roundabout is never quiet at seven, yet the pepper seller next to him heard nothing, and the keke rider who “chased the robbers” can't describe them.",
    kit: {
      backdrop: { kind: "outdoor", sky: "dusk", ground: "road", horizon: "city" },
      castSide: "right",
      props: [
        { kind: "sign", x: 50, y: 12, label: "MOKOLA", color: "#8a3a1a" },
        { kind: "kiosk", x: 40, y: 54, label: "POS", color: "#1d4a8a", name: "POS stand" },
        { kind: "umbrella", x: 18, y: 50, color: "#c0182b", name: "Pepper seller's umbrella" },
        { kind: "keke", x: 76, y: 60, color: "#f5c518", name: "Taofeek's keke" },
        { kind: "phone", x: 40, y: 62, name: "POS terminal" },
        { kind: "paper", x: 28, y: 84, name: "Betting slip" },
        { kind: "cctv", x: 88, y: 22, name: "Bank camera" },
        { kind: "okada", x: 62, y: 78, name: "Parked okada" },
      ],
    },
    clues: [
      { id: "terminal", name: "POS terminal", icon: Smartphone, x: 40, y: 62, description: "The POS terminal's day history.", action: "Print the transaction history", finding: "Between 14:00 and 18:30 Seun sent ₦2.9M in small transfers to the same account: a sports-betting wallet in his own name.", suspectId: "seun" },
      { id: "camera", name: "Bank camera", icon: Cctv, x: 88, y: 22, description: "The bank across the road films the roundabout all day.", action: "Pull the 19:00 footage", finding: "No gunmen. At 19:01 Seun calmly zips his empty bag, looks around, then starts running and shouting.", suspectId: "seun" },
      { id: "slip", name: "Betting slip", icon: Ticket, x: 28, y: 84, description: "A crumpled betting slip near the stand.", action: "Rebuild the slip", lab: { kind: "torn", style: "ledger", title: "BET SLIP #88214", lines: ["Customer: S. Ogundele", "10-team accumulator", "Stake: N2,900,000", "Status: LOST", "Last game: 18:45", "Arsenal 1 - 2 Fulham", "Better luck next time"] }, finding: "Seun staked ₦2.9M of his float on one accumulator. It lost at 18:45, twenty minutes before the “robbery”.", suspectId: "seun" },
      { id: "keke", name: "Taofeek's keke", icon: Truck, x: 76, y: 60, description: "The keke rider says he chased the gunmen towards Sango.", action: "Check the keke's route", finding: "Taofeek's phone shows him parked at the roundabout the whole time. He never chased anybody; he just wanted to sound brave on the radio.", suspectId: "taofeek" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "seun", name: "Seun Ogundele", role: "POS agent", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "short", shirt: "#1d4a8a", bg: "#e7e9ed", acc: "cap", mood: "worried" }, motive: "Lost his boss's float on betting and needed a story.", alibi: "Says he was robbed at gunpoint at 19:05.", background: "Runs the stand for a businessman who owns ten POS points.", quote: "Dem point gun for my head! I almost die!", statements: [
        { id: "seu-1", text: "Two men with guns took everything.", lie: { clueId: "camera", reveal: "There were no gunmen. I panicked." } },
        { id: "seu-2", text: "I don't bet. I'm a serious young man.", lie: { clueId: "slip", reveal: "One accumulator. It was supposed to fix everything. Fulham scored at the end." } },
      ] },
      { id: "taofeek", name: "Taofeek Lasisi", role: "Keke rider", face: { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#f5c518", bg: "#e7e9ed", mood: "smirk" }, motive: "Claimed to chase armed men. Why lie?", alibi: "At the roundabout waiting for passengers.", background: "Talks on local radio phone-ins about everything.", quote: "I pursue dem like film!", statements: [
        { id: "tao-1", text: "I chased them all the way to Sango.", lie: { clueId: "keke", reveal: "Okay, I didn't move. I just wanted to be in the gist." } },
      ] },
      { id: "mama", name: "Mama Nkechi", role: "Pepper seller", face: { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "bun", shirt: "#c0182b", bg: "#e7e9ed", acc: "gele", accColor: "#3a8a4a", mood: "flat" }, motive: "Shares the corner and the customers with Seun.", alibi: "Selling pepper three metres away.", background: "Has sold pepper at Mokola for twenty years.", quote: "Gun? For Mokola? I would have heard am!", statements: [
        { id: "mam-1", text: "Seun was on his phone shouting at a football match.", press: "Around quarter to seven. He threw his phone on the table." },
      ] },
    ],
    culpritId: "seun",
    solution:
      "POS agent Seun Ogundele bet ₦2.9M of his boss's float on one accumulator. When it lost at 18:45 he faked an armed robbery at 19:05. The bank camera showed no gunmen, the terminal showed the transfers to his betting wallet, and the slip showed the losing bet.",
  },
  {
    id: "iba-dugbe",
    tier: 51,
    title: "Night Fire at Dugbe",
    hook: "A provision shop in Dugbe market burns in the night. The owner blames the generator and claims ₦12M insurance.",
    region: IBADAN("Dugbe market"),
    categories: ["heists"],
    tags: ["Ibadan", "Dugbe", "Fire"],
    bounty: 420_000,
    inspecting: 23900,
    lead: LEAD.ibadan,
    victim: "Kamoru Provisions (and its insurer)",
    briefing:
      "The fire started around 2 a.m. and was put out before it spread. Alhaji Kamoru says his generator caught fire and destroyed ₦12M of stock. The fire service found very few burnt cartons for a shop that size.",
    kit: {
      backdrop: { kind: "indoor", decor: "warehouse", wall: "#4a4038", floor: "#5a5550", trim: "#3a3330", window: "none" },
      castSide: "left",
      props: [
        { kind: "scorch", x: 74, y: 30, name: "Burn mark" },
        { kind: "generator", x: 22, y: 62, name: "Generator" },
        { kind: "crate", x: 54, y: 62, label: "PROVISIONS", name: "Burnt carton" },
        { kind: "cabinet", x: 86, y: 54, color: "#3a3330", name: "Empty shelf" },
        { kind: "drum", x: 66, y: 76, name: "Jerrycan" },
        { kind: "paper", x: 36, y: 86, name: "Truck receipt" },
        { kind: "sack", x: 46, y: 76 },
      ],
    },
    clues: [
      { id: "gen", name: "Generator", icon: Gauge, x: 22, y: 62, description: "Blackened outside, but…", action: "Open the generator", finding: "The fuel tank is bone dry and the spark plug was removed days ago. This generator could not have started a fire last night.", suspectId: "kamoru" },
      { id: "burn", name: "Burn mark", icon: Flame, x: 74, y: 30, description: "The worst burning is at the back wall, far from the generator.", action: "Test the burn pattern", finding: "A pool burn: petrol poured along the back wall. The fire started there, not at the generator.", suspectId: "kamoru" },
      { id: "receipt", name: "Truck receipt", icon: Receipt, x: 36, y: 86, description: "A truck-hire receipt, half burnt.", action: "Rebuild the receipt", lab: { kind: "torn", style: "ledger", title: "OKE-ADO TRUCK HIRE", lines: ["Hirer: Alh. Kamoru", "Pickup: Dugbe mkt", "Drop: warehouse, Apata", "Load: 300 cartons", "Date: yesterday", "Time: 21:00", "Paid in cash"] }, finding: "The night before the fire, Kamoru hired a truck to move 300 cartons from his shop to a warehouse in Apata.", suspectId: "kamoru" },
      { id: "jerry", name: "Jerrycan", icon: Droplets, x: 66, y: 76, description: "A jerrycan that smells of petrol.", action: "Dust the handle", lab: { kind: "prints", shape: "finger" }, finding: "Prints of Sunday, the generator repairman, who says he filled it for Kamoru two days ago. The repair book agrees.", suspectId: "sunday" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "kamoru", name: "Alhaji Kamoru Adisa", role: "Shop owner", face: { skin: "#4a2c17", hair: "#cfcfcf", hairStyle: "short", shirt: "#f2f2e8", bg: "#e7e9ed", acc: "fila", accColor: "#8a3a1a", mood: "worried" }, motive: "₦12M insurance and a shop that wasn't making money.", alibi: "At home in Bodija, asleep.", background: "Business slow for two years. Owes the bank.", quote: "My whole life is in that shop!", statements: [
        { id: "kam-1", text: "The generator caught fire. It's always giving trouble.", lie: { clueId: "gen", reveal: "The generator has been dead for a week… I know." } },
        { id: "kam-2", text: "All my stock was inside.", lie: { clueId: "receipt", reveal: "I moved it to Apata. I was going to sell it again after the insurance paid." } },
      ] },
      { id: "sunday", name: "Sunday Okon", role: "Generator repairman", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#3a3330", bg: "#e7e9ed", acc: "cap", mood: "flat" }, motive: "Could be blamed for a faulty repair.", alibi: "At a church vigil until 4 a.m.", background: "Fixes half the generators in Dugbe.", quote: "That generator? I removed the plug myself. It was dead!", statements: [
        { id: "sun-1", text: "I took out the spark plug last week. That generator can't run.", press: "Kamoru said he'd buy a new one. He never did." },
      ] },
      { id: "bisi", name: "Iya Bisi", role: "Neighbouring shop owner", face: { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "bun", shirt: "#3a8a4a", bg: "#e7e9ed", acc: "gele", accColor: "#c0182b", mood: "smirk" }, motive: "Long-running rivalry with Kamoru over customers.", alibi: "At home; her son called her about the fire.", background: "Sells the same goods two shops down. Very, very loud.", quote: "If I burn his shop, my own go burn too! Am I mad?", statements: [
        { id: "bis-1", text: "I saw a big truck at his shop last night.", press: "Around nine. Loading carton, carton, carton." },
      ] },
    ],
    culpritId: "kamoru",
    solution:
      "Alhaji Kamoru moved 300 cartons of stock to a warehouse in Apata the night before, then poured petrol along his back wall and set the shop on fire to claim ₦12M insurance, blaming a generator that had been dead for a week. The burn pattern, the dry generator and the truck receipt ended the scam.",
  },
  {
    id: "iba-cocoa",
    tier: 52,
    title: "The Cocoa House Office Heist",
    hook: "During a power cut, land title documents worth billions vanish from a law office on the 20th floor of Cocoa House.",
    region: IBADAN("Cocoa House, Dugbe"),
    categories: ["vip", "heists"],
    tags: ["Ibadan", "Cocoa House", "VIP"],
    bounty: 1_700_000,
    inspecting: 44600,
    lead: LEAD.ibadan,
    victim: "Barr. Olawale Oyewole's chambers",
    briefing:
      "The Oyewole chambers keep the original title documents for a disputed estate in their safe. During a 40-minute outage the building's lifts were dead and the staircase was guarded. When power returned, the safe was open and the documents gone.",
    kit: {
      backdrop: { kind: "indoor", wall: "#d9d2c4", floor: "#6a4a2a", trim: "#8a3a1a", window: "city-day" },
      castSide: "right",
      props: [
        { kind: "safe", x: 16, y: 40, name: "Office safe" },
        { kind: "desk", x: 50, y: 64, color: "#5a3a1a", name: "Lawyer's desk" },
        { kind: "lamp", x: 42, y: 58 },
        { kind: "cabinet", x: 84, y: 54, name: "Filing cabinet" },
        { kind: "crate", x: 70, y: 80, label: "LIFT TOOLS", name: "Lift toolbox" },
        { kind: "paper", x: 30, y: 84, name: "Lift log" },
        { kind: "door", x: 92, y: 66, color: "#5a3a1a", name: "Office door" },
      ],
    },
    clues: [
      { id: "safe", name: "Office safe", icon: LockOpen, x: 16, y: 40, description: "Opened with the right code, not forced.", action: "Dust the keypad", lab: { kind: "prints", shape: "finger" }, finding: "Smudged prints in grease, the kind of black grease used on lift cables. Nobody in the office uses it.", suspectId: "taiwo" },
      { id: "lifelog", name: "Lift log", icon: ScrollText, x: 30, y: 84, description: "The lift company's printed log.", action: "Read the log", finding: "During the outage the service lift moved once, on emergency battery, to floor 20. It needs a technician's key. Only technician Taiwo had it.", suspectId: "taiwo" },
      { id: "tools", name: "Lift toolbox", icon: KeyRound, x: 70, y: 80, description: "Taiwo's toolbox, left in the corridor.", action: "Search the toolbox", finding: "Under the spanners: a sticky note with the safe code, in the secretary's handwriting, and a photocopy of the estate's survey plan.", suspectId: "taiwo" },
      { id: "cabinet", name: "Filing cabinet", icon: BookOpen, x: 84, y: 54, description: "The secretary's filing cabinet.", action: "Check her diary", finding: "Secretary Bimpe wrote the safe code in her diary, which she leaves on her desk. Careless, but she was downstairs at the bank all afternoon.", suspectId: "bimpe" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "taiwo", name: "Taiwo Akinola", role: "Lift technician", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "short", shirt: "#2b3440", bg: "#e7e9ed", acc: "cap", mood: "flat" }, motive: "Paid by the rival family in the estate dispute.", alibi: "Stuck in the plant room in the basement, he says.", background: "Has serviced Cocoa House lifts for nine years.", quote: "Lifts were dead. How would I even go up?", statements: [
        { id: "tai-1", text: "I was in the basement plant room all through the outage.", lie: { clueId: "lifelog", reveal: "I took the service lift up on battery. Ten minutes, in and out." } },
        { id: "tai-2", text: "I've never been inside that office.", lie: { clueId: "safe", reveal: "The grease is mine. I copied the code from her diary when I serviced the AC last month." } },
      ] },
      { id: "bimpe", name: "Bimpe Adesina", role: "Secretary", face: { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "long", shirt: "#8a3a1a", bg: "#e7e9ed", acc: "earring", mood: "worried" }, motive: "Knows the safe code.", alibi: "At the bank downstairs from 14:00 to 16:00.", background: "Twelve years with the chambers.", quote: "I wrote the code down so I wouldn't forget it. That's all!", statements: [
        { id: "bim-1", text: "Taiwo came to fix the AC last month and sat at my desk.", press: "He said he needed to plug his drill. My diary was right there." },
      ] },
      { id: "dapo", name: "Dapo Adeleke", role: "Heir from the rival family", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "slick", shirt: "#1d4a8a", bg: "#e7e9ed", acc: "shades", mood: "smirk" }, motive: "Without the originals, his family's claim gets stronger.", alibi: "In court in Ibadan all afternoon.", background: "Wealthy, confident and very interested in the estate.", quote: "I'll win in court. I don't need to steal papers.", statements: [
        { id: "dap-1", text: "I was in court all afternoon.", press: "Court registry, judge, twenty lawyers. Check." },
      ] },
    ],
    culpritId: "taiwo",
    solution:
      "Lift technician Taiwo Akinola had copied the safe code from the secretary's diary while fixing the office AC. During the outage he rode the service lift up on battery power with his technician's key, opened the safe and took the title deeds for a rival family. His cable grease on the keypad and the lift log gave him away.",
  },

  /* ================================================================ ABEOKUTA */
  {
    id: "abk-adire",
    tier: 53,
    title: "The Itoku Adire Swap",
    hook: "A master dyer's hand-made adire is quietly swapped for cheap factory prints in her own stall at Itoku market.",
    region: ABEOKUTA("Itoku adire market"),
    categories: ["alley"],
    tags: ["Abeokuta", "Itoku", "Adire"],
    bounty: 320_000,
    inspecting: 19600,
    lead: LEAD.abeokuta,
    victim: "Mama Toyin Adebiyi, master adire dyer",
    briefing:
      "Mama Toyin's hand-dyed adire sells for five times the price of factory prints. Three customers came back angry: the “hand-made” cloth they bought faded in one wash. Someone has been swapping her cloth for factory copies and selling the real thing.",
    kit: {
      backdrop: { kind: "outdoor", sky: "day", ground: "dirt", horizon: "rocks" },
      castSide: "right",
      props: [
        { kind: "adire", x: 32, y: 48, name: "Mama Toyin's line" },
        { kind: "adire", x: 72, y: 46 },
        { kind: "dyepit", x: 50, y: 70, name: "Indigo pot" },
        { kind: "stall", x: 20, y: 62, color: "#3a5a8a", name: "Mama Toyin's stall" },
        { kind: "sack", x: 78, y: 70, name: "Factory-print bale" },
        { kind: "phone", x: 36, y: 84, name: "Middleman's phone" },
        { kind: "keke", x: 88, y: 60, color: "#2f8a3a", name: "Delivery keke" },
      ],
    },
    clues: [
      { id: "bale", name: "Factory-print bale", icon: Package, x: 78, y: 70, description: "A bale of printed “adire” hidden behind the stall.", action: "Check the bale's label", finding: "Printed in a textile factory in Kano. The delivery tag says it was ordered by D. Ogunleye, Mama Toyin's middleman Dele.", suspectId: "dele" },
      { id: "pot", name: "Indigo pot", icon: Droplets, x: 50, y: 70, description: "Mama Toyin's indigo, made from leaves the old way.", action: "Test the dye", finding: "Real indigo. The faded cloth customers returned has no indigo at all: chemical dye. Proof of the swap.", suspectId: "toyin" },
      { id: "phone", name: "Middleman's phone", icon: Smartphone, x: 36, y: 84, description: "Dele's phone, left on a stool.", action: "Read the messages", finding: "To a Lagos boutique: “Real Abeokuta hand-made adire, 50 pieces, ₦18k each. Same as last month.”", suspectId: "dele" },
      { id: "keke", name: "Delivery keke", icon: Truck, x: 88, y: 60, description: "The keke that delivers for the cooperative.", action: "Check its log", finding: "Driven by Ronke, the apprentice, but her runs match the stall's honest sales book exactly.", suspectId: "ronke" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "dele", name: "Dele Ogunleye", role: "Middleman", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "short", shirt: "#3a5a8a", bg: "#e7e9ed", acc: "fila", accColor: "#1b2a6b", mood: "smirk" }, motive: "Sells real adire to Lagos boutiques, keeps the cheap copies at the stall.", alibi: "Says he only collects Mama's money at closing time.", background: "Handles Mama Toyin's bulk orders.", quote: "Me? I respect Mama like my own mother!", statements: [
        { id: "del-1", text: "I've never ordered factory cloth in my life.", lie: { clueId: "bale", reveal: "One bale… maybe two. Lagos people pay well for the real thing." } },
        { id: "del-2", text: "I don't sell to Lagos.", lie: { clueId: "phone", reveal: "Fine, I sell to Lagos. The boutique pays three times." } },
      ] },
      { id: "ronke", name: "Ronke Adebiyi", role: "Apprentice", face: { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "bun", shirt: "#1b2a6b", bg: "#e7e9ed", acc: "gele", accColor: "#1b2a6b", mood: "worried" }, motive: "Handles the stall when Mama is at the pots.", alibi: "Delivering orders on the keke.", background: "Mama Toyin's niece. Learning the craft.", quote: "I dye with my own hands. Look at my nails!", statements: [
        { id: "ron-1", text: "Dele brings bales and says they're for storage.", press: "He told me not to open them. I didn't." },
      ] },
      { id: "toyin", name: "Mama Toyin Adebiyi", role: "Master dyer", face: { skin: "#4a2c17", hair: "#cfcfcf", hairStyle: "bun", shirt: "#1b2a6b", bg: "#e7e9ed", acc: "gele", accColor: "#3a5a8a", mood: "flat" }, motive: "Could be blaming others for her own cheap stock.", alibi: "At her pots behind the market.", background: "Forty years of hand-dyed adire.", quote: "My indigo does not fade. Never!", statements: [
        { id: "toy-1", text: "I trust Dele with the selling.", press: "He's been with me five years. Or he was." },
      ] },
    ],
    culpritId: "dele",
    solution:
      "Middleman Dele Ogunleye ordered cheap factory prints, slipped them onto Mama Toyin's stall as “hand-made” and sold her real indigo adire to Lagos boutiques at three times the price. The factory bale in his name and his messages to the boutique exposed him.",
  },
  {
    id: "abk-olumo",
    tier: 54,
    title: "The Olumo Rock Cash Bag",
    hook: "A tour company's bag of entry fees vanishes halfway up Olumo Rock, between the lift and the viewpoint.",
    region: ABEOKUTA("Olumo Rock"),
    categories: ["heists"],
    tags: ["Abeokuta", "Olumo Rock", "Tourists"],
    bounty: 400_000,
    inspecting: 22800,
    lead: LEAD.abeokuta,
    victim: "Rock City Tours (₦900k in entry fees)",
    briefing:
      "A school excursion paid ₦900k in cash. The tour leader put the bag down at the viewpoint for a group photo. One photo, one minute, and the bag was gone. A smiling young man who called himself a guide had been helping all morning.",
    kit: {
      backdrop: { kind: "outdoor", sky: "day", ground: "dirt", horizon: "rocks" },
      castSide: "left",
      props: [
        { kind: "sign", x: 50, y: 14, label: "OLUMO ROCK", color: "#3a5a8a" },
        { kind: "boulder", x: 22, y: 50, s: 1.4 },
        { kind: "boulder", x: 82, y: 48, s: 1.2 },
        { kind: "ladder", x: 64, y: 54, name: "Rock steps" },
        { kind: "bench", x: 40, y: 68, name: "Viewpoint bench" },
        { kind: "camera", x: 30, y: 82, name: "Tour camera" },
        { kind: "paper", x: 56, y: 86, name: "Guide's badge" },
        { kind: "luggage", x: 78, y: 76, name: "Abandoned bag" },
      ],
    },
    clues: [
      { id: "photo", name: "Tour camera", icon: Camera, x: 30, y: 82, description: "The group photo taken at the moment the bag vanished.", action: "Zoom into the photo", finding: "Behind the children, the “guide” in a green cap bends down by the bench with the bag. He is the only adult not looking at the camera.", suspectId: "kunle" },
      { id: "badge", name: "Guide's badge", icon: Ticket, x: 56, y: 86, description: "A guide badge dropped by the steps.", action: "Check the badge", finding: "Fake. Real Olumo guides carry numbered state badges. This one was printed at a shop in Kuto. The name on it: Kunle.", suspectId: "kunle" },
      { id: "bag", name: "Abandoned bag", icon: Wallet, x: 78, y: 76, description: "The tour bag, empty, stuffed behind a boulder.", action: "Dust the bag", lab: { kind: "prints", shape: "finger" }, finding: "Prints of the tour leader and of Kunle, the fake guide.", suspectId: "kunle" },
      { id: "steps", name: "Rock steps", icon: Footprints, x: 64, y: 54, description: "The steps down from the viewpoint.", action: "Ask the lift operator", finding: "Biodun at the lift saw the tour leader go up and come down with everyone. She never left the group. She's in the clear.", suspectId: "amaka" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "kunle", name: "“Kunle” (no surname given)", role: "Self-styled tour guide", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "short", shirt: "#3a8a4a", bg: "#e7e9ed", acc: "cap", mood: "smile" }, motive: "Works the rock, “helping” tourists with full pockets.", alibi: "Says he left before the photo.", background: "Nobody at the rock knows his real name.", quote: "I was only helping the children climb!", statements: [
        { id: "kun-1", text: "I'm a licensed guide.", lie: { clueId: "badge", reveal: "The badge is… homemade. But I know the rock better than anybody!" } },
        { id: "kun-2", text: "I left before the photo.", lie: { clueId: "photo", reveal: "I was in the photo. I took the bag. The money is in my cap." } },
      ] },
      { id: "amaka", name: "Mrs. Amaka Obi", role: "Tour leader", face: { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "bun", shirt: "#c0182b", bg: "#e7e9ed", acc: "glasses", mood: "worried" }, motive: "Holds the cash; could fake its loss.", alibi: "Taking the group photo.", background: "Runs school tours across Ogun State.", quote: "I put it down for ONE minute!", statements: [
        { id: "ama-1", text: "The guide in the green cap offered to hold the bag earlier.", press: "I said no. He kept looking at it." },
      ] },
      { id: "biodun", name: "Biodun Ajala", role: "Lift operator", face: { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#3a5a8a", bg: "#e7e9ed", acc: "cap", mood: "flat" }, motive: "Saw everyone who went up and down.", alibi: "Running the lift all morning.", background: "Knows every regular at the rock.", quote: "That Kunle boy is not a guide, I've told them many times.", statements: [
        { id: "bio-1", text: "Kunle went down the back steps, not the lift.", press: "Fast. With his cap in his hand." },
      ] },
    ],
    culpritId: "kunle",
    solution:
      "“Kunle”, a fake guide with a homemade badge, latched onto the school tour. When the group posed for a photo, he took the cash bag from beside the bench, emptied it behind a boulder and ran down the back steps. The group photo caught him in the act.",
  },
  {
    id: "abk-kuto",
    tier: 55,
    title: "The Kuto Lotto Jackpot",
    hook: "A danfo driver wins ₦25 million on the lotto. By the time he reaches the kiosk, someone else has claimed it.",
    region: ABEOKUTA("Kuto motor park"),
    categories: ["vip", "cyber"],
    tags: ["Abeokuta", "Kuto", "Lotto"],
    bounty: 1_400_000,
    inspecting: 39500,
    lead: LEAD.abeokuta,
    victim: "Taiwo Odukoya, danfo driver",
    briefing:
      "Taiwo checked his numbers on the radio: jackpot, ₦25M. He tucked the ticket into his sun visor and went to buy a celebration bottle. When he got to the lotto kiosk an hour later, the prize had already been claimed with his ticket.",
    kit: {
      backdrop: { kind: "outdoor", sky: "dusk", ground: "concrete", horizon: "city" },
      castSide: "right",
      props: [
        { kind: "sign", x: 50, y: 12, label: "KUTO MOTOR PARK", color: "#3a5a8a" },
        { kind: "bus", x: 34, y: 50, name: "Taiwo's danfo" },
        { kind: "kiosk", x: 74, y: 52, label: "LOTTO", color: "#c0182b", name: "Lotto kiosk" },
        { kind: "cctv", x: 88, y: 24, name: "Kiosk camera" },
        { kind: "paper", x: 56, y: 84, name: "Claim form" },
        { kind: "bench", x: 18, y: 70 },
        { kind: "phone", x: 30, y: 82, name: "Conductor's phone" },
      ],
    },
    clues: [
      { id: "visor", name: "Taiwo's danfo", icon: KeyRound, x: 34, y: 50, description: "The sun visor where the ticket was hidden.", action: "Dust the visor", lab: { kind: "prints", shape: "finger" }, finding: "Taiwo's prints, and fresh ones of his conductor, Segun Bakare. Segun says he has never touched the visor.", suspectId: "segun" },
      { id: "claim", name: "Claim form", icon: ScrollText, x: 56, y: 84, description: "The claim form filed at the kiosk.", action: "Read the form", finding: "Claimed by “T. Odukoya”, but the ID card photocopy is fuzzy and the phone number belongs to Segun.", suspectId: "segun" },
      { id: "camera", name: "Kiosk camera", icon: Cctv, x: 88, y: 24, description: "The kiosk records every claim.", action: "Pull the claim footage", finding: "The claimant wears Taiwo's park jacket, but it's Segun, the conductor, wearing a face cap low.", suspectId: "segun" },
      { id: "kiosk", name: "Lotto kiosk", icon: Coins, x: 74, y: 52, description: "Alhaji Ganiyu runs the kiosk.", action: "Check the payout record", finding: "Paid by transfer to a new account opened yesterday in the name “Taiwo Odukoya” with the conductor's phone number. Ganiyu followed the rules but didn't check the face.", suspectId: "ganiyu" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "segun", name: "Segun Bakare", role: "Danfo conductor", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#f5c518", bg: "#e7e9ed", acc: "cap", mood: "smirk" }, motive: "Twenty-five million reasons.", alibi: "Says he was calling passengers at the park.", background: "Taiwo's conductor for six years. Like a brother.", quote: "Oga Taiwo is my brother! How can I?", statements: [
        { id: "seg-1", text: "I never touched the sun visor.", lie: { clueId: "visor", reveal: "I saw him hide it. I just… took it to keep it safe." } },
        { id: "seg-2", text: "I didn't go near the lotto kiosk today.", lie: { clueId: "camera", reveal: "That's me in his jacket. I opened the account yesterday when he said he played big." } },
      ] },
      { id: "ganiyu", name: "Alhaji Ganiyu", role: "Lotto kiosk owner", face: { skin: "#4a2c17", hair: "#cfcfcf", hairStyle: "short", shirt: "#c0182b", bg: "#e7e9ed", acc: "fila", accColor: "#c0182b", mood: "worried" }, motive: "Could have paid a friend instead of the winner.", alibi: "In his kiosk all day.", background: "Runs the busiest lotto kiosk in Kuto.", quote: "The man had the ticket! The ticket is king!", statements: [
        { id: "gan-1", text: "The claimant wore a cap low over his face.", press: "And Taiwo's jacket. Everybody knows that jacket." },
      ] },
      { id: "babaeko", name: "Baba Eko", role: "Park chairman", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bald", shirt: "#1d2f5a", bg: "#e7e9ed", acc: "shades", mood: "smirk" }, motive: "Takes a “cut” from everything in the park.", alibi: "Collecting levies at the gate.", background: "Has run Kuto park for fifteen years.", quote: "If I take am, you for no fit find am!", statements: [
        { id: "bab-1", text: "Segun asked me yesterday how to open a bank account fast.", press: "I told him go to the agent by the gate. Ask am." },
      ] },
    ],
    culpritId: "segun",
    solution:
      "Conductor Segun Bakare saw Taiwo hide the winning ticket in the sun visor. He took it, put on Taiwo's park jacket and a low cap, and claimed the jackpot at the kiosk into an account he had opened in Taiwo's name with his own phone number. The kiosk camera, his prints on the visor and the claim form caught him.",
  },

  /* ================================================================ BENIN CITY */
  {
    id: "ben-igun",
    tier: 56,
    title: "The Igun Street Bronze",
    hook: "A commissioned bronze head disappears from a casting workshop on Igun Street the night before delivery.",
    region: BENIN("Igun Street"),
    categories: ["heists", "alley"],
    tags: ["Benin", "Igun Street", "Bronze"],
    bounty: 400_000,
    inspecting: 25300,
    lead: LEAD.benin,
    victim: "Pa Eweka's bronze-casting workshop",
    briefing:
      "Pa Eweka's workshop spent three months casting a bronze head for a foreign museum. Last night the finished piece sat under a cloth. This morning, under the cloth: a rough copy, still warm from a different furnace.",
    kit: {
      backdrop: { kind: "outdoor", sky: "day", ground: "dirt", horizon: "city" },
      castSide: "left",
      props: [
        { kind: "sign", x: 50, y: 12, label: "IGUN STREET", color: "#8a1a2a" },
        { kind: "furnace", x: 76, y: 50, name: "Furnace" },
        { kind: "bronze", x: 46, y: 56, name: "The copy" },
        { kind: "crate", x: 22, y: 60, label: "MUSEUM", name: "Shipping crate" },
        { kind: "sack", x: 62, y: 72, name: "Charcoal sack" },
        { kind: "footprints", x: 36, y: 82, name: "Wax footprints" },
        { kind: "bench", x: 84, y: 72 },
      ],
    },
    clues: [
      { id: "copy", name: "The copy", icon: Fingerprint, x: 46, y: 56, description: "A rough bronze head, still slightly warm at dawn.", action: "Examine the casting", finding: "Cast last night, but Pa Eweka's furnace was cold. Inside the base: a maker's mark of the Osagie workshop three doors down.", suspectId: "osagie" },
      { id: "steps", name: "Wax footprints", icon: Footprints, x: 36, y: 82, description: "Footprints in spilled beeswax, leading out the back.", action: "Cast the footprints", lab: { kind: "prints", shape: "boot" }, finding: "Rubber slippers, size 41, with a cut across the heel: worn by Osas, the apprentice from the Osagie workshop.", suspectId: "osagie" },
      { id: "crate", name: "Shipping crate", icon: Package, x: 22, y: 60, description: "The crate for the museum, open.", action: "Check the crate", finding: "Empty and not yet sealed. The museum's courier wasn't due until noon. The courier is in the clear.", suspectId: "eghosa" },
      { id: "furnace", name: "Furnace", icon: Flame, x: 76, y: 50, description: "Pa Eweka's furnace.", action: "Check the ashes", finding: "Cold since yesterday afternoon. The copy was cast somewhere else and carried here.", suspectId: "osagie" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "osagie", name: "Osas Osagie", role: "Rival workshop's apprentice", face: { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "short", shirt: "#8a5a3a", bg: "#e7e9ed", mood: "smirk" }, motive: "A private buyer offered his workshop ₦6M for an Eweka original.", alibi: "Says he slept at home in Uselu.", background: "Talented caster in a struggling workshop.", quote: "My hands make bronze. They don't steal bronze.", statements: [
        { id: "osa-1", text: "I was in Uselu all night.", lie: { clueId: "steps", reveal: "Those are my slippers. I carried the copy in and the original out." } },
        { id: "osa-2", text: "Our workshop didn't cast anything last night.", lie: { clueId: "copy", reveal: "We cast the copy at midnight. The buyer wanted the original." } },
      ] },
      { id: "eghosa", name: "Eghosa Eweka", role: "Pa Eweka's grandson", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#8a1a2a", bg: "#e7e9ed", acc: "cap", mood: "worried" }, motive: "Wants to sell the workshop; grandpa refuses.", alibi: "Asleep in the house behind the workshop.", background: "Studies business in Benin. Thinks bronze is old-fashioned.", quote: "I don't even like bronze!", statements: [
        { id: "egh-1", text: "I heard someone in the yard around 2 a.m.", press: "I thought it was the guard dog. It wasn't barking though." },
      ] },
      { id: "lambert", name: "Mrs. Claire Lambert", role: "Museum agent", face: { skin: "#f0c8a0", hair: "#c9a34a", hairStyle: "long", shirt: "#2b2f36", bg: "#e7e9ed", acc: "glasses", mood: "flat" }, motive: "Could pay for the original twice: officially and secretly.", alibi: "At her hotel on Sapele Road.", background: "Buys contemporary Benin bronze for European museums.", quote: "I commissioned it. Why would I steal what I already paid for?", statements: [
        { id: "lam-1", text: "Another workshop offered me a cheaper copy last week.", press: "The Osagie workshop. I said no." },
      ] },
    ],
    culpritId: "osagie",
    solution:
      "Osas Osagie, apprentice at a rival workshop, cast a rough copy of the commissioned head at midnight in his own workshop, carried it to Pa Eweka's yard, swapped it for the original under the cloth and took the real bronze for a private buyer. The rival maker's mark in the copy and his cut-heel slipper prints in the spilled wax caught him.",
  },
  {
    id: "ben-bdc",
    tier: 57,
    title: "Ring Road Bureau de Change",
    hook: "A Ring Road bureau de change sends $20,000 by courier. The bank receives $20,000 in very good fakes.",
    region: BENIN("Ring Road"),
    categories: ["heists", "cyber"],
    tags: ["Benin", "Ring Road", "Dollars"],
    bounty: 460_000,
    inspecting: 30100,
    lead: LEAD.benin,
    victim: "Omoregie BDC",
    briefing:
      "Every Friday Omoregie BDC sends its week's dollars to the bank by okada courier. Today the bank's machine rejected all 200 hundred-dollar notes: counterfeit. Mr. Omoregie swears they were real when he counted them at 10:00.",
    kit: {
      backdrop: { kind: "outdoor", sky: "day", ground: "road", horizon: "city" },
      castSide: "right",
      props: [
        { kind: "sign", x: 50, y: 12, label: "RING ROAD", color: "#8a1a2a" },
        { kind: "kiosk", x: 30, y: 52, label: "BDC", color: "#e6c35a", name: "BDC kiosk" },
        { kind: "okada", x: 64, y: 60, name: "Courier's okada" },
        { kind: "chest", x: 44, y: 64, label: "CASH", color: "#2b3440", name: "Cash bag" },
        { kind: "umbrella", x: 84, y: 50, color: "#1d6a3a" },
        { kind: "phone", x: 72, y: 82, name: "Courier's phone" },
        { kind: "paper", x: 26, y: 84, name: "Counting sheet" },
      ],
    },
    clues: [
      { id: "notes", name: "Cash bag", icon: Banknote, x: 44, y: 64, description: "The counterfeit notes, in the original bank bag.", action: "UV-test the notes", finding: "Good fakes, but every note has the same serial number range as a batch seized in Lagos last year, sold on the street in sealed bags just like this one.", suspectId: "ese" },
      { id: "okada", name: "Courier's okada", icon: Truck, x: 64, y: 60, description: "The okada used for the bank run.", action: "Check its tracker", finding: "The 8-minute ride to the bank took 31 minutes, with a 20-minute stop at a mechanic's shed in Ugbowo.", suspectId: "ese" },
      { id: "phone", name: "Courier's phone", icon: Smartphone, x: 72, y: 82, description: "Ese's phone, on the okada seat.", action: "Read the chats", finding: "Wednesday: “Bag ready. Same seal. Friday 10:30, Ugbowo shed.” From a number saved as “Vulcanizer”.", suspectId: "ese" },
      { id: "sheet", name: "Counting sheet", icon: Receipt, x: 26, y: 84, description: "Mr. Omoregie's counting sheet, with serial numbers.", action: "Compare serials", finding: "The serials he wrote down at 10:00 are real notes, different from the fakes. The money was real when it left his hands.", suspectId: "omoregie" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "ese", name: "Ese Ighodaro", role: "Okada courier", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "short", shirt: "#e6c35a", bg: "#e7e9ed", acc: "cap", mood: "flat" }, motive: "$20,000 is more than he earns in ten years.", alibi: "Rode straight to the bank, he says.", background: "Has done the BDC's bank runs for two years without a problem.", quote: "I just carry the bag. I never even open am!", statements: [
        { id: "ese-1", text: "I went straight to the bank.", lie: { clueId: "okada", reveal: "I stopped at Ugbowo. Just to pump my tyre." } },
        { id: "ese-2", text: "I don't know anybody called Vulcanizer.", lie: { clueId: "phone", reveal: "He made the fake bag. Same seal, same tape. I swapped them in the shed." } },
      ] },
      { id: "omoregie", name: "Mr. Osaze Omoregie", role: "BDC owner", face: { skin: "#4a2c17", hair: "#cfcfcf", hairStyle: "short", shirt: "#1d6a3a", bg: "#e7e9ed", acc: "glasses", mood: "worried" }, motive: "Could be passing his own fakes and blaming the courier.", alibi: "In his kiosk all morning.", background: "Thirty years changing money on Ring Road.", quote: "I write every serial number down. Every one!", statements: [
        { id: "omo-1", text: "I sealed the bag myself at 10:15.", press: "Blue tape, my signature across it. Look at the photo on my phone." },
      ] },
      { id: "peter", name: "Peter Idahosa", role: "Bank teller", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "slick", shirt: "#2b2f36", bg: "#e7e9ed", acc: "glasses", mood: "smirk" }, motive: "Could have swapped the notes at the counter.", alibi: "His counter is on camera all day.", background: "Counts Ring Road's dollars every Friday.", quote: "The machine rejected them. I didn't even touch them long.", statements: [
        { id: "pet-1", text: "The seal on the bag was different this week.", press: "Same blue tape, but no signature across it." },
      ] },
    ],
    culpritId: "ese",
    solution:
      "Courier Ese Ighodaro stopped for twenty minutes at a mechanic's shed in Ugbowo, where a counterfeiter he knew as “Vulcanizer” had a fake bag ready, sealed with the same blue tape. Ese swapped the real $20,000 for fakes and carried the counterfeit bag to the bank. The tracker, his chats and the different serials gave him away.",
  },
  {
    id: "ben-uniben",
    tier: 58,
    title: "The Uniben Exam Leak",
    hook: "Hours before a final exam at Uniben, the full question paper is selling on WhatsApp for ₦5,000.",
    region: BENIN("University of Benin"),
    categories: ["vip", "cyber"],
    tags: ["Benin", "Uniben", "VIP"],
    bounty: 1_500_000,
    inspecting: 46300,
    lead: LEAD.benin,
    victim: "University of Benin, Faculty of Engineering",
    briefing:
      "The final-year paper was printed yesterday in the faculty's secure printing room, sealed and locked in a cabinet. By midnight a photo of the full paper was selling on a WhatsApp group called “Exam Plug”. The exam has been cancelled.",
    kit: {
      backdrop: { kind: "indoor", wall: "#cfd6dc", floor: "#8a949c", trim: "#8a1a2a", window: "city-day" },
      castSide: "left",
      props: [
        { kind: "panel", x: 76, y: 56, color: "#53FC18", name: "Printer" },
        { kind: "cabinet", x: 88, y: 50, name: "Sealed cabinet" },
        { kind: "desk", x: 46, y: 64, name: "Clerk's desk" },
        { kind: "books", x: 40, y: 58, name: "Print register" },
        { kind: "phone", x: 54, y: 58, name: "Seized phone" },
        { kind: "bin", x: 18, y: 70, s: 0.45, color: "#4c5660", name: "Waste bin" },
        { kind: "cctv", x: 14, y: 18, name: "Corridor camera" },
      ],
    },
    clues: [
      { id: "printer", name: "Printer", icon: Printer, x: 76, y: 56, description: "The secure printer keeps a job log.", action: "Read the print log", finding: "Yesterday: 340 copies at 14:00 (correct), then 1 extra copy at 21:47 using PIN 0909: clerk Mr. Iyamu's PIN.", suspectId: "iyamu" },
      { id: "bin", name: "Waste bin", icon: ScrollText, x: 18, y: 70, description: "Torn paper in the printing-room bin.", action: "Rebuild the torn page", lab: { kind: "torn", style: "ledger", title: "EEE 531 FINAL EXAM", lines: ["Answer ANY FOUR", "Q1. Derive the transfer", "function of the circuit", "Q2. Explain the …", "", "(extra copy, misprint)", "— printed 21:47"] }, finding: "A misprinted page of the exam, stamped 21:47, the same time as the extra copy.", suspectId: "iyamu" },
      { id: "phone", name: "Seized phone", icon: Smartphone, x: 54, y: 58, description: "A phone seized from the admin of “Exam Plug”.", action: "Trace the admin", finding: "The admin is Efosa Iyamu, a 200-level student… and the clerk's son. The first photo was sent from his father's home Wi-Fi.", suspectId: "iyamu" },
      { id: "register", name: "Print register", icon: BookOpen, x: 40, y: 58, description: "The handwritten print register.", action: "Check the register", finding: "Dr. Ehigiator signed for 340 copies at 14:30 and watched them sealed. His part is clean.", suspectId: "ehigiator" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "iyamu", name: "Mr. Felix Iyamu", role: "Printing-room clerk", face: { skin: "#4a2c17", hair: "#cfcfcf", hairStyle: "short", shirt: "#e8e0d0", bg: "#e7e9ed", acc: "glasses", mood: "worried" }, motive: "His son's “Exam Plug” group made ₦3M in one night.", alibi: "Says he locked up at 17:00 and went home.", background: "Twenty-two years running the printing room.", quote: "My record is clean for twenty-two years!", statements: [
        { id: "iya-1", text: "I locked up at five and never came back.", lie: { clueId: "printer", reveal: "I came back. Just one copy. My son said nobody would know." } },
        { id: "iya-2", text: "I don't know anything about WhatsApp groups.", lie: { clueId: "phone", reveal: "My son runs it. I printed it for him. God forgive me." } },
      ] },
      { id: "ehigiator", name: "Dr. Grace Ehigiator", role: "Lecturer who set the exam", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#8a1a2a", bg: "#e7e9ed", acc: "glasses", mood: "flat" }, motive: "Had the questions on her laptop for weeks.", alibi: "At a departmental board meeting until 22:00.", background: "Strict, respected, hates cheating.", quote: "I set exams to test students, not to sell them.", statements: [
        { id: "ehi-1", text: "I signed for exactly 340 copies.", press: "And watched them sealed. It's in the register." },
      ] },
      { id: "osaze", name: "Osaze Ogbebor", role: "Student union president", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "mohawk", shirt: "#1d4a8a", bg: "#e7e9ed", acc: "earring", mood: "smirk" }, motive: "Popular, loud, and a member of “Exam Plug”.", alibi: "At a hostel party all night.", background: "Wants to be a senator one day.", quote: "I joined the group to report it. Ask the Dean!", statements: [
        { id: "osz-1", text: "The admin's name on the group is “Plug Master F.”", press: "F for something. Everybody knows it's a staff's son." },
      ] },
    ],
    culpritId: "iyamu",
    solution:
      "Printing clerk Felix Iyamu came back to the printing room at 21:47 and printed one extra copy of the exam with his own PIN for his son, who sold photos of it on his “Exam Plug” WhatsApp group. The printer log, the misprinted page in the bin and the home Wi-Fi trace exposed father and son.",
  },
];
