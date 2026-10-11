import {
  Bus,
  Cable,
  Cctv,
  ClipboardList,
  Droplets,
  Footprints,
  Fuel,
  Lamp,
  Laptop,
  Receipt,
  ScrollText,
  ShoppingBasket,
  Ship,
  Trash2,
  Video,
} from "lucide-react";
import type { CrimeCase, Face } from "../types";

/** More Lagos: the Third Mainland Bridge, Oshodi, Makoko and the Lekki toll plaza. */

const AMAKA: Face = { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#14161b", bg: "#e7e9ed", acc: "glasses", mood: "smirk" };
const SEGUN: Face = { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#1d2f5a", bg: "#e7e9ed", acc: "cap", mood: "flat" };

const LAGOS = (place: string) => ({ state: "Lagos", place, music: "lagos" as const });

export const LAGOS_MORE: CrimeCase[] = [
  /* ================================================================ THIRD MAINLAND BRIDGE */
  {
    id: "lag-mainland",
    tier: 68,
    title: "Diversion on Third Mainland",
    hook: "A cash van “breaks down” in the middle of Third Mainland Bridge. Police divert the traffic, and ₦38M disappears while everyone waits.",
    region: LAGOS("Third Mainland Bridge"),
    categories: ["heists"],
    tags: ["Third Mainland", "Cash van", "Diversion"],
    bounty: 480_000,
    inspecting: 41200,
    lead: { name: "Insp. Amaka Eze", face: AMAKA },
    victim: "SecureCash van LND-442 (four cash boxes, ₦38M)",
    briefing:
      "At 06:40 a cash-in-transit van stopped dead in the middle lane of Third Mainland Bridge, near the Adekunle end. Police closed the carriageway and pushed the morning traffic through the median into contraflow. By 07:30 four cash boxes were gone. The guard says two men on an okada snatched them while he went to buy water. Okadas are banned on the bridge, and nobody in thousands of passing cars saw one.",
    kit: {
      backdrop: { kind: "outdoor", sky: "dawn", ground: "road", horizon: "mainland" },
      castSide: "left",
      props: [
        { kind: "van", x: 50, y: 52, name: "Cash van" },
        { kind: "patrol", x: 86, y: 60, name: "Police pickup" },
        { kind: "cone", x: 22, y: 56, name: "Cone" },
        { kind: "cone", x: 76, y: 54 },
        { kind: "coil", x: 36, y: 70, color: "#1d6ac8", name: "Blue rope" },
        { kind: "paper", x: 62, y: 80, name: "Torn note" },
        { kind: "tape", x: 30, y: 90 },
        { kind: "tape", x: 74, y: 90 },
      ],
    },
    clues: [
      { id: "fuel", name: "Fuel line", icon: Fuel, x: 50, y: 52, description: "The driver says the van just died on the bridge.", action: "Open the engine bay", finding: "The fuel line wasn't torn. It was squeezed shut with a hose clip, the kind a driver keeps in his toolbox. Somebody stopped this van on purpose, right where they wanted it.", suspectId: "kayode" },
      { id: "rope", name: "Blue rope", icon: Cable, x: 36, y: 70, description: "A coil of wet blue nylon rope by the van's back doors.", action: "Match the fibres", finding: "Fishing rope from a net-maker in Makoko, still wet with lagoon water and scraped by the parapet. The net-maker remembers selling it last week to a man in a SecureCash uniform with a driver's badge.", suspectId: "kayode" },
      { id: "note", name: "Torn note", icon: ScrollText, x: 62, y: 80, description: "Scraps of paper blown against the kerb.", action: "Rebuild the note", lab: { kind: "torn", style: "ledger", title: "MONDAY", lines: ["Stop: 3MB, Adekunle end", "Time: 06:40, middle lane", "Hazards: flash 3 times", "Boat: under pillar 14", "Lower 4 boxes, blue rope", "Call LASTMA yourself", "Say: engine die"] }, finding: "A plan written before the “breakdown”: where to stop, the hazard signal for a boat under the bridge, and how many boxes to lower. Only the driver controls the van's hazards.", suspectId: "kayode" },
      { id: "dashcam", name: "Patrol dashcam", icon: Video, x: 86, y: 60, description: "The police pickup's dashcam ran from the moment it arrived.", action: "Play the footage", finding: "06:52: the van's hazards flash three times, then stop. No okada anywhere on the bridge. At 07:05 the guard is 200 metres away at a water hawker while the driver works alone at the back of the van, leaning over the parapet.", suspectId: "emeka" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "kayode", name: "Kayode Alabi", role: "Van driver", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "short", shirt: "#1d6a3a", bg: "#e7e9ed", acc: "cap", mood: "worried" }, motive: "Owes a loan app ₦6M and has been driving the same route for nine years.", alibi: "Says he sat in the cab waiting for a mechanic.", background: "Knows every pillar of the bridge. Grew up in Makoko.", quote: "Na engine wahala! Me I just dey wait mechanic.", statements: [
        { id: "kay-1", text: "The fuel line burst by itself. Old van.", lie: { clueId: "fuel", reveal: "The clip was mine. I needed the van to stop at the right pillar." } },
        { id: "kay-2", text: "I never left the cab. Ask anybody.", lie: { clueId: "dashcam", reveal: "Fine, I was at the back. I was checking the doors." } },
        { id: "kay-3", text: "I don't know anybody in Makoko any more.", lie: { clueId: "rope", reveal: "My cousin has a canoe. He was waiting under pillar 14." } },
      ] },
      { id: "emeka", name: "Emeka Obi", role: "Cash guard", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#1d2126", bg: "#e7e9ed", acc: "shades", mood: "flat" }, motive: "Left the van alone, which is enough to lose his job.", alibi: "Says he went to buy water and came back to find two okada men running.", background: "Six months on the job. Hates early shifts.", quote: "Two of them! On okada! Dem fast well well!", statements: [
        { id: "eme-1", text: "Two men on an okada snatched the boxes.", lie: { clueId: "dashcam", reveal: "I didn't see anybody. When I came back the boxes were gone, and Kayode said tell them okada." } },
        { id: "eme-2", text: "I was only gone two minutes.", press: "Okay, maybe twenty. The water woman was far and she was telling me gist." },
      ] },
      { id: "ronke", name: "Ronke Balogun", role: "LASTMA officer", face: { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "bun", shirt: "#f0c419", bg: "#e7e9ed", acc: "cap", accColor: "#6a1a2a", mood: "smile" }, motive: "Set up the diversion that hid the back of the van from passing cars.", alibi: "Directing traffic at the median gap the whole time.", background: "Fifteen years on Lagos roads. Nobody argues with her whistle.", quote: "My work na traffic. I no sabi anything about money.", statements: [
        { id: "ron-1", text: "The driver called our office himself at 06:44 and asked us to close the lane.", press: "He said it was for safety. He even told us which lanes to cone off." },
      ] },
    ],
    culpritId: "kayode",
    solution:
      "Driver Kayode Alabi clipped his own fuel line so the van would stop at pillar 14, called LASTMA to close the lane so passing cars couldn't see the back of the van, then flashed his hazards for his cousin's canoe and lowered four cash boxes on blue fishing rope. The guard's okada story was Kayode's idea.",
  },

  /* ================================================================ OSHODI */
  {
    id: "lag-oshodi",
    tier: 69,
    title: "Oshodi Under-Bridge Hustle",
    hook: "A banker slips at Oshodi interchange. A kind young man helps her up. Five minutes later her phone and a ₦2.5M bank draft are gone.",
    region: LAGOS("Oshodi"),
    categories: ["alley"],
    tags: ["Oshodi", "Pickpocket", "Danfo"],
    bounty: 340_000,
    inspecting: 33800,
    lead: { name: "Sgt. Segun Afolabi", face: SEGUN },
    victim: "Mrs Funmi Adeoye (phone and a ₦2.5M bank draft)",
    briefing:
      "At 16:05 Mrs Funmi Adeoye slipped by the steps of the Oshodi interchange. A polite young man helped her up and dusted her off. By the time she reached her danfo, her bag was unzipped and her phone and bank draft were gone. The conductor says area boys ran towards Bolade.",
    kit: {
      backdrop: { kind: "outdoor", sky: "day", ground: "road", horizon: "city" },
      castSide: "right",
      props: [
        { kind: "sign", x: 50, y: 14, label: "OSHODI INTERCHANGE", color: "#1d6a3a" },
        { kind: "bus", x: 24, y: 47, label: "OSHODI–OBALENDE", name: "Danfo" },
        { kind: "umbrella", x: 88, y: 50, color: "#1d4a8a" },
        { kind: "hawker", x: 72, y: 62, name: "Gala hawker" },
        { kind: "puddle", x: 50, y: 70, color: "#8a6a18", name: "Oil slick" },
        { kind: "bin", x: 30, y: 74, s: 0.6, color: "#1f5a3a", label: "LAWMA", name: "Bin" },
        { kind: "cctv", x: 12, y: 22, name: "Interchange camera" },
        { kind: "okada", x: 60, y: 56 },
      ],
    },
    clues: [
      { id: "oil", name: "Oil slick", icon: Droplets, x: 50, y: 70, description: "A shiny patch where Mrs Adeoye slipped.", action: "Test the slick", finding: "Fresh groundnut oil, poured on one spot only a few minutes before she fell. Somebody made sure the next person through would slip right there." },
      { id: "camera", name: "Interchange camera", icon: Cctv, x: 12, y: 22, description: "The interchange camera covers the steps and the danfo bay.", action: "Pull the 16:00 footage", finding: "16:02: a young man in a white polo empties a small bottle by the steps and waits at the rail. 16:05: he helps Mrs Adeoye up, and his hand goes into her bag while he dusts her off. 16:07: he leans into the parked danfo for a second.", suspectId: "dele" },
      { id: "bottle", name: "Bottle in the bin", icon: Trash2, x: 30, y: 74, description: "An empty groundnut-oil bottle in the LAWMA bin.", action: "Dust the bottle", lab: { kind: "prints", shape: "finger" }, finding: "Clear thumbprints that match Dele Ogunleye, who has two old pickpocketing cautions at Oshodi.", suspectId: "dele" },
      { id: "seat", name: "Danfo back seat", icon: Bus, x: 24, y: 47, description: "The danfo was parked with its doors open.", action: "Search the back seat", finding: "Pushed under the back seat: Mrs Adeoye's empty purse. The phone and draft are gone. Sule's danfo was the nearest place to dump it, which is what the camera shows Dele doing at 16:07.", suspectId: "sule" },
      { id: "tray", name: "Hawker's tray", icon: ShoppingBasket, x: 72, y: 62, description: "Musa sells gala and Lacasera by the steps.", action: "Check the tray", finding: "Gala, three Lacasera bottles and ₦4,200 in small notes. No phone, no draft. Musa was busy selling the whole time.", suspectId: "musa" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "dele", name: "Dele Ogunleye", role: "“Good Samaritan”", face: { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "short", shirt: "#f2f2e8", bg: "#e7e9ed", mood: "smile" }, motive: "Makes a living from people who fall at Oshodi.", alibi: "Says he was passing through to catch a BRT.", background: "Very polite. Very fast hands.", quote: "Is it a crime to help an elderly woman?", statements: [
        { id: "del-1", text: "I was just passing. I don't know anything about oil.", lie: { clueId: "bottle", reveal: "Okay, the oil was mine. But helping her up is not stealing." } },
        { id: "del-2", text: "I never touched her bag. I only held her arm.", lie: { clueId: "camera", reveal: "My hand slipped into the bag. It happens." } },
      ] },
      { id: "sule", name: "Sule Bakare", role: "Danfo conductor", face: { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#f5c518", bg: "#e7e9ed", acc: "cap", mood: "smirk" }, motive: "Her purse was found in his danfo.", alibi: "Shouting “Obalende! Enter with your change!” at the bay.", background: "Knows every area boy at Oshodi by name.", quote: "Purse inside my bus? Anybody fit throw am there!", statements: [
        { id: "sul-1", text: "I saw area boys run towards Bolade.", press: "Okay, I didn't see them myself. Everybody was shouting it, so I shouted it too." },
      ] },
      { id: "musa", name: "Musa Garba", role: "Gala hawker", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#c0182b", bg: "#e7e9ed", mood: "flat" }, motive: "Stood two metres from where she fell.", alibi: "Selling gala by the steps.", background: "Sells at the same spot every day.", quote: "Gala and Lacasera! Ah, Oga, I no see anything.", statements: [
        { id: "mus-1", text: "That white polo boy has been at the steps all week, and people keep falling there.", press: "Every afternoon one person falls, and every time he is the one helping." },
      ] },
    ],
    culpritId: "dele",
    solution:
      "Dele Ogunleye poured groundnut oil by the interchange steps, waited for someone to slip, and picked Mrs Adeoye's bag while “helping” her up. He dumped the empty purse in Sule's danfo. The camera, his prints on the oil bottle and the purse in the danfo proved it.",
  },

  /* ================================================================ MAKOKO */
  {
    id: "lag-makoko",
    tier: 70,
    title: "Night Engines of Makoko",
    hook: "Three outboard engines vanish from fishermen's canoes at the Makoko waterfront in one night. The community levy collector blames a speedboat gang.",
    region: LAGOS("Makoko"),
    categories: ["alley"],
    tags: ["Makoko", "Lagoon", "Engines"],
    bounty: 380_000,
    inspecting: 22600,
    lead: { name: "Insp. Amaka Eze", face: AMAKA },
    victim: "Three Makoko fishermen (₦4.8M of outboard engines)",
    briefing:
      "Three 15-horsepower outboard engines were unbolted from canoes at the Makoko waterfront between midnight and dawn. Every fisherman pays a weekly “security levy” for a night guard. The guard says he heard a speedboat from Ebute Metta. The levy collector, “Chairman” Femi, has already asked everyone for extra money for “new security”.",
    kit: {
      backdrop: { kind: "outdoor", sky: "night", ground: "sand", horizon: "sea" },
      castSide: "left",
      props: [
        { kind: "hut", x: 72, y: 44, name: "Guard's hut" },
        { kind: "canoe", x: 44, y: 60, label: "no-engine", name: "Stripped canoe" },
        { kind: "canoe", x: 80, y: 70, color: "#4a6a8a", name: "Sewanu's canoe" },
        { kind: "lantern", x: 62, y: 54, name: "Guard's lantern" },
        { kind: "footprints", x: 50, y: 78, name: "Boot prints" },
        { kind: "paper", x: 30, y: 84, name: "Levy book" },
        { kind: "drum", x: 22, y: 58 },
        { kind: "crate", x: 90, y: 52, label: "FISH" },
      ],
    },
    clues: [
      { id: "mount", name: "Engine mount", icon: Ship, x: 44, y: 60, description: "The canoe's engine bracket is empty.", action: "Examine the clamp", finding: "The clamp screws were undone neatly with a spanner, not cut. Whoever took the engine had time, light and no fear of being seen. That isn't a speedboat gang in a hurry." },
      { id: "boots", name: "Boot prints", icon: Footprints, x: 50, y: 78, description: "Deep boot prints in the mud from canoe to canoe.", action: "Cast a print", lab: { kind: "prints", shape: "boot" }, finding: "Rubber boots, size 45, with a torn left heel: the boots Chairman Femi wears every Saturday to collect the levy.", suspectId: "femi" },
      { id: "book", name: "Levy book", icon: ClipboardList, x: 30, y: 84, description: "Pages torn from the levy collector's book, dropped by the water.", action: "Rebuild the pages", lab: { kind: "torn", style: "ledger", title: "SECURITY LEVY", lines: ["Paid: Sewanu N5,000", "Paid: Kokoun N5,000", "Engines: 3 x 15hp", "Buyer: Mr Kpanou, Badagry", "N2,700,000 cash", "Guard: buy kerosene small", "Collect Saturday night"] }, finding: "Between the levy payments: three engines, a buyer in Badagry and ₦2.7M cash. And a note to give the guard too little kerosene.", suspectId: "femi" },
      { id: "lantern", name: "Guard's lantern", icon: Lamp, x: 62, y: 54, description: "The night guard's hurricane lantern.", action: "Check the tank", finding: "Bone dry. Baba Ojo was given half a bottle of kerosene; it ran out around 01:00, and after that the waterfront was dark. He wasn't watching anything after one o'clock.", suspectId: "ojo" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "femi", name: "“Chairman” Femi Hunsa", role: "Levy collector", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "short", shirt: "#7a1f6a", bg: "#e7e9ed", acc: "shades", mood: "smirk" }, motive: "Sold the engines in Badagry and now wants more levy for “new security”.", alibi: "Says he was at a vigil in Yaba all night.", background: "Collects the security levy and decides who gets a canoe spot.", quote: "Speedboat people! I don tell una say we need more security money!", statements: [
        { id: "fem-1", text: "I was at a vigil in Yaba from ten until morning.", lie: { clueId: "boots", reveal: "I came back around two. Only to check on things." } },
        { id: "fem-2", text: "I don't know any engine buyer. I'm a community man.", lie: { clueId: "book", reveal: "Kpanou is a business contact. The engines were... insurance for the community." } },
      ] },
      { id: "ojo", name: "Baba Ojo", role: "Night guard", face: { skin: "#4a2c17", hair: "#d8d8d8", hairStyle: "short", shirt: "#3a5a3a", bg: "#e7e9ed", acc: "fila", accColor: "#3a5a3a", mood: "worried" }, motive: "Was paid to watch the canoes and didn't.", alibi: "Says he was awake all night.", background: "Seventy-one years old, guards the waterfront for ₦15,000 a week.", quote: "I hear speedboat engine, vroom, from Ebute Metta side!", statements: [
        { id: "ojo-1", text: "I was awake all night with my lantern.", lie: { clueId: "lantern", reveal: "The kerosene finished. I slept small in the hut. The Chairman gave me only half a bottle." } },
      ] },
      { id: "sewanu", name: "Sewanu Kokoun", role: "Fisherman", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#1d4a8a", bg: "#e7e9ed", mood: "flat" }, motive: "His canoe is the only one that still has its engine.", alibi: "Sleeping in his house on stilts.", background: "Quarrelled with Femi last month about the levy.", quote: "Because my engine dey, I become thief?", statements: [
        { id: "sew-1", text: "I refused to pay the extra levy last month.", press: "Femi told me, “Your engine will learn sense.” Then the others' engines went and mine stayed, so everyone looks at me." },
      ] },
    ],
    culpritId: "femi",
    solution:
      "Chairman Femi Hunsa gave the night guard too little kerosene so the waterfront went dark, unbolted three engines himself and sold them to a buyer in Badagry for ₦2.7M. He left Sewanu's engine alone to frame the man who refused his levy. His boot prints and his own levy book gave him away.",
  },

  /* ================================================================ LEKKI TOLL */
  {
    id: "lag-tollgate",
    tier: 71,
    title: "The Lekki Toll Shortfall",
    hook: "Lane 4 at the Lekki toll plaza is ₦9.4M short in three weeks. The counter says fewer cars passed than the cameras saw.",
    region: LAGOS("Lekki toll plaza"),
    categories: ["cyber"],
    tags: ["Lekki", "Toll", "Night shift"],
    bounty: 420_000,
    inspecting: 28900,
    lead: { name: "Sgt. Segun Afolabi", face: SEGUN },
    victim: "Lekki toll plaza, Lane 4 (₦9.4M)",
    briefing:
      "For three weeks, Lane 4's axle counter has shown fewer cars than the plaza cameras. The cash drawer always matches the counter exactly, so on paper nothing is missing. The auditors think someone is taking cash for cars the counter never saw.",
    kit: {
      backdrop: { kind: "outdoor", sky: "dusk", ground: "road", horizon: "city" },
      castSide: "left",
      props: [
        { kind: "sign", x: 50, y: 12, label: "LEKKI TOLL PLAZA", color: "#f5c518" },
        { kind: "tollbooth", x: 22, y: 50, label: "LANE 3" },
        { kind: "tollbooth", x: 56, y: 50, label: "LANE 4", color: "#c0182b", name: "Lane 4 booth" },
        { kind: "tollbooth", x: 90, y: 50, label: "LANE 5" },
        { kind: "car", x: 44, y: 66, color: "#8a1a2a" },
        { kind: "cctv", x: 92, y: 22, name: "Plaza camera" },
        { kind: "desk", x: 74, y: 80, name: "Supervisor's desk" },
        { kind: "laptop", x: 74, y: 77, name: "Supervisor's laptop" },
        { kind: "paper", x: 26, y: 84, name: "Shift log" },
      ],
    },
    clues: [
      { id: "counter", name: "Lane 4 counter", icon: Receipt, x: 56, y: 50, description: "The axle counter that decides how much cash the lane should hold.", action: "Read the counter settings", finding: "Between 22:00 and 02:00 the counter skips every seventh car. The setting was changed with a supervisor login, not an IT one.", suspectId: "bayo" },
      { id: "camera", name: "Plaza camera", icon: Cctv, x: 92, y: 22, description: "Cameras over every lane count cars by number plate.", action: "Count the cars", finding: "4,120 more cars than the counter over three weeks. And every night at 02:10, supervisor Bayo empties Lane 4's drawer himself “for safety”, before the collector hands over.", suspectId: "bayo" },
      { id: "laptop", name: "Supervisor's laptop", icon: Laptop, x: 74, y: 77, description: "The night supervisor's work laptop.", action: "Check the admin log", finding: "The counter change was made from this laptop at 23:14 on the first night of the shortfall, using Bayo Onasanya's password.", suspectId: "bayo" },
      { id: "log", name: "Shift log", icon: ScrollText, x: 26, y: 84, description: "Lane 4's handover log.", action: "Read the handovers", finding: "Ada Nwosu works Lane 4 until 22:00. Every one of her shifts matches the cameras exactly. The missing cars are all after she leaves.", suspectId: "ada" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "bayo", name: "Bayo Onasanya", role: "Night supervisor", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "slick", shirt: "#1d4a8a", bg: "#e7e9ed", acc: "glasses", mood: "smile" }, motive: "Building a house in Ibeju-Lekki on a supervisor's salary.", alibi: "Says he only signs the reports.", background: "Eight years at the plaza. Everybody calls him Oga Night.", quote: "Me? I only sign papers. Counters are for IT people.", statements: [
        { id: "bay-1", text: "I never touch the lane drawers. Collectors hand over to the bank van.", lie: { clueId: "camera", reveal: "I empty Lane 4 at night. For safety. Mostly for safety." } },
        { id: "bay-2", text: "Only IT can change a counter.", lie: { clueId: "laptop", reveal: "Supervisors can too. I may have... adjusted it." } },
      ] },
      { id: "ada", name: "Ada Nwosu", role: "Lane 4 collector", face: { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "bun", shirt: "#c0182b", bg: "#e7e9ed", mood: "worried" }, motive: "Her lane, her drawer.", alibi: "Works until 22:00, then goes home to Ajah.", background: "Top collector two years running.", quote: "My drawer always balance! Check my log!", statements: [
        { id: "ada-1", text: "When I come in at 14:00 the counter has already been reset by night shift.", press: "Every morning the night totals are “corrected”. Oga Night says it's normal." },
      ] },
      { id: "tunde", name: "Tunde Balogun", role: "IT contractor", face: { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "curly", shirt: "#1d1f22", bg: "#e7e9ed", acc: "visor", mood: "flat" }, motive: "Installed the counters and has the master password.", alibi: "Was in Abuja for two of the three weeks.", background: "Installs toll systems across the country.", quote: "My code no dey skip cars unless person tell am to.", statements: [
        { id: "tun-1", text: "Every supervisor login can change the night settings. I warned them.", press: "I sent an email in March asking them to lock it. Nobody replied." },
      ] },
    ],
    culpritId: "bayo",
    solution:
      "Night supervisor Bayo Onasanya used his own login to make Lane 4's counter skip every seventh car at night, then emptied the drawer himself at 02:10 and kept the cash for the cars the counter never saw. The cameras, the admin log and Ada's clean day shifts proved it.",
  },
];
