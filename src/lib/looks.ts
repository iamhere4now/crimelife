import type { PersonLook } from "@/three/world";
import type { DetectiveProfile, Face } from "./types";

/** Faces a new detective can pick at sign-up. */
export const PLAYER_LOOKS: Face[] = [
  { skin: "#8D5524", hair: "#2b1b10", hairStyle: "short", shirt: "#53FC18", bg: "#14261a", acc: "fedora", mood: "smile" },
  { skin: "#6b4226", hair: "#1b1b1b", hairStyle: "bun", shirt: "#53FC18", bg: "#14261a", acc: "gele", accColor: "#53FC18", mood: "smirk" },
  { skin: "#4a2c17", hair: "#1b1b1b", hairStyle: "buzz", shirt: "#53FC18", bg: "#14261a", acc: "shades", mood: "smirk" },
  { skin: "#A0703C", hair: "#1b1b1b", hairStyle: "long", shirt: "#53FC18", bg: "#14261a", acc: "glasses", mood: "smile" },
  { skin: "#5C3A1E", hair: "#1b1b1b", hairStyle: "short", shirt: "#53FC18", bg: "#14261a", acc: "fila", accColor: "#c0182b", mood: "smile" },
  { skin: "#8D5524", hair: "#53FC18", hairStyle: "mohawk", shirt: "#53FC18", bg: "#14261a", acc: "earring", mood: "smirk" },
];

export function lookFace(look: number): Face {
  return PLAYER_LOOKS[look % PLAYER_LOOKS.length] ?? PLAYER_LOOKS[0];
}

/* ---------------------------------------------------------------- the look editor's parts */

/** One choice in the editor. `rank` is the rank index that unlocks it (0 = from the start). */
export interface Part<T> {
  value: T;
  label: string;
  rank: number;
}

const p = <T,>(value: T, label: string, rank = 0): Part<T> => ({ value, label, rank });

export const PARTS = {
  skin: [p("#4a2c17", "Deep"), p("#5C3A1E", "Dark"), p("#6b4226", "Brown"), p("#8D5524", "Warm"), p("#A0703C", "Light brown"), p("#c68642", "Light")],
  hairStyle: [
    p<Face["hairStyle"]>("short", "Low cut"),
    p<Face["hairStyle"]>("buzz", "Skin cut"),
    p<Face["hairStyle"]>("bun", "Bun"),
    p<Face["hairStyle"]>("long", "Braids"),
    p<Face["hairStyle"]>("curly", "Afro", 1),
    p<Face["hairStyle"]>("slick", "Slick back", 2),
    p<Face["hairStyle"]>("mohawk", "Mohawk", 3),
    p<Face["hairStyle"]>("bald", "Clean head"),
  ],
  hair: [p("#1b1b1b", "Black"), p("#3a2414", "Dark brown"), p("#7a4a1a", "Brown", 1), p("#c0182b", "Red", 2), p("#53FC18", "Neon", 3), p("#e8e0d0", "Grey", 5)],
  acc: [
    p<Face["acc"] | undefined>(undefined, "Nothing"),
    p<Face["acc"] | undefined>("fedora", "Fedora"),
    p<Face["acc"] | undefined>("cap", "Cap"),
    p<Face["acc"] | undefined>("glasses", "Glasses"),
    p<Face["acc"] | undefined>("gele", "Gele"),
    p<Face["acc"] | undefined>("fila", "Fila"),
    p<Face["acc"] | undefined>("earring", "Earring"),
    p<Face["acc"] | undefined>("beard", "Beard", 1),
    p<Face["acc"] | undefined>("shades", "Shades", 2),
    p<Face["acc"] | undefined>("goggles", "Lab goggles", 3),
    p<Face["acc"] | undefined>("visor", "Visor", 4),
    p<Face["acc"] | undefined>("mask", "Mask", 5),
    p<Face["acc"] | undefined>("monocle", "Monocle", 6),
  ],
  accColor: [p("#53FC18", "Neon"), p("#c0182b", "Red"), p("#1d6a8a", "Blue"), p("#f5c518", "Gold", 2), p("#7a1f6a", "Purple", 1), p("#ffffff", "White")],
  shirt: [
    p("#53FC18", "Neon green"),
    p("#e8e0d0", "Agbada white"),
    p("#c0182b", "Ankara red"),
    p("#1d2f5a", "Police blue", 1),
    p("#1a1a1a", "Black ops", 2),
    p("#7a1f6a", "Royal purple", 3),
    p("#a8865a", "Trench coat", 4),
    p("#b08d2a", "Commissioner gold", 6),
    p("#3d5a2a", "Army green", 7),
    p("#5a4a2a", "Desert camo", 7),
  ],
  mood: [p<Face["mood"]>("smile", "Happy"), p<Face["mood"]>("smirk", "Sharp"), p<Face["mood"]>("flat", "Serious"), p<Face["mood"]>("worried", "Worried")],
  bg: [p("#14261a", "Panti green"), p("#1d2a3a", "Night blue"), p("#3a1d1d", "Maroon", 1), p("#2a2a2a", "Charcoal", 2), p("#3a2a5a", "Purple", 4), p("#5a4a12", "Gold", 11)],
};

type PartKey = keyof typeof PARTS;
const ORDER: PartKey[] = ["skin", "hairStyle", "hair", "acc", "accColor", "shirt", "mood", "bg"];

/** A face as a short code ("f1-" + one base-36 digit per part), safe to share with other players. */
export function encodeFace(face: Face): string {
  return (
    "f1-" +
    ORDER.map((k) => {
      const list = PARTS[k] as Part<unknown>[];
      const i = list.findIndex((x) => x.value === face[k as keyof Face]);
      return Math.max(0, i).toString(36);
    }).join("")
  );
}

/** Read a face code; null when it isn't one (codes from other players are untrusted). */
export function decodeFace(code: unknown): Face | null {
  if (typeof code !== "string" || !/^f1-[0-9a-z]{8}$/.test(code)) return null;
  const digits = code.slice(3).split("").map((d) => parseInt(d, 36));
  const face: Record<string, unknown> = {};
  ORDER.forEach((k, i) => {
    const list = PARTS[k] as Part<unknown>[];
    face[k] = (list[digits[i]] ?? list[0]).value;
  });
  return face as unknown as Face;
}

/** The face a detective shows: their own design, or the preset they signed up with. */
export function profileFace(p: Pick<DetectiveProfile, "look" | "face"> | null | undefined): Face {
  return decodeFace(p?.face) ?? lookFace(p?.look ?? 0);
}

/** The face code for a profile (designed or preset), for sharing. */
export function profileFaceCode(p: Pick<DetectiveProfile, "look" | "face"> | null | undefined): string {
  return p?.face && decodeFace(p.face) ? p.face : encodeFace(lookFace(p?.look ?? 0));
}

/** The 3D detective dressed like the player's portrait: skin, coat colour and hat. */
export function detectiveLook(face: Face): PersonLook {
  const hat: PersonLook["hat"] = face.acc === "cap" ? "cap" : face.acc === "gele" ? "gele" : face.acc === "fila" ? "fila" : face.acc === "fedora" || !face.acc ? "fedora" : undefined;
  // the neon portrait shirt reads as a classic trench coat in the street
  const coat = face.shirt === "#53FC18" ? "#a8865a" : face.shirt;
  return { skin: face.skin, top: coat, bottom: "#2b2f36", hat, hatColor: hat === "fedora" ? "#3a2e22" : face.accColor ?? "#1d2126", hold: "magnifier" };
}
