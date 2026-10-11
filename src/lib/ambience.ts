/**
 * Background sound for phone calls: where the inspector is calling from.
 * The traffic is a real street recording (lib/roadSound); the rest is
 * synthesized with Web Audio: crowd murmur and phone-line hiss, plus random street moments (danfo horns,
 * dogs barking, goats, okada passing, a generator, office phones, the sea).
 * Danfo conductors shouting are spoken by a second, quiet voice, only in the
 * gaps while the inspector is not talking (see InspectorCall).
 */

import { duckSceneRoad, playRoad } from "./roadSound";
import { audioContext, isMuted } from "./SoundEffects";

export type CallScene = "buspark" | "office" | "market" | "waterside";

type Event = "horn" | "bark" | "bleat" | "okada" | "ring" | "typing" | "boat" | "rooster";

const EVENTS: Record<CallScene, { bed: { traffic: number; crowd: number; generator?: number; fan?: number; waves?: number }; events: [Event, number][] }> = {
  // Oga T: Ojuelegba bus park
  buspark: { bed: { traffic: 0.22, crowd: 0.07, generator: 0.03 }, events: [["horn", 5], ["bark", 2], ["okada", 2], ["bleat", 1]] },
  // Madam Ngozi: Panti office, street outside the window
  office: { bed: { traffic: 0.08, crowd: 0.025, fan: 0.05 }, events: [["typing", 4], ["ring", 2], ["horn", 1], ["bark", 1]] },
  // Alhaji Musa: Kano market
  market: { bed: { traffic: 0.1, crowd: 0.09 }, events: [["bleat", 5], ["okada", 3], ["rooster", 1], ["bark", 1], ["horn", 1]] },
  // Captain Ebi: Port Harcourt waterside
  waterside: { bed: { traffic: 0.06, crowd: 0.06, waves: 0.12 }, events: [["boat", 3], ["horn", 2], ["bark", 2], ["bleat", 1]] },
};

let running: { stop: () => void; duck: (on: boolean) => void } | null = null;

/** Start the background for a scene. Returns quietly (no sound) when muted or unsupported. */
export function startAmbience(scene: CallScene) {
  stopAmbience();
  const ac = audioContext();
  if (!ac || isMuted()) return;
  const cfg = EVENTS[scene];

  const master = ac.createGain();
  master.gain.setValueAtTime(0.0001, ac.currentTime);
  // phone speakers are small: keep the street lower there so the voice stays clear
  const level = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches ? 0.7 : 1;
  master.gain.exponentialRampToValueAtTime(level, ac.currentTime + 1.5);
  master.connect(ac.destination);
  const nodes: AudioNode[] = [master];
  const timers: number[] = [];
  const intervals: number[] = [];

  const noise = noiseBuffer(ac);
  const loopNoise = () => {
    const src = ac.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    src.loopStart = Math.random();
    src.start();
    nodes.push(src);
    return src;
  };
  const chain = (...ns: AudioNode[]) => {
    for (let i = 0; i < ns.length - 1; i++) ns[i].connect(ns[i + 1]);
    nodes.push(...ns);
    return ns[ns.length - 1];
  };
  const gain = (v: number) => {
    const g = ac.createGain();
    g.gain.value = v;
    return g;
  };
  const filter = (type: BiquadFilterType, freq: number, q = 0.7) => {
    const f = ac.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    return f;
  };

  // --- the bed
  // the road: a real street recording (heard through the window from the office)
  const road = playRoad(Math.min(1, cfg.bed.traffic * 2.4), { into: master, muffle: scene === "office" });
  duckSceneRoad(true);
  // crowd murmur: band-passed noise that flutters like many voices
  const crowd = gain(cfg.bed.crowd);
  chain(loopNoise(), filter("bandpass", 650, 0.9), filter("lowpass", 2400), crowd, master);
  intervals.push(window.setInterval(() => crowd.gain.setTargetAtTime(cfg.bed.crowd * (0.55 + Math.random() * 0.9), ac.currentTime, 0.12), 260));
  // phone-line hiss, so it sounds like a call
  chain(loopNoise(), filter("highpass", 3500), gain(0.006), master);
  if (cfg.bed.generator) {
    const osc = ac.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = 52;
    osc.start();
    chain(osc, filter("lowpass", 260), gain(cfg.bed.generator), master);
  }
  if (cfg.bed.fan) chain(loopNoise(), filter("bandpass", 240, 2.5), gain(cfg.bed.fan), master);
  if (cfg.bed.waves) {
    const waves = gain(cfg.bed.waves);
    chain(loopNoise(), filter("lowpass", 520), waves, master);
    lfo(ac, waves.gain, 0.11, cfg.bed.waves * 0.8, nodes);
  }

  // --- street moments, every few seconds
  const total = cfg.events.reduce((s, [, w]) => s + w, 0);
  const next = () => {
    timers.push(
      window.setTimeout(() => {
        let r = Math.random() * total;
        const ev = cfg.events.find(([, w]) => (r -= w) < 0)?.[0] ?? cfg.events[0][0];
        const out = ac.createStereoPanner();
        out.pan.value = Math.random() * 1.6 - 0.8;
        out.connect(master);
        nodes.push(out);
        play(ac, ev, out, noise);
        next();
      }, 3500 + Math.random() * 6500),
    );
  };
  next();

  running = {
    duck: (on) => master.gain.setTargetAtTime(on ? level * 0.22 : level, ac.currentTime, on ? 0.12 : 0.6),
    stop: () => {
      road.stop();
      duckSceneRoad(false);
      timers.forEach((t) => window.clearTimeout(t));
      intervals.forEach((t) => window.clearInterval(t));
      master.gain.setTargetAtTime(0.0001, ac.currentTime, 0.2);
      window.setTimeout(() => {
        for (const n of nodes) {
          try {
            (n as AudioScheduledSourceNode).stop?.();
          } catch {
            // already stopped
          }
          n.disconnect();
        }
      }, 900);
    },
  };
}

