"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { confetti } from "@/lib/confetti";
import { sfx } from "@/lib/SoundEffects";
import { PRIZES } from "@/lib/spin";

const SLICE = 360 / PRIZES.length;

/** The daily Lucky Spin: a wheel of small cash and merit prizes. */
export function LuckySpin({ left, onSpin, onClose }: { left: number; onSpin: () => number; onClose: () => void }) {
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [won, setWon] = useState<number | null>(null);
  const [spinsLeft, setSpinsLeft] = useState(left);

  const spin = () => {
    if (spinning || spinsLeft <= 0) return;
    const i = onSpin();
    if (i < 0) return;
    sfx.whoosh();
    setWon(null);
    setSpinning(true);
    setSpinsLeft((n) => n - 1);
    // land the middle of slice i under the pointer at the top, after a few full turns
    const target = 360 * 6 + (360 - (i * SLICE + SLICE / 2));
    setAngle((a) => a - (a % 360) + target);
    window.setTimeout(() => {
      setSpinning(false);
      setWon(i);
      sfx.success();
      confetti({ count: PRIZES[i].money >= 25_000 ? 140 : 80 });
    }, 3600);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 fade-in lg:items-center" onClick={spinning ? undefined : onClose}>
      <div className="sheet-up w-full max-w-md rounded-t-[28px] bg-ink px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-3 text-center lg:rounded-[28px] lg:pb-6" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Lucky Spin">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted">
            {spinsLeft > 0 ? `${spinsLeft} spin${spinsLeft === 1 ? "" : "s"} left today` : "Come back tomorrow"}
          </span>
          <button onClick={onClose} disabled={spinning} aria-label="Close" className="soft grid size-9 place-items-center rounded-full bg-card active:scale-90">
            <X className="size-4" />
          </button>
        </div>
        <h2 className="text-2xl font-black">Lucky Spin 🎡</h2>
        <p className="text-sm text-muted">Spin am! Every slice pays something.</p>

        <div className="relative mx-auto mt-4 size-72 max-w-full">
          <svg viewBox="0 0 24 28" className="absolute left-1/2 top-[-10px] z-10 h-9 w-8 -translate-x-1/2 drop-shadow-md" aria-hidden>
            <path d="M2 2 H22 L12 26 Z" fill="#14161b" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
          <svg
            viewBox="-100 -100 200 200"
            className="size-full drop-shadow-xl"
            style={{ transform: `rotate(${angle}deg)`, transition: spinning ? "transform 3.5s cubic-bezier(0.15, 0.9, 0.2, 1)" : "none" }}
            aria-hidden
          >
            {PRIZES.map((p, i) => {
              const a0 = ((i * SLICE - 90) * Math.PI) / 180;
              const a1 = (((i + 1) * SLICE - 90) * Math.PI) / 180;
              const mid = (((i + 0.5) * SLICE - 90) * Math.PI) / 180;
              return (
                <g key={i}>
                  <path d={`M0 0 L${96 * Math.cos(a0)} ${96 * Math.sin(a0)} A96 96 0 0 1 ${96 * Math.cos(a1)} ${96 * Math.sin(a1)} Z`} fill={p.color} stroke="#fff" strokeWidth="2" />
                  <g transform={`translate(${62 * Math.cos(mid)} ${62 * Math.sin(mid)}) rotate(${(i + 0.5) * SLICE})`}>
                    <text textAnchor="middle" y="-4" fontSize="16">
                      {p.emoji}
                    </text>
                    <text textAnchor="middle" y="12" fontSize="11" fontWeight="900" fill="#fff" stroke="#000" strokeWidth="0.6" paintOrder="stroke">
                      {p.label}
                    </text>
                  </g>
                </g>
              );
            })}
            <circle r="18" fill="#14161b" stroke="#fff" strokeWidth="3" />
            <text textAnchor="middle" y="5" fontSize="14" fill="#53FC18" fontWeight="900">
              ND
            </text>
          </svg>
        </div>

        <div className="mt-3 min-h-12" aria-live="polite">
          {won !== null && (
            <p className="pop-in text-lg font-black">
              {PRIZES[won].emoji} You won {PRIZES[won].label}
              {PRIZES[won].money && PRIZES[won].xp ? " (₦ + XP)" : ""}!
            </p>
          )}
        </div>

        <button
          onClick={spin}
          disabled={spinning || spinsLeft <= 0}
          className="mt-2 h-14 w-full rounded-full bg-kick text-lg font-black text-ink shadow-[0_14px_28px_-14px_rgba(20,22,27,0.7)] transition enabled:active:scale-95 disabled:bg-raise disabled:text-muted"
        >
          {spinning ? "E dey spin…" : spinsLeft > 0 ? "SPIN!" : "No spins left today"}
        </button>
      </div>
    </div>
  );
}
