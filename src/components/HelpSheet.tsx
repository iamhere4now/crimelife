"use client";

import { ChevronLeft, ChevronRight, LifeBuoy, MessagesSquare, Phone, Play, Volume2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { INSPECTOR_BY_ID, INSPECTORS, type Inspector } from "@/lib/hints";
import { lookFace } from "@/lib/looks";
import { watchOnline, type Channel, type Me, type OnlinePlayer } from "@/lib/multiplayer";
import { sfx } from "@/lib/SoundEffects";
import type { CaseId, CrimeCase, GameState } from "@/lib/types";
import { Avatar } from "./Avatar";
import { InspectorCall } from "./InspectorCall";
import { PlayerChat } from "./PlayerChat";
import { SceneThumb } from "./scenes/SceneThumb";
import { primeSpeech, speak, stopSpeaking } from "@/lib/voice";

const PICK_KEY = "crime-life:inspector";

function lastPick(): Inspector {
  try {
    return INSPECTOR_BY_ID[window.localStorage.getItem(PICK_KEY) ?? ""] ?? INSPECTORS[0];
  } catch {
    return INSPECTORS[0];
  }
}

interface Props {
  theCase: CrimeCase;
  state: GameState;
  me: Me;
  /** True when opened from inside the case, so there's no "continue" row. */
  inCase: boolean;
  onSpend: (amount: number) => boolean;
  onContinue: (id: CaseId) => void;
  onOpenCase: (id: CaseId) => void;
  onClose: () => void;
}

/** The "+" button: call for backup. Phone the Senior Inspector, or ask the other detectives. */
export function HelpSheet({ theCase, state, me, inCase, onSpend, onContinue, onOpenCase, onClose }: Props) {
  const [view, setView] = useState<"menu" | "pick" | "call" | Channel>("menu");
  const [inspector, setInspector] = useState<Inspector>(() => lastPick());
  const [online, setOnline] = useState<OnlinePlayer[]>([]);
  useEffect(() => watchOnline(setOnline), []);
  const others = online.filter((p) => !p.isMe);
  const found = state.found[theCase.id]?.length ?? 0;
  const solved = state.solved.includes(theCase.id);

  const dim = <div className="fixed inset-0 z-[60] hidden bg-black/50 fade-in lg:block" onClick={onClose} />;
  if (view === "call") return <>{dim}<InspectorCall theCase={theCase} state={state} playerName={me.name} inspector={inspector} onSpend={onSpend} onEnd={() => setView("menu")} /></>;
  if (view === "help" || view === "lounge")
    return <>{dim}<PlayerChat theCase={theCase} state={state} me={me} start={view} onOpenCase={onOpenCase} onBack={() => setView("menu")} /></>;
  if (view === "pick")
    return (
      <InspectorPicker
        muted={state.muted}
        current={inspector}
        onBack={() => setView("menu")}
        onClose={onClose}
        onCall={(who) => {
          setInspector(who);
          try {
            window.localStorage.setItem(PICK_KEY, who.id);
          } catch {
            // remembering the pick is only a convenience
          }
          sfx.whoosh();
          setView("call");
        }}
      />
    );

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 fade-in lg:items-center" onClick={onClose}>
      <div
        className="sheet-up w-full max-w-md rounded-t-[28px] bg-ink px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-2.5 lg:max-w-lg lg:rounded-[28px] lg:pb-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Call for backup"
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-line" />
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Call for backup</h2>
            <p className="mt-0.5 text-sm text-neutral-600">Case no gree? No shame. Even Oga at the top get people.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="soft grid size-10 shrink-0 place-items-center rounded-full bg-card active:scale-90">
            <X className="size-4" />
          </button>
        </div>

        {!inCase && (
          <button
            onClick={() => onContinue(theCase.id)}
            className="soft mt-4 flex w-full items-center gap-3 rounded-3xl bg-card p-2.5 text-left transition active:scale-[0.98]"
          >
            <SceneThumb theCase={theCase} cast={false} className="size-14 shrink-0 rounded-2xl" />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">{solved ? "Closed case" : "Your current case"}</div>
              <div className="truncate font-bold">{theCase.title}</div>
              <div className="text-xs text-muted">
                {found}/{theCase.clues.length} clues found
              </div>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-kick text-ink">
              <Play className="size-4 fill-current" />
            </span>
          </button>
        )}

        <button
          onClick={() => {
            sfx.whoosh();
            setView("pick");
          }}
          className="mt-3 flex w-full items-center gap-3.5 rounded-3xl bg-kick p-4 text-left text-ink shadow-[0_16px_30px_-18px_rgba(20,22,27,0.8)] transition active:scale-[0.98]"
        >
          <div className="relative flex shrink-0 -space-x-4">
            {INSPECTORS.slice(0, 3).map((who) => (
              <div key={who.id} className="size-12 overflow-hidden rounded-full ring-2 ring-kick">
                <Avatar face={who.face} className="size-full" />
              </div>
            ))}
            <span className="absolute -bottom-0.5 -right-0.5 grid size-6 place-items-center rounded-full bg-go ring-2 ring-kick">
              <Phone className="size-3 text-white" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[17px] font-bold">Call a Senior Inspector</div>
            <p className="mt-0.5 text-[13px] leading-snug text-ink/70">
              Pick your Oga: {INSPECTORS.length} inspectors, each with their own voice and style. Dem fit decode your evidence or tell you who dey lie.
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0 opacity-60" />
        </button>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Tile
            icon={LifeBuoy}
            title="Ask other detectives"
            body="Post your case for the help desk"
            onClick={() => {
              sfx.whoosh();
              setView("help");
            }}
          />
          <Tile
            icon={MessagesSquare}
            title="Detectives' lounge"
            body="Chat and gist with other players"
            onClick={() => {
              sfx.whoosh();
              setView("lounge");
            }}
          />
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-muted">
          <span className={`size-2 rounded-full ${others.length ? "bg-go live-dot" : "bg-line"}`} />
          {others.length ? (
            <>
              <span className="flex -space-x-1.5">
                {others.slice(0, 3).map((p) => (
                  <span key={p.peer} className="size-5 overflow-hidden rounded-full ring-2 ring-ink">
                    <Avatar face={lookFace(p.look)} className="size-full" />
                  </span>
                ))}
              </span>
              {others.length} detective{others.length === 1 ? "" : "s"} online now
            </>
          ) : (
            "No other detective online right now. The squad bots still dey."
          )}
        </div>
      </div>
    </div>
  );
}

