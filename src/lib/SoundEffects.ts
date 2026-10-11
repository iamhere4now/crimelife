/**
 * Synthesized sound effects built on the Web Audio API. No audio files:
 * every sound is a handful of oscillators and gain envelopes.
 */

type Wave = OscillatorType;

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(value: boolean) {
  muted = value;
}

export function isMuted() {
  return muted;
}

/** The shared audio context (also used by lib/music.ts), whatever the mute state. */
export function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  // Browsers start the context suspended until a user gesture; every sound is triggered by one.
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function audio(): AudioContext | null {
  return muted ? null : audioContext();
}

interface ToneOptions {
  at?: number;
  duration?: number;
  type?: Wave;
  volume?: number;
  slideTo?: number;
}

function tone(freq: number, { at = 0, duration = 0.12, type = "sine", volume = 0.12, slideTo }: ToneOptions = {}) {
  const ac = audio();
  if (!ac) return;
  const start = ac.currentTime + at;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function noise({ at = 0, duration = 0.08, volume = 0.08 } = {}) {
  const ac = audio();
  if (!ac) return;
  const start = ac.currentTime + at;
  const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * duration), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = ac.createBufferSource();
  const gain = ac.createGain();
  const filter = ac.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 2500;
  src.buffer = buffer;
  gain.gain.value = volume;
  src.connect(filter).connect(gain).connect(ac.destination);
  src.start(start);
}

export const sfx = {
  /** One ring of a phone line (two short bursts). */
  ring() {
    for (const at of [0, 0.42]) {
      tone(400, { at, duration: 0.36, type: "sine", volume: 0.07 });
      tone(450, { at, duration: 0.36, type: "sine", volume: 0.07 });
    }
  },
  /** Call connected / ended. */
  pickup() {
    tone(880, { duration: 0.08, type: "sine", volume: 0.06 });
    tone(1175, { at: 0.09, duration: 0.12, type: "sine", volume: 0.06 });
  },
  hangup() {
    tone(620, { duration: 0.14, type: "sine", volume: 0.07 });
    tone(480, { at: 0.18, duration: 0.2, type: "sine", volume: 0.07 });
  },
  /** A chat message arrives. */
  message() {
    tone(1046, { duration: 0.07, type: "triangle", volume: 0.05 });
    tone(1568, { at: 0.07, duration: 0.1, type: "triangle", volume: 0.05 });
  },
  /** Soft UI tap for buttons and tabs. */
  tap() {
    tone(660, { duration: 0.05, type: "triangle", volume: 0.06 });
  },
  /** A clue hotspot is opened and bagged. */
  clue() {
    noise({ duration: 0.05, volume: 0.05 });
    tone(880, { duration: 0.08, type: "square", volume: 0.05 });
    tone(1320, { at: 0.07, duration: 0.12, type: "square", volume: 0.05 });
  },
  /** Lab scanner sweep while a forensic action runs. */
  scan() {
    tone(300, { duration: 1.1, type: "sawtooth", volume: 0.03, slideTo: 1200 });
    for (let i = 0; i < 5; i++) tone(1500, { at: 0.22 * i, duration: 0.04, type: "square", volume: 0.025 });
  },
  /** Analysis complete. */
  reveal() {
    tone(988, { duration: 0.1, type: "triangle", volume: 0.08 });
    tone(1319, { at: 0.09, duration: 0.18, type: "triangle", volume: 0.08 });
  },
  /** Open a sheet or a scene. */
  whoosh() {
    tone(180, { duration: 0.22, type: "sine", volume: 0.07, slideTo: 520 });
  },
  /** Correct accusation: a rising brass-like fanfare. */
  success() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      tone(f, { at: i * 0.11, duration: 0.18, type: "sawtooth", volume: 0.05 });
      tone(f * 2, { at: i * 0.11, duration: 0.18, type: "triangle", volume: 0.03 });
    });
    [1046.5, 1318.5, 1568].forEach((f) => tone(f, { at: 0.48, duration: 0.7, type: "triangle", volume: 0.05 }));
  },
  /** Wrong accusation: two harsh buzzer pulses. */
  error() {
    tone(110, { duration: 0.28, type: "square", volume: 0.09 });
    tone(116, { duration: 0.28, type: "sawtooth", volume: 0.06 });
    tone(98, { at: 0.34, duration: 0.45, type: "square", volume: 0.09 });
    tone(104, { at: 0.34, duration: 0.45, type: "sawtooth", volume: 0.06 });
  },
  /** A lie broken with evidence: a dramatic stab. */
  objection() {
    noise({ duration: 0.12, volume: 0.1 });
    [220, 277.18, 329.63, 440].forEach((f) => tone(f, { duration: 0.5, type: "sawtooth", volume: 0.045 }));
    tone(880, { at: 0.05, duration: 0.35, type: "square", volume: 0.04, slideTo: 1320 });
  },
  /** Dusting powder: a soft swish. */
  brush() {
    noise({ duration: 0.06, volume: 0.025 });
  },
  /** Torn pieces swap places. */
  swap() {
    tone(520, { duration: 0.06, type: "triangle", volume: 0.06, slideTo: 780 });
  },
  /** A wrong tap in the timed sweep. */
  miss() {
    tone(180, { duration: 0.14, type: "square", volume: 0.06, slideTo: 120 });
  },
  /** Last seconds of a timer. */
  tick() {
    tone(1200, { duration: 0.03, type: "square", volume: 0.03 });
  },
  /** A new case tier opens. */
  unlock() {
    [784, 988, 1175, 1568].forEach((f, i) => tone(f, { at: 0.9 + i * 0.07, duration: 0.14, type: "square", volume: 0.035 }));
  },
};
