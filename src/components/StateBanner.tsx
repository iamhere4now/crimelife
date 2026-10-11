"use client";

import { MapPin, Plane } from "lucide-react";
import { useEffect, useState } from "react";
import { confetti } from "@/lib/confetti";
import { packFor } from "@/lib/content/stateGames";
import type { City } from "@/lib/cities";

/** Lagos has its own hand-written cases, so it isn't in the generator's packs. */
const LAGOS = { nickname: "Centre of Excellence", colors: { a: "#1d6a3a", b: "#e6b422" }, places: ["Computer Village", "Balogun Market", "Third Mainland Bridge", "Lekki Toll Gate", "Oshodi", "Makoko"] };

export function themeFor(city: City) {
  const pack = packFor(city.state);
  return pack ? { nickname: pack.nickname, colors: pack.colors, places: pack.places.map((p) => p.name) } : LAGOS;
}

/** Home's banner for the chosen city: its state's colours, nickname and famous places. */
export function StateBanner({ city, cases, onTravel }: { city: City; cases: number; onTravel: () => void }) {
  const t = themeFor(city);
  return (
    <section className="px-4 pt-3" aria-label={`${city.name}, ${t.nickname}`}>
      <div className="relative overflow-hidden rounded-3xl p-4 text-white shadow-[0_14px_30px_-18px_rgba(0,0,0,0.6)]" style={{ background: `linear-gradient(120deg, ${t.colors.a}, ${t.colors.b})` }}>
        <div className="pointer-events-none absolute -right-6 -top-8 size-32 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-10 right-10 size-24 rounded-full bg-black/10" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">{city.state === "FCT" ? "Federal Capital Territory" : `${city.state} State`}</div>
            <h2 className="text-2xl font-black leading-tight drop-shadow">{city.name}</h2>
            <div className="text-sm font-semibold italic text-white/90">“{t.nickname}”</div>
          </div>
          <button onClick={onTravel} className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-3 text-xs font-bold backdrop-blur transition active:scale-95">
            <Plane className="size-3.5" /> Travel
          </button>
        </div>
        <div className="relative mt-3 flex items-center gap-2 text-[11px] font-bold">
          <span className="rounded-full bg-black/25 px-2.5 py-1">{cases} cases</span>
          <span className="text-white/80">set in famous places:</span>
        </div>
        <div className="no-scrollbar relative -mx-4 mt-2 flex gap-1.5 overflow-x-auto px-4">
          {t.places.slice(0, 10).map((p) => (
            <span key={p} className="flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
              <MapPin className="size-3" /> {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/** A short welcome when the detective travels to a new city. */
export function TravelWelcome({ city, onDone }: { city: City; onDone: () => void }) {
  const t = themeFor(city);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    confetti({ count: 60, y: 0.4 });
    const a = window.setTimeout(() => setLeaving(true), 2200);
    const b = window.setTimeout(onDone, 2600);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [onDone]);
  return (
    <div
      className={`fixed inset-0 z-[65] grid place-items-center p-6 transition-opacity duration-300 ${leaving ? "opacity-0" : "opacity-100"}`}
      style={{ background: `radial-gradient(circle at 50% 40%, ${t.colors.b}ee, ${t.colors.a}f2 70%)` }}
      onClick={onDone}
      role="status"
      aria-live="polite"
    >
      <div className="pop-in text-center text-white">
        <div className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">Welcome to</div>
        <div className="mt-1 text-5xl font-black drop-shadow-lg">{city.name}</div>
        <div className="mt-2 text-lg font-semibold italic">“{t.nickname}”</div>
        <div className="mx-auto mt-4 flex max-w-xs flex-wrap justify-center gap-1.5">
          {t.places.slice(0, 4).map((p) => (
            <span key={p} className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold">
              {p}
            </span>
          ))}
        </div>
        <div className="mt-5 text-xs font-semibold text-white/80">Oya detective, the city dey wait for you!</div>
      </div>
    </div>
  );
}
