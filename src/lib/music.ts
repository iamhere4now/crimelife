/**
 * Background music: short original loops in the style of each region's music,
 * synthesized live with Web Audio (no recordings, no files). They are inspired
 * by the rhythms and instruments of each place, not copies of any song.
 *
 * Pattern strings are 32 steps (two bars of sixteenth notes):
 *   drums  "x" hit, "." rest; talking drum "u" bends up, "d" bends down
 *   notes  "0"–"9" scale degree (7+ climbs into the next octave), "." rest
 */

import { audioContext } from "./SoundEffects";
import type { MusicStyle } from "./types";

type Lead = "synth" | "reed" | "guitar" | "flute" | "brass" | "xylo";

interface Style {
  name: string;
  bpm: number;
  /** Tonic frequency in Hz. */
  root: number;
  scale: number[];
  lead: Lead;
  kick?: string;
  clap?: string;
  talk?: string;
  bell?: string;
  shaker?: string;
  melody: string;
  bass?: string;
  /** Pad chords (scale degrees) for each bar. */
  pads?: [number[], number[]];
}

export const STYLES: Record<MusicStyle, Style> = {
  lagos: {
    name: "Lagos Afrobeats groove",
    bpm: 104,
    root: 220,
    scale: [0, 3, 5, 7, 10],
    lead: "synth",
    kick: "x.....x...x.....x.....x...x.....",
    clap: "....x.......x.......x.......x...",
    shaker: "x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.",
    bell: "..x...x...x.x.....x...x...x.x...",
    melody: "4...3.2...0.2...4...3.2...5.4...",
    bass: "0.....0...3.....0.....0...4.3...",
    pads: [[0, 2, 4], [3, 5, 7]],
  },
  sahel: {
    name: "Sahel kalangu & reed",
    bpm: 92,
    root: 196,
    scale: [0, 1, 4, 5, 7, 8, 10],
    lead: "reed",
    kick: "x.......x.x.....x.......x.x.....",
    talk: "..u.d...u.d.u...d.u.d...u.d.u...",
    shaker: "x..x..x.x..x..x.x..x..x.x..x..x.",
    melody: "4.4.5.4.3...2.1.0.......2.3.4...",
    bass: "0.......0.......0.......3.......",
  },
  highlife: {
    name: "Eastern highlife",
    bpm: 120,
    root: 196,
    scale: [0, 2, 4, 5, 7, 9, 11],
    lead: "guitar",
    kick: "x.......x.......x.......x.......",
    bell: "x..x..x...x.x...x..x..x...x.x...",
    shaker: "..x...x...x...x...x...x...x...x.",
    melody: "0.2.4.2.0.2.4.2.3.5.7.5.4.2.4.2.",
    bass: "0...4...0...4...3...5...4...2...",
  },
  rivers: {
    name: "Port Harcourt groove",
    bpm: 110,
    root: 233,
    scale: [0, 2, 4, 7, 9],
    lead: "guitar",
    kick: "x.....x.x.......x.....x.x.......",
    bell: "x.x...x.x.x...x.x.x...x.x.x...x.",
    shaker: "x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.",
    melody: "4.4.5.4.2...0.2.4.4.5.4.2...2.0.",
    bass: "0.....0.4.....4.3.....3.2.....2.",
  },
  fuji: {
    name: "Ibadan fuji drums",
    bpm: 100,
    root: 207,
    scale: [0, 2, 3, 5, 7, 9, 10],
    lead: "flute",
    kick: "x..x....x..x....x..x....x..x....",
    talk: "u.d.u.d...u.d.u.d.u.d.u.d...u.d.",
    bell: "x...x.x.x...x.x.x...x.x.x...x.x.",
    melody: "0.0.2.3.2.0.....3.3.4.3.2.0.....",
    bass: "0.......0.......3.......2.......",
  },
  juju: {
    name: "Ife juju guitar",
    bpm: 112,
    root: 220,
    scale: [0, 2, 4, 5, 7, 9, 11],
    lead: "guitar",
    kick: "x.......x.......x.......x.......",
    talk: "....u.d.....u.d.....u.d.....u.d.",
    shaker: "x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.",
    melody: "2.4.5.4.2.0.2.4.5.7.5.4.2.4.2.0.",
    bass: "0...0...3...3...4...4...0...0...",
  },
  abuja: {
    name: "Abuja capital brass",
    bpm: 96,
    root: 175,
    scale: [0, 2, 4, 5, 7, 9, 11],
    lead: "brass",
    kick: "x.......x..x....x.......x..x....",
    clap: "....x.......x.......x.......x...",
    shaker: "..x...x...x...x...x...x...x...x.",
    melody: "4...4.5.4...2...0...2.4.5...4...",
    bass: "0.......5.......3.......4.......",
    pads: [[0, 2, 4], [3, 5, 7]],
  },
  plateau: {
    name: "Plateau hill flute",
    bpm: 88,
    root: 262,
    scale: [0, 3, 5, 7, 10],
    lead: "flute",
    kick: "x.....x.....x...x.....x.....x...",
    bell: ".......x.......x.......x.......x",
    melody: "4...3.2...0.......2...3.4...2...",
    bass: "0...............3...............",
  },
  calabar: {
    name: "Calabar ekombi drums",
    bpm: 108,
    root: 247,
    scale: [0, 2, 4, 7, 9],
    lead: "xylo",
    kick: "x...x...x...x...x...x...x...x...",
    talk: "..u...d...u.u.d...u...d...u.u.d.",
    bell: "x.x..x.x.x..x.x.x.x..x.x.x..x.x.",
    melody: "0.2.4.2.4.5.4.2.0.2.4.5.7.5.4.2.",
    bass: "0.......4.......3.......2.......",
  },
  benin: {
    name: "Benin court drums",
    bpm: 84,
    root: 147,
    scale: [0, 2, 3, 5, 7, 8, 10],
    lead: "reed",
    kick: "x.......x...x...x.......x...x...",
    talk: "......d.......d.......d.....d.d.",
    bell: "x...x...x...x...x...x...x...x...",
    melody: "0.......1...0...3.......2...0...",
    bass: "0...............0...............",
  },
};

