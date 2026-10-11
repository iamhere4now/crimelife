import { BookOpen, Cctv, ClipboardList, Droplets, Flame, Footprints, Fuel, KeyRound, Laptop, Package, Pill, Receipt, ScrollText, Shirt, Ship, Smartphone, Ticket, Trash2, Wheat } from "lucide-react";
import type { CrimeCase, Face, MusicStyle } from "../types";

/**
 * One case for each southern state without a city of its own, inspired by
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
const at = (state: string, place: string, music: MusicStyle) => ({ state, place, music });

export const STATE_CASES_SOUTH: CrimeCase[] = [
  /* ================================================================ ANAMBRA */
  {
    id: "ana-drugs",
    tier: 89,
    title: "Bridgehead Fake Drugs",
    hook: "Malaria tablets from Onitsha's drug market don't work. Lab tests find chalk and food colouring.",
    region: at("Anambra", "Bridgehead drug market, Onitsha", "highlife"),
    inspiredBy: "Repeated raids on fake and expired drugs in big Nigerian drug markets.",
    categories: ["alley"],
    tags: ["Anambra", "Onitsha", "Fake drugs"],
    bounty: 480_000,
    inspecting: 29100,
    lead: { name: "Insp. Chiamaka Obi", face: face("#6b4226", "#1d4a8a", "bun", "glasses", "flat") },
    victim: "Patients across the South-East",
    briefing:
      "Clinics in three states reported malaria tablets that did nothing. Every pack traces back to one wholesaler at Bridgehead market. The wholesaler says he buys sealed cartons from an importer.",
    kit: {
      backdrop: { kind: "indoor", decor: "shop", wall: "#dfe8e0", floor: "#8a949c", trim: "#1d6a3a", window: "none" },
      castSide: "left",
      props: [
        { kind: "sign", x: 50, y: 16, label: "EBUKA PHARMA WHOLESALE", color: "#1d6a3a" },
        { kind: "counter", x: 48, y: 60, name: "Counter" },
        { kind: "crate", x: 74, y: 64, label: "PHARMA", name: "Carton" },
        { kind: "cabinet", x: 86, y: 48, name: "Shelf" },
        { kind: "paper", x: 30, y: 82, name: "Label printout" },
        { kind: "phone", x: 46, y: 56, name: "Wholesaler's phone" },
        { kind: "cctv", x: 14, y: 18, name: "Shop camera" },
      ],
    },
    clues: [
      { id: "carton", name: "Carton", icon: Pill, x: 74, y: 64, description: "A sealed carton of malaria tablets.", action: "Test the tablets", finding: "Chalk, starch and yellow food colouring. No medicine at all. The 'seal' was re-glued by hand.", suspectId: "ebuka" },
      { id: "labels", name: "Label printout", icon: ScrollText, x: 30, y: 82, description: "Torn sheets of pack labels.", action: "Rebuild the sheet", lab: { kind: "torn", style: "ledger", title: "PRINT JOB", lines: ["Malaria tabs labels", "Batch: copy of real", "Expiry: +3 years", "Qty: 20,000", "Printer: Upper Iweka", "Paid: E. Okonkwo", "Cash"] }, finding: "A print job for 20,000 copies of a real brand's labels with a later expiry date, paid for in cash by Ebuka Okonkwo.", suspectId: "ebuka" },
      { id: "phone", name: "Wholesaler's phone", icon: Smartphone, x: 46, y: 56, description: "The wholesaler's phone on the counter.", action: "Read the messages", finding: "To a tablet press in Nkpor: 'Same colour as last time. Chalk is fine, they won't know.'", suspectId: "ebuka" },
      { id: "camera", name: "Shop camera", icon: Cctv, x: 14, y: 18, description: "The shop's own camera.", action: "Play last month", finding: "Night after night, the shop boy re-sealing cartons under the wholesaler's eye. The 'importer' never appears.", suspectId: "chidi" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "ebuka", name: "Ebuka Okonkwo", role: "Wholesaler", face: face("#5C3A1E", "#1d1f22", "slick", "shades", "smile"), motive: "Pressed chalk tablets and sold them as a real brand.", alibi: "Says an importer supplies sealed cartons.", background: "Biggest wholesaler on his row.", quote: "I buy sealed from the importer! I'm a victim!", statements: [
        { id: "ebu-1", text: "I only sell sealed cartons from an importer.", lie: { clueId: "camera", reveal: "We... repack some cartons. For neatness." } },
        { id: "ebu-2", text: "I have never printed labels.", lie: { clueId: "labels", reveal: "Labels tear on the way. I replace them." } },
      ] },
      { id: "chidi", name: "Chidi", role: "Shop boy", face: face("#4a2c17", "#e8e0d0", "buzz", "cap", "worried"), motive: "Re-sealed the cartons.", alibi: "Works in the shop day and night.", background: "Sixteen, learning the trade.", quote: "Oga said it was 'repacking'.", statements: [
        { id: "chi-1", text: "The tablets come in sacks, not cartons. We put them in boxes at night.", press: "From Nkpor, in a bus. Oga pays cash." },
      ] },
      { id: "nurse", name: "Nurse Adaeze", role: "Clinic nurse", face: face("#8D5524", "#f2f5f7", "bun", "glasses", "worried"), motive: "Reported the fakes.", alibi: "At her clinic.", background: "Treats children in Nnewi.", quote: "Five children didn't get better. I tested the tablets myself.", statements: [
        { id: "ada-1", text: "Ebuka's prices were half of everybody else's.", press: "That alone should have warned us." },
      ] },
    ],
    culpritId: "ebuka",
    solution:
      "Wholesaler Ebuka Okonkwo had chalk tablets pressed in Nkpor, printed copies of a real brand's labels, and had his shop boy re-seal them into cartons at night. The test, the print job and his shop camera proved it.",
  },

  /* ================================================================ IMO */
  {
    id: "imo-mace",
    tier: 90,
    title: "The Missing Mace of Owerri",
    hook: "The House of Assembly's mace vanishes during a rowdy sitting, and the sitting can't go on without it.",
    region: at("Imo", "House of Assembly, Owerri", "highlife"),
    inspiredBy: "Real incidents of legislative maces being snatched during sittings in Nigeria.",
    categories: ["vip"],
    tags: ["Imo", "Owerri", "Mace"],
    bounty: 560_000,
    inspecting: 36700,
    lead: { name: "Insp. Kelechi Nwosu", face: face("#5C3A1E", "#1d2f5a", "short", "glasses", "flat") },
    victim: "The Imo House of Assembly",
    briefing:
      "During a noisy sitting, the lights went out for two minutes. When they came back on, the mace was gone from its stand. Without it the House can't sit, and a key vote has been delayed.",
    kit: {
      backdrop: { kind: "indoor", decor: "luxury", wall: "#e8e0d0", floor: "#6a3a2a", trim: "#c9a34a", window: "none" },
      castSide: "left",
      props: [
        { kind: "pedestal", x: 50, y: 56, name: "Mace stand" },
        { kind: "throne", x: 50, y: 44, name: "Speaker's chair" },
        { kind: "panel", x: 84, y: 34, name: "Light switch panel" },
        { kind: "cctv", x: 14, y: 18, name: "Chamber camera" },
        { kind: "bin", x: 74, y: 74, s: 0.55, name: "Corridor bin" },
        { kind: "paper", x: 30, y: 82, name: "Order paper" },
        { kind: "rug", x: 50, y: 76, color: "#1d4a2a" },
      ],
    },
    clues: [
      { id: "panel", name: "Light switch panel", icon: KeyRound, x: 84, y: 34, description: "The panel that controls the chamber lights.", action: "Dust the switch", lab: { kind: "prints", shape: "finger" }, finding: "Prints of the clerk's assistant, Uche, who had no reason to touch the panel during a sitting.", suspectId: "uche" },
      { id: "camera", name: "Chamber camera", icon: Cctv, x: 14, y: 18, description: "The chamber camera, which has night vision.", action: "Play the blackout", finding: "In the dark, a figure in a staff jacket lifts the mace and walks out of the side door. The jacket says 'CLERK'S OFFICE'.", suspectId: "uche" },
      { id: "bin", name: "Corridor bin", icon: Trash2, x: 74, y: 74, description: "A large bin by the side door.", action: "Search it", finding: "The mace, wrapped in a wedding-souvenir bag, under some paper. Whoever took it planned to collect it later.", suspectId: "uche" },
      { id: "order", name: "Order paper", icon: ScrollText, x: 30, y: 82, description: "Torn notes from the order paper.", action: "Rebuild the notes", lab: { kind: "torn", style: "ledger", title: "SIDE NOTE", lines: ["Vote at 11:00", "Lights off at 10:55", "Side door, corridor bin", "Collect after 6 p.m.", "N2m when done", "From: 'Honourable'", "To: U."] }, finding: "A note to 'U.' promising ₦2M to switch off the lights, take the mace to the corridor bin and collect it after 6 p.m., from someone signing as 'Honourable'.", suspectId: "uche" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "uche", name: "Uche Iwuala", role: "Clerk's assistant", face: face("#4a2c17", "#1d2f5a", "buzz", undefined, "worried"), motive: "Paid ₦2M to stop the vote.", alibi: "Says he was at the clerk's table the whole time.", background: "Has worked in the chamber for three years.", quote: "I was at my table! I didn't even see the mace move!", statements: [
        { id: "uch-1", text: "I never left the clerk's table.", lie: { clueId: "camera", reveal: "I went out for one minute. Just one." } },
        { id: "uch-2", text: "I didn't touch the light panel.", lie: { clueId: "panel", reveal: "Somebody told me there was a fault. I checked it." } },
      ] },
      { id: "sergeant", name: "Sgt.-at-Arms Okafor", role: "Sergeant-at-arms", face: face("#5C3A1E", "#1d1f22", "short", "cap", "flat"), motive: "Guards the mace.", alibi: "At the main door.", background: "Proud of never losing the mace in ten years.", quote: "Ten years! Ten years and nobody touched that mace!", statements: [
        { id: "ser-1", text: "During the blackout, the side door opened. I heard it.", press: "Only staff have side-door keys. I told them that door should be locked." },
      ] },
      { id: "member", name: "Hon. Chinedu Mbano", role: "Member", face: face("#6b4226", "#7a1f2a", "short", "fila", "smirk", "#c0182b"), motive: "Opposed the vote.", alibi: "On the floor, shouting, on camera.", background: "Loud and proud of it.", quote: "I shout, yes. But I don't steal maces.", statements: [
        { id: "chi-1", text: "Somebody wanted that vote stopped more than I did.", press: "Ask who sends notes to staff. I only shout in public." },
      ] },
    ],
    culpritId: "uche",
    solution:
      "Clerk's assistant Uche Iwuala was paid to stop the vote. He switched off the chamber lights, carried the mace out through the side door and hid it in the corridor bin to collect later. His prints, the night-vision camera and the note proved it.",
  },

  /* ================================================================ DELTA */
  {
    id: "del-pipeline",
    tier: 91,
    title: "The Warri Pipeline Tap",
    hook: "A pipeline loses pressure every night near Warri. Someone has fitted a valve and a hose to it.",
    region: at("Delta", "Pipeline right-of-way near Warri", "rivers"),
    inspiredBy: "Reports of illegal taps on oil pipelines in the Niger Delta.",
    categories: ["heists"],
    tags: ["Delta", "Warri", "Pipeline"],
    bounty: 560_000,
    inspecting: 26800,
    lead: { name: "Insp. Ejiro Okorodudu", face: face("#4a2c17", "#1d6a8a", "short", "cap", "smile") },
    victim: "The pipeline company (₦1.2B of products)",
    briefing:
      "A pipeline near Warri drops pressure every night. Investigators found a professional valve welded on and a long hose to a tanker point. The surveillance contractor says vandals did it.",
    kit: {
      backdrop: { kind: "outdoor", sky: "night", ground: "dirt", horizon: "none" },
      castSide: "left",
      props: [
        { kind: "pipe", x: 50, y: 40, name: "Pipeline" },
        { kind: "coil", x: 44, y: 66, color: "#141414", name: "Hose" },
        { kind: "tanker", x: 74, y: 52, label: "DIESEL", name: "Tanker" },
        { kind: "drum", x: 30, y: 60, name: "Jerrycans" },
        { kind: "lantern", x: 58, y: 74, name: "Lantern" },
        { kind: "paper", x: 26, y: 84, name: "Patrol log" },
        { kind: "footprints", x: 50, y: 82 },
      ],
    },
    clues: [
      { id: "valve", name: "Pipeline", icon: Fuel, x: 50, y: 40, description: "The pipeline with a valve welded onto it.", action: "Examine the weld", finding: "A neat professional weld and a valve rated for high pressure. Not vandals: someone with pipeline training and equipment.", suspectId: "omoniyi" },
      { id: "log", name: "Patrol log", icon: ClipboardList, x: 26, y: 84, description: "The surveillance contractor's patrol log.", action: "Rebuild the torn pages", lab: { kind: "torn", style: "ledger", title: "PATROL LOG", lines: ["Sector 7: 'all clear'", "Every night, 22:00", "Patrol skipped: 23:00-04:00", "'Tanker escort'", "Signed: O. Omoniyi", "Supervisor", "Cash: Friday"] }, finding: "Patrols on this sector were 'skipped' from 23:00 to 04:00 every night for 'tanker escort', signed by supervisor Omoniyi, with 'cash: Friday'.", suspectId: "omoniyi" },
      { id: "tanker", name: "Tanker", icon: Droplets, x: 74, y: 52, description: "A tanker parked at the hose end.", action: "Talk to the driver", finding: "The driver has a loading slip signed by the surveillance supervisor: 'Allowed. Sector 7.'", suspectId: "omoniyi" },
      { id: "cans", name: "Jerrycans", icon: Package, x: 30, y: 60, description: "Jerrycans by the hose.", action: "Ask the villagers", finding: "Local boys fill jerrycans from the leak for ₦500 a can. They say the 'big men' come with the tanker after midnight.", suspectId: "tega" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "omoniyi", name: "Ochuko Omoniyi", role: "Surveillance supervisor", face: face("#4a2c17", "#3a5a3a", "short", "cap", "smirk"), motive: "Paid weekly to let tankers load from the tap.", alibi: "Says his men patrol all night.", background: "Former pipeline welder.", quote: "Vandals! These boys will destroy this country!", statements: [
        { id: "omo-1", text: "My men patrol Sector 7 all night.", lie: { clueId: "log", reveal: "Some nights we escort tankers. It's part of the job." } },
        { id: "omo-2", text: "Village boys did this.", lie: { clueId: "valve", reveal: "Village boys can't weld like that. I know who taught them." } },
      ] },
      { id: "tega", name: "Tega", role: "Village youth", face: face("#4a2c17", "#c0182b", "buzz", "cap", "worried"), motive: "Sells fuel in jerrycans.", alibi: "Says he only collects leaks.", background: "Out of work since the fish died.", quote: "We carry small small. The big men carry tanker.", statements: [
        { id: "teg-1", text: "The supervisor's men drive the tanker in themselves.", press: "In uniform. With torches." },
      ] },
      { id: "driver", name: "Mr. Akpos", role: "Tanker driver", face: face("#5C3A1E", "#e8e0d0", "short", "cap", "flat"), motive: "Loads stolen products.", alibi: "Has a 'permission' slip.", background: "Drives for whoever pays.", quote: "I have paper! The supervisor signed it!", statements: [
        { id: "akp-1", text: "We pay the supervisor ₦2M a week.", press: "Friday, in cash, at the junction." },
      ] },
    ],
    culpritId: "omoniyi",
    solution:
      "Surveillance supervisor Ochuko Omoniyi, a trained welder, fitted the valve, skipped patrols every night and signed 'permission' slips for tankers, taking ₦2M a week. The weld, the patrol log and the driver's slip proved it.",
  },

  /* ================================================================ BAYELSA */
  {
    id: "bay-kpofire",
    tier: 92,
    title: "Kpo-Fire in the Creeks",
    hook: "Black smoke rises over the creeks near Yenagoa every night. Someone is running an illegal refinery.",
    region: at("Bayelsa", "Creeks near Yenagoa", "rivers"),
    inspiredBy: "Reports of illegal 'kpo-fire' refineries in Niger Delta creeks.",
    categories: ["heists"],
    tags: ["Bayelsa", "Kpo-fire", "Creeks"],
    bounty: 520_000,
    inspecting: 22400,
    lead: { name: "Insp. Ebimo Tare", face: face("#4a2c17", "#1d6a8a", "curly", "earring", "smirk") },
    victim: "The creek villages (oil-poisoned water)",
    briefing:
      "Fishermen say their nets come up black and the fish are gone. Every night, smoke rises from a camp deep in the creek. Everyone in the village knows; nobody will say who runs it.",
    kit: {
      backdrop: { kind: "outdoor", sky: "dusk", ground: "sand", horizon: "sea" },
      castSide: "left",
      props: [
        { kind: "furnace", x: 50, y: 52, name: "Still" },
        { kind: "drum", x: 34, y: 60, name: "Oil drums" },
        { kind: "canoe", x: 70, y: 64, label: "no-engine", name: "Supply boat" },
        { kind: "lantern", x: 60, y: 74, name: "Lantern" },
        { kind: "paper", x: 26, y: 84, name: "Delivery list" },
        { kind: "footprints", x: 46, y: 80, name: "Footprints" },
        { kind: "hut", x: 84, y: 44 },
      ],
    },
    clues: [
      { id: "still", name: "Still", icon: Flame, x: 50, y: 52, description: "A crude oil 'pot' still over a fire.", action: "Test the product", finding: "Crude oil boiled into dirty diesel. The crude came from a pipeline tap upriver.", suspectId: "boma" },
      { id: "boat", name: "Supply boat", icon: Ship, x: 70, y: 64, description: "The boat that supplies the camp.", action: "Check the boat", finding: "Oil-stained floor, drums under a tarpaulin, and the boat's licence number registered to Boma Ekeremor.", suspectId: "boma" },
      { id: "list", name: "Delivery list", icon: ScrollText, x: 26, y: 84, description: "A torn list in a plastic bag.", action: "Rebuild the list", lab: { kind: "torn", style: "ledger", title: "CAMP RUNS", lines: ["Mon: 40 drums crude IN", "Wed: 30 drums diesel OUT", "Buyer: filling stations", "Boatman: B.E.", "Camp boys: N5,000/day", "Fish nets: ignore", "Chairman's cut: none"] }, finding: "A record of crude in and diesel out, with the boatman 'B.E.' running both trips, and camp boys paid ₦5,000 a day.", suspectId: "boma" },
      { id: "prints", name: "Footprints", icon: Footprints, x: 46, y: 80, description: "Bare footprints and boot prints in the mud.", action: "Ask the camp boys", finding: "The boys say the boatman owns the camp. The village chief was offered money but refused it.", suspectId: "chief" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "boma", name: "Boma Ekeremor", role: "Boatman", face: face("#4a2c17", "#1d6a8a", "buzz", "cap", "smirk"), motive: "Runs the camp and sells the diesel.", alibi: "Says he only ferries fish.", background: "Knows every creek in the area.", quote: "Me? I carry fish and passengers!", statements: [
        { id: "bom-1", text: "My boat only carries fish.", lie: { clueId: "boat", reveal: "Sometimes drums. People hire me." } },
        { id: "bom-2", text: "I don't know who owns that camp.", lie: { clueId: "list", reveal: "Okay, the camp is mine. But the boys need work!" } },
      ] },
      { id: "chief", name: "Chief Ayibakuro", role: "Village chief", face: face("#5C3A1E", "#e8e0d0", "short", "fila", "flat", "#7a1f2a"), motive: "Knew about the camp.", alibi: "In the village.", background: "Has led the village for twenty years.", quote: "I said no to their money. I didn't have the power to say no to them.", statements: [
        { id: "ayi-1", text: "Boma offered the village ₦1M a month to keep quiet.", press: "I refused. Some youth leaders did not." },
      ] },
      { id: "fisher", name: "Mama Preye", role: "Fisherwoman", face: face("#8D5524", "#e07a2a", "bun", "gele", "worried", "#e07a2a"), motive: "Complained loudly.", alibi: "Fishing at dawn.", background: "Her nets came up black.", quote: "No fish for three months! My children are hungry!", statements: [
        { id: "pre-1", text: "I see Boma's boat go to the camp every Monday at dusk.", press: "Heavy going in, heavy coming out." },
      ] },
    ],
    culpritId: "boma",
    solution:
      "Boatman Boma Ekeremor ran the illegal refinery: he ferried stolen crude in on Mondays, paid camp boys to boil it, and carried diesel out to filling stations on Wednesdays. His boat, the camp's own list and the villagers' accounts proved it.",
  },

  /* ================================================================ AKWA IBOM */
  {
    id: "akw-pension",
    tier: 93,
    title: "The Uyo Pension Shredder",
    hook: "Pensioners queue for months in Uyo. Their files keep 'getting lost', while others collect their pensions.",
    region: at("Akwa Ibom", "Pension office, Uyo", "calabar"),
    inspiredBy: "Reports of pension fraud and pensioners' files going missing.",
    categories: ["cyber"],
    tags: ["Akwa Ibom", "Pensions", "Uyo"],
    bounty: 440_000,
    inspecting: 19900,
    lead: { name: "Insp. Aniekan Udo", face: face("#5C3A1E", "#1d4a8a", "short", "glasses", "flat") },
    victim: "120 pensioners (₦86M)",
    briefing:
      "Retired teachers have been told for months that their files are 'missing'. Yet their pensions are being paid every month into other accounts. A cleaner found a shredder bin full of file covers.",
    kit: {
      backdrop: { kind: "indoor", decor: "office", wall: "#e0e8e8", floor: "#6a7078", trim: "#1d4a8a", window: "city-day" },
      castSide: "right",
      props: [
        { kind: "desk", x: 44, y: 60, name: "Pension desk" },
        { kind: "laptop", x: 40, y: 56, name: "Pension laptop" },
        { kind: "bin", x: 18, y: 66, s: 0.6, label: "SHRED", color: "#3a3a3a", name: "Shredder bin" },
        { kind: "cabinet", x: 80, y: 50, name: "File cabinet" },
        { kind: "paper", x: 56, y: 84, name: "Shredded file" },
        { kind: "bench", x: 70, y: 72, name: "Waiting bench" },
      ],
    },
    clues: [
      { id: "shred", name: "Shredded file", icon: ScrollText, x: 56, y: 84, description: "Strips from the shredder bin.", action: "Rebuild a file", lab: { kind: "torn", style: "ledger", title: "PENSION FILE", lines: ["Name: Mr. E. Etuk", "Retired teacher", "Bank: CHANGED", "New a/c: 'agent'", "Changed by: I. Bassey", "Date: last March", "File: destroy"] }, finding: "A pensioner's file with his bank account 'changed' to an 'agent' account by desk officer Idara Bassey, marked 'destroy'.", suspectId: "idara" },
      { id: "laptop", name: "Pension laptop", icon: Laptop, x: 40, y: 56, description: "The pension desk's laptop.", action: "Check the change log", finding: "120 pensioners' bank details changed to four accounts, all from Idara Bassey's login, mostly after 6 p.m.", suspectId: "idara" },
      { id: "cabinet", name: "File cabinet", icon: ClipboardList, x: 80, y: 50, description: "The cabinet of 'missing' files.", action: "Check the gaps", finding: "Every missing file belongs to a pensioner whose bank details were changed. The other files are all there.", suspectId: "idara" },
      { id: "bench", name: "Waiting bench", icon: Receipt, x: 70, y: 72, description: "Where pensioners wait.", action: "Talk to them", finding: "Pensioners say a 'helper' named Effiong offers to 'speed up files' for ₦20,000. He works for nobody, but he's always inside the office.", suspectId: "effiong" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "idara", name: "Idara Bassey", role: "Pension desk officer", face: face("#8D5524", "#c0182b", "bun", "glasses", "smile"), motive: "Redirected 120 pensions and shredded the files.", alibi: "Says the files were lost in an office move.", background: "Runs the pension desk alone.", quote: "Files get lost. We moved offices last year!", statements: [
        { id: "ida-1", text: "The files were lost during the office move.", lie: { clueId: "shred", reveal: "Some were... destroyed. They were damaged." } },
        { id: "ida-2", text: "I never change bank details.", lie: { clueId: "laptop", reveal: "Pensioners asked me to. Some of them." } },
      ] },
      { id: "effiong", name: "Effiong 'Helper'", role: "Office tout", face: face("#4a2c17", "#e8e0d0", "buzz", "cap", "smirk"), motive: "Charges pensioners to 'help'.", alibi: "Says he helps old people for free.", background: "Always in the office, never on the payroll.", quote: "I help mama and papa. Small tip only.", statements: [
        { id: "eff-1", text: "Idara gives me the list of who to 'help'.", press: "The ones whose files will never come back. I just collect tips." },
      ] },
      { id: "pensioner", name: "Mr. Edet Etuk", role: "Retired teacher", face: face("#5C3A1E", "#3a5a3a", "bald", "glasses", "worried"), motive: "Hasn't been paid in a year.", alibi: "In the queue every Monday.", background: "Taught mathematics for 35 years.", quote: "Thirty-five years of chalk, and my file is 'missing'.", statements: [
        { id: "ede-1", text: "She asked for my BVN 'to update my file'.", press: "Two weeks later my pension stopped coming." },
      ] },
    ],
    culpritId: "idara",
    solution:
      "Pension desk officer Idara Bassey changed 120 pensioners' bank details to four accounts she controlled, then shredded their files and told them the files were lost. The rebuilt file, the change log and the gaps in the cabinet proved it.",
  },

  /* ================================================================ CROSS RIVER */
  {
    id: "crs-carnival",
    tier: 94,
    title: "The Carnival Costume Money",
    hook: "A carnival band collected money for 300 costumes. On parade day, there are 40 costumes and a missing treasurer.",
    region: at("Cross River", "Carnival route, Calabar", "calabar"),
    inspiredBy: "Stories of carnival band funds that vanished before the big parade.",
    categories: ["vip"],
    tags: ["Cross River", "Calabar", "Carnival"],
    bounty: 420_000,
    inspecting: 31800,
    lead: { name: "Insp. Eno Archibong", face: face("#8D5524", "#7a1f6a", "bun", "gele", "smile", "#f5c518") },
    victim: "Band 7 of the Calabar Carnival (₦18M)",
    briefing:
      "Band 7's members each paid ₦60,000 for costumes. On parade morning there are only 40 costumes. The treasurer says the tailor ran off with the money. The tailor says he was never paid.",
    kit: {
      backdrop: { kind: "outdoor", sky: "night", ground: "road", horizon: "city" },
      castSide: "left",
      props: [
        { kind: "sign", x: 50, y: 14, label: "BAND 7: CARNIVAL", color: "#ff5ab4" },
        { kind: "arch", x: 50, y: 46, name: "Band float" },
        { kind: "coatrack", x: 30, y: 60, name: "Costume rack" },
        { kind: "speaker", x: 82, y: 52, name: "Speaker" },
        { kind: "phone", x: 64, y: 72, name: "Treasurer's phone" },
        { kind: "paper", x: 40, y: 84, name: "Band ledger" },
        { kind: "umbrella", x: 14, y: 46, color: "#ff5ab4" },
      ],
    },
    clues: [
      { id: "rack", name: "Costume rack", icon: Shirt, x: 30, y: 60, description: "The only 40 costumes.", action: "Check the labels", finding: "Last year's costumes with new feathers glued on. The tailor's label inside says 'repaired, ₦300,000, paid by the treasurer'.", suspectId: "ekpo" },
      { id: "ledger", name: "Band ledger", icon: ScrollText, x: 40, y: 84, description: "Torn pages from the band's money book.", action: "Rebuild the pages", lab: { kind: "torn", style: "ledger", title: "BAND 7 MONEY", lines: ["300 members x N60,000", "= N18,000,000", "Tailor paid: N300,000", "'Logistics': N17,700,000", "Treasurer: E. Ekpo", "No receipts", "Keep secret"] }, finding: "₦18M collected, only ₦300,000 to the tailor, and ₦17.7M marked 'logistics' with no receipts, by treasurer Ekpo.", suspectId: "ekpo" },
      { id: "phone", name: "Treasurer's phone", icon: Smartphone, x: 64, y: 72, description: "The treasurer's phone, left in the float.", action: "Read the messages", finding: "A booking for a car dealer in Calabar: 'Deposit paid. Collect Monday after carnival.' The deposit matches the missing money.", suspectId: "ekpo" },
      { id: "speaker", name: "Speaker", icon: Ticket, x: 82, y: 52, description: "The band's sound system.", action: "Ask the DJ", finding: "The DJ says the band leader, Okon, paid him from his own pocket and has been calling the treasurer for weeks.", suspectId: "okon" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "ekpo", name: "Effiong Ekpo", role: "Band treasurer", face: face("#4a2c17", "#1d1f22", "slick", "shades", "smile"), motive: "Used ₦17.7M on a new car.", alibi: "Says the tailor took the money.", background: "Treasurer for three carnivals.", quote: "The tailor! The tailor ran away with everything!", statements: [
        { id: "ekp-1", text: "I paid the tailor for all 300 costumes.", lie: { clueId: "rack", reveal: "I paid for repairs. The rest was for... logistics." } },
        { id: "ekp-2", text: "The money went on band logistics.", lie: { clueId: "phone", reveal: "The car is for band logistics. Mostly." } },
      ] },
      { id: "tailor", name: "Mr. Bassey Tailor", role: "Costume maker", face: face("#5C3A1E", "#e07a2a", "short", "glasses", "worried"), motive: "Blamed for the money.", alibi: "In his shop at Watt Market.", background: "Has made carnival costumes for ten years.", quote: "₦300,000 for repairs! That's all I ever saw!", statements: [
        { id: "bas-1", text: "Ekpo told me to repair old costumes, not make new ones.", press: "He said 'nobody will notice under the lights'." },
      ] },
      { id: "okon", name: "Okon Effiom", role: "Band leader", face: face("#6b4226", "#ff5ab4", "curly", "earring", "flat"), motive: "Runs the band.", alibi: "Rehearsing every night.", background: "Has led Band 7 for six years.", quote: "My band is my family. Somebody robbed my family.", statements: [
        { id: "oko-1", text: "Ekpo stopped answering my calls two weeks ago.", press: "He only texts. And always 'tomorrow'." },
      ] },
    ],
    culpritId: "ekpo",
    solution:
      "Treasurer Effiong Ekpo collected ₦18M from 300 members, paid the tailor only ₦300,000 to repair old costumes, and used the rest as a deposit on a car. The repaired costumes, the band ledger and his messages with the car dealer proved it.",
  },

  /* ================================================================ EBONYI */
  {
    id: "ebo-rice",
    tier: 95,
    title: "Abakaliki Rice, Made Abroad",
    hook: "A mill sells premium 'Abakaliki Rice' at a premium price. The rice was grown thousands of miles away.",
    region: at("Ebonyi", "Rice mill, Abakaliki", "highlife"),
    inspiredBy: "Reports of smuggled foreign rice being rebagged as local Nigerian rice.",
    categories: ["alley"],
    tags: ["Ebonyi", "Abakaliki rice", "Rebagging"],
    bounty: 380_000,
    inspecting: 17100,
    lead: { name: "Insp. Nnenna Nwali", face: face("#6b4226", "#3a8a4a", "bun", "gele", "flat", "#3a8a4a") },
    victim: "Abakaliki rice farmers and buyers",
    briefing:
      "A mill's 'Pure Abakaliki Rice' is suddenly the cheapest in the market, yet the mill buys almost no local paddy. Customs officers found foreign rice sacks burnt behind the mill.",
    kit: {
      backdrop: { kind: "indoor", decor: "warehouse", wall: "#c9b48e", floor: "#8a7a62", trim: "#4a3a22", window: "none" },
      castSide: "left",
      props: [
        { kind: "sack", x: 36, y: 56, name: "Rice sack" },
        { kind: "sack", x: 44, y: 58 },
        { kind: "sewing", x: 62, y: 62, name: "Bag stitcher" },
        { kind: "scorch", x: 80, y: 36, name: "Burn mark" },
        { kind: "generator", x: 84, y: 66, name: "Mill generator" },
        { kind: "paper", x: 30, y: 84, name: "Purchase book" },
        { kind: "crate", x: 54, y: 76, label: "ABAKALIKI RICE", name: "New bags" },
      ],
    },
    clues: [
      { id: "rice", name: "Rice sack", icon: Wheat, x: 36, y: 56, description: "A sack of 'Abakaliki rice'.", action: "Test the grain", finding: "Long-grain parboiled rice from abroad, with almost no stones and no local variety in it at all.", suspectId: "nweke" },
      { id: "stitcher", name: "Bag stitcher", icon: Package, x: 62, y: 62, description: "The bag-stitching machine.", action: "Check the scraps", finding: "Strips of foreign sacks with import stamps, cut away from the rice before it was poured into 'ABAKALIKI RICE' bags.", suspectId: "nweke" },
      { id: "book", name: "Purchase book", icon: Receipt, x: 30, y: 84, description: "The mill's torn purchase book.", action: "Rebuild the pages", lab: { kind: "torn", style: "ledger", title: "PURCHASES", lines: ["Local paddy: 4 tonnes", "'Supply': 120 tonnes", "From: border trucks", "Paid cash, no papers", "Bags printed: 5,000", "Sales: 'premium local'", "Chief N."] }, finding: "Only 4 tonnes of local paddy, but 120 tonnes of 'supply' from border trucks with no papers, and 5,000 new 'local' bags printed. Signed 'Chief N.'", suspectId: "nweke" },
      { id: "burn", name: "Burn mark", icon: Flame, x: 80, y: 36, description: "A burnt patch behind the mill.", action: "Ask the workers", finding: "Workers burn the foreign sacks every Saturday on the owner's orders. The mill manager, Ogbonna, says he was told it was 'waste'.", suspectId: "ogbonna" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "nweke", name: "Chief Nweke Nwankwo", role: "Mill owner", face: face("#5C3A1E", "#7a1f2a", "short", "fila", "smirk", "#c0182b"), motive: "Rebags foreign rice as premium local rice.", alibi: "Says all his rice comes from local farms.", background: "Runs the biggest mill in town.", quote: "Abakaliki rice is the best! Taste it!", statements: [
        { id: "nwe-1", text: "Every grain comes from Ebonyi farms.", lie: { clueId: "book", reveal: "Some comes from... other suppliers." } },
        { id: "nwe-2", text: "We have never handled foreign rice.", lie: { clueId: "stitcher", reveal: "We repack some. Customers like our bags." } },
      ] },
      { id: "ogbonna", name: "Ogbonna Eze", role: "Mill manager", face: face("#4a2c17", "#e8e0d0", "short", "cap", "worried"), motive: "Runs the mill floor.", alibi: "At the mill daily.", background: "Former rice farmer.", quote: "I mill paddy. The trucks go straight to Chief.", statements: [
        { id: "ogb-1", text: "The border trucks come at night and Chief meets them himself.", press: "He sends the night workers home early those days." },
      ] },
      { id: "farmer", name: "Mama Uzoamaka", role: "Rice farmer", face: face("#8D5524", "#e07a2a", "bun", "gele", "flat", "#e07a2a"), motive: "Can't sell her paddy.", alibi: "On her farm.", background: "Grows rice on four hectares.", quote: "Chief stopped buying our paddy. Now we know why.", statements: [
        { id: "uzo-1", text: "Chief said local paddy was 'too expensive' this year.", press: "Then his 'local' rice became the cheapest in the market. Explain that!" },
      ] },
    ],
    culpritId: "nweke",
    solution:
      "Mill owner Chief Nweke Nwankwo bought 120 tonnes of smuggled foreign rice, cut away the foreign sacks and rebagged it as premium 'Abakaliki Rice', burning the evidence every Saturday. The grain test, the stitcher scraps and his own purchase book proved it.",
  },

  /* ================================================================ EKITI */
  {
    id: "eki-exam",
    tier: 96,
    title: "The Special Centre of Ado-Ekiti",
    hook: "A private school's candidates all score A1 in every subject. The answers were on the board before the papers opened.",
    region: at("Ekiti", "Private school, Ado-Ekiti", "juju"),
    inspiredBy: "Reports of 'special centres' where exam answers are supplied to candidates.",
    categories: ["cyber"],
    tags: ["Ekiti", "Exams", "Special centre"],
    bounty: 400_000,
    inspecting: 24300,
    lead: { name: "Insp. Funmilayo Ojo", face: face("#8D5524", "#1d4a8a", "bun", "glasses", "flat") },
    victim: "The exam council and honest candidates",
    briefing:
      "A small private school registered 200 candidates, many from other states. All 200 got A1 in mathematics. A supervisor says she was locked out of the hall for the first hour.",
    kit: {
      backdrop: { kind: "indoor", decor: "office", wall: "#e8e8d8", floor: "#8a7a62", trim: "#1d4a8a", window: "city-day" },
      castSide: "right",
      props: [
        { kind: "sign", x: 50, y: 16, label: "EXAM HALL: SILENCE", color: "#c0182b" },
        { kind: "desk", x: 34, y: 60, name: "Candidate desk" },
        { kind: "desk", x: 60, y: 60 },
        { kind: "phone", x: 58, y: 56, name: "Proprietor's phone" },
        { kind: "books", x: 32, y: 56, name: "Answer booklet" },
        { kind: "paper", x: 44, y: 84, name: "Register" },
        { kind: "door", x: 86, y: 48, color: "#5a3a1a", name: "Hall door" },
      ],
    },
    clues: [
      { id: "booklet", name: "Answer booklet", icon: BookOpen, x: 32, y: 56, description: "A candidate's answer booklet.", action: "Compare the answers", finding: "All 200 booklets have the same answers in the same order, including the same two mistakes, copied from one solved paper.", suspectId: "adebayo" },
      { id: "phone", name: "Proprietor's phone", icon: Smartphone, x: 58, y: 56, description: "The proprietor's phone.", action: "Read the messages", finding: "Photos of the maths paper sent at 08:40, before the 09:00 start, to a 'solver' who replied with answers at 08:55.", suspectId: "adebayo" },
      { id: "register", name: "Register", icon: ClipboardList, x: 44, y: 84, description: "The candidate register.", action: "Check the names", finding: "Candidates from five states, each paying ₦150,000 'special fee' to the school, receipted by the proprietor.", suspectId: "adebayo" },
      { id: "door", name: "Hall door", icon: KeyRound, x: 86, y: 48, description: "The hall door.", action: "Dust the lock", lab: { kind: "prints", shape: "finger" }, finding: "Prints of the school's security man, who locked the supervisor out 'by mistake' on the proprietor's instruction.", suspectId: "gate" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "adebayo", name: "Mr. Adebayo Fasina", role: "School proprietor", face: face("#5C3A1E", "#e8e0d0", "short", "fila", "smile", "#1d4a8a"), motive: "Charged ₦150,000 per candidate for 'guaranteed' results.", alibi: "Says his students are simply brilliant.", background: "Runs a 'miracle centre' famous for results.", quote: "Ekiti children are brilliant! Is that a crime?", statements: [
        { id: "ade-1", text: "My students wrote the exam themselves.", lie: { clueId: "booklet", reveal: "We... revised together. Very well." } },
        { id: "ade-2", text: "I never saw the paper before the exam.", lie: { clueId: "phone", reveal: "I saw it a little early. Just a few minutes." } },
      ] },
      { id: "supervisor", name: "Mrs. Bola Ajayi", role: "Exam supervisor", face: face("#8D5524", "#7a1f6a", "bun", "gele", "worried", "#7a1f6a"), motive: "Was locked out.", alibi: "Outside the hall for an hour.", background: "Supervises exams every year.", quote: "I was locked out of my own exam hall!", statements: [
        { id: "bol-1", text: "When I got in, the board had just been wiped. It was still wet.", press: "Chalk smell everywhere. Wet board at 10 a.m. means only one thing." },
      ] },
      { id: "gate", name: "Baba Gate", role: "Security man", face: face("#4a2c17", "#3a5a3a", "buzz", "cap", "worried"), motive: "Locked the door.", alibi: "At the gate.", background: "Guards the school for ₦25,000 a month.", quote: "Oga said lock it, I locked it.", statements: [
        { id: "gat-1", text: "The proprietor gave me ₦10,000 to 'lose the key' for an hour.", press: "He said the supervisor would be 'disturbing the children'." },
      ] },
    ],
    culpritId: "adebayo",
    solution:
      "Proprietor Adebayo Fasina sold 'guaranteed results' for ₦150,000 per candidate, had the security man lock the supervisor out, photographed the paper before it started and had a solver send the answers, which were written on the board. The identical booklets and his phone proved it.",
  },

  /* ================================================================ ONDO */
  {
    id: "ond-kidnap",
    tier: 97,
    title: "The Akure Kidnap Hoax",
    hook: "A young man is 'kidnapped' and his family is asked for ₦5M. The kidnappers' phone is in his own jacket.",
    region: at("Ondo", "Oba Adesida Road, Akure", "juju"),
    inspiredBy: "Reports of people faking their own kidnapping to get ransom from family.",
    categories: ["alley"],
    tags: ["Ondo", "Akure", "Hoax"],
    bounty: 360_000,
    inspecting: 25600,
    lead: { name: "Insp. Tolani Akinola", face: face("#6b4226", "#3a5a8a", "short", "cap", "smile") },
    victim: "The Adeyemi family (₦5M demanded)",
    briefing:
      "Kunle Adeyemi's car was found abandoned at night with the door open. His mother got a call demanding ₦5M. Kunle was 'released' two days later, unharmed, after the family paid ₦1.5M.",
    kit: {
      backdrop: { kind: "outdoor", sky: "night", ground: "road", horizon: "city" },
      castSide: "left",
      props: [
        { kind: "car", x: 50, y: 56, color: "#c8ccd0", name: "Abandoned car" },
        { kind: "paper", x: 34, y: 80, name: "Ransom note" },
        { kind: "phone", x: 64, y: 74, name: "Burner phone" },
        { kind: "cctv", x: 86, y: 22, name: "Filling station camera" },
        { kind: "lamppost", x: 20, y: 48 },
        { kind: "okada", x: 76, y: 60, name: "Okada" },
      ],
    },
    clues: [
      { id: "car", name: "Abandoned car", icon: KeyRound, x: 50, y: 56, description: "Kunle's car, door left open.", action: "Examine the car", finding: "No damage, no struggle. The keys were in his pocket when he was 'released'. The door was opened from outside with the key.", suspectId: "kunle" },
      { id: "note", name: "Ransom note", icon: ScrollText, x: 34, y: 80, description: "A torn note left on the car seat.", action: "Rebuild the note", lab: { kind: "torn", style: "ransom", title: "RANSOM", lines: ["WE HAVE YOUR SON", "N5 MILLION", "NO POLICE", "DROP: OJA OBA", "SATURDAY 6PM", "HE IS SAFE", "FOR NOW"] }, finding: "Written on a notebook page torn from a notebook found in Kunle's own backpack. The handwriting matches his class notes.", suspectId: "kunle" },
      { id: "burner", name: "Burner phone", icon: Smartphone, x: 64, y: 74, description: "The phone used to call his mother.", action: "Trace the phone", finding: "Bought with Kunle's own BVN-linked SIM registration. Recovered from the jacket he wore when he came home.", suspectId: "kunle" },
      { id: "camera", name: "Filling station camera", icon: Cctv, x: 86, y: 22, description: "The camera across the road.", action: "Play 21:00", finding: "Kunle parks, leaves the door open himself, and climbs onto an okada with his friend Tobi, smiling.", suspectId: "tobi" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "kunle", name: "Kunle Adeyemi", role: "The 'victim'", face: face("#5C3A1E", "#1d1f22", "short", undefined, "worried"), motive: "Owed ₦1.4M in sports-betting debts.", alibi: "Says he was blindfolded in a forest.", background: "Final-year student, big betting habit.", quote: "They tied me in the bush for two days! It was terrible!", statements: [
        { id: "kun-1", text: "Armed men dragged me out of my car.", lie: { clueId: "camera", reveal: "There were no men. Just Tobi." } },
        { id: "kun-2", text: "I never saw that phone before.", lie: { clueId: "burner", reveal: "I bought it. I needed the money. I was going to pay it back." } },
      ] },
      { id: "tobi", name: "Tobi Olowo", role: "Friend", face: face("#4a2c17", "#c0182b", "buzz", "cap", "smirk"), motive: "Hid Kunle for two days.", alibi: "Says he was at school.", background: "Kunle's roommate.", quote: "He said it was a prank on his mum.", statements: [
        { id: "tob-1", text: "Kunle stayed in my room in Ijapo for two days, playing FIFA.", press: "He promised me ₦200,000 from the 'ransom'." },
      ] },
      { id: "mother", name: "Mrs. Folake Adeyemi", role: "Mother", face: face("#8D5524", "#7a1f6a", "bun", "gele", "worried", "#7a1f6a"), motive: "Paid ₦1.5M.", alibi: "At home, praying.", background: "Sold her shop goods to raise the money.", quote: "I sold everything in my shop for my son!", statements: [
        { id: "fol-1", text: "The kidnapper knew my pet name for Kunle.", press: "'Kunle-mi'. Only family knows that." },
      ] },
    ],
    culpritId: "kunle",
    solution:
      "Kunle Adeyemi faked his own kidnapping to pay off betting debts: he left his car open, hid in his friend's room and called his mother on a phone he'd registered himself. The camera, the notebook page and the burner phone proved it.",
  },

  /* ================================================================ OSUN */
  {
    id: "osu-grove",
    tier: 98,
    title: "The Osogbo Grove Gate",
    hook: "Thousands pour into the Osun Grove festival, but gate takings are a quarter of last year's.",
    region: at("Osun", "Osun Grove festival gate, Osogbo", "juju"),
    inspiredBy: "Reports of duplicate tickets and gate-fee skimming at big festivals.",
    categories: ["cyber"],
    tags: ["Osun", "Osogbo", "Festival"],
    bounty: 380_000,
    inspecting: 28700,
    lead: { name: "Insp. Morenike Adeleke", face: face("#8D5524", "#f5c518", "bun", "gele", "smile", "#f5c518") },
    victim: "The festival committee (₦22M of gate fees)",
    briefing:
      "The gate counters clicked 60,000 visitors, but the gate takings match only 15,000 tickets. The gate supervisor says most visitors had free passes.",
    kit: {
      backdrop: { kind: "outdoor", sky: "day", ground: "grass", horizon: "hills" },
      castSide: "left",
      props: [
        { kind: "sign", x: 50, y: 14, label: "OSUN GROVE FESTIVAL", color: "#f5c518" },
        { kind: "kiosk", x: 46, y: 54, label: "GATE", color: "#1d6a3a", name: "Ticket kiosk" },
        { kind: "paper", x: 46, y: 60, name: "Ticket roll" },
        { kind: "umbrella", x: 72, y: 50, color: "#f5c518" },
        { kind: "cctv", x: 86, y: 22, name: "Gate camera" },
        { kind: "phone", x: 30, y: 78, name: "Supervisor's phone" },
        { kind: "bench", x: 68, y: 74, name: "Volunteers' bench" },
      ],
    },
    clues: [
      { id: "tickets", name: "Ticket roll", icon: Ticket, x: 46, y: 60, description: "A roll of gate tickets.", action: "Check the serials", finding: "Two rolls with the same serial numbers. One is official; the other was printed privately, so its sales never reach the committee.", suspectId: "sola" },
      { id: "camera", name: "Gate camera", icon: Cctv, x: 86, y: 22, description: "The camera over the gate.", action: "Count the paying visitors", finding: "Most visitors pay cash and get a ticket. Very few 'free passes'. The supervisor switches ticket rolls every afternoon.", suspectId: "sola" },
      { id: "phone", name: "Supervisor's phone", icon: Smartphone, x: 30, y: 78, description: "The gate supervisor's phone.", action: "Read the messages", finding: "To a print shop: 'Same tickets as the official ones, 50,000 copies, deliver before the festival.' Paid by the supervisor.", suspectId: "sola" },
      { id: "bench", name: "Volunteers' bench", icon: Receipt, x: 68, y: 74, description: "Where gate volunteers rest.", action: "Talk to them", finding: "Volunteers were told to put afternoon cash in a separate bag 'for security'. The bag went to the supervisor's car.", suspectId: "yemi" },
    ],
    requiredClues: 3,
    suspects: [
      { id: "sola", name: "Sola Adedeji", role: "Gate supervisor", face: face("#5C3A1E", "#1d1f22", "short", "cap", "smile"), motive: "Sold duplicate tickets and kept the cash.", alibi: "Says most visitors had free passes.", background: "Has run the gate for four festivals.", quote: "Free passes! Everybody knows somebody in Osogbo!", statements: [
        { id: "sol-1", text: "Most visitors came in on free passes.", lie: { clueId: "camera", reveal: "Some paid. Some didn't. It's hard to count." } },
        { id: "sol-2", text: "We only use the committee's official tickets.", lie: { clueId: "tickets", reveal: "We ran out, so I printed more. For the visitors." } },
      ] },
      { id: "yemi", name: "Yemi Ogunleye", role: "Volunteer", face: face("#4a2c17", "#3a8a4a", "buzz", "cap", "worried"), motive: "Handled the afternoon cash.", alibi: "At the gate all day.", background: "Student volunteer.", quote: "I put the money where I was told.", statements: [
        { id: "yem-1", text: "Sola collected the 'security bag' himself every evening.", press: "He said the committee's van was too slow." },
      ] },
      { id: "treasurer", name: "Chief Mrs. Adunni", role: "Committee treasurer", face: face("#8D5524", "#7a1f6a", "bun", "gele", "flat", "#7a1f6a"), motive: "Counted the takings.", alibi: "At the committee office.", background: "Has counted festival money for 20 years.", quote: "The counters say 60,000. My bags say 15,000.", statements: [
        { id: "adu-1", text: "Only morning cash ever reached my office.", press: "Every evening Sola said 'afternoon was quiet'." },
      ] },
    ],
    culpritId: "sola",
    solution:
      "Gate supervisor Sola Adedeji printed duplicate festival tickets, switched to them every afternoon, and took the afternoon cash in a separate 'security bag'. The duplicate serials, the gate camera and his order to the print shop proved it.",
  },
];
