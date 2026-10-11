"use client";

import { Lock, MapPin, Mic, PhoneOff, Send, VolumeX, Waves } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { moneyShort } from "@/lib/format";
import { ASK_PRICE, HINTS, hintFor, hintPrice, inspectorPrompt, type HintKind, type Inspector } from "@/lib/hints";
import { askClaude } from "@/lib/multiplayer";
import { duckAmbience, startAmbience, stopAmbience } from "@/lib/ambience";
import { duckMusic } from "@/lib/music";
import { sfx } from "@/lib/SoundEffects";
import type { CrimeCase, GameState } from "@/lib/types";
import { canSpeak, hasNigerianVoice, listVoices, onVoicesChanged, primeSpeech, speak, speakAside, stopSpeaking, type SpeakHandle } from "@/lib/voice";

function stored(key: string, fallback: string) {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}
function store(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // only a convenience
  }
}
import { Avatar } from "./Avatar";

interface Line {
  id: number;
  who: "you" | "oga";
  text: string;
}

interface Props {
  theCase: CrimeCase;
  state: GameState;
  playerName: string;
  inspector: Inspector;
  onSpend: (amount: number) => boolean;
  onEnd: () => void;
}

/** A phone call to the Senior Inspector: paid hints read aloud, plus free questions answered by Claude. */
export function InspectorCall({ theCase, state, playerName, inspector, onSpend, onEnd }: Props) {
  const INSPECTOR = inspector;
  const [phase, setPhase] = useState<"ringing" | "live">("ringing");
  const [lines, setLines] = useState<Line[]>([]);
  const [shown, setShown] = useState(0);
  const [talking, setTalking] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [question, setQuestion] = useState("");
  const [seconds, setSeconds] = useState(0);
  const handle = useRef<SpeakHandle | null>(null);
  const abort = useRef<AbortController | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const first = playerName.split(" ")[0] || "Detective";

  const [noiseOn, setNoiseOn] = useState(() => stored("crime-life:callnoise", "1") === "1");
  const [voiceName, setVoiceName] = useState(() => stored(`crime-life:voice:${inspector.id}`, ""));
  const [voices, setVoices] = useState(() => listVoices(inspector.voice.gender));
  const [nigerian, setNigerian] = useState(() => hasNigerianVoice());
  useEffect(
    () =>
      onVoicesChanged(() => {
        setVoices(listVoices(inspector.voice.gender));
        setNigerian(hasNigerianVoice());
      }),
    [inspector.voice.gender],
  );
  const voiceRef = useRef(voiceName);
  voiceRef.current = voiceName;
  const busyRef = useRef(false);

  const say = (text: string) => {
    handle.current?.stop();
    setLines((l) => [...l, { id: Date.now() + Math.random(), who: "oga", text }]);
    setShown(0);
    setTalking(true);
    handle.current = speak(text, {
      muted: state.muted,
      voice: inspector.voice,
      voiceName: voiceRef.current || undefined,
      onProgress: setShown,
      onEnd: () => setTalking(false),
    });
  };

  // ring, pick up, greet
  useEffect(() => {
    duckMusic(true);
    sfx.ring();
    const t1 = window.setTimeout(() => sfx.ring(), 1300);
    const t2 = window.setTimeout(() => {
      sfx.pickup();
      setPhase("live");
      if (stored("crime-life:callnoise", "1") === "1" && !stateRef.current.muted) startAmbience(inspector.scene);
      say(
        stateRef.current.solved.includes(theCase.id) ? inspector.greetSolved(first, theCase.title) : inspector.greet(first, theCase.title),
      );
    }, 2600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      abort.current?.abort();
      stopSpeaking();
      stopAmbience();
      duckMusic(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The street gets quieter while the inspector talks or thinks.
  useEffect(() => {
    busyRef.current = talking || thinking;
    duckAmbience(talking || thinking);
  }, [talking, thinking]);

  // Now and then, in a pause, someone shouts in the background (a conductor, a trader).
  useEffect(() => {
    if (phase !== "live" || !noiseOn || state.muted) return;
    let last = Date.now();
    let wait = 9000 + Math.random() * 8000;
    const id = window.setInterval(() => {
      if (busyRef.current || Date.now() - last < wait) return;
      last = Date.now();
      wait = 14000 + Math.random() * 14000;
      const line = inspector.asides[Math.floor(Math.random() * inspector.asides.length)];
      speakAside(line, { volume: 0.22, gender: "male", rate: 1.12, pitch: 1.12 });
    }, 1500);
    return () => window.clearInterval(id);
  }, [phase, noiseOn, state.muted, inspector]);

  const toggleNoise = () => {
    const on = !noiseOn;
    setNoiseOn(on);
    store("crime-life:callnoise", on ? "1" : "0");
    if (on && phase === "live" && !state.muted) startAmbience(inspector.scene);
    else stopAmbience();
  };

  const chooseVoice = (name: string) => {
    setVoiceName(name);
    voiceRef.current = name;
    store(`crime-life:voice:${inspector.id}`, name);
    if (phase === "live" && !thinking) say(inspector.greet(first, theCase.title).split(". ")[0] + ".");
  };

  useEffect(() => {
    if (phase !== "live") return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [lines, shown]);

  const you = (text: string) => setLines((l) => [...l, { id: Date.now() + Math.random(), who: "you", text }]);

  const hint = (kind: HintKind, label: string) => {
    primeSpeech();
    const price = hintPrice(kind, theCase);
    if (!onSpend(price)) {
      sfx.error();
      say(inspector.broke(first, moneyShort(price)));
      return;
    }
    sfx.tap();
    you(label);
    say(hintFor(kind, theCase, stateRef.current, inspector));
  };

  const ask = async () => {
    primeSpeech();
    const q = question.trim();
    if (!q || thinking) return;
    if (!onSpend(ASK_PRICE)) {
      sfx.error();
      say(inspector.broke(first, moneyShort(ASK_PRICE)));
      return;
    }
    sfx.tap();
    setQuestion("");
    you(q);
    setThinking(true);
    handle.current?.stop();
    const ctl = new AbortController();
    abort.current = ctl;
    try {
      const answer = await askClaude(inspectorPrompt(theCase, stateRef.current, q, inspector), () => {}, ctl.signal);
      if (ctl.signal.aborted) return;
      say(answer?.trim() || fallback());
    } catch {
      // the call ended while he was thinking
    } finally {
      setThinking(false);
    }
  };

  /** Without Claude: the most useful scripted hint for where the detective is. */
  const fallback = () => {
    const s = stateRef.current;
    const found = s.found[theCase.id]?.length ?? 0;
    const analyzed = s.analyzed[theCase.id]?.length ?? 0;
    const kind: HintKind = found < theCase.clues.length ? "where" : analyzed < found ? "decode" : "lie";
    return `${inspector.thinking} ${hintFor(kind, theCase, s, inspector)}`;
  };

  const hangUp = () => {
    sfx.hangup();
    onEnd();
  };

  const last = [...lines].reverse().find((l) => l.who === "oga");
  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const busy = phase !== "live" || thinking;

  return (
    <div className="fixed inset-0 z-[70] mx-auto flex max-w-md flex-col overflow-hidden lg:inset-y-8 lg:max-w-lg lg:rounded-[32px] lg:shadow-2xl bg-[radial-gradient(120%_60%_at_50%_0%,#2a3346,#0f1116)] text-white fade-in" role="dialog" aria-label={`Call with ${INSPECTOR.name}`}>
      {/* who you're calling */}
      <div className="flex flex-col items-center px-6 pt-[max(env(safe-area-inset-top),28px)] text-center">
        <div className="relative mt-2">
          {(phase === "ringing" || talking) && (
            <>
              <span className="absolute inset-0 animate-ping rounded-full bg-white/15" />
              <span className="absolute -inset-3 rounded-full border border-white/15" />
            </>
          )}
          <div className="relative size-24 overflow-hidden rounded-full ring-4 ring-white/20">
            <Avatar face={INSPECTOR.face} className="size-full" />
          </div>
        </div>
        <h2 className="mt-4 text-xl font-bold">{INSPECTOR.name}</h2>
        <p className="text-sm text-white/60">
          {phase === "ringing" ? "Calling Panti CID…" : thinking ? "Thinking…" : talking ? "Speaking" : `On call · ${mmss}`}
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs text-white/50">
          <MapPin className="size-3" /> {inspector.place} · Case: {theCase.title}
        </p>
        <div className="mt-3 flex w-full max-w-sm items-center gap-2">
          <button
            onClick={toggleNoise}
            aria-pressed={noiseOn}
            className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition active:scale-95 ${noiseOn ? "bg-white text-fg" : "bg-white/10 text-white/70"}`}
          >
            <Waves className="size-3.5" /> Street noise {noiseOn ? "on" : "off"}
          </button>
          <label className="flex h-9 min-w-0 flex-1 items-center rounded-full bg-white/10 px-3">
            <span className="sr-only">Voice</span>
            <select
              value={voiceName}
              onChange={(e) => chooseVoice(e.target.value)}
              className="min-w-0 flex-1 truncate bg-transparent text-xs font-semibold text-white focus:outline-none [&>option]:text-fg"
              aria-label={`Voice for ${inspector.nick}`}
            >
              <option value="">Voice: best on this device</option>
              {voices.map((v) => (
                <option key={v.voice.name} value={v.voice.name}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {!canSpeak() && phase === "live" && !state.muted && (
          <p className="mt-2 max-w-sm rounded-2xl bg-white/10 px-3 py-2 text-[11px] leading-snug text-white/75">
            This app's browser can't play voices, so read the captions. To hear the inspectors, open the game link in Chrome or Safari.
          </p>
        )}
        {canSpeak() && !nigerian && phase === "live" && (
          <p className="mt-2 max-w-sm text-[11px] leading-snug text-white/45">
            This device has no Nigerian voice. For a real Naija accent, open the game in Microsoft Edge (voices Abeo and Ezinne), or on Android add English (Nigeria) in Google Speech Services.
          </p>
        )}
      </div>

      {/* transcript with live, decrypting captions */}
      <div ref={scroller} className="no-scrollbar mt-4 flex-1 space-y-2.5 overflow-y-auto px-5 pb-3">
        {lines.map((l) =>
          l.who === "you" ? (
            <div key={l.id} className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-white px-3.5 py-2 text-sm text-fg">
              {l.text}
            </div>
          ) : (
            <div key={l.id} className="max-w-[90%] rounded-2xl rounded-bl-sm bg-white/10 px-3.5 py-2.5 text-[15px] leading-relaxed backdrop-blur">
              {l === last ? <Decrypt text={l.text} shown={shown} /> : l.text}
            </div>
          ),
        )}
        {thinking && (
          <div className="flex w-16 justify-center gap-1 rounded-2xl rounded-bl-sm bg-white/10 px-3 py-3">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-1.5 animate-bounce rounded-full bg-white/70" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}
        {state.muted && phase === "live" && (
          <p className="flex items-center justify-center gap-1 text-[11px] text-white/45">
            <VolumeX className="size-3" /> Sound is off, so read the captions
          </p>
        )}
      </div>

      {/* what you can ask for */}
      <div className="rounded-t-[28px] bg-white/[0.06] px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-4 backdrop-blur">
        <div className="grid grid-cols-2 gap-2">
          {HINTS.map((h) => {
            const price = hintPrice(h.kind, theCase);
            const short = state.balance < price;
            return (
              <button
                key={h.kind}
                disabled={busy}
                onClick={() => hint(h.kind, h.label)}
                className={`flex flex-col items-start gap-0.5 rounded-2xl p-3 text-left transition active:scale-95 disabled:opacity-40 ${
                  h.kind === "culprit" ? "bg-danger/25 ring-1 ring-danger/50" : "bg-white/10"
                }`}
              >
                <span className="text-[13px] font-bold leading-tight">{h.label}</span>
                <span className="text-[10px] leading-snug text-white/55">{h.blurb}</span>
                <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${short ? "bg-white/10 text-white/50" : "bg-white text-fg"}`}>
                  {short && <Lock className="size-2.5" />}
                  {moneyShort(price)}
                </span>
              </button>
            );
          })}
        </div>

        <form
          className="mt-3 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void ask();
          }}
        >
          <label className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-full bg-white/10 px-4">
            <Mic className="size-4 shrink-0 text-white/50" />
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={busy}
              maxLength={400}
              placeholder={`Ask ${INSPECTOR.nick} anything (${moneyShort(ASK_PRICE)})`}
              className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
              aria-label="Ask the Senior Inspector a question"
            />
          </label>
          <button type="submit" disabled={busy || !question.trim()} aria-label="Ask" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-fg transition active:scale-90 disabled:opacity-40">
            <Send className="size-5" />
          </button>
          <button type="button" onClick={hangUp} aria-label="End call" className="grid size-12 shrink-0 place-items-center rounded-full bg-danger text-white transition active:scale-90">
            <PhoneOff className="size-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

const GLYPHS = "▓▒░#%&$@*+=?/\\<>01ABCDEFXZ";

/** Text that "decrypts" as it is spoken: said words plain, the next few scrambled, the rest hidden. */
function Decrypt({ text, shown }: { text: string; shown: number }) {
  const [, setTick] = useState(0);
  const done = shown >= text.length;
  useEffect(() => {
    if (done) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 55);
    return () => window.clearInterval(id);
  }, [done]);
  const n = Math.min(shown, text.length);
  const scramble = text
    .slice(n, n + 10)
    .split("")
    .map((ch) => (ch === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
    .join("");
  return (
    <span aria-label={text}>
      <span aria-hidden="true">{text.slice(0, n)}</span>
      {!done && <span aria-hidden="true" className="font-mono text-neon/80">{scramble}</span>}
      <span aria-hidden="true" className="opacity-0">{text.slice(n + 10)}</span>
    </span>
  );
}