let master: GainNode | null = null;
let timer: number | null = null;
let current: MusicStyle | null = null;
let step = 0;
let nextTime = 0;
let noiseBuf: AudioBuffer | null = null;

const VOLUME = 0.32;

export function currentStyle(): MusicStyle | null {
  return current;
}

export function playMusic(style: MusicStyle) {
  if (current === style && timer !== null) return;
  stopMusic(true);
  const ac = audioContext();
  if (!ac) return;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(VOLUME, ac.currentTime + 1.2);
  gain.connect(ac.destination);
  master = gain;
  current = style;
  step = 0;
  nextTime = ac.currentTime + 0.1;
  timer = window.setInterval(() => schedule(ac), 25);
}

/** Turn the background music down while someone is talking, and back up after. */
export function duckMusic(on: boolean) {
  const ac = audioContext();
  if (!ac || !master) return;
  const g = master.gain;
  g.cancelScheduledValues(ac.currentTime);
  g.setValueAtTime(Math.max(g.value, 0.0001), ac.currentTime);
  g.exponentialRampToValueAtTime(on ? VOLUME * 0.18 : VOLUME, ac.currentTime + 0.4);
}

export function stopMusic(immediate = false) {
  if (timer !== null) window.clearInterval(timer);
  timer = null;
  current = null;
  const ac = audioContext();
  const g = master;
  master = null;
  if (!g || !ac) return;
  const end = ac.currentTime + (immediate ? 0.05 : 0.6);
  g.gain.cancelScheduledValues(ac.currentTime);
  g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, end);
  window.setTimeout(() => g.disconnect(), (end - ac.currentTime) * 1000 + 100);
}

function schedule(ac: AudioContext) {
  if (!current || !master) return;
  const style = STYLES[current];
  const stepDur = 60 / style.bpm / 4;
  while (nextTime < ac.currentTime + 0.15) {
    playStep(ac, style, step, nextTime, stepDur);
    nextTime += stepDur;
    step = (step + 1) % 32;
  }
}

function freqOf(style: Style, degree: number, octaveShift = 0) {
  const n = style.scale.length;
  const oct = Math.floor(degree / n) + octaveShift;
  const semis = style.scale[((degree % n) + n) % n] + 12 * oct;
  return style.root * Math.pow(2, semis / 12);
}

function playStep(ac: AudioContext, s: Style, i: number, t: number, dur: number) {
  const at = (p?: string) => p?.[i] ?? ".";
  if (at(s.kick) === "x") kick(ac, t);
  if (at(s.clap) === "x") noiseHit(ac, t, 0.09, 1800, 0.18);
  if (at(s.shaker) === "x") noiseHit(ac, t, 0.035, 7000, 0.06);
  if (at(s.bell) === "x") bell(ac, t, i % 4 === 0);
  const tk = at(s.talk);
  if (tk === "u" || tk === "d") talkingDrum(ac, t, tk === "u");
  const m = at(s.melody);
  if (m !== ".") lead(ac, s, freqOf(s, Number(m), 1), t, dur);
  const b = at(s.bass);
  if (b !== ".") tone(ac, freqOf(s, Number(b), -1), t, dur * 3.5, "triangle", 0.22);
  if (s.pads && (i === 0 || i === 16)) {
    const chord = s.pads[i === 0 ? 0 : 1];
    for (const d of chord) tone(ac, freqOf(s, d), t, dur * 15, "sawtooth", 0.025, 900);
  }
}

