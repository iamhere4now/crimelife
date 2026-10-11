"use client";

import { useEffect, useState } from "react";
import { watchOnline, type OnlinePlayer } from "./multiplayer";

/*
 * How many detectives really have each case open right now, from the game's
 * live room (everyone announces which case they're on). One shared
 * subscription feeds every card. Outside claude.ai nobody else can be seen,
 * so the counts are 0 (the case screen adds you and your co-op partners).
 */

let online: OnlinePlayer[] = [];
const listeners = new Set<() => void>();
let stop: (() => void) | null = null;

function subscribe(fn: () => void) {
  listeners.add(fn);
  stop ??= watchOnline((players) => {
    online = players;
    listeners.forEach((l) => l());
  });
  return () => {
    listeners.delete(fn);
    if (!listeners.size) {
      stop?.();
      stop = null;
    }
  };
}

const countFor = (caseId: string) => online.filter((p) => p.caseId === caseId).length;

/** Detectives with this case open right now (you included, when you are on it). */
export function useLiveCount(caseId: string) {
  const [n, setN] = useState(() => countFor(caseId));
  useEffect(() => {
    setN(countFor(caseId));
    return subscribe(() => setN(countFor(caseId)));
  }, [caseId]);
  return n;
}

/** Everyone with the game open right now. */
export function useOnlineCount() {
  const [n, setN] = useState(online.length);
  useEffect(() => subscribe(() => setN(online.length)), []);
  return n;
}
