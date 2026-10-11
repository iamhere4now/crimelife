/**
 * The Senior Inspectors' voices: the browser's built-in text-to-speech.
 *
 * A real Nigerian accent only plays where the device has a Nigerian English
 * voice (Microsoft Edge's "Abeo" and "Ezinne", Android's Google voices with
 * English (Nigeria) installed). We always prefer those, then other African
 * accents, then British. A player can also pick the device voice for each
 * inspector themselves. Pidgin words are respelled for the speech engine only
 * (the captions keep normal spelling) and naira amounts are said in words.
 */

export interface VoiceProfile {
  gender: "male" | "female";
  pitch: number;
  rate: number;
}

const DEFAULT_PROFILE: VoiceProfile = { gender: "male", pitch: 0.95, rate: 0.93 };

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

const FEMALE =
  /\b(female|ezinne|asilia|imani|leah|sonia|libby|maisie|samantha|karen|moira|tessa|zira|hazel|susan|kate|serena|martha|fiona|catherine|allison|ava|victoria|jenny|aria|natasha|clara|emily|michelle|leni|luna|yaa|rosa|nnenna)\b/;
const MALE =
  /\b(male|abeo|chilemba|elimu|luke|ryan|thomas|daniel|george|arthur|oliver|alfie|elliot|noah|ethan|william|guy|david|mark|james|aaron|rishi|connor|duncan|gordon|kofi|zuri)\b/;
// novelty voices that sound like toys
const TOY =
  /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|ralph|junior|kathy|princess|eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley)\b/;

export function isNigerian(v: SpeechSynthesisVoice) {
  return /en[-_]ng/i.test(v.lang) || /nigeria/i.test(v.name);
}

function region(v: SpeechSynthesisVoice) {
  const lang = (v.lang || "").toLowerCase().replace("_", "-");
  const name = (v.name || "").toLowerCase();
  if (isNigerian(v)) return "Nigeria";
  if (/en-gh/.test(lang) || /ghana/.test(name)) return "Ghana";
  if (/en-(ke|tz|ug)/.test(lang) || /kenya|tanzania|uganda/.test(name)) return "East Africa";
  if (/en-za/.test(lang) || /south africa/.test(name)) return "South Africa";
  if (/en-gb/.test(lang)) return "UK";
  if (/en-in/.test(lang)) return "India";
  if (/en-us/.test(lang)) return "US";
  return lang.toUpperCase();
}

function score(v: SpeechSynthesisVoice, gender: VoiceProfile["gender"]) {
  const lang = (v.lang || "").toLowerCase().replace("_", "-");
  const name = (v.name || "").toLowerCase();
  if (!lang.startsWith("en")) return -1;
  const where = region(v);
  let s = where === "Nigeria" ? 300 : where === "Ghana" ? 150 : where === "East Africa" ? 130 : where === "South Africa" ? 110 : where === "UK" ? 50 : where === "India" ? 40 : 30;
  const isFemale = FEMALE.test(name);
  const isMale = !isFemale && MALE.test(name);
  if (gender === "male") s += isFemale ? -45 : isMale ? 15 : 0;
  else s += isFemale ? 15 : isMale ? -45 : 0;
  // the "Natural"/"Online"/neural voices are far clearer than the old robotic ones
  if (/natural|neural|online|enhanced|premium|wavenet|network/.test(name)) s += 25;
  if (/google/.test(name)) s += 6;
  if (v.localService === false) s += 4;
  if (/compact|espeak|eloquence/.test(name)) s -= 30;
  if (TOY.test(name)) s -= 100;
  return Math.max(s, 0);
}

/** English voices on this device, best first, for the voice picker. */
export function listVoices(gender: VoiceProfile["gender"] = "male") {
  if (!canSpeak()) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((v) => (v.lang || "").toLowerCase().startsWith("en") && !TOY.test((v.name || "").toLowerCase()))
    .map((v) => ({ voice: v, score: score(v, gender), label: `${v.name.replace(/^(Microsoft|Google)\s+/, "").replace(/\s*\(.*$/, "").replace(/\s+Online$/, "")} · ${region(v)}` }))
    .sort((a, b) => b.score - a.score);
}

