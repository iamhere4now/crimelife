"use client";

import { AlertTriangle, ChevronDown, Gavel, MessagesSquare, Scale, ShieldX, Users, X } from "lucide-react";
import { useState } from "react";
import { money } from "@/lib/format";
import { sfx } from "@/lib/SoundEffects";
import type { CrimeCase, GameState, Suspect, Verdict } from "@/lib/types";
import { FINE, MAX_STRIKES, RATING_DOWN, RATING_UP } from "@/lib/useGameState";
import { Avatar } from "./Avatar";
import { Interrogation } from "./Interrogation";

interface Props {
  theCase: CrimeCase;
  state: GameState;
  /** Accusations open once enough clues are bagged; interrogation is always open. */
  cluesNeeded: number;
  solved: boolean;
  onClose: () => void;
  onAccuse: (suspectId: string) => Verdict;
  onCatch: (statementId: string) => number;
  onStrike: (suspectId: string) => number;
}

/** Suspect files, interrogation and accusation. */
export function SuspectSheet({ theCase, state, cluesNeeded, solved, onClose, onAccuse, onCatch, onStrike }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(theCase.suspects[0].id);
  const [confirming, setConfirming] = useState(false);
  const [questioning, setQuestioning] = useState<Suspect | null>(null);
  const cleared = state.wrong[theCase.id] ?? [];
  const chosen = theCase.suspects.find((s) => s.id === selected);
  const canAccuse = cluesNeeded <= 0 && !solved;

  return (
    <div className="absolute inset-0 z-20 flex items-end bg-black/40 fade-in lg:items-center lg:justify-center" onClick={onClose}>
      <div
        className="sheet-up flex max-h-[92%] w-full flex-col rounded-t-3xl border-t border-kick/40 bg-night lg:max-h-[88%] lg:max-w-xl lg:overflow-hidden lg:rounded-3xl lg:border-0"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Suspects"
      >
        <div className="px-5 pt-3">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-black">
                {canAccuse ? <Gavel className="size-5 text-kick" /> : <Users className="size-5 text-kick" />}
                {canAccuse ? "Na who do am?" : "The suspects"}
              </h2>
              <p className="mt-1 text-xs text-muted">
                {canAccuse ? (
                  <>
                    Right: <span className="font-bold text-kick">+{money(theCase.bounty)} · +{RATING_UP}★</span> · Wrong:{" "}
                    <span className="font-bold text-danger">-{money(FINE)} · -{RATING_DOWN}★</span>
                  </>
                ) : (
                  "Question them well. Catch their lies with evidence wey the lab don check."
                )}
              </p>
            </div>
            <button onClick={onClose} aria-label="Close" className="grid size-9 shrink-0 place-items-center rounded-full bg-raise active:scale-90">
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="no-scrollbar mt-4 flex-1 space-y-2.5 overflow-y-auto px-5 pb-4">
          {theCase.suspects.map((s) => (
            <SuspectCard
              key={s.id}
              suspect={s}
              theCase={theCase}
              state={state}
              selectable={canAccuse}
              cleared={cleared.includes(s.id)}
              selected={selected === s.id}
              expanded={expanded === s.id}
              onExpand={() => {
                sfx.tap();
                setExpanded(expanded === s.id ? null : s.id);
              }}
              onSelect={() => {
                sfx.tap();
                setSelected(s.id);
                setConfirming(false);
              }}
              onInterrogate={() => {
                sfx.whoosh();
                setQuestioning(s);
              }}
            />
          ))}
        </div>

        <div className="border-t border-line/60 px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
          {solved ? (
            <p className="py-3 text-center text-sm font-semibold text-muted">Case don close. You fit still question them for fun.</p>
          ) : !canAccuse ? (
            <button disabled className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-raise font-extrabold text-muted">
              <Gavel className="size-5" />
              Find {cluesNeeded} more clue{cluesNeeded === 1 ? "" : "s"} before you accuse
            </button>
          ) : confirming && chosen ? (
            <div className="pop-in">
              <p className="mb-2.5 flex items-center justify-center gap-1.5 text-center text-sm font-semibold text-amber-300">
                <AlertTriangle className="size-4" /> You sure say na {chosen.name}? No going back o.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirming(false)} className="h-12 flex-1 rounded-full bg-raise font-bold transition active:scale-95">
                  Wait first
                </button>
                <button
                  onClick={() => onAccuse(chosen.id)}
                  className="h-12 flex-[2] rounded-full bg-kick font-extrabold text-ink shadow-[0_10px_24px_-14px_rgba(20,22,27,0.6)] transition hover:brightness-110 active:scale-95"
                >
                  Carry am go!
                </button>
              </div>
            </div>
          ) : (
            <button
              disabled={!chosen}
              onClick={() => {
                sfx.tap();
                setConfirming(true);
              }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-kick font-extrabold text-ink transition enabled:hover:brightness-110 enabled:active:scale-95 disabled:bg-raise disabled:text-muted"
            >
              <Gavel className="size-5" />
              {chosen ? `Na ${chosen.name} do am!` : "Tap a face to pick your suspect"}
            </button>
          )}
        </div>
      </div>

      {questioning && (
        <div onClick={(e) => e.stopPropagation()}>
          <Interrogation
            theCase={theCase}
            suspect={questioning}
            state={state}
            onBack={() => setQuestioning(null)}
            onCatch={onCatch}
            onStrike={() => onStrike(questioning.id)}
          />
        </div>
      )}
    </div>
  );
}

