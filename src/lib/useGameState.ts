"use client";

import { PRIZES, rollPrize } from "./spin";
import { hasUnlock } from "./unlocks";
import { useCallback, useEffect, useRef, useState } from "react";
import { CASE_BY_ID } from "./cases";
import { readCloudSave, writeCloudSave } from "./cloudSave";
import { modesClosed, modesOpened } from "./modes";
import { DEMOTION_FINE_RATE, LOSS_LIMIT, RANKS, rankIndex, type RankEvent, XP_ARREST, XP_LIE, XP_STAR } from "./ranks";
import { setMuted } from "./SoundEffects";
import type { CaseId, DetectiveProfile, GameState, SaveStore, Verdict } from "./types";

/** Single-detective saves from before profiles existed (v1 dollars, v2 naira). */
const LEGACY_KEY = "crime-life:v1";
const STORAGE_KEY = "crime-life:v3";
const SAVED_AT_KEY = `${STORAGE_KEY}:savedAt`;
/** Wait for a pause in play before syncing to the cloud. */
const CLOUD_DEBOUNCE_MS = 1500;

// All money is in naira.
export const START_BALANCE = 250_000;
export const START_RATING = 4.0;
export const FINE = 100_000;
export const RATING_UP = 0.2;
export const RATING_DOWN = 0.3;
/** Paid the first time each lie is caught. */
export const LIE_BONUS = 25_000;
/** Wrong evidence a suspect tolerates before they lawyer up. */
export const MAX_STRIKES = 3;
/** Bonus for each timed-sweep star above the previous best. */
export const STAR_REWARD = 15_000;
/** Merit for each bonus evidence scrap. */
export const BONUS_XP = 5;
/** Paid for every star on every completed sweep, replays included. */
export const HUSTLE_PER_STAR = 5_000;
/** Version 1 saves held dollar amounts; naira amounts are 100× those. */
const V1_TO_NAIRA = 100;
const GUEST_ID = "guest";

export const initialState: GameState = {
  version: 2,
  balance: START_BALANCE,
  rating: START_RATING,
  solved: [],
  found: {},
  bonus: {},
  analyzed: {},
  wrong: {},
  muted: false,
  stats: { accusations: 0, correct: 0, earned: 0, fines: 0 },
  caught: {},
  strikes: {},
  sweepStars: {},
  xp: 0,
  lossStreak: 0,
  musicOff: false,
  squads: 0,
  daily: { day: "", streak: 0, best: 0, claimed: "", done: "", spun: "", spins: 0 },
  badges: [],
  favorites: [],
  hunts: {},
};

/** Paid for finishing a sponsored hunt (on top of the sponsor's offer). */
export const HUNT_REWARD = 10_000;

/** Paid per partner (up to three) for closing a case with other branches on the scene. */
export const SQUAD_REWARD = 20_000;
export const SQUAD_XP = 10;
/** Daily check-in pays this × the streak (capped at a week). */
export const STREAK_REWARD = 5_000;
export const DAILY_REWARD = 30_000;

/** Today's date on this device, YYYY-MM-DD. */
export function today(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return today(d);
}

const emptyStore: SaveStore = { version: 3, activeId: null, profiles: {} };

const clampRating = (r: number) => Math.round(Math.min(5, Math.max(0, r)) * 10) / 10;

function addUnique(list: string[] | undefined, id: string) {
  return list?.includes(id) ? list : [...(list ?? []), id];
}

/** Merit for saves made before XP existed, so veterans don't restart at Constable. */
function estimateXp(s: GameState): number {
  const lies = Object.values(s.caught).reduce((n, ids) => n + (ids?.length ?? 0), 0);
  const stars = Object.values(s.sweepStars).reduce((n, v) => n + (v ?? 0), 0);
  return s.solved.length * XP_ARREST + lies * XP_LIE + stars * XP_STAR;
}

