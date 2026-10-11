import {
  Banknote,
  BookOpen,
  Cable,
  Car,
  Cctv,
  Fish,
  Footprints,
  Fuel,
  Gauge,
  KeyRound,
  LockOpen,
  Package,
  Receipt,
  ScrollText,
  Shirt,
  Smartphone,
  Snowflake,
  Thermometer,
  Trophy,
  Truck,
  Wrench,
} from "lucide-react";
import type { CrimeCase, Face } from "../types";

/** City cases: Port Harcourt, Aba and Enugu. */

const TAMUNO: Face = { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "short", shirt: "#1d4a8a", bg: "#e7e9ed", acc: "cap", mood: "smile" };
const CHINEDU: Face = { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#2a6a6a", bg: "#e7e9ed", acc: "glasses", mood: "smirk" };
const IFEOMA: Face = { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#3a3a3a", bg: "#e7e9ed", acc: "glasses", mood: "smile" };

const LEAD = {
  ph: { name: "Insp. Tamuno Briggs", face: TAMUNO },
  aba: { name: "Insp. Chinedu Nwosu", face: CHINEDU },
  enugu: { name: "Insp. Ifeoma Eze", face: IFEOMA },
};

const PH = (place: string) => ({ state: "Rivers", place, music: "rivers" as const });
const ABA = (place: string) => ({ state: "Abia", place, music: "highlife" as const });
const ENUGU = (place: string) => ({ state: "Enugu", place, music: "highlife" as const });

export const CITY_CASES_SOUTH: CrimeCase[] = [
  /* ================================================================ PORT HARCOURT */
  {
    id: "ph-mileone",
    tier: 59,
    title: "The Mile One Cold Room",
    hook: "Two tonnes of frozen fish “spoil” overnight in a Mile One market cold room. Strange: nobody can find the spoiled fish.",
    region: PH("Mile One market"),
    categories: ["alley"],
    tags: ["Port Harcourt", "Mile One", "Fish"],
    bounty: 380_000,
    inspecting: 24100,
    lead: LEAD.ph,
    victim: "Madam Data's cold room, Mile One",
    briefing:
      "Madam Data's cold room holds frozen fish for half of Mile One. The generator operator says the generator died at midnight, the fish spoiled, and he dumped it all at dawn before the smell. ₦6M of fish, gone.",
    kit: {
      backdrop: { kind: "outdoor", sky: "dawn", ground: "concrete", horizon: "city" },
      castSide: "right",
      props: [
        { kind: "sign", x: 50, y: 12, label: "MILE ONE MARKET", color: "#1d4a8a" },
        { kind: "fridge", x: 30, y: 46, s: 1.2, name: "Cold room" },
        { kind: "generator", x: 56, y: 62, name: "Generator" },
        { kind: "bin", x: 80, y: 60, label: "WASTE", color: "#4c5660", name: "Dump bin" },
        { kind: "keke", x: 16, y: 72, color: "#2f8a3a", name: "Tonye's keke" },
        { kind: "paper", x: 44, y: 84, name: "Temperature log" },
        { kind: "crate", x: 66, y: 80, label: "FISH", name: "Empty fish carton" },
      ],
    },
    clues: [
      { id: "log", name: "Temperature log", icon: Thermometer, x: 44, y: 84, description: "The cold room's digital temperature log.", action: "Read the log", finding: "The room stayed at −18 °C until 01:10, then the door sensor shows it open for two hours. The power never failed.", suspectId: "sunny" },
      { id: "gen", name: "Generator", icon: Gauge, x: 56, y: 62, description: "The “dead” generator.", action: "Test the generator", finding: "Starts first time, tank three-quarters full. It never broke down.", suspectId: "sunny" },
      { id: "bin", name: "Dump bin", icon: Fish, x: 80, y: 60, description: "Where the spoiled fish was supposedly dumped.", action: "Check the bin", finding: "Not one fish. Not even the smell. Nothing was dumped here.", suspectId: "sunny" },
      { id: "keke", name: "Tonye's keke", icon: Snowflake, x: 16, y: 72, description: "A keke with melted ice on the floor.", action: "Talk to the rider", finding: "Tonye was paid to carry “fish deliveries” to three restaurants in Choba at 2 a.m. He thought it was a normal job. He has the operator's number in his phone.", suspectId: "tonye" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "sunny", name: "Sunny Briggs", role: "Generator operator", face: { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#2b3440", bg: "#e7e9ed", acc: "cap", mood: "flat" }, motive: "Three restaurants paid cash for cheap fish, no questions asked.", alibi: "Says he watched the generator all night.", background: "Runs the market's generators. Knows every lock.", quote: "Generator die! Fish spoil! Na God do am!", statements: [
        { id: "sun-1", text: "The generator died at midnight.", lie: { clueId: "gen", reveal: "The generator is fine. I just needed a story." } },
        { id: "sun-2", text: "I dumped the spoiled fish in the waste bin.", lie: { clueId: "bin", reveal: "There was no spoiled fish. I sold it in Choba." } },
      ] },
      { id: "data", name: "Madam Data Wokoma", role: "Cold-room owner", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#1d4a8a", bg: "#e7e9ed", acc: "gele", accColor: "#e6c35a", mood: "worried" }, motive: "Her fish was insured against power failure.", alibi: "At home in D-Line.", background: "Thirty years in the fish business.", quote: "My customers will kill me! Their fish is gone!", statements: [
        { id: "dat-1", text: "Sunny asked me last week how the insurance works.", press: "I thought he was just curious." },
      ] },
      { id: "tonye", name: "Tonye Jack", role: "Keke rider", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "short", shirt: "#2f8a3a", bg: "#e7e9ed", mood: "worried" }, motive: "Carried the fish.", alibi: "Carrying “deliveries” to Choba.", background: "Night keke rider, takes any job.", quote: "I carry wetin dem give me. Na my work!", statements: [
        { id: "ton-1", text: "Sunny paid me ₦15,000 to deliver to Choba.", press: "He said the restaurants ordered it. I didn't ask." },
      ] },
    ],
    culpritId: "sunny",
    solution:
      "Generator operator Sunny Briggs opened the cold room at 01:10, loaded two tonnes of fish onto a hired keke and sold it cash to three restaurants in Choba. He then claimed the generator died and the fish spoiled. The working generator, the empty dump bin and the temperature log broke his story.",
  },
  {
    id: "ph-tanker",
    tier: 60,
    title: "The Trans-Amadi Diesel Short",
    hook: "A diesel tanker reaches a Trans-Amadi factory with its seals unbroken, and 10,000 litres missing.",
    region: PH("Trans-Amadi"),
    categories: ["heists"],
    tags: ["Port Harcourt", "Trans-Amadi", "Diesel"],
    bounty: 440_000,
    inspecting: 28800,
    lead: LEAD.ph,
    victim: "Rivgold Foods factory",
    briefing:
      "The depot loaded 33,000 litres and sealed the tanker. At the factory the seals were perfect, yet the dipstick showed 23,000. The driver says the depot cheated. The depot says the factory's dipstick lies.",
    kit: {
      backdrop: { kind: "outdoor", sky: "day", ground: "concrete", horizon: "city" },
      castSide: "left",
      props: [
        { kind: "sign", x: 50, y: 12, label: "TRANS-AMADI", color: "#1d4a8a" },
        { kind: "tanker", x: 50, y: 48, label: "DIESEL", color: "#e8e0d0", name: "Diesel tanker" },
        { kind: "panel", x: 84, y: 54, color: "#f5c518", name: "Depot meter ticket" },
        { kind: "drum", x: 22, y: 64, name: "Roadside drum" },
        { kind: "hardhat", x: 66, y: 76, name: "Storekeeper's hard hat" },
        { kind: "phone", x: 36, y: 84, name: "Driver's phone" },
      ],
    },
    clues: [
      { id: "tank", name: "Diesel tanker", icon: Wrench, x: 50, y: 48, description: "Seals intact on top. Underneath…", action: "Inspect under the tank", finding: "A hidden valve welded under the chassis, painted to match. You can drain the tank without touching a single seal.", suspectId: "okon" },
      { id: "phone", name: "Driver's phone", icon: Smartphone, x: 36, y: 84, description: "The driver's phone, location history on.", action: "Check the route", finding: "A 50-minute stop at an Eleme roadside “black market” diesel point. Driver Okon said he never stopped.", suspectId: "okon" },
      { id: "drum", name: "Roadside drum", icon: Fuel, x: 22, y: 64, description: "A drum bought from the Eleme black-market point.", action: "Test the diesel", finding: "Same dye marker as the depot's batch number on today's ticket. This is the missing diesel.", suspectId: "okon" },
      { id: "meter", name: "Depot meter ticket", icon: Receipt, x: 84, y: 54, description: "The depot's printed meter ticket.", action: "Check the ticket", finding: "33,000 litres metered and signed by loader Ifeanyi. The meter was calibrated last week. The depot's loading was honest.", suspectId: "ifeanyi" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "okon", name: "Okon Etim", role: "Tanker driver", face: { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "short", shirt: "#c0182b", bg: "#e7e9ed", acc: "cap", mood: "smirk" }, motive: "Sells 10,000 litres a trip to the black market.", alibi: "Drove straight from the depot, he says.", background: "Twelve years driving tankers. Recently bought a house.", quote: "Check my seals! Untouched!", statements: [
        { id: "oko-1", text: "I drove straight from the depot to the factory.", lie: { clueId: "phone", reveal: "I stopped at Eleme… to eat." } },
        { id: "oko-2", text: "Nobody can take diesel without breaking the seals.", lie: { clueId: "tank", reveal: "The valve… a welder in Eleme did it. Ten thousand litres a trip." } },
      ] },
      { id: "ifeanyi", name: "Ifeanyi Okafor", role: "Depot loader", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#f5c518", bg: "#e7e9ed", acc: "cap", mood: "flat" }, motive: "Could short the loading and pocket the difference.", alibi: "At the depot loading bay all day.", background: "Signs every ticket himself.", quote: "Thirty-three thousand. The meter doesn't lie.", statements: [
        { id: "ife-1", text: "Okon always asks to park behind the bay before he leaves.", press: "Out of camera view. I thought he was praying." },
      ] },
      { id: "briggs", name: "Mrs. Ibiere Briggs", role: "Factory storekeeper", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#1d4a8a", bg: "#e7e9ed", acc: "glasses", mood: "worried" }, motive: "Could under-record deliveries and sell the rest.", alibi: "Dipping the tank with two witnesses.", background: "Strict; her dipstick readings are always signed by two people.", quote: "Two witnesses, every time. I don't play with diesel.", statements: [
        { id: "bri-1", text: "This is the third short delivery this month. Same driver.", press: "I wrote to the depot twice." },
      ] },
    ],
    culpritId: "okon",
    solution:
      "Tanker driver Okon Etim had a hidden valve welded under his chassis. On every trip he stopped at an Eleme black-market point and drained 10,000 litres without touching the seals. The secret valve, his route history and the matching dye in the roadside drum ended the racket.",
  },
  {
    id: "ph-boatclub",
    tier: 61,
    title: "The Boat Club Regatta Trophy",
    hook: "The Port Harcourt Boat Club's silver regatta trophy disappears two days before the race.",
    region: PH("Port Harcourt Boat Club"),
    categories: ["vip"],
    tags: ["Port Harcourt", "Boat Club", "VIP"],
    bounty: 1_600_000,
    inspecting: 37900,
    lead: LEAD.ph,
    victim: "Port Harcourt Boat Club (a 1958 silver trophy)",
    briefing:
      "The silver regatta trophy has stood in the clubhouse case since 1958. Last night after the members' dinner the case was locked as usual. This morning it was locked, and empty. Only two keys exist.",
    kit: {
      backdrop: { kind: "indoor", decor: "luxury", wall: "#e8e0d0", floor: "#6a4a2a", trim: "#1d4a8a", window: "sea" },
      castSide: "right",
      props: [
        { kind: "pedestal", x: 50, y: 56, name: "Trophy case" },
        { kind: "boat", x: 20, y: 50, s: 1.2, name: "Rowing boat" },
        { kind: "lifebuoy", x: 82, y: 48, name: "Lifebuoy" },
        { kind: "bench", x: 70, y: 70, name: "Members' bench" },
        { kind: "paper", x: 36, y: 84, name: "Pawn ticket" },
        { kind: "cctv", x: 86, y: 16, name: "Clubhouse camera" },
        { kind: "glass", x: 62, y: 62, name: "Whisky glass" },
      ],
    },
    clues: [
      { id: "case", name: "Trophy case", icon: LockOpen, x: 50, y: 56, description: "Locked with a key, not forced.", action: "Check the key log", finding: "Two keys: one with the commodore, abroad this week, and one with club secretary Mr. Abbey Princewill.", suspectId: "abbey" },
      { id: "pawn", name: "Pawn ticket", icon: Receipt, x: 36, y: 84, description: "A torn ticket under the bench.", action: "Rebuild the pawn ticket", lab: { kind: "torn", style: "ledger", title: "GARDEN CITY PAWN", lines: ["Item: silver cup, 1958", "engraved, large", "Loan: N2,500,000", "Name: A. Princewill", "Redeem by: 30 days", "Today 09:10", "— Garden City Pawn"] }, finding: "Pawned this morning at 09:10 for ₦2.5M by A. Princewill.", suspectId: "abbey" },
      { id: "camera", name: "Clubhouse camera", icon: Cctv, x: 86, y: 16, description: "The clubhouse camera.", action: "Pull the night footage", finding: "At 23:40 a man in a blazer opens the case with a key and wraps the cup in a club towel. Same walk, same blazer as the secretary.", suspectId: "abbey" },
      { id: "glass", name: "Whisky glass", icon: Trophy, x: 62, y: 62, description: "A glass left near the case.", action: "Check the glass", finding: "Rival captain Dagogo's prints. He admired the cup loudly after dinner, but left with friends at 22:30.", suspectId: "dagogo" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "abbey", name: "Mr. Abbey Princewill", role: "Club secretary", face: { skin: "#4a2c17", hair: "#cfcfcf", hairStyle: "short", shirt: "#1d4a8a", bg: "#e7e9ed", acc: "glasses", mood: "worried" }, motive: "Owes ₦2M in gambling debts to dangerous people.", alibi: "Says he went home at 22:00.", background: "Secretary for fifteen years. Everybody trusts him.", quote: "I love this club more than my own house!", statements: [
        { id: "abb-1", text: "I went home at ten after dinner.", lie: { clueId: "camera", reveal: "I came back. I needed money fast. I was going to redeem it before the regatta." } },
        { id: "abb-2", text: "I've never been inside a pawn shop.", lie: { clueId: "pawn", reveal: "Garden City Pawn. Two and a half million. I'm so ashamed." } },
      ] },
      { id: "dagogo", name: "Capt. Dagogo West", role: "Rival rowing captain", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#c0182b", bg: "#e7e9ed", acc: "shades", mood: "smirk" }, motive: "Lost the regatta three years running.", alibi: "Left at 22:30 with his crew.", background: "Loud, competitive, very sore loser.", quote: "I want to WIN that cup, not steal it!", statements: [
        { id: "dag-1", text: "Abbey kept checking his phone all through dinner.", press: "Somebody kept calling him. He looked scared." },
      ] },
      { id: "barman", name: "Kalada Horsfall", role: "Barman", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "short", shirt: "#f2f2e8", bg: "#e7e9ed", mood: "flat" }, motive: "Last staff member in the clubhouse.", alibi: "Cleaning the bar until 23:00.", background: "Has served drinks at the club for twenty years.", quote: "I lock the bar, not the trophy case.", statements: [
        { id: "bar-1", text: "When I left at eleven, the cup was still there.", press: "I always say goodnight to it. Old habit." },
      ] },
    ],
    culpritId: "abbey",
    solution:
      "Club secretary Abbey Princewill, deep in gambling debt, came back at 23:40 with his own key, wrapped the 1958 trophy in a club towel and pawned it at Garden City Pawn the next morning for ₦2.5M, planning to redeem it before the regatta. The clubhouse camera and the pawn ticket caught him.",
  },

  /* ================================================================ ABA */
  {
    id: "aba-ariaria",
    tier: 62,
    title: "The Ariaria Shoe Patterns",
    hook: "An Aba shoemaker's best-selling designs turn up as cheap copies at a rival stall, one week after launch.",
    region: ABA("Ariaria International Market"),
    categories: ["alley", "cyber"],
    tags: ["Aba", "Ariaria", "Made in Aba"],
    bounty: 340_000,
    inspecting: 21900,
    lead: LEAD.aba,
    victim: "Nnamdi Classics, shoemakers",
    briefing:
      "Nnamdi Okeke's new loafer design sold out in three days. This week a stall across Ariaria is selling identical copies at half price. Nnamdi's paper patterns were locked in his workshop, and only three people have seen them.",
    kit: {
      backdrop: { kind: "outdoor", sky: "day", ground: "concrete", horizon: "city" },
      castSide: "right",
      props: [
        { kind: "sign", x: 50, y: 12, label: "ARIARIA MARKET", color: "#2a6a6a" },
        { kind: "shoerack", x: 26, y: 52, name: "Nnamdi's shoe rack" },
        { kind: "shoerack", x: 74, y: 52, name: "Rival's shoe rack" },
        { kind: "sewing", x: 46, y: 66, color: "#3a2418", name: "Sewing table" },
        { kind: "phone", x: 36, y: 84, name: "Assistant's phone" },
        { kind: "paper", x: 60, y: 84, name: "Torn pattern" },
        { kind: "keke", x: 88, y: 72, color: "#f5c518" },
      ],
    },
    clues: [
      { id: "rack", name: "Rival's shoe rack", icon: Package, x: 74, y: 52, description: "The copies: same shape, cheaper glue.", action: "Compare the shoes", finding: "Cut from Nnamdi's exact pattern, including a tiny notch he adds as a secret signature. Whoever cut them had the paper patterns.", suspectId: "chika" },
      { id: "phone", name: "Assistant's phone", icon: Smartphone, x: 36, y: 84, description: "Chika's phone, left at the sewing table.", action: "Check the photos", finding: "Photos of every pattern sheet, taken at 21:13 on launch day, sent to an Instagram account called “AbaDesigns” for ₦80,000.", suspectId: "chika" },
      { id: "pattern", name: "Torn pattern", icon: ScrollText, x: 60, y: 84, description: "A torn pattern sheet by the table.", action: "Rebuild the pattern sheet", lab: { kind: "torn", style: "ledger", title: "NNAMDI CLASSICS LOAFER", lines: ["Upper: cut x2", "Lining: cut x2", "Notch at heel (signature)", "Size run 39-46", "", "Do not copy", "— N.O."] }, finding: "Nnamdi's signature notch is on it, and a smudged thumbprint in shoe glue that matches Chika's.", suspectId: "chika" },
      { id: "uche", name: "Sewing table", icon: Shirt, x: 46, y: 66, description: "The rival maker Uche's receipts are stuck under the table.", action: "Read Uche's receipts", finding: "Uche bought “original Aba designs” from the Instagram page AbaDesigns for ₦120,000. Careless, but he didn't steal anything himself.", suspectId: "uche" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "chika", name: "Chika Eze", role: "Shop assistant", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#2a6a6a", bg: "#e7e9ed", acc: "earring", mood: "worried" }, motive: "Runs the secret “AbaDesigns” page for extra money.", alibi: "Says she closed at 20:00 and went home.", background: "Two years with Nnamdi, handles the shop's Instagram.", quote: "Oga Nnamdi trained me! I can't steal from him!", statements: [
        { id: "chi-1", text: "I never photographed the patterns.", lie: { clueId: "phone", reveal: "I took the photos. AbaDesigns is my page. I'm so sorry." } },
        { id: "chi-2", text: "I never touched the pattern sheets.", lie: { clueId: "pattern", reveal: "I took them out of the drawer to photograph them. The glue was on my hand." } },
      ] },
      { id: "uche", name: "Uche Nwafor", role: "Rival shoemaker", face: { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "short", shirt: "#c0182b", bg: "#e7e9ed", acc: "cap", mood: "smirk" }, motive: "Sells the copies at half price.", alibi: "At his stall, selling.", background: "Fast, cheap, always one step behind Nnamdi.", quote: "I paid for those designs! I have receipts!", statements: [
        { id: "uch-1", text: "I bought the designs online, legally.", press: "From a page called AbaDesigns. Here's the transfer." },
      ] },
      { id: "nnamdi", name: "Nnamdi Okeke", role: "Shoemaker (victim)", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#3a2418", bg: "#e7e9ed", acc: "glasses", mood: "flat" }, motive: "Could be faking the theft for attention.", alibi: "At a trade fair in Onitsha.", background: "One of the best shoemakers in Aba.", quote: "Made in Aba should mean something!", statements: [
        { id: "nna-1", text: "Only Chika, my cutter and I have seen the patterns.", press: "My cutter has been in hospital for two weeks." },
      ] },
    ],
    culpritId: "chika",
    solution:
      "Shop assistant Chika Eze photographed Nnamdi's pattern sheets on launch night and sold them through her secret Instagram page, “AbaDesigns”, to rival shoemaker Uche. The photos on her phone and her glue-stained thumbprint on the pattern proved it.",
  },
  {
    id: "aba-ngwa",
    tier: 63,
    title: "The Ngwa Road Generators",
    hook: "Six shop generators vanish from Ngwa Road in one night, on the street with the busiest vigilante patrol in Aba.",
    region: ABA("Ngwa Road"),
    categories: ["heists", "alley"],
    tags: ["Aba", "Ngwa Road", "Night patrol"],
    bounty: 420_000,
    inspecting: 26200,
    lead: LEAD.aba,
    victim: "Six shop owners on Ngwa Road",
    briefing:
      "Ngwa Road shop owners pay a vigilante group to patrol every night. Last night six generators, each chained to its shop, disappeared. The patrol leader says his boys saw nothing. Each chain was opened, not cut.",
    kit: {
      backdrop: { kind: "outdoor", sky: "night", ground: "road", horizon: "city" },
      castSide: "left",
      props: [
        { kind: "sign", x: 50, y: 14, label: "NGWA ROAD", color: "#2a6a6a" },
        { kind: "kiosk", x: 30, y: 52, label: "PHONES", color: "#2a6a6a", name: "Phone shop" },
        { kind: "kiosk", x: 70, y: 52, label: "PROVISIONS", color: "#8a1a2a", name: "Provision shop" },
        { kind: "generator", x: 46, y: 66, name: "Last generator" },
        { kind: "okada", x: 80, y: 72, name: "Patrol okada" },
        { kind: "lamppost", x: 12, y: 44 },
        { kind: "paper", x: 24, y: 84, name: "Sales listing" },
        { kind: "cctv", x: 88, y: 26, name: "Shop camera" },
      ],
    },
    clues: [
      { id: "gen", name: "Last generator", icon: KeyRound, x: 46, y: 66, description: "One generator left behind, its chain unlocked.", action: "Check the padlock", finding: "Opened with a key. All six shops gave a spare key to the vigilante group “for emergencies”. Only the patrol leader keeps them.", suspectId: "ikenna" },
      { id: "okada", name: "Patrol okada", icon: Truck, x: 80, y: 72, description: "The patrol's okada, with a GPS tracker the shop owners paid for.", action: "Read the tracker", finding: "At 02:00–03:30 the okada stops at each of the six shops for five minutes, then rides to a warehouse at Cemetery Market.", suspectId: "ikenna" },
      { id: "listing", name: "Sales listing", icon: Receipt, x: 24, y: 84, description: "A printed online listing found in the gutter.", action: "Read the listing", finding: "“6 generators, Tiger and Elepaq, good condition, call Ikenna.” Posted at 04:12.", suspectId: "ikenna" },
      { id: "camera", name: "Shop camera", icon: Cctv, x: 88, y: 26, description: "One shop owner's private camera.", action: "Pull the footage", finding: "A young patrol boy, Emeka, is seen asleep on a bench from midnight to five. He slept through it all.", suspectId: "emeka" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "ikenna", name: "Ikenna “Commander” Obi", role: "Vigilante patrol leader", face: { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "bald", shirt: "#3a3a3a", bg: "#e7e9ed", acc: "shades", mood: "smirk" }, motive: "Holds every spare key and wants a bigger fee.", alibi: "Says he patrolled the far end all night.", background: "Has run the Ngwa Road patrol for six years.", quote: "My boys and I guard this road with our lives!", statements: [
        { id: "ike-1", text: "I patrolled the far end. I never stopped at those shops.", lie: { clueId: "okada", reveal: "We stopped. We loaded the generators. Two at a time." } },
        { id: "ike-2", text: "The spare keys never leave my house.", lie: { clueId: "gen", reveal: "I used the keys. The shop owners don't pay us enough!" } },
      ] },
      { id: "emeka", name: "Emeka Udeh", role: "Patrol boy", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "short", shirt: "#3a3a3a", bg: "#e7e9ed", mood: "worried" }, motive: "Was on duty and saw nothing. Covering for someone?", alibi: "On duty at the junction.", background: "Seventeen, newest member of the patrol.", quote: "Commander told me to sit at the junction and not move.", statements: [
        { id: "eme-1", text: "Commander sent me to the junction and said rest.", press: "He said, “Tonight I go do the round myself.”" },
      ] },
      { id: "ngozi", name: "Madam Ngozi Ike", role: "Shop owners' chairwoman", face: { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "bun", shirt: "#2a6a6a", bg: "#e7e9ed", acc: "gele", accColor: "#c0182b", mood: "flat" }, motive: "Wants to sack the vigilantes; a theft would help her case.", alibi: "At home in Ogbor Hill.", background: "Runs the shop owners' association with an iron hand.", quote: "I've been telling them those boys are thieves!", statements: [
        { id: "ngo-1", text: "Commander asked for a fee increase last week. We refused.", press: "He said, “You will regret it.”" },
      ] },
    ],
    culpritId: "ikenna",
    solution:
      "Vigilante leader Ikenna “Commander” Obi, angry that the shop owners refused his fee increase, used the spare keys he was trusted with to unchain six generators, carried them off on the patrol okada to a Cemetery Market warehouse and listed them for sale online. The tracker the shop owners paid for gave him away.",
  },
  {
    id: "aba-gown",
    tier: 64,
    title: "The Vanished Wedding Gown",
    hook: "The night before a big Aba wedding, the bride's ₦2 million lace gown vanishes from the tailor's shop.",
    region: ABA("Ehi Road"),
    categories: ["vip"],
    tags: ["Aba", "Wedding", "VIP"],
    bounty: 1_400_000,
    inspecting: 43500,
    lead: LEAD.aba,
    victim: "Ugochi Okafor, bride",
    briefing:
      "Madam Uju finished the gown at 18:00 and hung it in the shop for collection at 07:00. At 07:00 the hanger was empty. The wedding is at 11:00. The shop was locked, and three people had keys or reasons.",
    kit: {
      backdrop: { kind: "indoor", decor: "shop", wall: "#e8d2d8", floor: "#c9b49a", trim: "#8a1a2a", window: "city-day" },
      castSide: "right",
      props: [
        { kind: "coatrack", x: 50, y: 52, color: "#f2f2e8", name: "Empty hanger" },
        { kind: "sewing", x: 24, y: 62, color: "#f2f2e8", name: "Sewing table" },
        { kind: "chair", x: 70, y: 66, color: "#8a1a2a" },
        { kind: "phone", x: 30, y: 58, name: "Apprentice's phone" },
        { kind: "paper", x: 56, y: 84, name: "Studio receipt" },
        { kind: "door", x: 88, y: 60, color: "#5a3a1a", name: "Shop door" },
        { kind: "cushion", x: 80, y: 80, color: "#e6c35a" },
      ],
    },
    clues: [
      { id: "hanger", name: "Empty hanger", icon: Shirt, x: 50, y: 52, description: "The gown's hanger, still with a tag attached.", action: "Read the tag", finding: "A collection tag from “Glamour Studios, Aba” dated today, 05:30. Somebody signed the gown out to a photo studio.", suspectId: "ada" },
      { id: "phone", name: "Apprentice's phone", icon: Smartphone, x: 30, y: 58, description: "Ada's phone, charging on the sewing table.", action: "Check her messages", finding: "To Glamour Studios: “Gown ready, bring it back by 9am latest. ₦150k as agreed.” Sent at 05:10.", suspectId: "ada" },
      { id: "receipt", name: "Studio receipt", icon: Receipt, x: 56, y: 84, description: "A receipt from the photo studio.", action: "Rebuild the receipt", lab: { kind: "torn", style: "ledger", title: "GLAMOUR STUDIOS ABA", lines: ["Bridal shoot, model", "Gown hire: 1 day", "Paid to: Ada N.", "Amount: N150,000", "Pick-up: 05:30", "Return: 09:00", "Thank you!"] }, finding: "The studio hired the gown for a model shoot and paid ₦150k to “Ada N.”, the apprentice.", suspectId: "ada" },
      { id: "door", name: "Shop door", icon: LockOpen, x: 88, y: 60, description: "Locked, not forced.", action: "Check who has keys", finding: "Madam Uju and her apprentice Ada. The bride's sister Nnenna was here at 19:00 complaining about the sleeves, but left without a key.", suspectId: "nnenna" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "ada", name: "Ada Nwosu", role: "Tailor's apprentice", face: { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "long", shirt: "#8a1a2a", bg: "#e7e9ed", acc: "earring", mood: "worried" }, motive: "Rented the gown to a photo studio for ₦150k.", alibi: "Says she was asleep at home.", background: "Talented, ambitious, saving for her own shop.", quote: "Madam, I swear, I locked the door last night!", statements: [
        { id: "ada-1", text: "I didn't come to the shop this morning.", lie: { clueId: "phone", reveal: "I came at five. I gave it to the studio for one shoot. They promised nine o'clock!" } },
        { id: "ada-2", text: "I don't know anything about any studio.", lie: { clueId: "receipt", reveal: "Glamour Studios. ₦150,000. I wanted money for my own machine." } },
      ] },
      { id: "uju", name: "Madam Uju Obi", role: "Tailor", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#e8d2d8", bg: "#e7e9ed", acc: "glasses", mood: "worried" }, motive: "The bride hadn't paid the balance yet.", alibi: "At home in Ogbor Hill.", background: "The best wedding tailor on Ehi Road.", quote: "I sewed every bead with my own hands!", statements: [
        { id: "uju-1", text: "Ada has been asking about photo-shoot work lately.", press: "She said studios pay well for gowns. I said never with a client's gown." },
      ] },
      { id: "nnenna", name: "Nnenna Okafor", role: "Bride's sister", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "curly", shirt: "#7a3aff", bg: "#e7e9ed", acc: "gele", accColor: "#7a3aff", mood: "smirk" }, motive: "Openly jealous of her sister's wedding.", alibi: "At the bride's house for the night-before party.", background: "Older sister, not married yet, everybody keeps asking.", quote: "I said the sleeves were ugly. I didn't say steal the gown!", statements: [
        { id: "nne-1", text: "I left the shop at seven, before Madam closed.", press: "Madam Uju walked me out herself." },
      ] },
    ],
    culpritId: "ada",
    solution:
      "Apprentice Ada Nwosu let herself into the shop at 05:00 and rented the finished gown to Glamour Studios for a ₦150k model shoot, expecting it back by nine. The studio's tag on the hanger, her messages and the studio receipt traced it. The gown came back by 10:30, just in time for the wedding.",
  },

  /* ================================================================ ENUGU */
  {
    id: "enu-coal",
    tier: 65,
    title: "The Coal Camp Copper",
    hook: "Coal Camp goes dark: three hundred metres of copper cable stripped from the old railway yard overnight.",
    region: ENUGU("Coal Camp"),
    categories: ["heists"],
    tags: ["Enugu", "Coal Camp", "Blackout"],
    bounty: 380_000,
    inspecting: 22700,
    lead: LEAD.enugu,
    victim: "Coal Camp residents (and the power company)",
    briefing:
      "At 02:00 the lights of Coal Camp went out. By dawn, copper cable worth ₦9M had been stripped from the old railway yard. Neighbours saw a crew in power-company vests working calmly with a ladder. Nobody stopped a repair crew.",
    kit: {
      backdrop: { kind: "outdoor", sky: "night", ground: "rails", horizon: "hills" },
      castSide: "right",
      props: [
        { kind: "carriage", x: 50, y: 46, color: "#3a4a3a", name: "Old carriage" },
        { kind: "lamppost", x: 20, y: 44, name: "Cut lamppost" },
        { kind: "ladder", x: 30, y: 60, name: "Ladder" },
        { kind: "coupling", x: 66, y: 66, name: "Rail coupling" },
        { kind: "paper", x: 44, y: 84, name: "Work order" },
        { kind: "okada", x: 84, y: 72, name: "Scrap okada" },
      ],
    },
    clues: [
      { id: "order", name: "Work order", icon: ScrollText, x: 44, y: 84, description: "A “work order” dropped by the ladder.", action: "Rebuild the work order", lab: { kind: "torn", style: "ledger", title: "EEDC WORK ORDER", lines: ["Job: cable replacement", "Site: Coal Camp yard", "Crew lead: U. Nnaji", "Time: 01:30–04:00", "Ref: none", "Stamp: (blurred)", "Not on EEDC system"] }, finding: "Fake. The power company has no such job, and the “crew lead” is U. Nnaji, a scrap metal dealer at Ogbete.", suspectId: "ugo" },
      { id: "ladder", name: "Ladder", icon: Wrench, x: 30, y: 60, description: "Left behind in the rush.", action: "Dust the ladder", lab: { kind: "prints", shape: "finger" }, finding: "Prints of Ugo Nnaji, scrap dealer. Also older prints of the yard watchman, who uses the ladder for the yard lights.", suspectId: "ugo" },
      { id: "okada", name: "Scrap okada", icon: Truck, x: 84, y: 72, description: "An okada with copper shavings in its carrier.", action: "Trace the okada", finding: "Registered to Ugo's scrap yard at Ogbete. Copper shavings match the stolen cable.", suspectId: "ugo" },
      { id: "lamp", name: "Cut lamppost", icon: Cable, x: 20, y: 44, description: "The cable at the base was cut cleanly.", action: "Check the cut", finding: "Cut with heavy cable shears, the kind real linemen use. Lineman Chidi says his shears are locked at the depot, and the depot log agrees.", suspectId: "chidi" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "ugo", name: "Ugo Nnaji", role: "Scrap metal dealer", face: { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "short", shirt: "#f5c518", bg: "#e7e9ed", acc: "cap", mood: "smirk" }, motive: "Copper sells for ₦9,000 a kilo.", alibi: "At his scrap yard in Ogbete, he says.", background: "Buys “old metal” from anybody, no questions.", quote: "I buy scrap. I don't climb poles!", statements: [
        { id: "ugo-1", text: "I have never been to the Coal Camp yard.", lie: { clueId: "ladder", reveal: "I was there. With my boys. In vests from the market." } },
        { id: "ugo-2", text: "That work order is not mine.", lie: { clueId: "order", reveal: "I printed it. Nobody stops a repair crew." } },
      ] },
      { id: "chidi", name: "Chidi Agu", role: "Power-company lineman", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#f5c518", bg: "#e7e9ed", acc: "cap", mood: "worried" }, motive: "Knows exactly where the cables run.", alibi: "Off duty, at home in Abakpa.", background: "Has worked on Coal Camp's cables for ten years.", quote: "We fix cables. We don't eat them!", statements: [
        { id: "chi-1", text: "Ugo asked me last month how much cable is in the yard.", press: "I thought he was making conversation." },
      ] },
      { id: "okeke", name: "Pa Okeke", role: "Yard watchman", face: { skin: "#6b4226", hair: "#cfcfcf", hairStyle: "short", shirt: "#3a3a3a", bg: "#e7e9ed", acc: "fila", accColor: "#3a3a3a", mood: "flat" }, motive: "Let the “crew” in.", alibi: "At the gate all night.", background: "Has watched the yard for thirty years.", quote: "They showed me paper with stamp! What could I do?", statements: [
        { id: "oke-1", text: "The crew showed me a work order and I let them in.", press: "Four boys in vests. The leader had a gold tooth." },
      ] },
    ],
    culpritId: "ugo",
    solution:
      "Scrap dealer Ugo Nnaji printed a fake power-company work order, dressed his boys in vests from the market and stripped 300 metres of copper cable from the Coal Camp yard while the watchman let them in. His prints on the ladder, the fake order and his okada full of copper shavings tied it to him.",
  },
  {
    id: "enu-ogbete",
    tier: 66,
    title: "The Ogbete Esusu Money",
    hook: "₦4.8 million in market-women's esusu savings vanishes from the treasurer's locked box at Ogbete Main Market.",
    region: ENUGU("Ogbete Main Market"),
    categories: ["alley"],
    tags: ["Enugu", "Ogbete", "Esusu"],
    bounty: 360_000,
    inspecting: 20400,
    lead: LEAD.enugu,
    victim: "Ogbete women traders' esusu group",
    briefing:
      "Forty women contribute to the esusu every month. This month's ₦4.8M was in the treasurer's iron box, to be paid out on Saturday. On Friday the box was locked and empty. The treasurer keeps the key around her neck.",
    kit: {
      backdrop: { kind: "outdoor", sky: "day", ground: "dirt", horizon: "city" },
      castSide: "left",
      props: [
        { kind: "sign", x: 50, y: 12, label: "OGBETE MAIN MARKET", color: "#3a3a3a" },
        { kind: "stall", x: 28, y: 52, color: "#8a1a2a", name: "Treasurer's stall" },
        { kind: "chest", x: 56, y: 60, label: "ESUSU", color: "#3a2418", name: "Esusu box" },
        { kind: "books", x: 44, y: 70, name: "Contribution ledger" },
        { kind: "umbrella", x: 80, y: 48, color: "#f5c518" },
        { kind: "phone", x: 70, y: 82, name: "Son's phone" },
        { kind: "kiosk", x: 86, y: 64, label: "KEYS CUT", color: "#4c5660", name: "Key cutter's kiosk" },
      ],
    },
    clues: [
      { id: "box", name: "Esusu box", icon: LockOpen, x: 56, y: 60, description: "Locked, unscratched, empty.", action: "Examine the lock", finding: "Opened with a key, but a fresh copy: tiny brass filings in the keyhole from a newly cut key.", suspectId: "obiora" },
      { id: "kiosk", name: "Key cutter's kiosk", icon: KeyRound, x: 86, y: 64, description: "The key cutter at the market gate.", action: "Ask the key cutter", finding: "Last Sunday a young man brought a soap imprint of an old iron key and paid extra for speed. He described Obiora, the treasurer's son.", suspectId: "obiora" },
      { id: "phone", name: "Son's phone", icon: Smartphone, x: 70, y: 82, description: "Obiora's phone.", action: "Check his transfers", finding: "Friday morning: ₦4.5M deposited into a crypto trading app. By evening the balance was ₦600k.", suspectId: "obiora" },
      { id: "ledger", name: "Contribution ledger", icon: BookOpen, x: 44, y: 70, description: "The esusu ledger.", action: "Audit the ledger", finding: "Every contribution is recorded correctly and signed by two members. The treasurer's books are honest.", suspectId: "nwankwo" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "obiora", name: "Obiora Nwankwo", role: "Treasurer's son", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "mohawk", shirt: "#1d4a8a", bg: "#e7e9ed", acc: "shades", mood: "smirk" }, motive: "A crypto “signal group” promised to double his money in a day.", alibi: "Says he was in class at IMT.", background: "Bright student, too many trading apps.", quote: "Mummy's box? I don't even know where she keeps it!", statements: [
        { id: "obi-1", text: "I don't know where my mother keeps the box.", lie: { clueId: "kiosk", reveal: "I copied her key while she was sleeping. Soap imprint. I'm sorry, Mummy." } },
        { id: "obi-2", text: "I don't trade crypto.", lie: { clueId: "phone", reveal: "The group said it would double by evening. I was going to put it back with profit." } },
      ] },
      { id: "nwankwo", name: "Mrs. Nkiru Nwankwo", role: "Esusu treasurer", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#8a1a2a", bg: "#e7e9ed", acc: "gele", accColor: "#8a1a2a", mood: "worried" }, motive: "Holds the key, keeps the box.", alibi: "At her stall all week.", background: "Treasurer for eight years, never a naira missing.", quote: "This key never leaves my neck. Never!", statements: [
        { id: "nwa-1", text: "My son asked me where I keep the box last week.", press: "He said it was for a school project on savings." },
      ] },
      { id: "okafor", name: "Mazi Okafor", role: "Market chairman", face: { skin: "#4a2c17", hair: "#cfcfcf", hairStyle: "short", shirt: "#3a3a3a", bg: "#e7e9ed", acc: "fila", accColor: "#c0182b", mood: "flat" }, motive: "Wants the women's esusu under his control.", alibi: "At a meeting at the local government office.", background: "Chairman for twenty years. Loves control.", quote: "I told them to bank the money! Nobody listens to me!", statements: [
        { id: "oka-1", text: "I wanted the esusu money in a bank, not a box.", press: "Now they'll listen." },
      ] },
    ],
    culpritId: "obiora",
    solution:
      "Obiora Nwankwo made a soap imprint of his mother's esusu key while she slept and had a copy cut at the market gate. On Friday morning he emptied the box and put ₦4.5M into a crypto app on a “signal group” tip, and lost most of it by evening. The key cutter, the filings in the lock and his transfers exposed him.",
  },
  {
    id: "enu-milliken",
    tier: 67,
    title: "The Milliken Hill Crash",
    hook: "A businessman's SUV is found wrecked below Milliken Hill. No driver, no body, and a ₦300M life insurance policy.",
    region: ENUGU("Milliken Hill"),
    categories: ["vip"],
    tags: ["Enugu", "Milliken Hill", "VIP"],
    bounty: 1_800_000,
    inspecting: 49800,
    lead: LEAD.enugu,
    victim: "Chief Emeka Eze (missing)",
    briefing:
      "Chief Eze's black SUV was found at the bottom of the bend on Milliken Hill at dawn, empty, the driver's door open. His family fears the worst. His insurer is less sure: the policy was raised to ₦300M last month.",
    kit: {
      backdrop: { kind: "outdoor", sky: "dawn", ground: "dirt", horizon: "hills" },
      castSide: "left",
      props: [
        { kind: "sign", x: 50, y: 12, label: "MILLIKEN HILL", color: "#3a3a3a" },
        { kind: "suv", x: 52, y: 56, color: "#1a1a1a", name: "Crashed SUV" },
        { kind: "boulder", x: 22, y: 50 },
        { kind: "lamppost", x: 84, y: 44 },
        { kind: "phone", x: 40, y: 64, name: "Phone in the car" },
        { kind: "footprints", x: 74, y: 80, name: "Footprints uphill" },
        { kind: "paper", x: 28, y: 84, name: "Insurance letter" },
      ],
    },
    clues: [
      { id: "suv", name: "Crashed SUV", icon: Car, x: 52, y: 56, description: "Heavy damage at the front, but…", action: "Inspect the car", finding: "The gearbox is in neutral, the handbrake off and there are no skid marks: the car was pushed off the bend, not driven.", suspectId: "eze" },
      { id: "phone", name: "Phone in the car", icon: Smartphone, x: 40, y: 64, description: "Chief Eze's second phone, in the glovebox.", action: "Recover deleted messages", finding: "To his cousin in Udi, two days ago: “After the funeral, send the money to the new account. Don't tell my wife anything yet.”", suspectId: "eze" },
      { id: "steps", name: "Footprints uphill", icon: Footprints, x: 74, y: 80, description: "Footprints leading away from the wreck, uphill.", action: "Cast the footprints", lab: { kind: "prints", shape: "boot" }, finding: "Expensive Italian loafers, size 45, walking calmly uphill to tyre marks of a waiting car. Chief Eze wears size 45 Italian loafers.", suspectId: "eze" },
      { id: "letter", name: "Insurance letter", icon: Banknote, x: 28, y: 84, description: "A letter from the insurer, on the roadside.", action: "Read the letter", finding: "Policy raised to ₦300M last month, at Chief Eze's own request. Beneficiary: his business partner Mr. Nnaji, who seems not to have known.", suspectId: "nnaji" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "eze", name: "Chief Emeka Eze", role: "Businessman (the “missing” man)", face: { skin: "#4a2c17", hair: "#cfcfcf", hairStyle: "short", shirt: "#1a1a1a", bg: "#e7e9ed", acc: "fila", accColor: "#c0182b", mood: "smirk" }, motive: "Drowning in debt. Dead men don't pay banks.", alibi: "Found “recovering” at his cousin's house in Udi.", background: "Owns hotels and filling stations, owes billions.", quote: "I survived by the grace of God! I crawled out!", statements: [
        { id: "eze-1", text: "I lost control on the bend and crawled out.", lie: { clueId: "suv", reveal: "The car was pushed. I walked away. Nobody was hurt." } },
        { id: "eze-2", text: "I've been in hospital in Udi since the crash.", lie: { clueId: "phone", reveal: "My cousin hid me. After the insurance paid, I was going to “come back from the dead”." } },
      ] },
      { id: "nnaji", name: "Mr. Paul Nnaji", role: "Business partner", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "slick", shirt: "#2b2f36", bg: "#e7e9ed", acc: "glasses", mood: "worried" }, motive: "Beneficiary of the ₦300M policy.", alibi: "In Abuja on business, flight records confirm.", background: "Runs the books for Chief Eze's companies.", quote: "Three hundred million? Me? I didn't even know!", statements: [
        { id: "nna-1", text: "Chief asked me to sign some insurance papers last month.", press: "He said it was for the bank. I didn't read them." },
      ] },
      { id: "sunday", name: "Sunday Ugwu", role: "Tow-truck driver", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#f5c518", bg: "#e7e9ed", acc: "cap", mood: "flat" }, motive: "First at the scene. Could have moved things.", alibi: "Called out by the police at 06:10.", background: "Pulls cars off Milliken Hill every week.", quote: "I tow cars. I don't push them!", statements: [
        { id: "sun-1", text: "The car was in neutral when I got there.", press: "Nobody leaves a car in neutral after a crash." },
      ] },
    ],
    culpritId: "eze",
    solution:
      "Chief Emeka Eze faked his own death to escape his debts and cash in a ₦300M life policy. He pushed his empty SUV off the Milliken Hill bend, walked uphill to a waiting car and hid at his cousin's house in Udi. Neutral gear and no skid marks, his loafer prints and the deleted messages unmasked him.",
  },
];
