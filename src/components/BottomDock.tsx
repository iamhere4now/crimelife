"use client";

import { FolderOpen, Home, Phone, Trophy, User } from "lucide-react";
import { BrandMark } from "./ui";

export type Tab = "cases" | "dossier" | "leaderboard" | "profile";

interface Props {
  tab: Tab;
  onTab: (t: Tab) => void;
  onInspect: () => void;
}

const ITEMS = [
  { id: "cases", label: "Home", icon: Home },
  { id: "dossier", label: "Dossier", icon: FolderOpen },
  null,
  { id: "leaderboard", label: "Precinct", icon: Trophy },
  { id: "profile", label: "Profile", icon: User },
] as const;

/** Phone: bottom bar with a raised call button. Laptop: a left sidebar. */
export function BottomDock(props: Props) {
  return (
    <>
      <MobileDock {...props} />
      <SideNav {...props} />
    </>
  );
}

function MobileDock({ tab, onTab, onInspect }: Props) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md rounded-t-[28px] bg-card pb-[max(env(safe-area-inset-bottom),10px)] shadow-[0_-10px_30px_-18px_rgba(20,22,27,0.35)] lg:hidden"
      aria-label="Main"
    >
      <div className="flex items-end justify-around px-2 pt-2.5">
        {ITEMS.map((item) =>
          item === null ? (
            <button
              key="inspect"
              onClick={onInspect}
              aria-label="Call for backup"
              className="-mt-9 grid size-16 shrink-0 place-items-center rounded-full bg-kick text-ink shadow-[0_14px_30px_-10px_rgba(20,22,27,0.6)] ring-[6px] ring-ink transition active:scale-90"
            >
              <Phone className="size-7 fill-current" strokeWidth={2} />
            </button>
          ) : (
            <button
              key={item.id}
              onClick={() => onTab(item.id)}
              aria-current={tab === item.id ? "page" : undefined}
              className={`flex w-16 flex-col items-center gap-1 py-1 transition active:scale-90 ${tab === item.id ? "text-fg" : "text-muted hover:text-fg"}`}
            >
              <item.icon className={`size-[22px] ${tab === item.id ? "fill-kick/10" : ""}`} strokeWidth={tab === item.id ? 2.4 : 1.8} />
              <span className={`text-[10px] ${tab === item.id ? "font-bold" : "font-medium"}`}>{item.label}</span>
            </button>
          ),
        )}
      </div>
    </nav>
  );
}

function SideNav({ tab, onTab, onInspect }: Props) {
  return (
    <aside className="no-scrollbar fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col overflow-y-auto bg-card px-4 py-6 shadow-[10px_0_30px_-24px_rgba(20,22,27,0.4)] lg:flex [@media(max-height:600px)]:py-4" aria-label="Main">
      <button onClick={() => onTab("cases")} className="flex items-center gap-2.5 px-2 text-left">
        <BrandMark className="size-10" />
        <span>
          <span className="block text-lg font-black italic leading-none tracking-tight">Naija Detective</span>
          <span className="text-xs font-semibold text-muted">Panti CID · Nigeria</span>
        </span>
      </button>

      <nav className="mt-9 flex flex-col gap-1 [@media(max-height:600px)]:mt-5">
        {ITEMS.filter((i) => i !== null).map((item) => {
          const on = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTab(item.id)}
              aria-current={on ? "page" : undefined}
              className={`flex h-12 items-center gap-3 rounded-2xl px-3.5 text-[15px] transition ${on ? "bg-kick font-bold text-ink" : "font-medium text-neutral-600 hover:bg-raise hover:text-fg"}`}
            >
              <item.icon className="size-5" strokeWidth={on ? 2.3 : 1.8} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <button onClick={onInspect} className="mt-auto flex shrink-0 items-center gap-3 rounded-3xl bg-raise p-3.5 text-left transition hover:bg-line active:scale-[0.98] [@media(max-height:600px)]:mt-6">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-kick text-ink shadow-[0_10px_20px_-10px_rgba(20,22,27,0.7)]">
          <Phone className="size-5 fill-current" />
        </span>
        <span className="min-w-0">
          <span className="block font-bold">Call for backup</span>
          <span className="block text-xs leading-snug text-muted">Senior Inspector or other players</span>
        </span>
      </button>
    </aside>
  );
}
