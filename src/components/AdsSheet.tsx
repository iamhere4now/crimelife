"use client";

import { Check, Eye, ImagePlus, Megaphone, MousePointerClick, RefreshCw, ShieldCheck, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AD_RULES,
  HUNT_PRICE,
  adProblem,
  bulkDiscount,
  MAX_BOARDS,
  cleanUrl,
  adStore,
  resetAdStore,
  DEFAULT_SETTINGS,
  drawPoster,
  edgeColour,
  fillZoom,
  loadPicture,
  makeRef,
  PLACEMENT_ORDER,
  priceOf,
  renderPoster,
  SHAPES,
  type AdCity,
  type AdPlacement,
  type AdSettings,
  type AdStore,
  type AdSubmission,
  type Framing,
} from "@/lib/ads";
import { CITIES, CITY_BY_ID } from "@/lib/cities";
import { money } from "@/lib/format";
import { sfx } from "@/lib/SoundEffects";
import { readAdStats, type AdCount } from "@/lib/board";
import { checkOwner, isCloudflareRuntime, setAdminKey } from "@/lib/cfRuntime";
import { listSignups, signupsCsv, type Signup } from "@/lib/signups";

type Tab = "new" | "mine" | "manage";

const cityName = (c: AdCity) => (c === "all" ? "All Nigeria" : CITY_BY_ID[c]?.name ?? c);
const dateOf = (t?: number) => (t ? new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "");

