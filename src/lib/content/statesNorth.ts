import { Banknote, Battery, Cctv, ClipboardList, Egg, Footprints, Gem, KeyRound, Laptop, Package, Plane, Receipt, ScrollText, Smartphone, Truck, Wheat } from "lucide-react";
import type { CrimeCase, Face, MusicStyle } from "../types";

/**
 * One case for each northern state without a city of its own. Each is inspired
 * by a kind of incident Nigerians have read about in the news; every name and
 * detail here is invented.
 */

const face = (skin: string, shirt: string, hairStyle: Face["hairStyle"] = "short", acc?: Face["acc"], mood: Face["mood"] = "flat", accColor?: string): Face => ({
  skin,
  hair: "#1b1b1b",
  hairStyle,
  shirt,
  bg: "#e7e9ed",
  acc,
  accColor,
  mood,
});
const at = (state: string, place: string, music: MusicStyle = "sahel") => ({ state, place, music });

export const STATE_CASES_NORTH: CrimeCase[] = [
  /* ================================================================ KADUNA */
  {
    id: "kad-refinery",
    tier: 72,
    title: "The Refinery Spare Parts",
    hook: "₦480M of new pump parts arrived for the refinery's big repair. The pumps still won't start, and the 'new' parts look strangely old.",
    region: at("Kaduna", "Refinery yard, Kaduna"),
    inspiredBy: "Reports of refinery repair contracts that were paid for while the plants stayed shut.",
    categories: ["heists"],
    tags: ["Kaduna", "Refinery", "Contract fraud"],
    bounty: 520_000,
    inspecting: 24800,
    lead: { name: "Insp. Aisha Garba", face: face("#6b4226", "#1d2f5a", "bun", "glasses", "flat") },
    victim: "Kaduna Refining Works (₦480M of pump parts)",
    briefing:
      "The refinery's turnaround repair was meant to finish this month. The new pumps were delivered, signed for and installed, but nothing runs. An engineer scraped one 'new' casing and found rust under fresh grey paint.",
    kit: {
      backdrop: { kind: "outdoor", sky: "day", ground: "concrete", horizon: "none" },
      castSide: "left",
      props: [
        { kind: "sign", x: 50, y: 14, label: "KADUNA REFINING WORKS", color: "#f5c518" },
        { kind: "tanker", x: 66, y: 50, label: "FUEL", name: "Tanker" },
        { kind: "crate", x: 40, y: 62, label: "PUMP PARTS", name: "Parts crate" },
        { kind: "hardhat", x: 56, y: 76, name: "Hard hat" },
        { kind: "paper", x: 30, y: 84, name: "Delivery note" },
        { kind: "cctv", x: 86, y: 22, name: "Gate camera" },
        { kind: "generator", x: 84, y: 70 },
        { kind: "cone", x: 22, y: 58 },
      ],
    },
    clues: [
      { id: "casing", name: "Pump casing", icon: Package, x: 40, y: 62, description: "A 'brand new' pump casing from the crate.", action: "Scrape the paint", finding: "Under the fresh grey paint is old rust and a serial number from pumps removed from this same refinery five years ago.", suspectId: "danladi" },
      { id: "note", name: "Delivery note", icon: ScrollText, x: 30, y: 84, description: "Torn pieces of the delivery note.", action: "Rebuild the note", lab: { kind: "torn", style: "ledger", title: "STORES MOVEMENT", lines: ["IN: 12 new pumps (sealed)", "Signed: I. Danladi, stores", "OUT 02:10: 12 crates", "to: Sabon Gari yard", "IN 04:30: 12 crates", "'returned for checks'", "No supervisor signature"] }, finding: "The sealed new pumps went out of the store at 2 a.m. and twelve crates came back before dawn. Only the storekeeper signed both.", suspectId: "danladi" },
      { id: "gate", name: "Gate camera", icon: Cctv, x: 86, y: 22, description: "The night camera at gate 3.", action: "Play 02:00 to 05:00", finding: "A lorry leaves at 02:14 and returns at 04:31. The man waving it through in a storekeeper's dust coat is Ibrahim Danladi.", suspectId: "danladi" },
      { id: "hat", name: "Hard hat", icon: KeyRound, x: 56, y: 76, description: "A hard hat left by the crate.", action: "Dust the strap", lab: { kind: "prints", shape: "finger" }, finding: "Prints of Engr. Musa Bello, who installed the pumps. He says he only noticed the rust after installing them, and the work log agrees.", suspectId: "bello" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "danladi", name: "Ibrahim Danladi", role: "Storekeeper", face: face("#5C3A1E", "#8a8f94", "buzz", "fila", "worried", "#3a5a8a"), motive: "Sold twelve new pumps to a dealer for ₦300M.", alibi: "Says he was at home all night.", background: "Twenty years in the stores. Knows where every old part is buried.", quote: "Wallahi, I sign wetin dem bring. I no sabi pump!", statements: [
        { id: "dan-1", text: "The crates never left my store.", lie: { clueId: "note", reveal: "They went out for checking. That is all." } },
        { id: "dan-2", text: "I was asleep in Barnawa all night.", lie: { clueId: "gate", reveal: "I came to open the gate. Somebody asked me." } },
      ] },
      { id: "bello", name: "Engr. Musa Bello", role: "Installation engineer", face: face("#6b4226", "#f5c518", "short", "cap", "flat"), motive: "Installed the parts without checking them.", alibi: "On site from 8 a.m.", background: "Careful, slow, hates paperwork.", quote: "I installed what was in the crates. I reported the rust.", statements: [
        { id: "bel-1", text: "The crates were already open when my team arrived.", press: "Opened and nailed shut again. I asked why, they said 'inspection'." },
      ] },
      { id: "hajara", name: "Hajara Yusuf", role: "Contractor's agent", face: face("#8D5524", "#7a1f6a", "bun", "gele", "smile", "#f5c518"), motive: "Her company was paid in full.", alibi: "Flew back to Abuja after the delivery.", background: "Delivered the sealed pumps with photos of every crate.", quote: "My pumps were new. I have the pictures.", statements: [
        { id: "haj-1", text: "Every crate had our blue seal when we handed over.", press: "Ask the storekeeper where the blue seals went. I have photos of all twelve." },
      ] },
    ],
    culpritId: "danladi",
    solution:
      "Storekeeper Ibrahim Danladi let a lorry take the twelve sealed new pumps out at 2 a.m., sold them, and sent back old repainted pumps in the same crates before dawn. The gate camera and his own signatures on the stores movement sheet gave him away.",
  },

  /* ================================================================ KATSINA */
  {
    id: "kat-feeding",
    tier: 73,
    title: "The School Feeding Eggs",
    hook: "A primary school is paid to feed 2,000 pupils every day. Parents say their children get a quarter of an egg.",
    region: at("Katsina", "Government primary school, Katsina"),
    inspiredBy: "Reports of school feeding money paid for pupils who didn't exist.",
    categories: ["alley"],
    tags: ["Katsina", "School feeding", "Ghost pupils"],
    bounty: 380_000,
    inspecting: 21300,
    lead: { name: "Insp. Sani Abubakar", face: face("#5C3A1E", "#1d6a3a", "short", "fila", "smile", "#f2f2e8") },
    victim: "The school feeding programme (₦9M a term)",
    briefing:
      "The school is paid to feed 2,000 pupils. Parents counted 640 children in the morning line. The cook says she cooks for 'whoever comes', and the head teacher says the rest were absent.",
    kit: {
      backdrop: { kind: "outdoor", sky: "day", ground: "dirt", horizon: "city" },
      castSide: "left",
      props: [
        { kind: "sign", x: 50, y: 14, label: "GOVT. PRIMARY SCHOOL", color: "#1d6a3a" },
        { kind: "banquet", x: 48, y: 60, name: "Serving table" },
        { kind: "bowl", x: 44, y: 56, name: "Food bowl" },
        { kind: "crate", x: 70, y: 66, label: "EGGS", name: "Egg crate" },
        { kind: "paper", x: 30, y: 82, name: "Class register" },
        { kind: "phone", x: 86, y: 58, name: "Vendor's phone" },
        { kind: "bench", x: 86, y: 62 },
        { kind: "umbrella", x: 22, y: 48, color: "#1d6a3a" },
      ],
    },
    clues: [
      { id: "register", name: "Class register", icon: ClipboardList, x: 30, y: 82, description: "The register used to claim the feeding money.", action: "Check the names", finding: "1,360 of the 2,000 names have no parent phone, no class teacher signature and no exam result. Many share birthdays in the same order as last year's leavers.", suspectId: "nasiru" },
      { id: "crate", name: "Egg crate", icon: Egg, x: 70, y: 66, description: "Today's egg delivery.", action: "Count the eggs", finding: "Four trays: 120 eggs for a claim of 2,000. The cook cuts each egg in four, which matches what parents saw.", suspectId: "ladi" },
      { id: "phone", name: "Vendor's phone", icon: Smartphone, x: 86, y: 58, description: "The food vendor's phone, left on the bench.", action: "Read the transfers", finding: "Each term the vendor sends back ₦4.2M to an account named Nasiru Kabir, 'as agreed'.", suspectId: "nasiru" },
      { id: "bowl", name: "Food bowl", icon: Wheat, x: 44, y: 56, description: "A pupil's bowl of rice and stew.", action: "Weigh the portion", finding: "About half the portion the programme pays for, but the cook has receipts showing she was only given half the rice.", suspectId: "ladi" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "nasiru", name: "Malam Nasiru Kabir", role: "Head teacher", face: face("#6b4226", "#f2f2e8", "short", "fila", "smile", "#3a5a8a"), motive: "Claimed for 1,360 pupils who don't exist and took a share back.", alibi: "Says the missing pupils were absent with malaria.", background: "Runs the school and the feeding register.", quote: "Children fall sick. Is that my fault?", statements: [
        { id: "nas-1", text: "Every name on that register is a real pupil.", lie: { clueId: "register", reveal: "Some are... old pupils. Their names were never removed." } },
        { id: "nas-2", text: "I have never received money from the vendor.", lie: { clueId: "phone", reveal: "It was for school projects. Projects." } },
      ] },
      { id: "ladi", name: "Mama Ladi", role: "School cook", face: face("#5C3A1E", "#e07a2a", "bun", "gele", "worried", "#e07a2a"), motive: "Cuts the eggs into quarters.", alibi: "Cooking since 5 a.m.", background: "Has cooked for the school for eight years.", quote: "I cook with what they give me. I cannot make eggs grow.", statements: [
        { id: "lad-1", text: "They give me rice for 640 children, not 2,000.", press: "I complained in writing. Malam Nasiru told me to cut the eggs and keep quiet." },
      ] },
      { id: "vendor", name: "Alhaji Gambo", role: "Food vendor", face: face("#4a2c17", "#c9a34a", "buzz", "cap", "smirk"), motive: "Paid for 2,000 meals, delivers 640.", alibi: "At the market buying stock.", background: "Supplies three schools.", quote: "I deliver what the school orders.", statements: [
        { id: "gam-1", text: "The head teacher tells me how much to deliver.", press: "And how much to send back. I thought it was normal." },
      ] },
    ],
    culpritId: "nasiru",
    solution:
      "Head teacher Nasiru Kabir padded the register with 1,360 old pupils' names, had the vendor deliver food for the real 640, and took ₦4.2M back each term. The register, the vendor's transfers and the cook's complaint proved it.",
  },

  /* ================================================================ ZAMFARA */
  {
    id: "zam-gold",
    tier: 74,
    title: "Anka Gold Dust",
    hook: "A miners' cooperative's strongbox is lighter by 400 grams of gold dust, and the chairman blames the night wind.",
    region: at("Zamfara", "Mining cooperative near Anka"),
    inspiredBy: "Reports of gold from small mines in Zamfara being smuggled out unrecorded.",
    categories: ["heists"],
    tags: ["Zamfara", "Gold", "Cooperative"],
    bounty: 460_000,
    inspecting: 19800,
    lead: { name: "Insp. Bello Maru", face: face("#5C3A1E", "#3a5a3a", "short", "cap", "flat") },
    victim: "Anka Miners' Cooperative (400 g of gold dust, about ₦30M)",
    briefing:
      "The cooperative keeps its gold dust in a strongbox until the monthly sale. This month's weighing came up 400 grams short. The chairman says dust 'blows away' when the box is opened.",
    kit: {
      backdrop: { kind: "outdoor", sky: "day", ground: "dirt", horizon: "rocks" },
      castSide: "left",
      props: [
        { kind: "hut", x: 76, y: 44, name: "Cooperative hut" },
        { kind: "chest", x: 50, y: 60, name: "Strongbox" },
        { kind: "hole", x: 30, y: 62, name: "Mine pit" },
        { kind: "lantern", x: 62, y: 70, name: "Lantern" },
        { kind: "footprints", x: 44, y: 80, name: "Sandal prints" },
        { kind: "phone", x: 82, y: 70, name: "Chairman's phone" },
        { kind: "sack", x: 86, y: 74 },
        { kind: "boulder", x: 16, y: 48 },
      ],
    },
    clues: [
      { id: "box", name: "Strongbox", icon: Gem, x: 50, y: 60, description: "The cooperative's strongbox and its two padlocks.", action: "Check the locks", finding: "Both padlocks open with their own keys, no scratches. The chairman holds one key; the other is with the treasurer, who was in Gusau all week.", suspectId: "maikano" },
      { id: "prints", name: "Sandal prints", icon: Footprints, x: 44, y: 80, description: "Prints in the dust around the box.", action: "Cast a print", lab: { kind: "prints", shape: "boot" }, finding: "Leather sandals with a nail in the heel, the chairman's market sandals. They come from the hut, stop at the box, and go back.", suspectId: "maikano" },
      { id: "phone", name: "Chairman's phone", icon: Smartphone, x: 82, y: 70, description: "Left charging in the hut.", action: "Read the messages", finding: "To a buyer in Kano: '400 grams ready. Same price. Come Thursday.' Sent the day before the weighing.", suspectId: "maikano" },
      { id: "lantern", name: "Lantern", icon: Receipt, x: 62, y: 70, description: "The night watchman's lantern.", action: "Check the tank", finding: "Full. Watchman Danjuma had light all night and logged one visitor at 22:40: the chairman, 'checking the box'.", suspectId: "danjuma" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "maikano", name: "Alhaji Maikano", role: "Cooperative chairman", face: face("#6b4226", "#f2f2e8", "short", "fila", "smirk", "#7a1f2a"), motive: "Sells gold to a Kano buyer on the side.", alibi: "Says he never opens the box alone.", background: "Chairman for eleven years.", quote: "Gold dust is like smoke. Wind takes some every time.", statements: [
        { id: "mai-1", text: "I have not been near the box since the last weighing.", lie: { clueId: "prints", reveal: "I went to check it. Only to check." } },
        { id: "mai-2", text: "I don't know any gold buyer in Kano.", lie: { clueId: "phone", reveal: "He is a friend. We talk about many things." } },
      ] },
      { id: "danjuma", name: "Danjuma", role: "Night watchman", face: face("#4a2c17", "#8a6a42", "buzz", "cap", "worried"), motive: "Guards the box at night.", alibi: "Awake by the hut all night.", background: "Former miner, lost a finger in a pit.", quote: "I saw only the chairman. I wrote it in my book.", statements: [
        { id: "dnj-1", text: "The chairman came at 22:40 and sent me to buy tea.", press: "He told me to take my time. The tea seller is far." },
      ] },
      { id: "rabi", name: "Rabi Sule", role: "Treasurer", face: face("#8D5524", "#1d4a8a", "bun", "gele", "flat", "#1d4a8a"), motive: "Holds the second key.", alibi: "In Gusau for her sister's wedding.", background: "Keeps the cooperative's books.", quote: "My key never left my neck.", statements: [
        { id: "rab-1", text: "The chairman has a copy of my key. He made it 'in case'.", press: "Last year, when I was sick. He never gave it back." },
      ] },
    ],
    culpritId: "maikano",
    solution:
      "Chairman Maikano used his key and a copy of the treasurer's, sent the watchman away for tea at 22:40, and took 400 grams of gold dust for a buyer in Kano. His sandal prints and his own messages proved the 'wind' story false.",
  },

  /* ================================================================ KEBBI */
  {
    id: "keb-rice",
    tier: 75,
    title: "The Rice Pyramid of Birnin Kebbi",
    hook: "A proud pyramid of 10,000 rice bags is unveiled for the cameras. A bag splits and pours out sand.",
    region: at("Kebbi", "Rice aggregation centre, Birnin Kebbi"),
    inspiredBy: "The famous 'rice pyramids' and later claims that some bags held sand.",
    categories: ["alley"],
    tags: ["Kebbi", "Rice", "Farmers' loans"],
    bounty: 400_000,
    inspecting: 33100,
    lead: { name: "Insp. Halima Bunza", face: face("#6b4226", "#1d6a3a", "bun", "gele", "flat", "#1d6a3a") },
    victim: "The farmers' loan scheme (₦250M of rice owed)",
    briefing:
      "Farmers repay their loans in rice. The aggregator built the pyramid to show the scheme works. At the unveiling, a bag near the bottom split, and it was full of sand.",
    kit: {
      backdrop: { kind: "outdoor", sky: "day", ground: "dirt", horizon: "savanna" },
      castSide: "right",
      props: [
        { kind: "sign", x: 50, y: 14, label: "RICE PYRAMID UNVEILING", color: "#f5c518" },
        { kind: "pyramid", x: 46, y: 50, name: "Rice pyramid" },
        { kind: "sack", x: 30, y: 70, name: "Split bag" },
        { kind: "paper", x: 56, y: 82, name: "Weighbridge ticket" },
        { kind: "camera", x: 18, y: 62, name: "Press camera" },
        { kind: "van", x: 78, y: 54, label: "AGRO LOGISTICS", name: "Lorry" },
        { kind: "umbrella", x: 64, y: 62, color: "#1d6a3a" },
      ],
    },
    clues: [
      { id: "bag", name: "Split bag", icon: Wheat, x: 30, y: 70, description: "The bag that split at the unveiling.", action: "Test the contents", finding: "Rice on top, river sand underneath, and a second label sewn under the first: 'GRAVEL & SAND, Argungu'.", suspectId: "yakubu" },
      { id: "ticket", name: "Weighbridge ticket", icon: Receipt, x: 56, y: 82, description: "Torn weighbridge tickets from the lorries.", action: "Rebuild the ticket", lab: { kind: "torn", style: "ledger", title: "WEIGHBRIDGE", lines: ["Lorry KBR-221", "Load: 'rice'", "Gross: 31,400 kg", "Tare: 9,800 kg", "Source: Argungu sand pit", "Driver: L. Musa", "Agent: Y. Abdullahi"] }, finding: "Lorries booked as 'rice' were loaded at a sand pit, and the agent on every ticket is the aggregator, Yakubu Abdullahi.", suspectId: "yakubu" },
      { id: "camera", name: "Press camera", icon: Cctv, x: 18, y: 62, description: "A reporter's photos from building day.", action: "Look at the photos", finding: "Workers sewing rice tops onto sand bags behind the lorry, while the aggregator watches and points.", suspectId: "yakubu" },
      { id: "lorry", name: "Lorry", icon: Truck, x: 78, y: 54, description: "The lorry that brought the bottom rows.", action: "Talk to the driver", finding: "Driver Lawal Musa kept his own log: he was paid to carry 'sand for the foundation'. He thought it was building sand.", suspectId: "lawal" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "yakubu", name: "Yakubu Abdullahi", role: "Rice aggregator", face: face("#5C3A1E", "#f2f2e8", "short", "cap", "smile"), motive: "Farmers didn't repay enough rice; he needed the pyramid to look full.", alibi: "Says he only counted bags.", background: "Collects loan repayments from 6,000 farmers.", quote: "Ten thousand bags! Count them yourself!", statements: [
        { id: "yak-1", text: "Every bag came straight from farmers.", lie: { clueId: "ticket", reveal: "Some lorries... topped up the numbers. From Argungu." } },
        { id: "yak-2", text: "I was never at the building site.", lie: { clueId: "camera", reveal: "I came to supervise. Supervise only." } },
      ] },
      { id: "lawal", name: "Lawal Musa", role: "Lorry driver", face: face("#4a2c17", "#c0182b", "buzz", "cap", "worried"), motive: "Drove the sand.", alibi: "Has a log of every trip.", background: "Drives for anyone who pays diesel.", quote: "Sand is sand. Nobody told me it was 'rice'.", statements: [
        { id: "law-1", text: "Yakubu paid me double to keep the sand trips quiet.", press: "He said the foundation was a surprise." },
      ] },
      { id: "farmer", name: "Hauwa Bagudo", role: "Farmers' leader", face: face("#8D5524", "#7a3aff", "bun", "gele", "flat", "#7a3aff"), motive: "Complained that the scheme lies about its numbers.", alibi: "At the unveiling with 40 farmers.", background: "Repaid her loan in full, in rice.", quote: "Half of us repaid. Not all of us. That's the truth.", statements: [
        { id: "hau-1", text: "We told them repayments were short. They wanted pictures anyway.", press: "Yakubu said 'a pyramid must be a pyramid'." },
      ] },
    ],
    culpritId: "yakubu",
    solution:
      "Aggregator Yakubu Abdullahi was short of rice from farmers' repayments, so he built the bottom rows of the pyramid from sand bags topped with rice and booked the sand lorries as 'rice'. The weighbridge tickets, the reporter's photos and the split bag proved it.",
  },

  /* ================================================================ SOKOTO */
  {
    id: "sok-hajj",
    tier: 76,
    title: "The Hajj Seats That Never Flew",
    hook: "Ninety pilgrims paid a travel agency for Hajj. On flight day, the agency's office is locked and the 'tickets' are fake.",
    region: at("Sokoto", "Travel agency office, Sokoto"),
    inspiredBy: "Reports of pilgrims paying travel agents for Hajj seats that did not exist.",
    categories: ["cyber"],
    tags: ["Sokoto", "Hajj", "Travel fraud"],
    bounty: 500_000,
    inspecting: 27600,
    lead: { name: "Insp. Umar Wamakko", face: face("#6b4226", "#f2f2e8", "short", "fila", "flat", "#1d6a3a") },
    victim: "Ninety intending pilgrims (₦540M)",
    briefing:
      "Al-Nasara Travels collected ₦6M each from ninety families. The tickets they handed out have real-looking airline logos, but the flight numbers don't exist. The manager says hackers changed the bookings.",
    kit: {
      backdrop: { kind: "indoor", decor: "office", wall: "#e8dcc0", floor: "#8a7a62", trim: "#1d6a3a", window: "city-day" },
      castSide: "right",
      props: [
        { kind: "sign", x: 74, y: 16, label: "AL-NASARA TRAVELS", color: "#1d6a3a" },
        { kind: "desk", x: 44, y: 62, name: "Manager's desk" },
        { kind: "laptop", x: 40, y: 58, name: "Booking laptop" },
        { kind: "safe", x: 16, y: 52, name: "Office safe" },
        { kind: "luggage", x: 70, y: 70, name: "Pilgrims' bags" },
        { kind: "paper", x: 56, y: 84, name: "Ticket printouts" },
        { kind: "cabinet", x: 86, y: 50 },
        { kind: "chair", x: 46, y: 70 },
      ],
    },
    clues: [
      { id: "laptop", name: "Booking laptop", icon: Laptop, x: 40, y: 58, description: "The laptop used for 'bookings'.", action: "Check the history", finding: "No airline booking site, ever. Only a ticket template opened and edited ninety times, from the manager's own login.", suspectId: "bashir" },
      { id: "safe", name: "Office safe", icon: KeyRound, x: 16, y: 52, description: "The office safe, door open, empty.", action: "Dust the handle", lab: { kind: "prints", shape: "finger" }, finding: "Clear prints of manager Bashir Tambuwal. The cleaner says he emptied it on Thursday 'to bank the money'. No bank shows a deposit.", suspectId: "bashir" },
      { id: "tickets", name: "Ticket printouts", icon: Plane, x: 56, y: 84, description: "The 'tickets' given to families.", action: "Check the flight numbers", finding: "All ninety tickets list a flight number the airline has never used, printed on the office's own printer.", suspectId: "bashir" },
      { id: "bags", name: "Pilgrims' bags", icon: Package, x: 70, y: 70, description: "Bags left by families who came to check in.", action: "Read the tags", finding: "Tags from the agency's front desk, filled in by the clerk, Fatima, who says she was told the flights were confirmed.", suspectId: "fatima" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "bashir", name: "Bashir Tambuwal", role: "Agency manager", face: face("#5C3A1E", "#1d2f5a", "slick", "glasses", "smile"), motive: "Kept the ₦540M and blamed hackers.", alibi: "Says he was at the airport sorting the flights.", background: "Ran a small travel agency for six years.", quote: "Hackers! They changed everything in the system!", statements: [
        { id: "bas-1", text: "Hackers changed our real bookings.", lie: { clueId: "laptop", reveal: "There were no real bookings. I was going to book later." } },
        { id: "bas-2", text: "The money is safe in the bank.", lie: { clueId: "safe", reveal: "I moved it. To invest. For a short time." } },
      ] },
      { id: "fatima", name: "Fatima Isa", role: "Front desk clerk", face: face("#8D5524", "#c0182b", "bun", "gele", "worried", "#c0182b"), motive: "Took the families' money at the desk.", alibi: "At the desk every day.", background: "Joined the agency this year.", quote: "I believed him. My own aunt paid!", statements: [
        { id: "fat-1", text: "Oga printed the tickets himself, at night.", press: "He said the airline's system only works at night." },
      ] },
      { id: "agent", name: "Shehu Kware", role: "Airline sales agent", face: face("#4a2c17", "#e8e0d0", "short", "cap", "flat"), motive: "Sells seats to agencies.", alibi: "His company's records are open.", background: "Sold seats to many Sokoto agencies.", quote: "Al-Nasara never bought a single seat from us this year.", statements: [
        { id: "she-1", text: "Bashir asked me last year how to copy a ticket design.", press: "I told him it was illegal. He laughed." },
      ] },
    ],
    culpritId: "bashir",
    solution:
      "Manager Bashir Tambuwal never booked any seats. He forged ninety tickets from a template, emptied the safe on Thursday and blamed hackers. His laptop history, his prints on the safe and the fake flight numbers proved it.",
  },

  /* ================================================================ BAUCHI */
  {
    id: "bau-yankari",
    tier: 77,
    title: "The Missing Tusks of Yankari",
    hook: "Old ivory tusks kept in a game reserve's museum store are swapped for painted resin copies.",
    region: at("Bauchi", "Game reserve museum, near Bauchi"),
    inspiredBy: "Reports of ivory smuggling from Nigerian reserves and stores.",
    categories: ["heists"],
    tags: ["Bauchi", "Yankari", "Ivory"],
    bounty: 540_000,
    inspecting: 18700,
    lead: { name: "Insp. Yusuf Dass", face: face("#5C3A1E", "#3a5a3a", "short", "cap", "flat") },
    victim: "The reserve's museum (four historic tusks)",
    briefing:
      "Four tusks from elephants that died of old age decades ago are kept in the museum store as evidence and history. A visiting researcher tapped one and it rang hollow. All four are resin copies.",
    kit: {
      backdrop: { kind: "indoor", decor: "warehouse", wall: "#b5a07a", floor: "#7a6a52", trim: "#4a3a22", window: "hills" },
      castSide: "left",
      props: [
        { kind: "pedestal", x: 50, y: 60, name: "Display stand" },
        { kind: "tusk", x: 50, y: 54, name: "Tusk" },
        { kind: "crate", x: 76, y: 66, label: "MUSEUM STORE", name: "Store crate" },
        { kind: "paint", x: 30, y: 78, name: "Paint tin" },
        { kind: "cctv", x: 86, y: 20, name: "Store camera" },
        { kind: "paper", x: 62, y: 84, name: "Visitors' book" },
        { kind: "ladder", x: 18, y: 52 },
      ],
    },
    clues: [
      { id: "tusk", name: "Tusk", icon: Gem, x: 50, y: 54, description: "One of the four 'tusks'.", action: "Test the material", finding: "Resin over a cardboard tube, painted and stained with tea to look old. The paint is the same as in the tin by the door.", suspectId: "kabiru" },
      { id: "tin", name: "Paint tin", icon: Package, x: 30, y: 78, description: "A half-used tin of ivory-white paint.", action: "Dust the lid", lab: { kind: "prints", shape: "finger" }, finding: "Prints of the store assistant, Kabiru Tela. The tin was bought in Bauchi town last month on the museum's petty cash.", suspectId: "kabiru" },
      { id: "camera", name: "Store camera", icon: Cctv, x: 86, y: 20, description: "The store camera, which 'broke' last month.", action: "Recover the files", finding: "It worked until a hand covered it with tape at 19:02 on the 12th, the night the assistant signed out late 'to clean'.", suspectId: "kabiru" },
      { id: "book", name: "Visitors' book", icon: ScrollText, x: 62, y: 84, description: "The museum visitors' book.", action: "Read last month's pages", finding: "A 'researcher' from abroad visited three times and asked about the tusks. His phone number is saved in the curator's phone as 'Buyer'.", suspectId: "curator" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "kabiru", name: "Kabiru Tela", role: "Store assistant", face: face("#4a2c17", "#8a6a42", "buzz", "cap", "worried"), motive: "Made the copies and sold the real tusks.", alibi: "Says he never stays after 5 p.m.", background: "Good with his hands; makes carvings for tourists.", quote: "I only sweep the store. I don't touch the tusks.", statements: [
        { id: "kab-1", text: "I never stay after closing.", lie: { clueId: "camera", reveal: "That night I stayed to clean. To clean." } },
        { id: "kab-2", text: "I have never bought paint.", lie: { clueId: "tin", reveal: "For carvings. My carvings!" } },
      ] },
      { id: "curator", name: "Dr. Ladi Gwarzo", role: "Curator", face: face("#8D5524", "#1d4a8a", "bun", "glasses", "flat"), motive: "Has a 'buyer' in her phone.", alibi: "At a workshop in Jos that week.", background: "Built the museum's collection.", quote: "That man asked to buy them. I said no and saved his number to warn the police.", statements: [
        { id: "lad-1", text: "I reported the 'researcher' to the reserve office.", press: "Ask the reserve office. My letter is on file." },
      ] },
      { id: "ranger", name: "Ranger Hamza", role: "Night ranger", face: face("#5C3A1E", "#3a5a3a", "short", "cap", "flat"), motive: "Patrols the museum at night.", alibi: "On patrol at the springs.", background: "Twenty years at the reserve.", quote: "I saw Kabiru's motorbike outside late on the 12th.", statements: [
        { id: "ham-1", text: "Kabiru's motorbike was parked at the store at 7 p.m.", press: "With a long bag on the back. I thought it was firewood." },
      ] },
    ],
    culpritId: "kabiru",
    solution:
      "Store assistant Kabiru Tela made resin copies with paint bought on petty cash, taped over the store camera on the 12th, and swapped the four tusks to sell them. The camera files, his prints on the paint tin and the hollow copies gave him away.",
  },

  /* ================================================================ GOMBE */
  {
    id: "gom-fertilizer",
    tier: 78,
    title: "The Fertilizer That Changed Bags",
    hook: "Subsidised fertilizer for farmers turns up in the open market in plain white bags at full price.",
    region: at("Gombe", "Farmers' depot, Gombe"),
    inspiredBy: "Reports of subsidised fertilizer being diverted and resold.",
    categories: ["alley"],
    tags: ["Gombe", "Fertilizer", "Diversion"],
    bounty: 360_000,
    inspecting: 15900,
    lead: { name: "Insp. Zainab Kumo", face: face("#6b4226", "#7a1f6a", "bun", "gele", "flat", "#7a1f6a") },
    victim: "Gombe farmers (1,200 subsidised bags)",
    briefing:
      "Twelve hundred bags of subsidised fertilizer reached the depot, but farmers were told stock had finished in two days. The same fertilizer is in the market in plain white bags at three times the price.",
    kit: {
      backdrop: { kind: "outdoor", sky: "dawn", ground: "dirt", horizon: "city" },
      castSide: "left",
      props: [
        { kind: "sign", x: 50, y: 14, label: "FARMERS' DEPOT", color: "#1d6a3a" },
        { kind: "sack", x: 40, y: 60, name: "White bag" },
        { kind: "sack", x: 48, y: 62 },
        { kind: "sewing", x: 66, y: 66, name: "Bag sewing machine" },
        { kind: "paper", x: 30, y: 82, name: "Waybill" },
        { kind: "keke", x: 84, y: 56, name: "Delivery keke" },
        { kind: "stall", x: 74, y: 50, name: "Market stall" },
      ],
    },
    clues: [
      { id: "bag", name: "White bag", icon: Package, x: 40, y: 60, description: "A plain white fertilizer bag from the market.", action: "Test the fertilizer", finding: "The same batch number as the depot's subsidised stock, poured from the green government bags into plain ones.", suspectId: "jibrin" },
      { id: "machine", name: "Bag sewing machine", icon: Receipt, x: 66, y: 66, description: "A bag-closing machine at the back of the depot.", action: "Check the thread", finding: "Fresh white thread, the same as on the market bags, and a pile of slit green bags hidden under it.", suspectId: "jibrin" },
      { id: "waybill", name: "Waybill", icon: ScrollText, x: 30, y: 82, description: "Torn delivery papers.", action: "Rebuild the waybill", lab: { kind: "torn", style: "ledger", title: "DEPOT WAYBILL", lines: ["Received: 1,200 bags", "Issued to farmers: 310", "'Damaged': 0", "Night out: 890 bags", "To: Tashan Dukku market", "Signed: J. Garkuwa", "Manager"] }, finding: "Only 310 bags went to farmers. 890 went out at night to the market, signed by the depot manager.", suspectId: "jibrin" },
      { id: "keke", name: "Delivery keke", icon: Truck, x: 84, y: 56, description: "The keke that delivers to market stalls.", action: "Talk to the rider", finding: "Rider Idris carried white bags from the depot to the market at night for ₦500 a trip. He thought it was the market's own stock.", suspectId: "idris" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "jibrin", name: "Jibrin Garkuwa", role: "Depot manager", face: face("#5C3A1E", "#f2f2e8", "short", "fila", "smirk", "#1d6a3a"), motive: "Rebagged 890 bags and sold them at triple price.", alibi: "Says stock simply ran out.", background: "Manages the depot during planting season.", quote: "Demand was high. Fertilizer finished. Simple.", statements: [
        { id: "jib-1", text: "All 1,200 bags went to registered farmers.", lie: { clueId: "waybill", reveal: "Some were... sold to raise money for transport." } },
        { id: "jib-2", text: "We don't have a sewing machine here.", lie: { clueId: "machine", reveal: "It's for repairing torn bags. Only repairs." } },
      ] },
      { id: "idris", name: "Idris Pindiga", role: "Keke rider", face: face("#4a2c17", "#f5c518", "buzz", "cap", "worried"), motive: "Carried bags at night.", alibi: "Has his trip receipts.", background: "Rides goods for market traders.", quote: "I carry load. I don't read bag.", statements: [
        { id: "idr-1", text: "Jibrin paid me himself, at the depot gate.", press: "Always after 10 p.m. Always cash." },
      ] },
      { id: "trader", name: "Mama Asabe", role: "Market trader", face: face("#8D5524", "#e07a2a", "bun", "gele", "flat", "#e07a2a"), motive: "Sells the white bags.", alibi: "At her stall every day.", background: "Sells seeds and fertilizer.", quote: "I bought them like any stock. I have a receipt.", statements: [
        { id: "asa-1", text: "The receipt is signed 'J.G.'", press: "He told me it was 'extra stock from Abuja'." },
      ] },
    ],
    culpritId: "jibrin",
    solution:
      "Depot manager Jibrin Garkuwa gave out only 310 subsidised bags, then rebagged 890 into plain white bags at night and sold them in the market at three times the price. The waybill, the sewing machine and the matching batch numbers proved it.",
  },

  /* ================================================================ BORNO */
  {
    id: "bor-relief",
    tier: 79,
    title: "The Relief Rice of Maiduguri",
    hook: "Rice meant for displaced families shows up for sale in a market, still marked 'NOT FOR SALE'.",
    region: at("Borno", "Monday Market, Maiduguri"),
    inspiredBy: "Reports of donated relief food being diverted and sold.",
    categories: ["alley"],
    tags: ["Borno", "Relief food", "Diversion"],
    bounty: 420_000,
    inspecting: 22900,
    lead: { name: "Insp. Fatima Kyari", face: face("#6b4226", "#1d4a8a", "bun", "gele", "flat", "#1d4a8a") },
    victim: "Families in a relief camp (300 bags of rice)",
    briefing:
      "A relief warehouse received 900 bags of donated rice for families in camps. Families got 600. A trader in Monday Market was selling bags with 'RELIEF – NOT FOR SALE' half scraped off.",
    kit: {
      backdrop: { kind: "outdoor", sky: "day", ground: "dirt", horizon: "city" },
      castSide: "right",
      props: [
        { kind: "sign", x: 50, y: 14, label: "MONDAY MARKET", color: "#c0182b" },
        { kind: "stall", x: 40, y: 56, name: "Rice stall" },
        { kind: "crate", x: 40, y: 52, label: "NOT FOR SALE", name: "Relief bag" },
        { kind: "paper", x: 26, y: 82, name: "Warehouse waybill" },
        { kind: "phone", x: 62, y: 66, name: "Trader's phone" },
        { kind: "van", x: 70, y: 48, label: "RELIEF", name: "Warehouse lorry" },
        { kind: "umbrella", x: 18, y: 50, color: "#c0182b" },
      ],
    },
    clues: [
      { id: "bag", name: "Relief bag", icon: Package, x: 40, y: 52, description: "A bag with 'RELIEF – NOT FOR SALE' scraped off.", action: "Read the batch code", finding: "Batch R-118, part of the 900 bags signed into the relief warehouse last month.", suspectId: "modu" },
      { id: "waybill", name: "Warehouse waybill", icon: ScrollText, x: 26, y: 82, description: "Torn warehouse papers.", action: "Rebuild the waybill", lab: { kind: "torn", style: "ledger", title: "RELIEF STORE", lines: ["Received: 900 bags (R-118)", "Issued camp A: 300", "Issued camp B: 300", "'Spoiled by rain': 300", "Removed: Sunday night", "Clerk: M. Bukar", "No inspector present"] }, finding: "300 bags were written off as 'spoiled by rain' and removed on a Sunday night, when there had been no rain for weeks. Clerk Modu Bukar signed it alone.", suspectId: "modu" },
      { id: "phone", name: "Trader's phone", icon: Smartphone, x: 62, y: 66, description: "The rice trader's phone.", action: "Read the chats", finding: "'300 bags available. Remove the stamp before selling.' From a number saved as 'Modu Store'.", suspectId: "modu" },
      { id: "lorry", name: "Warehouse lorry", icon: Truck, x: 70, y: 48, description: "The lorry used by the relief warehouse.", action: "Check the tracker", finding: "On Sunday at 23:10 it drove from the warehouse to the trader's store and back. The driver was off sick; the clerk had the keys.", suspectId: "modu" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "modu", name: "Modu Bukar", role: "Warehouse clerk", face: face("#4a2c17", "#e8e0d0", "short", "cap", "smirk"), motive: "Wrote off 300 good bags and sold them.", alibi: "Says rain spoiled the bags.", background: "Keeps the relief warehouse records.", quote: "Rain doesn't care who is hungry.", statements: [
        { id: "mod-1", text: "300 bags were spoiled by rain and thrown away.", lie: { clueId: "waybill", reveal: "They were... a little wet. Not spoiled." } },
        { id: "mod-2", text: "I don't know any rice trader.", lie: { clueId: "phone", reveal: "He is a customer of my brother." } },
      ] },
      { id: "trader", name: "Alhaji Kolo", role: "Rice trader", face: face("#5C3A1E", "#f2f2e8", "short", "fila", "worried", "#3a5a8a"), motive: "Sold the relief rice.", alibi: "At his stall.", background: "Big rice trader in Monday Market.", quote: "I bought it cheap. I didn't ask questions.", statements: [
        { id: "kol-1", text: "Modu told me to scrape the stamp off.", press: "He said 'nobody reads stamps'." },
      ] },
      { id: "driver", name: "Bulama Ali", role: "Lorry driver", face: face("#4a2c17", "#3a5a3a", "buzz", "cap", "flat"), motive: "Drives the warehouse lorry.", alibi: "Off sick with a doctor's note.", background: "Drives relief to the camps every week.", quote: "That Sunday I was in bed with fever.", statements: [
        { id: "bul-1", text: "My keys were with Modu that weekend.", press: "He said he needed the lorry to 'move stock around'." },
      ] },
    ],
    culpritId: "modu",
    solution:
      "Clerk Modu Bukar wrote off 300 good bags of relief rice as 'spoiled by rain', took them in the warehouse lorry on a Sunday night and sold them to a market trader. The waybill, the lorry's tracker and his messages proved it.",
  },

  /* ================================================================ YOBE */
  {
    id: "yob-grain",
    tier: 80,
    title: "The Rats of Potiskum",
    hook: "A grain store is two-thirds empty. The storekeeper says rats ate 40 tonnes of maize.",
    region: at("Yobe", "Grain store, Potiskum"),
    inspiredBy: "The many Nigerian stories of animals 'eating' missing money and stock.",
    categories: ["alley"],
    tags: ["Yobe", "Grain store", "Excuses"],
    bounty: 340_000,
    inspecting: 17400,
    lead: { name: "Insp. Adamu Fika", face: face("#5C3A1E", "#3a5a3a", "short", "fila", "smile", "#f2f2e8") },
    victim: "The state grain reserve (40 tonnes of maize)",
    briefing:
      "The grain reserve should hold 60 tonnes of maize for the lean season. Inspectors found 20. The storekeeper's report says 'rats and weevils'. There isn't a single rat dropping in the store.",
    kit: {
      backdrop: { kind: "indoor", decor: "warehouse", wall: "#c9a06a", floor: "#8a7a62", trim: "#5a4a2a", window: "none" },
      castSide: "left",
      props: [
        { kind: "sack", x: 36, y: 56, name: "Maize sack" },
        { kind: "sack", x: 46, y: 58 },
        { kind: "sack", x: 56, y: 56 },
        { kind: "footprints", x: 54, y: 80, name: "Drag marks" },
        { kind: "cabinet", x: 84, y: 52, name: "Ledger cabinet" },
        { kind: "paper", x: 30, y: 84, name: "Sales ledger" },
        { kind: "lantern", x: 70, y: 70, name: "Lantern" },
      ],
    },
    clues: [
      { id: "floor", name: "Drag marks", icon: Footprints, x: 54, y: 80, description: "Long marks in the dust towards the back door.", action: "Follow the marks", finding: "Heavy sacks were dragged to the back door many times. Rats don't drag sacks. And there is not one rat dropping in the store.", suspectId: "garba" },
      { id: "ledger", name: "Sales ledger", icon: ClipboardList, x: 30, y: 84, description: "A private notebook hidden behind the cabinet.", action: "Rebuild the pages", lab: { kind: "torn", style: "ledger", title: "PRIVATE", lines: ["Maize sold: 40 tonnes", "To: Damaturu buyers", "Price: N380,000/tonne", "Collected: Fridays", "Store report: 'rats'", "G.M.", "Keep this safe"] }, finding: "Forty tonnes sold to buyers in Damaturu at ₦380,000 a tonne, initialled 'G.M.', with a note to report rats.", suspectId: "garba" },
      { id: "sack", name: "Maize sack", icon: Wheat, x: 36, y: 56, description: "One of the remaining sacks.", action: "Check the maize", finding: "Clean, dry maize, no weevils and no gnawing. The pest report is false.", suspectId: "garba" },
      { id: "lantern", name: "Lantern", icon: Receipt, x: 70, y: 70, description: "The night guard's lantern.", action: "Check the guard's log", finding: "Guard Musa logged a lorry 'collecting for the storekeeper' every Friday night for eight weeks.", suspectId: "musa" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "garba", name: "Garba Machina", role: "Storekeeper", face: face("#4a2c17", "#8a6a42", "short", "cap", "smirk"), motive: "Sold 40 tonnes and blamed rats.", alibi: "Says pests ate the grain.", background: "Keeps the grain reserve.", quote: "Potiskum rats are not ordinary rats!", statements: [
        { id: "gar-1", text: "Rats and weevils ate the maize.", lie: { clueId: "floor", reveal: "Maybe a few sacks were... moved." } },
        { id: "gar-2", text: "I have never sold reserve grain.", lie: { clueId: "ledger", reveal: "It was going to spoil. I sold it before it spoiled." } },
      ] },
      { id: "musa", name: "Musa Nangere", role: "Night guard", face: face("#5C3A1E", "#3a5a3a", "buzz", "cap", "worried"), motive: "Let the lorries in.", alibi: "On duty every night.", background: "Guards the store for ₦20,000 a month.", quote: "The storekeeper is my oga. I opened the gate.", statements: [
        { id: "mus-1", text: "Every Friday a lorry came for 'the storekeeper's collection'.", press: "I wrote it in my book. Nobody ever read my book." },
      ] },
      { id: "officer", name: "Hajiya Amina", role: "Ministry inspector", face: face("#8D5524", "#1d4a8a", "bun", "glasses", "flat"), motive: "Signed last quarter's stock report.", alibi: "Inspects stores across the state.", background: "Found the shortage.", quote: "Last quarter I counted from the door. This time I went inside.", statements: [
        { id: "ami-1", text: "Garba always met me at the door with tea.", press: "And always said counting inside was 'dusty work'." },
      ] },
    ],
    culpritId: "garba",
    solution:
      "Storekeeper Garba Machina sold 40 tonnes of reserve maize to buyers in Damaturu, loading lorries every Friday night, and wrote 'rats and weevils' in his report. The drag marks, his private ledger and the clean maize proved there were no rats.",
  },

  /* ================================================================ JIGAWA */
  {
    id: "jig-solar",
    tier: 81,
    title: "The Solar Lights of Dutse",
    hook: "One by one, the batteries vanish from Dutse's solar streetlights. The streets go dark, and a solar shop has plenty of 'second-hand' batteries.",
    region: at("Jigawa", "Kiyawa Road, Dutse"),
    inspiredBy: "Reports of solar streetlight batteries being stolen and resold.",
    categories: ["cyber", "alley"],
    tags: ["Jigawa", "Solar", "Streetlights"],
    bounty: 320_000,
    inspecting: 14800,
    lead: { name: "Insp. Nura Hadejia", face: face("#5C3A1E", "#1d2f5a", "short", "fila", "flat", "#1d2f5a") },
    victim: "Dutse municipal streetlights (86 batteries)",
    briefing:
      "86 streetlight batteries have gone in two months, always at night and always unscrewed neatly. The maintenance contractor blames thieves on okada. A solar shop is selling 'second-hand' batteries of the same model.",
    kit: {
      backdrop: { kind: "outdoor", sky: "night", ground: "road", horizon: "city" },
      castSide: "left",
      props: [
        { kind: "lamppost", x: 34, y: 50, name: "Streetlight" },
        { kind: "ladder", x: 46, y: 58, name: "Ladder" },
        { kind: "kiosk", x: 76, y: 54, label: "SOLAR", color: "#f5c518", name: "Solar shop" },
        { kind: "okada", x: 60, y: 70, name: "Okada" },
        { kind: "paper", x: 30, y: 84, name: "Job sheet" },
        { kind: "phone", x: 76, y: 60, name: "Shop phone" },
        { kind: "lamppost", x: 88, y: 46 },
      ],
    },
    clues: [
      { id: "light", name: "Streetlight", icon: Battery, x: 34, y: 50, description: "A pole with its battery box open and empty.", action: "Check the box", finding: "The screws were undone with the special key only the maintenance team carries. No forcing.", suspectId: "auwal" },
      { id: "ladder", name: "Ladder", icon: KeyRound, x: 46, y: 58, description: "A long aluminium ladder left by the pole.", action: "Dust the rungs", lab: { kind: "prints", shape: "finger" }, finding: "Prints of technician Auwal Ringim. The ladder is stencilled with the maintenance contractor's name.", suspectId: "auwal" },
      { id: "sheet", name: "Job sheet", icon: ScrollText, x: 30, y: 84, description: "Torn maintenance job sheets.", action: "Rebuild the sheet", lab: { kind: "torn", style: "ledger", title: "NIGHT JOBS", lines: ["Kiyawa Rd: 12 poles", "'Battery check'", "Removed: 12 units", "To: workshop?", "Sold: Dahiru Solar", "N45,000 each", "A.R."] }, finding: "'Battery checks' on twelve poles, the batteries 'sold: Dahiru Solar, ₦45,000 each', initialled A.R.", suspectId: "auwal" },
      { id: "phone", name: "Shop phone", icon: Smartphone, x: 76, y: 60, description: "The solar shop owner's phone.", action: "Read the messages", finding: "Dahiru Solar ordered from 'Auwal Tech': 'Bring 10 more, same model, no box.' The owner says he thought they were old stock.", suspectId: "dahiru" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "auwal", name: "Auwal Ringim", role: "Maintenance technician", face: face("#4a2c17", "#f5c518", "buzz", "cap", "smirk"), motive: "Removed batteries on 'checks' and sold them.", alibi: "Says he only does day shifts.", background: "Knows every pole in Dutse.", quote: "Thieves on okada, I'm telling you!", statements: [
        { id: "auw-1", text: "I never work at night.", lie: { clueId: "ladder", reveal: "Sometimes. For emergencies." } },
        { id: "auw-2", text: "I have never sold a battery to anyone.", lie: { clueId: "sheet", reveal: "Only the faulty ones. They were faulty." } },
      ] },
      { id: "dahiru", name: "Dahiru Kazaure", role: "Solar shop owner", face: face("#5C3A1E", "#e8e0d0", "short", "fila", "worried", "#e07a2a"), motive: "Sells the batteries.", alibi: "At his shop.", background: "Sells solar panels to farmers.", quote: "Second-hand is legal!", statements: [
        { id: "dah-1", text: "Auwal said the council was selling off old stock.", press: "He even showed me a council letter. It had no stamp." },
      ] },
      { id: "okada", name: "Sule Okada", role: "Okada rider", face: face("#4a2c17", "#c0182b", "buzz", "cap", "flat"), motive: "Riders were blamed.", alibi: "Carrying passengers.", background: "Rides at night on Kiyawa Road.", quote: "We okada men see everything at night.", statements: [
        { id: "sul-1", text: "I saw a man with a ladder and a company bus at 2 a.m.", press: "Yellow bus, company name on the side. Not okada." },
      ] },
    ],
    culpritId: "auwal",
    solution:
      "Technician Auwal Ringim used the maintenance team's special key and ladder to remove streetlight batteries at night under 'battery checks', and sold them to a solar shop as old stock. His prints, the job sheets and his messages with the shop proved it.",
  },
];