/** Call `cb` whenever the device's voice list changes (Chrome loads it late). */
export function onVoicesChanged(cb: () => void) {
  if (!canSpeak()) return () => {};
  const synth = window.speechSynthesis;
  synth.addEventListener?.("voiceschanged", cb);
  return () => synth.removeEventListener?.("voiceschanged", cb);
}

function pickVoice(gender: VoiceProfile["gender"], preferred?: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (preferred) {
    const v = voices.find((x) => x.name === preferred);
    if (v) return v;
  }
  return listVoices(gender)[0]?.voice ?? null;
}

/** True when the device voice really matches the gender (else we nudge the pitch, gently). */
function soundsLike(v: SpeechSynthesisVoice | null, gender: VoiceProfile["gender"]) {
  if (!v) return false;
  const n = (v.name || "").toLowerCase();
  return gender === "female" ? FEMALE.test(n) : !FEMALE.test(n);
}

export function hasNigerianVoice() {
  return canSpeak() && window.speechSynthesis.getVoices().some(isNigerian);
}

if (canSpeak()) {
  try {
    window.speechSynthesis.getVoices();
  } catch {
    // some browsers throw before the first user gesture
  }
}

/* ---------------------------------------------------------------- pronunciation */

// Plain respellings (no hyphens: engines pause or spell out at a hyphen).
const RESPELL = new Map([
  ["na", "nah"],
  ["dey", "day"],
  ["wey", "way"],
  ["abi", "abee"],
  ["oya", "oyah"],
  ["shey", "shay"],
  ["una", "oonah"],
  ["sef", "seff"],
  ["comot", "comott"],
  ["japa", "jahpah"],
  ["wahala", "wahahlah"],
  ["sabi", "sahbee"],
  ["abeg", "abegg"],
  ["biko", "beeko"],
  ["nna", "nnah"],
  ["chai", "chye"],
  ["haba", "hahbah"],
  ["kai", "kye"],
  ["ehen", "ehhen"],
  ["sannu", "sahnoo"],
  ["wetin", "wetinn"],
  ["dem", "demm"],
  ["am", "amm"],
  ["don", "donn"],
  ["fit", "fitt"],
  ["gist", "jist"],
]);

const TITLES: Record<string, string> = {
  Barr: "Barrister",
  Engr: "Engineer",
  Insp: "Inspector",
  Sgt: "Sergeant",
  Capt: "Captain",
  Det: "Detective",
  Snr: "Senior",
  Ofc: "Officer",
};

// Nigerian names and places, spelled so a foreign voice says them right (a Nigerian voice already does).
const NAMES = new Map([
  ["bakare", "Bahkahreh"],
  ["okafor", "Ohkahfor"],
  ["danjuma", "Dahnjoomah"],
  ["tamuno", "Tahmoonoh"],
  ["ebiere", "Ebbyereh"],
  ["ebi", "Ebbee"],
  ["ngozi", "Ngozee"],
  ["tunde", "Toondeh"],
  ["oga", "Ogah"],
  ["ojuelegba", "Ojwelegbah"],
  ["obalende", "Obahlendeh"],
  ["oshodi", "Ohshodee"],
  ["yaba", "Yahbah"],
  ["lagos", "Laygoss"],
  ["kano", "Kahnoh"],
  ["enugu", "Enoogoo"],
  ["ibadan", "Ibahdahn"],
  ["abuja", "Ahboojah"],
  ["panti", "Pahntee"],
  ["naira", "nyrah"],
  ["agbero", "Agbayroh"],
  ["danfo", "dahnfoh"],
  ["keke", "kehkeh"],
  ["okada", "Ohkahdah"],
  ["ehn", "en"],
]);

/** What the speech engine reads: same meaning, spelled for the ear. */
function forTheEar(text: string, nigerianVoice = false) {
  return text
    .replace(/₦\s?(\d[\d,]*(?:\.\d+)?)\s?([kKmM])?(?![A-Za-z])/g, (_, n: string, u?: string) => ` ${n.replace(/,/g, "")}${u ? (/m/i.test(u) ? " million" : " thousand") : ""} naira`)
    .replace(/…/g, ",")
    .replace(/\b(Barr|Engr|Insp|Sgt|Capt|Det|Snr|Ofc)\.(?=\s)/g, (_, w: string) => TITLES[w])
    .replace(/(?<=[A-Za-z,]\s)o(?=[\s.,!?]|$)/g, "oh")
    .replace(/[A-Za-z]+/g, (w) => {
      const r = RESPELL.get(w.toLowerCase()) ?? (nigerianVoice ? undefined : NAMES.get(w.toLowerCase()));
      return r ? (w[0] === w[0].toUpperCase() ? r[0].toUpperCase() + r.slice(1) : r.toLowerCase()) : w;
    })
    .replace(/\s{2,}/g, " ");
}

