import {
  Banknote,
  BookOpen,
  Camera,
  Cctv,
  Coins,
  Droplets,
  Feather,
  Fingerprint,
  Footprints,
  Gauge,
  Gem,
  KeyRound,
  LockOpen,
  Package,
  Receipt,
  ScrollText,
  Shirt,
  Smartphone,
  Truck,
  Wallet,
  Wrench,
} from "lucide-react";
import type { CrimeCase, Face } from "../types";

/** City cases: Abuja, Kano and Ilorin. */

const HAUWA: Face = { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#1d6a3a", bg: "#e7e9ed", acc: "glasses", mood: "smile" };
const AMINU: Face = { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "short", shirt: "#a3601c", bg: "#e7e9ed", acc: "fila", accColor: "#f2f2e8", mood: "smile" };
const RUKAYAT: Face = { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "bun", shirt: "#6a3a8a", bg: "#e7e9ed", acc: "gele", accColor: "#6a3a8a", mood: "smirk" };

const LEAD = {
  abuja: { name: "Insp. Hauwa Garba", face: HAUWA },
  kano: { name: "Insp. Aminu Sule", face: AMINU },
  ilorin: { name: "Insp. Rukayat Alabi", face: RUKAYAT },
};

const ABUJA = (place: string) => ({ state: "FCT", place, music: "abuja" as const });
const KANO = (place: string) => ({ state: "Kano", place, music: "sahel" as const });
const ILORIN = (place: string) => ({ state: "Kwara", place, music: "fuji" as const });

export const CITY_CASES_NORTH: CrimeCase[] = [
  /* ================================================================ ABUJA */
  {
    id: "abj-wuse",
    tier: 41,
    title: "The Wuse Market Phone Swap",
    hook: "Forty brand-new phones locked in a Wuse Market shop overnight. By morning, forty dummy phones.",
    region: ABUJA("Wuse Market"),
    categories: ["cyber", "alley"],
    tags: ["Abuja", "Wuse", "Phones"],
    bounty: 380_000,
    inspecting: 24600,
    lead: LEAD.abuja,
    victim: "Mallam Isa Yusuf, phone dealer, Wuse Market",
    briefing:
      "Isa Yusuf locked forty sealed phones in his glass cabinet at 18:00. At 08:00 the boxes were all there, seals neat, but every phone inside was a plastic dummy. The shop shutter was never forced. Three people had keys or time alone with the stock.",
    kit: {
      backdrop: { kind: "outdoor", sky: "day", ground: "concrete", horizon: "city" },
      castSide: "right",
      props: [
        { kind: "sign", x: 50, y: 12, label: "WUSE MARKET", color: "#1d6a3a" },
        { kind: "kiosk", x: 30, y: 52, label: "ISA PHONES", color: "#1d6a3a", name: "Isa's phone shop" },
        { kind: "crate", x: 58, y: 66, label: "STOCK", name: "Stock carton" },
        { kind: "phone", x: 30, y: 60, name: "Dummy phone" },
        { kind: "cctv", x: 76, y: 30, name: "Market camera" },
        { kind: "umbrella", x: 78, y: 50, color: "#c0182b", name: "Rival's umbrella" },
        { kind: "paper", x: 42, y: 84, name: "Delivery note" },
        { kind: "okada", x: 14, y: 78, name: "Delivery okada" },
      ],
    },
    clues: [
      { id: "dummy", name: "Dummy phone", icon: Smartphone, x: 30, y: 60, description: "A perfect plastic copy, even the weight is right. Glued seal on the box.", action: "Dust the box seal", lab: { kind: "prints", shape: "finger" }, finding: "Fresh prints under the re-glued seal belong to Bashir, Isa's apprentice. He says he never opened the sealed stock.", suspectId: "bashir" },
      { id: "camera", name: "Market camera", icon: Cctv, x: 76, y: 30, description: "The market association's camera points at the row of shops.", action: "Pull last night's footage", finding: "At 18:40 Bashir comes back alone with a carton, stays 20 minutes, leaves with the same carton looking much heavier.", suspectId: "bashir" },
      { id: "note", name: "Delivery note", icon: Receipt, x: 42, y: 84, description: "A crumpled delivery note blown into the gutter.", action: "Read the delivery note", finding: "“40 display dummies, ₦2,000 each. Collect at Banex.” Signed for by B. Musa. Bashir's surname is Musa.", suspectId: "bashir" },
      { id: "okada", name: "Delivery okada", icon: Truck, x: 14, y: 78, description: "The rider who delivers for the rival stall, Chuks.", action: "Check the rider's log", finding: "Chuks's rider was in Nyanya all evening with a receipt for every drop. Chuks's goods never came near Isa's shop.", suspectId: "chuks" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "bashir", name: "Bashir Musa", role: "Isa's apprentice", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "short", shirt: "#e8e0d0", bg: "#e7e9ed", acc: "cap", mood: "worried" }, motive: "Wants to open his own shop and has no capital.", alibi: "Says he went straight home to Kubwa at 18:00.", background: "Three years with Isa. Knows every phone by heart and the cabinet combination too.", quote: "Oga Isa is like my father! I can't do am!", statements: [
        { id: "bas-1", text: "I went home at six. I didn't come back.", lie: { clueId: "camera", reveal: "Okay, I came back. I forgot my charger… and maybe I did small business." } },
        { id: "bas-2", text: "I never touched the sealed boxes.", lie: { clueId: "dummy", reveal: "Ehn… I re-glued them. The dummies came from Banex. I'm sorry, sir." } },
      ] },
      { id: "chuks", name: "Chuks Okeke", role: "Rival phone dealer", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#c0182b", bg: "#e7e9ed", acc: "shades", mood: "smirk" }, motive: "Isa undercuts his prices every week.", alibi: "At his shop until 19:00, then a church meeting.", background: "Loud, flashy, sells the same phones a bit dearer.", quote: "If I wan steal, I go steal better phones than Isa own!", statements: [
        { id: "chu-1", text: "My rider was nowhere near Isa's shop.", press: "Check his log. Nyanya, Karu, Mararaba. Every drop get receipt." },
        { id: "chu-2", text: "I saw Bashir with a heavy carton yesterday.", press: "Around half six. I thought it was returns." },
      ] },
      { id: "isa", name: "Mallam Isa Yusuf", role: "Shop owner", face: { skin: "#4a2c17", hair: "#cfcfcf", hairStyle: "short", shirt: "#1d6a3a", bg: "#e7e9ed", acc: "fila", accColor: "#1d6a3a", mood: "worried" }, motive: "Could claim the loss on his supplier's insurance.", alibi: "Closed at six, home in Garki with family.", background: "Twenty years in Wuse. Never been robbed before.", quote: "Forty phones! My whole month!", statements: [
        { id: "isa-1", text: "Only Bashir and I know the cabinet code.", press: "I trust that boy like my own son. Or I did." },
      ] },
    ],
    culpritId: "bashir",
    solution:
      "Bashir Musa bought forty display dummies at Banex, came back at 18:40, opened each sealed box, swapped the real phones for dummies and re-glued the seals. The market camera, his prints under the seals and the delivery note in his name finished him.",
  },
  {
    id: "abj-jabi",
    tier: 42,
    title: "Missing at Jabi Lake",
    hook: "The paddle-boat stand's Sunday takings vanish between the jetty and the cash box.",
    region: ABUJA("Jabi Lake"),
    categories: ["heists"],
    tags: ["Abuja", "Jabi Lake", "Cash"],
    bounty: 420_000,
    inspecting: 19800,
    lead: LEAD.abuja,
    victim: "Jabi Lake Boat Rides (₦1.4M Sunday takings)",
    briefing:
      "Sunday is the busiest day at Jabi Lake. At 19:00 the boat stand's cash box was counted, locked and left by the jetty for ten minutes while the last boats came in. When the manager came back, the box was there, locked, and empty.",
    kit: {
      backdrop: { kind: "outdoor", sky: "dusk", ground: "sand", horizon: "sea" },
      castSide: "left",
      props: [
        { kind: "boat", x: 70, y: 46, s: 1.4, name: "Paddle boat" },
        { kind: "chest", x: 46, y: 58, label: "CASH", color: "#2b3440", name: "Cash box" },
        { kind: "umbrella", x: 22, y: 46, color: "#f5c518", name: "Ticket umbrella" },
        { kind: "kiosk", x: 84, y: 60, label: "BOAT RIDES", color: "#1d4a8a", name: "Ticket booth" },
        { kind: "lifebuoy", x: 60, y: 76, name: "Lifebuoy" },
        { kind: "footprints", x: 34, y: 82, name: "Wet footprints" },
        { kind: "bench", x: 20, y: 64 },
      ],
    },
    clues: [
      { id: "box", name: "Locked cash box", icon: LockOpen, x: 46, y: 58, description: "Locked, unbroken, empty. The key never left the manager's pocket, he says.", action: "Examine the lock", finding: "No scratches. It was opened with a key, and the spare key's tag is missing from the booth's hook.", suspectId: "kemi" },
      { id: "steps", name: "Wet footprints", icon: Footprints, x: 34, y: 82, description: "Small wet sandal prints from the booth to the box, then to the jetty edge.", action: "Cast the footprints", lab: { kind: "prints", shape: "boot" }, finding: "Size 38 sandals with a star pattern. Kemi wears exactly those. Boatman Dauda works barefoot and is size 44.", suspectId: "kemi" },
      { id: "booth", name: "Ticket booth", icon: KeyRound, x: 84, y: 60, description: "The booth where the spare keys hang.", action: "Check the key hooks", finding: "The spare cash-box key is gone. The booth was locked at 18:50 by Kemi, the ticket girl, who keeps its only key.", suspectId: "kemi" },
      { id: "buoy", name: "Lifebuoy", icon: Wallet, x: 60, y: 76, description: "A lifebuoy that looks oddly heavy, tied to a post.", action: "Open the lifebuoy", finding: "Stuffed inside: ₦1.4M in a waterproof bag, and a note: “Babe, collect after dark by jet ski. K.”", suspectId: "kemi" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "kemi", name: "Kemi Adebayo", role: "Ticket girl", face: { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "long", shirt: "#f5c518", bg: "#e7e9ed", acc: "earring", mood: "smile" }, motive: "School fees due next week, and a boyfriend with big ideas.", alibi: "Says she locked the booth at 18:50 and went to the car park.", background: "Bright, organised, trusted with the booth key.", quote: "I sell tickets. I don't even touch the cash box!", statements: [
        { id: "kemi-1", text: "I never went near the cash box.", lie: { clueId: "steps", reveal: "Those are my sandals… I took the spare key and opened it while Obinna was busy." } },
        { id: "kemi-2", text: "I don't know anything about the lifebuoy.", lie: { clueId: "buoy", reveal: "That's my handwriting. My boyfriend was coming for it by jet ski tonight." } },
      ] },
      { id: "dauda", name: "Dauda Bello", role: "Boatman", face: { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#1d4a8a", bg: "#e7e9ed", mood: "flat" }, motive: "Owes money to a loan app that keeps calling his family.", alibi: "Bringing the last boat in at 19:05.", background: "Strong swimmer, works barefoot on the jetty.", quote: "I was on the water! Ask the fish!", statements: [
        { id: "dau-1", text: "I never walked to the cash box.", press: "I was on the water. Three families saw me bring them in." },
        { id: "dau-2", text: "Kemi's boyfriend rides a jet ski on the lake.", press: "He comes most evenings. Always asking when we close." },
      ] },
      { id: "obinna", name: "Obinna Eze", role: "Stand manager", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "short", shirt: "#2b2f36", bg: "#e7e9ed", acc: "glasses", mood: "worried" }, motive: "Left the box alone. Could be covering for a loss.", alibi: "Helping a family out of a boat at the far jetty.", background: "New manager, three months on the job.", quote: "Ten minutes! I left it ten minutes!", statements: [
        { id: "obi-1", text: "My key never left my pocket.", press: "Look, it's here on my chain." },
      ] },
    ],
    culpritId: "kemi",
    solution:
      "Kemi Adebayo took the spare key from the ticket booth, slipped to the cash box while the manager was at the far jetty, emptied it and hid the money in a lifebuoy for her boyfriend to collect by jet ski after dark. Her sandal prints and her note inside the buoy gave her away.",
  },
  {
    id: "abj-gala",
    tier: 43,
    title: "The Maitama Embassy Gala",
    hook: "At a glittering Maitama gala, a gold fountain pen meant for the guest of honour disappears from its velvet case.",
    region: ABUJA("Maitama"),
    categories: ["vip"],
    tags: ["Abuja", "Maitama", "VIP"],
    bounty: 1_600_000,
    inspecting: 47100,
    lead: LEAD.abuja,
    victim: "The Ambassador's gift: an 18-carat gold pen",
    briefing:
      "The pen sat in a glass case on a pedestal all evening. Between the toast at 21:00 and the presentation at 21:30 the case was opened and the pen replaced with a gold-painted biro. Guests, caterers and a photographer were all in the hall.",
    kit: {
      backdrop: { kind: "indoor", decor: "hall", wall: "#3a2a4a", floor: "#c9b49a", trim: "#e6c35a", window: "city-night" },
      castSide: "right",
      props: [
        { kind: "chandelier", x: 50, y: 8 },
        { kind: "pedestal", x: 50, y: 56, name: "Glass display case" },
        { kind: "banquet", x: 24, y: 66, name: "Banquet table" },
        { kind: "glass", x: 30, y: 62, name: "Champagne flute" },
        { kind: "camera", x: 72, y: 70, name: "Photographer's camera" },
        { kind: "cctv", x: 88, y: 18, name: "Hall camera" },
        { kind: "cup", x: 58, y: 84, color: "#e6c35a", name: "Gold paint pot" },
        { kind: "rug", x: 50, y: 72, color: "#4a1a2a" },
      ],
    },
    clues: [
      { id: "case", name: "Glass display case", icon: Gem, x: 50, y: 56, description: "The case's latch is closed, but the felt inside is dented differently.", action: "Dust the latch", lab: { kind: "prints", shape: "finger" }, finding: "A smear of gold paint and a partial print matching caterer Ifeanyi Obi, who says he never went near the case.", suspectId: "ifeanyi" },
      { id: "paint", name: "Gold paint pot", icon: Droplets, x: 58, y: 84, description: "A tiny pot of gold model paint kicked under the table.", action: "Analyse the paint", finding: "Matches the paint on the fake biro. The receipt in the bag is from an art shop in Wuse 2, paid by card: I. Obi.", suspectId: "ifeanyi" },
      { id: "photos", name: "Photographer's camera", icon: Camera, x: 72, y: 70, description: "The event photographer shot the hall every few minutes.", action: "Look through the photos", finding: "21:12: a caterer in a white jacket leans over the case with a tray held as a screen. The tray number is 4, Ifeanyi's tray.", suspectId: "ifeanyi" },
      { id: "flute", name: "Champagne flute", icon: Fingerprint, x: 30, y: 62, description: "A flute with lipstick, left near the pedestal.", action: "Check the lipstick", finding: "It belongs to Mrs. Daniels, the attaché, who admired the pen loudly. She was dancing during the window, on three videos.", suspectId: "daniels" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "ifeanyi", name: "Ifeanyi Obi", role: "Caterer", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "short", shirt: "#f2f2e8", bg: "#e7e9ed", mood: "flat" }, motive: "A buyer in Lagos offered him ₦4M for the pen.", alibi: "Serving small chops the whole evening.", background: "Serves at every big Maitama party. Knows how to be invisible.", quote: "I carry trays. That's all I do.", statements: [
        { id: "ife-1", text: "I never went near the glass case.", lie: { clueId: "photos", reveal: "Okay, tray number four is mine. I swapped it behind the tray." } },
        { id: "ife-2", text: "I don't paint. I don't even know art shops.", lie: { clueId: "paint", reveal: "Fine. I painted the biro myself last week." } },
      ] },
      { id: "daniels", name: "Mrs. Grace Daniels", role: "Embassy attaché", face: { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "bun", shirt: "#6a1a2a", bg: "#e7e9ed", acc: "gele", accColor: "#e6c35a", mood: "smile" }, motive: "Said out loud she would “kill for that pen”.", alibi: "On the dance floor from 21:05 to 21:25.", background: "Collects fine pens. Very, very public about it.", quote: "Darling, I'd buy it, not steal it.", statements: [
        { id: "dan-1", text: "I was dancing the whole time.", press: "Ask the band. I requested Fela twice." },
      ] },
      { id: "tobi", name: "Tobi Adeyemi", role: "Event photographer", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "mohawk", shirt: "#2b2f36", bg: "#e7e9ed", acc: "glasses", mood: "smirk" }, motive: "Had a camera bag big enough for anything.", alibi: "Shooting the hall nonstop.", background: "Freelancer, shoots most embassy events.", quote: "Check my photos. Everything is there.", statements: [
        { id: "tob-1", text: "My bag only has lenses.", press: "Search it. Two lenses and a flash." },
      ] },
    ],
    culpritId: "ifeanyi",
    solution:
      "Ifeanyi Obi, a caterer, used his serving tray as a screen at 21:12, opened the case and swapped the gold pen for a biro he had painted gold himself. The photographer's shots, his print in gold paint on the latch and his card receipt from the art shop closed the case.",
  },

  /* ================================================================ KANO */
  {
    id: "kano-dye",
    tier: 44,
    title: "Trouble at Kofar Mata Dye Pits",
    hook: "Fifty yards of prize indigo cloth vanish from Kano's 500-year-old dye pits on the night before the trade fair.",
    region: KANO("Kofar Mata dye pits"),
    categories: ["alley"],
    tags: ["Kano", "Kofar Mata", "Indigo"],
    bounty: 340_000,
    inspecting: 21300,
    lead: LEAD.kano,
    victim: "Malam Garba Dyers' cooperative",
    briefing:
      "The cooperative's best indigo cloth was drying overnight above the pits for tomorrow's trade fair. At dawn the line was bare. The pit-side gate was padlocked, and a goat was found wandering inside, chewing a strip of indigo.",
    kit: {
      backdrop: { kind: "outdoor", sky: "dawn", ground: "dirt", horizon: "city" },
      castSide: "left",
      props: [
        { kind: "adire", x: 50, y: 46, name: "Drying line" },
        { kind: "dyepit", x: 28, y: 66, name: "Dye pit" },
        { kind: "dyepit", x: 62, y: 70 },
        { kind: "goat", x: 80, y: 66, name: "Wandering goat" },
        { kind: "sack", x: 18, y: 50, name: "Ash sack" },
        { kind: "gourd", x: 44, y: 82, name: "Calabash" },
        { kind: "keke", x: 86, y: 46, color: "#2f8a3a", name: "Parked keke" },
      ],
    },
    clues: [
      { id: "goat", name: "Wandering goat", icon: Feather, x: 80, y: 66, description: "A goat with a strip of indigo in its mouth and a coloured collar.", action: "Check the goat's collar", finding: "The collar is stamped “Sabon Gari Livestock, Stall 12”. The stall belongs to the brother of rival trader Nasiru Aliyu.", suspectId: "nasiru" },
      { id: "keke", name: "Parked keke", icon: Truck, x: 86, y: 46, description: "A keke parked by the gate since last night. Blue dust on the seats.", action: "Swab the seats", finding: "Fresh indigo dye. The keke is registered to Nasiru Aliyu's transport business.", suspectId: "nasiru" },
      { id: "calabash", name: "Calabash", icon: Droplets, x: 44, y: 82, description: "A calabash used to scoop dye, left on its side.", action: "Dust for prints", lab: { kind: "prints", shape: "finger" }, finding: "Prints of the night watchman, Musa, as expected: he waters the pits. Nothing unusual about that.", suspectId: "musa" },
      { id: "line", name: "Drying line", icon: Shirt, x: 50, y: 46, description: "Cut clean with a blade, not untied.", action: "Look at the cut ends", finding: "Cut with a very sharp tailor's knife, angled the way a left-handed person cuts. Nasiru is left-handed.", suspectId: "nasiru" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "nasiru", name: "Nasiru Aliyu", role: "Rival cloth merchant", face: { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "short", shirt: "#1b2a6b", bg: "#e7e9ed", acc: "fila", accColor: "#1b2a6b", mood: "smirk" }, motive: "The cooperative's cloth beats his every year at the fair.", alibi: "At home in Sabon Gari all night, he says.", background: "Rich, proud, sells machine-dyed cloth as hand-dyed.", quote: "My cloth is better. Why would I steal theirs?", statements: [
        { id: "nas-1", text: "My keke was at home all night.", lie: { clueId: "keke", reveal: "My boys took the keke. I told them to bring the cloth. It was just competition!" } },
        { id: "nas-2", text: "I don't keep goats.", lie: { clueId: "goat", reveal: "My brother's goat followed the keke. Stupid animal." } },
      ] },
      { id: "musa", name: "Musa Danladi", role: "Night watchman", face: { skin: "#5C3A1E", hair: "#cfcfcf", hairStyle: "short", shirt: "#e8e0d0", bg: "#e7e9ed", mood: "worried" }, motive: "Slept on duty and could be covering it up.", alibi: "Says he walked the pits all night.", background: "Forty years guarding the pits.", quote: "I closed my eyes for small, only small.", statements: [
        { id: "mus-1", text: "I heard an engine near the gate around two.", press: "A keke. I thought it was a passenger." },
      ] },
      { id: "binta", name: "Binta Garba", role: "Cooperative treasurer", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#8a1a2a", bg: "#e7e9ed", acc: "gele", accColor: "#1b2a6b", mood: "flat" }, motive: "The cloth was insured. She handles the papers.", alibi: "At her mother's in Kofar Nassarawa.", background: "Keeps the cooperative's books spotless.", quote: "Insurance? We can't even afford a padlock!", statements: [
        { id: "bin-1", text: "The cloth is not insured.", press: "Check the books. We're too poor for insurance." },
      ] },
    ],
    culpritId: "nasiru",
    solution:
      "Nasiru Aliyu sent his boys in his keke at 2 a.m. to cut the cooperative's indigo off the line so his machine-dyed cloth would win the fair. His brother's goat followed them in and got locked inside. Indigo on the keke seats, the goat's collar and a left-handed cut tied it all to him.",
  },
  {
    id: "kano-kwari",
    tier: 45,
    title: "The Kantin Kwari Fabric Fraud",
    hook: "A wholesaler pays ₦8 million for forty bales of lace. Inside the bales: sawdust and old newspapers.",
    region: KANO("Kantin Kwari market"),
    categories: ["heists", "alley"],
    tags: ["Kano", "Kantin Kwari", "Fraud"],
    bounty: 460_000,
    inspecting: 26700,
    lead: LEAD.kano,
    victim: "Hajiya Safiya Lawan, lace wholesaler",
    briefing:
      "Hajiya Safiya inspected one sample bale at Kantin Kwari, paid ₦8M by transfer and watched the forty bales loaded onto a truck to her warehouse. When she opened them, every bale except the sample was sawdust wrapped in lace.",
    kit: {
      backdrop: { kind: "outdoor", sky: "day", ground: "dirt", horizon: "city" },
      castSide: "right",
      props: [
        { kind: "sign", x: 50, y: 12, label: "KANTIN KWARI", color: "#a3601c" },
        { kind: "stall", x: 24, y: 52, color: "#8a1a2a", name: "Lace stall" },
        { kind: "sack", x: 50, y: 64, name: "Opened bale" },
        { kind: "sack", x: 60, y: 62 },
        { kind: "tanker", x: 80, y: 44, s: 0.6, label: "KWARI HAULAGE", color: "#e8e0d0", name: "Haulage truck" },
        { kind: "paper", x: 36, y: 84, name: "Transfer slip" },
        { kind: "kiosk", x: 14, y: 70, label: "POS", color: "#1d6a3a", name: "POS kiosk" },
      ],
    },
    clues: [
      { id: "bale", name: "Opened bale", icon: Package, x: 50, y: 64, description: "Lace on the outside, sawdust and 2019 newspapers inside.", action: "Look at the newspapers", finding: "Kano Daily from 2019, all with the same address label: Kwari Haulage, the transporter's own office.", suspectId: "yakubu" },
      { id: "truck", name: "Haulage truck", icon: Truck, x: 80, y: 44, description: "The truck that carried the bales.", action: "Check the tachograph", finding: "The truck stopped for 47 minutes in a side street on the way. Driver says he never stopped.", suspectId: "yakubu" },
      { id: "slip", name: "Sales slip", icon: Receipt, x: 36, y: 84, description: "A torn sales slip found in the truck's cab.", action: "Reassemble the slip", lab: { kind: "torn", style: "ledger", title: "LACE HUB ONITSHA", lines: ["Bought from: Y. Ibrahim", "Swiss lace, 39 bales", "Price: N5,800,000", "Paid cash", "Date: same day", "Time: 18:40", "— Lace Hub"] }, finding: "That same evening Yakubu Ibrahim sold 39 bales of Swiss lace to a dealer in Onitsha for ₦5.8M cash.", suspectId: "yakubu" },
      { id: "stall", name: "Lace stall", icon: Shirt, x: 24, y: 52, description: "Sadiq's stall, its lace shelves now empty.", action: "Check the stock book", finding: "Forty real bales signed out at 15:00 and signed for by Yakubu. Sadiq's shelves are empty: he really did send them.", suspectId: "sadiq" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "yakubu", name: "Yakubu Ibrahim", role: "Truck driver, Kwari Haulage", face: { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#e8e0d0", bg: "#e7e9ed", acc: "cap", mood: "flat" }, motive: "Promised ₦3M to load fake bales instead of real ones.", alibi: "Drove straight to the warehouse, he says.", background: "Fifteen years driving the Kano–Kaduna road.", quote: "I just drive. What is inside the bale is not my business.", statements: [
        { id: "yak-1", text: "I didn't stop anywhere on the way.", lie: { clueId: "truck", reveal: "We stopped. My cousin's boys swapped the bales in that side street." } },
        { id: "yak-2", text: "I've never been to Onitsha this month.", lie: { clueId: "slip", reveal: "I sold the real bales there. My cousin made the sawdust bales." } },
      ] },
      { id: "sadiq", name: "Sadiq Usman", role: "Lace seller", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "short", shirt: "#8a1a2a", bg: "#e7e9ed", acc: "fila", accColor: "#8a1a2a", mood: "smirk" }, motive: "Sell the same forty bales twice.", alibi: "In his shop all day.", background: "Smooth talker, loads of customers.", quote: "I sold real lace! What the driver did is not on me!", statements: [
        { id: "sad-1", text: "I loaded forty real bales myself.", press: "My boys counted, the driver signed. Check my book." },
      ] },
      { id: "safiya", name: "Hajiya Safiya Lawan", role: "Wholesaler (buyer)", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#1d4a8a", bg: "#e7e9ed", acc: "gele", accColor: "#e6c35a", mood: "worried" }, motive: "Could be faking the loss.", alibi: "Followed the truck in her car… until traffic split them.", background: "Biggest lace buyer in the North West.", quote: "Eight million! For sawdust!", statements: [
        { id: "saf-1", text: "I lost the truck in traffic for almost an hour.", press: "At Kofar Wambai. When I found it again it was already moving." },
      ] },
    ],
    culpritId: "yakubu",
    solution:
      "Driver Yakubu Ibrahim stopped for 47 minutes in a side street, where his cousin's boys swapped thirty-nine real bales for sawdust bales wrapped in lace and stuffed with Kwari Haulage's own old newspapers. That evening he sold the real lace in Onitsha for ₦5.8M cash. Sadiq had honestly sent the real bales.",
  },
  {
    id: "kano-makama",
    tier: 46,
    title: "The Gidan Makama Manuscript",
    hook: "A 300-year-old manuscript disappears from Kano's Gidan Makama museum during a visiting scholar's private viewing.",
    region: KANO("Gidan Makama Museum"),
    categories: ["vip"],
    tags: ["Kano", "Museum", "VIP"],
    bounty: 1_800_000,
    inspecting: 38200,
    lead: LEAD.kano,
    victim: "Gidan Makama Museum",
    briefing:
      "A visiting scholar asked for a private viewing of the museum's oldest manuscript. The curator, the scholar and a security guard were in the room. After a power cut of two minutes, the cushion on the reading table held a convincing copy.",
    kit: {
      backdrop: { kind: "indoor", wall: "#b5803a", floor: "#8a5a3a", trim: "#e6c35a", window: "none" },
      castSide: "left",
      props: [
        { kind: "lamp", x: 30, y: 30 },
        { kind: "desk", x: 50, y: 62, color: "#5a3a1a", name: "Reading table" },
        { kind: "books", x: 50, y: 56, name: "Copy manuscript" },
        { kind: "cabinet", x: 82, y: 52, color: "#6a4a2a", name: "Archive cabinet" },
        { kind: "bookshelf", x: 18, y: 50, name: "Bookshelf" },
        { kind: "panel", x: 88, y: 66, color: "#f5c518", name: "Fuse box" },
        { kind: "paper", x: 62, y: 84, name: "Visitor slip" },
      ],
    },
    clues: [
      { id: "copy", name: "Copy manuscript", icon: BookOpen, x: 50, y: 56, description: "Very good. The ink is too fresh and the binding thread is nylon.", action: "Analyse the paper", finding: "Paper aged with tea, the kind of trick taught in book-restoration courses. The visiting scholar teaches one in Cairo.", suspectId: "scholar" },
      { id: "fuse", name: "Fuse box", icon: Gauge, x: 88, y: 66, description: "The power cut was not NEPA: the main switch was flipped.", action: "Dust the switch", lab: { kind: "prints", shape: "finger" }, finding: "Prints of guard Kabiru. He says he flipped it back on after the cut, which explains the prints.", suspectId: "kabiru" },
      { id: "slip", name: "Visitor slip", icon: ScrollText, x: 62, y: 84, description: "The scholar's visitor slip, signed on arrival.", action: "Read the slip", finding: "He listed a “flat document folder” among his belongings. He left with it. Folders that size fit a manuscript exactly.", suspectId: "scholar" },
      { id: "cabinet", name: "Archive cabinet", icon: KeyRound, x: 82, y: 52, description: "Where the manuscript normally lives.", action: "Check the access log", finding: "Curator Hadiza opened it at 10:58 for the viewing and logged it properly. Nothing odd in her entries.", suspectId: "hadiza" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "scholar", name: "Dr. Faruk el-Masri", role: "Visiting scholar", face: { skin: "#A0703C", hair: "#cfcfcf", hairStyle: "slick", shirt: "#2b2f36", bg: "#e7e9ed", acc: "glasses", mood: "smile" }, motive: "A private collector abroad pays fortunes for West African manuscripts.", alibi: "Sitting at the table in the dark, he says.", background: "Respected expert on Sahel manuscripts, restoration teacher.", quote: "I came to study it, not to steal it, my friend.", statements: [
        { id: "far-1", text: "My folder only had my notes.", lie: { clueId: "slip", reveal: "The folder… was not only notes. A collector asked me. I am ashamed." } },
        { id: "far-2", text: "I have never made a copy of anything.", lie: { clueId: "copy", reveal: "I teach copying for restoration. This time I used it for something else." } },
      ] },
      { id: "kabiru", name: "Kabiru Sani", role: "Security guard", face: { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#1d2f5a", bg: "#e7e9ed", acc: "cap", mood: "worried" }, motive: "Could have been paid to cut the power.", alibi: "By the door the whole time.", background: "Ex-soldier, six years at the museum.", quote: "I put the light back. That's why my hand is there!", statements: [
        { id: "kab-1", text: "The scholar asked me where the fuse box was this morning.", press: "He said he wanted to plug his laptop. I showed him." },
      ] },
      { id: "hadiza", name: "Hadiza Bello", role: "Curator", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#1d6a3a", bg: "#e7e9ed", acc: "glasses", mood: "flat" }, motive: "Allowed the private viewing against advice.", alibi: "Beside the table holding a torch after the cut.", background: "Built the museum's archive system herself.", quote: "I logged every minute. Check my book.", statements: [
        { id: "had-1", text: "Only three of us were in the room.", press: "The scholar, Kabiru and me. Nobody else came in." },
      ] },
    ],
    culpritId: "scholar",
    solution:
      "Dr. Faruk el-Masri arrived with a tea-aged copy in his flat folder. He had learned where the fuse box was that morning and flipped the main switch on his way in; in the two minutes of darkness he swapped the manuscript for the copy and slid the real one into his folder for a foreign collector.",
  },

  /* ================================================================ ILORIN */
  {
    id: "ilo-ram",
    tier: 47,
    title: "The Oja Oba Festival Ram",
    hook: "The biggest ram in Oja Oba market is sold twice in one morning, then disappears from its pen.",
    region: ILORIN("Oja Oba market"),
    categories: ["alley"],
    tags: ["Ilorin", "Oja Oba", "Festival"],
    bounty: 320_000,
    inspecting: 18400,
    lead: LEAD.ilorin,
    victim: "Two buyers, ₦450,000 each, for one ram",
    briefing:
      "Two days to the festival. Alhaji Yusuf and Mr. Ojo each paid ₦450k for “Bobo”, the giant ram of Oja Oba, and each came back to collect it. The pen is open and Bobo is gone. The seller swears he only sold it once.",
    kit: {
      backdrop: { kind: "outdoor", sky: "day", ground: "dirt", horizon: "city" },
      castSide: "right",
      props: [
        { kind: "sign", x: 50, y: 12, label: "OJA OBA", color: "#6a3a8a" },
        { kind: "goat", x: 34, y: 66, s: 1.3, name: "Empty pen's other ram" },
        { kind: "stake", x: 52, y: 70, name: "Pen stake" },
        { kind: "stall", x: 76, y: 52, color: "#6a3a8a", name: "Feed stall" },
        { kind: "umbrella", x: 18, y: 46, color: "#3a8a4a" },
        { kind: "paper", x: 24, y: 84, name: "Sales receipt" },
        { kind: "keke", x: 86, y: 70, color: "#f5c518", name: "Keke with rope" },
        { kind: "sack", x: 62, y: 84, name: "Feed sack" },
      ],
    },
    clues: [
      { id: "receipt", name: "Sales receipt", icon: Receipt, x: 24, y: 84, description: "Two receipts for the same ram in the same handwriting.", action: "Compare the receipts", finding: "Both written and stamped by seller Lawal Abdul. One at 08:10, one at 09:40.", suspectId: "lawal" },
      { id: "keke", name: "Keke with rope", icon: Truck, x: 86, y: 70, description: "A keke with a thick rope and ram hair on the floor.", action: "Find the keke's owner", finding: "Hired by Lawal's nephew at 10:00 for a trip to a village farm outside town. Ram hair matches Bobo.", suspectId: "lawal" },
      { id: "stake", name: "Pen stake", icon: Wrench, x: 52, y: 70, description: "The rope was untied, not cut.", action: "Dust the knot", lab: { kind: "prints", shape: "finger" }, finding: "Prints of the seller, Lawal, and of nobody else. The ram was led away calmly, by someone it knew.", suspectId: "lawal" },
      { id: "feed", name: "Feed sack", icon: Package, x: 62, y: 84, description: "Feed bought for Bobo by one of the buyers.", action: "Check the feed receipt", finding: "Mr. Ojo bought premium feed for Bobo at 09:50, believing it was his. Honest buyer.", suspectId: "ojo" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "lawal", name: "Lawal Abdul", role: "Ram seller", face: { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "short", shirt: "#3a8a4a", bg: "#e7e9ed", acc: "fila", accColor: "#f2f2e8", mood: "smirk" }, motive: "Sell Bobo twice, then sell him a third time in the village.", alibi: "At his stall all morning.", background: "Sells rams every festival. Business has been bad this year.", quote: "Bobo run! Ram fit run, abi?", statements: [
        { id: "law-1", text: "I sold Bobo only once.", lie: { clueId: "receipt", reveal: "Two receipts… Business was bad. I wanted to make up for last year." } },
        { id: "law-2", text: "Nobody from my family touched the ram.", lie: { clueId: "keke", reveal: "My nephew took him to the village. I was going to sell him again at the farm." } },
      ] },
      { id: "ojo", name: "Mr. Kayode Ojo", role: "Buyer", face: { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#1d4a8a", bg: "#e7e9ed", acc: "glasses", mood: "worried" }, motive: "Could have taken the ram to avoid sharing with the other buyer.", alibi: "Bought feed at 09:50, came back at 10:30.", background: "Civil servant buying his first big ram.", quote: "I even bought Bobo premium feed!", statements: [
        { id: "ojo-1", text: "I came back at half ten and the pen was open.", press: "Alhaji Yusuf was already there shouting." },
      ] },
      { id: "yusuf", name: "Alhaji Yusuf Bello", role: "Buyer", face: { skin: "#4a2c17", hair: "#cfcfcf", hairStyle: "short", shirt: "#f2f2e8", bg: "#e7e9ed", acc: "fila", accColor: "#6a3a8a", mood: "flat" }, motive: "Furious, and strong enough to lead a ram away.", alibi: "At the mosque from 09:00 to 10:15.", background: "Buys the biggest ram every year. Pride matters.", quote: "Nobody will make a fool of me in Oja Oba!", statements: [
        { id: "yus-1", text: "I paid first. Bobo is mine.", press: "08:10. Ask anybody." },
      ] },
    ],
    culpritId: "lawal",
    solution:
      "Ram seller Lawal Abdul sold Bobo twice, wrote both receipts himself, then had his nephew lead the ram away in a hired keke to the family farm, planning to sell him a third time in the village. His prints on the knot, the keke trip and the twin receipts ended the hustle.",
  },
  {
    id: "ilo-pottery",
    tier: 48,
    title: "The Dada Pottery Break-in",
    hook: "At the famous Okelele pottery, five prize pots are smashed and one masterpiece is missing.",
    region: ILORIN("Okelele, Dada pottery"),
    categories: ["alley"],
    tags: ["Ilorin", "Okelele", "Pottery"],
    bounty: 360_000,
    inspecting: 17200,
    lead: LEAD.ilorin,
    victim: "Mama Ramatu's pottery workshop",
    briefing:
      "Mama Ramatu's pots are known all over Kwara. This morning five pots lay smashed by the kiln, and her masterpiece, a tall water pot due at an exhibition in Abuja, was gone. The smashing looked angry. The theft looked careful.",
    kit: {
      backdrop: { kind: "outdoor", sky: "day", ground: "dirt", horizon: "hills" },
      castSide: "left",
      props: [
        { kind: "furnace", x: 60, y: 52, name: "Kiln" },
        { kind: "gourd", x: 30, y: 60, name: "Smashed pots" },
        { kind: "terracotta", x: 80, y: 62, name: "Empty pedestal pot" },
        { kind: "bench", x: 40, y: 72 },
        { kind: "footprints", x: 50, y: 84, name: "Clay footprints" },
        { kind: "phone", x: 22, y: 82, name: "Apprentice's phone" },
        { kind: "crate", x: 86, y: 80, label: "ABUJA EXPO", name: "Shipping crate" },
      ],
    },
    clues: [
      { id: "shards", name: "Smashed pots", icon: Package, x: 30, y: 60, description: "Five pots smashed, but only the cheap ones.", action: "Sort the shards", finding: "Whoever smashed them knew which pots were worth little. A real vandal breaks the best ones first. This was a cover-up.", suspectId: "jide" },
      { id: "steps", name: "Clay footprints", icon: Footprints, x: 50, y: 84, description: "Clay footprints from the kiln to the shipping crate and back.", action: "Cast the footprints", lab: { kind: "prints", shape: "boot" }, finding: "Workshop sandals, size 42: apprentice Jide's. He lives in the workshop's back room.", suspectId: "jide" },
      { id: "phone", name: "Apprentice's phone", icon: Smartphone, x: 22, y: 82, description: "Jide's phone, left charging by the bench.", action: "Read the messages", finding: "A buyer from Lagos, 02:14: “Pot received. Balance tomorrow. Make sure it looks like robbery.”", suspectId: "jide" },
      { id: "crate", name: "Shipping crate", icon: Package, x: 86, y: 80, description: "The crate meant for the Abuja exhibition.", action: "Check the crate", finding: "Empty, lid prised. The exhibition organiser, Mr. Adeleke, had the only other key to the yard. His car was in Abuja all night.", suspectId: "adeleke" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "jide", name: "Jide Olatunji", role: "Apprentice", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "short", shirt: "#a3601c", bg: "#e7e9ed", mood: "worried" }, motive: "A Lagos buyer offered ₦1.2M for the masterpiece.", alibi: "Asleep in the back room, he says.", background: "Five years under Mama Ramatu. Gifted, impatient.", quote: "Mama is my mother in this work. I can't!", statements: [
        { id: "jid-1", text: "I slept through everything.", lie: { clueId: "steps", reveal: "Those are my sandals. I carried the pot out. I'm sorry, Mama." } },
        { id: "jid-2", text: "I don't know any buyer in Lagos.", lie: { clueId: "phone", reveal: "He found me on Instagram. He said Mama would never know." } },
      ] },
      { id: "adeleke", name: "Mr. Tunde Adeleke", role: "Exhibition organiser", face: { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "slick", shirt: "#2b2f36", bg: "#e7e9ed", acc: "glasses", mood: "smirk" }, motive: "The pot was insured in the exhibition's name.", alibi: "In Abuja setting up the hall.", background: "Runs craft exhibitions across the country.", quote: "I wanted that pot in my show, not in my house!", statements: [
        { id: "ade-1", text: "I was in Abuja all night.", press: "Hotel receipt, CCTV, the security men. Check am." },
      ] },
      { id: "ramatu", name: "Mama Ramatu Dada", role: "Master potter", face: { skin: "#4a2c17", hair: "#cfcfcf", hairStyle: "bun", shirt: "#6a3a8a", bg: "#e7e9ed", acc: "gele", accColor: "#a3601c", mood: "worried" }, motive: "Could sell the pot twice: to the exhibition and the insurer.", alibi: "Asleep at home across the road.", background: "Fourth generation of Dada potters.", quote: "Fifty years I've made pots. Nobody ever broke one on purpose.", statements: [
        { id: "ram-1", text: "Jide has been asking about Lagos prices.", press: "Last week he asked how much my pots sell for over there." },
      ] },
    ],
    culpritId: "jide",
    solution:
      "Apprentice Jide Olatunji sold Mama Ramatu's masterpiece to a Lagos buyer he met online. At night he carried it out, then smashed five cheap pots to make it look like an angry break-in. Smashing only the cheap ones gave him away, and his sandal prints and messages confirmed it.",
  },
  {
    id: "ilo-dam",
    tier: 49,
    title: "Night Signal at Asa Dam",
    hook: "Half of Ilorin wakes up with dry taps. Someone sabotaged the Asa Dam waterworks control panel.",
    region: ILORIN("Asa Dam waterworks"),
    categories: ["vip", "cyber"],
    tags: ["Ilorin", "Asa Dam", "Sabotage"],
    bounty: 1_500_000,
    inspecting: 41800,
    lead: LEAD.ilorin,
    victim: "Kwara Water Corporation (and half of Ilorin)",
    briefing:
      "At 03:10 the main pumps at Asa Dam shut down from the control room. The night operator says the panel went dark by itself. By morning, private water tankers were selling water across town at triple price.",
    kit: {
      backdrop: { kind: "indoor", decor: "warehouse", wall: "#4c5660", floor: "#8a949c", trim: "#2f8a3a", window: "hills" },
      castSide: "right",
      props: [
        { kind: "console", x: 50, y: 56, name: "Pump control console" },
        { kind: "panel", x: 14, y: 54, color: "#ff3b4e", name: "Breaker panel" },
        { kind: "tank", x: 84, y: 50, name: "Water tank" },
        { kind: "cup", x: 34, y: 68, color: "#e8e0d0", name: "Tea cup" },
        { kind: "phone", x: 64, y: 70, name: "Operator's phone" },
        { kind: "paper", x: 40, y: 86, name: "Shift log" },
        { kind: "cctv", x: 86, y: 14, name: "Control-room camera" },
      ],
    },
    clues: [
      { id: "console", name: "Pump control console", icon: Gauge, x: 50, y: 56, description: "The pumps were stopped by command, not by a fault.", action: "Read the system log", finding: "“Manual stop, operator code 0412” at 03:10. That's night operator Femi's code… which is written on a sticky note on the console for anyone to read.", suspectId: "femi" },
      { id: "phone", name: "Operator's phone", icon: Smartphone, x: 64, y: 70, description: "Femi's phone, buzzing on the desk.", action: "Check recent calls", finding: "Four calls from tanker owner Alhaji Rasaq between 01:00 and 03:05: “I'm at the gate, I brought you suya, come and open.” Femi went out at 03:08.", suspectId: "rasaq" },
      { id: "log", name: "Shift log", icon: ScrollText, x: 40, y: 86, description: "The handwritten shift log, one page torn.", action: "Rebuild the torn page", lab: { kind: "torn", style: "ledger", title: "NIGHT SHIFT LOG", lines: ["01:00 all pumps OK", "02:00 pressure OK", "03:00 visitor at gate", "(Alh. R.) let in", "03:10 pumps stopped", "03:12 visitor left", "— F.A."] }, finding: "Femi logged a visitor, “Alh. R.”, let in at 03:00. The page was torn out later. Femi says it was gone when he got back from walking the visitor to the gate.", suspectId: "rasaq" },
      { id: "cup", name: "Tea cup", icon: Coins, x: 34, y: 68, description: "A second tea cup on the operator's desk.", action: "Dust the cup", lab: { kind: "prints", shape: "finger" }, finding: "Prints of Alhaji Rasaq, the biggest water-tanker owner in Ilorin. He was in the control room.", suspectId: "rasaq" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "rasaq", name: "Alhaji Rasaq Bakare", role: "Water-tanker owner", face: { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "short", shirt: "#2f8a3a", bg: "#e7e9ed", acc: "fila", accColor: "#2f8a3a", mood: "smirk" }, motive: "Dry taps mean every household buys his tanker water.", alibi: "At home, asleep.", background: "Owns twenty tankers. Prices go up when taps go dry.", quote: "I sell water. I don't stop water!", statements: [
        { id: "ras-1", text: "I have never been inside the waterworks.", lie: { clueId: "cup", reveal: "I went… to greet Femi. We drank tea." } },
        { id: "ras-2", text: "I barely know the night operator.", lie: { clueId: "log", reveal: "I visited him. When he went to open the gate for my driver I pressed one button. One night of dry taps. It's just business!" } },
      ] },
      { id: "femi", name: "Femi Ayinla", role: "Night operator", face: { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#2b3440", bg: "#e7e9ed", acc: "glasses", mood: "worried" }, motive: "Careless with his code, and owes school fees.", alibi: "On duty all night.", background: "Eight years at the waterworks.", quote: "The panel just went off!", statements: [
        { id: "fem-1", text: "The panel went dark by itself.", lie: { clueId: "console", reveal: "It was my code… but I was at the gate letting his driver in. My code was on that sticky note. I'm so sorry." } },
        { id: "fem-2", text: "Alhaji Rasaq brought me suya. He's always friendly.", press: "He stayed while I went to the gate. Ten minutes maybe." },
      ] },
      { id: "yemisi", name: "Engr. Yemisi Oyelade", role: "Plant manager", face: { skin: "#8D5524", hair: "#1b1b1b", hairStyle: "bun", shirt: "#1d4a8a", bg: "#e7e9ed", acc: "glasses", mood: "flat" }, motive: "Wants a budget for new pumps. A shutdown helps her case.", alibi: "At home; arrived at 05:00 after the alarm.", background: "Has begged for new equipment for three years.", quote: "Sabotage my own plant? I sleep here half the week!", statements: [
        { id: "yem-1", text: "The camera has been broken for a month.", press: "Three requests for a new one. Nothing." },
      ] },
    ],
    culpritId: "rasaq",
    solution:
      "Water-tanker owner Alhaji Rasaq Bakare visited the night operator at 03:00 with suya. When Femi went to open the gate for his driver, Rasaq used the operator code from the sticky note to stop the main pumps, and tore the visitor page out of the log. With half of Ilorin's taps dry, his tankers sold water at triple price.",
  },
];