/** Turn any saved game shape (old or new) into a current GameState. */
function normalizeState(raw: unknown): GameState {
  if (!raw || typeof raw !== "object") return initialState;
  const parsed = raw as Omit<Partial<GameState>, "version"> & { version?: number };
  let base: GameState;
  if (parsed.version === 1) {
    // Same game, new currency: scale the old dollar amounts to naira.
    const stats = { ...initialState.stats, ...parsed.stats };
    base = {
      ...initialState,
      ...parsed,
      version: 2,
      balance: (parsed.balance ?? 0) * V1_TO_NAIRA,
      stats: { ...stats, earned: stats.earned * V1_TO_NAIRA, fines: stats.fines * V1_TO_NAIRA },
    } as GameState;
  } else if (parsed.version === 2) {
    base = { ...initialState, ...parsed, version: 2, stats: { ...initialState.stats, ...parsed.stats }, daily: { ...initialState.daily, ...parsed.daily } } as GameState;
  } else {
    return initialState;
  }
  return {
    ...base,
    xp: typeof parsed.xp === "number" ? parsed.xp : estimateXp(base),
    lossStreak: typeof parsed.lossStreak === "number" ? parsed.lossStreak : 0,
  };
}

/** Turn any saved shape (a profile store, or an older single save) into a SaveStore. */
function normalizeStore(raw: unknown): SaveStore {
  if (!raw || typeof raw !== "object") return emptyStore;
  const r = raw as { version?: number; activeId?: unknown; profiles?: Record<string, Partial<DetectiveProfile>> };
  if (r.version === 3 && r.profiles && typeof r.profiles === "object") {
    const profiles: Record<string, DetectiveProfile> = {};
    for (const [id, p] of Object.entries(r.profiles)) {
      if (!p || typeof p.name !== "string") continue;
      profiles[id] = {
        id,
        name: p.name.slice(0, 24),
        look: Number(p.look) || 0,
        face: typeof p.face === "string" ? p.face.slice(0, 16) : undefined,
        fullName: typeof p.fullName === "string" ? p.fullName.slice(0, 80) : undefined,
        email: typeof p.email === "string" ? p.email.slice(0, 120) : undefined,
        createdAt: Number(p.createdAt) || 0,
        state: normalizeState(p.state),
      };
    }
    const activeId = typeof r.activeId === "string" && profiles[r.activeId] ? r.activeId : null;
    return { version: 3, activeId, profiles };
  }
  if (r.version === 1 || r.version === 2) {
    const main: DetectiveProfile = { id: "main", name: "Detective", look: 0, createdAt: 0, state: normalizeState(raw) };
    return { version: 3, activeId: "main", profiles: { main } };
  }
  return emptyStore;
}