/* ---------------------------------------------------------------- instruments */

function out(ac: AudioContext, node: AudioNode, lowpass?: number) {
  if (!master) return;
  if (lowpass) {
    const f = ac.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = lowpass;
    node.connect(f).connect(master);
  } else {
    node.connect(master);
  }
}

function env(ac: AudioContext, t: number, peak: number, attack: number, length: number) {
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + length);
  return g;
}

function tone(ac: AudioContext, f: number, t: number, length: number, type: OscillatorType, peak: number, lowpass?: number) {
  const o = ac.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  const g = env(ac, t, peak, 0.01, length);
  o.connect(g);
  out(ac, g, lowpass);
  o.start(t);
  o.stop(t + length + 0.05);
}

function kick(ac: AudioContext, t: number) {
  const o = ac.createOscillator();
  o.frequency.setValueAtTime(120, t);
  o.frequency.exponentialRampToValueAtTime(42, t + 0.22);
  const g = env(ac, t, 0.7, 0.005, 0.28);
  o.connect(g);
  out(ac, g);
  o.start(t);
  o.stop(t + 0.32);
}

function talkingDrum(ac: AudioContext, t: number, up: boolean) {
  const o = ac.createOscillator();
  o.frequency.setValueAtTime(up ? 150 : 230, t);
  o.frequency.exponentialRampToValueAtTime(up ? 250 : 120, t + 0.14);
  const g = env(ac, t, 0.45, 0.005, 0.2);
  o.connect(g);
  out(ac, g, 1500);
  o.start(t);
  o.stop(t + 0.25);
}

function bell(ac: AudioContext, t: number, accent: boolean) {
  // Agogo / ogene style: two inharmonic partials, struck.
  for (const [f, p] of [
    [accent ? 1180 : 880, 0.07],
    [accent ? 1770 : 1320, 0.035],
  ] as const) {
    tone(ac, f, t, 0.12, "square", p, 4000);
  }
}

function noiseHit(ac: AudioContext, t: number, length: number, highpass: number, peak: number) {
  if (!noiseBuf || noiseBuf.sampleRate !== ac.sampleRate) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let k = 0; k < d.length; k++) d[k] = Math.random() * 2 - 1;
  }
  const src = ac.createBufferSource();
  src.buffer = noiseBuf;
  const f = ac.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = highpass;
  const g = env(ac, t, peak, 0.003, length);
  src.connect(f).connect(g);
  out(ac, g);
  src.start(t);
  src.stop(t + length + 0.02);
}

function lead(ac: AudioContext, s: Style, f: number, t: number, step: number) {
  switch (s.lead) {
    case "synth":
      tone(ac, f, t, step * 1.6, "square", 0.05, 1600);
      tone(ac, f * 1.005, t, step * 1.6, "square", 0.04, 1600);
      return;
    case "guitar":
      tone(ac, f, t, 0.35, "triangle", 0.12);
      tone(ac, f * 2, t, 0.18, "triangle", 0.04);
      return;
    case "xylo":
      tone(ac, f, t, 0.22, "triangle", 0.16);
      tone(ac, f * 4, t, 0.06, "sine", 0.05);
      return;
    case "reed":
    case "flute":
    case "brass": {
      const o = ac.createOscillator();
      o.type = s.lead === "flute" ? "sine" : "sawtooth";
      o.frequency.setValueAtTime(f, t);
      const lfo = ac.createOscillator();
      const depth = ac.createGain();
      lfo.frequency.value = s.lead === "reed" ? 6 : 5;
      depth.gain.value = s.lead === "brass" ? 2 : 6;
      lfo.connect(depth).connect(o.frequency);
      const length = step * (s.lead === "brass" ? 3 : 2.2);
      const g = env(ac, t, s.lead === "flute" ? 0.13 : 0.06, 0.04, length);
      o.connect(g);
      out(ac, g, s.lead === "reed" ? 2200 : s.lead === "brass" ? 1300 : undefined);
      o.start(t);
      lfo.start(t);
      o.stop(t + length + 0.05);
      lfo.stop(t + length + 0.05);
      return;
    }
  }
}
