# Naija Detective

A mobile-first detective game set across Nigeria, from Lagos to Kano, styled like a light-mode game launcher (big swipeable case cards, a raised “+” dock, and a detail sheet under each 3D scene). Open a live crime scene, drag to look around the low-poly 3D set, tap the glowing hotspots to bag clues, run lab analysis, catch suspects lying, then make an arrest for Panti CID.

```bash
npm install
npm run dev   # http://localhost:3100
```

## Play on your phone (claude.ai artifact)

The game is published as a private claude.ai artifact: https://claude.ai/artifact/SqZf6mfG9T1ajNERQnCYhh

```bash
npm run build:artifact -- <out.html>   # one self-contained page (React from cdnjs, everything else inlined)
```

Republish that file to the same artifact URL, with capabilities `{db: {rules: [{path: "chat", read: "view", write: "owner"}, {path: "chat/{self}", write: "interact"}, adsubmit…, adlive…, adsettings…, {path: "board", read: "view", write: "owner"}, {path: "board/{self}", read: "view", write: "interact"}, {path: "adstats", read: "view", write: "owner"}, {path: "adstats/{self}", read: "view", write: "interact"}, {path: "hunts", read: "view", write: "admin"}]}, user: {}, sample: {}, room: {}}` (the full list is in the published artifact). `board/<id>` is each player's public leaderboard row and `adstats/<id>` their poster view and tap counts`. Friends you share the game with need **Editor** access (or Contributor, on a team plan) to post in the chat or keep a cloud save; viewers can only read. Inside the artifact, progress also saves to the player's private `data/users/<id>/save` document (`src/lib/cloudSave.ts`), so it follows them between devices. Outside claude.ai that sync does nothing.

## Host it on Cloudflare (with its own database and storage)

On Cloudflare the game runs on your own account, not on claude.ai.

| Part | Where it lives |
| --- | --- |
| The game page | `cloudflare/index.html`, built by `npm run build:cloudflare` |
| The backend | `worker/index.ts`, one Worker |
| Database: saves, leaderboard, chat, posters, hunts, stats, sign-ups | **D1** `crimelife` |
| Poster images | **R2** bucket `crimelife-media`, served at `/media/...` (optional; until R2 is on they stay in D1) |
| Co-op rooms, who's online, live list updates | **Durable Objects** (`Room`) |
| Senior Inspector questions | Claude API, if you set `ANTHROPIC_API_KEY`; otherwise scripted tips |
| Install on the home screen, offline start | `cloudflare/manifest.webmanifest`, `cloudflare/icons/`, `cloudflare/sw.js` (from `artifact/sw.js`) |
| Reminders | Web Push, sent by the Worker's **cron trigger** (every minute) |
| Poster payments | **Paystack**, if you set `PAYSTACK_SECRET_KEY`; otherwise advertisers pay you directly |

`src/lib/cfRuntime.ts` gives the game the same small `window.claude` interface it uses on claude.ai, backed by the Worker. That means the rest of the game is unchanged.

**Players:** each one gets an anonymous id and secret token, kept in their browser. Sign-up asks for **full name and email**. They're stored privately in `signups/<player>`, and only the player and the owner can read them. The owner sees the list, with **Copy emails** and **Download CSV**, in Ad manager.

**Player accounts:**
- **Sign-up:** asks for full name, email, password (8+ characters) and a detective name.
- **Sign-in:** with email and password on any device; the player's detectives come with them through the cloud save.
- **Storage:** passwords are stored only as salted PBKDF2-SHA-256 hashes (100,000 rounds) in D1 `accounts`. Each device signed in by email gets its own session in `sessions`.
- **Guessing:** sign-in allows 20 tries an hour per address and 10 an hour per email. Wrong email and wrong password get the same answer.
- **Profile → Account:** shows the email, Change password (which signs out other devices) and Sign out. Sign-out saves progress to the account, then clears it from the device, so shared phones are safe. Older players can add an email and password there.
- **Forgot password?** shows your support contact (set in Ad manager settings). You reset it in the Owner console, under "Reset a player's password", and send them the temporary one.

**Owner:** go to the game's address with **`#owner`** on the end (e.g. `https://your-game.example/#owner`) and sign in with the `ADMIN_KEY` password. Nothing in the game links there.

The **Owner console** shows player counts and sign-ups (Copy emails, Download CSV). From it you can open the Ad manager, remove leaderboard rows or chat, and ban or unban players. A ban stops posting, chat, leaderboard and co-op; they can still play alone. It also has test tools: +₦, +XP and Jump to General.