/** Split into sentences, keeping abbreviations and very short bits together. Returns [start, end) offsets. */
function sentences(text: string): [number, number][] {
  const out: [number, number][] = [];
  const re = /[.!?]+["'”’)]*\s+/g;
  let start = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const end = m.index + m[0].length;
    if (end - start < 28 || /\b(Mr|Mrs|Ms|Dr|Insp|Snr|Sgt|Cpl|Prof|Engr|Barr|Capt|Col|Gen|Rev|St|Det|Ofc|Hon|Alh)$/.test(text.slice(0, m.index))) continue;
    out.push([start, end]);
    start = end;
  }
  if (start < text.length) out.push([start, text.length]);
  return out;
}

/* ---------------------------------------------------------------- speaking */

/** Phones and tablets: their speech engines need gentler handling than desktop ones. */
export function isTouchDevice() {
  return typeof window !== "undefined" && !!window.matchMedia?.("(pointer: coarse)").matches;
}

let primed = false;

/**
 * Wake the speech engine during a tap. iPhones only allow speech that starts
 * from a tap; after one tap-started utterance, later speech is allowed too.
 */
export function primeSpeech(again = false) {
  if (!canSpeak() || (primed && !again) || mainBusy || window.speechSynthesis.speaking) return;
  primed = true;
  try {
    const synth = window.speechSynthesis;
    synth.getVoices();
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    current = u;
    synth.speak(u);
  } catch {
    primed = false;
  }
}

if (typeof document !== "undefined" && canSpeak()) {
  const once = () => primeSpeech();
  document.addEventListener("pointerdown", once, { once: true, capture: true });
  document.addEventListener("touchend", once, { once: true, capture: true });
  document.addEventListener("keydown", once, { once: true, capture: true });
}

// The utterance playing now (kept referenced: some browsers drop events of collected utterances),
// a counter that makes older speech give up, and device voices that failed to play.
let current: SpeechSynthesisUtterance | null = null;
let generation = 0;
let mainBusy = false;
const broken = new Set<string>();

export interface SpeakHandle {
  stop: () => void;
}

/**
 * Speak `text` in the given voice, one sentence at a time with a natural pause
 * between them. If the chosen voice fails (for example a Nigerian voice the
 * phone hasn't downloaded), the sentence is retried in the device's default
 * voice. `onProgress(chars)` reports roughly how much has been said, and
 * `onEnd` fires once, when speech ends, fails or is stopped.
 */
