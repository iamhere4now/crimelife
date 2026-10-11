/**
 * Storylines for the state case generator (stateGames.ts). Each is a whole
 * non-violent crime (the kinds Nigerians read about every week) written with
 * blanks the generator fills from a state pack:
 *   {place} {city} {state} {nick}   where it happens
 *   {product}                        a local product of that state
 *   {amount}                         money involved
 *   {C} {Cf}   culprit full / first name      {H} {Hf} helper      {W} {Wf} witness
 *   {V}        the victim                     {staff} someone who works at that kind of place
 */

import type { CategoryId, PropKind } from "../types";
import type { PlaceKind } from "./statePacks";

export type IconKey =
  | "cash" | "cctv" | "list" | "card" | "steps" | "key" | "laptop" | "megaphone" | "box" | "receipt" | "scale" | "scroll"
  | "phone" | "stamp" | "ticket" | "tool" | "power" | "fish" | "grain" | "drop" | "gem" | "truck" | "fuel" | "pill" | "shirt" | "book" | "camera";

export interface ClueSpec {
  id: string;
  name: string;
  icon: IconKey;
  prop: PropKind;
  label?: string;
  /** Where in the scene: 0 middle, 1 right, 2 front left, 3 high (cameras, signs), 4 front. */
  slot: 0 | 1 | 2 | 3 | 4;
  desc: string;
  action: string;
  finding: string;
  who: "C" | "H" | "W";
  lab?: "prints" | "boot" | string[];
}

export interface Storyline {
  id: string;
  category: CategoryId;
  /** Where it can happen. */
  kinds: PlaceKind[];
  titles: string[];
  hook: string;
  briefing: string;
  victim: string;
  inspired: string;
  /** Money involved, in naira (the generator picks inside the range). */
  amount: [number, number];
  clues: [ClueSpec, ClueSpec, ClueSpec, ClueSpec];
  culprit: { role: string; motive: string; alibi: string; background: string; quote: string; lies: [string, string, string][] };
  helper: { role: string; motive: string; alibi: string; background: string; quote: string; says: [string, string] };
  witness: { role: string; motive: string; alibi: string; background: string; quote: string; says: [string, string] };
  solution: string;
}

const ANY_OUT: PlaceKind[] = ["market", "motorpark", "square", "park", "campus", "craft", "stadium"];
const ANY_IN: PlaceKind[] = ["office", "mall", "hotel", "museum", "factory"];