The Ad manager opens only from the Owner console. Players never see an owner sign-in.

**Home screen and reminders** (`src/lib/pwa.ts`, `src/components/AppSettings.tsx`):
- **Install:** Profile › App & data has "Add to home screen" (Android/Chrome) or the Safari steps (iPhone). Home shows a small install card once a player has closed a case. The page is kept for offline starts; `/api` is never cached.
- **Reminders:** players turn them on in Profile › App & data. On iPhone this works only from the home-screen app. A daily reminder goes out between 6pm and 9pm Nigerian time (Sunday: the tournament ends tonight; Monday: a new week started). In the Owner console, under **Reminders**, you can send your own message to everyone, turn the daily one off, and see how many phones each message reached.
- **How it works:** pushes carry no text. The phone wakes `sw.js`, which asks `/api/push/latest` what to show. Pushes are signed with the game's own VAPID key, which the Worker makes once and keeps in D1, so there is nothing to set up. The cron sends 40 a minute, within the free plan's limit of 50 outside requests a run. Phones that uninstalled are removed. Subscriptions are accepted only for the browsers' own push services (Google, Mozilla, Apple, Microsoft).
- **Lite mode** (`src/lib/lite.ts`): Profile › App & data. It shows drawn scenes instead of 3D and turns off the street recording. It switches on by itself when the phone's Data Saver is on, unless the player has chosen.
- Icons: edit `artifact/icon.svg`, then run `node artifact/make-icons.mjs`.

**Launch pack** (run by Bamdalas):
- **Privacy Policy and Terms of Use:** `cloudflare/privacy.html` and `cloudflare/terms.html`, at `/privacy` and `/terms`. They're linked from sign-up and the bottom of Profile. The contact line fills in from your **Support contact** in the Ad manager (via `/api/contact`), so set it. Have a lawyer look them over when you can.
- **Delete my account** (Profile › Account): asks for the password when there is one. It removes the player's saves, leaderboard row, chat, posters (live ones too), sign-up, reports, reminders and sessions. Payment records stay (tax law).
- **Report a problem** (Profile): reports land in the Owner console under **Reports from players**. Players also get a WhatsApp button when your support contact is a phone number.
- **Name and chat filter** (`src/lib/clean.ts`): refuses rude detective names at sign-up. The Worker masks insults and slurs (English, Pidgin, Yoruba, Igbo, Hausa) in chat and leaderboard names before they're stored, so a changed app can't skip it. Add words to the lists there.
- **Link previews:** `cloudflare/og.png` (from `artifact/og.svg`). Set the build variable **SITE_URL** (e.g. `https://naijadetective.ng`) so WhatsApp gets a full picture address.
- **Visitor counts:** Cloudflare › Web Analytics › add a site, copy the token, and set the build variable **CF_BEACON_TOKEN**.
- The cron also clears expired rate-limit counters (they hold IP addresses) every hour, and reports after a year.

**Paystack payments for posters** (`src/lib/pay.ts`, `worker/index.ts` › Paystack):
- **Turn it on:** `npx wrangler secret put PAYSTACK_SECRET_KEY` (use `sk_test_...` to try it, `sk_live_...` for real money). In the Paystack dashboard › Settings › API Keys & Webhooks, set the **Webhook URL** to `https://<your game>/api/pay/webhook`.
- **The advertiser's side:** after sending a poster they get **Pay ₦… now** (card, bank transfer or USSD on Paystack's page). It's also under My posters for any poster not yet paid. Afterwards Paystack sends them back to the game, which checks the payment and shows "Paid ✓ · being checked".
- **Your side:** the Ad manager marks each waiting poster "✓ Paid ₦… on Paystack" or "Not paid online". Approve as usual. Optional setting: **put posters paid online live straight away, without my review**. The bank-transfer instructions still show as another way to pay.
- **Safety:** the price is worked out by the Worker from your settings, never taken from the page. A payment counts only when Paystack confirms it, either by the verify call or by the webhook (checked with the HMAC-SHA512 signature), and only for exactly the right amount in naira. Paid status lives in the `payments` table, which players can't write to. If a poster is changed after paying so that it costs more, it isn't put up automatically and the Ad manager warns you. Refunds for rejected posters are done in your Paystack dashboard.

