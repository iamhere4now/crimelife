"use client";

import { Bus, Check, MapPin, Plane, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { casesIn, CITIES, CITY_BY_ID, type CityId } from "@/lib/cities";
import { sfx } from "@/lib/SoundEffects";
import type { GameState } from "@/lib/types";

/* ---------------------------------------------------------------- the map */

// Longitude/latitude of each city, and where its name sits next to the pin.
const GEO: Record<CityId, { lon: number; lat: number; label: [number, number, "start" | "middle" | "end"] }> = {
  lagos: { lon: 3.38, lat: 6.52, label: [7, 12, "start"] },
  abeokuta: { lon: 3.35, lat: 7.15, label: [7, 7, "start"] },
  ibadan: { lon: 3.9, lat: 7.38, label: [7, 2, "start"] },
  ilorin: { lon: 4.54, lat: 8.5, label: [7, 3, "start"] },
  abuja: { lon: 7.49, lat: 9.06, label: [8, 3, "start"] },
  kano: { lon: 8.52, lat: 12.0, label: [8, 3, "start"] },
  benin: { lon: 5.62, lat: 6.34, label: [6, 13, "start"] },
  enugu: { lon: 7.5, lat: 6.44, label: [8, 3, "start"] },
  aba: { lon: 7.37, lat: 5.11, label: [8, 4, "start"] },
  portharcourt: { lon: 7.01, lat: 4.82, label: [-8, 6, "end"] },
  kaduna: { lon: 7.44, lat: 10.52, label: [7, 3, "start"] },
  katsina: { lon: 7.6, lat: 12.99, label: [7, 3, "start"] },
  gusau: { lon: 6.66, lat: 12.16, label: [7, 3, "start"] },
  birninkebbi: { lon: 4.2, lat: 12.45, label: [7, 3, "start"] },
  sokoto: { lon: 5.24, lat: 13.06, label: [7, 3, "start"] },
  bauchi: { lon: 9.84, lat: 10.31, label: [7, 3, "start"] },
  gombe: { lon: 11.17, lat: 10.29, label: [7, 3, "start"] },
  maiduguri: { lon: 13.16, lat: 11.85, label: [7, 3, "start"] },
  damaturu: { lon: 11.07, lat: 11.71, label: [7, 3, "start"] },
  dutse: { lon: 9.34, lat: 11.76, label: [7, 3, "start"] },
  makurdi: { lon: 8.53, lat: 7.73, label: [7, 3, "start"] },
  lokoja: { lon: 6.74, lat: 7.8, label: [7, 3, "start"] },
  lafia: { lon: 8.52, lat: 8.49, label: [7, 3, "start"] },
  minna: { lon: 6.55, lat: 9.61, label: [7, 3, "start"] },
  jos: { lon: 8.89, lat: 9.9, label: [7, 3, "start"] },
  yola: { lon: 12.48, lat: 9.21, label: [7, 3, "start"] },
  jalingo: { lon: 9.78, lat: 7.87, label: [7, 3, "start"] },
  onitsha: { lon: 6.79, lat: 6.15, label: [7, 3, "start"] },
  owerri: { lon: 7.03, lat: 5.48, label: [7, 3, "start"] },
  warri: { lon: 5.75, lat: 5.52, label: [7, 3, "start"] },
  yenagoa: { lon: 6.26, lat: 4.92, label: [7, 3, "start"] },
  uyo: { lon: 7.93, lat: 5.04, label: [7, 3, "start"] },
  calabar: { lon: 8.33, lat: 4.96, label: [7, 3, "start"] },
  abakaliki: { lon: 8.11, lat: 6.32, label: [7, 3, "start"] },
  adoekiti: { lon: 5.22, lat: 7.62, label: [7, 3, "start"] },
  akure: { lon: 5.2, lat: 7.25, label: [7, 3, "start"] },
  osogbo: { lon: 4.56, lat: 7.77, label: [7, 3, "start"] },
};

/** Cities whose names always show on the map; the rest show when chosen. */
const MAJOR = new Set<CityId>(["lagos", "abuja", "kano", "ibadan", "portharcourt", "ilorin", "abeokuta", "benin", "aba", "enugu"]);

const W = 360;
const H = 285;
const px = (lon: number, lat: number): [number, number] => [30 + (lon - 2.6) * 26.5, 16 + (13.95 - lat) * 26.5];
const path = (pts: [number, number][], close = false) => pts.map(([lon, lat], i) => `${i ? "L" : "M"}${px(lon, lat).map((n) => n.toFixed(1)).join(" ")}`).join(" ") + (close ? " Z" : "");

// A simplified outline of Nigeria and its two big rivers.
const BORDER: [number, number][] = [
  [2.7, 6.37], [2.72, 6.9], [2.73, 7.8], [2.68, 8.5], [2.75, 9.05], [3.1, 9.4], [3.35, 9.9], [3.6, 10.3], [3.55, 10.75], [3.7, 11.1],
  [3.6, 11.7], [4.1, 13.45], [4.9, 13.75], [5.5, 13.85], [6.4, 13.6], [6.8, 13.2], [7.3, 13.1], [7.8, 13.35], [9.0, 12.85], [9.6, 12.8],
  [10.1, 13.25], [10.7, 13.35], [11.5, 13.33], [12.3, 13.1], [13.1, 13.55], [13.6, 13.7], [14.1, 13.1], [14.2, 12.4], [14.6, 12.1],
  [14.55, 11.6], [13.9, 11.0], [13.4, 10.2], [13.25, 9.6], [12.9, 9.35], [12.75, 8.75], [12.2, 8.2], [12.05, 7.55], [11.75, 6.95],
  [11.4, 6.5], [11.1, 6.45], [10.6, 7.05], [10.2, 6.9], [9.75, 6.5], [9.25, 6.2], [8.85, 5.75], [8.55, 4.85], [8.3, 4.6], [7.5, 4.45],
  [7.0, 4.4], [6.4, 4.3], [5.9, 4.3], [5.5, 4.7], [5.1, 5.3], [4.6, 6.1], [4.1, 6.35], [3.4, 6.4],
];
const NIGER: [number, number][] = [[3.6, 11.7], [4.1, 11.2], [4.5, 10.4], [4.6, 9.9], [4.8, 9.1], [5.5, 8.9], [6.0, 8.7], [6.6, 8.2], [6.75, 7.8], [6.75, 7.0], [6.78, 6.15], [6.5, 5.4], [6.2, 4.6]];
const BENUE: [number, number][] = [[6.75, 7.8], [7.5, 7.9], [8.5, 7.75], [9.3, 8.0], [10.2, 8.6], [11.4, 9.2], [12.4, 9.3], [13.2, 9.4]];

function km(a: CityId, b: CityId) {
  const r = Math.PI / 180;
  const A = GEO[a];
  const B = GEO[b];
  const h = Math.sin(((B.lat - A.lat) * r) / 2) ** 2 + Math.cos(A.lat * r) * Math.cos(B.lat * r) * Math.sin(((B.lon - A.lon) * r) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** How a detective gets there: danfo or bus by road for short trips, otherwise a flight. */
function trip(from: CityId, to: CityId) {
  const d = Math.round(km(from, to) * 1.25);
  const road = d < 260;
  const hours = road ? d / 55 : 0.75 + d / 700;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60 / 5) * 5;
  const time = `${h ? `${h}h ` : ""}${m ? `${m}m` : ""}`.trim() || "30m";
  return { road, km: d, time };
}

const ROAD_LINES = (to: string) => [`Conductor: “${to}! Enter with your change!”`, `Driver: “Make una hold body, road no smooth.”`, `Agbero: “${to} straight! One chance remain!”`];
const AIR_LINES = (to: string) => [`Cabin crew: “Fasten your seatbelt, detective.”`, `Pilot: “Next stop, ${to}. Weather is hot, cases are hotter.”`, `Seat 3A: “Na police you be? Abeg no arrest me.”`];

/** Quadratic arc from a to b, bowed upwards, as a point at t (0..1) and its heading in degrees. */
function arc(a: [number, number], b: [number, number]) {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const c: [number, number] = [mx, my - Math.max(18, len * 0.35)];
  const at = (t: number) => {
    const u = 1 - t;
    const x = u * u * a[0] + 2 * u * t * c[0] + t * t * b[0];
    const y = u * u * a[1] + 2 * u * t * c[1] + t * t * b[1];
    const dx = 2 * u * (c[0] - a[0]) + 2 * t * (b[0] - c[0]);
    const dy = 2 * u * (c[1] - a[1]) + 2 * t * (b[1] - c[1]);
    return { x, y, deg: (Math.atan2(dy, dx) * 180) / Math.PI };
  };
  return { d: `M${a[0]} ${a[1]} Q${c[0]} ${c[1]} ${b[0]} ${b[1]}`, at };
}

/* ---------------------------------------------------------------- the picker */

/** A travel desk: pick a city on the map of Nigeria, then travel there. Each city has its own cases. */
export function CityPicker({ current, state, onPick, onClose }: { current: CityId; state: GameState; onPick: (id: CityId) => void; onClose: () => void }) {
  const [sel, setSel] = useState<CityId>(current);
  const [travel, setTravel] = useState<{ to: CityId; t: number; line: string } | null>(null);
  const raf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const city = CITY_BY_ID[sel];
  const cases = casesIn(sel);
  const solved = cases.filter((c) => state.solved.includes(c.id)).length;
  const info = sel === current ? null : trip(current, sel);
  const route = useMemo(() => (travel ? arc(px(GEO[current].lon, GEO[current].lat), px(GEO[travel.to].lon, GEO[travel.to].lat)) : null), [travel, current]);

  const choose = (id: CityId) => {
    if (travel) return;
    sfx.tap();
    setSel(id);
  };

  const go = () => {
    if (travel) return;
    if (sel === current) return onClose();
    const t = trip(current, sel);
    const lines = (t.road ? ROAD_LINES : AIR_LINES)(CITY_BY_ID[sel].name);
    const line = lines[Math.floor(Math.random() * lines.length)];
    const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced ? 300 : 2200;
    const start = performance.now();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf.current);
      setTravel({ to: sel, t: 1, line });
      window.setTimeout(() => onPick(sel), 250);
    };
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      if (p >= 1) return finish();
      setTravel({ to: sel, t: p, line });
      raf.current = requestAnimationFrame(step);
    };
    setTravel({ to: sel, t: 0, line });
    raf.current = requestAnimationFrame(step);
    // frames pause in a hidden tab; the trip still ends on time
    window.setTimeout(finish, duration + 50);
  };

  const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  const pos = route && travel ? route.at(ease(travel.t)) : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 fade-in lg:items-center" onClick={travel ? undefined : onClose}>
      <div
        className="sheet-up no-scrollbar max-h-[94dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-ink px-4 pb-[max(env(safe-area-inset-bottom),18px)] pt-2.5 lg:max-w-3xl lg:rounded-[28px] lg:p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Travel to another city"
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-line lg:hidden" />
        <div className="mt-3 flex items-start justify-between gap-3 px-1">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">Travel desk</p>
            <h2 className="text-2xl font-bold tracking-tight">Where you dey work today?</h2>
          </div>
          <button onClick={onClose} disabled={!!travel} aria-label="Close" className="soft grid size-10 shrink-0 place-items-center rounded-full bg-card active:scale-90 disabled:opacity-40">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-3 lg:grid lg:grid-cols-[1.25fr_1fr] lg:gap-5">
          {/* the map */}
          <div className="soft relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#dceefa] to-[#cfe6f5]">
            <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="group" aria-label="Map of Nigeria">
              <defs>
                <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#efe2b8" />
                  <stop offset="0.55" stopColor="#d9e6b4" />
                  <stop offset="1" stopColor="#b9dba4" />
                </linearGradient>
              </defs>
              <text x="20" y={H - 10} className="fill-[#5a8aa8] text-[9px] italic">Gulf of Guinea</text>
              <path d={path(BORDER, true)} fill="url(#land)" stroke="#8a9a6a" strokeWidth="1.4" strokeLinejoin="round" />
              <path d={path(NIGER)} fill="none" stroke="#6aaed6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d={path(BENUE)} fill="none" stroke="#6aaed6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <text x={px(5.3, 9.35)[0]} y={px(5.3, 9.35)[1]} className="fill-[#4a8ab8] text-[8px] italic">Niger</text>
              <text x={px(9.6, 8.55)[0]} y={px(9.6, 8.55)[1]} className="fill-[#4a8ab8] text-[8px] italic">Benue</text>

              {route && travel && (
                <g fill="none" strokeLinecap="round">
                  <path d={route.d} stroke="#14161b" strokeWidth="2" strokeDasharray="4 5" opacity="0.35" />
                  <path d={route.d} stroke="#14161b" strokeWidth="2.6" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ease(travel.t)} />
                </g>
              )}

              {CITIES.map((c) => {
                const g = GEO[c.id];
                const [x, y] = px(g.lon, g.lat);
                const on = c.id === sel;
                const here = c.id === current;
                return (
                  <g key={c.id} transform={`translate(${x} ${y})`} onClick={() => choose(c.id)} className="cursor-pointer" role="button" aria-label={`${c.name}${here ? " (you are here)" : ""}`}>
                    <circle r="14" fill="transparent" />
                    {on && <circle r="7" fill={c.color} opacity="0.35" className="city-ping" />}
                    <circle r={on ? 6.5 : MAJOR.has(c.id) ? 4.6 : 3.6} fill={c.color} stroke="#fff" strokeWidth={on ? 2.4 : 1.6} />
                    {here && <circle r="2" fill="#fff" />}
                    {(MAJOR.has(c.id) || on || here) && (
                    <text
                      x={g.label[0]}
                      y={g.label[1]}
                      textAnchor={g.label[2]}
                      className={`select-none ${on ? "fill-fg text-[10.5px] font-black" : "fill-[#3c434c] text-[9px] font-semibold"}`}
                      style={{ paintOrder: "stroke", stroke: "#f4f1e4", strokeWidth: 3 }}
                    >
                      {c.name}
                    </text>
                    )}
                  </g>
                );
              })}

              {pos && travel && (
                <g transform={`translate(${pos.x} ${pos.y})`}>
                  <circle r="11" fill="#14161b" />
                  {trip(current, travel.to).road ? (
                    <Bus x={-6.5} y={-6.5} width={13} height={13} color="#f5c518" strokeWidth={2.4} />
                  ) : (
                    <g transform={`rotate(${pos.deg + 45})`}>
                      <Plane x={-6.5} y={-6.5} width={13} height={13} color="#ffffff" strokeWidth={2.4} />
                    </g>
                  )}
                </g>
              )}
            </svg>

            {travel && (
              <div className="pointer-events-none absolute inset-x-3 top-3 rounded-2xl bg-white/90 px-3 py-2 text-xs shadow-sm backdrop-blur">
                <div className="flex items-center gap-1.5 font-bold">
                  {trip(current, travel.to).road ? <Bus className="size-3.5" /> : <Plane className="size-3.5" />}
                  {CITY_BY_ID[current].name} → {CITY_BY_ID[travel.to].name}
                  <span className="ml-auto font-semibold text-muted">{Math.round(travel.t * 100)}%</span>
                </div>
                <p className="mt-0.5 text-neutral-600">{travel.line}</p>
              </div>
            )}
          </div>

          {/* the chosen city */}
          <div className="mt-3 lg:mt-0">
            <div className="soft overflow-hidden rounded-3xl bg-card">
              <div className="relative px-4 pb-3 pt-3.5 text-white" style={{ background: `linear-gradient(135deg, ${city.color}, ${city.color}cc)` }}>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-white/80">
                  <MapPin className="size-3" /> {city.state === "FCT" ? "FCT" : `${city.state} State`}
                </div>
                <div className="mt-0.5 text-2xl font-black leading-tight">{city.name}</div>
                <p className="mt-0.5 text-xs text-white/85">{city.tagline}</p>
                {sel === current && (
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-fg">
                    <Check className="size-3" strokeWidth={3} /> You're here
                  </span>
                )}
              </div>
              <div className="p-4 pt-3">
                <div className="flex flex-wrap gap-1.5">
                  {city.landmarks.map((l) => (
                    <span key={l} className="rounded-full bg-raise px-2.5 py-1 text-[11px] font-semibold text-neutral-700">{l}</span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs font-semibold text-muted">
                  <span>{cases.length} cases · {solved} closed</span>
                  {info && (
                    <span className="flex items-center gap-1">
                      {info.road ? <Bus className="size-3.5" /> : <Plane className="size-3.5" />}
                      {info.road ? "By road" : "By air"} · {info.time} · {info.km} km
                    </span>
                  )}
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-kick" style={{ width: `${cases.length ? (solved / cases.length) * 100 : 0}%` }} />
                </div>
                <button
                  onClick={go}
                  disabled={!!travel}
                  className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-kick text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-70"
                >
                  {sel === current ? (
                    "Keep working here"
                  ) : travel ? (
                    "On the way…"
                  ) : (
                    <>
                      {info?.road ? <Bus className="size-4" /> : <Plane className="size-4" />} Travel to {city.name}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* every city, as quick chips */}
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
          {CITIES.map((c) => {
            const n = casesIn(c.id);
            const done = n.filter((x) => state.solved.includes(x.id)).length;
            return (
              <button
                key={c.id}
                onClick={() => choose(c.id)}
                aria-pressed={c.id === sel}
                className={`soft flex shrink-0 items-center gap-2 rounded-full bg-card py-1.5 pl-1.5 pr-3 text-xs font-semibold transition active:scale-95 ${c.id === sel ? "ring-2 ring-kick" : ""}`}
              >
                <span className="grid size-6 place-items-center rounded-full text-[10px] font-black text-white" style={{ background: c.color }}>
                  {c.id === current ? <MapPin className="size-3" /> : c.name[0]}
                </span>
                {c.name}
                <span className="text-muted">{done}/{n.length}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
