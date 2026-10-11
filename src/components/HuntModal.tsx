"use client";

import { Check, ChevronLeft, Copy, ExternalLink, MessageCircle, Search, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cleanUrl, waDigits, type Hunt } from "@/lib/ads";
import { countTap, countView } from "@/lib/board";
import { huntSpots } from "@/lib/bonus";
import { CASE_BY_ID, CASES } from "@/lib/cases";
import { confetti } from "@/lib/confetti";
import { moneyShort } from "@/lib/format";
import { sfx } from "@/lib/SoundEffects";
import type { CaseId, GameState } from "@/lib/types";
import { HUNT_REWARD } from "@/lib/useGameState";
import type { PersonLook } from "@/three/world";
import { setSponsor } from "@/three/adSlots";
import { Scene3D, type Scene3DHandle } from "./scenes/Scene3D";

/**
 * A sponsored clue hunt: the sponsor's poster fills the boards in a crime
 * scene and their tokens are hidden around it. Find them all (the detective
 * walks to each) to unlock the sponsor's offer and code.
 */
export function HuntModal({
  hunt,
  state,
  detective,
  onFind,
  onClose,
}: {
  hunt: Hunt;
  state: GameState;
  detective?: PersonLook;
  onFind: (tokenId: string) => { fresh: boolean; done: boolean; paid: number };
  onClose: () => void;
}) {
  const theCase = CASE_BY_ID[hunt.caseId as CaseId] ?? CASES[0];
  // the sponsor's poster goes on the boards before the scene is built (children build first)
  useState(() => setSponsor({ id: hunt.id, image: hunt.image, placement: hunt.placement }));
  useEffect(() => () => setSponsor(null), []);
  useEffect(() => countView("h" + hunt.id), [hunt.id]);

  const tokens = useMemo(() => huntSpots(theCase, hunt.tokens, hunt.id), [theCase, hunt.tokens, hunt.id]);
  const found = state.hunts?.[hunt.id] ?? [];
  const done = found.length >= tokens.length;
  const [walking, setWalking] = useState<string | null>(null);
  const [reward, setReward] = useState(done);
  const [copied, setCopied] = useState(false);
  const api = useRef<Scene3DHandle | null>(null);
  const site = hunt.website ? cleanUrl(hunt.website) : "";

  const pick = (id: string) => {
    if (walking || found.includes(id)) return;
    sfx.tap();
    setWalking(id);
    let over = false;
    const finish = () => {
      if (over) return;
      over = true;
      window.clearTimeout(safety);
      setWalking(null);
      const r = onFind(id);
      if (!r.fresh) return;
      sfx.clue();
      if (r.done) {
        countTap("h" + hunt.id);
        sfx.success();
        confetti({ count: 140 });
        window.setTimeout(() => setReward(true), 400);
      }
    };
    const safety = window.setTimeout(finish, 5500);
    if (api.current?.walkTo) api.current.walkTo(id, finish);
    else finish();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(hunt.code);
      setCopied(true);
      sfx.tap();
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 mx-auto flex max-w-md flex-col bg-ink fade-in lg:max-w-3xl" role="dialog" aria-label={`Sponsored hunt by ${hunt.brand}`}>
      <div className="relative min-h-0 flex-1 overflow-hidden bg-night">
        <Scene3D theCase={theCase} anchors={tokens} apiRef={api} detective={detective} chipInset={20} className="absolute inset-0 size-full">
          {tokens.map((t) => {
            const got = found.includes(t.id);
            return (
              <button
                key={t.id}
                data-anchor={t.id}
                onClick={() => pick(t.id)}
                style={{ left: `${t.x}%`, top: `${t.y}%` }}
                className="pointer-events-auto absolute grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center transition-transform active:scale-90"
                aria-label={got ? `${hunt.brand} token found` : `${hunt.brand} token`}
              >
                {walking === t.id ? (
                  <span className="grid size-8 place-items-center rounded-full bg-white/90 text-fg shadow-[0_0_0_3px_rgba(245,197,24,0.9)]">
                    <Search className="size-4 animate-pulse" />
                  </span>
                ) : got ? (
                  <span className="pop-in grid size-6 place-items-center rounded-full bg-white/80 text-go">
                    <Check className="size-4" strokeWidth={3} />
                  </span>
                ) : (
                  <span className="hotspot-ping relative grid size-8 place-items-center rounded-full bg-gradient-to-b from-[#ffe27a] to-[#d99a00] text-[13px] font-black text-[#5a3a00] shadow-[0_0_12px_3px_rgba(245,197,24,0.8)] ring-2 ring-white">
                    {hunt.brand.charAt(0).toUpperCase()}
                  </span>
                )}
              </button>
            );
          })}
        </Scene3D>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute inset-x-0 top-0 flex items-center gap-3 px-4 pt-[max(env(safe-area-inset-top),14px)]">
          <button onClick={onClose} aria-label="Back" className="glass grid size-11 shrink-0 place-items-center rounded-full text-white active:scale-90">
            <ChevronLeft className="size-6" />
          </button>
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f5c518] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-ink">
              <Sparkles className="size-3" /> Sponsored hunt
            </span>
            <div className="truncate text-sm font-bold text-white drop-shadow">by {hunt.brand}</div>
          </div>
          <span className="glass rounded-full px-3 py-1.5 text-sm font-black tabular-nums text-white">
            {found.length}/{tokens.length}
          </span>
        </div>
      </div>

      <div className="bg-card px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-4">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hunt.image} alt={`${hunt.brand} poster`} className="h-14 w-24 shrink-0 rounded-lg bg-raise object-contain" />
          <div className="min-w-0">
            <p className="text-sm font-bold leading-snug">Find all {tokens.length} gold {hunt.brand} tokens to unlock:</p>
            <p className="truncate text-sm text-neutral-700">🎁 {hunt.offer}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-1">
          {tokens.map((t, i) => (
            <span key={t.id} className={`h-2 flex-1 rounded-full ${i < found.length ? "bg-[#f5c518]" : "bg-line"}`} />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted">Tap a gold token and your detective walks over to pick it up. Finishing also pays {moneyShort(HUNT_REWARD)} + 10 XP.</p>
        {done && (
          <button onClick={() => setReward(true)} className="mt-3 h-12 w-full rounded-full bg-kick font-bold text-ink active:scale-95">
            Show my reward
          </button>
        )}
      </div>

      {reward && (
        <div className="absolute inset-0 z-10 flex items-end bg-black/50 fade-in lg:items-center lg:justify-center" onClick={() => setReward(false)}>
          <div className="sheet-up w-full rounded-t-3xl bg-card px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-4 text-center lg:max-w-md lg:rounded-3xl lg:pb-6" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Your reward">
            <div className="flex justify-end">
              <button onClick={() => setReward(false)} aria-label="Close" className="grid size-9 place-items-center rounded-full bg-raise active:scale-90">
                <X className="size-4" />
              </button>
            </div>
            <div className="text-5xl" aria-hidden>
              🎉
            </div>
            <h3 className="mt-1 text-2xl font-black">You found them all!</h3>
            <p className="mt-1 text-[15px] text-neutral-700">
              {hunt.brand}: <b>{hunt.offer}</b>
            </p>
            <div className="mx-auto mt-4 flex max-w-xs items-center gap-2 rounded-2xl border-2 border-dashed border-[#d99a00] bg-[#f5c518]/15 p-2 pl-4">
              <span className="min-w-0 flex-1 select-all truncate text-left font-mono text-xl font-black tracking-wider">{hunt.code}</span>
              <button onClick={copy} className="flex h-10 shrink-0 items-center gap-1 rounded-xl bg-fg px-3 text-xs font-bold text-white active:scale-95">
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-muted">Show this code to {hunt.brand} or use it when you order. Offer from the sponsor, not from Naija Detective.</p>
            <div className="mt-4 grid gap-2">
              {site && (
                <a href={site} target="_blank" rel="noopener noreferrer nofollow" className="flex h-12 items-center justify-center gap-2 rounded-full bg-fg font-bold text-white active:scale-95">
                  <ExternalLink className="size-4" /> Visit {hunt.brand}
                </a>
              )}
              {hunt.phone && (
                <a
                  href={`https://wa.me/${waDigits(hunt.phone)}?text=${encodeURIComponent(`Hello ${hunt.brand}, I unlocked your offer in Naija Detective. Code: ${hunt.code}`)}`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] font-bold text-white active:scale-95"
                >
                  <MessageCircle className="size-4" /> Chat on WhatsApp
                </a>
              )}
              <button onClick={onClose} className="h-11 rounded-full border border-line font-semibold active:scale-95">
                Back to cases
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
