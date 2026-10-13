"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BottomDock, type Tab } from "@/components/BottomDock";
import { CaseCarousel, CategoryTabs, MiniCases } from "@/components/CaseCarousel";
import { CaseList } from "@/components/CaseList";
import { CrimeSceneModal } from "@/components/CrimeSceneModal";
import { DetectiveRow } from "@/components/DetectiveRow";
import { AdPopup } from "@/components/AdPopup";
import { AdsSheet } from "@/components/AdsSheet";
import { CityPicker } from "@/components/CityPicker";
import { DossierView } from "@/components/DossierView";
import { HelpSheet } from "@/components/HelpSheet";
import { Header } from "@/components/Header";
import { LeaderboardView } from "@/components/LeaderboardView";
import { ModesRow } from "@/components/ModesRow";
import { NaijaFilesCard } from "@/components/NaijaFilesCard";
import { ProfileView } from "@/components/ProfileView";
import { RankOverlay, RankStrip } from "@/components/RankViews";
import { Toast, type ToastMessage } from "@/components/Toast";
import { BrandMark, SectionHeader } from "@/components/ui";
import { X } from "lucide-react";
import { VerdictOverlay } from "@/components/VerdictOverlay";
import { Welcome } from "@/components/Welcome";
import { CASE_BY_ID, CASES, CATEGORIES } from "@/lib/cases";
import { moneyShort } from "@/lib/format";
import { detectiveLook, profileFace, profileFaceCode } from "@/lib/looks";
import { confetti } from "@/lib/confetti";
import "@/lib/huntCase";
import { HuntModal } from "@/components/HuntModal";
import { LookEditor } from "@/components/LookEditor";
import { LuckySpin } from "@/components/LuckySpin";
import { OwnerConsole } from "@/components/OwnerConsole";
import { SponsoredRow } from "@/components/SponsoredRow";
import { announce } from "@/lib/multiplayer";
import { CITY_BY_ID, casesIn, cityOf, type CityId } from "@/lib/cities";
import { StateBanner, TravelWelcome } from "@/components/StateBanner";
import { rankFor } from "@/lib/ranks";
import { gateRemaining, isCaseOpen, isModeOpen, MODE_BY_ID, modeOf, MODES, type ModeId } from "@/lib/modes";
import { sfx } from "@/lib/SoundEffects";
import { adStore, type Hunt, type LiveAd } from "@/lib/ads";
import { setLiveAds } from "@/three/adSlots";
import type { CaseId, CategoryId, Verdict } from "@/lib/types";
import { today, useGameState } from "@/lib/useGameState";
import { BADGE_BY_ID, earnedBadges } from "@/lib/badges";
import { countTap, publishBoard } from "@/lib/board";
import { DailyCard } from "@/components/DailyCard";
import { saveSignup } from "@/lib/signups";
import { ACCOUNT_MESSAGES, accountEmail, accountRegister, isCloudflareRuntime } from "@/lib/cfRuntime";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const OPEN_KEY = "crime-life:open-case";

