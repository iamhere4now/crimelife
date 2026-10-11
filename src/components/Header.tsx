"use client";

import { Bell, ChevronDown, MapPin, Menu, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { moneyShort } from "@/lib/format";

interface Props {
  title: string;
  /** When set, the title is a button (the city switcher). */
  onTitle?: () => void;
  balance: number;
  /** False until saved progress has loaded, so loading it isn't shown as a payout. */
  ready: boolean;
  rating: number;
  query: string;
  showSearch: boolean;
  openOnly: boolean;
  tipsOpen: boolean;
  hasTip: boolean;
  onQuery: (q: string) => void;
  onMenu: () => void;
  onBell: () => void;
  onFilter: () => void;
}

/** Top bar: menu, the screen title with your wallet under it, squad tips, then search. */
export function Header({ title, onTitle, balance, ready, rating, query, showSearch, openOnly, tipsOpen, hasTip, onQuery, onMenu, onBell, onFilter }: Props) {
  const delta = useDelta(balance, ready);

  return (
    <header className="sticky top-0 z-30 bg-ink/90 px-5 pb-3 pt-[max(env(safe-area-inset-top),14px)] backdrop-blur-md lg:flex lg:items-center lg:gap-4 lg:px-6 lg:py-5 xl:gap-6 xl:px-8">
      <div className="flex items-center justify-between gap-3 lg:contents">
        <button onClick={onMenu} aria-label="Open profile" className="soft grid size-11 shrink-0 place-items-center rounded-full bg-card transition active:scale-90 lg:hidden">
          <Menu className="size-5" />
        </button>

        <div className="relative min-w-0 text-center lg:order-1 lg:min-w-[140px] lg:shrink-0 lg:text-left">
          {onTitle ? (
            <button onClick={onTitle} aria-label={`City: ${title}. Change city`} className="inline-flex max-w-full items-center gap-1 rounded-full transition active:scale-95">
              <MapPin className="size-4 shrink-0 text-danger" />
              <h1 className="truncate text-xl font-bold tracking-tight lg:text-2xl">{title}</h1>
              <ChevronDown className="size-4 shrink-0 text-muted" />
            </button>
          ) : (
            <h1 className="truncate text-xl font-bold tracking-tight lg:text-2xl">{title}</h1>
          )}
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted lg:justify-start lg:text-sm">
            <span className={`tabular-nums ${balance < 0 ? "text-danger" : "text-fg"}`}>{moneyShort(balance)}</span>
            <span className="size-1 rounded-full bg-line" />
            <Star className="size-3 fill-[#F5A524] text-[#F5A524]" />
            <span className="tabular-nums">{rating.toFixed(1)}</span>
          </div>
          {delta && (
            <span
              key={delta.id}
              className={`rise pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap lg:left-0 lg:translate-x-0 text-sm font-extrabold ${
                delta.value > 0 ? "text-go" : "text-danger"
              }`}
            >
              {delta.value > 0 ? "+" : ""}
              {moneyShort(delta.value)}
            </span>
          )}
        </div>

        <button
          onClick={onBell}
          aria-label="Squad tips"
          aria-expanded={tipsOpen}
          className={`soft relative grid size-11 shrink-0 place-items-center rounded-full transition active:scale-90 lg:order-3 lg:ml-auto ${tipsOpen ? "bg-kick text-ink" : "bg-card"}`}
        >
          <Bell className="size-5" />
          {hasTip && !tipsOpen && <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-danger ring-2 ring-card" />}
        </button>
      </div>

      {showSearch && (
        <div className="mt-4 flex gap-2.5 lg:order-2 lg:mt-0 lg:min-w-0 lg:max-w-2xl lg:flex-1">
          <label className="soft flex h-12 min-w-0 flex-1 items-center gap-2 rounded-2xl bg-card px-4 transition focus-within:ring-2 focus-within:ring-kick">
            <Search className="size-[18px] shrink-0 text-muted" />
            <input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search crime scenes, any city"
              enterKeyHint="search"
              className="min-w-0 flex-1 bg-transparent text-sm text-fg placeholder:text-muted focus:outline-none"
              aria-label="Search crime scenes and cases"
            />
            {query && (
              <button onClick={() => onQuery("")} aria-label="Clear search" className="text-muted hover:text-fg">
                <X className="size-4" />
              </button>
            )}
          </label>
          <button
            onClick={onFilter}
            aria-pressed={openOnly}
            aria-label={openOnly ? "Show all cases, locked ones too" : "Show only cases you can play"}
            title={openOnly ? "Showing open cases only" : "Show open cases only"}
            className={`soft grid size-12 shrink-0 place-items-center rounded-2xl transition active:scale-90 ${openOnly ? "bg-kick text-ink" : "bg-card"}`}
          >
            <SlidersHorizontal className="size-5" />
          </button>
        </div>
      )}
    </header>
  );
}

/** Remembers the last balance change so it can float up under the wallet. */
function useDelta(balance: number, ready: boolean) {
  const prev = useRef<number | null>(null);
  const [delta, setDelta] = useState<{ id: number; value: number } | null>(null);
  useEffect(() => {
    if (!ready) return;
    if (prev.current !== null && prev.current !== balance) {
      setDelta({ id: Date.now(), value: balance - prev.current });
    }
    prev.current = balance;
  }, [balance, ready]);
  return delta;
}
