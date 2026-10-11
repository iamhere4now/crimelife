"use client";

import { ChevronLeft, FolderOpen, LifeBuoy, Send, Siren } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CASE_BY_ID, SQUADS } from "@/lib/cases";
import { lookFace } from "@/lib/looks";
import { connectChat, MAX_TEXT, watchOnline, type Channel, type Chat, type ChatMessage, type Me, type OnlinePlayer } from "@/lib/multiplayer";
import { sfx } from "@/lib/SoundEffects";
import type { CaseId, CrimeCase, GameState } from "@/lib/types";
import { Avatar } from "./Avatar";

interface Props {
  theCase: CrimeCase;
  state: GameState;
  me: Me;
  start: Channel;
  onOpenCase: (id: CaseId) => void;
  onBack: () => void;
}

/** The detectives' line: a help desk for stuck cases and a lounge to gist, shared with everyone playing. */
export function PlayerChat({ theCase, state, me, start, onOpenCase, onBack }: Props) {
  const [chat, setChat] = useState<Chat | null | "loading">("loading");
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [bots, setBots] = useState<ChatMessage[]>([]);
  const [local, setLocal] = useState<ChatMessage[]>([]);
  const [online, setOnline] = useState<OnlinePlayer[]>([]);
  const [channel, setChannel] = useState<Channel>(start);
  const [text, setText] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const seen = useRef<Set<string>>(new Set());
  const botTimer = useRef<number | null>(null);
  const msgsRef = useRef(msgs);
  msgsRef.current = msgs;

  useEffect(() => {
    let unsub: (() => void) | null = null;
    let live = true;
    void connectChat().then((c) => {
      if (!live) return;
      setChat(c);
      if (!c) return;
      unsub = c.subscribe(
        (all) => {
          const fresh = all.filter((m) => !m.mine && !seen.current.has(m.id));
          if (seen.current.size > 0 && fresh.length > 0) sfx.message();
          all.forEach((m) => seen.current.add(m.id));
          setMsgs(all);
        },
        () => setNote("Chat don disconnect. Close am and open again."),
      );
    });
    const stopOnline = watchOnline(setOnline);
    return () => {
      live = false;
      unsub?.();
      stopOnline();
      if (botTimer.current) window.clearTimeout(botTimer.current);
    };
  }, []);

  const shown = useMemo(
    () => [...msgs, ...local, ...bots].filter((m) => m.ch === channel).sort((a, b) => a.at - b.at).slice(-120),
    [msgs, local, bots, channel],
  );

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [shown.length, channel]);

  const connected = chat !== null && chat !== "loading";
  const found = state.found[theCase.id]?.length ?? 0;
  const others = online.filter((p) => !p.isMe);

  /** If no real detective answers a help request soon, a precinct squad bot does. */
  const squadFollowUp = (caseId: CaseId, after: number) => {
    if (botTimer.current) window.clearTimeout(botTimer.current);
    botTimer.current = window.setTimeout(() => {
      const answered = msgsRef.current.some((m) => !m.mine && m.ch === "help" && m.at > after);
      if (answered) return;
      const squad = SQUADS[Math.floor(Math.random() * SQUADS.length)];
      const at = Date.now();
      setBots((b) => [
        ...b,
        { id: `bot-${at}`, at, ch: "help", text: squad.tips[caseId] ?? squad.fallback, by: squad.id, name: squad.name, look: 0, rank: "", mine: false, bot: { face: squad.face } },
      ]);
      sfx.message();
    }, 6500 + Math.random() * 3000);
  };

  const post = async (body: string, ch: Channel, caseId?: CaseId) => {
    const clean = body.trim().slice(0, MAX_TEXT);
    if (!clean || sending) return;
    sfx.tap();
    const at = Date.now();
    if (!connected) {
      // Not on claude.ai: keep it on this phone and let the squad answer.
      setLocal((l) => [...l, { id: `local-${at}`, at, ch, text: clean, caseId, by: "me", name: me.name, look: me.look, rank: me.rank, mine: true }]);
      if (ch === "help" && caseId) squadFollowUp(caseId, at);
      return;
    }
    setSending(true);
    const result = await chat.send(me, { ch, text: clean, caseId });
    setSending(false);
    if (result === "read_only") setNote("You fit read this chat, but your access no allow you post. Ask the person wey share the game to make you a Contributor or Editor.");
    else if (result === "failed") setNote("Message no send. Check your network and try again.");
    else if (ch === "help" && caseId) squadFollowUp(caseId, at);
  };

  return (
    <div className="fixed inset-0 z-[65] mx-auto flex max-w-md flex-col overflow-hidden bg-ink fade-in lg:inset-y-8 lg:max-w-xl lg:rounded-[32px] lg:shadow-2xl" role="dialog" aria-label="Detectives' line">
      {/* header */}
      <div className="bg-card px-4 pb-3 pt-[max(env(safe-area-inset-top),14px)] shadow-[0_8px_24px_-20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          <button onClick={onBack} aria-label="Back" className="grid size-10 shrink-0 place-items-center rounded-full bg-raise active:scale-90">
            <ChevronLeft className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold leading-tight">Detectives&apos; Line</h2>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <span className={`size-2 rounded-full ${others.length ? "bg-go" : "bg-line"}`} />
              {connected ? (others.length ? `${others.length} other detective${others.length === 1 ? "" : "s"} online` : "Nobody else online right now") : chat === "loading" ? "Connecting…" : "Offline mode"}
            </p>
          </div>
          <div className="flex -space-x-2">
            {others.slice(0, 4).map((p) => (
              <div key={p.peer} className="size-8 overflow-hidden rounded-full ring-2 ring-card" title={p.name}>
                <Avatar face={lookFace(p.look)} className="size-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 rounded-full bg-raise p-1" role="tablist">
          {(["help", "lounge"] as const).map((ch) => (
            <button
              key={ch}
              role="tab"
              aria-selected={channel === ch}
              onClick={() => setChannel(ch)}
              className={`flex h-9 items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition ${channel === ch ? "bg-card shadow-sm" : "text-muted"}`}
            >
              {ch === "help" ? <LifeBuoy className="size-4" /> : <span aria-hidden="true">💬</span>}
              {ch === "help" ? "Help desk" : "Lounge"}
            </button>
          ))}
        </div>
      </div>

      {chat === null && (
        <p className="mx-4 mt-3 rounded-2xl bg-card p-3 text-xs leading-relaxed text-neutral-600">
          Real players show up when you play Naija Detective on claude.ai. For now, the precinct squad go answer your help requests.
        </p>
      )}
      {note && <p className="mx-4 mt-3 rounded-2xl bg-danger/10 p-3 text-xs font-semibold text-danger">{note}</p>}

      {/* messages */}
      <div ref={list} className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {shown.length === 0 && (
          <div className="mt-10 text-center text-sm text-muted">
            {channel === "help" ? "No help request yet. Stuck? Post your case and somebody go jump in." : "The lounge quiet. Talk something, start the gist!"}
          </div>
        )}
        {shown.map((m) => (
          <Bubble key={m.id} m={m} onOpenCase={onOpenCase} />
        ))}
      </div>

      {/* composer */}
      <div className="bg-card px-4 pb-[max(env(safe-area-inset-bottom),14px)] pt-3 shadow-[0_-8px_24px_-20px_rgba(0,0,0,0.5)]">
        {channel === "help" && (
          <button
            disabled={sending}
            onClick={() => post(`🆘 I'm stuck on "${theCase.title}" (${found}/${theCase.clues.length} clues). Who fit help me?`, "help", theCase.id)}
            className="mb-2.5 flex w-full items-center gap-2 rounded-2xl bg-raise px-3 py-2.5 text-left text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50"
          >
            <Siren className="size-4 shrink-0 text-danger" />
            <span className="min-w-0 flex-1 truncate">Ask for help on {theCase.title}</span>
          </button>
        )}
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const body = text;
            setText("");
            void post(body, channel);
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={MAX_TEXT}
            placeholder={channel === "help" ? "Give a tip or ask a question…" : "Say something to the precinct…"}
            className="h-12 min-w-0 flex-1 rounded-full bg-raise px-4 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-kick"
            aria-label="Message"
          />
          <button type="submit" disabled={!text.trim() || sending} aria-label="Send" className="grid size-12 shrink-0 place-items-center rounded-full bg-kick text-ink transition active:scale-90 disabled:opacity-40">
            <Send className="size-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

function Bubble({ m, onOpenCase }: { m: ChatMessage; onOpenCase: (id: CaseId) => void }) {
  const time = new Date(m.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const c = m.caseId ? CASE_BY_ID[m.caseId] : undefined;
  const caseChip = c && (
    <button
      onClick={() => onOpenCase(c.id)}
      className={`mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${m.mine ? "bg-white/15 text-white" : "bg-raise text-fg"}`}
    >
      <FolderOpen className="size-3 shrink-0" />
      <span className="truncate">{c.title}</span>
    </button>
  );

  if (m.mine)
    return (
      <div className="flex flex-col items-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-kick px-3.5 py-2 text-sm text-ink">
          <p className="whitespace-pre-wrap break-words">{m.text}</p>
          {caseChip}
        </div>
        <span className="mt-0.5 text-[10px] text-muted">{time}</span>
      </div>
    );

  return (
    <div className="flex items-end gap-2">
      <div className="size-8 shrink-0 overflow-hidden rounded-full ring-1 ring-line">
        <Avatar face={m.bot ? m.bot.face : lookFace(m.look)} className="size-full" />
      </div>
      <div className="min-w-0 max-w-[80%]">
        <div className="mb-0.5 flex items-center gap-1.5 text-[11px] font-semibold">
          <span className="truncate">{m.name}</span>
          {m.bot ? (
            <span className="rounded-full bg-raise px-1.5 py-px text-[9px] font-bold uppercase text-muted">Squad bot</span>
          ) : (
            m.rank && <span className="text-muted">{m.rank}</span>
          )}
        </div>
        <div className="soft rounded-2xl rounded-bl-sm bg-card px-3.5 py-2 text-sm">
          <p className="whitespace-pre-wrap break-words">{m.text}</p>
          {caseChip}
        </div>
        <span className="mt-0.5 block text-[10px] text-muted">{time}</span>
      </div>
    </div>
  );
}