**Security:**
- Owner password: 10 wrong tries an hour from one address locks that address out.
- Player tokens: sent only in headers. Live rooms use one-minute, one-use tickets.
- Rate limits: on new players (30 an hour per address) and on Claude questions (per player, per address, and `ASK_DAILY_LIMIT` for the whole game, default 300 a day).
- Size limits and document quotas for each player.
- Poster images: they reach R2 only once the owner publishes them, so nobody can use the bucket for free hosting.
- Leaderboard: rows are capped to what the game can reach.
- Pages: images are served with `nosniff` and a locked-down CSP. The page sends security headers (`cloudflare/_headers`) and checks the CDN React files with SRI.

**One-time setup:**
```bash
npx wrangler login
npx wrangler secret put ADMIN_KEY         # your owner password
# the D1 database "crimelife" is created automatically on the first deploy
# poster images in R2 (optional): turn R2 on in the dashboard, run
#   npx wrangler r2 bucket create crimelife-media
# and put back the "r2_buckets" line in wrangler.jsonc
npx wrangler secret put ANTHROPIC_API_KEY # optional
npx wrangler secret put PAYSTACK_SECRET_KEY # optional: online poster payments
npm run build:cloudflare && npx wrangler deploy
```

**Deploying from Git** (Workers Builds): set **Build command** to `npm run build:cloudflare` and **Deploy command** to `npx wrangler deploy`.

**Local test:** copy `.dev.vars.example` to `.dev.vars`, then run `npx wrangler dev --test-scheduled`. The database, storage and rooms are simulated on your computer. To run the cron once: `curl "http://127.0.0.1:8787/cdn-cgi/handler/scheduled?cron=*+*+*+*+*"`.

## How it plays

