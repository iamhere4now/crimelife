"use client";

import { Brush, Check, Heart, MessageCircle, Moon, Share2, Sun, ChevronLeft, ChevronUp, Eye, Siren, FlaskConical, Gavel, HelpCircle, Microscope, Music, Puzzle, Search, Star, Timer, Users, Volume2, VolumeX, Wallet, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { BONUS_REWARD, bonusFor, bonusTheme, type BonusFind } from "@/lib/bonus";
import { GAME_URL, joinCase, type CoopMe, type CoopSession, type Partner } from "@/lib/coop";
import { LANG_NAME, langOf, leadLine, phrasesFor, phraseText } from "@/lib/local";
import { confetti } from "@/lib/confetti";
import { decodeFace, detectiveLook } from "@/lib/looks";
import { hasUnlock } from "@/lib/unlocks";
import type { PersonLook } from "@/three/world";
import { BONUS_XP } from "@/lib/useGameState";
import { compact, moneyShort } from "@/lib/format";
import { CASES, CATEGORIES, regionOf } from "@/lib/cases";
import { modeOf } from "@/lib/modes";
import { playMusic, stopMusic, STYLES } from "@/lib/music";
import { startSceneRoad, stopSceneRoad } from "@/lib/roadSound";
import { hasRoad } from "@/three/buildScene";
import { kitOf } from "@/three/sceneKits";
import { sfx } from "@/lib/SoundEffects";
import type { CaseId, CategoryId, Clue, CrimeCase, GameState, Verdict } from "@/lib/types";
import { useLiveCount } from "@/lib/useLiveCount";
import { Avatar } from "./Avatar";
import { DustPrints, TornDocument } from "./LabGames";
import { Scene3D, type Scene3DHandle } from "./scenes/Scene3D";
import { SuspectSheet } from "./SuspectSheet";
import { SweepModal } from "./SweepModal";
import { MiniCases } from "./CaseCarousel";
import { LiveBadge, Watching } from "./ui";

interface Props {
  theCase: CrimeCase;
  state: GameState;
  onClose: () => void;
  onFind: (clueId: string) => void;
  /** Pick up a bonus scrap; false if it was already picked up. */
  onBonus: (bonusId: string, reward: number) => boolean;
  /** Who the player is, for detectives from other branches on the same case. */
  me: CoopMe;
  /** Closed the case with this many other branches on the scene: pay the squad bonus. */
  onSquad: (partners: number) => void;
  /** The player's own detective in 3D (their designed look). */
  detective?: PersonLook;
  favorite: boolean;
  onFavorite: () => void;
  onAnalyze: (clueId: string) => void;
  onAccuse: (suspectId: string) => Verdict;
  onCatch: (statementId: string) => number;
  onStrike: (suspectId: string) => number;
  onSweepFinish: (stars: number) => number;
  onSweepFail: () => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onOpenCase: (id: CaseId) => void;
  onBackup: () => void;
  onSeeAll: (category: CategoryId) => void;
}

export function CrimeSceneModal({
  theCase,
  state,
  onClose,
  onFind,
  onBonus,
  me,
  onSquad,
  detective,
  favorite,
  onFavorite,
  onAnalyze,
  onAccuse,
  onCatch,
  onStrike,
  onSweepFinish,
  onSweepFail,
  onToggleMute,
  onToggleMusic,
  onOpenCase,
  onBackup,
  onSeeAll,
}: Props) {
  const [openClue, setOpenClue] = useState<Clue | null>(null);
  const [accusing, setAccusing] = useState(false);
  const [sweeping, setSweeping] = useState(false);
  const [more, setMore] = useState(false);
  // Phone only: swipe the details down to see just the scene and its clues, swipe up to bring them back.
  const [sceneOnly, setSceneOnly] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const sceneApi = useRef<Scene3DHandle | null>(null);
  // the detective is on his way to a clue (taps wait until he gets there)
  const [walkingTo, setWalkingTo] = useState<string | null>(null);
  const touch = useRef<{ x: number; y: number; atTop: boolean } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, atTop: (scroller.current?.scrollTop ?? 0) <= 2 };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start || window.matchMedia("(min-width: 832px)").matches) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > Math.abs(dy) * 0.8) return; // a sideways drag looks around the scene
    if (!sceneOnly && start.atTop && dy > 70) {
      sfx.whoosh();
      setSceneOnly(true);
    }
  };
  const liveHere = useLiveCount(theCase.id);

  // bonus evidence: three scraps hidden around every scene
  const caughtHere = state.caught[theCase.id]?.length ?? 0;
  const scraps = useMemo(() => bonusFor(theCase, state), [theCase, caughtHere]); // eslint-disable-line react-hooks/exhaustive-deps
  const scrapsFound = state.bonus?.[theCase.id] ?? [];
  const theme = bonusTheme(theCase);
  const [openScrap, setOpenScrap] = useState<{ scrap: BonusFind; fresh: boolean } | null>(null);
  // rank perks
  const canNight = hasUnlock(state.xp, "night");
  const eagle = hasUnlock(state.xp, "lens");
  const labExpress = hasUnlock(state.xp, "lab");
  const [night, setNight] = useState(false);
  const [beat, setBeat] = useState(0);
  // a short tour the first time a player opens any case on this device
  const [tour, setTour] = useState<number | null>(null);
  useEffect(() => {
    try {
      if (!window.localStorage.getItem(TOUR_KEY)) setTour(0);
    } catch {
      // no storage: skip the tour
    }
  }, []);
  const anchors = useMemo(() => [...theCase.clues, ...scraps], [theCase, scraps]);

  // detectives from other branches on this case right now
  const [partners, setPartners] = useState<Partner[]>([]);
  const [linked, setLinked] = useState(false);
  const [feed, setFeed] = useState<{ id: number; text: string }[]>([]);
  const coop = useRef<CoopSession | null>(null);
  const known = useRef(new Map<string, Partner>());
  const say = (text: string) => {
    const id = Date.now() + Math.random();
    setFeed((f) => [...f.slice(-2), { id, text }]);
    window.setTimeout(() => setFeed((f) => f.filter((x) => x.id !== id)), 4800);
  };
  const sayRef = useRef(say);
  sayRef.current = say;
  const clueName = useRef((id: string) => theCase.clues.find((c) => c.id === id)?.name ?? "evidence");
  const foundRef = useRef<string[]>([]);
  // everyone who has been on the scene with us this visit (for the squad bonus)
  const met = useRef(new Set<string>());
  const [phrasesOpen, setPhrasesOpen] = useState(false);
  const [invited, setInvited] = useState("");
  useEffect(() => {
    let gone = false;
    joinCase(theCase.id, me, ({ online, partners: list }) => {
      if (gone) return;
      setLinked(online);
      setPartners(list);
      // tell the player what the others are up to (not on the first look at someone already here)
      const before = known.current;
      const next = new Map<string, Partner>();
      for (const p of list) {
        const was = before.get(p.key);
        const who = `Det. ${p.name} (${p.branch})`;
        met.current.add(p.key);
        if (was && p.said && p.said.seq !== was.said?.seq) {
          const text = phraseText(p.said.index);
          if (text) sayRef.current(`Det. ${p.name}: ${text}`);
        }
        if (!was) {
          if (before.size || list.length === 1) sayRef.current(`${who} joined the case`);
        } else {
          const fresh = p.found.filter((id) => !was.found.includes(id));
          for (const id of fresh) sayRef.current(foundRef.current.includes(id) ? `${who} found the ${clueName.current(id).toLowerCase()} too` : `${who} found a clue: see the blue badge`);
          if (p.bonus > was.bonus) sayRef.current(`${who} picked up a bonus scrap`);
        }
        next.set(p.key, p);
      }
      for (const [k, p] of before) if (!next.has(k)) sayRef.current(`Det. ${p.name} left the scene`);
      known.current = next;
    }).then((session) => {
      if (gone || !session) return session?.leave();
      coop.current = session;
      session.update({ found: foundRef.current, bonus: (state.bonus?.[theCase.id] ?? []).length });
    });
    return () => {
      gone = true;
      coop.current?.leave();
      coop.current = null;
    };
    // join once per case; who I am doesn't change while it's open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theCase.id]);

  const found = state.found[theCase.id] ?? [];
  foundRef.current = found;
  const analyzed = state.analyzed[theCase.id] ?? [];
  const solved = state.solved.includes(theCase.id);
  const total = theCase.clues.length;
  const ready = found.length >= theCase.requiredClues;
  const culprit = theCase.suspects.find((s) => s.id === theCase.culpritId)!;

  useLockBodyScroll();

  const [studying, setStudying] = useState<string | null>(null);
  useEffect(() => {
    coop.current?.update({ found, bonus: scrapsFound.length });
  }, [found.length, scrapsFound.length]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    coop.current?.update({ at: walkingTo ?? studying });
  }, [walkingTo, studying]);
  // really here right now: you and everyone linked to this case
  const watching = Math.max(liveHere, partners.length + 1);
  const crew = useMemo(
    () =>
      partners.map((p) => {
        const f = decodeFace(p.face);
        return { key: p.key, label: `Det. ${p.name} · ${p.branch}`, look: p.look, person: f ? detectiveLook(f) : undefined, at: p.at };
      }),
    [partners],
  );
  // who found each clue first (for a badge on clues I haven't got yet)
  const partnerFinds = new Map<string, Partner>();
  for (const p of partners) for (const id of p.found) if (!partnerFinds.has(id)) partnerFinds.set(id, p);

  // Background music in the case's regional style, while the scene is open.
  const region = regionOf(theCase);
  const musicOn = !state.muted && !state.musicOff;
  useEffect(() => {
    if (musicOn) playMusic(region.music);
    else stopMusic();
  }, [musicOn, region.music]);
  useEffect(() => () => stopMusic(), []);

  // the sound of the road, in scenes with traffic (follows the sound button, not the music one)
  const roadHere = useMemo(() => hasRoad(kitOf(theCase)), [theCase]);
  useEffect(() => {
    if (!roadHere || state.muted) return;
    startSceneRoad();
    return () => stopSceneRoad();
  }, [roadHere, state.muted]);

  // Escape closes the top-most layer first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (openClue) setOpenClue(null);
      else if (openScrap) setOpenScrap(null);
      else if (sweeping) setSweeping(false);
      else if (accusing) setAccusing(false);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openClue, openScrap, accusing, sweeping, onClose]);

  const open = (clue: Clue) => {
    if (!found.includes(clue.id)) {
      sfx.clue();
      onFind(clue.id);
    } else {
      sfx.tap();
    }
    setOpenClue(clue);
  };

  /** Arrest: if other branches worked the scene with us, they share the credit. */
  const accuseHere = (suspectId: string) => {
    const v = onAccuse(suspectId);
    if (v.kind === "correct" && v.bounty > 0 && met.current.size > 0) onSquad(met.current.size);
    return v;
  };

  const sendPhrase = (index: number) => {
    const text = phraseText(index);
    setPhrasesOpen(false);
    if (!text) return;
    sfx.tap();
    coop.current?.say(index);
    say(`You: ${text}`);
  };

  /** Ask a detective from another branch to join this case. */
  const invite = async () => {
    sfx.tap();
    const text = `Join me on "${theCase.title}" in Naija Detective. I'm on the scene now in ${regionOf(theCase).state}. Open the game and pick this case: ${GAME_URL}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Naija Detective", text });
        return;
      }
    } catch {
      // cancelled or not allowed: fall back to copying
    }
    try {
      await navigator.clipboard.writeText(text);
      setInvited("Invite copied. Paste it to a friend on WhatsApp.");
    } catch {
      setInvited(text);
    }
  };

  /** Send the detective and his dog over to look at an anchor, then `then`. */
  const walkOver = (id: string, then: () => void) => {
    if (walkingTo) return;
    const api = sceneApi.current;
    const show = () => {
      setStudying(id);
      window.setTimeout(() => setStudying((s) => (s === id ? null : s)), 4000);
      then();
    };
    if (!api?.walkTo) return show();
    sfx.tap();
    setWalkingTo(id);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.clearTimeout(safety);
      setWalkingTo(null);
      show();
    };
    // never keep the player waiting long, even if he has far to go
    const safety = window.setTimeout(finish, 5500);
    api.walkTo(id, finish);
  };
  const inspect = (clue: Clue) => walkOver(clue.id, () => open(clue));
  const pickScrap = (scrap: BonusFind) =>
    walkOver(scrap.id, () => {
      const fresh = onBonus(scrap.id, BONUS_REWARD);
      if (fresh) sfx.clue();
      else sfx.tap();
      if (fresh && scrapsFound.length + 1 >= scraps.length) window.setTimeout(() => confetti({ count: 110 }), 350);
      setOpenScrap({ scrap, fresh });
    });

  const mode = modeOf(theCase.id);
  const category = CATEGORIES.find((k) => k.id === theCase.categories[0]);
  const similar = CASES.filter((c) => c.id !== theCase.id && c.categories.some((k) => theCase.categories.includes(k))).slice(0, 10);

  return (
    <div className="fixed inset-0 z-40 mx-auto flex max-w-md flex-col bg-ink fade-in lg:max-w-none" role="dialog" aria-modal="true" aria-label={theCase.title}>
      <div
        ref={scroller}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className={`no-scrollbar flex-1 lg:grid lg:grid-cols-[minmax(0,1fr)_clamp(340px,40%,480px)] lg:overflow-hidden ${sceneOnly ? "overflow-hidden" : "overflow-y-auto"}`}
      >
        {/* hero: the live 3D scene */}
        <div className={`relative w-full overflow-hidden bg-night transition-[height] lg:aspect-auto lg:h-dvh ${sceneOnly ? "h-dvh" : "aspect-[9/10]"}`}>
          <Scene3D theCase={theCase} anchors={anchors} crew={crew} detective={detective} night={night} apiRef={sceneApi} chipInset={sceneOnly ? 96 : 40} fullTouch={sceneOnly} className="absolute inset-0 size-full">
            {theCase.clues.map((clue, i) => {
              const isFound = found.includes(clue.id);
              return (
                <button
                  key={clue.id}
                  data-anchor={clue.id}
                  onClick={() => inspect(clue)}
                  style={{ left: `${clue.x}%`, top: `${clue.y}%` }}
                  className="pointer-events-auto absolute grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center transition-transform active:scale-90"
                  aria-label={isFound ? `Evidence: ${clue.name}` : `Unknown clue ${i + 1}`}
                >
                  {!isFound && partnerFinds.has(clue.id) && walkingTo !== clue.id && (
                    <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-[#3b82f6] text-[10px] font-bold text-white ring-2 ring-white" title={`Det. ${partnerFinds.get(clue.id)!.name} found this`}>
                      {partnerFinds.get(clue.id)!.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  {walkingTo === clue.id ? (
                    <span className="grid size-8 place-items-center rounded-full bg-white/90 text-fg shadow-[0_0_0_3px_rgba(83,252,24,0.9)]">
                      <Search className="size-4 animate-pulse" />
                    </span>
                  ) : isFound ? (
                    <span className="grid size-7 place-items-center rounded-full bg-white text-fg shadow-[0_0_0_3px_rgba(83,252,24,0.9),0_6px_16px_rgba(0,0,0,0.4)]">
                      <Check className="size-4" strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="hotspot-ping relative grid size-6 place-items-center rounded-full">
                      <span className="size-3 rounded-full bg-neon shadow-[0_0_10px_2px_#53FC18]" />
                    </span>
                  )}
                </button>
              );
            })}
            {scraps.map((scrap) => {
              const got = scrapsFound.includes(scrap.id);
              return (
                <button
                  key={scrap.id}
                  data-anchor={scrap.id}
                  onClick={() => pickScrap(scrap)}
                  style={{ left: `${scrap.x}%`, top: `${scrap.y}%` }}
                  className="pointer-events-auto absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center transition-transform active:scale-90"
                  aria-label={got ? scrap.name : "Something small on the ground"}
                >
                  {walkingTo === scrap.id ? (
                    <span className="grid size-7 place-items-center rounded-full bg-white/90 text-fg shadow-[0_0_0_3px_rgba(245,165,36,0.9)]">
                      <Search className="size-3.5 animate-pulse" />
                    </span>
                  ) : got ? (
                    <span className="grid size-5 place-items-center rounded-full bg-[#F5A524] text-ink opacity-80 shadow-[0_3px_10px_rgba(0,0,0,0.35)]">
                      <Puzzle className="size-3" strokeWidth={2.5} />
                    </span>
                  ) : (
                    <span className={`scrap-glint size-2.5 rounded-full bg-[#F5A524] ${eagle ? "eagle size-3" : ""}`} />
                  )}
                </button>
              );
            })}
          </Scene3D>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),14px)]">
            <button onClick={onClose} aria-label="Back to cases" className="glass grid size-11 place-items-center rounded-full text-white transition active:scale-90">
              <ChevronLeft className="size-6" />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sfx.tap();
                  setBeat((b) => b + 1);
                  onFavorite();
                }}
                aria-label={favorite ? "Remove from favourites" : "Add to favourites"}
                aria-pressed={favorite}
                className={`grid size-11 place-items-center rounded-full transition active:scale-90 ${favorite ? "bg-white text-[#e0245e]" : "glass text-white"}`}
              >
                <Heart key={beat} className={`size-[18px] ${favorite ? "fill-current" : ""} ${beat ? "heart-beat" : ""}`} />
              </button>
              {canNight && (
                <button
                  onClick={() => {
                    sfx.whoosh();
                    setNight((n) => !n);
                  }}
                  aria-label={night ? "Back to the day scene" : "Night Shift: see the scene at night"}
                  aria-pressed={night}
                  title="Night Shift"
                  className={`grid size-11 place-items-center rounded-full transition active:scale-90 ${night ? "bg-white text-fg" : "glass text-white"}`}
                >
                  {night ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
                </button>
              )}
              {partners.length > 0 && (
                <button
                  onClick={() => {
                    sfx.tap();
                    setPhrasesOpen((o) => !o);
                  }}
                  aria-label="Quick message to the other detectives"
                  aria-expanded={phrasesOpen}
                  className={`grid size-11 place-items-center rounded-full transition active:scale-90 ${phrasesOpen ? "bg-white text-fg" : "glass text-white"}`}
                >
                  <MessageCircle className="size-[18px]" />
                </button>
              )}
              <button
                onClick={onToggleMusic}
                aria-label={state.musicOff ? "Play background music" : "Stop background music"}
                aria-pressed={!state.musicOff}
                title={STYLES[region.music].name}
                className={`grid size-11 place-items-center rounded-full transition active:scale-90 ${musicOn ? "bg-white text-fg" : "glass text-white"}`}
              >
                <Music className={`size-[18px] ${musicOn ? "sparkle" : ""}`} />
              </button>
              <button
                onClick={onToggleMute}
                aria-label={state.muted ? "Unmute sound" : "Mute sound"}
                className="glass grid size-11 place-items-center rounded-full text-white transition active:scale-90"
              >
                {state.muted ? <VolumeX className="size-[18px]" /> : <Volume2 className="size-[18px]" />}
              </button>
            </div>
          </div>
          <div className="pointer-events-none absolute left-4 top-[calc(max(env(safe-area-inset-top),14px)+54px)] flex items-center gap-2">
            <LiveBadge label={solved ? "CASE CLOSED" : "LIVE"} />
            <Watching n={watching} label="here now" />
            {eagle && scrapsFound.length < scraps.length && (
              <span className="rounded-full bg-[#F5A524] px-2 py-0.5 text-[11px] font-bold text-ink">🔎 {scraps.length - scrapsFound.length} scrap{scraps.length - scrapsFound.length === 1 ? "" : "s"} left</span>
            )}
          </div>
          {phrasesOpen && partners.length > 0 && (
            <div className="fade-in absolute right-4 top-[calc(max(env(safe-area-inset-top),14px)+54px)] z-[2] w-[min(320px,calc(100%-32px))] rounded-2xl bg-black/80 p-2.5 shadow-xl backdrop-blur" role="menu" aria-label="Quick messages">
              <div className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wide text-white/60">Say to the team · {LANG_NAME[langOf(region.state)]} too</div>
              <div className="flex flex-wrap gap-1.5">
                {phrasesFor(region.state).map(({ phrase, index }) => (
                  <button
                    key={index}
                    role="menuitem"
                    onClick={() => sendPhrase(index)}
                    title={phrase.means}
                    className={`rounded-full px-2.5 py-1.5 text-xs font-semibold transition active:scale-95 ${phrase.lang ? "bg-kick text-ink" : "bg-white/15 text-white"}`}
                  >
                    {phrase.text}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute left-4 right-4 top-[calc(max(env(safe-area-inset-top),14px)+90px)] flex flex-col items-start gap-1.5" aria-live="polite">
            {feed.map((f) => (
              <span key={f.id} className="fade-in line-clamp-2 max-w-full rounded-2xl bg-black/70 px-3 py-1.5 text-xs font-semibold leading-snug text-white shadow-lg">
                <span className="mr-1 inline-block size-2 rounded-full bg-[#3b82f6]" />
                {f.text}
              </span>
            ))}
          </div>
        </div>

        <div className={`lg:block lg:h-dvh lg:overflow-y-auto lg:bg-card ${sceneOnly ? "hidden" : ""}`}>
        {/* details sheet */}
        <div className="relative z-10 -mt-7 rounded-t-[28px] bg-card px-5 pb-6 pt-2.5 shadow-[0_-12px_30px_-20px_rgba(0,0,0,0.5)] lg:mt-0 lg:rounded-none lg:px-7 lg:pt-7 lg:shadow-none">
          <button
            onClick={() => {
              sfx.whoosh();
              setSceneOnly(true);
              scroller.current?.scrollTo({ top: 0 });
            }}
            aria-label="Hide the details and show the whole scene"
            className="-mt-1.5 flex w-full justify-center py-1.5 lg:hidden"
          >
            <span className="h-1 w-10 rounded-full bg-line" />
          </button>

          <div className="mt-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold leading-tight tracking-tight">{theCase.title}</h2>
              <p className="mt-0.5 text-[15px] text-neutral-600">
                {region.place === region.state ? region.state : `${region.place}, ${region.state}`} · {mode.name} 🔥
              </p>
            </div>
            {category && (
              <span className="mt-1 shrink-0 rounded-full border border-line px-3.5 py-1.5 text-sm font-medium text-neutral-700">
                {category.name.replace(/^(Island |Yaba |The )/, "")}
              </span>
            )}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 border-y border-line py-3.5">
            <Stat icon={Search} value={`${found.length}/${total}`} label="Clues found" />
            <Stat icon={Wallet} value={moneyShort(theCase.bounty)} label="Bounty" />
            <Stat icon={Eye} value={compact(watching)} label="Here now" />
          </div>

          <div className="mt-4 text-[15px] leading-relaxed text-neutral-600">
            <p className={more ? "" : "line-clamp-3"}>
              {more && (
                <>
                  <span className="font-semibold text-fg">Victim: </span>
                  {theCase.victim}
                  <br />
                </>
              )}
              {theCase.briefing}
            </p>
            <button onClick={() => setMore((m) => !m)} className="mt-0.5 font-semibold text-go">
              {more ? "Show less" : "Show more"}
            </button>
            {theCase.inspiredBy && (
              <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-raise px-3 py-2 text-[11px] leading-snug text-muted">
                <span className="mt-px shrink-0 rounded-full bg-fg px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-white">True story</span>
                <span>
                  Inspired by real reports: {theCase.inspiredBy} Names and details are invented.
                </span>
              </p>
            )}
            {solved && more && <p className="mt-2 rounded-2xl bg-raise p-3 text-sm text-fg">{theCase.solution}</p>}
          </div>

          {/* actions */}
          <div className="mt-5 flex items-center gap-3">
            {solved ? (
              <button
                onClick={() => {
                  sfx.whoosh();
                  setSweeping(true);
                }}
                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-kick font-bold text-ink shadow-[0_14px_28px_-14px_rgba(20,22,27,0.7)] transition active:scale-95"
              >
                <Timer className="size-5" />
                Timed Sweep
                <span className="flex">
                  {[1, 2, 3].map((i) => (
                    <Star key={i} className={`size-3.5 ${i <= (state.sweepStars[theCase.id] ?? 0) ? "fill-[#F5A524] text-[#F5A524]" : "opacity-40"}`} />
                  ))}
                </span>
              </button>
            ) : (
              <button
                disabled={!ready}
                onClick={() => {
                  sfx.whoosh();
                  setAccusing(true);
                }}
                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-kick px-3 text-[15px] font-bold text-ink shadow-[0_14px_28px_-14px_rgba(20,22,27,0.7)] transition enabled:active:scale-95 disabled:bg-raise disabled:text-muted disabled:shadow-none"
              >
                <Gavel className="size-5 shrink-0" />
                {ready ? "Accuse Now" : `Find ${theCase.requiredClues - found.length} more clue${theCase.requiredClues - found.length === 1 ? "" : "s"}`}
              </button>
            )}
            <button
              onClick={() => {
                sfx.whoosh();
                setAccusing(true);
              }}
              aria-label="Suspects"
              title="Suspects"
              className="soft grid size-14 shrink-0 place-items-center rounded-full border border-line bg-card transition active:scale-90"
            >
              <Users className="size-5" />
            </button>
            <button onClick={onBackup} aria-label="Call for backup" title="Call for backup" className="soft grid size-14 shrink-0 place-items-center rounded-full border border-line bg-card transition active:scale-90">
              <Siren className="size-5 text-danger" />
            </button>
          </div>
          {solved && (
            <p className="mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-muted">
              <Check className="size-3.5 text-go" /> Closed · Culprit: {culprit.name}
            </p>
          )}

          {/* evidence log */}
          <div className="mt-7 flex items-baseline justify-between">
            <h3 className="text-lg font-bold">Evidence Log</h3>
            <span className="text-sm font-semibold tabular-nums text-muted">
              <span className="text-fg">{found.length}</span>/{total} found
            </span>
          </div>
          <div className="mt-2.5 flex gap-1">
            {theCase.clues.map((c, i) => (
              <div key={c.id} className={`h-1.5 flex-1 rounded-full ${i < found.length ? "bg-kick" : "bg-line"}`} />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {theCase.clues.map((c) => {
              const isFound = found.includes(c.id);
              const isAnalyzed = analyzed.includes(c.id);
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  disabled={!isFound}
                  onClick={() => inspect(c)}
                  className="flex items-center gap-2.5 rounded-2xl bg-raise p-2.5 text-left transition enabled:active:scale-95 disabled:opacity-60"
                >
                  <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${isFound ? "bg-kick text-ink" : "bg-card text-muted"}`}>
                    {isFound ? <Icon className="size-4" /> : <HelpCircle className="size-4" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold">{isFound ? c.name : "Unknown evidence"}</span>
                    <span className={`block text-[10px] font-semibold ${isAnalyzed ? "text-go" : "text-muted"}`}>
                      {isAnalyzed ? "Lab don check am" : isFound ? "Lab never check am" : "Search the scene well"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* bonus evidence */}
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-[#F5A524]/60 bg-[#F5A524]/10 p-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#F5A524] text-ink">
              <Puzzle className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold">Bonus: {theme.title.toLowerCase()}</span>
                <span className="text-xs font-bold tabular-nums">{scrapsFound.length}/{scraps.length}</span>
              </span>
              <span className="block text-[11px] leading-snug text-neutral-600">
                {scrapsFound.length >= scraps.length
                  ? `The ${theme.item.replace(/^(torn|ripped|snapped) /, "")} is whole. Tap a scrap to read the lead again.`
                  : `Three scraps are hidden in this scene, small amber glints. Each pays ${moneyShort(BONUS_REWARD)}; find all three for a free lead.`}
              </span>
            </span>
          </div>

          {/* other branches */}
          <div className="mt-4 rounded-2xl bg-raise p-3">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-1.5 text-sm font-bold">
                <Users className="size-4" /> Detectives on this case
              </h4>
              <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${linked ? "text-go" : "text-muted"}`}>
                <span className={`size-1.5 rounded-full ${linked ? "bg-go" : "bg-muted"}`} />
                {linked ? "Live" : "Solo"}
              </span>
            </div>
            <ul className="mt-2 space-y-1.5">
              <li className="flex items-center gap-2 text-xs">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-kick text-[10px] font-bold text-ink">{(me.name || "D").charAt(0).toUpperCase()}</span>
                <span className="min-w-0 flex-1 truncate font-semibold">
                  Det. {me.name} <span className="font-normal text-muted">· {me.branch} (you)</span>
                </span>
                <span className="tabular-nums text-muted">{found.length} clue{found.length === 1 ? "" : "s"}</span>
              </li>
              {partners.map((p) => (
                <li key={p.key} className="flex items-center gap-2 text-xs">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#3b82f6] text-[10px] font-bold text-white">{p.name.charAt(0).toUpperCase()}</span>
                  <span className="min-w-0 flex-1 truncate font-semibold">
                    Det. {p.name} <span className="font-normal text-muted">· {p.branch} branch</span>
                  </span>
                  <span className="tabular-nums text-muted">
                    {p.found.length} clue{p.found.length === 1 ? "" : "s"}{p.bonus ? ` · ${p.bonus} scrap${p.bonus === 1 ? "" : "s"}` : ""}
                  </span>
                </li>
              ))}
            </ul>
            <button onClick={invite} className="mt-2.5 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-fg text-sm font-bold text-white transition active:scale-95">
              <Share2 className="size-4" /> Invite a detective from another branch
            </button>
            {invited && <p className="mt-1.5 select-all break-words text-[11px] text-neutral-700">{invited}</p>}
            {partners.length > 0 && <p className="mt-1.5 text-[11px] text-muted">Close the case together for a squad bonus: ₦20k for each other branch on the scene (up to 3).</p>}
            {partners.length === 0 && (
              <p className="mt-2 text-[11px] leading-snug text-muted">
                {linked
                  ? "No other branch is on this case right now. Share the game with friends: anyone who opens this case joins you live, walks the scene with you and shows you what they find."
                  : "Open the game on claude.ai to work cases live with detectives from other branches."}
              </p>
            )}
          </div>

          {/* detective chatter */}
          <div className="mt-5 flex items-start gap-2.5">
            <div className="size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-line">
              <Avatar face={theCase.lead.face} className="size-full" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-raise px-3.5 py-2.5 text-sm">
              <span className="text-xs font-bold">{theCase.lead.name}</span>
              <div className="text-neutral-700">{chatter(found.length, theCase, solved, culprit.name)}</div>
            </div>
          </div>
        </div>

        {/* similar cases */}
        {similar.length > 0 && (
          <div className="bg-card pb-[max(env(safe-area-inset-bottom),20px)]">
            <div className="flex items-baseline justify-between px-5 pb-3">
              <h3 className="text-lg font-bold">Similar Cases</h3>
              {category && (
                <button onClick={() => onSeeAll(category.id)} className="text-sm font-medium text-muted active:scale-95">
                  See All
                </button>
              )}
            </div>
            <MiniCases cases={similar} state={state} onOpen={onOpenCase} />
          </div>
        )}
        </div>
      </div>

      {sceneOnly && (
        <button
          onClick={() => {
            sfx.whoosh();
            setSceneOnly(false);
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={(e) => {
            e.preventDefault();
            const start = touch.current;
            touch.current = null;
            const t = e.changedTouches[0];
            // a tap or a swipe up brings the details back
            if (start && (t.clientY - start.y < -30 || Math.hypot(t.clientX - start.x, t.clientY - start.y) < 10)) {
              sfx.whoosh();
              setSceneOnly(false);
            }
          }}
          aria-label="Show the case details"
          className="sheet-up absolute inset-x-0 bottom-0 z-10 rounded-t-[28px] bg-card px-5 pb-[max(env(safe-area-inset-bottom),14px)] pt-2.5 text-left shadow-[0_-12px_30px_-20px_rgba(0,0,0,0.5)] lg:hidden"
        >
          <span className="mx-auto block h-1 w-10 rounded-full bg-line" />
          <span className="mt-2.5 flex items-center gap-3">
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold">{theCase.title}</span>
              <span className="block text-xs text-muted">
                {found.length}/{total} clues found · Swipe up for details
              </span>
            </span>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-kick text-ink">
              <ChevronUp className="size-5" />
            </span>
          </span>
        </button>
      )}

      {sweeping && (
        <SweepModal
          theCase={theCase}
          best={state.sweepStars[theCase.id] ?? 0}
          onClose={() => setSweeping(false)}
          onFinish={onSweepFinish}
          onFail={onSweepFail}
        />
      )}

      {tour !== null && <Tour step={tour} onStep={setTour} />}

      {openScrap && (
        <div className="absolute inset-0 z-10 flex items-end bg-black/40 fade-in lg:items-center lg:justify-center" onClick={() => setOpenScrap(null)}>
          <div
            className="sheet-up w-full rounded-t-3xl border-t border-[#F5A524]/50 bg-card px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-3 lg:max-w-md lg:rounded-3xl lg:border-0 lg:pb-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={openScrap.scrap.name}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line lg:hidden" />
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#F5A524]/20 px-2.5 py-1 text-xs font-bold text-[#a86a00]">
                Bonus evidence {scrapsFound.length}/{scraps.length}
              </span>
              <button onClick={() => setOpenScrap(null)} aria-label="Close" className="grid size-9 place-items-center rounded-full bg-raise active:scale-90">
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-4 flex items-start gap-3">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#F5A524] text-ink">
                <Puzzle className="size-7" />
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-bold leading-tight">{scrapsFound.length >= scraps.length ? `${theme.title}: complete` : `${theme.title} · piece ${Math.max(1, scrapsFound.length)} of ${scraps.length}`}</h3>
                {openScrap.fresh && (
                  <p className="mt-0.5 text-sm font-bold text-go">
                    +{moneyShort(BONUS_REWARD)} · +{BONUS_XP} XP
                  </p>
                )}
              </div>
            </div>
            <div className="mt-3 flex gap-1">
              {scraps.map((sc) => (
                <span key={sc.id} className={`h-1.5 flex-1 rounded-full ${scrapsFound.includes(sc.id) ? "bg-[#F5A524]" : "bg-line"}`} />
              ))}
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">
              {scraps[Math.max(1, Math.min(scraps.length, scrapsFound.length)) - 1]?.note}
            </p>
            {scrapsFound.length >= scraps.length && (
              <p className="mt-2 rounded-xl bg-[#F5A524]/15 px-3 py-2 text-xs font-semibold text-fg">Free lead unlocked. Open Suspects to challenge the statement.</p>
            )}
            <button onClick={() => setOpenScrap(null)} className="mt-4 h-12 w-full rounded-full bg-fg font-bold text-white active:scale-95">
              Keep searching
            </button>
          </div>
        </div>
      )}

      {openClue && (
        <ClueModal
          instant={labExpress}
          clue={openClue}
          foundCount={found.length}
          total={total}
          analyzed={analyzed.includes(openClue.id)}
          onAnalyze={() => onAnalyze(openClue.id)}
          onClose={() => setOpenClue(null)}
        />
      )}

      {accusing && (
        <SuspectSheet
          theCase={theCase}
          state={state}
          cluesNeeded={theCase.requiredClues - found.length}
          solved={solved}
          onClose={() => setAccusing(false)}
          onAccuse={(id) => {
            const verdict = accuseHere(id);
            setAccusing(false);
            return verdict;
          }}
          onCatch={onCatch}
          onStrike={onStrike}
        />
      )}
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Search; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-center">
      <span className="flex items-center gap-1 text-[15px] font-bold tabular-nums">
        <Icon className="size-4 text-muted" />
        {value}
      </span>
      <span className="text-[11px] text-muted">{label}</span>
    </div>
  );
}

function chatter(n: number, c: CrimeCase, solved: boolean, culprit: string) {
  const state = regionOf(c).state;
  const stage = solved ? "closed" : n === 0 ? "start" : n === c.clues.length ? "all" : n >= c.requiredClues ? "enough" : "some";
  const line = leadLine(state, stage);
  const extra = solved ? ` ${culprit} is in cuffs.` : stage === "some" ? ` ${c.requiredClues - n} more and we fit file an accusation.` : "";
  return (
    <>
      {line.say}
      {extra}
      {line.means && <span className="mt-0.5 block text-[11px] italic text-muted">“{line.means}” in {LANG_NAME[langOf(state)]}</span>}
    </>
  );
}

/* ---------------------------------------------------------------- clue popup */

interface ClueProps {
  /** Lab Express rank perk: scans come back at once. */
  instant?: boolean;
  clue: Clue;
  foundCount: number;
  total: number;
  analyzed: boolean;
  onAnalyze: () => void;
  onClose: () => void;
}

function ClueModal({ clue, foundCount, total, analyzed, onAnalyze, onClose, instant }: ClueProps) {
  const [scanning, setScanning] = useState(false);
  const [playing, setPlaying] = useState(false);
  const Icon = clue.icon;
  const LabIcon = clue.lab?.kind === "prints" ? Brush : clue.lab?.kind === "torn" ? Puzzle : FlaskConical;
  // The parent re-renders every few seconds (live counts), so keep the timer off its callbacks.
  const analyzeRef = useRef(onAnalyze);
  analyzeRef.current = onAnalyze;

  const labDone = () => {
    setPlaying(false);
    analyzeRef.current();
    sfx.reveal();
  };

  useEffect(() => {
    if (!scanning) return;
    const t = window.setTimeout(() => {
      setScanning(false);
      analyzeRef.current();
      sfx.reveal();
    }, 1250);
    return () => window.clearTimeout(t);
  }, [scanning]);

  return (
    <div className="absolute inset-0 z-10 flex items-end bg-black/40 fade-in lg:items-center lg:justify-center" onClick={onClose}>
      <div
        className="sheet-up no-scrollbar max-h-[94%] w-full overflow-y-auto rounded-t-3xl border-t border-kick/40 bg-card px-5 lg:max-w-lg lg:rounded-3xl lg:border-0 lg:pb-6 pb-[max(env(safe-area-inset-bottom),20px)] pt-3"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={clue.name}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-kick/15 px-2.5 py-1 text-xs font-bold text-kick">
            Clues Found: {foundCount}/{total}
          </span>
          <button onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full bg-raise active:scale-90">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 flex gap-4">
          <div className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-kick/25 to-ink ring-2 ring-kick/70">
            <Icon className="size-12 text-kick drop-shadow-[0_10px_24px_-14px_rgba(20,22,27,0.6)]" strokeWidth={1.6} />
            {scanning && <span className="scan-line absolute inset-x-0 h-0.5 bg-kick shadow-[0_10px_24px_-14px_rgba(20,22,27,0.6)]" />}
            <span className="absolute bottom-1 right-1.5 text-[9px] font-black tracking-wider text-kick/70">EVIDENCE</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-extrabold leading-tight">{clue.name}</h3>
            <p className="mt-1.5 text-sm leading-snug text-neutral-600">{clue.description}</p>
          </div>
        </div>

        <div className="mt-5">
          {analyzed ? (
            <div className="pop-in rounded-2xl border border-kick/40 bg-kick/10 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-kick">
                <Microscope className="size-4" /> Lab result
              </div>
              <p className="mt-1.5 text-sm leading-snug text-fg">{clue.finding}</p>
            </div>
          ) : playing && clue.lab?.kind === "prints" ? (
            <DustPrints shape={clue.lab.shape} onDone={labDone} />
          ) : playing && clue.lab?.kind === "torn" ? (
            <TornDocument lab={clue.lab} onDone={labDone} />
          ) : scanning ? (
            <div className="rounded-2xl border border-line bg-night p-3.5">
              <div className="flex items-center justify-between text-xs font-bold text-kick">
                <span>{clue.action}…</span>
                <span className="live-dot">ANALYSING</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
                <div className="scan-bar h-full rounded-full bg-kick" />
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                if (clue.lab) {
                  sfx.whoosh();
                  setPlaying(true);
                } else if (instant) {
                  analyzeRef.current();
                  sfx.reveal();
                } else {
                  sfx.scan();
                  setScanning(true);
                }
              }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-kick font-extrabold text-ink shadow-[0_10px_24px_-14px_rgba(20,22,27,0.6)] transition hover:brightness-110 active:scale-95"
            >
              <LabIcon className="size-5" />
              {clue.action}
              {clue.lab && <span className="rounded-full bg-ink/15 px-1.5 py-0.5 text-[10px] font-black">HANDS-ON</span>}
            </button>
          )}
        </div>

        <button onClick={onClose} className="mt-3 h-11 w-full rounded-full bg-raise text-sm font-bold transition hover:bg-line active:scale-95">
          Back to the scene
        </button>
      </div>
    </div>
  );
}

function useLockBodyScroll() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
}

/* ---------------------------------------------------------------- first-time tour */

const TOUR_KEY = "crime-life:tour-done";
const TOUR = [
  { emoji: "🟢", title: "Tap the green spots", text: "Each glowing green spot is a clue. Tap one and your detective walks over with his dog to check it." },
  { emoji: "🧩", title: "Look for amber glints", text: "Three small amber glints hide in every scene: scraps of something torn up at the scene. Each pays ₦5k; find all three for a free lead." },
  { emoji: "🔬", title: "Send clues to the lab", text: "Open a clue you found and analyse it. Some are mini-games: brush for prints or put torn pages back together." },
  { emoji: "🗣️", title: "Break their lies", text: "Open Suspects to interrogate. When a story doesn't match the evidence, call it a lie and show the clue." },
  { emoji: "🚔", title: "Make the arrest", text: "With 3 clues you can accuse. Right person: you collect the bounty. Wrong person: Internal Affairs fines you." },
  { emoji: "🤝", title: "Work with other branches", text: "Detectives who open the same case appear in your scene live. Close it together for a squad bonus." },
];

function Tour({ step, onStep }: { step: number; onStep: (s: number | null) => void }) {
  const t = TOUR[step];
  const last = step === TOUR.length - 1;
  const done = () => {
    try {
      window.localStorage.setItem(TOUR_KEY, "1");
    } catch {
      // fine: it shows again next time
    }
    onStep(null);
  };
  return (
    <div className="absolute inset-0 z-20 flex items-end bg-black/50 fade-in lg:items-center lg:justify-center" role="dialog" aria-label="How to play">
      <div className="sheet-up w-full rounded-t-3xl bg-card px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-4 lg:max-w-md lg:rounded-3xl lg:pb-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted">
            How to play · {step + 1}/{TOUR.length}
          </span>
          <button onClick={done} className="text-xs font-bold text-muted underline">
            Skip
          </button>
        </div>
        <div className="mt-3 text-4xl" aria-hidden>
          {t.emoji}
        </div>
        <h3 className="mt-2 text-xl font-bold">{t.title}</h3>
        <p className="mt-1 text-[15px] leading-relaxed text-neutral-700">{t.text}</p>
        <div className="mt-4 flex gap-1">
          {TOUR.map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-kick" : "bg-line"}`} />
          ))}
        </div>
        <button
          onClick={() => {
            sfx.tap();
            if (last) done();
            else onStep(step + 1);
          }}
          className="mt-4 h-12 w-full rounded-full bg-fg font-bold text-white active:scale-95"
        >
          {last ? "Oya, enter!" : "Next"}
        </button>
      </div>
    </div>
  );
}
