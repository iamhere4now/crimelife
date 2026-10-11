"use client";

import { Crown, Gem, Lock, Map as MapIcon, MapPin } from "lucide-react";
import { moneyShort } from "@/lib/format";
import { isModeOpen, MODES, type ModeId } from "@/lib/modes";
import type { GameState } from "@/lib/types";

const ICON = { street: MapPin, vip: Crown, heist: Gem, naija: MapIcon } as const;

interface Props {
  state: GameState;
  active: ModeId | null;
  onSelect: (id: ModeId | null) => void;
}

/** The game modes. Each is open while your money is at or above its price. */
export function ModesRow({ state, active, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 px-5">
      {MODES.map((m) => {
        const open = isModeOpen(m, state);
        const solved = m.caseIds.filter((id) => state.solved.includes(id)).length;
        const progress = open ? 1 : Math.min(1, Math.max(0, state.balance) / m.cost);
        const Icon = ICON[m.id];
        const isActive = active === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onSelect(isActive ? null : m.id)}
            aria-pressed={isActive}
            className={`soft relative flex flex-col gap-1 overflow-hidden rounded-3xl border bg-card p-3.5 text-left transition active:scale-95 ${
              isActive ? "border-kick" : "border-transparent"
            }`}
          >
            <span className={`grid size-9 place-items-center rounded-full ${open ? "bg-kick text-ink" : "bg-raise text-muted"}`}>
              {open ? <Icon className="size-4" /> : <Lock className="size-4" />}
            </span>
            <span className={`mt-1 text-sm font-bold leading-tight ${open ? "" : "text-neutral-500"}`}>{m.name}</span>
            <span className="text-[10px] font-semibold text-muted">
              {open ? `${solved}/${m.caseIds.length} closed` : `Need ${moneyShort(m.cost)}`}
            </span>
            {!open && (
              <span className="mt-0.5 h-1 overflow-hidden rounded-full bg-line">
                <span className="block h-full bg-kick/70" style={{ width: `${progress * 100}%` }} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