export const STORYLINES: Storyline[] = [
  {
    id: "fake-alert",
    category: "cyber",
    kinds: ["market", "mall", "craft", "square", "motorpark"],
    titles: ["Fake Alert at {place}", "The Credit Alert That Wasn't", "Ping! Wahala at {place}"],
    hook: "Traders at {place} keep getting 'credit alerts' for big {product} orders. The money never lands.",
    briefing: "At least nine sellers in {city} handed over {product} after a buyer showed a bank alert on his phone. Every alert was fake. The sellers lost {amount} in one week.",
    victim: "Sellers at {place} ({amount} of {product})",
    inspired: "The 'fake alert' scam, where a doctored bank SMS or screenshot is shown as payment.",
    amount: [600_000, 4_000_000],
    clues: [
      { id: "phone", name: "Buyer's phone", icon: "phone", prop: "phone", slot: 0, desc: "A phone dropped in the rush, still unlocked.", action: "Check the apps", finding: "A 'bank alert maker' app with dozens of saved fake alerts, each made minutes before a purchase.", who: "C" },
      { id: "goods", name: "Bags of {product}", icon: "box", prop: "sack", slot: 1, desc: "{product} loaded on a waiting keke.", action: "Trace the goods", finding: "The same {product} is on sale at half price two streets away, from a stall rented by {C}.", who: "C" },
      { id: "slip", name: "Torn receipt", icon: "receipt", prop: "paper", slot: 2, desc: "A torn sales receipt.", action: "Rebuild the receipt", finding: "Signed '{Cf}', with a phone number that matches the buyer's.", who: "C", lab: ["{place}", "Goods: {product}", "Amount: {amount}", "Paid: 'transfer'", "Buyer: {Cf}", "Phone: 080…", "Seller: {W}"] },
      { id: "cctv", name: "Shop camera", icon: "cctv", prop: "cctv", slot: 3, desc: "A camera over the busiest stall.", action: "Play the footage", finding: "{C} shows a phone, a keke man carries the goods away, and {H} waits at the wheel.", who: "H" },
    ],
    culprit: { role: "'Big buyer'", motive: "Resells goods he never paid for.", alibi: "Says he paid every naira by transfer.", background: "Shows up with a smile and a big order.", quote: "Check your phone, my brother. The money don enter.", lies: [["I paid by bank transfer. The alert is real.", "phone", "Okay, the app made the alert. But the bank is slow sometimes!"], ["I don't sell {product}. I'm a buyer.", "goods", "That stall is my cousin's… my own… okay, it's mine."]] },
    helper: { role: "Keke rider", motive: "Carried the goods away.", alibi: "Says he only carries loads.", background: "Paid per trip.", quote: "Me, I'm just a driver.", says: ["He always loads fast and tells me 'move, move'.", "Every trip ends at the same stall near the junction."] },
    witness: { role: "{staff}", motive: "Lost {product} to the scam.", alibi: "Was at the stall all day.", background: "Has worked at {place} for years.", quote: "I saw the alert with my own eyes!", says: ["The alert said 'pending' at the bottom. I didn't look well.", "When I called the bank, they said no money came."] },
    solution: "{C} showed fake bank alerts made with an app to buy {product} at {place}, had {H} carry the goods off by keke, and resold them at half price from a stall of his own. The phone, the goods and the receipt proved it.",
  },
  {
    id: "rigged-scale",
    category: "alley",
    kinds: ["market", "farm", "factory", "craft"],
    titles: ["The Heavy Thumb of {place}", "Short Measure at {place}", "Who Fixed the Scale?"],
    hook: "Farmers selling {product} at {place} say the scale always reads light. The buyer always smiles.",
    briefing: "{V} weighed the same load at home and at {place}: the scale there read 30% less. Farmers in {state} have been short-changed about {amount} this season.",
    victim: "{product} farmers selling at {place}",
    inspired: "Farmers' complaints about rigged scales and short measures at produce markets.",
    amount: [800_000, 6_000_000],
    clues: [
      { id: "scale", name: "Weighing scale", icon: "scale", prop: "panel", slot: 0, desc: "The buyer's weighing scale.", action: "Open the casing", finding: "A magnet and a hidden screw make it read 30% light. Turn the screw and it reads true.", who: "C" },
      { id: "book", name: "Buyer's book", icon: "scroll", prop: "paper", slot: 2, desc: "The buyer's notebook.", action: "Rebuild the torn page", finding: "Two columns for every load: what he paid for, and what he sold on. The difference is the stolen 30%.", who: "C", lab: ["Load: {product}", "Paid for: 70 kg", "Sold as: 100 kg", "Seller: {V}", "Profit: 30%", "Weekly", "{C}"] },
      { id: "sacks", name: "Sacks of {product}", icon: "grain", prop: "sack", slot: 1, desc: "Sacks of {product} waiting for a lorry.", action: "Weigh them on a hand scale", finding: "Each sack is full weight. The farmers' sacks were honest all along.", who: "W" },
      { id: "tools", name: "Small screwdriver", icon: "tool", prop: "crate", label: "TOOLS", slot: 4, desc: "A toolbox under the buyer's table.", action: "Dust for prints", finding: "Prints of {C} on the screwdriver that fits the hidden screw.", who: "C", lab: "prints" },
    ],
    culprit: { role: "Produce buyer", motive: "Pockets 30% of every load.", alibi: "Says the scale is certified.", background: "Buys {product} for big traders in {city}.", quote: "The machine no dey lie.", lies: [["Nobody has ever opened my scale.", "scale", "I opened it to… clean it."], ["I pay exactly what the scale says.", "book", "The book is for… taxes."]] },
    helper: { role: "Loader", motive: "Saw everything.", alibi: "Loads lorries.", background: "Works for the buyer.", quote: "I just carry.", says: ["Oga turns a small screw every morning before the farmers come.", "He says 'make the scale rest small'."] },
    witness: { role: "Farmer", motive: "Was cheated.", alibi: "Weighed at home first.", background: "Grows {product} near {city}.", quote: "My sack no fit lose weight on the road!", says: ["I weighed the same sack at the church scale.", "The pastor wrote the weight and signed it."] },
    solution: "{C} fitted a magnet and a hidden screw to his scale at {place} so every load of {product} read 30% light, paid the farmers for less and sold on the full weight. The scale, his two-column book and the screwdriver proved it.",
  },
  {
    id: "ticket-racket",
    category: "heists",
    kinds: ["reserve", "falls", "park", "museum", "stadium", "hills", "rocks", "lake", "beach"],
    titles: ["Ticket Racket at {place}", "The Gate Money Ghost", "Fake Tickets, Real Money"],
    hook: "Hundreds of visitors came to {place} this holiday. The gate book says only a few dozen paid.",
    briefing: "The gate at {place} was busy every day, yet the official ticket book barely moved. Visitors all have tickets. About {amount} in gate fees is missing.",
    victim: "{place} ({amount} in gate fees)",
    inspired: "Reports of fake gate tickets being sold at parks and tourist sites.",
    amount: [700_000, 5_000_000],
    clues: [
      { id: "roll", name: "Ticket roll", icon: "ticket", prop: "paper", slot: 2, desc: "A roll of tickets from the gate.", action: "Check the tickets", finding: "Printed in a private shop: no hologram, wrong serial numbers.", who: "C" },
      { id: "box", name: "Gate cash box", icon: "cash", prop: "chest", slot: 0, desc: "The gate's cash box.", action: "Count it", finding: "A small amount, matching only the official tickets. The fake ticket money is gone.", who: "C" },
      { id: "phone", name: "Gateman's phone", icon: "phone", prop: "phone", slot: 4, desc: "The gateman's phone.", action: "Read the messages", finding: "Orders to a printer in {city}: 'Another 2,000, same design, no hologram.'", who: "C" },
      { id: "book", name: "Official ticket book", icon: "list", prop: "cabinet", slot: 1, desc: "The official ticket book.", action: "Dust for prints", finding: "The supervisor only signs the cover. The gateman fills every page.", who: "H", lab: "prints" },
    ],
    culprit: { role: "Gateman", motive: "Sells fake tickets and keeps the money.", alibi: "Says the holiday was quiet.", background: "Has worked the gate at {place} for years.", quote: "Quiet week, officer. Very quiet.", lies: [["Every ticket I sell is official.", "roll", "The official ones finished. I… helped."], ["All the gate money is in the box.", "box", "Some of it went home with me. For safekeeping."]] },
    helper: { role: "Gate supervisor", motive: "Signs the book without checking.", alibi: "Says he trusted the gateman.", background: "Supervises three gates.", quote: "I sign what they give me.", says: ["I only see the book on Fridays.", "He brings it already totalled."] },
    witness: { role: "Printer", motive: "Printed the tickets.", alibi: "Says it was a normal job.", background: "Runs a print shop in {city}.", quote: "A job is a job.", says: ["He said the hologram 'slows the queue'.", "He paid cash and never took a receipt."] },
    solution: "{C} had thousands of fake tickets printed in {city}, sold them at the {place} gate and kept the money, recording only a few real tickets. The fake roll, the cash box and his messages to the printer proved it.",
  },
  {
    id: "esusu",
    category: "cyber",
    kinds: ["market", "craft", "office", "square", "campus"],
    titles: ["The Esusu That Vanished", "Double Your Money at {place}", "Contribution Wahala"],
    hook: "A monthly contribution group at {place} promised double returns. This month, the collector has gone quiet.",
    briefing: "Over 200 members at {place} paid into a 'double your money' contribution run by a friendly collector. {amount} is missing, and the payout day came and went.",
    victim: "Contribution members at {place} ({amount})",
    inspired: "Ponzi-style 'double your money' schemes and contribution (esusu/ajo) collectors who disappear.",
    amount: [2_000_000, 25_000_000],
    clues: [
      { id: "ledger", name: "Contribution ledger", icon: "scroll", prop: "paper", slot: 2, desc: "The group's ledger.", action: "Rebuild the torn pages", finding: "Early members were paid with new members' money. No business ever made a profit.", who: "C", lab: ["Members: 214", "Paid in: {amount}", "Paid out: early members", "Investment: none", "Payout day: moved", "Collector: {C}", "Bank: personal"] },
      { id: "laptop", name: "Collector's laptop", icon: "laptop", prop: "laptop", slot: 0, desc: "The collector's laptop.", action: "Check the transfers", finding: "Most of the money went to a new car and a plot of land in {C}'s name.", who: "C" },
      { id: "flyer", name: "Promo flyers", icon: "megaphone", prop: "flyer", slot: 1, desc: "Flyers promising '100% in 30 days'.", action: "Check the details", finding: "Designed by {H}, who got a 'bonus' for every new member.", who: "H" },
      { id: "cctv", name: "Bank camera still", icon: "cctv", prop: "cctv", slot: 3, desc: "A still from a bank camera.", action: "Study it", finding: "{C} withdrawing a large sum the day before payout day.", who: "C" },
    ],
    culprit: { role: "Contribution collector", motive: "Took the members' money.", alibi: "Says the 'investment' is just delayed.", background: "Everybody's friend at {place}.", quote: "Your money is safe! Just exercise patience.", lies: [["The money is invested in a big business.", "ledger", "The business is… the new members."], ["I haven't touched a kobo for myself.", "laptop", "The car is for the group's use. Mostly mine."]] },
    helper: { role: "Recruiter", motive: "Brought in new members.", alibi: "Says he believed in it.", background: "Paid a bonus for every member.", quote: "I invested too!", says: ["He paid me ₦5,000 for every new person.", "I stopped when he asked me to 'move the payout day'."] },
    witness: { role: "Member", motive: "Lost her savings.", alibi: "Paid every month.", background: "Sells at {place}.", quote: "My children's school fees were in there!", says: ["The first months, he paid on time. That's why we trusted him.", "Then he started saying 'next week, next week'."] },
    solution: "{C} ran a 'double your money' contribution at {place}, paying early members with new members' money while spending the rest on a car and land. The ledger, his laptop and the bank footage proved it.",
  },
  {
    id: "artefact-swap",
    category: "vip",
    kinds: ["museum", "palace", "craft", "hotel"],
    titles: ["The Replica at {place}", "Swap at {place}", "The Treasure That Changed Overnight"],
    hook: "A prized carving at {place} looks right, but a visiting expert says it's a copy made last month.",
    briefing: "An old treasure displayed at {place} has been swapped for a clever replica. The original could fetch {amount} from foreign collectors.",
    victim: "{place} and the people of {state}",
    inspired: "Thefts of Nigerian antiquities replaced with replicas and smuggled abroad.",
    amount: [10_000_000, 80_000_000],
    clues: [
      { id: "piece", name: "The 'treasure'", icon: "gem", prop: "pedestal", slot: 0, desc: "The treasure on its stand.", action: "Test the material", finding: "Fresh resin under old-looking paint. Made weeks ago, not centuries.", who: "C" },
      { id: "crate", name: "Shipping crate", icon: "box", prop: "crate", label: "HANDICRAFTS", slot: 1, desc: "A crate labelled 'handicrafts'.", action: "Check the paperwork", finding: "Booked to Europe by {C}, declared as 'souvenir carving'.", who: "C" },
      { id: "paint", name: "Paint tins", icon: "drop", prop: "paint", slot: 2, desc: "Tins of brown and gold paint.", action: "Dust for prints", finding: "Prints of {H}, the carver who made the copy.", who: "H", lab: "prints" },
      { id: "cctv", name: "Night camera", icon: "cctv", prop: "cctv", slot: 3, desc: "The camera over the display.", action: "Play last week", finding: "Switched off for two hours on Tuesday night, from the office of {C}.", who: "C" },
    ],
    culprit: { role: "{staff}", motive: "Sold the original to a collector.", alibi: "Says nobody can touch the display.", background: "Holds the keys to the display.", quote: "That piece has not moved in fifty years.", lies: [["The piece on the stand is the original.", "piece", "It's… a very good original."], ["I never shipped anything abroad.", "crate", "Souvenirs. Just souvenirs."]] },
    helper: { role: "Carver", motive: "Made the copy.", alibi: "Says it was a 'commission'.", background: "A gifted carver in {city}.", quote: "I make copies for tourists.", says: ["He brought photos and measurements of the real one.", "He said it was for a 'museum shop'."] },
    witness: { role: "Visiting expert", motive: "Spotted the fake.", alibi: "Arrived on Friday.", background: "Studies {state} art.", quote: "Old wood doesn't smell of fresh paint.", says: ["The tool marks are from a modern chisel.", "The original had a crack on the base. This one doesn't."] },
    solution: "{C} paid a carver to copy the treasure at {place}, switched off the camera to swap it and booked the original abroad as 'souvenir carving'. The fresh resin, the crate and the camera log proved it.",
  },
  {
    id: "pos-clone",
    category: "cyber",
    kinds: ["hotel", "mall", "market", "motorpark"],
    titles: ["The Card Cloner of {place}", "Swipe Twice at {place}", "POS Wahala"],
    hook: "Customers who paid by card at {place} lost money days later in withdrawals far away.",
    briefing: "Thirty-one customers who paid by card at {place} were drained of {amount} in total by ATM withdrawals in another state.",
    victim: "Customers at {place} ({amount})",
    inspired: "POS skimmers used to copy bank cards at shops, hotels and filling stations.",
    amount: [1_500_000, 12_000_000],
    clues: [
      { id: "pos", name: "POS machine", icon: "card", prop: "card", slot: 0, desc: "The POS machine at the counter.", action: "Open the card slot", finding: "A thin skimmer glued inside, copying every card.", who: "C" },
      { id: "cctv", name: "Counter camera", icon: "cctv", prop: "cctv", slot: 3, desc: "The camera over the counter.", action: "Play the footage", finding: "{C} swipes cards twice: once in the POS, once in a small device under the counter.", who: "C" },
      { id: "register", name: "Sales book", icon: "list", prop: "paper", slot: 2, desc: "The card sales book.", action: "Compare with the bank list", finding: "Every victim paid during {C}'s shift.", who: "C" },
      { id: "laptop", name: "Office laptop", icon: "laptop", prop: "laptop", slot: 1, desc: "The office laptop.", action: "Dust the keyboard", finding: "Only the manager's prints. The day shift's customers lost nothing.", who: "W", lab: "prints" },
    ],
    culprit: { role: "Cashier", motive: "Cloned customers' cards.", alibi: "Says the POS 'just does it'.", background: "Works the late shift at {place}.", quote: "I give everybody five-star service.", lies: [["I only use the official POS.", "cctv", "And a small backup machine. For network."], ["Nobody can open that POS.", "pos", "I watched a video. It's easy."]] },
    helper: { role: "Cousin in another state", motive: "Withdraws with the cloned cards.", alibi: "Says he was at work.", background: "Visits ATMs at night.", quote: "I don't know any {place}.", says: ["He sends me 'card details' on WhatsApp.", "We share the money half-half."] },
    witness: { role: "Manager", motive: "Runs {place}.", alibi: "Works the day shift.", background: "Has managed for years.", quote: "My shift is clean.", says: ["He insisted on the late shift. Nobody wants it.", "Customers complained the machine 'took long'."] },
    solution: "{C} fitted a skimmer inside the POS at {place} and swiped cards on a second device, sending the copies to a cousin who emptied the accounts. The skimmer, the footage and the sales book proved it.",
  },
  {
    id: "fake-jobs",
    category: "cyber",
    kinds: ["square", "campus", "office", "hotel", "stadium"],
    titles: ["The {place} Recruitment", "Jobs for Sale at {place}", "Form Fee Palava"],
    hook: "Hundreds queued at {place} to buy application forms for 'government jobs'. There are no jobs.",
    briefing: "An 'agency' sold over 800 forms at {place} for {amount} in total, promising jobs with a big company. The company has never heard of it.",
    victim: "Job seekers in {city} ({amount})",
    inspired: "Fake recruitment exercises that charge applicants for forms and 'processing'.",
    amount: [3_000_000, 15_000_000],
    clues: [
      { id: "flyer", name: "Job flyers", icon: "megaphone", prop: "flyer", slot: 1, desc: "Flyers promising '2,000 jobs'.", action: "Check the details", finding: "The company logo is copied from the internet. The phone number belongs to {C}.", who: "C" },
      { id: "forms", name: "Application forms", icon: "scroll", prop: "paper", slot: 2, desc: "Torn application forms.", action: "Rebuild one", finding: "Photocopied forms; the 'interview date' has moved three times.", who: "C", lab: ["Recruitment {state}", "Form fee: ₦15,000", "Interview: (moved)", "Pay to: {C}", "Personal account", "Copies: 1,000", "{city}"] },
      { id: "cash", name: "Cash box", icon: "cash", prop: "chest", slot: 0, desc: "A box of cash and transfer slips.", action: "Count it", finding: "Cash and slips adding up to {amount}, all paid into {C}'s own account.", who: "C" },
      { id: "table", name: "Form table", icon: "list", prop: "banquet", slot: 4, desc: "The table where forms were sold.", action: "Dust for prints", finding: "Prints of {C} and of the volunteers he hired to sell the forms.", who: "H", lab: "prints" },
    ],
    culprit: { role: "'Agency' boss", motive: "Sold fake job forms.", alibi: "Says the jobs are coming.", background: "Calls himself a 'human resources consultant'.", quote: "The jobs are coming! Be patient!", lies: [["We are the company's official recruiters.", "flyer", "Official in spirit."], ["The form money goes to the company.", "cash", "The company is me."]] },
    helper: { role: "Volunteer", motive: "Sold forms for a 'promise'.", alibi: "Was promised a job.", background: "A graduate looking for work.", quote: "I bought a form too!", says: ["He said selling 50 forms puts me first on the list.", "There is no list."] },
    witness: { role: "Applicant", motive: "Paid for two forms.", alibi: "Came every week.", background: "An engineering graduate.", quote: "Two forms, zero interviews.", says: ["Every week the interview is 'next Monday'.", "Last Monday the tables were gone."] },
    solution: "{C} used a copied company logo to sell fake job application forms at {place}, keeping {amount} in his own account. The flyers, the forms and the cash box proved it.",
  },
  {
    id: "relief-diverted",
    category: "heists",
    kinds: ["factory", "office", "campus", "square", "motorpark"],
    titles: ["The Missing Palliatives of {place}", "Relief Bags for Sale", "Where Did the Rice Go?"],
    hook: "Bags of food relief meant for families in {city} are on sale in the market with the labels torn off.",
    briefing: "A store at {place} received food relief for 3,000 families. Only half reached them. The rest, worth {amount}, is being sold.",
    victim: "Families in {city} waiting for relief",
    inspired: "Reports of relief and palliative food being diverted and sold.",
    amount: [4_000_000, 30_000_000],
    clues: [
      { id: "bags", name: "Relief bags", icon: "grain", prop: "sack", slot: 0, desc: "Rice bags with the 'NOT FOR SALE' label torn off.", action: "Check the batch numbers", finding: "Batch numbers match the relief delivered to {place}.", who: "C" },
      { id: "waybill", name: "Waybill", icon: "receipt", prop: "paper", slot: 2, desc: "A torn delivery waybill.", action: "Rebuild it", finding: "3,000 bags delivered; 1,500 signed out to families. 1,500 signed out to 'store 2', which doesn't exist.", who: "C", lab: ["Relief: 3,000 bags", "To families: 1,500", "To 'store 2': 1,500", "Signed: {C}", "Truck: night", "Date: Sunday", "{place}"] },
      { id: "truck", name: "Night lorry", icon: "truck", prop: "van", label: "TRANSPORT", slot: 1, desc: "A lorry that loads at night.", action: "Check the tyres and log", finding: "Tracks lead from the store to a trader's warehouse in {city}.", who: "H" },
      { id: "cctv", name: "Store camera", icon: "cctv", prop: "cctv", slot: 3, desc: "The store camera.", action: "Play Sunday night", finding: "{C} unlocks the store for the lorry at 2 am.", who: "C" },
    ],
    culprit: { role: "Storekeeper", motive: "Sold half the relief.", alibi: "Says every bag went to families.", background: "In charge of the relief store.", quote: "Every family got their own!", lies: [["Every bag was shared to families.", "waybill", "'Store 2' is… a family. A big family."], ["The store was locked all Sunday.", "cctv", "I opened it to… air it."]] },
    helper: { role: "Lorry driver", motive: "Moved the bags at night.", alibi: "Says he carried 'old stock'.", background: "Hires out his lorry.", quote: "I drive, I don't ask.", says: ["The storekeeper paid me double for a night trip.", "We offloaded at a big warehouse near the market."] },
    witness: { role: "Community leader", motive: "Reported the shortage.", alibi: "Counted the families.", background: "Speaks for the families.", quote: "My people waited all day for nothing.", says: ["We were told 'second batch is coming'.", "My neighbour bought one of our own bags in the market."] },
    solution: "{C} signed half of the relief at {place} out to a 'store 2' that doesn't exist and had a lorry carry it to a trader at night. The batch numbers, the waybill and the camera proved it.",
  },
  {
    id: "fuel-siphon",
    category: "heists",
    kinds: ["motorpark", "factory", "campus", "stadium", "hotel"],
    titles: ["Diesel Disappears at {place}", "The Thirsty Generator", "Who Drank the Diesel?"],
    hook: "{place} buys enough diesel to run its generator for a month. It runs out in a week.",
    briefing: "{place} spent {amount} on diesel this quarter. The generator logs say it used a third of that.",
    victim: "{place} ({amount} of diesel)",
    inspired: "Diesel and fuel siphoned from generators and tankers and resold.",
    amount: [1_000_000, 8_000_000],
    clues: [
      { id: "gen", name: "Generator", icon: "power", prop: "generator", slot: 1, desc: "The big generator.", action: "Check the hour meter", finding: "It ran 60 hours this month, not the 300 hours on the diesel claims.", who: "C" },
      { id: "cans", name: "Jerrycans", icon: "fuel", prop: "tank", slot: 0, desc: "Jerrycans behind the generator house.", action: "Dust for prints", finding: "Prints of {C} and {H}.", who: "C", lab: "prints" },
      { id: "log", name: "Fuel log", icon: "scroll", prop: "paper", slot: 2, desc: "The diesel log book.", action: "Read it", finding: "Full tank written every two days in the same pen, signed by {C}.", who: "C" },
      { id: "phone", name: "Buyer's phone", icon: "phone", prop: "phone", slot: 4, desc: "A roadside fuel seller's phone.", action: "Read the messages", finding: "'Bring 10 jerrycans tonight, same price.' From {C}.", who: "H" },
    ],
    culprit: { role: "Generator operator", motive: "Sells the diesel.", alibi: "Says the generator 'drinks too much'.", background: "Runs the generator house.", quote: "This generator get big belly!", lies: [["The generator runs day and night.", "gen", "The meter is… slow."], ["I never take diesel out of the compound.", "cans", "I was… airing the jerrycans."]] },
    helper: { role: "Roadside fuel seller", motive: "Buys the stolen diesel.", alibi: "Says he buys from 'suppliers'.", background: "Sells by the roadside.", quote: "Fuel is fuel.", says: ["He brings jerrycans at night.", "He sells for half the pump price."] },
    witness: { role: "{staff}", motive: "Approves the diesel money.", alibi: "Signs the claims.", background: "Manages the budget.", quote: "I sign what the log says.", says: ["The lights go off early every night now.", "He always asks for diesel money before it runs out."] },
    solution: "{C} logged fake diesel use at {place} and sold the diesel in jerrycans to {H} by the roadside. The generator's hour meter, the jerrycans and the messages proved it.",
  },
  {
    id: "double-sale",
    category: "vip",
    kinds: ["market", "mall", "square", "farm", "craft"],
    titles: ["Sold Three Times at {place}", "One Shop, Three Owners", "The Allocation Palava"],
    hook: "Three traders arrive at the same new shop at {place}, each with a receipt and keys.",
    briefing: "A new shop at {place} was sold three times for {amount} in total. The 'agent' has the same story for everyone: 'You are the real owner.'",
    victim: "Three traders ({amount})",
    inspired: "Shops, stalls and plots sold to several buyers at once.",
    amount: [3_000_000, 20_000_000],
    clues: [
      { id: "papers", name: "Allocation papers", icon: "stamp", prop: "paper", slot: 2, desc: "Allocation papers from all three buyers.", action: "Rebuild the torn copy", finding: "The same paper photocopied three times with different names. The stamp is a copy.", who: "C", lab: ["Allocation", "Shop: B-12", "Owner: (blank)", "Stamp: copy", "Names added by hand", "Copies: 3", "Agent: {C}"] },
      { id: "keys", name: "Keys", icon: "key", prop: "card", slot: 0, desc: "Three sets of keys.", action: "Check them", finding: "All three cut from the same key at a roadside key cutter.", who: "C" },
      { id: "phone", name: "Agent's phone", icon: "phone", prop: "phone", slot: 4, desc: "The agent's phone.", action: "Read the messages", finding: "The same message to three people: 'Pay today, others are coming.'", who: "C" },
      { id: "register", name: "Real register", icon: "list", prop: "cabinet", slot: 1, desc: "The real allocation register.", action: "Check the shop", finding: "The shop belongs to the market authority and was never for sale.", who: "W" },
    ],
    culprit: { role: "'Agent'", motive: "Sold one shop three times.", alibi: "Says it's a misunderstanding.", background: "Knows everybody at {place}.", quote: "Na misunderstanding, I swear.", lies: [["I sold the shop once, to one person.", "phone", "Once… each."], ["The papers are original.", "papers", "Original photocopies."]] },
    helper: { role: "Key cutter", motive: "Cut the keys.", alibi: "Says it was a normal job.", background: "Works by the gate.", quote: "Keys are my work.", says: ["He brought one key and asked for three copies.", "He paid extra to 'keep quiet'."] },
    witness: { role: "First buyer", motive: "Paid her savings.", alibi: "Has receipts.", background: "Sells {product}.", quote: "I have receipts!", says: ["He refused to go with me to the market office.", "He said 'the office is slow, trust me'."] },
    solution: "{C} sold a market-owned shop at {place} to three traders with photocopied papers and copied keys. The papers, the keys and his messages proved it.",
  },
  {
    id: "rigged-raffle",
    category: "alley",
    kinds: ["stadium", "square", "park", "mall", "campus", "beach"],
    titles: ["The {place} Raffle", "Lucky Again?", "Spin, Win, Wahala"],
    hook: "A raffle at {place} promises a car to one lucky ticket. The organiser's nephew wins. Again.",
    briefing: "Thousands bought raffle tickets at {place}: {amount} in sales. The winner was the organiser's nephew for the third time.",
    victim: "Raffle players ({amount})",
    inspired: "Rigged raffles and fake prize draws at public events.",
    amount: [2_000_000, 10_000_000],
    clues: [
      { id: "drum", name: "Raffle drum", icon: "box", prop: "drum", slot: 0, desc: "The spinning raffle drum.", action: "Open it", finding: "A hidden pocket holds one ticket. The 'random' hand goes straight to it.", who: "C" },
      { id: "stubs", name: "Ticket stubs", icon: "ticket", prop: "paper", slot: 2, desc: "Torn ticket stubs.", action: "Rebuild them", finding: "The winning number was printed twice: once for sale, once for the pocket.", who: "C", lab: ["Raffle no. 004417", "Printed: twice", "Sold: never", "Batch B: 1 ticket", "Owner: {C}", "Draw: live", "Winner: {H}"] },
      { id: "prize", name: "Prize car", icon: "key", prop: "car", slot: 1, desc: "The prize car.", action: "Check the papers", finding: "Still registered to {C}. 'Won' three times, never handed over.", who: "C" },
      { id: "mic", name: "Microphone", icon: "megaphone", prop: "mic", slot: 4, desc: "The MC's microphone.", action: "Dust for prints", finding: "The MC read the number he was handed, not the one drawn.", who: "W", lab: "prints" },
    ],
    culprit: { role: "Organiser", motive: "Rigs every draw.", alibi: "Says luck runs in families.", background: "Runs raffles across {state}.", quote: "Luck is luck!", lies: [["The draw is completely random.", "drum", "Random with a little help."], ["My nephew won fair and square.", "stubs", "He won the ticket I printed for him."]] },
    helper: { role: "Three-time 'winner'", motive: "Poses for photos.", alibi: "Says he's blessed.", background: "Has never driven the car.", quote: "Some people are just lucky.", says: ["Uncle takes the keys back after every photo.", "He gives me ₦20,000 to smile."] },
    witness: { role: "Event MC", motive: "Announced the winner.", alibi: "Read the ticket he was given.", background: "Hosts events in {city}.", quote: "I announce, I don't draw.", says: ["The organiser hands me the ticket. The drum is for show.", "He says the crowd likes the spinning."] },
    solution: "{C} hid a specially printed ticket in a pocket of the raffle drum so his nephew always 'won', keeping both the ticket money and the car. The rigged drum, the double-printed ticket and the car's papers proved it.",
  },
  {
    id: "relabelled",
    category: "alley",
    kinds: ["market", "factory", "mall", "craft"],
    titles: ["Old {product}, New Labels", "Expired at {place}", "The Relabelling Room"],
    hook: "Shoppers in {city} fall sick after buying 'fresh' {product}. The labels look brand new.",
    briefing: "Expired {product} worth {amount} was bought cheap, relabelled with new dates in a back room at {place}, and sold as fresh.",
    victim: "Shoppers in {city}",
    inspired: "Expired goods relabelled with new dates and sold as fresh.",
    amount: [1_000_000, 9_000_000],
    clues: [
      { id: "labels", name: "Label printer", icon: "stamp", prop: "laptop", slot: 0, desc: "A small label printer and laptop.", action: "Check the print jobs", finding: "5,000 labels with dates two years later than the real ones.", who: "C" },
      { id: "cartons", name: "Cartons", icon: "box", prop: "crate", label: "{product}", slot: 1, desc: "Cartons of {product}.", action: "Peel a label", finding: "Under the new label, the old date: expired eight months ago.", who: "C" },
      { id: "invoice", name: "Invoice", icon: "receipt", prop: "paper", slot: 2, desc: "A torn invoice.", action: "Rebuild it", finding: "Bought from a dump dealer as 'expired, for disposal'.", who: "H", lab: ["Goods: {product}", "Status: EXPIRED", "For disposal", "Price: scrap", "Buyer: {C}", "Delivered: {place}", "Cash"] },
      { id: "cctv", name: "Back-room camera", icon: "cctv", prop: "cctv", slot: 3, desc: "A camera in the back room.", action: "Play the night footage", finding: "Workers peeling and sticking labels while {C} watches.", who: "C" },
    ],
    culprit: { role: "Wholesaler", motive: "Sells expired goods as fresh.", alibi: "Says his goods come straight from the factory.", background: "Big wholesaler at {place}.", quote: "Fresh from factory!", lies: [["My goods are fresh from the factory.", "cartons", "Fresh… from a different year."], ["I don't print any labels.", "labels", "Only small small labels."]] },
    helper: { role: "Dump dealer", motive: "Sold expired goods.", alibi: "Says he sells 'for disposal'.", background: "Buys expired stock from shops.", quote: "I sell scrap.", says: ["He buys every expired carton I have.", "He told me 'don't write expired on the invoice'. I did anyway."] },
    witness: { role: "Shopper", motive: "Got sick.", alibi: "Bought on Monday.", background: "Lives in {city}.", quote: "It tasted strange!", says: ["The label was shiny, too shiny.", "There was another date under it."] },
    solution: "{C} bought expired {product} as scrap, had it relabelled with new dates in a back room at {place} and sold it as fresh. The label printer, the peeled cartons and the invoice proved it.",
  },
  {
    id: "livestock",
    category: "alley",
    kinds: ["market", "farm", "reserve", "motorpark"],
    titles: ["The Re-Tagged Goats of {place}", "Whose Ram Is This?", "Stolen Herd at {place}"],
    hook: "Goats stolen from a farm near {city} turn up at {place} with fresh ear tags.",
    briefing: "{V}'s herd vanished at night. Two days later, animals with the farm's ear notch were on sale at {place}, worth {amount}.",
    victim: "{V} (a herd worth {amount})",
    inspired: "Stolen livestock re-marked and resold at big markets.",
    amount: [1_000_000, 6_000_000],
    clues: [
      { id: "goat", name: "Tagged goat", icon: "steps", prop: "goat", slot: 0, desc: "A goat with a shiny new ear tag.", action: "Look under the tag", finding: "The V-notch {V}'s farm cuts in every ear.", who: "C" },
      { id: "tags", name: "Tag box", icon: "key", prop: "crate", label: "TAGS", slot: 1, desc: "A box of new ear tags.", action: "Check the receipt", finding: "Bought the morning after the theft, by {C}.", who: "C" },
      { id: "lorry", name: "Livestock lorry", icon: "truck", prop: "van", label: "LIVESTOCK", slot: 4, desc: "The lorry that brought them.", action: "Check the tyres", finding: "Red farm mud from near {V}'s village.", who: "H" },
      { id: "permit", name: "Market permit", icon: "stamp", prop: "paper", slot: 2, desc: "The dealer's permit.", action: "Check it", finding: "Says 'raised on my own farm'. {C} has no farm.", who: "C" },
    ],
    culprit: { role: "Livestock dealer", motive: "Resold the stolen herd.", alibi: "Says he raised them himself.", background: "Sells at {place} every week.", quote: "These animals know my voice!", lies: [["I raised these animals on my own farm.", "permit", "My cousin's farm. Somebody's farm."], ["The tags were already on.", "tags", "I put them. Tidy animals sell better."]] },
    helper: { role: "Lorry driver", motive: "Moved them at night.", alibi: "Says he came from another town.", background: "Hires out his lorry.", quote: "I drive what they load.", says: ["He hired me for a night trip to the village.", "He said they were 'a gift from an in-law'."] },
    witness: { role: "Farmer", motive: "Lost the herd.", alibi: "Was asleep.", background: "Raises animals for school fees.", quote: "I know my animals one by one.", says: ["Every animal of mine has a notch in the left ear.", "Lift the tag and see."] },
    solution: "{C} had a lorry take {V}'s herd at night, clipped new tags over the farm's ear notches and sold them at {place} with a false permit. The hidden notches, the tag receipt and the permit proved it.",
  },
  {
    id: "copper",
    category: "heists",
    kinds: ["square", "bridge", "campus", "stadium", "motorpark", "park"],
    titles: ["Lights Out at {place}", "The Copper Thieves", "Who Stripped the Transformer?"],
    hook: "{place} goes dark. The transformer is still on its pole, but its copper and oil are gone.",
    briefing: "The transformer serving {place} was gutted overnight: {amount} of copper coils and oil taken. Only someone trained could switch it off safely.",
    victim: "Everyone around {place}",
    inspired: "Repeated reports of transformers and cables vandalised for copper.",
    amount: [2_000_000, 9_000_000],
    clues: [
      { id: "ladder", name: "Company ladder", icon: "tool", prop: "ladder", slot: 1, desc: "A ladder against the pole.", action: "Check the markings", finding: "Signed out last night by {C}, a lineman.", who: "C" },
      { id: "copper", name: "Copper scraps", icon: "power", prop: "coil", slot: 0, desc: "Bits of copper wire.", action: "Trace the buyer", finding: "A scrap dealer bought 200 kg of transformer copper at dawn.", who: "H" },
      { id: "order", name: "Work order", icon: "scroll", prop: "paper", slot: 2, desc: "A torn work order.", action: "Rebuild it", finding: "A fake 'maintenance' order to switch off this transformer, written by {C}.", who: "C", lab: ["Transformer: {place}", "Switch off: 11 pm", "Reason: maintenance", "Crew: {C}", "Supervisor: (blank)", "Hours: 6", "Ref: none"] },
      { id: "oil", name: "Oil jerrycan", icon: "fuel", prop: "tank", slot: 4, desc: "A jerrycan of transformer oil.", action: "Dust for prints", finding: "Prints of {C} and a keke driver.", who: "C", lab: "prints" },
    ],
    culprit: { role: "Lineman", motive: "Sold the copper.", alibi: "Says he was at home.", background: "Works for the power company.", quote: "I fix transformers!", lies: [["I never came near {place} last night.", "ladder", "I borrowed the ladder to check something."], ["The switch-off was approved.", "order", "I approved it. Myself."]] },
    helper: { role: "Scrap dealer", motive: "Bought the copper.", alibi: "Says he buys from anybody.", background: "Owns a scrap yard in {city}.", quote: "Copper is copper.", says: ["He sold me 200 kg before sunrise.", "He wanted cash and said it was 'old company stock'."] },
    witness: { role: "Night watchman", motive: "Saw the crew.", alibi: "Guards a nearby shop.", background: "Works nights.", quote: "I saw torchlight on the pole.", says: ["Only one man in uniform, and a keke.", "No company van came."] },
    solution: "{C} wrote a fake maintenance order, switched off the transformer at {place}, stripped its copper and oil and sold them to a scrap dealer. The ladder, the work order and the dealer's purchase proved it.",
  },
  {
    id: "fake-drugs",
    category: "alley",
    kinds: ["market", "mall", "factory", "motorpark"],
    titles: ["Chalk Tablets at {place}", "The Fake Medicine Shelf", "Pills Without Medicine"],
    hook: "Malaria tablets from {place} don't work. A lab says they're mostly chalk.",
    briefing: "Patients in {city} kept getting worse on tablets bought at {place}. Lab tests found chalk and starch. Fake drugs worth {amount} are in circulation.",
    victim: "Patients in {city}",
    inspired: "Fake and substandard medicines sold in open markets.",
    amount: [2_000_000, 15_000_000],
    clues: [
      { id: "carton", name: "Medicine carton", icon: "pill", prop: "crate", label: "TABLETS", slot: 0, desc: "A sealed carton of tablets.", action: "Test the tablets", finding: "Chalk, starch and yellow colouring. No medicine at all.", who: "C" },
      { id: "labels", name: "Label sheets", icon: "scroll", prop: "paper", slot: 2, desc: "Torn sheets of pack labels.", action: "Rebuild the sheet", finding: "20,000 copies of a real brand's labels, paid for by {C}.", who: "C", lab: ["Malaria tabs labels", "Copy of real brand", "Expiry: +3 years", "Qty: 20,000", "Printer: {city}", "Paid: {C}", "Cash"] },
      { id: "press", name: "Tablet press", icon: "tool", prop: "panel", slot: 1, desc: "A small hand tablet press.", action: "Dust for prints", finding: "Prints of {H}, who works the press at night.", who: "H", lab: "prints" },
      { id: "phone", name: "Shop phone", icon: "phone", prop: "phone", slot: 4, desc: "The shop phone.", action: "Read the messages", finding: "'Send 50 more cartons. Same chalk.' From {C}.", who: "C" },
    ],
    culprit: { role: "Medicine dealer", motive: "Sells fake tablets.", alibi: "Says his stock is imported.", background: "Runs a busy medicine shop at {place}.", quote: "Original! Imported!", lies: [["Every carton comes sealed from abroad.", "carton", "The seal is from… here."], ["I don't print labels.", "labels", "Only for 'replacement'."]] },
    helper: { role: "Press worker", motive: "Makes the tablets.", alibi: "Says he makes 'sweets'.", background: "Works nights in a back room.", quote: "I thought they were sweets!", says: ["He gives me chalk powder and yellow colour.", "He says 'make them look like the real ones'."] },
    witness: { role: "Pharmacist", motive: "Tested the tablets.", alibi: "Works at the general hospital.", background: "Has seen many fakes.", quote: "Medicine that does nothing is poison.", says: ["Three patients brought the same brand in one week.", "The real brand has a different shade of yellow."] },
    solution: "{C} sold chalk tablets pressed in a back room and packed in copied labels at {place}. The tested tablets, the label sheets and his messages proved it.",
  },
  {
    id: "booking-scam",
    category: "vip",
    kinds: ["hotel", "lake", "beach", "hills", "falls", "reserve"],
    titles: ["The Ghost Booking at {place}", "No Room at {place}", "Paid For, Never Booked"],
    hook: "Visitors arrive at {place} with confirmed bookings. The bookings don't exist.",
    briefing: "Dozens of holidaymakers paid an 'official agent' for trips to {place}. {amount} paid; not one booking was real.",
    victim: "Holidaymakers ({amount})",
    inspired: "Fake booking pages and agents selling trips to popular tourist spots.",
    amount: [1_500_000, 10_000_000],
    clues: [
      { id: "page", name: "Booking page", icon: "laptop", prop: "laptop", slot: 0, desc: "The 'official' booking page.", action: "Check the website", finding: "Copied photos of {place}, registered last month to {C}.", who: "C" },
      { id: "confirm", name: "Booking slips", icon: "receipt", prop: "paper", slot: 2, desc: "Printed 'confirmations'.", action: "Rebuild one", finding: "Same booking number on every slip. The real desk has no record.", who: "C", lab: ["Booking: CONFIRMED", "{place}", "Ref: 00123", "Paid: in full", "Agent: {C}", "No refunds", "(fake)"] },
      { id: "phone", name: "Agent's phone", icon: "phone", prop: "phone", slot: 4, desc: "The 'agent' phone line.", action: "Trace it", finding: "Registered to {H}, who 'answers calls' for a fee.", who: "H" },
      { id: "desk", name: "Front desk", icon: "list", prop: "counter", slot: 1, desc: "The real booking desk.", action: "Check the register", finding: "No bookings from any of the victims.", who: "W" },
    ],
    culprit: { role: "'Official agent'", motive: "Sold fake bookings.", alibi: "Says the bookings 'got mixed up'.", background: "Advertises on social media.", quote: "Small mix-up, I'll refund!", lies: [["I'm the official agent for {place}.", "page", "Official… on Instagram."], ["Every booking was confirmed.", "confirm", "Confirmed by me."]] },
    helper: { role: "Call handler", motive: "Answered the phone line.", alibi: "Says it was a job.", background: "A student.", quote: "I just pick calls.", says: ["He gave me a script: 'Yes, your booking is confirmed'.", "He paid me ₦1,000 a day."] },
    witness: { role: "{staff}", motive: "Turned guests away.", alibi: "Works the real desk.", background: "Sees disappointed guests every week.", quote: "We never heard of this agent!", says: ["Families come with printed slips and cry.", "The slips use an old photo of our gate."] },
    solution: "{C} sold trips to {place} through a copied website and a hired phone line, taking full payment for bookings that never existed. The website, the slips and the phone line proved it.",
  },
  {
    id: "exam-leak",
    category: "cyber",
    kinds: ["campus", "office"],
    titles: ["The {place} Leak", "Answers for Sale", "Special Centre at {place}"],
    hook: "Exam answers were on WhatsApp an hour before the paper at {place}. Someone sold them.",
    briefing: "An exam paper at {place} leaked an hour early. Candidates paid {amount} in total for 'expo'.",
    victim: "Honest candidates at {place}",
    inspired: "Exam 'expo' leaks and 'special centres'.",
    amount: [500_000, 4_000_000],
    clues: [
      { id: "safe", name: "Exam safe", icon: "key", prop: "safe", slot: 1, desc: "The safe where papers were kept.", action: "Check the log", finding: "Opened at 6 am, two hours early, with {C}'s key.", who: "C" },
      { id: "phone", name: "Phone with photos", icon: "camera", prop: "phone", slot: 0, desc: "A phone found near the exam hall.", action: "Check the photos", finding: "Photos of the exam paper taken at 6:12 am.", who: "C" },
      { id: "group", name: "WhatsApp printout", icon: "scroll", prop: "paper", slot: 2, desc: "A printout of a WhatsApp group.", action: "Rebuild it", finding: "'Expo ₦5,000. Pay to {H}.' Posted at 7 am.", who: "H", lab: ["'EXPO' group", "Paper: today", "Price: ₦5,000", "Pay to: {H}", "Sent: 7:02 am", "Members: 300", "Admin: {C}"] },
      { id: "hall", name: "Exam hall door", icon: "steps", prop: "door", slot: 4, desc: "The exam hall door.", action: "Dust for prints", finding: "Only the invigilators' prints. The leak came from the safe, not the hall.", who: "W", lab: "prints" },
    ],
    culprit: { role: "Exams officer", motive: "Sold the paper.", alibi: "Says he opened the safe on time.", background: "Holds the safe key.", quote: "Our exams are very secure.", lies: [["I opened the safe at the right time.", "safe", "6 am is… morning."], ["I never photographed the paper.", "phone", "I took it for… records."]] },
    helper: { role: "Student 'agent'", motive: "Collected the money.", alibi: "Says he was in class.", background: "Popular on campus.", quote: "I don't know anything about expo.", says: ["The officer sends me the photos.", "We share the money 70–30."] },
    witness: { role: "Invigilator", motive: "Noticed the answers.", alibi: "Was in the hall.", background: "Has invigilated for years.", quote: "Twenty scripts had the same mistake.", says: ["The same wrong answer in twenty scripts.", "That mistake was on the expo, not in any textbook."] },
    solution: "{C} opened the exam safe at {place} two hours early, photographed the paper and had {H} sell it on WhatsApp. The safe log, the photos and the group printout proved it.",
  },
  {
    id: "staged-burglary",
    category: "vip",
    kinds: ANY_IN.concat(["craft", "market"]),
    titles: ["The Burglary That Wasn't", "Inside Job at {place}", "Who Broke In at {place}?"],
    hook: "A break-in at {place} cost {amount} in stock. But the broken window was broken from the inside.",
    briefing: "{V} reported a burglary at {place}: {amount} of stock gone, and an insurance claim filed the next morning.",
    victim: "The insurance company ({amount})",
    inspired: "Staged burglaries used for insurance claims.",
    amount: [3_000_000, 20_000_000],
    clues: [
      { id: "glass", name: "Broken glass", icon: "steps", prop: "smashed", slot: 0, desc: "Broken window glass.", action: "Study the glass", finding: "The glass fell outward. It was broken from inside.", who: "C" },
      { id: "stock", name: "'Stolen' stock", icon: "box", prop: "crate", label: "STOCK", slot: 1, desc: "Stock found in a nearby store.", action: "Check the serials", finding: "Moved there by {C} the day before the 'burglary'.", who: "C" },
      { id: "claim", name: "Insurance claim", icon: "scroll", prop: "paper", slot: 2, desc: "The insurance claim.", action: "Rebuild it", finding: "Filed at 7 am, an hour before the police were called.", who: "C", lab: ["Claim: burglary", "Value: {amount}", "Filed: 7:00 am", "Police called: 8:05", "Claimant: {C}", "{place}", "Policy: new"] },
      { id: "cctv", name: "Camera", icon: "cctv", prop: "cctv", slot: 3, desc: "The camera over the door.", action: "Play the night", finding: "Unplugged at 10 pm from inside. Last person seen: {C}.", who: "C" },
    ],
    culprit: { role: "{staff}", motive: "Wanted the insurance money.", alibi: "Says he locked up at 6 pm.", background: "Took out a new policy last month.", quote: "Thieves have finished me!", lies: [["Thieves broke in through the window.", "glass", "The thieves were… inside."], ["The stock was stolen.", "stock", "It's resting in another store."]] },
    helper: { role: "Watchman", motive: "Was sent home early.", alibi: "Says the boss gave him a day off.", background: "Guards {place}.", quote: "Oga said go home.", says: ["He gave me the night off. First time ever.", "He said 'take this ₦10,000, enjoy yourself'."] },
    witness: { role: "Neighbour", motive: "Heard the glass break.", alibi: "Lives next door.", background: "Light sleeper.", quote: "It was at 4 am, and the door was open!", says: ["The door was open before the glass broke.", "A car drove off with its lights off."] },
    solution: "{C} moved the stock from {place} to another store, sent the watchman home, unplugged the camera and broke the window from inside, then claimed {amount} on a new policy. The glass, the stock and the claim times proved it.",
  },
  {
    id: "boat-overcharge",
    category: "heists",
    kinds: ["waterfront", "lake", "beach", "bridge"],
    titles: ["The Missing Boat Fees of {place}", "Overloaded at {place}", "The Ferry Fare Fiddle"],
    hook: "Boats at {place} leave full every trip. The ferry office says half the seats were empty.",
    briefing: "Boat operators at {place} collected fares for full boats but declared half, pocketing about {amount} this year, and overloaded boats to do it.",
    victim: "The ferry cooperative at {place} ({amount}) and passengers' safety",
    inspired: "Reports of overloaded boats and under-declared fares on Nigeria's waterways.",
    amount: [1_000_000, 7_000_000],
    clues: [
      { id: "manifest", name: "Passenger manifest", icon: "list", prop: "paper", slot: 2, desc: "The trip manifest.", action: "Count the names", finding: "18 names declared; the boat carried 34 people that trip.", who: "C" },
      { id: "jackets", name: "Life jackets", icon: "drop", prop: "lifebuoy", slot: 1, desc: "The boat's life jackets.", action: "Count them", finding: "Only 18 jackets for 34 passengers. Dangerous.", who: "C" },
      { id: "boat", name: "The boat", icon: "truck", prop: "boat", slot: 0, desc: "The ferry boat.", action: "Check the load line", finding: "Water marks far above the safe line: overloaded many times.", who: "H" },
      { id: "cash", name: "Fare bag", icon: "cash", prop: "chest", slot: 4, desc: "The fare bag.", action: "Count it", finding: "Cash for 34 fares, while the office got money for 18.", who: "C" },
    ],
    culprit: { role: "Boat captain", motive: "Pockets the extra fares.", alibi: "Says he carries only what's declared.", background: "Runs the busiest boat at {place}.", quote: "My boat no dey overload!", lies: [["I carried exactly 18 passengers.", "manifest", "Eighteen… and small small extra."], ["Every passenger had a life jacket.", "jackets", "Some people sat on their jackets."]] },
    helper: { role: "Boat boy", motive: "Packed the boat.", alibi: "Says he follows orders.", background: "Loads passengers.", quote: "Oga says 'pack them well'.", says: ["He tells me to add people after the office counts.", "He says the extra money is 'our own'."] },
    witness: { role: "Cooperative clerk", motive: "Noticed the gap.", alibi: "Counts fares in the office.", background: "Keeps the cooperative books.", quote: "Full boats, half money!", says: ["The boats sit low in the water.", "Passengers complain they stand all the way."] },
    solution: "{C} declared half his passengers at {place}, packed extra people into the boat without life jackets and kept their fares. The manifest, the jackets and the fare bag proved it.",
  },
  {
    id: "phone-flash",
    category: "cyber",
    kinds: ["market", "mall", "motorpark", "square", "campus"],
    titles: ["The Phone Doctors of {place}", "New IMEI, Old Phone", "Flashed at {place}"],
    hook: "Phones stolen around {city} reappear for sale with brand-new IMEI numbers. All passed through {place}.",
    briefing: "Forty stolen phones, worth {amount}, were traced to buyers with new IMEI numbers. Every one went through a repair stall at {place}.",
    victim: "Phone owners in {city}",
    inspired: "Stolen phones being 'flashed' with new IMEI numbers before resale.",
    amount: [1_500_000, 8_000_000],
    clues: [
      { id: "laptop", name: "Flashing laptop", icon: "laptop", prop: "laptop", slot: 0, desc: "A laptop wired to three phones.", action: "Check the software", finding: "IMEI-changing software, used 200 times this year.", who: "C" },
      { id: "box", name: "Box of phones", icon: "phone", prop: "phone", slot: 1, desc: "A box of phones with the backs off.", action: "Check the serials", finding: "Eleven phones on the stolen list, original stickers scratched off.", who: "C" },
      { id: "book", name: "Job book", icon: "scroll", prop: "paper", slot: 2, desc: "The stall's job book.", action: "Rebuild the torn pages", finding: "'Reset' instead of 'screen' on every stolen phone, with a buyer's number.", who: "C", lab: ["Tecno: reset", "Itel: reset", "Samsung: screen", "Infinix: reset", "Buyer: 080…", "Paid: cash", "{C}"] },
      { id: "cctv", name: "Stall camera", icon: "cctv", prop: "cctv", slot: 3, desc: "A camera over the counter.", action: "Play last night", finding: "{H} drops a bag of phones after closing time.", who: "H" },
    ],
    culprit: { role: "Repair stall owner", motive: "Flashes stolen phones.", alibi: "Says he only fixes screens.", background: "Runs a busy stall at {place}.", quote: "Screens, my brother. Only screens.", lies: [["I only fix screens, never software.", "laptop", "Sometimes I 'update' them."], ["Every phone here belongs to a customer.", "box", "The okada man brings them. I don't ask."]] },
    helper: { role: "Okada rider", motive: "Brings the stolen phones.", alibi: "Says he only carries passengers.", background: "Rides near {place}.", quote: "I just carry load.", says: ["He pays me ₦2,000 a trip for 'repairs'.", "The bag rattles. I don't look inside."] },
    witness: { role: "Apprentice", motive: "Saw too much.", alibi: "Leaves at six.", background: "Learning the trade.", quote: "I only change screen guards.", says: ["Oga locks the back room before I go.", "He says the laptop is 'not for small boys'."] },
    solution: "{C} wrote new IMEI numbers onto stolen phones at his stall at {place}, with {H} bringing the phones at night. The laptop log, the box of phones and the job book proved it.",
  },
];

/** Where people stand at each slot, as % of the scene. */
export const SLOTS: [number, number][] = [
  [46, 58],
  [66, 70],
  [32, 80],
  [86, 22],
  [58, 86],
];

export { ANY_IN, ANY_OUT };
