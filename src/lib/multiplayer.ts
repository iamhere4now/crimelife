/**
 * Everything that needs the claude.ai artifact runtime beyond the cloud save:
 * - asking Claude a question for the Senior Inspector (`sample`),
 * - the shared detectives' chat (`db`, one document per player under `chat/`),
 * - who is online right now (`room` presence).
 * Outside claude.ai `window.claude` is missing and each of these resolves
 * null, so the game falls back to scripted hints and the squad bots.
 */

import type { CaseId } from "./types";
import { maskRude, safeName } from "./clean";

type Unsub = () => void;
type Snap = { id: string; exists: boolean; data(): Record<string, unknown> | undefined };
type DocRef = { set(data: Record<string, unknown>): Promise<void>; get(): Promise<Snap> };
type CollectionRef = {
  doc(id: string): DocRef;
  onSnapshot(next: (s: { docs: Snap[] }) => void, error?: (e: { code: string }) => void): Unsub;
};
type Db = { collection(path: string): CollectionRef };
type User = { id(): Promise<string | null>; can?(name: string): Promise<boolean | null> | boolean | null };
type Peer = { peer: string; by: string | null; isMe: boolean; kind: string; presence: Record<string, unknown> };
type Room = {
  presence(patch: Record<string, unknown>): Promise<void>;
  peers(): readonly Peer[];
  onPeers(handler: (c: { peers: readonly Peer[] }) => void, onError?: (e: { code: string }) => void): Unsub;
};
type SampleFn = ((
  input: string,
  opts?: { onText?: (u: { text: string }) => void; signal?: AbortSignal; modelTier?: string; cache?: boolean },
) => Promise<{ text: string }>) & object;

type Runtime = { use(name: string): Promise<unknown> };

function runtime(): Runtime | null {
  if (typeof window === "undefined") return null;
  const c = (window as unknown as { claude?: Runtime }).claude;
  return c?.use ? c : null;
}

async function use<T>(name: string): Promise<T | null> {
  try {
    return ((await runtime()?.use(name)) as T | null) ?? null;
  } catch {
    return null;
  }
}

/* ---------------------------------------------------------------- Claude for the inspector */

let sampleOff = false;

/** Ask Claude; null when it isn't available here (or the viewer said no). */
export async function askClaude(prompt: string, onText: (text: string) => void, signal: AbortSignal): Promise<string | null> {
  if (sampleOff) return null;
  const sample = await use<SampleFn>("sample");
  if (!sample) {
    sampleOff = true;
    return null;
  }
  try {
    const { text } = await sample(prompt, { onText: ({ text }) => onText(text), signal, modelTier: "quick", cache: false });
    return text;
  } catch (e) {
    const code = (e as { code?: string })?.code;
    if (code && ["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"].includes(code)) sampleOff = true;
    if (code === "cancelled") throw e;
    return null;
  }
}

/* ---------------------------------------------------------------- chat */

export type Channel = "help" | "lounge";

export interface ChatMessage {
  id: string;
  at: number;
  ch: Channel;
  text: string;
  caseId?: CaseId;
  /** Author's player id (their chat document). */
  by: string;
  name: string;
  look: number;
  rank: string;
  mine: boolean;
  /** A local precinct-squad bot, never stored or shown to anyone else. */
  bot?: { face: import("./types").Face };
}

export interface Me {
  name: string;
  look: number;
  rank: string;
}

interface StoredMsg {
  id: string;
  at: number;
  ch: Channel;
  text: string;
  caseId?: string;
}

export interface Chat {
  myId: string;
  /** Live list of everyone's messages, oldest first. */
  subscribe(onMessages: (msgs: ChatMessage[]) => void, onError: () => void): Unsub;
  send(me: Me, msg: Omit<StoredMsg, "id" | "at">): Promise<"ok" | "read_only" | "failed">;
}

const KEEP_PER_PLAYER = 40;
export const MAX_TEXT = 280;

let chatPromise: Promise<Chat | null> | null = null;

function clean(s: unknown, max: number) {
  return typeof s === "string" ? s.replace(/[\u0000-\u001f\u200b-\u200f\u202a-\u202e]/g, " ").slice(0, max) : "";
}

