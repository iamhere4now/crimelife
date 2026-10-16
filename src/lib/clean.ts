/**
 * A small filter for what other players see: detective names, chat and leaderboard
 * rows. Used by the game (to refuse a rude name at sign-up) and by the Worker (to
 * mask words before anything public is stored), so a changed client can't skip it.
 * It catches the common English, Pidgin, Yoruba, Igbo and Hausa insults and slurs;
 * the owner can still ban anyone it misses.
 */

// whole words (letters only, after undoing number tricks like "sh1t")
const WORDS = [
  // English
  "fuck", "fucker", "fucking", "fuckin", "motherfucker", "shit", "shitty", "bullshit", "bitch", "bitches", "bastard", "asshole", "arsehole", "dick", "dickhead",
  "pussy", "cunt", "cock", "whore", "slut", "porn", "rape", "rapist", "wanker", "twat", "retard", "faggot", "fag", "nigger", "nigga", "niggas", "negro",
  "penis", "vagina", "boobs", "tits", "sex", "sexy", "horny", "nude", "nudes",
  // Pidgin and Yoruba
  "ashawo", "ashewo", "toto", "oloshi", "olosho", "omoale", "werey", "agbaya", "dindinrin", "ode", "olodo", "oponu", "ewure", "gbola", "dodo",
  // Igbo
  "onyeara", "nwaashawo", "ewu", "anuofia", "otobo",
  // Hausa
  "shege", "danshege", "daniska", "karuwa", "kaji", "dakiki", "jaki",
];

// so rude they're masked even inside other words ("xfuckx")
const ANYWHERE = ["fuck", "nigger", "nigga", "ashawo", "ashewo", "shege", "motherf"];

// a few words that are also ordinary Nigerian names or everyday words: never masked
const ALLOW = new Set(["dodo", "ode", "jaki", "kaji", "ewu", "sex"]);

const BAD = new Set(WORDS.filter((w) => !ALLOW.has(w)));
// some of the allowed ones are still not OK in a name ("Ode" stays allowed: it is also a surname)
const NOT_A_NAME = new Set([...BAD, "ewu", "jaki", "sex"]);

const unleet = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/0/g, "o")
    .replace(/1|!|\|/g, "i")
    .replace(/3/g, "e")
    .replace(/4|@/g, "a")
    .replace(/5|\$/g, "s")
    .replace(/7/g, "t")
    .replace(/(.)\1{2,}/g, "$1$1");

/** True when the text holds a word we don't show. */
export function isRude(text: string, asName = false) {
  const t = unleet(text);
  const squeezed = t.replace(/[^a-z]/g, "");
  if (ANYWHERE.some((w) => squeezed.includes(w))) return true;
  const words = t.split(/[^a-z]+/).filter(Boolean);
  const set = asName ? NOT_A_NAME : BAD;
  if (words.some((w) => set.has(w))) return true;
  // "f u c k", "s.h.i.t": single letters spelled out
  const singles = t.split(/[^a-z]+/).filter(Boolean);
  if (singles.length >= 3 && singles.every((w) => w.length === 1) && set.has(squeezed)) return true;
  // two-word slurs written together or apart ("omo ale", "dan iska")
  for (let i = 0; i < words.length - 1; i++) if (set.has(words[i] + words[i + 1])) return true;
  return false;
}

/** The text with rude words starred out (keeps the first letter). */
export function maskRude(text: string) {
  if (!isRude(text)) return text;
  const out = text.replace(/[\p{L}\p{N}@$!|]+/gu, (w) => {
    const u = unleet(w).replace(/[^a-z]/g, "");
    if (!u) return w;
    const bad = BAD.has(u) || ANYWHERE.some((x) => u.includes(x));
    return bad ? w[0] + "\u2605".repeat(Math.max(2, w.length - 1)) : w;
  });
  // still rude (spelled out, or two words together): hide the whole thing
  return isRude(out) ? "(message hidden)" : out;
}

/** A name that's fine to show on the leaderboard and in co-op, or a stand-in. */
export const safeName = (name: string) => (isRude(name, true) ? "Detective" : name);