interface CardProps {
  suspect: Suspect;
  theCase: CrimeCase;
  state: GameState;
  selectable: boolean;
  cleared: boolean;
  selected: boolean;
  expanded: boolean;
  onExpand: () => void;
  onSelect: () => void;
  onInterrogate: () => void;
}

function SuspectCard({ suspect: s, theCase, state, selectable, cleared, selected, expanded, onExpand, onSelect, onInterrogate }: CardProps) {
  const analyzed = state.analyzed[theCase.id] ?? [];
  const caught = state.caught[theCase.id] ?? [];
  const related = theCase.clues.filter((c) => c.suspectId === s.id && analyzed.includes(c.id));
  const lies = s.statements.filter((st) => caught.includes(st.id));
  const lawyered = (state.strikes[theCase.id]?.[s.id] ?? 0) >= MAX_STRIKES;

  return (
    <div
      className={`rounded-2xl border bg-card transition ${
        cleared ? "border-line opacity-55" : selected ? "border-kick shadow-[0_10px_24px_-14px_rgba(20,22,27,0.6)]" : "border-line"
      }`}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          onClick={selectable ? onSelect : onExpand}
          disabled={selectable && cleared}
          aria-pressed={selectable ? selected : undefined}
          aria-label={selectable ? `Select ${s.name}` : `${s.name} details`}
          className={`relative size-16 shrink-0 overflow-hidden rounded-xl transition enabled:active:scale-95 ${
            selected ? "ring-2 ring-kick" : "ring-1 ring-line"
          }`}
        >
          <Avatar face={s.face} className={`size-full ${cleared ? "grayscale" : ""}`} />
          {selected && <span className="absolute inset-x-0 bottom-0 bg-kick py-0.5 text-center text-[9px] font-black text-ink">SUSPECT</span>}
        </button>
        <button onClick={onExpand} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-extrabold">{s.name}</span>
            {cleared && (
              <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-danger/15 px-1.5 py-0.5 text-[9px] font-bold text-danger">
                <ShieldX className="size-3" /> CLEARED BY IA
              </span>
            )}
          </div>
          <div className="truncate text-xs text-muted">{s.role}</div>
          <div className="mt-1 flex flex-wrap gap-x-2 text-[10px] font-bold">
            {lies.length > 0 && <span className="text-danger">{lies.length} lie{lies.length > 1 ? "s" : ""} caught</span>}
            {related.length > 0 && (
              <span className="text-kick">
                {related.length} lab result{related.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </button>
        <button onClick={onExpand} aria-label={expanded ? "Hide details" : "Show details"} className="grid size-9 place-items-center text-muted">
          <ChevronDown className={`size-5 transition ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {expanded && (
        <div className="space-y-2 px-3 pb-3 text-[13px] leading-snug">
          <Field label="Motive" text={s.motive} />
          <Field label="Alibi" text={s.alibi} />
          <Field label="Background" text={s.background} />
          {related.map((c) => (
            <div key={c.id} className="rounded-lg bg-kick/10 p-2 text-neutral-700">
              <span className="font-bold text-kick">{c.name}: </span>
              {c.finding}
            </div>
          ))}
          {lies.map((st) => (
            <div key={st.id} className="rounded-lg bg-danger/10 p-2 text-neutral-700">
              <span className="font-bold text-danger">Lie: </span>
              <span className="line-through decoration-danger">“{st.text}”</span> {st.lie && <>→ “{st.lie.reveal}”</>}
            </div>
          ))}
          <button
            onClick={onInterrogate}
            className="flex h-10 items-center gap-1.5 rounded-full border border-kick/60 px-4 text-xs font-bold text-kick transition hover:bg-kick/10 active:scale-95"
          >
            {lawyered ? <Scale className="size-4" /> : <MessagesSquare className="size-4" />}
            {lawyered ? "Read their talk (don call lawyer)" : "Question am"}
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, text }: { label: string; text: string }) {
  return (
    <p className="text-neutral-600">
      <span className="text-[11px] font-extrabold uppercase tracking-wide text-fg">{label} </span>
      {text}
    </p>
  );
}
