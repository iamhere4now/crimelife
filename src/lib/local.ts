/**
 * A little of each region's own language: Hausa in the North, Yoruba in the
 * South-West, Igbo in the South-East, and Pidgin across the South-South and
 * the Middle Belt. Used for the lead detective's lines in a case and for the
 * co-op quick phrases. Every line carries its English meaning.
 */

export type Lang = "hausa" | "yoruba" | "igbo" | "pidgin";

const HAUSA = ["Kano", "Kaduna", "Katsina", "Zamfara", "Kebbi", "Sokoto", "Bauchi", "Gombe", "Borno", "Yobe", "Jigawa", "Niger", "Adamawa"];
const YORUBA = ["Lagos", "Oyo", "Ogun", "Osun", "Ondo", "Ekiti", "Kwara"];
const IGBO = ["Anambra", "Imo", "Abia", "Enugu", "Ebonyi"];

export function langOf(state: string): Lang {
  if (HAUSA.includes(state)) return "hausa";
  if (YORUBA.includes(state)) return "yoruba";
  if (IGBO.includes(state)) return "igbo";
  return "pidgin";
}

export const LANG_NAME: Record<Lang, string> = { hausa: "Hausa", yoruba: "Yoruba", igbo: "Igbo", pidgin: "Pidgin" };

interface Line {
  say: string;
  /** English meaning (empty when it is already plain). */
  means: string;
}

/** The lead detective's lines, by how far the case has got. */
const LEAD: Record<Lang, { start: Line; some: Line; enough: Line; all: Line; closed: Line }> = {
  hausa: {
    start: { say: "Sannu da zuwa! Tap anything wey dey glow green.", means: "Welcome!" },
    some: { say: "Madalla! Keep looking, we never finish.", means: "Well done!" },
    enough: { say: "To, we have enough. Kana iya kama shi.", means: "Okay. You can arrest them." },
    all: { say: "Komai ya cika! Every clue is bagged.", means: "Everything is complete!" },
    closed: { say: "Allah ya saka da alheri, detective.", means: "May God reward you." },
  },
  yoruba: {
    start: { say: "Ẹ kú àbọ̀! Tap anything wey dey glow green.", means: "Welcome!" },
    some: { say: "O ṣeun! Keep looking, e never finish.", means: "Thank you!" },
    enough: { say: "Ó tó! We fit make the arrest now.", means: "That's enough!" },
    all: { say: "Gbogbo rẹ̀ ti pé! Every clue is bagged.", means: "It's all complete!" },
    closed: { say: "Ẹ kú iṣẹ́ o, detective!", means: "Well done on the work!" },
  },
  igbo: {
    start: { say: "Nnọọ! Tap anything wey dey glow green.", means: "Welcome!" },
    some: { say: "Ọ dị mma! Keep looking.", means: "It's good!" },
    enough: { say: "O zuola. We fit arrest am now.", means: "It's enough." },
    all: { say: "Ihe niile dị njikere! Every clue is bagged.", means: "Everything is ready!" },
    closed: { say: "Daalụ nke ukwuu, detective!", means: "Thank you very much!" },
  },
  pidgin: {
    start: { say: "Fresh scene, my guy. Tap anything wey dey glow green, no step on evidence o.", means: "" },
    some: { say: "Sharp eye! Make we keep dey look.", means: "" },
    enough: { say: "We don get enough. Make we go arrest am, or dig small more.", means: "" },
    all: { say: "Everything don complete! Oya, name the culprit.", means: "" },
    closed: { say: "Una do well! The culprit don enter cell.", means: "" },
  },
};

export function leadLine(state: string, stage: keyof (typeof LEAD)["hausa"]): Line {
  return LEAD[langOf(state)][stage];
}

/* ---------------------------------------------------------------- co-op quick phrases */

export interface Phrase {
  text: string;
  means?: string;
  /** Only offered in cases from this language's region (all regions when absent). */
  lang?: Lang;
}

/** Fixed list: players send only an index, never free text. */
export const PHRASES: Phrase[] = [
  { text: "Over here! 👀" },
  { text: "Check this spot" },
  { text: "Na this one! 🔥" },
  { text: "I don find am ✅" },
  { text: "Come help me" },
  { text: "Nice one! 👏" },
  { text: "Who dey lie? 🤔" },
  { text: "Make we arrest am 🚔" },
  { text: "I'm stuck 😩" },
  { text: "Thank you!" },
  { text: "Sannu!", means: "Hello", lang: "hausa" },
  { text: "Madalla!", means: "Well done", lang: "hausa" },
  { text: "Na gode!", means: "Thank you", lang: "hausa" },
  { text: "Ẹ kú iṣẹ́!", means: "Well done", lang: "yoruba" },
  { text: "Ẹ ṣé o!", means: "Thank you", lang: "yoruba" },
  { text: "Wá wò!", means: "Come and see", lang: "yoruba" },
  { text: "Ndewo!", means: "Hello", lang: "igbo" },
  { text: "Daalụ!", means: "Thank you", lang: "igbo" },
  { text: "Bia lee!", means: "Come and see", lang: "igbo" },
  { text: "How far?", means: "How are you doing?", lang: "pidgin" },
  { text: "E don do!", means: "That's enough", lang: "pidgin" },
];

/** Phrases to offer in a case from this state. */
export function phrasesFor(state: string): { phrase: Phrase; index: number }[] {
  const lang = langOf(state);
  return PHRASES.map((phrase, index) => ({ phrase, index })).filter(({ phrase }) => !phrase.lang || phrase.lang === lang);
}

export function phraseText(index: number): string | null {
  const p = PHRASES[index];
  return p ? (p.means ? `${p.text} (${p.means})` : p.text) : null;
}