export function speak(
  text: string,
  opts: { muted?: boolean; voice?: VoiceProfile; voiceName?: string; onProgress?: (chars: number) => void; onEnd?: () => void } = {},
): SpeakHandle {
  const profile = opts.voice ?? DEFAULT_PROFILE;
  const my = ++generation;
  let done = false;
  let said = 0;
  // captions never run ahead of the sentence being spoken
  let ceiling = text.length;
  const bump = (n: number) => {
    const v = Math.min(n, ceiling, text.length);
    if (v > said) {
      said = v;
      opts.onProgress?.(said);
    }
  };
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
    return id;
  };
  const finish = () => {
    if (done) return;
    done = true;
    mainBusy = false;
    window.clearInterval(estimator);
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
    ceiling = text.length;
    opts.onProgress?.(text.length);
    opts.onEnd?.();
  };
  // About 14 characters a second: reveal at that pace between the device's own word reports.
  let clock = Date.now();
  let base = 0;
  const estimator = window.setInterval(() => {
    bump(base + Math.floor(((Date.now() - clock) / 1000) * 14 * profile.rate));
    if (silent && said >= text.length) finish();
  }, 60);

  let silent = !!opts.muted || !canSpeak();
  if (silent) return { stop: finish };
  let misses = 0;

  const synth = window.speechSynthesis;
  mainBusy = true;
  const parts = sentences(text);
  const wanted = pickVoice(profile.gender, opts.voiceName);

  const play = (k: number, fallback: boolean) => {
    if (done || my !== generation) return;
    if (k >= parts.length) return finish();
    const [from, to] = parts[k];
    const original = text.slice(from, to);
    const voice = fallback || (wanted && broken.has(wanted.name)) ? null : wanted;
    const spoken = forTheEar(original, !!voice && isNigerian(voice)).trim();
    if (!spoken) return play(k + 1, false);
    ceiling = to;
    base = from;
    clock = Date.now();

    const question = /\?["'”’)]*\s*$/.test(original);
    const exclaim = /!["'”’)]*\s*$/.test(original);
    const shift = soundsLike(voice, profile.gender) ? 0 : profile.gender === "female" ? 0.12 : -0.08;
    const u = new SpeechSynthesisUtterance(spoken);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    }
    u.volume = 1;
    // small, natural variation; big swings make the voice sound robotic
    u.rate = Math.min(1.2, Math.max(0.7, profile.rate + (exclaim ? 0.02 : 0) + (k % 2 ? -0.01 : 0.01)));
    u.pitch = Math.min(1.4, Math.max(0.6, profile.pitch + shift + (question ? 0.04 : 0) + (exclaim ? 0.02 : 0)));

    let settled = false;
    let started = 0;
    const expected = (spoken.length / (14 * u.rate)) * 1000;
    const next = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(noStart);
      window.clearTimeout(noEnd);
      bump(to);
      // a breath between sentences, a little longer after a question
      later(() => play(k + 1, false), question ? 260 : exclaim ? 160 : 200);
    };
    const failed = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(noStart);
      window.clearTimeout(noEnd);
      if (voice) {
        // this voice can't play here: use the device's default from now on
        broken.add(voice.name);
        synth.cancel();
        later(() => play(k, true), 120);
      } else if (++misses >= 2) {
        // the engine isn't producing sound at all: just finish the captions
        synth.cancel();
        silent = true;
        ceiling = text.length;
      } else later(() => play(k + 1, false), 60);
    };
    u.onstart = () => {
      started = Date.now();
      window.clearTimeout(noStart);
      bump(from);
    };
    u.onboundary = (e) => bump(from + Math.round((e.charIndex / spoken.length) * (to - from)));
    u.onend = () => {
      // an "end" in a blink, without a sound, means the voice never played (an undownloaded voice)
      const blink = !started && spoken.length > 20 && Date.now() - clock < 250;
      if (blink) failed();
      else {
        misses = 0;
        next();
      }
    };
    u.onerror = (e) => {
      if (my !== generation || done) return;
      if (e.error === "interrupted" || e.error === "canceled") return;
      failed();
    };
    // phones sometimes never start, or never report the end
    const noStart = window.setTimeout(() => {
      if (!started && !settled) failed();
    }, 3500);
    const noEnd = window.setTimeout(next, expected + 5000);

    current = u;
    if (synth.paused) synth.resume();
    synth.speak(u);
  };

  // Stop what's playing first, then give the engine a moment: speaking straight after cancel() is often dropped on phones.
  if (synth.speaking || synth.pending) {
    synth.cancel();
    later(() => play(0, false), 140);
  } else play(0, false);

  return {
    stop: () => {
      if (my === generation) synth.cancel();
      finish();
    },
  };
}

/**
 * A quiet voice in the background (a conductor shouting), only while the inspector is silent.
 * Skipped on phones: their engines ignore the volume, so the shout would drown the inspector.
 */
export function speakAside(text: string, opts: { volume?: number; rate?: number; pitch?: number; gender?: VoiceProfile["gender"] } = {}) {
  if (!canSpeak() || mainBusy || isTouchDevice() || window.speechSynthesis.speaking) return;
  const u = new SpeechSynthesisUtterance(forTheEar(text, false));
  const voice = pickVoice(opts.gender ?? "male");
  if (voice && !broken.has(voice.name)) {
    u.voice = voice;
    u.lang = voice.lang;
  }
  u.volume = opts.volume ?? 0.3;
  u.rate = opts.rate ?? 1.12;
  u.pitch = opts.pitch ?? 1.1;
  current = u;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  generation++;
  mainBusy = false;
  if (canSpeak()) window.speechSynthesis.cancel();
}