/** Advertise on the game's streets, and (for the owner) review and manage the posters. */
export function AdsSheet({ onClose, startTab = "new" }: { onClose: () => void; startTab?: Tab }) {
  const [store, setStore] = useState<AdStore | null>(null);
  const [problem, setProblem] = useState("");
  const [settings, setSettings] = useState<AdSettings>(DEFAULT_SETTINGS);
  const [tab, setTab] = useState<Tab>(startTab);
  // "Renew" on one of my posters: start a new one pre-filled from it
  const [renewing, setRenewing] = useState<AdSubmission | null>(null);

  // the Cloudflare build: the owner signs in with their ADMIN_KEY to open the Ad manager
  const [round, setRound] = useState(0);
  useEffect(() => {
    let live = true;
    adStore().then(async (s) => {
      if (!live) return;
      if (!s) return setProblem(adProblem || "Posters can't be saved right now. Please try again.");
      setStore(s);
      setSettings(await s.settings().catch(() => DEFAULT_SETTINGS));
    });
    return () => {
      live = false;
    };
  }, [round]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "new", label: "New poster" },
    { id: "mine", label: "My posters" },
    ...(store?.isOwner ? [{ id: "manage" as Tab, label: "Ad manager" }] : []),
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 fade-in lg:items-center" onClick={onClose}>
      <div
        className="sheet-up no-scrollbar max-h-[94dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-ink px-4 pb-[max(env(safe-area-inset-bottom),18px)] pt-2.5 lg:max-w-2xl lg:rounded-[28px] lg:p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Advertise on Naija Detective"
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-line lg:hidden" />
        <div className="mt-3 flex items-start justify-between gap-3 px-1">
          <div>
            <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
              <Megaphone className="size-3.5" /> Advertise
            </p>
            <h2 className="text-2xl font-bold tracking-tight">Put your business on Naija streets</h2>
            <p className="mt-0.5 text-sm text-neutral-600">Your poster shows on billboards and walls in the 3D crime scenes, in the city you choose.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="soft grid size-10 shrink-0 place-items-center rounded-full bg-card active:scale-90">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 flex gap-1 rounded-full bg-card p-1" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`h-9 flex-1 rounded-full text-xs font-bold transition ${tab === t.id ? "bg-kick text-white" : "text-neutral-600"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {problem ? (
          <p className="mt-6 rounded-2xl bg-danger/10 px-4 py-3 text-center text-sm font-semibold text-danger">{problem}</p>
        ) : !store ? (
          <p className="py-10 text-center text-sm text-muted">Connecting to the poster board…</p>
        ) : tab === "new" ? (
          <NewPoster key={renewing?.id ?? "new"} store={store} settings={settings} from={renewing} onDone={() => setTab("mine")} />
        ) : tab === "mine" ? (
          <MyPosters
            store={store}
            onRenew={(sub) => {
              sfx.tap();
              setRenewing(sub);
              setTab("new");
            }}
          />
        ) : (
          <Manager store={store} settings={settings} onSettings={setSettings} />
        )}

        {store && store.mode === "shared" && !store.isOwner && isCloudflareRuntime() && (
          <OwnerSignIn
            onDone={() => {
              resetAdStore();
              setStore(null);
              setRound((r) => r + 1);
            }}
          />
        )}

        {store?.mode === "local" && (
          <p className="mt-4 text-center text-[11px] text-muted">Playing outside claude.ai: posters are kept in this browser only, and you act as the owner.</p>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- submit a poster */

function NewPoster({ store, settings, from, onDone }: { store: AdStore; settings: AdSettings; from?: AdSubmission | null; onDone: () => void }) {
  const [placement, setPlacement] = useState<AdPlacement>(from?.placement ?? "billboard");
  const [city, setCity] = useState<AdCity>(from?.city ?? "lagos");
  const [weeks, setWeeks] = useState(from?.weeks ?? 1);
  const [count, setCount] = useState(from?.count ?? 1);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [framing, setFraming] = useState<Framing>({ zoom: 1, x: 0.5, y: 0.5, bg: "#ffffff" });
  const [business, setBusiness] = useState(from?.business ?? "");
  const [phone, setPhone] = useState(from?.phone ?? "");
  const [website, setWebsite] = useState(from?.website ?? "");
  const [blurb, setBlurb] = useState(from?.blurb ?? "");
  const [showWa, setShowWa] = useState(from?.whatsapp ?? true);
  // optional sponsored clue hunt: players find the brand's tokens to unlock an offer
  const [hunt, setHunt] = useState(!!from?.hunt);
  const [offer, setOffer] = useState(from?.hunt?.offer ?? "");
  const [code, setCode] = useState(from?.hunt?.code ?? "");
  const [tokens, setTokens] = useState(from?.hunt?.tokens ?? 5);
  // renewing: reuse the poster picture as it was
  useEffect(() => {
    if (!from?.image) return;
    const i = new Image();
    i.onload = () => setImg(i);
    i.src = from.image;
  }, [from]);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<{ ref: string; price: number } | null>(null);
  const ref = useMemo(() => makeRef(), []);
  const input = useRef<HTMLInputElement>(null);
  const huntCost = hunt ? HUNT_PRICE(settings) * weeks : 0;
  const price = priceOf(settings, placement, city, weeks, count) + huntCost;
  const fullPrice = priceOf(settings, placement, city, weeks, 1) * count + huntCost;
  const huntOk = !hunt || (offer.trim().length >= 4 && /^[A-Za-z0-9-]{3,20}$/.test(code.trim()));
  const unit = placement === "poster" ? "poster" : placement === "banner" ? "banner" : "board";

  const choosePlacement = (p: AdPlacement) => {
    setPlacement(p);
    // a new shape: shrink the picture to fit it again
    setFraming((f) => ({ ...f, zoom: 1, x: 0.5, y: 0.5 }));
  };

  const phoneOk = /^\+?[0-9 ]{10,16}$/.test(phone.trim());
  const site = cleanUrl(website);
  const siteOk = !website.trim() || !!site;
  const ready = !!img && business.trim().length >= 2 && phoneOk && siteOk && huntOk && agree && !busy;

  const submit = async () => {
    if (!ready || !img) return;
    setBusy(true);
    setError("");
    try {
      const image = renderPoster(img, placement, framing);
      await store.submit({
        business: business.trim(),
        phone: phone.trim(),
        placement,
        city,
        weeks,
        count,
        price,
        ref,
        image,
        website: site || undefined,
        blurb: blurb.trim() || undefined,
        whatsapp: showWa,
        hunt: hunt ? { offer: offer.trim(), code: code.trim().toUpperCase(), tokens } : undefined,
      });
      sfx.success();
      setSent({ ref, price });
    } catch (e) {
      const code = (e as { code?: string })?.code;
      setError(
        code === "invalid_argument"
          ? "This view can't submit posters. Ask the owner to share the game with you as a Contributor."
          : code === "quota_exceeded"
            ? "The poster store is full right now. Please try again later."
            : (e as Error)?.message || "Could not send your poster. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (!settings.open) return <p className="py-10 text-center text-sm text-neutral-600">Advertising is paused for now. Please check back soon.</p>;

  if (sent)
    return (
      <div className="mt-6 rounded-3xl bg-card p-5 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-go text-white">
          <Check className="size-6" strokeWidth={3} />
        </div>
        <h3 className="mt-3 text-lg font-bold">Poster sent for review</h3>
        <p className="mt-1 text-sm text-neutral-600">
          Pay <b>{money(sent.price)}</b> and use the reference <b className="font-mono">{sent.ref}</b>. Your poster goes live as soon as the payment is confirmed.
        </p>
        <PaymentNote text={settings.payment} />
        <button onClick={onDone} className="mt-4 h-11 w-full rounded-2xl bg-kick text-sm font-bold text-white active:scale-[0.98]">
          See my posters
        </button>
      </div>
    );

  return (
    <div className="mt-4 space-y-4">
      {/* which size */}
      <div>
        <p className="mb-2 px-1 text-xs font-bold text-muted">Choose your banner size</p>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {PLACEMENT_ORDER.map((p) => {
            const shape = SHAPES[p];
            return (
              <button
                key={p}
                onClick={() => choosePlacement(p)}
                aria-pressed={placement === p}
                className={`flex flex-col rounded-2xl border-2 bg-card p-3 text-left transition active:scale-[0.98] ${placement === p ? "border-kick" : "border-transparent"}`}
              >
                <span className="mb-2 flex h-10 items-center justify-center">
                  <span className="block rounded-[3px] bg-fg/80" style={{ width: shape.w >= shape.h ? 52 : (52 * shape.w) / shape.h * 0.6, aspectRatio: `${shape.w} / ${shape.h}`, maxHeight: 40 }} />
                </span>
                <span className="text-sm font-bold">{shape.label}</span>
                <span className="text-[10px] font-semibold text-muted">{shape.size}</span>
                <span className="mt-0.5 text-[11px] leading-snug text-neutral-600">{shape.where}</span>
                <span className="mt-1 text-xs font-bold">
                  {money(settings[p] ?? DEFAULT_SETTINGS[p])}
                  <span className="font-semibold text-muted"> /week</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* the picture, shrunk to fit and adjustable */}
      <div className="soft overflow-hidden rounded-3xl bg-card">
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            setError("");
            if (!f) return;
            try {
              const picture = await loadPicture(f);
              setImg(picture);
              setFraming({ zoom: 1, x: 0.5, y: 0.5, bg: edgeColour(picture) });
            } catch (err) {
              setError((err as Error).message);
            }
          }}
        />
        {img ? (
          <PosterEditor img={img} placement={placement} framing={framing} onChange={setFraming} onReplace={() => input.current?.click()} />
        ) : (
          <button onClick={() => input.current?.click()} className="flex h-40 w-full flex-col items-center justify-center gap-2 text-neutral-600">
            <ImagePlus className="size-8" />
            <span className="text-sm font-bold">Upload your poster</span>
            <span className="px-6 text-center text-[11px]">Any size works: it shrinks to fit the {SHAPES[placement].label.toLowerCase()} and you can resize it. PNG, JPG or WebP.</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="soft flex flex-col rounded-2xl bg-card px-3 py-2">
          <span className="text-[11px] font-semibold text-muted">City</span>
          <select value={city} onChange={(e) => setCity(e.target.value as AdCity)} className="bg-transparent text-sm font-bold focus:outline-none">
            <option value="all">All Nigeria (×{settings.nationwide})</option>
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <div className="soft rounded-2xl bg-card px-3 py-2">
          <span className="text-[11px] font-semibold text-muted">How long</span>
          <div className="mt-0.5 flex gap-1">
            {[1, 2, 4, 8].map((w) => (
              <button key={w} onClick={() => setWeeks(w)} aria-pressed={weeks === w} className={`h-7 flex-1 rounded-full text-xs font-bold ${weeks === w ? "bg-kick text-white" : "bg-raise"}`}>
                {w}w
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* how many boards */}
      <div className="soft rounded-2xl bg-card px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-muted">How many {unit}s?</span>
          {bulkDiscount(count) > 0 && <span className="rounded-full bg-go/15 px-2 py-0.5 text-[10px] font-bold text-go">{Math.round(bulkDiscount(count) * 100)}% bulk discount</span>}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {[1, 2, 3, 5, 10].map((n) => (
            <button key={n} onClick={() => setCount(n)} aria-pressed={count === n} className={`h-8 min-w-11 rounded-full px-3 text-xs font-bold ${count === n ? "bg-kick text-white" : "bg-raise"}`}>
              {n}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1 rounded-full bg-raise p-1">
            <button onClick={() => setCount((c) => Math.max(1, c - 1))} aria-label={`Fewer ${unit}s`} className="grid size-7 place-items-center rounded-full bg-card text-sm font-bold">
              −
            </button>
            <span className="w-7 text-center text-sm font-black tabular-nums">{count}</span>
            <button onClick={() => setCount((c) => Math.min(MAX_BOARDS, c + 1))} aria-label={`More ${unit}s`} className="grid size-7 place-items-center rounded-full bg-card text-sm font-bold">
              +
            </button>
          </div>
        </div>
        <p className="mt-1.5 text-[11px] leading-snug text-neutral-600">
          Your poster goes up on {count} {unit}{count > 1 ? "s" : ""} in every scene of {cityName(city)} that has room. More {unit}s, more players see it. 5+ get 10% off, 10+ get 20% off.
        </p>
      </div>

      <div className="grid gap-2 lg:grid-cols-2">
        <input value={business} onChange={(e) => setBusiness(e.target.value.slice(0, 60))} placeholder="Business name" className="soft h-11 rounded-2xl bg-card px-4 text-sm focus:outline-none" aria-label="Business name" />
        <input value={phone} onChange={(e) => setPhone(e.target.value.slice(0, 16))} placeholder="WhatsApp number" inputMode="tel" className="soft h-11 rounded-2xl bg-card px-4 text-sm focus:outline-none" aria-label="WhatsApp number" />
      </div>

      {/* what players see when they tap the poster */}
      <div className="rounded-2xl bg-card p-3">
        <p className="mb-2 text-xs font-bold text-muted">When players tap your poster (optional)</p>
        <div className="grid gap-2">
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value.slice(0, 200))}
            placeholder="Website or Instagram link, e.g. mamaput.ng"
            inputMode="url"
            className={`h-11 rounded-2xl bg-raise px-4 text-sm focus:outline-none ${siteOk ? "" : "ring-2 ring-danger"}`}
            aria-label="Website link"
          />
          {!siteOk && <p className="px-1 text-[11px] font-semibold text-danger">That doesn&apos;t look like a web link. Try something like mamaput.ng</p>}
          <textarea
            value={blurb}
            onChange={(e) => setBlurb(e.target.value.slice(0, 140))}
            rows={2}
            placeholder="A short line about your business (140 letters)"
            className="rounded-2xl bg-raise px-4 py-2 text-sm focus:outline-none"
            aria-label="Short description"
          />
          <label className="flex items-center gap-2 px-1 text-[12px] text-neutral-700">
            <input type="checkbox" checked={showWa} onChange={(e) => setShowWa(e.target.checked)} className="size-4 accent-[#14161b]" />
            Show a &ldquo;Chat on WhatsApp&rdquo; button with my number
          </label>
        </div>
      </div>

      {/* sponsored clue hunt add-on */}
      <div className={`rounded-2xl p-4 ${hunt ? "bg-[#F5A524]/15 ring-1 ring-[#F5A524]/50" : "bg-card"}`}>
        <label className="flex items-start gap-3">
          <input type="checkbox" checked={hunt} onChange={(e) => setHunt(e.target.checked)} className="mt-1 size-4 accent-[#14161b]" />
          <span>
            <span className="block text-sm font-bold">🎯 Add a sponsored clue hunt (+{money(HUNT_PRICE(settings))}/week)</span>
            <span className="block text-[12px] leading-snug text-neutral-600">
              Your poster gets its own crime scene in the Sponsored section. Players hunt for your brand&apos;s tokens, and when they find them all they unlock your offer and code. Great for discounts and new customers.
            </span>
          </span>
        </label>
        {hunt && (
          <div className="mt-3 grid gap-2">
            <input
              value={offer}
              onChange={(e) => setOffer(e.target.value.slice(0, 90))}
              placeholder="The offer, e.g. 10% off any jollof pack"
              className="h-11 rounded-2xl bg-card px-4 text-sm focus:outline-none"
              aria-label="Offer players unlock"
            />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^A-Za-z0-9-]/g, "").slice(0, 20))}
              placeholder="Discount code, e.g. NAIJADETECT10"
              className="h-11 rounded-2xl bg-card px-4 font-mono text-sm uppercase focus:outline-none"
              aria-label="Discount code"
            />
            <label className="flex items-center justify-between gap-3 px-1 text-[12px] text-neutral-700">
              <span>Tokens to find: <b>{tokens}</b></span>
              <input type="range" min={3} max={8} value={tokens} onChange={(e) => setTokens(Number(e.target.value))} className="w-40 accent-[#14161b]" aria-label="Tokens to find" />
            </label>
            {!huntOk && <p className="px-1 text-[11px] font-semibold text-danger">Add the offer and a code of 3–20 letters or numbers.</p>}
            <p className="px-1 text-[11px] text-muted">Everyone who finishes sees the same code, so use one you&apos;re happy to share.</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-card p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm text-neutral-600">
            {count} × {SHAPES[placement].label} · {cityName(city)} · {weeks} week{weeks > 1 ? "s" : ""}
            {hunt ? " · clue hunt" : ""}
          </span>
          <span className="text-right">
            {fullPrice > price && <span className="block text-xs text-muted line-through">{money(fullPrice)}</span>}
            <span className="text-xl font-black">{money(price)}</span>
          </span>
        </div>
        <p className="mt-1 text-[11px] text-muted">
          Payment reference: <span className="font-mono font-bold text-fg">{ref}</span>
        </p>
        <PaymentNote text={settings.payment} />
      </div>

      <label className="flex items-start gap-2 text-[12px] leading-snug text-neutral-600">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-4 accent-[#14161b]" />
        <span>
          I own the rights to this poster and it follows the rules. <span className="text-muted">{AD_RULES}</span>
        </span>
      </label>

      {error && <p className="rounded-2xl bg-danger/10 px-3 py-2 text-xs font-semibold text-danger">{error}</p>}

      <button onClick={submit} disabled={!ready} className="h-12 w-full rounded-2xl bg-kick text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-40">
        {busy ? "Sending…" : "Send poster for review"}
      </button>
    </div>
  );
}

function PaymentNote({ text }: { text: string }) {
  return (
    <p className="mt-2 whitespace-pre-line rounded-xl bg-raise px-3 py-2 text-left text-[12px] leading-snug text-neutral-700">
      {text.trim() || "The game owner will contact you on WhatsApp with how to pay."}
    </p>
  );
}

const SWATCHES = ["#ffffff", "#14161b", "#f5c518", "#c0182b", "#1d6a3a", "#1d4a8a"];

/**
 * The banner as it will hang, with the picture on it. The picture starts shrunk
 * to fit (nothing cut off); the advertiser can make it bigger or smaller, drag
 * it into place, and pick the colour around it.
 */
function PosterEditor({ img, placement, framing, onChange, onReplace }: { img: HTMLImageElement; placement: AdPlacement; framing: Framing; onChange: (f: Framing) => void; onReplace: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const { w, h } = SHAPES[placement];
  const fill = fillZoom(img, placement);
  const maxZoom = Math.max(3, fill * 1.6);
  const auto = useMemo(() => edgeColour(img), [img]);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cw = Math.round(c.clientWidth * dpr);
    c.width = cw;
    c.height = Math.round((cw * h) / w);
    drawPoster(c.getContext("2d")!, img, placement, framing, c.width, c.height);
  }, [img, placement, framing, w, h]);

  const onDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, x: framing.x, y: framing.y };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const c = canvas.current;
    if (!d || !c) return;
    const nx = d.x + (e.clientX - d.px) / c.clientWidth;
    const ny = d.y + (e.clientY - d.py) / c.clientHeight;
    onChange({ ...framing, x: Math.min(1.2, Math.max(-0.2, nx)), y: Math.min(1.2, Math.max(-0.2, ny)) });
  };
  const onUp = () => (drag.current = null);

  const board = (
    <canvas
      ref={canvas}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className="block w-full cursor-grab touch-none active:cursor-grabbing"
      style={{ aspectRatio: `${w} / ${h}` }}
      aria-label="Your poster. Drag to move it."
    />
  );

  return (
    <div>
      {placement === "poster" ? (
        <div className="flex justify-center bg-[#bdb4a2] py-5" style={{ backgroundImage: "radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)", backgroundSize: "6px 6px" }}>
          <div className="w-40 -rotate-1 shadow-md">{board}</div>
        </div>
      ) : placement === "banner" ? (
        <div className="flex flex-col items-center bg-gradient-to-b from-[#bfe0f4] to-[#e8f2f8] px-3 pt-5">
          <div className="flex w-full items-start">
            <span className="mt-[-12px] h-20 w-1.5 shrink-0 bg-[#6a5a4a]" />
            <div className="min-w-0 flex-1 shadow-md">{board}</div>
            <span className="mt-[-12px] h-20 w-1.5 shrink-0 bg-[#6a5a4a]" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center bg-gradient-to-b from-[#bfe0f4] to-[#e8f2f8] px-6 pt-5">
          <div className={`rounded-sm border-[6px] border-[#1d1d20] bg-[#1d1d20] shadow-lg ${placement === "signboard" ? "w-3/4" : "w-full"}`}>{board}</div>
          <div className={`flex justify-between ${placement === "signboard" ? "w-2/3" : "w-3/5"}`}>
            <span className="h-10 w-2 bg-[#4c5660]" />
            <span className="h-10 w-2 bg-[#4c5660]" />
          </div>
        </div>
      )}

      <div className="space-y-3 border-t border-line p-3">
        <label className="flex items-center gap-3 text-xs font-bold">
          <span className="w-10 shrink-0">Size</span>
          <input
            type="range"
            min={0.3}
            max={maxZoom}
            step={0.01}
            value={framing.zoom}
            onChange={(e) => onChange({ ...framing, zoom: Number(e.target.value) })}
            className="min-w-0 flex-1 accent-[#14161b]"
            aria-label="Picture size"
          />
          <span className="w-11 shrink-0 text-right tabular-nums text-muted">{Math.round(framing.zoom * 100)}%</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => onChange({ ...framing, zoom: 1, x: 0.5, y: 0.5 })} className="h-8 rounded-full bg-raise px-3 text-xs font-bold">
            Shrink to fit
          </button>
          <button onClick={() => onChange({ ...framing, zoom: fill, x: 0.5, y: 0.5 })} className="h-8 rounded-full bg-raise px-3 text-xs font-bold">
            Fill the board
          </button>
          <button onClick={onReplace} className="h-8 rounded-full bg-raise px-3 text-xs font-bold">
            Change picture
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-10 shrink-0 text-xs font-bold">Edges</span>
          {[auto, ...SWATCHES.filter((c) => c !== auto)].map((c, i) => (
            <button
              key={c}
              onClick={() => onChange({ ...framing, bg: c })}
              aria-label={i === 0 ? "Match the picture" : `Colour ${c}`}
              title={i === 0 ? "Match the picture" : c}
              className={`size-7 shrink-0 rounded-full border ${framing.bg === c ? "ring-2 ring-kick ring-offset-1" : "border-line"}`}
              style={{ background: c }}
            />
          ))}
          <label className="relative grid size-7 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-[conic-gradient(red,yellow,lime,cyan,blue,magenta,red)]" title="Any colour">
            <input type="color" value={framing.bg.length === 7 ? framing.bg : "#ffffff"} onChange={(e) => onChange({ ...framing, bg: e.target.value })} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Pick any colour" />
          </label>
        </div>
        <p className="text-[11px] text-muted">Drag the picture to move it. It starts shrunk to fit, so nothing is cut off.</p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- the advertiser's posters */

const STATUS: Record<AdSubmission["status"], { label: string; cls: string }> = {
  pending: { label: "Waiting for payment check", cls: "bg-[#f5c518]/25 text-[#7a5a00]" },
  live: { label: "Live", cls: "bg-go/15 text-go" },
  rejected: { label: "Not approved", cls: "bg-danger/10 text-danger" },
  expired: { label: "Ended", cls: "bg-raise text-muted" },
};

function useAdStats() {
  const [stats, setStats] = useState<Record<string, AdCount>>({});
  useEffect(() => {
    let live = true;
    readAdStats().then((x) => live && setStats(x));
    return () => {
      live = false;
    };
  }, []);
  return stats;
}

const DAY = 24 * 3600 * 1000;

function MyPosters({ store, onRenew }: { store: AdStore; onRenew: (s: AdSubmission) => void }) {
  const [list, setList] = useState<AdSubmission[] | null>(null);
  const stats = useAdStats();
  useEffect(() => {
    store.mine().then(setList, () => setList([]));
  }, [store]);
  if (!list) return <p className="py-10 text-center text-sm text-muted">Loading…</p>;
  if (!list.length) return <p className="py-10 text-center text-sm text-neutral-600">No posters yet. Send one from the New poster tab.</p>;
  const views = list.reduce((n, s) => n + (stats[s.id]?.v ?? 0), 0);
  const taps = list.reduce((n, s) => n + (stats[s.id]?.t ?? 0), 0);
  return (
    <div className="mt-4 space-y-2">
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="soft rounded-2xl bg-card px-2 py-3">
          <div className="text-lg font-black">{views.toLocaleString()}</div>
          <div className="text-[10px] font-semibold text-muted">Times shown in scenes</div>
        </div>
        <div className="soft rounded-2xl bg-card px-2 py-3">
          <div className="text-lg font-black">{taps.toLocaleString()}</div>
          <div className="text-[10px] font-semibold text-muted">Taps on your posters</div>
        </div>
      </div>
      {list.map((s) => {
        const left = s.status === "live" && s.liveUntil ? Math.ceil((s.liveUntil - Date.now()) / DAY) : null;
        const ended = s.status === "expired" || (left !== null && left <= 0);
        const soon = left !== null && left > 0 && left <= 3;
        return (
          <PosterRow key={s.id} s={s} stats={stats[s.id]} huntStats={stats["h" + s.id]}>
            {(ended || soon) && (
              <div className="mt-1.5 flex items-center gap-2">
                <span className={`text-[11px] font-semibold ${ended ? "text-muted" : "text-[#c26a00]"}`}>
                  {ended ? "This poster has ended." : `Ends in ${left} day${left === 1 ? "" : "s"}.`}
                </span>
                <button onClick={() => onRenew(s)} className="flex h-7 items-center gap-1 rounded-full bg-kick px-2.5 text-[11px] font-bold text-white active:scale-95">
                  <RefreshCw className="size-3" /> Renew
                </button>
              </div>
            )}
          </PosterRow>
        );
      })}
      <p className="pt-1 text-center text-[11px] text-muted">Counts come from every player's game and update every few minutes.</p>
    </div>
  );
}

function PosterRow({ s, stats, huntStats, children }: { s: AdSubmission; stats?: AdCount; huntStats?: AdCount; children?: React.ReactNode }) {
  const st = STATUS[s.status];
  return (
    <div className="soft flex gap-3 rounded-2xl bg-card p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={s.image} alt="" className="h-14 w-28 shrink-0 rounded-lg bg-raise object-contain" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-bold">{s.business}</span>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${st.cls}`}>
            {st.label}
            {s.status === "live" && s.liveUntil ? ` until ${dateOf(s.liveUntil)}` : ""}
          </span>
        </div>
        <div className="text-[11px] text-muted">
          {s.count && s.count > 1 ? `${s.count} × ` : ""}
          {SHAPES[s.placement].label} · {cityName(s.city)} · {s.weeks}w · {money(s.price)} · <span className="font-mono">{s.ref}</span>
        </div>
        {s.note && <div className="mt-0.5 text-[11px] text-danger">{s.note}</div>}
        {s.hunt && (
          <div className="mt-0.5 text-[11px] font-semibold text-[#a86a00]">
            🎯 Clue hunt: {s.hunt.offer} · code <span className="font-mono">{s.hunt.code}</span> · {s.hunt.tokens} tokens
            {(s.status === "live" || s.status === "expired") && ` · ${(huntStats?.v ?? 0).toLocaleString()} played, ${(huntStats?.t ?? 0).toLocaleString()} unlocked`}
          </div>
        )}
        {(s.status === "live" || s.status === "expired") && (
          <div className="mt-0.5 flex items-center gap-3 text-[11px] font-semibold text-neutral-700">
            <span className="flex items-center gap-1" title="Times shown in scenes">
              <Eye className="size-3" /> {(stats?.v ?? 0).toLocaleString()}
            </span>
            <span className="flex items-center gap-1" title="Taps">
              <MousePointerClick className="size-3" /> {(stats?.t ?? 0).toLocaleString()}
            </span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- the owner's ad manager */

function Manager({ store, settings, onSettings }: { store: AdStore; settings: AdSettings; onSettings: (s: AdSettings) => void }) {
  const [list, setList] = useState<AdSubmission[] | null>(null);
  const stats = useAdStats();
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [confirmDown, setConfirmDown] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = () => store.all().then(setList, () => setList([]));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  const act = async (fn: () => Promise<void>) => {
    setError("");
    try {
      await fn();
      sfx.tap();
      await load();
    } catch {
      setError("That didn't save. Please try again.");
    }
  };

  const pending = list?.filter((s) => s.status === "pending") ?? [];
  const live = list?.filter((s) => s.status === "live") ?? [];
  const income = (list ?? []).filter((s) => s.status === "live" || s.status === "expired").reduce((n, s) => n + s.price, 0);

  return (
    <div className="mt-4 space-y-5">
      {isCloudflareRuntime() && <Signups />}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          ["To review", pending.length],
          ["Live now", live.length],
          ["Approved total", money(income)],
        ].map(([label, value]) => (
          <div key={label as string} className="soft rounded-2xl bg-card px-2 py-3">
            <div className="text-lg font-black">{value}</div>
            <div className="text-[10px] font-semibold text-muted">{label}</div>
          </div>
        ))}
      </div>

      {error && <p className="rounded-2xl bg-danger/10 px-3 py-2 text-xs font-semibold text-danger">{error}</p>}

      <section>
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold">
          <ShieldCheck className="size-4" /> Waiting for review
        </h3>
        {!list ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : !pending.length ? (
          <p className="text-sm text-neutral-600">Nothing to review.</p>
        ) : (
          <div className="space-y-2">
            {pending.map((s) => (
              <PosterRow key={s.id} s={s} stats={stats[s.id]} huntStats={stats["h" + s.id]}>
                <div className="mt-1 text-[11px] text-neutral-700">
                  WhatsApp: <span className="font-semibold">{s.phone}</span>
                  {s.whatsapp ? " (shown on poster)" : " (private)"} · sent {dateOf(s.createdAt)}
                </div>
                {s.website && (
                  <div className="truncate text-[11px] text-neutral-700">
                    Link:{" "}
                    <a href={s.website} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold text-[#1d4a8a] underline">
                      {s.website}
                    </a>
                  </div>
                )}
                {s.blurb && <div className="text-[11px] italic text-neutral-600">&ldquo;{s.blurb}&rdquo;</div>}
                {rejecting === s.id ? (
                  <div className="mt-2 flex gap-1.5">
                    <input value={note} onChange={(e) => setNote(e.target.value.slice(0, 200))} placeholder="Reason (they will see it)" className="h-8 min-w-0 flex-1 rounded-full bg-raise px-3 text-xs focus:outline-none" />
                    <button onClick={() => act(() => store.reject(s, note.trim() || "Not approved")).then(() => setRejecting(null))} className="h-8 rounded-full bg-danger px-3 text-xs font-bold text-white">
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 flex gap-1.5">
                    <button onClick={() => act(() => store.approve(s))} className="h-8 rounded-full bg-go px-3 text-xs font-bold text-white">
                      Paid · approve
                    </button>
                    <button onClick={() => (setRejecting(s.id), setNote(""))} className="h-8 rounded-full bg-raise px-3 text-xs font-bold">
                      Reject
                    </button>
                  </div>
                )}
              </PosterRow>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-bold">Live posters</h3>
        {!live.length ? (
          <p className="text-sm text-neutral-600">None live.</p>
        ) : (
          <div className="space-y-2">
            {live.map((s) => (
              <PosterRow key={s.id} s={s} stats={stats[s.id]} huntStats={stats["h" + s.id]}>
                <button
                  onClick={() => (confirmDown === s.id ? act(() => store.takeDown(s)).then(() => setConfirmDown(null)) : setConfirmDown(s.id))}
                  className={`mt-2 flex h-8 items-center gap-1 rounded-full px-3 text-xs font-bold ${confirmDown === s.id ? "bg-danger text-white" : "bg-raise"}`}
                >
                  <Trash2 className="size-3.5" /> {confirmDown === s.id ? "Tap again to take down" : "Take down"}
                </button>
              </PosterRow>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-card p-4">
        <h3 className="text-sm font-bold">Prices and payment</h3>
        <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-3">
          {(
            [
              ["billboard", "Big billboard / week (₦)"],
              ["signboard", "Sign board / week (₦)"],
              ["banner", "Street banner / week (₦)"],
              ["poster", "Wall poster / week (₦)"],
              ["hunt", "Clue hunt add-on / week (₦)"],
              ["nationwide", "Nationwide ×"],
            ] as const
          ).map(([k, label]) => (
            <label key={k} className="flex flex-col gap-1 text-[11px] font-semibold text-muted">
              {label}
              <input
                type="number"
                min={k === "nationwide" ? 1 : 0}
                step={k === "nationwide" ? 0.5 : 500}
                value={draft[k] ?? (k === "hunt" ? HUNT_PRICE(draft) : 0)}
                onChange={(e) => setDraft({ ...draft, [k]: Math.max(0, Number(e.target.value) || 0) })}
                className="h-10 rounded-xl bg-raise px-3 text-sm font-bold text-fg focus:outline-none"
              />
            </label>
          ))}
        </div>
        <label className="mt-3 flex flex-col gap-1 text-[11px] font-semibold text-muted">
          How advertisers should pay you (shown to them)
          <textarea
            value={draft.payment}
            onChange={(e) => setDraft({ ...draft, payment: e.target.value.slice(0, 400) })}
            rows={3}
            placeholder={"e.g. Transfer to: Bank name, Account name, Account number.\nSend proof on WhatsApp with your reference."}
            className="rounded-xl bg-raise px-3 py-2 text-sm text-fg focus:outline-none"
          />
        </label>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={draft.open} onChange={(e) => setDraft({ ...draft, open: e.target.checked })} className="size-4 accent-[#14161b]" />
          Accept new posters
        </label>
        <button
          onClick={() =>
            act(async () => {
              await store.saveSettings(draft);
              onSettings(draft);
              setSaved(true);
              window.setTimeout(() => setSaved(false), 1800);
            })
          }
          className="mt-3 h-11 w-full rounded-2xl bg-kick text-sm font-bold text-white active:scale-[0.98]"
        >
          {saved ? "Saved" : "Save prices and payment"}
        </button>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- owner sign-in (Cloudflare build) */

export function OwnerSignIn({ onDone, startOpen = false }: { onDone: () => void; startOpen?: boolean }) {
  const [open, setOpen] = useState(startOpen);
  const [key, setKey] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="mx-auto mt-5 block text-[11px] font-semibold text-muted underline">
        Owner? Sign in to the Ad manager
      </button>
    );
  return (
    <form
      className="mt-5 rounded-2xl bg-card p-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setAdminKey(key);
        const r = await checkOwner();
        setBusy(false);
        if (r.owner) {
          setMsg("");
          sfx.success();
          onDone();
        } else {
          setAdminKey(null);
          setMsg(r.ownerSet ? "That owner password is not right." : "No owner password is set on the server yet. Set ADMIN_KEY on your Cloudflare Worker first.");
        }
      }}
    >
      <label className="text-xs font-bold">Owner password</label>
      <div className="mt-1.5 flex gap-2">
        <input type="password" value={key} onChange={(e) => setKey(e.target.value)} autoComplete="current-password" className="h-10 min-w-0 flex-1 rounded-xl bg-raise px-3 text-sm focus:outline-none" aria-label="Owner password" />
        <button disabled={!key || busy} className="h-10 rounded-xl bg-fg px-4 text-xs font-bold text-white disabled:opacity-50">
          {busy ? "Checking…" : "Sign in"}
        </button>
      </div>
      {msg && <p className="mt-1.5 text-[11px] font-semibold text-danger">{msg}</p>}
      <p className="mt-1.5 text-[11px] text-muted">The password you set as ADMIN_KEY on your Cloudflare Worker. It stays on this device.</p>
    </form>
  );
}

/* ---------------------------------------------------------------- the owner's list of sign-ups (Cloudflare build) */

export function Signups() {
  const [list, setList] = useState<Signup[] | null>(null);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  useEffect(() => {
    listSignups().then((l) => setList(l ?? []), () => setList([]));
  }, []);
  const download = () => {
    if (!list?.length) return;
    const url = URL.createObjectURL(new Blob(["﻿" + signupsCsv(list)], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `naija-detective-signups-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText([...new Set((list ?? []).map((s) => s.email))].join(", "));
      setNote("Emails copied.");
    } catch {
      setNote("Couldn't copy here: use Download instead.");
    }
  };
  return (
    <section className="soft rounded-2xl bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold">👥 Players who signed up {list ? `(${list.length})` : ""}</h3>
        <div className="flex gap-1.5">
          <button onClick={copy} disabled={!list?.length} className="h-8 rounded-full border border-line px-3 text-[11px] font-bold disabled:opacity-40">
            Copy emails
          </button>
          <button onClick={download} disabled={!list?.length} className="h-8 rounded-full bg-fg px-3 text-[11px] font-bold text-white disabled:opacity-40">
            Download CSV
          </button>
        </div>
      </div>
      {note && <p className="mt-1 text-[11px] text-muted">{note}</p>}
      {!list ? (
        <p className="mt-2 text-xs text-muted">Loading…</p>
      ) : !list.length ? (
        <p className="mt-2 text-xs text-neutral-600">No sign-ups yet.</p>
      ) : (
        <>
          <ul className="mt-2 divide-y divide-line text-xs">
            {(open ? list : list.slice(0, 5)).map((s, i) => (
              <li key={s.player + i} className="flex items-center justify-between gap-2 py-1.5">
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{s.fullName || "(no name)"}</span>
                  <span className="block truncate text-muted">{s.email}</span>
                </span>
                <span className="shrink-0 text-right text-[10px] text-muted">
                  {s.detective}
                  <br />
                  {s.at ? dateOf(s.at) : ""}
                </span>
              </li>
            ))}
          </ul>
          {list.length > 5 && (
            <button onClick={() => setOpen((o) => !o)} className="mt-1 text-[11px] font-bold text-muted underline">
              {open ? "Show fewer" : `Show all ${list.length}`}
            </button>
          )}
        </>
      )}
      <p className="mt-2 text-[10px] text-muted">Private: only you (signed in as owner) can see this list.</p>
    </section>
  );
}
