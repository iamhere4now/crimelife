"use client";

import { Check, Lock, Shuffle, X } from "lucide-react";
import { useState } from "react";
import { encodeFace, PARTS, type Part } from "@/lib/looks";
import { rankIndex } from "@/lib/ranks";
import { sfx } from "@/lib/SoundEffects";
import type { Face } from "@/lib/types";
import { rankName } from "@/lib/unlocks";
import { Avatar } from "./Avatar";

const SECTIONS: { key: keyof typeof PARTS; title: string; swatch?: boolean }[] = [
  { key: "skin", title: "Skin", swatch: true },
  { key: "hairStyle", title: "Hair" },
  { key: "hair", title: "Hair colour", swatch: true },
  { key: "acc", title: "Hat & extras" },
  { key: "accColor", title: "Extra colour", swatch: true },
  { key: "shirt", title: "Outfit", swatch: true },
  { key: "mood", title: "Face" },
  { key: "bg", title: "Background", swatch: true },
];

/**
 * Design your detective: skin, hair, hats and glasses, outfit and mood. Better
 * items unlock as you rise in rank; locked ones show the rank that opens them.
 * Your 3D detective in the scenes wears the same look.
 */
export function LookEditor({ face, xp, onSave, onClose }: { face: Face; xp: number; onSave: (code: string) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<Face>({ ...face });
  const myRank = rankIndex(xp);
  const set = (key: keyof Face, value: unknown) => {
    sfx.tap();
    setDraft((d) => ({ ...d, [key]: value }));
  };
  const surprise = () => {
    sfx.whoosh();
    const pick = <T,>(list: Part<T>[]) => {
      const open = list.filter((x) => x.rank <= myRank);
      return open[Math.floor(Math.random() * open.length)].value;
    };
    setDraft({
      skin: pick(PARTS.skin),
      hairStyle: pick(PARTS.hairStyle),
      hair: pick(PARTS.hair),
      acc: pick(PARTS.acc),
      accColor: pick(PARTS.accColor),
      shirt: pick(PARTS.shirt),
      mood: pick(PARTS.mood),
      bg: pick(PARTS.bg),
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 fade-in lg:items-center" onClick={onClose}>
      <div
        className="sheet-up no-scrollbar max-h-[94dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-ink px-4 pb-[max(env(safe-area-inset-bottom),18px)] pt-2.5 lg:max-w-xl lg:rounded-[28px] lg:p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Design your detective"
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-line lg:hidden" />
        <div className="sticky top-0 z-10 -mx-4 flex items-center gap-3 bg-ink px-4 pb-3 pt-3 lg:-mx-6 lg:px-6">
          <div className="size-20 shrink-0 overflow-hidden rounded-full ring-4 ring-kick pop-in" key={encodeFace(draft)}>
            <Avatar face={draft} className="size-full" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold leading-tight">Design your detective</h2>
            <p className="text-xs text-muted">Your detective in every crime scene wears this look. Rise in rank to unlock more.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="soft grid size-10 shrink-0 place-items-center rounded-full bg-card active:scale-90">
            <X className="size-4" />
          </button>
        </div>

        {SECTIONS.map(({ key, title, swatch }) => (
          <section key={key} className="mt-3">
            <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted">{title}</h3>
            <div className="flex flex-wrap gap-2">
              {(PARTS[key] as Part<unknown>[]).map((part) => {
                const locked = part.rank > myRank;
                const on = draft[key as keyof Face] === part.value;
                const preview = { ...draft, [key]: part.value } as Face;
                return (
                  <button
                    key={String(part.value) + part.label}
                    disabled={locked}
                    onClick={() => set(key as keyof Face, part.value)}
                    title={locked ? `Unlocks at ${rankName(part.rank)}` : part.label}
                    aria-pressed={on}
                    aria-label={locked ? `${part.label}, unlocks at ${rankName(part.rank)}` : part.label}
                    className={`relative flex items-center gap-1.5 rounded-full border px-1 py-1 pr-2.5 text-xs font-semibold transition active:scale-95 ${
                      on ? "border-kick bg-kick/10" : "border-line bg-card"
                    } ${locked ? "opacity-50" : ""}`}
                  >
                    {swatch ? (
                      <span className="size-7 rounded-full ring-1 ring-black/10" style={{ background: String(part.value) }} />
                    ) : (
                      <span className="size-7 overflow-hidden rounded-full">
                        <Avatar face={preview} className="size-full" />
                      </span>
                    )}
                    {part.label}
                    {locked && (
                      <span className="flex items-center gap-0.5 text-[10px] text-muted">
                        <Lock className="size-3" /> {rankName(part.rank)}
                      </span>
                    )}
                    {on && <Check className="size-3.5 text-go" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        <div className="sticky bottom-0 -mx-4 mt-4 flex gap-2 bg-ink px-4 pt-3 lg:-mx-6 lg:px-6">
          <button onClick={surprise} className="soft flex h-12 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-bold active:scale-95">
            <Shuffle className="size-4" /> Surprise me
          </button>
          <button
            onClick={() => {
              sfx.success();
              onSave(encodeFace(draft));
            }}
            className="h-12 flex-1 rounded-full bg-kick font-bold text-ink active:scale-95"
          >
            Save my look
          </button>
        </div>
      </div>
    </div>
  );
}