- **Every scene is its own place.** No two cases share a set. Streets take the look of their region (`LOOK` in `three/world.ts`, chosen by `lookOf` in `three/sceneKits.ts`): Lagos painted shops; Kano and Ilorin earth walls with battlements, arched doors, neem trees and harmattan haze; Abuja glass towers and Aso Rock; Ibadan and Abeokuta rusty brown roofs and hills; the South and East bright balconies and red earth. Rooms have a `decor` style (office, luxury, studio, warehouse, hall, shop) with their own walls and lighting. Passers-by walk, pause, look around and turn, some carrying basins on their heads or talking on phones. Cars, danfos, kekes and okadas with riders drive past, the detective studies clues through the lens, the dog sniffs and trots, the lab tech's camera flashes, and generators and furnaces smoke.
- **Street-level realism from Street View.** Streets were checked against Google Street View of Computer Village, Balogun, Kano old city, Wuse (Abuja) and Aba. The details are rebuilt in our own low-poly art; no Google imagery is used. They include roadside kiosks with rusty zinc lean-tos, blue tarps and hanging sachets, open concrete gutters with plank crossings, worn roads with potholes, umbrella shade trees, jerrycans, plastic chairs and handcarts, and unfinished rooftops with steel rods. The North has kaftans and hijabs; Abuja has fenced compounds and grass verges (`streetside()` in `three/world.ts`).
- **Player posters (advertising).** Profile › Advertise lets anyone upload a poster of any size. It shrinks to fit the chosen banner (nothing is cut off), and they can resize it, drag it into place and pick the edge colour. They choose one of four sizes (big billboard, sign board, street banner, wall poster), each with its own shape and price, a city or nationwide, and 1–8 weeks, then see the price, a payment reference and the owner's payment instructions. The owner's **Ad manager** tab reviews submissions (Paid · approve / Reject), takes posters down, and sets prices and payment text. Approved posters appear on billboards, roadside sign boards, swaying street banners, poster walls and alley walls in that city's scenes (`lib/ads.ts`, `three/adSlots.ts`, `components/AdsSheet.tsx`). Every scene except the yacht has at least one slot in the starting camera view: streets get a billboard, sign board, street banner and poster walls; rooms get a framed wall poster; beach, hill and bridge scenes get a sign board (`addFeaturedAd` in `three/buildScene.ts`). Tapping a paid poster in a scene opens its details (`components/AdPopup.tsx`): the poster, a short description, a **Visit website** link (https only, checked by `cleanUrl`) and an optional **Chat on WhatsApp** button. Tapping an empty "Advertise here" slot opens the Advertise form. Empty slots show ordinary street posters or an "Advertise here" poster. On claude.ai posters always go to the shared database; the browser-only store is used only when running the dev server on this computer. No payment details pass through the game; payment is arranged offline.
- **Every state.** All 36 states and the FCT have cases. The 27 states without a city got their capital or best-known city on the travel map, each with a case inspired by a real kind of Nigerian incident: the 'snake swallowed ₦36M' clerk in Makurdi, ghost workers in Lokoja, the Kebbi rice pyramid, Bridgehead fake drugs, kpo-fire refineries, pipeline taps, Hajj seat scams, exam 'special centres' and more (`src/lib/content/statesNorth.ts`, `statesMiddle.ts`, `statesSouth.ts`). Names and details are invented; the case screen shows a 'True story' note (`inspiredBy`).
- **The detective walks to clues.** Tapping a green spot sends the detective over with his dog. He walks round props (cars, desks, stalls), bends to study the clue with his magnifier while the dog sniffs, and then the clue opens (`addCast` / `CastControl` in `three/buildScene.ts`, `walkTo` in `Scene3D`). Between clues they idle, look around and wander a few steps.
- **Bonus evidence.** Every scene hides three scraps of a torn photo as faint amber glints, away from the real clues (`bonusFor` in `src/lib/bonus.ts`, placed beside the scene's props). The detective walks over to pick each one up. Each pays ₦5,000 and 5 XP, once per scrap (`findBonus`, saved in `GameState.bonus`). The third completes the photo and gives a free lead: a statement you haven't broken yet and the clue to challenge it with.
- **Detectives from other branches (live co-op).** Everyone who opens the same case joins a live room for it (`src/lib/coop.ts`, the artifact's `room` capability, named room `case.<id>`). Each player's presence carries their name, branch (the city they picked), look, the clue they're studying and the clues they've found. Other detectives walk the scene in their own coats with name tags, head to whatever their player is inspecting and crouch over it (`addCrew` / `CrewControl` in `three/buildScene.ts`, the `crew` prop on `Scene3D`). Toasts say who joined, who found something and who picked up a scrap. A blue initial badge marks clues a partner found that you haven't. The case details list everyone on the case with their counts. Nothing is stored, and what others send is cleaned and treated as display text only. In the dev build, tabs on the same computer link over a BroadcastChannel instead.
- **20 cases in every state** (`src/lib/content/stateGames.ts`, `statePacks.ts`, `storylines.ts`): a generator tops every state outside Lagos up to 20 cases, 750 cases in all.
  - **State packs:** each of the 36 states has one, with 8–11 real famous places (Olumo Rock, Zuma Rock, Obudu, Yankari, Idanre Hills, Kurmi Market, Tinapa…), local products, name pools, its official nickname and colours.
  - **Storylines:** 20 non-violent ones, including fake alerts, rigged scales, ticket rackets, esusu collapses, replica swaps, card cloning, fake jobs, diverted relief, diesel theft, double sales, rigged raffles, relabelled goods, re-tagged livestock, copper theft, fake drugs, ghost bookings, exam leaks, staged burglaries, ferry fare fiddles and phone flashing.
  - **Mixing:** each storyline is set at a fitting place in the state, with local names and products. Every place type has its own scene, from markets and motor parks to palaces, rocks, waterfalls, lakes, beaches, campuses, stadiums, museums, hotels and factories.
  - **Same every time:** the cases are deterministic, so saves and co-op rooms always agree, and they're built in the browser, so they add only about 80 KB.
- **State look:** Home shows a banner in the chosen state's colours with its nickname and famous places (`StateBanner.tsx`), and travelling to a city plays a short welcome (`TravelWelcome`).
- **Design your detective** (`src/components/LookEditor.tsx`, parts and face codes in `src/lib/looks.ts`): Profile › Edit my look lets players choose skin, 8 hairstyles, hair colour, 12 hats and extras, extra colour, 10 outfits, mood and background. Many items unlock by rank, from Police blue at Corporal up to the gold background at General. The look is saved as a short face code (`f1-…`) on the profile. It shows on the leaderboard and in co-op, and the player's **3D detective wears it** in every scene (`detectiveLook`); other branches' detectives do too.
- **Rank unlocks** (`src/lib/unlocks.ts`, shown on Profile and on the promotion screen):

  | Rank | Unlock | What it does |
  | --- | --- | --- |
  | Corporal | 🌙 Night Shift | Switch any scene to night (`nightKit`) |
  | Sergeant | 🔎 Eagle Lens | Brighter bonus glints and a "scraps left" counter |
  | Inspector | 🎡 Lucky Hands | A second daily spin |
  | ASP | 🧪 Lab Express | Instant lab scans |
  | DSP | 🛡️ Squad Leader | +50% squad bonus |
  | Commissioner | 🥇 Gold Frame | Gold frame on the leaderboard |
  | Lieutenant | 🎖️ Army Kit | Army outfits |
  | Captain | 🍲 Officer's Mess | Double streak rewards |
  | General | 👑 Living Legend | Gold portrait background |
- **Favourites:** the heart on a case screen adds it to "❤️ Your favourites" on Home (`GameState.favorites`).
- **Lucky Spin** (`src/components/LuckySpin.tsx`, prizes in `src/lib/spin.ts`): a daily prize wheel paying ₦2k–₦100k or XP, from the Daily card.
- **Confetti** (`src/lib/confetti.ts`) for arrests, badges, finished bonus sets, the daily challenge, spin wins and a new look.
- **Sponsored hunts** (`src/components/HuntModal.tsx`, `SponsoredRow.tsx`, data in `lib/ads.ts`):
  - **Signing up:** an advertiser ticks "Add a sponsored clue hunt" on their poster (+₦20k a week, set in the Ad manager) and gives an offer, a code and 3–8 tokens.
  - **On approval:** a `hunts/<id>` document is created, set in an outdoor scene in their city (`lib/huntCase.ts`).
  - **Playing:** players open it from "🎯 Sponsored hunts" on Home. The sponsor's poster fills every board of its size (`setSponsor` in `three/adSlots.ts`), and gold tokens with the brand's initial are hidden around the scene. The detective walks to each one. Finding them all pays ₦10k and 10 XP, with confetti, and shows the offer, the code (Copy), the website and WhatsApp.
  - **Stats:** opens and unlocks are counted under `adstats` key `h<id>` and shown on the advertiser's poster.
  - **Codes:** the code is the same for everyone and can be read by anyone who can open the game.
- **Phone memory:**
  - Card thumbnails stop rendering while a live scene is open (`setLiveScene` in `SceneThumb.tsx`), and the hidden thumbnail renderer frees its graphics memory when idle.
  - Canvas textures are capped at the 140 most recent (`TEX_LIMIT` in `three/world.ts`).
  - Live scenes use a lower pixel ratio on touch screens, and show the drawn scene if the phone takes the graphics context back.
  - The road audio decodes at 22 kHz (about 12 MB) and is freed 45 s after the last road stops.
  - If the phone still reloads the page, the game reopens the case you were in (`crime-life:open-case`, kept for 30 min).
  - A crash inside a scene shows "Wahala for the scene", with Try again and Back to cases (`ErrorBoundary.tsx`), instead of taking the game down.
- **Real road sound** (`src/lib/roadSound.ts`, audio in `src/lib/roadAudio.ts`): the owner's two street recordings were evened in loudness, joined and crossfaded into one seamless 2 min 17 s mono MP3 loop. It plays under the 38 scenes with a road and traffic (`hasRoad` in `three/buildScene.ts`) and follows the sound button. It also replaces the old synthesized traffic in the inspector calls, muffled through the window for Madam Ngozi's office, and the scene's road drops low while a call is on.
- **Real leaderboard** (`src/components/LeaderboardView.tsx`, `src/lib/board.ts`): every player keeps one public row (name, look, money, merit, cases closed, branch, badge count) that updates as they play. Rank by Money, Merit or Cases. The old made-up rivals are now a clearly labelled "Practice rivals (bots)" list.
- **Weekly tournament** (`src/lib/week.ts`, the "This week" tab of the leaderboard): weeks run Monday 12am to Sunday night, Nigerian time, and are named like `2026-W42`. The score is the merit earned that week. The tab shows the countdown, your weekly XP, a prize line the owner sets in the Ad manager ("Weekly tournament prize"), and last week's top 3 champions.
- **Share your win** (`src/lib/shareCard.ts`): after a correct arrest the verdict shows how fast the case was cracked and a "Share your win" button. It draws a 1080×1350 picture in the state's colours with the scene, a CASE CLOSED stamp, time, bounty and rank, and a link to the game. Phones that can share pictures open the share sheet; elsewhere the picture is saved and WhatsApp opens with the text.
- **Real "here now" counts** (`src/lib/useLiveCount.ts`): case cards and the case screen show how many detectives really have that case open, from the game's live room. The old drifting fake numbers are gone.
- **Co-op extras:** a **squad bonus** of ₦20k and 10 XP per other branch on the scene (up to 3) when you close a case together; **quick phrases** (the speech-bubble button) in English, Pidgin and the case region's language, sent as an index from a fixed list; and **Invite a detective from another branch**, which shares or copies the game link and case name.
- **Daily streak and challenge** (`src/components/DailyCard.tsx`, `checkIn` / `claimStreak` / `finishDaily`): collect ₦5k × your streak once a day (up to ₦35k at 7 days). The daily challenge is to find all 3 bonus scraps in today's case, for ₦30k and 15 XP.
- **Badges** (`src/lib/badges.ts`): 14 achievements measured from the save, such as First Arrest, Naija Tour, One Nigeria, Lie Breaker, Scrap Hunter, Squad Goals, No Dey Dull and Odogwu. They're shown with progress bars on Profile, with a toast when one is earned.
- **First-time tutorial:** a 6-step "How to play" card the first time a case is opened on a device.
- **Local languages** (`src/lib/local.ts`): the lead detective speaks a line of Hausa, Yoruba, Igbo or Pidgin for the case's region, with the English meaning underneath.
- **Poster stats and renewal:** views (each time a paid poster is put up in a scene) and taps are counted per player in `adstats/<id>` and summed for **My posters** and the **Ad manager**. Posters ending within 3 days, or already ended, get a **Renew** button that pre-fills a new submission with the same picture and details.
- **Bonus scraps fit the case:** a torn cash-van manifest at heists, a SIM-card wallet or phone receipt in cyber cases, an owambe invitation or aso-ebi receipt at VIP cases, a market ledger or danfo ticket in market cases (`bonusTheme`).
- **22 more state cases** (`src/lib/content/statesMoreNorth.ts`, `statesMoreSouth.ts`, built with the helpers in `caseKit.ts`): every city now has at least two cases, 120 in total. Among them are flashed stolen phones in Katsina, fake vaccination cards in Gusau, a bought "winning" fish at Argungu, painted Sallah rams in Sokoto, a phantom borehole in Gombe, fake naira at Monday Market, a rigged weighbridge in Makurdi, a wedding gift-account swap in Owerri, a plot sold three times in Warri, a hotel card skimmer in Yenagoa and wet cocoa in Akure.
- **Billboards by the dozen.** Streets have more roadside billboards and sign boards, and the bridge has billboards along its parapet. Advertisers choose how many boards (1–20). The price scales with the count, with 10% off for 5+ boards and 20% off for 10+, and a poster takes that many slots in every scene of its city.
- **Travel desk** (`src/components/CityPicker.tsx`): tap the city name at the top of Home to open a map of Nigeria. Pick a city's pin to see its landmarks, cases and how far it is, then travel there by road (danfo) or air with a short trip animation.
- **More Lagos** (`src/lib/content/lagosMore.ts`): four free Street cases. Diversion on Third Mainland has a cash van stopped on the bridge, a police diversion through the median, traffic crawling in contraflow and racing the other way, and Makoko and the lagoon below. The others are Oshodi Under-Bridge Hustle, Night Engines of Makoko and The Lekki Toll Shortfall.
- **Cities** (`src/lib/cities.ts`): switch between Lagos, Abuja, Kano, Ibadan, Port Harcourt, Ilorin, Abeokuta, Benin City, Aba and Enugu. Each city shows its own cases set in its real places, from Wuse Market, Kofar Mata dye pits, Mokola and Dugbe to Mile One, Oja Oba, Olumo Rock, Igun Street, Ariaria and Coal Camp (`src/lib/content/citiesNorth.ts`, `citiesWest.ts`, `citiesSouth.ts`), plus any Naija Files case set in that state. Every city has two free Street cases and one VIP case.
- **Detectives:** the front door has **Sign up** (pick a name and a look), **Sign in** (pick a detective you already made) and **Play as guest**. You can hop between them without finishing either. There are no passwords: detectives belong to whoever is signed in to Claude. **Profile → Switch detective** returns to the front door.
- **Game modes, unlocked by money and free-roam inside** (`src/lib/modes.ts`). A mode is open while your wallet is at or above its price. If a fine drops you below it, it locks again until you earn it back.

  | Mode | Price | Cases |
  | --- | --- | --- |
  | Street Mode | Free | 7 |
  | VIP Mode | ₦1M | 6 |
  | Heist Mode | ₦5M | 7 |
  | Naija Files (story) | ₦500k | 20 (the finale needs 12 closed first) |

- **Ranks:** XP from arrests (+120), caught lies (+20) and new sweep stars (+10) promotes you from Constable up the police ranks to Commissioner, then across to the Army, Lieutenant to General (`src/lib/ranks.ts`). **Five losses in a row** (wrong arrests or failed sweeps) demotes you one rank and fines **10% of your wallet**. A Constable can't drop lower, but still pays the fine.
- The game talks in Lagos slang and Pidgin ("Oya, enter!", "E DON CAST!", "Wahala dey!").
- **The Naija Files** (`src/lib/content/naijaFiles.ts`): 20 connected cases across Nigeria (Lagos, Kano, Enugu, Osun, Abuja, Plateau, Kaduna, Edo, Cross River, Taraba, Rivers, Oyo). In 1999 the Millennium Mint in Abuja is robbed at 00:07 and a Lagos watchmaker, Pa Tunji Aremu ("Baba Aago"), takes the blame. His Clockwork Club leaves brass cogs at harmless jobs to gather the proof, while copycats drop cogs to hide their own crimes. The finale at a Lagos cinema reveals the real thief.
- **Music:** every case plays an original background loop in its region's style, synthesized live with no recordings (`src/lib/music.ts`). Examples: Lagos Afrobeats, Sahel kalangu and reed (Kano, Kaduna), highlife (Enugu), fuji (Ibadan), juju (Ile-Ife), Calabar ekombi, Benin court drums and Plateau flute. Toggle it with the ♪ button in a case; it follows the mute button too.

- **3D scenes** (three.js, `src/three/`): a warm, matte Lagos look (inspired by Danfo Run): soft sun-and-sky light with neutral tone mapping and no glare (`render.ts`), gradient skies with clouds or stars, and painted street facades with shop signs, shutters, burglar bars, ACs, rust, water tanks and power cables. Rooms have two-tone painted walls, barred windows with curtains, fluorescent tubes and a ceiling fan. Danfos, stalls, umbrellas and kiosks are rebuilt with stripes, zinc and wood, and neon signs get a soft glow. Blocky people (with faces and ankara or striped outfits) and dogs have moving limbs, passers-by walk through street scenes, birds circle in daytime skies and dust floats indoors. Drag to turn about 65° either way (with momentum), look up and down, pinch or scroll to zoom, double-tap to zoom into a spot, and **Reset view** to come back. On phones, swipe down on a case to see the whole scene full-screen. Without WebGL the game falls back to the original drawn scenes.
- **Call for backup (the big “+” button, or the red siren in a case):**
  - **Call a Senior Inspector:** pick one of four (`INSPECTORS` in `src/lib/hints.ts`): Oga T (Lagos, warm and teasing), Madam Ngozi (Enugu, strict and fast), Alhaji Musa (Kano, calm and slow) or Captain Ebi (Port Harcourt, loud and dramatic). Each has their own greeting, sayings and voice settings (`src/lib/voice.ts` picks the best Nigerian or African-accented voice on the device, respells Pidgin for the speech engine, says naira amounts in words and varies pace per sentence). Captions “decrypt” as they speak; **Hear voice** previews each one. Paid tips (`src/lib/hints.ts`): *Where I go look?* ₦10k, *Wetin this evidence mean?* ₦20k, *Who dey lie?* ₦30k, *Just tell me who do am* (40% of the bounty). You can also type any question (₦5k “airtime”): on claude.ai Claude answers in character (the `sample` capability, fast tier) and is told never to name the culprit; elsewhere he gives the best scripted tip.
  - **Detectives’ Line** (`src/components/PlayerChat.tsx`): a *Help desk* where you post “🆘 I’m stuck on …” with the case attached, and a *Lounge* to chat. Messages live in the artifact’s shared `db` under `chat/<player id>` (everyone reads, each player writes only their own document, last 40 messages each). Who’s online comes from `room` presence. If no real detective answers a help request within ~8 s, a precinct **squad bot** (clearly labelled) replies with a tip. Outside claude.ai the chat runs in offline mode with just the squad bots.
- Each scene has 4 clue hotspots. Opening one bags it. Its forensic action reveals a lab result. Some actions are hands-on mini-games:
  - **Dust for prints:** drag to brush powder until the print appears.
  - **Torn documents:** tap two scraps to swap them until the page is whole.
- **Interrogation** (Suspects → Interrogate): for each statement choose **Truth**, **Doubt** (press for more detail) or **Lie!**, then present an analysed clue.
  - Breaking a lie pays ₦25,000.
  - Wrong evidence costs one of 3 patience shields. At zero, the suspect lawyers up.
  - Innocent suspects lie too, and their confessions often point at the real culprit.
- You can file an accusation after finding 3 clues.
  - Right suspect: + the case bounty (₦350k up to ₦10M for the finale), +0.2★.
  - Wrong suspect: Internal Affairs fines you ₦100,000 and −0.3★, and clears that suspect.
- **Timed Sweep** (closed cases only): find up to 6 listed objects in 60 seconds, and wrong taps cost 3 seconds. Every star pays ₦5,000 of hustle money on every sweep, and each new best star adds ₦15,000, so a broke detective can always earn back into a mode.
- Progress is saved in `localStorage` under `crime-life:v3` (per detective). Older single-detective saves are migrated, and dollar saves are converted to naira (×100). There is no reset button: progress can't be wiped by accident.

## Code map

| File | What it does |
| --- | --- |
| `src/app/page.tsx` | Screen state: tabs, search, category filter, open case, verdicts |
| `src/components/Header.tsx` | Menu, screen title with wallet + rating, squad-tips bell, search and the open-cases filter |
| `src/components/CaseCarousel.tsx` | Category text tabs, the big centred case carousel, and the small “similar cases” cards |
| `src/components/DetectiveRow.tsx` | "Live" squad avatars; tap one for a tip about the current case |
| `src/components/CategoryCarousel.tsx` | Category tiles that filter the case list |
| `src/components/CaseList.tsx` | Streamer-style case cards (row or stacked) |
| `src/components/CrimeSceneModal.tsx` | 3D scene hero, details sheet (stats, briefing, Accuse), evidence log, similar cases, clue popup |
| `src/components/SuspectSheet.tsx` | Suspect files and accusation |
| `src/components/Interrogation.tsx` | Truth / Doubt / Lie questioning with evidence |
| `src/components/LabGames.tsx` | Dust-for-prints and torn-document mini-games |
| `src/components/SweepModal.tsx` | Timed hidden-object sweep |
| `src/components/VerdictOverlay.tsx` | Case-closed / Internal Affairs screens |
| `src/components/Avatar.tsx` | Cartoon portraits (including gele and fila) |
| `src/components/scenes/Scene3D.tsx` | Live 3D scene: renderer, drag/pinch camera, overlay elements pinned to 3D anchors, prop picking for the sweep |
| `src/components/scenes/SceneThumb.tsx` | Still 3D renders for cards (one hidden renderer, cached) |
| `src/three/` | `world.ts` (camera, backdrops, people), `props.ts` (about 100 low-poly props), `buildScene.ts` (placement + clue anchors), `sceneKits.ts` (3D layouts of the nine Lagos scenes) |
| `src/components/scenes/` | Hand-drawn SVG scenes (the no-WebGL fallback), cartoon detectives, and `Kit.tsx` (2D backdrops + props) |
| `src/lib/content/` | Case content: `cases1to3.ts` … `cases10to20.ts` (Lagos) and `naijaFiles.ts` (the campaign) |
| `src/lib/music.ts` | Synthesized regional background loops |
| `src/lib/modes.ts`, `src/lib/ranks.ts` | Money-unlocked modes, the finale gate, and the rank ladder |
| `src/lib/cases.ts` | Case registry, categories and squad tips |
| `src/lib/sweep.ts` | Findable objects per scene for the timed sweep |
| `src/lib/useGameState.ts` | Game rules, naira amounts and `localStorage` persistence |
| `src/lib/SoundEffects.ts` | Web Audio synth: clicks, scans, fanfare, buzzer |

To add a case:
1. Add its id to `CaseId` in `lib/types.ts`.
2. Write it in a file in `lib/content/` and include it in `CASES` in `lib/cases.ts`, and list its id in a mode in `lib/modes.ts`.
3. For its scene, either point `scene` at one of the nine base scenes (clues on objects already there; their 3D layouts live in `three/sceneKits.ts`), or give it a `kit` (backdrop + props). Kit props with a `name` become timed-sweep targets automatically.
4. Set `region` for its place and music style (it defaults to Lagos).

Clue and prop `x`/`y` are percentages of the 360×400 scene box. In 3D, each prop is placed so its middle shows at that point from the starting camera (on the floor, on the back wall, hanging from the ceiling, or resting on a nearby table), and each clue's marker sits on whatever object is at its x/y. To give a clue a mini-game, add `lab: { kind: "prints", shape }` or `lab: { kind: "torn", … }`. To make a statement a lie, add `lie: { clueId, reveal }`. Keep clue, suspect and statement ids stable when rewriting a case, because saves refer to them.
