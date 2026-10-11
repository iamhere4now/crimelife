"use client";

import { Check, ChevronLeft, FlaskConical, Gavel, HelpCircle, Scale, Shield, ShieldX, X } from "lucide-react";
import { useState } from "react";
import { money } from "@/lib/format";
import { sfx } from "@/lib/SoundEffects";
import type { CrimeCase, GameState, Suspect } from "@/lib/types";
import { LIE_BONUS, MAX_STRIKES } from "@/lib/useGameState";
import { Avatar } from "./Avatar";

interface Props {
  theCase: CrimeCase;
  suspect: Suspect;
  state: GameState;
  onBack: () => void;
  /** Returns the bonus paid. */
  onCatch: (statementId: string) => number;
  /** Returns the new strike count. */
  onStrike: () => number;
}

type Flash = { kind: "caught"; bonus: number } | { kind: "miss"; text: string } | null;

/** L.A. Noire-style questioning: believe it, doubt it, or call the lie and prove it. */
export function Interrogation({ theCase, suspect, state, onBack, onCatch, onStrike }: Props) {
  const [index, setIndex] = useState(0);
  const [pressed, setPressed] = useState<string[]>([]);
  const [picking, setPicking] = useState(false);
  const [flash, setFlash] = useState<Flash>(null);

  const statement = suspect.statements[index];
  const caught = state.caught[theCase.id] ?? [];
  const isCaught = caught.includes(statement.id);
  const strikes = state.strikes[theCase.id]?.[suspect.id] ?? 0;
  const lawyered = strikes >= MAX_STRIKES;
  const found = state.found[theCase.id] ?? [];
  const analyzed = state.analyzed[theCase.id] ?? [];
  const evidence = theCase.clues.filter((c) => found.includes(c.id));
  const last = index === suspect.statements.length - 1;

  const go = (i: number) => {
    sfx.tap();
    setIndex(i);
    setPicking(false);
    setFlash(null);
  };

  const present = (clueId: string) => {
    setPicking(false);
    if (statement.lie?.clueId === clueId) {
      sfx.objection();
      setFlash({ kind: "caught", bonus: onCatch(statement.id) });
    } else {
      sfx.error();
      const n = onStrike();
      setFlash({
        kind: "miss",
        text: n >= MAX_STRIKES ? `${suspect.name} don call lawyer. No more evidence.` : "That evidence no prove say na lie o.",
      });
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-ink fade-in lg:mx-auto lg:max-w-xl lg:shadow-2xl" role="dialog" aria-label={`Interrogating ${suspect.name}`}>
      <div className="flex items-center gap-2 border-b border-line/60 px-3 pb-2.5 pt-[max(env(safe-area-inset-top),10px)]">
        <button onClick={onBack} aria-label="Back to suspects" className="grid size-10 place-items-center rounded-full transition hover:bg-raise active:scale-90">
          <ChevronLeft className="size-6" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-extrabold">Interrogation Room</div>
          <div className="text-[11px] text-muted">Catch a lie: +{money(LIE_BONUS)} each</div>
        </div>
        <div className="flex items-center gap-0.5" aria-label={`${MAX_STRIKES - strikes} of ${MAX_STRIKES} patience left`}>
          {Array.from({ length: MAX_STRIKES }, (_, i) =>
            i < MAX_STRIKES - strikes ? <Shield key={i} className="size-5 fill-kick/30 text-kick" /> : <ShieldX key={i} className="size-5 text-danger" />,
          )}
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6 pt-5">
        {/* suspect under the lamp */}
        <div className="relative mx-auto flex w-fit flex-col items-center">
          <div className="absolute -top-6 h-28 w-48 rounded-full bg-[radial-gradient(closest-side,rgba(255,233,168,0.22),transparent)]" />
          <div className={`relative size-28 overflow-hidden rounded-3xl ring-4 ${isCaught ? "ring-danger" : "ring-line"} ${flash?.kind === "miss" ? "shake" : ""}`}>
            <Avatar face={{ ...suspect.face, mood: isCaught ? "worried" : suspect.face.mood }} className="size-full" />
          </div>
          {flash?.kind === "caught" && (
            <span className="stamp absolute -bottom-3 rounded-md border-2 border-danger bg-ink px-3 py-0.5 text-sm font-black tracking-widest text-danger">
              YOU DON CATCH AM!
            </span>
          )}
        </div>
        <div className="mt-5 text-center">
          <div className="text-lg font-black">{suspect.name}</div>
          <div className="text-xs text-muted">{suspect.role}</div>
        </div>

        {/* statement navigator */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {suspect.statements.map((s, i) => (
            <button
              key={s.id}
              onClick={() => go(i)}
              aria-label={`Statement ${i + 1}`}
              aria-current={i === index}
              className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-kick" : caught.includes(s.id) ? "w-2 bg-danger" : "w-2 bg-line"}`}
            />
          ))}
        </div>

        {/* testimony */}
        <div className="mt-4 rounded-2xl border border-line bg-card p-4">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-muted">
            <span>
              Statement {index + 1} of {suspect.statements.length}
            </span>
            {isCaught && <span className="rounded-full bg-danger/15 px-2 py-0.5 text-danger">Lie</span>}
          </div>
          <p className={`mt-2 text-[17px] font-semibold leading-snug ${isCaught ? "text-neutral-500 line-through decoration-danger decoration-2" : ""}`}>
            “{statement.text}”
          </p>
          {pressed.includes(statement.id) && !isCaught && (
            <p className="pop-in mt-3 rounded-xl bg-raise p-3 text-sm italic text-neutral-700">
              “{statement.press ?? "I don tell you everything. Na true I talk."}”
            </p>
          )}
          {isCaught && statement.lie && (
            <p className="pop-in mt-3 rounded-xl border border-kick/40 bg-kick/10 p-3 text-sm text-fg">
              <span className="font-bold text-kick">Confession: </span>“{statement.lie.reveal}”
            </p>
          )}
          {flash?.kind === "caught" && flash.bonus > 0 && (
            <p className="pop-in mt-2 text-center text-sm font-black text-kick neon-text">+{money(flash.bonus)}. You don break the lie!</p>
          )}
          {flash?.kind === "miss" && <p className="pop-in mt-3 text-center text-sm font-semibold text-danger">{flash.text}</p>}
        </div>

        {/* evidence tray */}
        {picking && (
          <div className="sheet-up mt-3 rounded-2xl border border-kick/40 bg-night p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-extrabold">Show am the evidence</span>
              <button onClick={() => setPicking(false)} aria-label="Cancel" className="grid size-8 place-items-center rounded-full bg-raise">
                <X className="size-4" />
              </button>
            </div>
            {evidence.length === 0 ? (
              <p className="py-3 text-center text-sm text-muted">You never bag any evidence. Go search the scene first.</p>
            ) : (
              <div className="grid gap-2">
                {evidence.map((c) => {
                  const ready = analyzed.includes(c.id);
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.id}
                      disabled={!ready}
                      onClick={() => present(c.id)}
                      className="flex items-center gap-2.5 rounded-xl border border-line bg-card p-2.5 text-left transition enabled:hover:border-kick enabled:active:scale-[0.98] disabled:opacity-50"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-kick/15 text-kick">
                        <Icon className="size-4.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">{c.name}</span>
                        <span className="block text-[11px] text-muted">
                          {ready ? c.finding : (
                            <>
                              <FlaskConical className="mr-1 inline size-3" />
                              Lab never check am. E no go hold.
                            </>
                          )}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Truth / Doubt / Lie */}
      <div className="grid grid-cols-3 gap-2 border-t border-line/60 bg-ink/95 px-4 pb-[max(env(safe-area-inset-bottom),14px)] pt-3">
        <button
          onClick={() => (last ? onBack() : go(index + 1))}
          className="flex h-14 flex-col items-center justify-center rounded-2xl bg-raise text-xs font-bold transition hover:bg-line active:scale-95"
        >
          <Check className="size-5 text-kick" />
          {last ? "Done" : "True talk"}
        </button>
        <button
          disabled={isCaught}
          onClick={() => {
            sfx.tap();
            setFlash(null);
            setPressed((p) => (p.includes(statement.id) ? p : [...p, statement.id]));
          }}
          className="flex h-14 flex-col items-center justify-center rounded-2xl bg-raise text-xs font-bold transition enabled:hover:bg-line enabled:active:scale-95 disabled:opacity-40"
        >
          <HelpCircle className="size-5 text-amber-300" />
          I doubt am
        </button>
        <button
          disabled={isCaught || lawyered}
          onClick={() => {
            sfx.whoosh();
            setFlash(null);
            setPicking(true);
          }}
          className="flex h-14 flex-col items-center justify-center rounded-2xl bg-danger text-xs font-black text-white transition enabled:hover:brightness-110 enabled:active:scale-95 disabled:bg-raise disabled:text-muted"
        >
          {lawyered ? <Scale className="size-5" /> : <Gavel className="size-5" />}
          {lawyered ? "Don call lawyer" : "Na lie!"}
        </button>
      </div>
    </div>
  );
}
