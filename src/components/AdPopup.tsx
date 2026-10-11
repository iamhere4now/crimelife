"use client";

import { ExternalLink, MessageCircle, X } from "lucide-react";
import { SHAPES, type LiveAd } from "@/lib/ads";
import { CITY_BY_ID } from "@/lib/cities";

/** What a player sees on tapping a poster in a scene: the poster, who it's from, and their links. */
export function AdPopup({ ad, onClose }: { ad: LiveAd; onClose: () => void }) {
  const shape = SHAPES[ad.placement];
  let host = "";
  try {
    host = ad.website ? new URL(ad.website).hostname.replace(/^www\./, "") : "";
  } catch {
    host = "";
  }
  const where = ad.city === "all" ? "All Nigeria" : CITY_BY_ID[ad.city]?.name ?? "";
  const wa = ad.phone ? `https://wa.me/${ad.phone}?text=${encodeURIComponent(`Hello ${ad.business}, I saw your poster in Naija Detective.`)}` : "";

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 fade-in lg:items-center" onClick={onClose}>
      <div
        className="sheet-up w-full max-w-md overflow-hidden rounded-t-[28px] bg-ink pb-[max(env(safe-area-inset-bottom),16px)] lg:rounded-[28px] lg:pb-5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Advert: ${ad.business}`}
      >
        <div className="relative bg-[#1d1d20] p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ad.image}
            alt={`${ad.business} poster`}
            className="mx-auto block max-h-[46dvh] rounded-md object-contain"
            style={{ aspectRatio: `${shape.w} / ${shape.h}`, width: shape.w >= shape.h ? "100%" : "auto", height: shape.w >= shape.h ? "auto" : "46dvh" }}
          />
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Sponsored</span>
          <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-fg active:scale-90">
            <X className="size-4" />
          </button>
        </div>
        <div className="px-5 pt-4">
          <h2 className="text-xl font-bold leading-tight">{ad.business}</h2>
          <p className="mt-0.5 text-xs font-semibold text-muted">
            {shape.label}
            {where ? ` · ${where}` : ""}
          </p>
          {ad.blurb && <p className="mt-2 text-sm leading-relaxed text-neutral-700">{ad.blurb}</p>}

          <div className="mt-4 grid gap-2">
            {ad.website && (
              <a
                href={ad.website}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-kick text-sm font-bold text-white transition active:scale-[0.98]"
              >
                <ExternalLink className="size-4" /> Visit {host || "website"}
              </a>
            )}
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#1fa855] text-sm font-bold text-white transition active:scale-[0.98]"
              >
                <MessageCircle className="size-4" /> Chat on WhatsApp
              </a>
            )}
            {!ad.website && !wa && <p className="rounded-2xl bg-raise px-3 py-2 text-center text-xs text-neutral-600">This advertiser didn&apos;t add a link.</p>}
          </div>
          {(ad.website || wa) && <p className="mt-2 text-center text-[11px] text-muted">Links open outside Naija Detective. The game doesn&apos;t check or endorse advertisers.</p>}
        </div>
      </div>
    </div>
  );
}
