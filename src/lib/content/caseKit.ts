/** Small builders that keep the later state case files short. */

import type { LucideIcon } from "lucide-react";
import type { Clue, Face, LabGame, MusicStyle, Statement, Suspect } from "../types";

export const face = (skin: string, shirt: string, hairStyle: Face["hairStyle"] = "short", acc?: Face["acc"], mood: Face["mood"] = "flat", accColor?: string): Face => ({
  skin,
  hair: "#1b1b1b",
  hairStyle,
  shirt,
  bg: "#e7e9ed",
  acc,
  accColor,
  mood,
});

export const at = (state: string, place: string, music: MusicStyle) => ({ state, place, music });

/** A statement: plain, with a press detail (string), or a lie broken by a clue ([clueId, reveal]). */
export const st = (id: string, text: string, more?: string | [string, string]): Statement =>
  Array.isArray(more) ? { id, text, lie: { clueId: more[0], reveal: more[1] } } : more ? { id, text, press: more } : { id, text };

export const sus = (
  id: string,
  name: string,
  role: string,
  f: Face,
  motive: string,
  alibi: string,
  background: string,
  quote: string,
  ...statements: Statement[]
): Suspect => ({ id, name, role, face: f, motive, alibi, background, quote, statements });

export const clue = (
  id: string,
  name: string,
  icon: LucideIcon,
  x: number,
  y: number,
  description: string,
  action: string,
  finding: string,
  suspectId?: string,
  lab?: LabGame,
): Clue => ({ id, name, icon, x, y, description, action, finding, suspectId, lab });

export const torn = (title: string, lines: string[]): LabGame => ({ kind: "torn", style: "ledger", title, lines });
export const prints = (shape: "finger" | "boot" = "finger"): LabGame => ({ kind: "prints", shape });
