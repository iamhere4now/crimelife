/**
 * The road: a real street recording (traffic, horns, engines) looped under
 * crime scenes that have a road with cars on it, and under the inspector
 * calls in place of the old synthesized traffic rumble. Decoded once, on
 * first use, through the shared audio context, so it follows the mute button.
 */

import { audioContext, isMuted } from "./SoundEffects";

let bufferPromise: Promise<AudioBuffer | null> | null = null;
// how many road loops are playing, and the timer that frees the decoded sound when none are
let playing = 0;
let freeTimer = 0;

/**
 * The decoded recording. Decoded at the recording's own 22 kHz (not the
 * phone's 48 kHz), which keeps it near 12 MB instead of 26 MB.
 */
function roadBuffer(ac: AudioContext): Promise<AudioBuffer | null> {
  bufferPromise ??= (async () => {
    const { ROAD_MP3_BASE64 } = await import("./roadAudio");
    const bin = atob(ROAD_MP3_BASE64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const Offline = window.OfflineAudioContext ?? (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext;
    let decoder: BaseAudioContext = ac;
    try {
      if (Offline) decoder = new Offline(1, 1, 22050);
    } catch {
      decoder = ac;
    }
    // the callback form works on older Safari too
    return await new Promise<AudioBuffer>((resolve, reject) => decoder.decodeAudioData(bytes.buffer, resolve, reject));
  })().catch(() => {
    bufferPromise = null;
    return null;
  });
  return bufferPromise;
}

function holdBuffer(on: boolean) {
  playing = Math.max(0, playing + (on ? 1 : -1));
  window.clearTimeout(freeTimer);
  // nothing has needed the road for a while: let the memory go (it decodes again next time)
  if (!playing) freeTimer = window.setTimeout(() => (bufferPromise = null), 45_000);
}

export interface RoadHandle {
  /** Fade to a new level (0–1) over `secs`. */
  setLevel: (v: number, secs?: number) => void;
  stop: () => void;
}

const SILENT: RoadHandle = { setLevel: () => {}, stop: () => {} };

/**
 * Start the road loop at `level`, into `into` (the speakers by default).
 * `muffle` puts it behind a window: only the low rumble comes through.
 */
export function playRoad(level: number, opts: { into?: AudioNode; muffle?: boolean } = {}): RoadHandle {
  const ac = audioContext();
  if (!ac || isMuted()) return SILENT;
  const out = ac.createGain();
  out.gain.value = 0.0001;
  let tail: AudioNode = out;
  if (opts.muffle) {
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 650;
    out.connect(lp);
    tail = lp;
  }
  tail.connect(opts.into ?? ac.destination);
  let src: AudioBufferSourceNode | null = null;
  let stopped = false;
  let target = level;
  holdBuffer(true);

  void roadBuffer(ac).then((buf) => {
    if (!buf || stopped) return;
    src = ac.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    // skip the MP3 encoder's padding at both ends so the loop has no gap
    src.loopStart = Math.min(0.08, buf.duration / 4);
    src.loopEnd = Math.max(src.loopStart + 1, buf.duration - 0.08);
    src.connect(out);
    // start somewhere different each time, so scenes don't all begin with the same horn
    src.start(0, src.loopStart + Math.random() * (src.loopEnd - src.loopStart - 1));
    out.gain.setValueAtTime(0.0001, ac.currentTime);
    out.gain.exponentialRampToValueAtTime(Math.max(0.0001, target), ac.currentTime + 1.8);
  });

  return {
    setLevel: (v, secs = 0.6) => {
      target = v;
      if (stopped || !src) return;
      out.gain.cancelScheduledValues(ac.currentTime);
      out.gain.setTargetAtTime(Math.max(0.0001, v), ac.currentTime, secs / 3);
    },
    stop: () => {
      if (stopped) return;
      stopped = true;
      holdBuffer(false);
      const t = ac.currentTime;
      out.gain.cancelScheduledValues(t);
      out.gain.setTargetAtTime(0.0001, t, 0.25);
      window.setTimeout(() => {
        try {
          src?.stop();
        } catch {
          // already stopped
        }
        src?.disconnect();
        out.disconnect();
        tail.disconnect();
      }, 1200);
    },
  };
}

/* ---------------------------------------------------------------- the scene's road */

let scene: { handle: RoadHandle; level: number } | null = null;
let onCall = false;

/** Play the road under the open crime scene (stops any earlier one). */
export function startSceneRoad(level = 0.32) {
  stopSceneRoad();
  scene = { handle: playRoad(onCall ? level * 0.25 : level), level };
}

export function stopSceneRoad() {
  scene?.handle.stop();
  scene = null;
}

/** An inspector call has its own street behind it: keep the scene's road low meanwhile. */
export function duckSceneRoad(on: boolean) {
  onCall = on;
  if (scene) scene.handle.setLevel(on ? scene.level * 0.25 : scene.level, 0.8);
}