export function connectChat(): Promise<Chat | null> {
  chatPromise ??= (async () => {
    const [db, user] = await Promise.all([use<Db>("db"), use<User>("user")]);
    if (!db || !user) return null;
    const myId = await user.id();
    if (!myId) return null;
    const col = db.collection("chat");
    let mine: StoredMsg[] = [];
    let queue: Promise<unknown> = Promise.resolve();

    const chat: Chat = {
      myId,
      subscribe(onMessages, onError) {
        return col.onSnapshot(
          (snap) => {
            const all: ChatMessage[] = [];
            for (const d of snap.docs) {
              const data = d.data();
              if (!data) continue;
              const msgs = Array.isArray(data.msgs) ? (data.msgs as StoredMsg[]) : [];
              if (d.id === myId) mine = msgs.slice(-KEEP_PER_PLAYER);
              for (const m of msgs) {
                if (!m || typeof m.at !== "number" || (m.ch !== "help" && m.ch !== "lounge")) continue;
                all.push({
                  id: `${d.id}:${clean(m.id, 40)}`,
                  at: m.at,
                  ch: m.ch,
                  text: maskRude(clean(m.text, MAX_TEXT)),
                  caseId: typeof m.caseId === "string" ? (m.caseId as CaseId) : undefined,
                  by: d.id,
                  name: safeName(clean(data.name, 32)) || "Detective",
                  look: typeof data.look === "number" ? data.look : 0,
                  rank: clean(data.rank, 8),
                  mine: d.id === myId,
                });
              }
            }
            all.sort((a, b) => a.at - b.at);
            onMessages(all);
          },
          () => onError(),
        );
      },
      send(me, msg) {
        const run = async (): Promise<"ok" | "read_only" | "failed"> => {
          const entry: StoredMsg = { id: Math.random().toString(36).slice(2, 10), at: Date.now(), ch: msg.ch, text: maskRude(clean(msg.text, MAX_TEXT)) };
          if (msg.caseId) entry.caseId = msg.caseId;
          const next = [...mine, entry].slice(-KEEP_PER_PLAYER);
          try {
            await col.doc(myId).set({ name: clean(me.name, 32), look: me.look, rank: clean(me.rank, 8), msgs: next });
            mine = next;
            return "ok";
          } catch (e) {
            return (e as { code?: string })?.code === "invalid_argument" ? "read_only" : "failed";
          }
        };
        // one write at a time to our own document
        const p = queue.then(run, run);
        queue = p;
        return p;
      },
    };
    return chat;
  })().catch(() => null);
  return chatPromise;
}

/* ---------------------------------------------------------------- who's online */

export interface OnlinePlayer {
  peer: string;
  name: string;
  look: number;
  caseId?: string;
  isMe: boolean;
}

let roomPromise: Promise<Room | null> | null = null;
function room() {
  roomPromise ??= use<Room>("room");
  return roomPromise;
}

/** Tell everyone here who you are and which case you're on. */
export async function announce(me: Me, caseId?: CaseId) {
  const r = await room();
  try {
    await r?.presence({ name: me.name.slice(0, 32), look: me.look, caseId: caseId ?? null });
  } catch {
    // presence is best effort
  }
}

/** Live list of detectives with the game open right now. */
export function watchOnline(onChange: (players: OnlinePlayer[]) => void): Unsub {
  let stop: Unsub | null = null;
  let dead = false;
  void room().then((r) => {
    if (!r || dead) return;
    const map = (peers: readonly Peer[]) =>
      peers
        .filter((p) => p.kind === "viewer")
        .map((p) => ({
          peer: p.peer,
          name: clean(p.presence?.name, 32) || "Detective",
          look: typeof p.presence?.look === "number" ? (p.presence.look as number) : 0,
          caseId: typeof p.presence?.caseId === "string" ? (p.presence.caseId as string) : undefined,
          isMe: p.isMe,
        }));
    onChange(map(r.peers()));
    stop = r.onPeers(({ peers }) => onChange(map(peers)), () => onChange([]));
  });
  return () => {
    dead = true;
    stop?.();
  };
}