function readJson(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadLocal(): SaveStore {
  return normalizeStore(readJson(STORAGE_KEY) ?? readJson(LEGACY_KEY));
}

function localSavedAt(): number {
  try {
    const at = window.localStorage.getItem(SAVED_AT_KEY) ?? window.localStorage.getItem(`${LEGACY_KEY}:savedAt`);
    return Number(at) || 0;
  } catch {
    return 0;
  }
}

function storeLocally(json: string, savedAt: number) {
  try {
    window.localStorage.setItem(STORAGE_KEY, json);
    window.localStorage.setItem(SAVED_AT_KEY, String(savedAt));
  } catch {
    // Storage can be full or blocked (private mode); the cloud copy may still have it.
  }
}

/**
 * A loss (wrong arrest, failed sweep). The fifth in a row drops one rank and
 * fines 10% of the wallet; a Constable can't drop further but still pays.
 */
function recordLoss(s: GameState): { next: GameState; demotionFine: number | null } {
  const streak = s.lossStreak + 1;
  if (streak < LOSS_LIMIT) return { next: { ...s, lossStreak: streak }, demotionFine: null };
  const r = rankIndex(s.xp);
  const fine = Math.max(0, Math.round(s.balance * DEMOTION_FINE_RATE));
  return {
    next: {
      ...s,
      lossStreak: 0,
      xp: r > 0 ? RANKS[r - 1].xp : s.xp,
      balance: s.balance - fine,
      stats: { ...s.stats, fines: s.stats.fines + fine },
    },
    demotionFine: fine,
  };
}

function withMoney(s: GameState, delta: number): GameState {
  return { ...s, balance: s.balance + delta };
}

export function useGameState() {
  const [store, setStore] = useState<SaveStore>(emptyStore);
  const [hydrated, setHydrated] = useState(false);
  const [rankEvent, setRankEvent] = useState<RankEvent | null>(null);
  const storeRef = useRef(store);
  storeRef.current = store;
  // JSON of the last store we saved, so loading a save never counts as a new change.
  const lastSaved = useRef<string | null>(null);

  const active = store.activeId ? (store.profiles[store.activeId] ?? null) : null;
  const state = active?.state ?? initialState;

  const replaceStore = useCallback((next: SaveStore) => {
    storeRef.current = next;
    setStore(next);
    const s = next.activeId ? next.profiles[next.activeId]?.state : null;
    if (s) setMuted(s.muted);
  }, []);

  // Read saved progress after mount so server and first client render match.
  // The local copy shows straight away; a newer cloud save (from another device) replaces it.
  useEffect(() => {
    const local = loadLocal();
    lastSaved.current = JSON.stringify(local);
    replaceStore(local);
    setHydrated(true);

    let cancelled = false;
    readCloudSave().then((cloud) => {
      if (cancelled || !cloud || cloud.savedAt <= localSavedAt()) return;
      const next = normalizeStore(cloud.state);
      const json = JSON.stringify(next);
      lastSaved.current = json;
      storeLocally(json, cloud.savedAt);
      replaceStore(next);
    });
    return () => {
      cancelled = true;
    };
  }, [replaceStore]);

  useEffect(() => {
    if (!hydrated) return;
    const json = JSON.stringify(store);
    if (json === lastSaved.current) return;
    lastSaved.current = json;
    const savedAt = Date.now();
    storeLocally(json, savedAt);
    const t = window.setTimeout(() => void writeCloudSave({ savedAt, state: store }), CLOUD_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [store, hydrated]);

  const current = useCallback((): GameState => {
    const st = storeRef.current;
    return (st.activeId && st.profiles[st.activeId]?.state) || initialState;
  }, []);

  /**
   * Save the active detective's new state and announce any promotion. A demotion
   * is announced explicitly (with its fine) because a Constable's rank doesn't change.
   */
  const commit = useCallback((next: GameState, demotion?: { fine: number; balanceBefore: number }) => {
    const st = storeRef.current;
    const id = st.activeId;
    if (!id || !st.profiles[id]) return;
    const before = rankIndex(st.profiles[id].state.xp);
    const after = rankIndex(next.xp);
    const updated = { ...st, profiles: { ...st.profiles, [id]: { ...st.profiles[id], state: next } } };
    storeRef.current = updated;
    setStore(updated);
    if (demotion) {
      setRankEvent({
        id: Date.now(),
        kind: "demoted",
        from: RANKS[before],
        to: RANKS[after],
        fine: demotion.fine,
        closed: modesClosed(demotion.balanceBefore, next.balance),
      });
    } else if (after > before) {
      setRankEvent({ id: Date.now(), kind: "promoted", from: RANKS[before], to: RANKS[after], fine: 0, closed: [] });
    }
  }, []);

  /** Commit a loss, announcing the demotion when it's the fifth in a row. */
  const commitLoss = useCallback(
    (s: GameState) => {
      const { next, demotionFine } = recordLoss(s);
      commit(next, demotionFine === null ? undefined : { fine: demotionFine, balanceBefore: s.balance });
    },
    [commit],
  );

  const findClue = useCallback(
    (caseId: CaseId, clueId: string) => {
      const s = current();
      commit({ ...s, found: { ...s.found, [caseId]: addUnique(s.found[caseId], clueId) } });
    },
    [commit, current],
  );

  /** Pick up a bonus evidence scrap: a little cash and merit, once per scrap. */
  const findBonus = useCallback(
    (caseId: CaseId, bonusId: string, reward: number) => {
      const s = current();
      if (s.bonus?.[caseId]?.includes(bonusId)) return false;
      commit({
        ...s,
        bonus: { ...(s.bonus ?? {}), [caseId]: addUnique(s.bonus?.[caseId], bonusId) },
        balance: s.balance + reward,
        xp: s.xp + BONUS_XP,
        stats: { ...s.stats, earned: s.stats.earned + reward },
      });
      return true;
    },
    [commit, current],
  );

  /** Closed a case with detectives from other branches there: a squad bonus. */
  const squadBonus = useCallback(
    (partners: number) => {
      const n = Math.max(0, Math.min(3, Math.floor(partners)));
      if (!n) return 0;
      const s = current();
      const reward = Math.round(n * SQUAD_REWARD * (hasUnlock(s.xp, "leader") ? 1.5 : 1));
      commit({ ...withMoney(s, reward), xp: s.xp + n * SQUAD_XP, squads: (s.squads ?? 0) + 1, stats: { ...s.stats, earned: s.stats.earned + reward } });
      return reward;
    },
    [commit, current],
  );

  /** Opened the game today: keep (or restart) the daily streak. */
  const checkIn = useCallback(() => {
    const s = current();
    const d = s.daily ?? initialState.daily;
    const t = today();
    if (d.day === t) return;
    const streak = d.day === yesterday() ? d.streak + 1 : 1;
    commit({ ...s, daily: { ...d, day: t, streak, best: Math.max(d.best, streak) } });
  }, [commit, current]);

  /** Collect today's streak reward; returns what was paid (0 if already collected). */
  const claimStreak = useCallback(() => {
    const s = current();
    const d = s.daily ?? initialState.daily;
    const t = today();
    if (d.claimed === t || d.day !== t) return 0;
    const reward = STREAK_REWARD * Math.min(7, Math.max(1, d.streak)) * (hasUnlock(s.xp, "streak2") ? 2 : 1);
    commit({ ...withMoney(s, reward), daily: { ...d, claimed: t }, stats: { ...s.stats, earned: s.stats.earned + reward } });
    return reward;
  }, [commit, current]);

  /** Finished today's challenge; returns what was paid (0 if already done today). */
  const finishDaily = useCallback(() => {
    const s = current();
    const d = s.daily ?? initialState.daily;
    const t = today();
    if (d.done === t) return 0;
    commit({ ...withMoney(s, DAILY_REWARD), xp: s.xp + 15, daily: { ...d, done: t }, stats: { ...s.stats, earned: s.stats.earned + DAILY_REWARD } });
    return DAILY_REWARD;
  }, [commit, current]);

  /** Heart or un-heart a case; returns whether it is now a favourite. */
  const toggleFavorite = useCallback(
    (caseId: CaseId) => {
      const s = current();
      const favs = s.favorites ?? [];
      const on = !favs.includes(caseId);
      commit({ ...s, favorites: on ? [caseId, ...favs] : favs.filter((id) => id !== caseId) });
      return on;
    },
    [commit, current],
  );

  /** Spins left today (one, or two from the Lucky Hands rank). */
  const spinsLeft = useCallback(() => {
    const s = current();
    const d = s.daily ?? initialState.daily;
    const allowed = hasUnlock(s.xp, "spin2") ? 2 : 1;
    return d.spun === today() ? Math.max(0, allowed - (d.spins ?? 0)) : allowed;
  }, [current]);

  /** Spin the Lucky Spin: returns the prize index, or -1 when no spin is left today. */
  const spin = useCallback(() => {
    if (spinsLeft() <= 0) return -1;
    const s = current();
    const d = s.daily ?? initialState.daily;
    const t = today();
    const i = rollPrize();
    const prize = PRIZES[i];
    commit({
      ...withMoney(s, prize.money),
      xp: s.xp + prize.xp,
      daily: { ...d, spun: t, spins: (d.spun === t ? (d.spins ?? 0) : 0) + 1 },
      stats: { ...s.stats, earned: s.stats.earned + prize.money },
    });
    return i;
  }, [commit, current, spinsLeft]);

  /** Pick up a token in a sponsored hunt; pays HUNT_REWARD when the last one is found. */
  const findHuntToken = useCallback(
    (huntId: string, tokenId: string, total: number) => {
      const s = current();
      const got = s.hunts?.[huntId] ?? [];
      if (got.includes(tokenId)) return { fresh: false, done: got.length >= total, paid: 0 };
      const next = [...got, tokenId];
      const done = next.length >= total;
      const paid = done ? HUNT_REWARD : 0;
      commit({
        ...withMoney(s, paid),
        xp: s.xp + (done ? 10 : 0),
        hunts: { ...(s.hunts ?? {}), [huntId]: next },
        stats: { ...s.stats, earned: s.stats.earned + paid },
      });
      return { fresh: true, done, paid };
    },
    [commit, current],
  );

  /** Record newly earned badges. */
  const awardBadges = useCallback(
    (ids: string[]) => {
      const s = current();
      const fresh = ids.filter((id) => !(s.badges ?? []).includes(id));
      if (fresh.length) commit({ ...s, badges: [...(s.badges ?? []), ...fresh] });
    },
    [commit, current],
  );

  const analyzeClue = useCallback(
    (caseId: CaseId, clueId: string) => {
      const s = current();
      commit({
        ...s,
        found: { ...s.found, [caseId]: addUnique(s.found[caseId], clueId) },
        analyzed: { ...s.analyzed, [caseId]: addUnique(s.analyzed[caseId], clueId) },
      });
    },
    [commit, current],
  );

  const toggleMute = useCallback(() => {
    const s = current();
    setMuted(!s.muted);
    commit({ ...s, muted: !s.muted });
  }, [commit, current]);

  const toggleMusic = useCallback(() => {
    const s = current();
    commit({ ...s, musicOff: !s.musicOff });
  }, [commit, current]);

  /** Settle an accusation. Computed from the latest state so the verdict and the update agree. */
  const accuse = useCallback(
    (caseId: CaseId, suspectId: string): Verdict => {
      const s = current();
      const theCase = CASE_BY_ID[caseId];
      const stats = { ...s.stats, accusations: s.stats.accusations + 1 };

      if (suspectId === theCase.culpritId) {
        const firstSolve = !s.solved.includes(caseId);
        const bounty = firstSolve ? theCase.bounty : 0;
        const paid = withMoney(s, bounty);
        const verdict: Verdict = {
          kind: "correct",
          caseId,
          suspectId,
          bounty,
          ratingDelta: firstSolve ? RATING_UP : 0,
          opened: modesOpened(s.balance, paid.balance),
        };
        commit({
          ...paid,
          rating: clampRating(s.rating + verdict.ratingDelta),
          solved: firstSolve ? [...s.solved, caseId] : s.solved,
          xp: s.xp + (firstSolve ? XP_ARREST : 0),
          lossStreak: 0,
          stats: { ...stats, correct: stats.correct + 1, earned: stats.earned + bounty },
        });
        return verdict;
      }

      const verdict: Verdict = {
        kind: "wrong",
        caseId,
        suspectId,
        fine: FINE,
        ratingDelta: -RATING_DOWN,
        closed: modesClosed(s.balance, s.balance - FINE),
      };
      commitLoss({
        ...s,
        balance: s.balance - FINE,
        rating: clampRating(s.rating - RATING_DOWN),
        wrong: { ...s.wrong, [caseId]: addUnique(s.wrong[caseId], suspectId) },
        stats: { ...stats, fines: stats.fines + FINE },
      });
      return verdict;
    },
    [commit, commitLoss, current],
  );

  /** Break a lie with evidence. Returns the bonus paid (0 if it was already caught). */
  const catchLie = useCallback(
    (caseId: CaseId, statementId: string): number => {
      const s = current();
      if (s.caught[caseId]?.includes(statementId)) return 0;
      commit({
        ...withMoney(s, LIE_BONUS),
        xp: s.xp + XP_LIE,
        caught: { ...s.caught, [caseId]: addUnique(s.caught[caseId], statementId) },
        stats: { ...s.stats, earned: s.stats.earned + LIE_BONUS },
      });
      return LIE_BONUS;
    },
    [commit, current],
  );

  /** Pay for something (a hint from the Senior Inspector). False when the wallet is short. */
  const spend = useCallback(
    (amount: number): boolean => {
      const s = current();
      if (amount > 0 && s.balance < amount) return false;
      commit(withMoney(s, -amount));
      return true;
    },
    [commit, current],
  );

  /** Wrong evidence presented. Returns the suspect's new strike count. */
  const addStrike = useCallback(
    (caseId: CaseId, suspectId: string): number => {
      const s = current();
      const forCase = s.strikes[caseId] ?? {};
      const count = Math.min(MAX_STRIKES, (forCase[suspectId] ?? 0) + 1);
      commit({ ...s, strikes: { ...s.strikes, [caseId]: { ...forCase, [suspectId]: count } } });
      return count;
    },
    [commit, current],
  );

  /**
   * A completed sweep: resets the losing streak and returns the payout. Every star
   * pays hustle money, so a broke detective can always earn their way back into a
   * mode; stars above your best pay a bonus on top.
   */
  const finishSweep = useCallback(
    (caseId: CaseId, stars: number): number => {
      const s = current();
      const best = s.sweepStars[caseId] ?? 0;
      const newStars = Math.max(0, stars - best);
      const reward = stars * HUSTLE_PER_STAR + newStars * STAR_REWARD;
      commit({
        ...withMoney(s, reward),
        xp: s.xp + newStars * XP_STAR,
        lossStreak: 0,
        sweepStars: { ...s.sweepStars, [caseId]: Math.max(best, stars) },
        stats: { ...s.stats, earned: s.stats.earned + reward },
      });
      return reward;
    },
    [commit, current],
  );

  /** The clock ran out on a sweep: a loss. */
  const failSweep = useCallback(() => {
    commitLoss(current());
  }, [commitLoss, current]);

  const reset = useCallback(() => {
    commit({ ...initialState, muted: current().muted });
  }, [commit, current]);

  const clearRankEvent = useCallback(() => setRankEvent(null), []);

  /* ---------- detectives on this account ---------- */

  const signUp = useCallback(
    (name: string, look: number, contact?: { fullName: string; email: string }) => {
      const st = storeRef.current;
      const id = `d${Date.now().toString(36)}`;
      const profile: DetectiveProfile = { id, name: name.trim().slice(0, 24), look, fullName: contact?.fullName, email: contact?.email, createdAt: Date.now(), state: { ...initialState } };
      replaceStore({ ...st, activeId: id, profiles: { ...st.profiles, [id]: profile } });
    },
    [replaceStore],
  );

  const signIn = useCallback(
    (id: string) => {
      const st = storeRef.current;
      if (st.profiles[id]) replaceStore({ ...st, activeId: id });
    },
    [replaceStore],
  );

  const playAsGuest = useCallback(() => {
    const st = storeRef.current;
    if (st.profiles[GUEST_ID]) return signIn(GUEST_ID);
    const guest: DetectiveProfile = { id: GUEST_ID, name: "Guest Detective", look: 0, createdAt: Date.now(), state: { ...initialState } };
    replaceStore({ ...st, activeId: GUEST_ID, profiles: { ...st.profiles, [GUEST_ID]: guest } });
  }, [replaceStore, signIn]);

  /** Save the look designed in the editor (a face code) on the active detective. */
  const setFace = useCallback(
    (code: string) => {
      const st = storeRef.current;
      const id = st.activeId;
      if (!id || !st.profiles[id]) return;
      replaceStore({ ...st, profiles: { ...st.profiles, [id]: { ...st.profiles[id], face: code } } });
    },
    [replaceStore],
  );

  const signOut = useCallback(() => {
    replaceStore({ ...storeRef.current, activeId: null });
  }, [replaceStore]);

  return {
    store,
    active,
    state,
    hydrated,
    rankEvent,
    clearRankEvent,
    findClue,
    findBonus,
    squadBonus,
    checkIn,
    claimStreak,
    finishDaily,
    awardBadges,
    toggleFavorite,
    spinsLeft,
    spin,
    findHuntToken,
    setFace,
    analyzeClue,
    toggleMute,
    toggleMusic,
    accuse,
    catchLie,
    addStrike,
    spend,
    finishSweep,
    failSweep,
    reset,
    signUp,
    signIn,
    playAsGuest,
    signOut,
  };
}

export type Game = ReturnType<typeof useGameState>;
