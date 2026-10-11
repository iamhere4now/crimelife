"use client";

import { Brush, Puzzle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/SoundEffects";
import type { LabGame } from "@/lib/types";

/* ------------------------------------------------------------ dust for prints */

const PW = 260;
const PH = 200;
const COLS = 13;
const ROWS = 10;
const BRUSH = 15;
const NEEDED = 0.62;

/** Only grid cells that sit on the print count toward coverage. */
function printCells(shape: "finger" | "boot") {
  const cells: number[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = ((c + 0.5) / COLS) * PW;
      const y = ((r + 0.5) / ROWS) * PH;
      const inside =
        shape === "finger"
          ? ((x - 130) / 58) ** 2 + ((y - 100) / 80) ** 2 <= 1
          : Math.abs(x - 130) <= 42 && y >= 14 && y <= 186;
      if (inside) cells.push(r * COLS + c);
    }
  }
  return cells;
}

export function DustPrints({ shape, onDone }: { shape: "finger" | "boot"; onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const brushed = useRef(new Set<number>());
  const cells = useRef(printCells(shape));
  const last = useRef<{ x: number; y: number } | null>(null);
  const lastSound = useRef(0);
  // Pointer events can arrive faster than React re-renders, so guard completion with a ref.
  const finished = useRef(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = PW * dpr;
    canvas.height = PH * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#262c34";
    ctx.fillRect(0, 0, PW, PH);
    // speckle so the surface reads as a real material
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? "#2e353e" : "#20252c";
      ctx.fillRect(Math.random() * PW, Math.random() * PH, 2, 2);
    }
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = BRUSH * 2;
  }, []);

  const brushAt = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (finished.current) return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * PW;
    const y = ((e.clientY - rect.top) / rect.height) * PH;
    const ctx = canvas.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(last.current?.x ?? x, last.current?.y ?? y);
    ctx.lineTo(x, y);
    ctx.stroke();
    last.current = { x, y };

    for (const cell of cells.current) {
      const cx = ((cell % COLS) + 0.5) * (PW / COLS);
      const cy = (Math.floor(cell / COLS) + 0.5) * (PH / ROWS);
      if ((cx - x) ** 2 + (cy - y) ** 2 <= (BRUSH + 6) ** 2) brushed.current.add(cell);
    }
    const p = brushed.current.size / cells.current.length;
    setProgress(p);

    const now = performance.now();
    if (now - lastSound.current > 110) {
      sfx.brush();
      lastSound.current = now;
    }
    if (p >= NEEDED && !finished.current) {
      finished.current = true;
      setDone(true);
      window.setTimeout(onDone, 700);
    }
  };

  return (
    <div className="pop-in">
      <div className="relative mx-auto aspect-[13/10] w-full max-w-[300px] overflow-hidden rounded-2xl ring-2 ring-kick/60">
        <PrintArt shape={shape} />
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 size-full touch-none transition-opacity duration-700 ${done ? "opacity-0" : "cursor-crosshair"}`}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            last.current = null;
            brushAt(e);
          }}
          onPointerMove={(e) => {
            if (e.buttons || e.pointerType === "touch") brushAt(e);
          }}
          onPointerUp={() => (last.current = null)}
          aria-label="Dusting surface. Drag to brush powder over it."
        />
        {!progress && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold text-neon">
              <Brush className="size-4" /> Drag to brush the powder
            </span>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs font-bold">
        <span className="text-muted">Powder coverage</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-kick transition-all" style={{ width: `${Math.min(100, (progress / NEEDED) * 100)}%` }} />
        </div>
        <span className={done ? "text-kick" : ""}>{done ? "Print lifted!" : `${Math.round(Math.min(1, progress / NEEDED) * 100)}%`}</span>
      </div>
    </div>
  );
}

function PrintArt({ shape }: { shape: "finger" | "boot" }) {
  return (
    <svg viewBox={`0 0 ${PW} ${PH}`} className="absolute inset-0 size-full">
      <rect width={PW} height={PH} fill="#262c34" />
      {shape === "finger" ? (
        <g fill="none" stroke="#e9eef2" strokeWidth="2.4" strokeLinecap="round">
          <defs>
            <clipPath id="tip">
              <ellipse cx="130" cy="100" rx="58" ry="80" />
            </clipPath>
          </defs>
          <g clipPath="url(#tip)">
            {Array.from({ length: 13 }, (_, i) => (
              <ellipse
                key={i}
                cx={130 + (i % 2)}
                cy={104 - i * 1.5}
                rx={4 + i * 5.2}
                ry={6 + i * 7}
                strokeDasharray={i % 3 === 0 ? "60 6" : i % 3 === 1 ? "38 5 14 5" : "90 7"}
              />
            ))}
            {Array.from({ length: 6 }, (_, i) => (
              <path key={`a${i}`} d={`M60 ${150 + i * 7} Q130 ${118 + i * 7} 200 ${150 + i * 7}`} />
            ))}
          </g>
        </g>
      ) : (
        <g fill="#e9eef2">
          <path d="M100 18 Q130 6 160 18 L172 70 Q174 100 160 112 L100 112 Q86 100 88 70 Z" fill="none" stroke="#e9eef2" strokeWidth="3" />
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={i} x={98 + (i % 2) * 4} y={24 + i * 12} width={60 - (i % 2) * 8} height="6" rx="3" />
          ))}
          <path d="M104 126 L156 126 Q166 150 156 184 L104 184 Q94 150 104 126 Z" fill="none" stroke="#e9eef2" strokeWidth="3" />
          {Array.from({ length: 4 }, (_, i) => (
            <rect key={`h${i}`} x="108" y={134 + i * 12} width="44" height="6" rx="3" />
          ))}
          <text x="130" y="80" textAnchor="middle" fontSize="9" fontWeight="900" fill="#262c34">
            MAG
          </text>
        </g>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------ torn document */

const TW = 240;
const TH = 300;
const T_COLS = 2;
const T_ROWS = 3;
const TILE_W = TW / T_COLS;
const TILE_H = TH / T_ROWS;
const TILT = [-4, 3, -2, 5, -5, 2];

function shuffled(n: number) {
  let order: number[];
  do {
    order = Array.from({ length: n }, (_, i) => i).sort(() => Math.random() - 0.5);
  } while (order.every((p, i) => p === i));
  return order;
}

export function TornDocument({ lab, onDone }: { lab: Extract<LabGame, { kind: "torn" }>; onDone: () => void }) {
  const [order, setOrder] = useState(() => shuffled(T_COLS * T_ROWS));
  const [selected, setSelected] = useState<number | null>(null);
  const solved = order.every((p, i) => p === i);

  const tap = (pos: number) => {
    if (solved) return;
    if (selected === null) {
      sfx.tap();
      setSelected(pos);
      return;
    }
    if (selected !== pos) {
      const next = [...order];
      [next[selected], next[pos]] = [next[pos], next[selected]];
      setOrder(next);
      sfx.swap();
      if (next.every((p, i) => p === i)) window.setTimeout(onDone, 800);
    }
    setSelected(null);
  };

  return (
    <div className="pop-in">
      <p className="mb-2 flex items-center justify-center gap-1.5 text-xs font-bold text-kick">
        <Puzzle className="size-4" />
        {solved ? "Document restored!" : "Tap two scraps to swap them"}
      </p>
      <div
        className={`mx-auto grid w-full max-w-[220px] grid-cols-2 transition-all duration-500 ${solved ? "gap-0" : "gap-1.5"}`}
        aria-label="Torn document pieces"
      >
        {order.map((piece, pos) => {
          const col = piece % T_COLS;
          const row = Math.floor(piece / T_COLS);
          return (
            <button
              key={piece}
              onClick={() => tap(pos)}
              aria-label={`Scrap in slot ${pos + 1}${selected === pos ? ", selected" : ""}`}
              aria-pressed={selected === pos}
              style={{ transform: solved ? "none" : `rotate(${TILT[piece]}deg)` }}
              className={`overflow-hidden transition duration-300 ${
                selected === pos ? "z-10 scale-105 ring-2 ring-kick" : ""
              } ${solved ? "" : "rounded-sm shadow-lg shadow-black/60"}`}
            >
              <svg viewBox={`${col * TILE_W} ${row * TILE_H} ${TILE_W} ${TILE_H}`} className="block w-full">
                <DocArt lab={lab} />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const CUTOUT = [
  { bg: "#f5e663", fg: "#111", font: "Georgia, serif" },
  { bg: "#111111", fg: "#fff", font: "Impact, sans-serif" },
  { bg: "#ff7a8a", fg: "#111", font: "Courier New, monospace" },
  { bg: "#ffffff", fg: "#c0182b", font: "Arial Black, sans-serif" },
  { bg: "#9fe8ff", fg: "#111", font: "Times New Roman, serif" },
  { bg: "#53FC18", fg: "#111", font: "Verdana, sans-serif" },
];

function DocArt({ lab }: { lab: Extract<LabGame, { kind: "torn" }> }) {
  if (lab.style === "ledger") {
    return (
      <g>
        <rect width={TW} height={TH} fill="#f4efe1" />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M12 ${52 + i * 30} L228 ${52 + i * 30}`} stroke="#c9d6e8" strokeWidth="1" />
        ))}
        <path d="M30 0 L30 300" stroke="#e8a0a0" strokeWidth="1" />
        <text x="120" y="32" textAnchor="middle" fontSize="15" fontWeight="900" fill="#2b2b2b" fontFamily="Georgia, serif">
          {lab.title}
        </text>
        {lab.lines.map((line, i) => (
          <text
            key={i}
            x="38"
            y={74 + i * 30}
            fontSize="12.5"
            fontFamily="Courier New, monospace"
            fontWeight="700"
            fill={/NE Consulting|LOAN|UNPAID|TOMORROW|SATURDAY|Balance|SHORT|₦1,100,000|PAID:|CHANGED|polyester|fix: Chip|Dele:/.test(line) ? "#b3122a" : "#2b2b2b"}
          >
            {line}
          </text>
        ))}
      </g>
    );
  }
  return (
    <g>
      <rect width={TW} height={TH} fill="#f6f1e7" />
      {lab.lines.map((line, li) => {
        const chars = [...line];
        const size = 17.5;
        const startX = (TW - chars.length * size) / 2;
        return chars.map((ch, ci) => {
          const k = (li * 7 + ci * 3) % CUTOUT.length;
          const style = CUTOUT[k];
          const x = startX + ci * size;
          const y = 28 + li * 46;
          const tilt = ((li * 13 + ci * 7) % 11) - 5;
          if (ch === " ") return null;
          return (
            <g key={`${li}-${ci}`} transform={`rotate(${tilt} ${x + size / 2} ${y + 14})`}>
              <rect x={x + 0.5} y={y} width={size - 1} height="28" fill={style.bg} />
              <text x={x + size / 2} y={y + 21} textAnchor="middle" fontSize="19" fontFamily={style.font} fontWeight="700" fill={style.fg}>
                {ch}
              </text>
            </g>
          );
        });
      })}
    </g>
  );
}