/** Quieter while the inspector talks, so he's easy to hear. */
export function duckAmbience(on: boolean) {
  running?.duck(on);
}

export function stopAmbience() {
  running?.stop();
  running = null;
}

/* ---------------------------------------------------------------- building blocks */

let shared: AudioBuffer | null = null;
function noiseBuffer(ac: AudioContext) {
  if (shared) return shared;
  const b = ac.createBuffer(1, ac.sampleRate * 3, ac.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  shared = b;
  return b;
}

function lfo(ac: AudioContext, param: AudioParam, rate: number, depth: number, nodes: AudioNode[]) {
  const o = ac.createOscillator();
  o.frequency.value = rate;
  const g = ac.createGain();
  g.gain.value = depth;
  o.connect(g).connect(param);
  o.start();
  nodes.push(o, g);
}

function env(ac: AudioContext, g: GainNode, at: number, peak: number, attack: number, hold: number, release: number) {
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + attack);
  g.gain.setValueAtTime(peak, at + attack + hold);
  g.gain.exponentialRampToValueAtTime(0.0001, at + attack + hold + release);
}

function play(ac: AudioContext, ev: Event, out: AudioNode, noise: AudioBuffer) {
  const t = ac.currentTime + 0.05;
  const osc = (type: OscillatorType, freq: number) => {
    const o = ac.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    return o;
  };
  const bp = (f: number, q: number) => {
    const b = ac.createBiquadFilter();
    b.type = "bandpass";
    b.frequency.value = f;
    b.Q.value = q;
    return b;
  };
  const lp = (f: number) => {
    const b = ac.createBiquadFilter();
    b.type = "lowpass";
    b.frequency.value = f;
    return b;
  };
  // distance: everything a little muffled
  const far = lp(2600);
  far.connect(out);

  if (ev === "horn") {
    // danfo horn: two quick "poom poom"
    const honks = Math.random() < 0.5 ? 2 : 3;
    for (let i = 0; i < honks; i++) {
      const at = t + i * 0.32;
      const g = ac.createGain();
      env(ac, g, at, 0.05, 0.01, 0.18, 0.06);
      for (const f of [392, 494]) {
        const o = osc("square", f);
        o.connect(g);
        o.start(at);
        o.stop(at + 0.3);
      }
      g.connect(lp(1600)).connect(far);
    }
  } else if (ev === "bark") {
    // a dog: 2–3 short barks, pitch dropping
    const barks = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < barks; i++) {
      const at = t + i * (0.26 + Math.random() * 0.1);
      const o = osc("sawtooth", 560 + Math.random() * 120);
      o.frequency.exponentialRampToValueAtTime(260, at + 0.13);
      const n = ac.createBufferSource();
      n.buffer = noise;
      const g = ac.createGain();
      env(ac, g, at, 0.07, 0.008, 0.03, 0.1);
      o.connect(g);
      n.connect(bp(1400, 1.5)).connect(g);
      g.connect(bp(950, 1.1)).connect(far);
      o.start(at);
      o.stop(at + 0.2);
      n.start(at, Math.random());
      n.stop(at + 0.12);
    }
  } else if (ev === "bleat") {
    // a goat: a wobbly "meeeh-eh-eh"
    const at = t;
    const len = 0.7 + Math.random() * 0.4;
    const o = osc("sawtooth", 420 + Math.random() * 80);
    o.frequency.linearRampToValueAtTime(360, at + len);
    const vib = ac.createOscillator();
    vib.frequency.value = 7 + Math.random() * 3;
    const vibDepth = ac.createGain();
    vibDepth.gain.value = 28;
    vib.connect(vibDepth).connect(o.frequency);
    const g = ac.createGain();
    env(ac, g, at, 0.045, 0.06, len * 0.6, len * 0.35);
    const f1 = bp(750, 3);
    const f2 = bp(1250, 4);
    o.connect(f1).connect(g);
    o.connect(f2).connect(g);
    g.connect(far);
    o.start(at);
    vib.start(at);
    o.stop(at + len + 0.1);
    vib.stop(at + len + 0.1);
  } else if (ev === "okada") {
    // a motorbike passing: engine buzz rising then falling
    const at = t;
    const o = osc("sawtooth", 70);
    o.frequency.linearRampToValueAtTime(130, at + 1.4);
    o.frequency.linearRampToValueAtTime(85, at + 3);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.05, at + 1.4);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 3.2);
    o.connect(lp(800)).connect(g).connect(far);
    o.start(at);
    o.stop(at + 3.3);
  } else if (ev === "ring") {
    // a desk phone ringing in another office
    for (const off of [0, 0.42]) {
      const g = ac.createGain();
      env(ac, g, t + off, 0.012, 0.01, 0.3, 0.05);
      for (const f of [400, 450]) {
        const o = osc("sine", f);
        o.connect(g);
        o.start(t + off);
        o.stop(t + off + 0.4);
      }
      g.connect(far);
    }
  } else if (ev === "typing") {
    // someone typing
    let at = t;
    const n = 8 + Math.floor(Math.random() * 10);
    for (let i = 0; i < n; i++) {
      at += 0.06 + Math.random() * 0.12;
      const s = ac.createBufferSource();
      s.buffer = noise;
      const g = ac.createGain();
      env(ac, g, at, 0.035, 0.002, 0.005, 0.02);
      s.connect(bp(2600, 2)).connect(g).connect(far);
      s.start(at, Math.random() * 2);
      s.stop(at + 0.04);
    }
  } else if (ev === "boat") {
    // an outboard engine putt-putt going past
    const at = t;
    const o = osc("sawtooth", 42);
    const am = ac.createOscillator();
    am.frequency.value = 9;
    const amDepth = ac.createGain();
    amDepth.gain.value = 0.5;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.06, at + 2);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 4.5);
    const pulse = ac.createGain();
    pulse.gain.value = 0.5;
    am.connect(amDepth).connect(pulse.gain);
    o.connect(lp(380)).connect(pulse).connect(g).connect(far);
    o.start(at);
    am.start(at);
    o.stop(at + 4.6);
    am.stop(at + 4.6);
  } else if (ev === "rooster") {
    // a cockerel somewhere behind the stalls
    const notes: [number, number][] = [[620, 0.12], [880, 0.15], [840, 0.35], [600, 0.25]];
    let at = t;
    for (const [f, d] of notes) {
      const o = osc("sawtooth", f);
      o.frequency.linearRampToValueAtTime(f * 0.92, at + d);
      const g = ac.createGain();
      env(ac, g, at, 0.03, 0.02, d * 0.7, d * 0.3);
      o.connect(bp(1300, 3)).connect(g).connect(far);
      o.start(at);
      o.stop(at + d + 0.05);
      at += d;
    }
  }
}
