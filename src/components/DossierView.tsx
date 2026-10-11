"use client";

import { ChevronRight, CircleCheckBig, FolderSearch, Lock, MessagesSquare, Microscope, ShieldX } from "lucide-react";
import { CASES } from "@/lib/cases";
import { isCaseOpen } from "@/lib/modes";
import type { CaseId, GameState } from "@/lib/types";
import { SceneThumb } from "./scenes/SceneThumb";

export function DossierView({ state, onOpen }: { state: GameState; onOpen: (id: CaseId) => void }) {
  return (
    <div className="px-4 pt-5">
      <h1 className="flex items-center gap-2 text-2xl font-black">
        <FolderSearch className="size-6 text-kick" /> Dossier
      </h1>
      <p className="mt-1 text-sm text-muted">Every clue wey you don bag, and every lab result, case by case.</p>

      <div className="mt-5 space-y-4">
        {CASES.map((c) => {
          const unlocked = isCaseOpen(c.id, state);
          const solved = state.solved.includes(c.id);
          const found = state.found[c.id] ?? [];
          const analyzed = state.analyzed[c.id] ?? [];
          const wrong = state.wrong[c.id] ?? [];
          const lies = c.suspects.flatMap((s) =>
            s.statements.filter((st) => state.caught[c.id]?.includes(st.id)).map((st) => ({ suspect: s.name, st })),
          );
          return (
            <article key={c.id} className="overflow-hidden rounded-2xl border border-line bg-card">
              <button onClick={() => onOpen(c.id)} className="flex w-full items-center gap-3 p-3 text-left transition active:bg-raise">
                <div className="size-14 shrink-0 overflow-hidden rounded-xl ring-1 ring-line">
                  <SceneThumb theCase={c} cast={false} className={`size-full ${unlocked ? "" : "blur-[2px] grayscale"}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-extrabold">{c.title}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs font-semibold">
                    {solved ? (
                      <span className="flex items-center gap-1 text-kick">
                        <CircleCheckBig className="size-3.5" /> Closed
                      </span>
                    ) : unlocked ? (
                      <span className="text-amber-300">Open · {found.length}/{c.clues.length} clues</span>
                    ) : (
                      <span className="flex items-center gap-1 text-muted">
                        <Lock className="size-3.5" /> Locked
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="size-5 text-muted" />
              </button>

              {unlocked && (found.length > 0 || wrong.length > 0 || lies.length > 0) && (
                <ul className="space-y-2 border-t border-line/60 p-3">
                  {c.clues
                    .filter((cl) => found.includes(cl.id))
                    .map((cl) => {
                      const Icon = cl.icon;
                      const done = analyzed.includes(cl.id);
                      return (
                        <li key={cl.id} className="flex gap-2.5 text-[13px]">
                          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-kick/15 text-kick">
                            <Icon className="size-4" />
                          </span>
                          <div>
                            <div className="font-bold">{cl.name}</div>
                            <div className={done ? "text-neutral-600" : "italic text-muted"}>
                              {done ? (
                                <>
                                  <Microscope className="mr-1 inline size-3.5 text-kick" />
                                  {cl.finding}
                                </>
                              ) : (
                                "Not analysed yet."
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  {lies.map(({ suspect, st }) => (
                    <li key={st.id} className="flex gap-2.5 text-[13px]">
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-danger/15 text-danger">
                        <MessagesSquare className="size-4" />
                      </span>
                      <div>
                        <div className="font-bold">
                          {suspect} lied: <span className="font-normal line-through decoration-danger">“{st.text}”</span>
                        </div>
                        <div className="text-neutral-600">“{st.lie?.reveal}”</div>
                      </div>
                    </li>
                  ))}
                  {wrong.map((id) => (
                    <li key={id} className="flex items-center gap-2 text-[13px] text-danger">
                      <ShieldX className="size-4" />
                      {c.suspects.find((s) => s.id === id)?.name}: wrongly accused, cleared by IA
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