export default function Home() {
  const game = useGameState();
  const { state, active } = game;

  const [tab, setTab] = useState<Tab>("cases");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [mode, setMode] = useState<ModeId | null>(null);
  const [squad, setSquad] = useState<string | null>(null);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [tipsSeen, setTipsSeen] = useState(false);
  const [openOnly, setOpenOnly] = useState(false);
  const [openId, setOpenId] = useState<CaseId | null>(null);
  const [helpFor, setHelpFor] = useState<CaseId | null>(null);
  const [city, setCity] = useState<CityId>("lagos");
  const [pickingCity, setPickingCity] = useState(false);
  const [adsOpen, setAdsOpen] = useState(false);
  const [liveAds, setLive] = useState<LiveAd[]>([]);
  const [shownAd, setShownAd] = useState<LiveAd | null>(null);
  // sponsored clue hunts, the look editor and the daily Lucky Spin
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [openHunt, setOpenHunt] = useState<Hunt | null>(null);
  const [editingLook, setEditingLook] = useState(false);
  const [spinOpen, setSpinOpen] = useState(false);
  // the owner's private console: only at <game address>#owner, and only with the owner password
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [adsTab, setAdsTab] = useState<"new" | "manage">("new");
  useEffect(() => {
    const check = () => setOwnerOpen(window.location.hash === "#owner");
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, []);
  // approved player posters, for the billboards and walls in the scenes
  useEffect(() => {
    let off: (() => void) | undefined;
    let live = true;
    adStore().then((s) => {
      if (live && s)
        off = (() => {
          const a = s.watchLive((ads) => {
            setLiveAds(ads);
            setLive(ads);
          });
          const b = s.watchHunts(setHunts);
          return () => {
            a();
            b();
          };
        })();
    });
    return () => {
      live = false;
      off?.();
    };
  }, []);
  // a tap on a poster in a scene: show its details, or the Advertise form for an empty slot
  const liveRef = useRef(liveAds);
  liveRef.current = liveAds;
  useEffect(() => {
    const onAd = (e: Event) => {
      const hit = (e as CustomEvent<{ ad?: string; house?: boolean }>).detail;
      if (hit?.house) {
        sfx.tap();
        setAdsOpen(true);
        return;
      }
      const ad = liveRef.current.find((a) => a.id === hit?.ad);
      if (ad) {
        countTap(ad.id);
        sfx.tap();
        setShownAd(ad);
      }
    };
    window.addEventListener("nd:ad", onAd);
    return () => window.removeEventListener("nd:ad", onAd);
  }, []);
  // remember the city on this device
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("crime-life:city") as CityId | null;
      if (saved && CITY_BY_ID[saved]) setCity(saved);
    } catch {
      // only a convenience
    }
  }, []);
  // a short welcome banner after travelling to a new city
  const [welcomeTo, setWelcomeTo] = useState<CityId | null>(null);
  const endWelcome = useCallback(() => setWelcomeTo(null), []);
  const chooseCity = (id: CityId) => {
    sfx.whoosh();
    if (id !== city) setWelcomeTo(id);
    setCity(id);
    setPickingCity(false);
    setMode(null);
    setCategory(null);
    try {
      window.localStorage.setItem("crime-life:city", id);
    } catch {
      // only a convenience
    }
    window.scrollTo({ top: 0 });
  };
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const notify = useCallback((text: string, tone: ToastMessage["tone"] = "info") => setToast({ id: Date.now(), text, tone }), []);
  const clearToast = useCallback(() => setToast(null), []);

  // Featured case: the first unsolved case in any open mode, else a replay of the first case.
  // The next case to play: first unsolved open case in this city, else anywhere.
  const activeCase = useMemo(() => {
    for (const inCity of [true, false]) {
      for (const m of MODES) {
        for (const id of m.caseIds) {
          if (inCity && cityOf(CASE_BY_ID[id]) !== city) continue;
          if (isCaseOpen(id, state) && !state.solved.includes(id)) return CASE_BY_ID[id];
        }
      }
    }
    return CASES.find((c) => cityOf(c) === city) ?? CASES[0];
  }, [state, city]);

  const openCase = useCallback(
    (id: CaseId) => {
      if (!isCaseOpen(id, state)) {
        sfx.error();
        const m = modeOf(id);
        const left = gateRemaining(id, state);
        notify(
          isModeOpen(m, state)
            ? `Not yet! Close ${left} more Naija File${left === 1 ? "" : "s"} to unlock the finale.`
            : `Calm down, Oga! ${m.name} na for people wey get ${moneyShort(m.cost)}.`,
          "bad",
        );
        return;
      }
      sfx.whoosh();
      setOpenId(id);
      openedAt.current[id] = Date.now();
    },
    [state, notify],
  );

  // when each case was opened this visit, for "cracked in 3m 12s" on the share card
  const openedAt = useRef<Record<string, number>>({});
  const solvedIn = useRef(0);
  const accuse = useCallback(
    (suspectId: string) => {
      const v = game.accuse(openId!, suspectId);
      solvedIn.current = (Date.now() - (openedAt.current[openId!] ?? Date.now() - 300_000)) / 1000;
      if (v.kind === "correct") {
        sfx.success();
        window.setTimeout(() => confetti({ count: 150 }), 250);
        if (v.opened.length) sfx.unlock();
      } else {
        sfx.error();
      }
      setVerdict(v);
      return v;
    },
    [game, openId],
  );

  // Let other detectives see who is online and which case they're on.
  const me = active ? { name: active.name, look: active.look, rank: rankFor(state.xp).short } : null;
  useEffect(() => {
    if (me) void announce(me, openId ?? undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.name, me?.look, me?.rank, openId]);

  // A phone can reload the page on its own (low memory, or the app coming back from the
  // background). Remember the open case so the player lands back in it, not on Home.
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current || !game.hydrated || !active) return;
    restored.current = true;
    try {
      const v = JSON.parse(window.localStorage.getItem(OPEN_KEY) ?? "null") as { id?: CaseId; at?: number } | null;
      if (v?.id && CASE_BY_ID[v.id] && Date.now() - (v.at ?? 0) < 30 * 60_000 && isCaseOpen(v.id, state)) setOpenId(v.id);
    } catch {
      // nothing to restore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.hydrated, active?.id]);
  useEffect(() => {
    if (!restored.current) return;
    try {
      if (openId) window.localStorage.setItem(OPEN_KEY, JSON.stringify({ id: openId, at: Date.now() }));
      else window.localStorage.removeItem(OPEN_KEY);
    } catch {
      // only a convenience
    }
  }, [openId]);

  // the daily streak: count today as soon as a detective is signed in
  const activeId = active?.id;
  useEffect(() => {
    if (activeId) game.checkIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // badges: award any the save now qualifies for
  useEffect(() => {
    if (!active) return;
    const fresh = earnedBadges(state).filter((id) => !(state.badges ?? []).includes(id));
    if (!fresh.length) return;
    game.awardBadges(fresh);
    sfx.success();
    confetti({ count: 70, y: 0.15 });
    const first = BADGE_BY_ID[fresh[0]];
    notify(fresh.length === 1 ? `${first.emoji} Badge earned: ${first.name}!` : `${first.emoji} ${fresh.length} badges earned! See your Profile.`, "good");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, activeId]);

  // the real leaderboard: keep this detective's public row fresh
  const solvedCount = state.solved.length;
  const badgeCount = state.badges?.length ?? 0;
  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(
      () => void publishBoard({ name: active.name, look: active.look, face: profileFaceCode(active), week: state.week?.id, weekXp: state.week ? Math.max(0, state.xp - state.week.xp) : 0, prevWeek: state.week?.prev?.id, prevWeekXp: state.week?.prev?.xp ?? 0, balance: state.balance, rating: state.rating, xp: state.xp, solved: solvedCount, branch: CITY_BY_ID[city].name, badges: badgeCount }),
      2500,
    );
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.name, active?.look, active?.face, state.balance, state.rating, state.xp, solvedCount, badgeCount, city]);

  // today's challenge: a case (open, photo not yet complete), the same all day
  const openKey = CASES.filter((c) => isCaseOpen(c.id, state)).length;
  const challenge = useMemo(() => {
    const day = today();
    const pick = (list: typeof CASES) => {
      const open = list.filter((c) => isCaseOpen(c.id, state) && (state.bonus?.[c.id]?.length ?? 0) < 3);
      if (!open.length) return null;
      let h = 0;
      for (const ch of day) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
      return open[h % open.length];
    };
    return pick(CASES.filter((c) => cityOf(c) === city)) ?? pick(CASES);
    // only re-pick when the day, city or unlocked set changes, not on every scrap
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, openKey, state.daily?.day]);
  const challengeDone = challenge ? (state.bonus?.[challenge.id]?.length ?? 0) >= 3 : false;
  useEffect(() => {
    if (!challengeDone || state.daily?.done === today()) return;
    const paid = game.finishDaily();
    if (paid) {
      sfx.success();
      confetti();
      notify(`Daily challenge complete! +${moneyShort(paid)} and 15 XP.`, "good");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeDone]);

  // the 3D detective wears the player's designed look
  const faceCode = active ? profileFaceCode(active) : "";
  const myDetective = useMemo(() => (active ? detectiveLook(profileFace(active)) : undefined), [faceCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const changeTab = (t: Tab) => {
    sfx.tap();
    setTab(t);
    window.scrollTo({ top: 0 });
  };

  const q = query.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!q) return [];
    return CASES.filter((c) =>
      [c.title, c.hook, c.victim, modeOf(c.id).name, ...c.tags, ...c.categories.map((id) => CATEGORIES.find((k) => k.id === id)!.name)]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [q]);
  // Home shows the chosen city; the Naija Files mode spans the whole country.
  const inCity = (c: (typeof CASES)[number]) => mode === "naija" || cityOf(c) === city;
  const base = (mode ? MODE_BY_ID[mode].caseIds.map((id) => CASE_BY_ID[id]) : category ? CASES.filter((c) => c.categories.includes(category)) : CASES).filter(inCity);
  const rankOf = (id: CaseId) => (id === activeCase.id ? 0 : !isCaseOpen(id, state) ? 3 : state.solved.includes(id) ? 2 : 1);
  const carousel = base
    .filter((c) => !openOnly || isCaseOpen(c.id, state))
    .map((c, i) => ({ c, i }))
    .sort((a, b) => rankOf(a.c.id) - rankOf(b.c.id) || a.i - b.i)
    .map(({ c }) => c);
  const hot = CASES.filter((c) => cityOf(c) === city && isCaseOpen(c.id, state) && !state.solved.includes(c.id) && c.id !== activeCase.id).slice(0, 10);
  const titles: Record<Tab, string> = { cases: CITY_BY_ID[city].name, dossier: "Dossier", leaderboard: "Precinct", profile: "Profile" };
  const openCaseData = openId ? CASE_BY_ID[openId] : null;

  // Hold the UI until saved progress loads, so it never flashes a fresh starting profile.
  if (!game.hydrated) {
    return (
      <div className="mx-auto grid min-h-dvh max-w-md place-items-center bg-ink">
        <BrandMark className="live-dot size-14" />
      </div>
    );
  }

  if (!active) {
    return (
      <Welcome
        profiles={Object.values(game.store.profiles).sort((a, b) => b.createdAt - a.createdAt)}
        onSignUp={async (name, look, contact) => {
          // the game's own site: an email + password account first, so progress can follow the player
          if (isCloudflareRuntime() && contact.password) {
            const problem = await accountRegister(contact.email, contact.password, contact.fullName);
            if (problem === "already_registered") {
              const mine = await accountEmail();
              if (mine !== contact.email) return `This device is signed in as ${mine ?? "another account"}. Sign out in Profile first to make a new account.`;
            } else if (problem) return ACCOUNT_MESSAGES[problem];
          }
          game.signUp(name, look, { fullName: contact.fullName, email: contact.email });
          void saveSignup({ detective: name, fullName: contact.fullName, email: contact.email });
          setTab("cases");
          notify(`Welcome to Panti, Constable ${name.split(" ")[0]}! Oya, go catch thief.`, "good");
        }}
        onSignIn={(id) => {
          game.signIn(id);
          setTab("cases");
          notify(`Welcome back, ${game.store.profiles[id]?.name ?? "Oga"}!`, "good");
        }}
        onGuest={() => {
          game.playAsGuest();
          setTab("cases");
        }}
      />
    );
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-ink pb-32 lg:max-w-none lg:pb-12 lg:pl-[248px]">
      <Header
        title={titles[tab]}
        onTitle={
          tab === "cases"
            ? () => {
                sfx.tap();
                setPickingCity(true);
              }
            : undefined
        }
        balance={state.balance}
        ready={game.hydrated}
        rating={state.rating}
        query={query}
        showSearch={tab === "cases"}
        openOnly={openOnly}
        tipsOpen={tipsOpen}
        hasTip={!tipsSeen}
        onQuery={(v) => {
          setQuery(v);
          if (v) setTab("cases");
        }}
        onMenu={() => changeTab("profile")}
        onBell={() => {
          sfx.tap();
          setTipsOpen((o) => !o);
          setTipsSeen(true);
          if (tipsOpen) setSquad(null);
        }}
        onFilter={() => {
          sfx.tap();
          setOpenOnly((o) => !o);
          notify(openOnly ? "Showing every case, locked ones too." : "Showing only cases you fit enter now.");
        }}
      />

      <main className="lg:max-w-[1500px] lg:px-1 xl:px-3">
        {tipsOpen && (
          <div className="fade-in pb-2">
            <DetectiveRow
              activeCase={activeCase}
              selected={squad}
              onSelect={(id) => {
                sfx.tap();
                setSquad(id);
              }}
            />
          </div>
        )}

        {tab === "cases" && q && (
          <>
            <SectionHeader title={`Cases matching “${query.trim()}”`} />
            <CaseList cases={searchResults} state={state} onOpen={openCase} layout="stack" />
          </>
        )}

        {tab === "cases" && !q && (
          <>
            <CategoryTabs
              active={category}
              onSelect={(id) => {
                sfx.tap();
                setCategory(id);
                setMode(null);
              }}
            />
            {mode && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setMode(null)}
                  className="inline-flex items-center gap-1 rounded-full bg-kick px-3 py-1 text-xs font-bold text-ink active:scale-95"
                >
                  {MODE_BY_ID[mode].name} <X className="size-3.5" />
                </button>
              </div>
            )}
            {!mode && !category && (
              <StateBanner
                city={CITY_BY_ID[city]}
                cases={casesIn(city).length}
                onTravel={() => {
                  sfx.tap();
                  setPickingCity(true);
                }}
              />
            )}
            <CaseCarousel cases={carousel} state={state} onOpen={openCase} />

            <DailyCard
              state={state}
              challenge={challenge}
              onClaim={() => {
                const paid = game.claimStreak();
                if (paid) {
                  sfx.success();
                  notify(`Streak reward collected: +${moneyShort(paid)}. See you tomorrow!`, "good");
                }
              }}
              onOpen={(c) => openCase(c.id)}
              spinsLeft={game.spinsLeft()}
              onSpin={() => {
                sfx.whoosh();
                setSpinOpen(true);
              }}
            />

            {(state.favorites?.length ?? 0) > 0 && (
              <>
                <SectionHeader title="❤️ Your favourites" />
                <MiniCases cases={(state.favorites ?? []).map((id) => CASE_BY_ID[id]).filter(Boolean)} state={state} onOpen={openCase} />
              </>
            )}

            <SectionHeader title="🎯 Sponsored hunts" action={hunts.length ? undefined : "Advertise"} onAction={() => setAdsOpen(true)} />
            {hunts.length ? (
              <SponsoredRow
                hunts={hunts}
                state={state}
                onOpen={(h) => {
                  sfx.whoosh();
                  setOpenHunt(h);
                }}
                onAdvertise={() => {
                  sfx.tap();
                  setAdsOpen(true);
                }}
              />
            ) : (
              <p className="mx-4 rounded-2xl border-2 border-dashed border-line p-4 text-sm text-neutral-600">
                Brands hide gold tokens in a crime scene; find them all to unlock a discount. No hunts running right now. Own a business? Tap Advertise and add a clue hunt to your poster.
              </p>
            )}

            <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-6">
            <div className="lg:col-start-1 lg:row-start-1">
            <SectionHeader title="Your Badge" action="See profile" onAction={() => changeTab("profile")} />
            <RankStrip name={active.name} face={profileFace(active)} xp={state.xp} lossStreak={state.lossStreak} onOpen={() => changeTab("profile")} />
            </div>

            {hot.length > 0 && (
              <div className="min-w-0 lg:col-start-2 lg:row-start-1">
                <SectionHeader title={`Hot in ${CITY_BY_ID[city].name}`} action="See All" onAction={() => setOpenOnly(true)} />
                <MiniCases cases={hot} state={state} onOpen={openCase} />
              </div>
            )}

            <div className="lg:col-start-1 lg:row-start-2">
            <SectionHeader title="Game Modes" action={mode ? "Show all" : undefined} onAction={() => setMode(null)} />
            <ModesRow
              state={state}
              active={mode}
              onSelect={(id) => {
                sfx.tap();
                setMode(id);
                setCategory(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
            </div>
            <div className="lg:col-start-2 lg:row-start-2 lg:pt-[68px]">
            <NaijaFilesCard
              state={state}
              onPlay={() => {
                sfx.tap();
                setMode("naija");
                setCategory(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
            </div>
            </div>
          </>
        )}

        {tab === "dossier" && (
          <div className="lg:mx-auto lg:max-w-3xl">
            <DossierView state={state} onOpen={openCase} />
          </div>
        )}
        {tab === "leaderboard" && (
          <div className="lg:mx-auto lg:max-w-3xl">
            <LeaderboardView state={state} name={active.name} look={active.look} face={profileFaceCode(active)} branch={CITY_BY_ID[city].name} />
          </div>
        )}
        {tab === "profile" && (
          <div className="lg:mx-auto lg:max-w-3xl">
          <ProfileView
            state={state}
            name={active.name}
            face={profileFace(active)}
            onToggleMute={game.toggleMute}
            onAdvertise={() => {
              sfx.tap();
              setAdsOpen(true);
            }}
            account={{ fullName: active.fullName, email: active.email }}
            onEditLook={() => {
              sfx.whoosh();
              setEditingLook(true);
            }}
            onSwitch={() => {
              sfx.whoosh();
              setTipsOpen(false);
              setOpenId(null);
              setMode(null);
              setCategory(null);
              game.signOut();
            }}
          />
          </div>
        )}
      </main>

      <BottomDock
        tab={tab}
        onTab={changeTab}
        onInspect={() => {
          sfx.whoosh();
          setHelpFor(activeCase.id);
        }}
      />

      {openCaseData && (
        <ErrorBoundary
          key={openCaseData.id}
          fallback={(retry) => (
            <div className="fixed inset-0 z-40 grid place-items-center bg-ink/95 p-6 text-center" role="alertdialog" aria-label="The scene hit a problem">
              <div className="max-w-xs">
                <div className="text-4xl" aria-hidden>
                  🚧
                </div>
                <h2 className="mt-2 text-xl font-bold">Wahala for the scene</h2>
                <p className="mt-1 text-sm text-neutral-600">Something went wrong while showing this case. Your progress is safe.</p>
                <button onClick={retry} className="mt-4 h-12 w-full rounded-full bg-fg font-bold text-white active:scale-95">
                  Try again
                </button>
                <button onClick={() => setOpenId(null)} className="mt-2 h-11 w-full rounded-full border border-line font-semibold active:scale-95">
                  Back to cases
                </button>
              </div>
            </div>
          )}
        >
        <CrimeSceneModal
          key={openCaseData.id}
          theCase={openCaseData}
          state={state}
          onClose={() => setOpenId(null)}
          onFind={(clueId) => game.findClue(openCaseData.id, clueId)}
          onBonus={(bonusId, reward) => game.findBonus(openCaseData.id, bonusId, reward)}
          me={{ name: game.active?.name ?? "Detective", look: game.active?.look ?? 0, branch: CITY_BY_ID[city].name, face: profileFaceCode(game.active) }}
          detective={myDetective}
          favorite={(state.favorites ?? []).includes(openCaseData.id)}
          onFavorite={() => {
            const on = game.toggleFavorite(openCaseData.id);
            notify(on ? "❤️ Added to your favourites" : "Removed from your favourites");
          }}
          onSquad={(partners) => {
            const paid = game.squadBonus(partners);
            if (paid) window.setTimeout(() => notify(`🤝 Squad bonus! +${moneyShort(paid)} for closing it with ${partners} other branch${partners === 1 ? "" : "es"}.`, "good"), 1800);
          }}
          onAnalyze={(clueId) => game.analyzeClue(openCaseData.id, clueId)}
          onAccuse={accuse}
          onCatch={(statementId) => game.catchLie(openCaseData.id, statementId)}
          onStrike={(suspectId) => game.addStrike(openCaseData.id, suspectId)}
          onSweepFinish={(stars) => game.finishSweep(openCaseData.id, stars)}
          onSweepFail={game.failSweep}
          onToggleMute={game.toggleMute}
          onToggleMusic={game.toggleMusic}
          onOpenCase={openCase}
          onBackup={() => {
            sfx.whoosh();
            setHelpFor(openCaseData.id);
          }}
          onSeeAll={(id) => {
            setOpenId(null);
            setMode(null);
            setCategory(id);
            setTab("cases");
          }}
        />
        </ErrorBoundary>
      )}

      {openHunt && (
        <ErrorBoundary
          key={openHunt.id}
          fallback={() => (
            <div className="fixed inset-0 z-40 grid place-items-center bg-ink/95 p-6 text-center">
              <button onClick={() => setOpenHunt(null)} className="h-12 rounded-full bg-fg px-6 font-bold text-white">
                Back to cases
              </button>
            </div>
          )}
        >
          <HuntModal
            hunt={openHunt}
            state={state}
            detective={myDetective}
            onFind={(tokenId) => {
              const r = game.findHuntToken(openHunt.id, tokenId, openHunt.tokens);
              if (r.paid) notify(`🎁 Hunt complete! +${moneyShort(r.paid)} and your ${openHunt.brand} code is unlocked.`, "good");
              return r;
            }}
            onClose={() => setOpenHunt(null)}
          />
        </ErrorBoundary>
      )}

      {editingLook && active && (
        <LookEditor
          face={profileFace(active)}
          xp={state.xp}
          onClose={() => setEditingLook(false)}
          onSave={(code) => {
            game.setFace(code);
            setEditingLook(false);
            confetti({ count: 60, y: 0.3 });
            notify("Fresh look! Your detective is wearing it in every scene.", "good");
          }}
        />
      )}

      {spinOpen && (
        <LuckySpin
          left={game.spinsLeft()}
          onSpin={() => game.spin()}
          onClose={() => setSpinOpen(false)}
        />
      )}

      {verdict && (
        <VerdictOverlay
          verdict={verdict}
          lossStreak={state.lossStreak}
          share={{ seconds: solvedIn.current, detective: active.name, rank: rankFor(state.xp).name }}
          onContinue={() => {
            sfx.tap();
            if (verdict.kind === "correct") setOpenId(null);
            setVerdict(null);
          }}
        />
      )}

      {!verdict && game.rankEvent && (
        <RankOverlay
          event={game.rankEvent}
          onClose={() => {
            sfx.tap();
            game.clearRankEvent();
          }}
        />
      )}

      {helpFor && me && (
        <HelpSheet
          theCase={CASE_BY_ID[helpFor]}
          state={state}
          me={me}
          inCase={openId === helpFor}
          onSpend={(amount) => game.spend(amount)}
          onContinue={(id) => {
            setHelpFor(null);
            openCase(id);
          }}
          onOpenCase={(id) => {
            if (!isCaseOpen(id, state)) return openCase(id);
            setHelpFor(null);
            openCase(id);
          }}
          onClose={() => setHelpFor(null)}
        />
      )}

      {ownerOpen && (
        <OwnerConsole
          onClose={() => {
            setOwnerOpen(false);
            history.replaceState(null, "", window.location.pathname + window.location.search);
          }}
          onAds={() => {
            setAdsTab("manage");
            setAdsOpen(true);
          }}
          onGrant={(m, x) => game.ownerGrant(m, x)}
        />
      )}
      {welcomeTo && <TravelWelcome city={CITY_BY_ID[welcomeTo]} onDone={endWelcome} />}
      {adsOpen && (
        <AdsSheet
          startTab={adsTab}
          onClose={() => {
            setAdsOpen(false);
            setAdsTab("new");
          }}
        />
      )}
      {shownAd && <AdPopup ad={shownAd} onClose={() => setShownAd(null)} />}
      {pickingCity && <CityPicker current={city} state={state} onPick={chooseCity} onClose={() => setPickingCity(false)} />}

      <Toast toast={toast} onDone={clearToast} />
    </div>
  );
}
