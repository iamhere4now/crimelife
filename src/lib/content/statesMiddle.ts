import { Banknote, Bug, Cctv, ClipboardList, CreditCard, Footprints, Gem, KeyRound, Laptop, Package, Receipt, ScrollText, Smartphone, Truck, Wheat } from "lucide-react";
import type { CrimeCase, Face, MusicStyle } from "../types";

/**
 * One case for each Middle Belt state without a city of its own, inspired by
 * kinds of incidents Nigerians have read about; every name and detail is invented.
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
const at = (state: string, place: string, music: MusicStyle = "plateau") => ({ state, place, music });

export const STATE_CASES_MIDDLE: CrimeCase[] = [
  /* ================================================================ BENUE */
  {
    id: "bnu-snake",
    tier: 82,
    title: "The Snake That Swallowed ₦36M",
    hook: "An exam-board office in Makurdi can't account for ₦36M of form sales. The sales clerk says a snake slithered into the vault and swallowed it.",
    region: at("Benue", "Exam board office, Makurdi"),
    inspiredBy: "The famous 2018 report of a clerk claiming a snake swallowed millions of naira in exam-form money.",
    categories: ["cyber"],
    tags: ["Benue", "Makurdi", "Excuses"],
    bounty: 480_000,
    inspecting: 41800,
    lead: { name: "Insp. Terver Ioryue", face: face("#5C3A1E", "#1d6a3a", "short", "cap", "smile") },
    victim: "The exam board's Makurdi office (₦36M of form sales)",
    briefing:
      "Auditors asked for ₦36M of exam-form money kept in the office vault. The clerk told them, with a straight face, that a snake entered the vault and swallowed it. A small snake really was found in the office.",
    kit: {
      backdrop: { kind: "indoor", decor: "office", wall: "#d8e0d0", floor: "#7a8a7a", trim: "#1d6a3a", window: "city-day" },
      castSide: "left",
      props: [
        { kind: "safe", x: 78, y: 50, name: "Office vault" },
        { kind: "snake", x: 50, y: 74, name: "Snake" },
        { kind: "desk", x: 40, y: 60, name: "Clerk's desk" },
        { kind: "phone", x: 38, y: 56, name: "Clerk's phone" },
        { kind: "paper", x: 62, y: 84, name: "Bank slips" },
        { kind: "cctv", x: 14, y: 18, name: "Office camera" },
        { kind: "cabinet", x: 90, y: 64 },
      ],
    },
    clues: [
      { id: "snake", name: "Snake", icon: Bug, x: 50, y: 74, description: "A small green snake caught in the office.", action: "Ask a vet to examine it", finding: "A harmless grass snake, 40 cm long. It eats frogs and insects. It could not swallow a single bundle of notes, never mind ₦36M.", suspectId: "philomena" },
      { id: "slips", name: "Bank slips", icon: Receipt, x: 62, y: 84, description: "Torn bank deposit slips in the bin.", action: "Rebuild the slips", lab: { kind: "torn", style: "ledger", title: "DEPOSIT SLIPS", lines: ["Form sales: N36,000,000", "Deposited: N0", "Personal a/c: P. Agbo", "N4,000,000 x 9", "Different branches", "Dates: last 3 months", "Teller stamp present"] }, finding: "The form money never went to the board's account. Nine ₦4M deposits went into the clerk's personal account at different branches.", suspectId: "philomena" },
      { id: "phone", name: "Clerk's phone", icon: Smartphone, x: 38, y: 56, description: "The clerk's phone, buzzing on the desk.", action: "Read the messages", finding: "'If they ask, say snake. Nobody can arrest a snake.' Sent from her cousin, the night before the audit.", suspectId: "philomena" },
      { id: "camera", name: "Office camera", icon: Cctv, x: 14, y: 18, description: "The office camera over the vault.", action: "Play last week", finding: "The clerk takes bundles out of the vault into a black bag several evenings. On the audit morning, her cousin drops a small snake through the window.", suspectId: "orduen" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "philomena", name: "Philomena Agbo", role: "Sales clerk", face: face("#6b4226", "#7a1f6a", "bun", "glasses", "worried"), motive: "Took ₦36M and blamed a snake.", alibi: "Says she saw the snake leave the vault.", background: "Has sold exam forms for six years.", quote: "I saw it with my own two eyes! It was huge!", statements: [
        { id: "phi-1", text: "The snake swallowed the money. I saw it.", lie: { clueId: "snake", reveal: "Okay, it was a small snake. But the money is gone!" } },
        { id: "phi-2", text: "Every naira was kept in the vault.", lie: { clueId: "slips", reveal: "I was keeping it safe. In my account. Temporarily." } },
      ] },
      { id: "orduen", name: "Orduen Agbo", role: "Clerk's cousin", face: face("#4a2c17", "#e8e0d0", "buzz", "cap", "smirk"), motive: "Brought the snake.", alibi: "Says he only visits on Sundays.", background: "Sells pets and snakes by the river.", quote: "Snakes are my business. Money isn't.", statements: [
        { id: "ord-1", text: "She asked me for 'a small snake for the office'.", press: "She said the office had rats. I believed her." },
      ] },
      { id: "auditor", name: "Mrs. Ngozi Ihua", role: "Auditor", face: face("#8D5524", "#1d4a8a", "bun", "glasses", "flat"), motive: "Found the gap.", alibi: "Travelled from Abuja for the audit.", background: "Has heard every excuse in Nigeria.", quote: "Monkeys, rats, termites, and now snakes. Animals are very rich in this country.", statements: [
        { id: "ngo-1", text: "The clerk had the snake story ready before I asked a single question.", press: "She said 'snake' while I was still taking off my coat." },
      ] },
    ],
    culpritId: "philomena",
    solution:
      "Clerk Philomena Agbo moved the ₦36M exam-form money into her own account over three months, then had her cousin drop a small grass snake into the office and claimed it swallowed the money. The bank slips, the camera and her cousin's message proved it.",
  },

  /* ================================================================ KOGI */
  {
    id: "kog-ghost",
    tier: 83,
    title: "Ghost Workers of Lokoja",
    hook: "A state office pays 240 workers every month. A head count finds 61 people at their desks.",
    region: at("Kogi", "Civil service office, Lokoja"),
    inspiredBy: "Repeated reports of 'ghost workers' on Nigerian state payrolls.",
    categories: ["cyber"],
    tags: ["Kogi", "Payroll", "Ghost workers"],
    bounty: 460_000,
    inspecting: 20200,
    lead: { name: "Insp. Ojochide Ameh", face: face("#6b4226", "#c0182b", "bun", "gele", "flat", "#c0182b") },
    victim: "The state payroll (₦31M a month)",
    briefing:
      "A staff verification found 61 real workers in an office that pays 240 salaries. The payroll officer says the rest are 'on field work'. Their salaries all go into a handful of bank accounts.",
    kit: {
      backdrop: { kind: "indoor", decor: "office", wall: "#e8dcc0", floor: "#6a7078", trim: "#3a3a3a", window: "city-day" },
      castSide: "right",
      props: [
        { kind: "desk", x: 40, y: 60, name: "Payroll desk" },
        { kind: "laptop", x: 36, y: 56, name: "Payroll laptop" },
        { kind: "cabinet", x: 14, y: 50, name: "Staff files" },
        { kind: "card", x: 58, y: 80, name: "ATM cards" },
        { kind: "paper", x: 26, y: 84, name: "Verification sheet" },
        { kind: "clock", x: 66, y: 56 },
        { kind: "chair", x: 46, y: 70 },
      ],
    },
    clues: [
      { id: "laptop", name: "Payroll laptop", icon: Laptop, x: 36, y: 56, description: "The payroll officer's laptop.", action: "Check the accounts", finding: "179 'workers' are paid into just 7 bank accounts. Three of the accounts belong to the payroll officer's relatives.", suspectId: "ocholi" },
      { id: "cards", name: "ATM cards", icon: CreditCard, x: 58, y: 80, description: "A rubber-banded stack of ATM cards in the desk drawer.", action: "Check the names", finding: "Forty-two ATM cards in other people's names, with PINs written on tape on the back. Several of the 'workers' died years ago.", suspectId: "ocholi" },
      { id: "files", name: "Staff files", icon: ClipboardList, x: 14, y: 50, description: "The cabinet of staff files.", action: "Check the photos", finding: "Many files reuse the same three passport photos with different names. The files were 'updated' by the payroll officer.", suspectId: "ocholi" },
      { id: "sheet", name: "Verification sheet", icon: ScrollText, x: 26, y: 84, description: "The head-count sheet.", action: "Dust it", lab: { kind: "prints", shape: "finger" }, finding: "Prints of the director, who signed '240 present' last year without counting. Lazy, but the money never went to her.", suspectId: "director" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "ocholi", name: "Ocholi Abah", role: "Payroll officer", face: face("#5C3A1E", "#1d2f5a", "short", "glasses", "smile"), motive: "Paid 179 ghosts into accounts he controls.", alibi: "Says the missing staff are on field work.", background: "Runs the office payroll alone.", quote: "Field work! They are all in the villages working!", statements: [
        { id: "och-1", text: "Every worker on the payroll is a real person.", lie: { clueId: "cards", reveal: "Some are... late. Their families still need the money." } },
        { id: "och-2", text: "I don't know where their salaries go.", lie: { clueId: "laptop", reveal: "Some accounts are my family's. They help me collect." } },
      ] },
      { id: "director", name: "Mrs. Ene Idakwo", role: "Office director", face: face("#8D5524", "#7a1f6a", "bun", "glasses", "flat"), motive: "Signed false head counts.", alibi: "Says she trusted the payroll officer.", background: "Director for two years.", quote: "I signed what I was given. That was my mistake.", statements: [
        { id: "ene-1", text: "Ocholi always brought the head count already filled in.", press: "He said counting would 'disturb the workers'." },
      ] },
      { id: "ghost", name: "Mr. Salifu Onu", role: "A real 'field worker'", face: face("#4a2c17", "#3a8a4a", "buzz", "cap", "worried"), motive: "One of the names on the list.", alibi: "Retired four years ago.", background: "Found his name still on the payroll.", quote: "I retired in 2021. Who is collecting my salary?", statements: [
        { id: "sal-1", text: "Ocholi asked for my old ATM card 'to close the account'.", press: "That was four years ago. He never returned it." },
      ] },
    ],
    culpritId: "ocholi",
    solution:
      "Payroll officer Ocholi Abah kept 179 retired, dead and invented workers on the payroll and paid their salaries into seven accounts he controlled, using a drawer full of their ATM cards. The payroll laptop, the cards and the reused photos proved it.",
  },

  /* ================================================================ NASARAWA */
  {
    id: "nas-lithium",
    tier: 84,
    title: "Lithium Lorries of Nasarawa",
    hook: "Lorries marked 'GRANITE' leave a mining site every night. The site has a permit for granite only.",
    region: at("Nasarawa", "Mining site near Lafia"),
    inspiredBy: "Reports of lithium ore being mined and smuggled out of Nasarawa without permits.",
    categories: ["heists"],
    tags: ["Nasarawa", "Lithium", "Illegal mining"],
    bounty: 520_000,
    inspecting: 23600,
    lead: { name: "Insp. Abdullahi Doma", face: face("#5C3A1E", "#3a5a3a", "short", "cap", "flat") },
    victim: "The state (₦900M of unpermitted lithium ore)",
    briefing:
      "A granite quarry near Lafia sends out lorries every night. A geologist tested dust from a lorry tyre and found lithium ore, which needs a special federal permit. The site manager says it's 'just granite'.",
    kit: {
      backdrop: { kind: "outdoor", sky: "dusk", ground: "dirt", horizon: "hills" },
      castSide: "left",
      props: [
        { kind: "hole", x: 50, y: 56, name: "Mine pit" },
        { kind: "sack", x: 66, y: 62, name: "Ore sacks" },
        { kind: "tanker", x: 80, y: 48, label: "GRANITE", name: "Lorry" },
        { kind: "paper", x: 30, y: 82, name: "Permit" },
        { kind: "hardhat", x: 44, y: 74, name: "Hard hat" },
        { kind: "phone", x: 58, y: 84, name: "Manager's phone" },
        { kind: "boulder", x: 20, y: 50 },
      ],
    },
    clues: [
      { id: "ore", name: "Ore sacks", icon: Gem, x: 66, y: 62, description: "Sacks waiting to be loaded.", action: "Test the rock", finding: "Pale, glittering lepidolite: lithium ore, not granite. Each sack is worth more than a lorry of granite.", suspectId: "ishaku" },
      { id: "permit", name: "Permit", icon: ScrollText, x: 30, y: 82, description: "The permit pinned in the site office.", action: "Check it", finding: "A real permit, for granite only. A second 'lithium permit' in the same folder has a misspelt ministry name and a stamp printed in colour.", suspectId: "ishaku" },
      { id: "phone", name: "Manager's phone", icon: Smartphone, x: 58, y: 84, description: "The site manager's phone.", action: "Read the messages", finding: "To a buyer: 'Mark it granite. Lorries leave after 10 p.m. Cash on loading.'", suspectId: "ishaku" },
      { id: "hat", name: "Hard hat", icon: KeyRound, x: 44, y: 74, description: "A worker's hard hat at the pit edge.", action: "Ask the workers", finding: "Workers are paid ₦3,000 a day to dig 'the white stones' separately. They say the foreman, Bitrus, sorts them and the manager does the selling.", suspectId: "bitrus" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "ishaku", name: "Ishaku Agyo", role: "Site manager", face: face("#4a2c17", "#e8e0d0", "short", "shades", "smirk"), motive: "Sells lithium ore as 'granite'.", alibi: "Says he only ships granite.", background: "Ran quarries in three states.", quote: "Stone is stone. Granite, granite, granite.", statements: [
        { id: "ish-1", text: "We only mine granite here.", lie: { clueId: "ore", reveal: "There is a little lithium mixed in. We separate it. For safety." } },
        { id: "ish-2", text: "We have a lithium permit.", lie: { clueId: "permit", reveal: "That permit is... being processed." } },
      ] },
      { id: "bitrus", name: "Bitrus Akwanga", role: "Site foreman", face: face("#5C3A1E", "#f5c518", "buzz", "cap", "worried"), motive: "Sorts the white stones.", alibi: "On site every day.", background: "Knows rock by its colour.", quote: "Oga says sort, I sort.", statements: [
        { id: "bit-1", text: "Ishaku told me the white stones were 'export granite'.", press: "Export granite. Ha. I know lithium when I see it, but I need the job." },
      ] },
      { id: "buyer", name: "Mr. Feng", role: "Ore buyer", face: face("#e8c8a0", "#1d1f22", "slick", "glasses", "flat"), motive: "Buys the ore.", alibi: "In Abuja.", background: "Buys minerals for export.", quote: "I bought granite, according to the papers.", statements: [
        { id: "fen-1", text: "The papers said granite, but the price was for lithium.", press: "Nobody pays lithium prices for granite. Everybody knew." },
      ] },
    ],
    culpritId: "ishaku",
    solution:
      "Site manager Ishaku Agyo mined lithium ore under a granite-only permit, forged a 'lithium permit', and sent the ore out at night in lorries marked GRANITE. The ore test, the fake permit and his messages proved it.",
  },

  /* ================================================================ NIGER */
  {
    id: "ngr-ponzi",
    tier: 85,
    title: "Double Your Money in Minna",
    hook: "A 'profit hub' doubles people's money in 30 days, until it says armed robbers took ₦600M.",
    region: at("Niger", "Profit hub office, Minna", "sahel"),
    inspiredBy: "The many Ponzi schemes that collapsed across Nigeria, MMM-style.",
    categories: ["cyber"],
    tags: ["Niger", "Ponzi", "Minna"],
    bounty: 500_000,
    inspecting: 30400,
    lead: { name: "Insp. Hadiza Bida", face: face("#6b4226", "#1d6a3a", "bun", "gele", "flat", "#1d6a3a") },
    victim: "4,000 investors (₦600M)",
    briefing:
      "For months, 'Profit Hub' paid old investors with new investors' money. Then the founder said armed robbers raided the office and took ₦600M in cash. The office door isn't even scratched.",
    kit: {
      backdrop: { kind: "indoor", decor: "shop", wall: "#e8e0c8", floor: "#7a7a72", trim: "#c9a34a", window: "city-day" },
      castSide: "right",
      props: [
        { kind: "sign", x: 50, y: 16, label: "PROFIT HUB: DOUBLE IN 30 DAYS", color: "#f5c518" },
        { kind: "safe", x: 18, y: 54, name: "Office safe" },
        { kind: "desk", x: 50, y: 62, name: "Founder's desk" },
        { kind: "laptop", x: 46, y: 58, name: "Investor laptop" },
        { kind: "door", x: 78, y: 48, color: "#5a3a1a", name: "Office door" },
        { kind: "paper", x: 34, y: 84, name: "Flight booking" },
        { kind: "chair", x: 54, y: 70 },
      ],
    },
    clues: [
      { id: "door", name: "Office door", icon: KeyRound, x: 78, y: 48, description: "The door the 'robbers' came through.", action: "Examine the lock", finding: "Not forced, not scratched. Opened with a key, and only the founder holds a key.", suspectId: "zakari" },
      { id: "laptop", name: "Investor laptop", icon: Laptop, x: 46, y: 58, description: "The laptop with the investor list.", action: "Follow the money", finding: "Every 'payout' was paid from new deposits. In the last two weeks, ₦600M moved to three accounts abroad, days before the 'robbery'.", suspectId: "zakari" },
      { id: "booking", name: "Flight booking", icon: Receipt, x: 34, y: 84, description: "Torn printout in the bin.", action: "Rebuild it", lab: { kind: "torn", style: "ledger", title: "E-TICKET", lines: ["Passenger: Z. Lapai", "Abuja - Dubai", "One way", "Booked: 10 days ago", "Flight: Sunday 23:55", "'Robbery': Saturday", "Seat 2A"] }, finding: "A one-way ticket to Dubai for the founder, booked ten days before the 'robbery', for the night after it.", suspectId: "zakari" },
      { id: "safe", name: "Office safe", icon: Banknote, x: 18, y: 54, description: "The safe, standing open.", action: "Dust the handle", lab: { kind: "prints", shape: "finger" }, finding: "Prints of the cashier, Aminu, who opens it daily. The safe held only ₦2M on the day; the rest had already gone abroad.", suspectId: "aminu" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "zakari", name: "Zakari Lapai", role: "Founder", face: face("#5C3A1E", "#1d1f22", "slick", "shades", "smile"), motive: "Moved ₦600M abroad and faked a robbery.", alibi: "Says robbers held him at gunpoint.", background: "Gives motivational talks on 'financial freedom'.", quote: "They took everything! Even my own money!", statements: [
        { id: "zak-1", text: "Armed robbers broke in and took the cash.", lie: { clueId: "door", reveal: "There was no breaking. But there were robbers. Somewhere." } },
        { id: "zak-2", text: "I am not leaving Nigeria. I will refund everyone.", lie: { clueId: "booking", reveal: "Dubai is for a business meeting. To raise refund money." } },
      ] },
      { id: "aminu", name: "Aminu Kontagora", role: "Cashier", face: face("#4a2c17", "#e8e0d0", "buzz", "cap", "worried"), motive: "Handled the cash.", alibi: "Off work on the 'robbery' day.", background: "Was paid in 'investment units'.", quote: "I opened the safe every day. It was nearly empty for weeks.", statements: [
        { id: "ami-1", text: "Oga took the big money to the bank himself, two weeks ago.", press: "He said the bank was 'international'." },
      ] },
      { id: "investor", name: "Hajiya Saratu", role: "Investor", face: face("#8D5524", "#c0182b", "bun", "gele", "worried", "#c0182b"), motive: "Lost ₦8M.", alibi: "At home.", background: "Brought 30 friends into the scheme.", quote: "I brought my church members! What will I tell them?", statements: [
        { id: "sar-1", text: "Zakari told big investors to 'withdraw before the weekend'.", press: "Only five of us. He winked when he said it." },
      ] },
    ],
    culpritId: "zakari",
    solution:
      "Founder Zakari Lapai ran a Ponzi scheme, moved ₦600M abroad, booked a one-way flight to Dubai, and then claimed armed robbers had taken the cash. The unforced door, the money trail and the ticket proved it.",
  },

  /* ================================================================ PLATEAU */
  {
    id: "pla-potato",
    tier: 86,
    title: "The Irish Potato Cartel",
    hook: "Jos potato prices triple overnight because of a 'blight'. The cold store is full of perfectly good potatoes.",
    region: at("Plateau", "Farmers' market, Jos"),
    inspiredBy: "Reports of traders hoarding food to push up prices.",
    categories: ["alley"],
    tags: ["Plateau", "Irish potato", "Hoarding"],
    bounty: 340_000,
    inspecting: 18200,
    lead: { name: "Insp. Nanle Dakwak", face: face("#6b4226", "#3a5a8a", "short", "cap", "smile") },
    victim: "Jos buyers and small traders",
    briefing:
      "The traders' union announced that a blight had wiped out the Irish potato harvest. Prices tripled. A cold-store worker says the union's store is packed to the roof.",
    kit: {
      backdrop: { kind: "outdoor", sky: "dawn", ground: "dirt", horizon: "hills" },
      castSide: "left",
      props: [
        { kind: "sign", x: 50, y: 14, label: "JOS POTATO MARKET", color: "#3a8a4a" },
        { kind: "sack", x: 40, y: 58, name: "Potato sack" },
        { kind: "stall", x: 66, y: 54, name: "Union stall" },
        { kind: "generator", x: 84, y: 68, name: "Cold-store generator" },
        { kind: "paper", x: 30, y: 82, name: "Union notice" },
        { kind: "phone", x: 64, y: 58, name: "Chairman's phone" },
        { kind: "barrow", x: 52, y: 78 },
      ],
    },
    clues: [
      { id: "sack", name: "Potato sack", icon: Wheat, x: 40, y: 58, description: "A sack from the union's cold store.", action: "Check the potatoes", finding: "Firm, clean potatoes. No blight at all. The sack is tagged 'UNION STORE - HOLD'.", suspectId: "dachung" },
      { id: "notice", name: "Union notice", icon: ScrollText, x: 30, y: 82, description: "The torn 'blight' notice.", action: "Rebuild the notice", lab: { kind: "torn", style: "ledger", title: "UNION NOTICE", lines: ["Blight! No harvest", "New price: N90,000/bag", "Members only to sell", "Store: HOLD till Jan", "Release: 50 bags/week", "Chairman's order", "D. Pam"] }, finding: "The 'blight' notice orders members to hold stock and release only 50 bags a week until January, on the chairman's order.", suspectId: "dachung" },
      { id: "generator", name: "Cold-store generator", icon: Receipt, x: 84, y: 68, description: "The generator that runs the cold store.", action: "Check the fuel log", finding: "It has run day and night for six weeks, keeping 4,000 bags cold. The diesel was paid for by the chairman.", suspectId: "dachung" },
      { id: "phone", name: "Chairman's phone", icon: Smartphone, x: 64, y: 58, description: "The union chairman's phone.", action: "Read the group chat", finding: "'Say blight. Keep the store locked. By December we chop big.' Sent to the union executives' group.", suspectId: "dachung" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "dachung", name: "Dachung Pam", role: "Union chairman", face: face("#5C3A1E", "#e8e0d0", "short", "cap", "smirk"), motive: "Hoarded 4,000 bags to triple the price.", alibi: "Says the blight is real.", background: "Chairman of the potato traders' union.", quote: "Blight is God's work. Not mine.", statements: [
        { id: "dac-1", text: "The blight destroyed the harvest.", lie: { clueId: "sack", reveal: "Some farms were spared. A few." } },
        { id: "dac-2", text: "The union has no stock to release.", lie: { clueId: "generator", reveal: "That store is for seed potatoes. Seeds." } },
      ] },
      { id: "farmer", name: "Mama Kaneng", role: "Farmer", face: face("#8D5524", "#3a8a4a", "bun", "gele", "worried", "#3a8a4a"), motive: "Sold her harvest cheap to the union.", alibi: "On her farm in Bokkos.", background: "Grows potatoes on two hectares.", quote: "My harvest was the best in years! What blight?", statements: [
        { id: "kan-1", text: "The union bought my whole harvest at harvest price, then said blight.", press: "They paid ₦30,000 a bag. Now they sell at ₦90,000." },
      ] },
      { id: "worker", name: "Gyang Davou", role: "Cold-store worker", face: face("#4a2c17", "#1d4a8a", "buzz", "cap", "flat"), motive: "Talked to the police.", alibi: "Works the night shift.", background: "Loads the cold store.", quote: "The store is so full we can't close the door.", statements: [
        { id: "gya-1", text: "We are told to say the store is empty if anyone asks.", press: "Chairman's order. He says it's 'union business'." },
      ] },
    ],
    culpritId: "dachung",
    solution:
      "Union chairman Dachung Pam bought the harvest cheap, locked 4,000 bags in a cold store and announced a fake blight to triple prices. The healthy potatoes, the union notice and his own group chat proved it.",
  },

  /* ================================================================ ADAMAWA */
  {
    id: "ada-notes",
    tier: 87,
    title: "Fake Notes at the Yola Cattle Market",
    hook: "Herders sell twenty animals and go home with bundles of fake ₦1,000 notes.",
    region: at("Adamawa", "Cattle market, Yola", "sahel"),
    inspiredBy: "Reports of counterfeit naira notes passed at busy rural markets.",
    categories: ["alley"],
    tags: ["Adamawa", "Counterfeit", "Cattle market"],
    bounty: 380_000,
    inspecting: 16500,
    lead: { name: "Insp. Ahmadu Girei", face: face("#5C3A1E", "#f2f2e8", "short", "fila", "flat", "#3a5a8a") },
    victim: "Five herders (₦14M of livestock)",
    briefing:
      "On market day, a smooth-talking middleman bought twenty animals for cash. The bundles had real notes on the outside and fakes inside. The middleman says a buyer from Mubi paid him in fakes too.",
    kit: {
      backdrop: { kind: "outdoor", sky: "day", ground: "dirt", horizon: "savanna" },
      castSide: "right",
      props: [
        { kind: "goat", x: 34, y: 58, name: "Livestock" },
        { kind: "goat", x: 46, y: 62 },
        { kind: "stake", x: 40, y: 56 },
        { kind: "paper", x: 56, y: 82, name: "Note bundle" },
        { kind: "phone", x: 66, y: 64, name: "Middleman's phone" },
        { kind: "umbrella", x: 70, y: 52, color: "#c0182b", name: "Middleman's umbrella" },
        { kind: "okada", x: 20, y: 66 },
      ],
    },
    clues: [
      { id: "bundle", name: "Note bundle", icon: Banknote, x: 56, y: 82, description: "A bundle of ₦1,000 notes.", action: "Test the notes", finding: "Real notes on the outside, fakes inside: wrong paper, no watermark, and the same serial number printed again and again.", suspectId: "babangida" },
      { id: "phone", name: "Middleman's phone", icon: Smartphone, x: 66, y: 64, description: "The middleman's phone.", action: "Read the messages", finding: "'20 bundles ready, real ones outside.' From a printer in Jimeta, three days before market day. No buyer from Mubi anywhere.", suspectId: "babangida" },
      { id: "umbrella", name: "Middleman's umbrella", icon: Package, x: 70, y: 52, description: "A bag under the middleman's umbrella.", action: "Search the bag", finding: "More bundles, still wrapped in paper from a Jimeta print shop, and a list of herders who 'don't count'.", suspectId: "babangida" },
      { id: "goat", name: "Livestock", icon: Footprints, x: 34, y: 58, description: "Animals from the sale.", action: "Trace where they went", finding: "Loaded onto a lorry that left within an hour, paid for by the middleman. The driver, Jamilu, says he was paid in real notes.", suspectId: "jamilu" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "babangida", name: "Babangida Song", role: "Middleman", face: face("#4a2c17", "#1d6a3a", "short", "cap", "smile"), motive: "Bought twenty animals with fake notes.", alibi: "Says a Mubi buyer paid him in fakes.", background: "Known at the market as 'Oga Deal'.", quote: "I am a victim like them! The Mubi man cheated me!", statements: [
        { id: "bab-1", text: "A buyer from Mubi paid me with those notes.", lie: { clueId: "phone", reveal: "There was no Mubi buyer. I had the notes made." } },
        { id: "bab-2", text: "I didn't know the money was fake.", lie: { clueId: "umbrella", reveal: "I knew. Everybody uses real ones outside." } },
      ] },
      { id: "jamilu", name: "Jamilu Hong", role: "Lorry driver", face: face("#5C3A1E", "#e8e0d0", "buzz", "cap", "flat"), motive: "Carried the animals away fast.", alibi: "Has the trip receipt.", background: "Drives livestock to Lagos.", quote: "My money was real. I checked it twice.", statements: [
        { id: "jam-1", text: "Babangida paid me from a different bag: the real-money bag.", press: "He had two bags. Blue for me, black for the herders." },
      ] },
      { id: "herder", name: "Ardo Buba", role: "Herder", face: face("#6b4226", "#f2f2e8", "short", "fila", "worried", "#c0182b"), motive: "Lost six animals.", alibi: "At the market all day.", background: "Has traded at Yola market for thirty years.", quote: "I counted the top notes. Who counts every note in a hot market?", statements: [
        { id: "ard-1", text: "He insisted on paying fast, before the evening prayers.", press: "He said the bank was closed tomorrow, so hurry." },
      ] },
    ],
    culpritId: "babangida",
    solution:
      "Middleman Babangida Song had fake ₦1,000 notes printed in Jimeta, wrapped them inside real ones, and paid herders in a rush on market day before shipping the animals off. His messages with the printer and the bag of spare bundles proved it.",
  },

  /* ================================================================ TARABA */
  {
    id: "tar-yam",
    tier: 88,
    title: "The Spirits of the Wukari Yam Barn",
    hook: "A farmer's yam barn empties a little every night. His nephew says the village spirits are hungry.",
    region: at("Taraba", "Yam farm near Wukari"),
    inspiredBy: "Village tales of 'spirits' blamed for missing harvests.",
    categories: ["alley"],
    tags: ["Taraba", "Yams", "Village"],
    bounty: 300_000,
    inspecting: 13900,
    lead: { name: "Insp. Shinku Agbu", face: face("#5C3A1E", "#7a1f2a", "short", "cap", "smile") },
    victim: "Mr. Adi Ashu (900 tubers of yam)",
    briefing:
      "Pa Adi's yam barn has lost 900 tubers in three weeks, always at night. His nephew, who sleeps by the barn, says the spirits of the forest are taking them. The night market in Wukari is suddenly full of very big yams.",
    kit: {
      backdrop: { kind: "outdoor", sky: "dusk", ground: "dirt", horizon: "savanna" },
      castSide: "left",
      props: [
        { kind: "hut", x: 70, y: 46, name: "Yam barn" },
        { kind: "sack", x: 50, y: 60, name: "Yam heap" },
        { kind: "barrow", x: 36, y: 66, name: "Wheelbarrow" },
        { kind: "footprints", x: 56, y: 80, name: "Footprints" },
        { kind: "lantern", x: 82, y: 64, name: "Nephew's lantern" },
        { kind: "drum", x: 28, y: 56, name: "Talking drum" },
        { kind: "paper", x: 40, y: 86, name: "Market list" },
      ],
    },
    clues: [
      { id: "prints", name: "Footprints", icon: Footprints, x: 56, y: 80, description: "Prints from the barn towards the road.", action: "Cast a print", lab: { kind: "prints", shape: "boot" }, finding: "Rubber slippers with a cut strap, the nephew's slippers, going to the road with a heavy load and coming back light.", suspectId: "terhemba" },
      { id: "barrow", name: "Wheelbarrow", icon: Truck, x: 36, y: 66, description: "The farm wheelbarrow.", action: "Check the wheel", finding: "Fresh mud from the Wukari road, and the tyre is worn from long night trips. Spirits don't need wheelbarrows.", suspectId: "terhemba" },
      { id: "list", name: "Market list", icon: ScrollText, x: 40, y: 86, description: "A torn list found by the barn.", action: "Rebuild the list", lab: { kind: "torn", style: "ledger", title: "NIGHT MARKET", lines: ["Mon: 60 tubers", "Wed: 80 tubers", "Fri: 100 big ones", "Buyer: Mama Wase", "Price: N2,500 each", "Tell uncle: spirits", "T."] }, finding: "A sales list for the night market, buyer 'Mama Wase', and a reminder: 'tell uncle: spirits'. Signed 'T.'", suspectId: "terhemba" },
      { id: "drum", name: "Talking drum", icon: Package, x: 28, y: 56, description: "The village drum by the barn.", action: "Ask the drummer", finding: "The drummer says the 'spirit drums' heard at night were the nephew practising to scare the village away from the barn.", suspectId: "terhemba" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "terhemba", name: "Terhemba Ashu", role: "Nephew", face: face("#4a2c17", "#c0182b", "buzz", "cap", "smirk"), motive: "Sells his uncle's yams at the night market.", alibi: "Says he guards the barn all night.", background: "Wants to buy an okada.", quote: "Uncle, the spirits are angry! You must sacrifice a goat!", statements: [
        { id: "ter-1", text: "I never left the barn at night.", lie: { clueId: "prints", reveal: "Only to... chase the spirits. Towards the road." } },
        { id: "ter-2", text: "The spirits take the yams. I hear their drums.", lie: { clueId: "list", reveal: "Okay. I am the spirit. I wanted an okada." } },
      ] },
      { id: "wase", name: "Mama Wase", role: "Night-market trader", face: face("#8D5524", "#e07a2a", "bun", "gele", "flat", "#e07a2a"), motive: "Buys the yams.", alibi: "At her stall.", background: "Sells yams in Wukari.", quote: "The boy said his uncle sent him to sell.", statements: [
        { id: "was-1", text: "He always came after midnight with a wheelbarrow.", press: "I asked why so late. He said 'yams are fresh at night'." },
      ] },
      { id: "pa", name: "Pa Adi Ashu", role: "Farmer", face: face("#5C3A1E", "#3a5a3a", "bald", undefined, "worried"), motive: "Lost his harvest.", alibi: "Asleep in the village.", background: "Has farmed yams for fifty years.", quote: "Spirits have never stolen from me in fifty years.", statements: [
        { id: "pad-1", text: "My nephew asked me for money for an okada last month. I said no.", press: "He was very angry. The yams started vanishing the next week." },
      ] },
    ],
    culpritId: "terhemba",
    solution:
      "Nephew Terhemba Ashu wheeled his uncle's yams to the Wukari night market after midnight, drummed at night to scare people away, and blamed hungry spirits. His slipper prints, the muddy wheelbarrow and his own sales list proved it.",
  },
];