function Tile({ icon: Icon, title, body, onClick }: { icon: typeof Phone; title: string; body: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="soft flex flex-col items-start gap-2 rounded-3xl bg-card p-4 text-left transition active:scale-[0.97]">
      <span className="grid size-10 place-items-center rounded-full bg-raise">
        <Icon className="size-5" />
      </span>
      <span className="text-[15px] font-bold leading-tight">{title}</span>
      <span className="text-xs leading-snug text-muted">{body}</span>
    </button>
  );
}

/** Choose who to phone: each inspector has their own voice and personality. */
function InspectorPicker({
  muted,
  current,
  onBack,
  onClose,
  onCall,
}: {
  muted: boolean;
  current: Inspector;
  onBack: () => void;
  onClose: () => void;
  onCall: (who: Inspector) => void;
}) {
  const [playing, setPlaying] = useState<string | null>(null);
  useEffect(() => () => stopSpeaking(), []);

  const sample = (who: Inspector) => {
    sfx.tap();
    if (playing === who.id) {
      stopSpeaking();
      setPlaying(null);
      return;
    }
    setPlaying(who.id);
    let voiceName: string | undefined;
    try {
      voiceName = window.localStorage.getItem(`crime-life:voice:${who.id}`) || undefined;
    } catch {
      voiceName = undefined;
    }
    speak(who.greet("Detective", "this case"), { muted, voice: who.voice, voiceName, onEnd: () => setPlaying((p) => (p === who.id ? null : p)) });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 fade-in lg:items-center" onClick={onClose}>
      <div
        className="sheet-up no-scrollbar max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-ink px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-2.5 lg:max-w-lg lg:rounded-[28px] lg:pb-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Choose a Senior Inspector"
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-line" />
        <div className="mt-4 flex items-center gap-3">
          <button onClick={onBack} aria-label="Back" className="soft grid size-10 shrink-0 place-items-center rounded-full bg-card active:scale-90">
            <ChevronLeft className="size-5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-xl font-bold tracking-tight">Who you wan call?</h2>
            <p className="text-xs text-muted">Same tips and prices, different voice and style.</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {INSPECTORS.map((who) => (
            <div key={who.id} className={`soft flex items-center gap-3 rounded-3xl bg-card p-3 ${who.id === current.id ? "ring-2 ring-kick" : ""}`}>
              <div className="size-14 shrink-0 overflow-hidden rounded-full ring-2 ring-line">
                <Avatar face={who.face} className="size-full" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-bold">{who.nick}</span>
                  {who.id === current.id && <span className="rounded-full bg-raise px-1.5 py-px text-[9px] font-bold uppercase text-muted">Last call</span>}
                </div>
                <div className="truncate text-[11px] text-muted">{who.name}</div>
                <div className="mt-0.5 text-xs leading-snug text-neutral-600">{who.tagline}</div>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                <button
                  onClick={() => {
                    primeSpeech(true);
                    onCall(who);
                  }}
                  aria-label={`Call ${who.nick}`}
                  className="flex h-9 items-center justify-center gap-1.5 rounded-full bg-kick px-3.5 text-xs font-bold text-ink transition active:scale-95"
                >
                  <Phone className="size-3.5 fill-current" /> Call
                </button>
                <button
                  onClick={() => sample(who)}
                  aria-pressed={playing === who.id}
                  aria-label={`Hear ${who.nick}'s voice`}
                  className={`flex h-8 items-center justify-center gap-1 rounded-full px-3 text-[11px] font-semibold transition active:scale-95 ${playing === who.id ? "bg-go text-white" : "bg-raise text-neutral-700"}`}
                >
                  <Volume2 className="size-3.5" /> {playing === who.id ? "Stop" : "Hear voice"}
                </button>
              </div>
            </div>
          ))}
        </div>
        {muted && <p className="mt-3 text-center text-[11px] text-muted">Sound is muted, so voices won&apos;t play. Turn sound on to hear them.</p>}
      </div>
    </div>
  );
}
