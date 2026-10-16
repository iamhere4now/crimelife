"use client";

import { Flag, MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { apiCall, isCloudflareRuntime } from "@/lib/cfRuntime";
import { waDigits } from "@/lib/ads";
import { sfx } from "@/lib/SoundEffects";

const KINDS = [
  ["bug", "Something's broken"],
  ["player", "A player's name or chat"],
  ["payment", "A payment or poster"],
  ["idea", "An idea"],
  ["other", "Something else"],
] as const;

/** Profile › Report a problem: goes to the owner console (the game's own site), or WhatsApp. */
export function ReportProblem({ onClose }: { onClose: () => void }) {
  const [kind, setKind] = useState<(typeof KINDS)[number][0]>("bug");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [support, setSupport] = useState("");
  const online = isCloudflareRuntime();

  useEffect(() => {
    if (!online) return;
    fetch("/api/contact")
      .then((r) => r.json() as Promise<{ support?: string }>)
      .then((c) => setSupport(c.support ?? ""))
      .catch(() => undefined);
  }, [online]);

  // a WhatsApp link when the owner's support contact is a phone number
  const digits = /^[+\d\s()-]{10,}$/.test(support.trim()) ? waDigits(support) : "";

  const send = async () => {
    setBusy(true);
    setError("");
    try {
      const context = `${navigator.userAgent.slice(0, 300)} · ${window.innerWidth}x${window.innerHeight} · ${new Date().toISOString()}`;
      await apiCall("/api/report", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind, text, context }) });
      sfx.success();
      setDone(true);
    } catch (e) {
      setError((e as { code?: string }).code === "rate_limited" ? "You've sent a lot of reports today. Please try again tomorrow." : "Couldn't send. Check your connection and try again.");
    }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 fade-in lg:items-center" onClick={onClose}>
      <div
        className="sheet-up w-full max-w-md rounded-t-[28px] bg-ink px-4 pb-[max(env(safe-area-inset-bottom),18px)] pt-4 lg:rounded-[28px] lg:p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Report a problem"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Flag className="size-5 text-danger" /> Report a problem
          </h2>
          <button onClick={onClose} aria-label="Close" className="soft grid size-10 shrink-0 place-items-center rounded-full bg-card active:scale-90">
            <X className="size-4" />
          </button>
        </div>

        {done ? (
          <div className="mt-4 rounded-2xl bg-card p-4 text-center">
            <p className="text-sm font-bold">Thank you, Detective. 🙏</p>
            <p className="mt-1 text-xs text-neutral-600">The game&apos;s owner reads every report. If you left a way to reach you, they may get in touch.</p>
            <button onClick={onClose} className="mt-3 h-10 w-full rounded-full bg-kick text-xs font-bold text-white">
              Back to the game
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {KINDS.map(([id, label]) => (
                <button key={id} onClick={() => setKind(id)} className={`h-8 rounded-full px-3 text-xs font-bold ${kind === id ? "bg-fg text-white" : "bg-card text-neutral-600"}`}>
                  {label}
                </button>
              ))}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 1000))}
              rows={5}
              placeholder={kind === "player" ? "Which detective name, and what did they write?" : kind === "payment" ? "Your poster's reference (ND-…) and what went wrong" : "What happened? Which case or screen were you on?"}
              className="mt-3 w-full rounded-2xl bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-kick"
              aria-label="Your report"
            />
            {error && <p className="mt-2 text-xs font-semibold text-danger">{error}</p>}
            {online && (
              <button onClick={() => void send()} disabled={busy || text.trim().length < 5} className="mt-3 h-11 w-full rounded-full bg-kick text-sm font-bold text-white disabled:opacity-40">
                {busy ? "Sending…" : "Send report"}
              </button>
            )}
            {digits && (
              <a
                href={`https://wa.me/${digits}?text=${encodeURIComponent(`Naija Detective report (${kind}): ${text}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-line text-sm font-bold"
              >
                <MessageCircle className="size-4 text-go" /> Or send on WhatsApp
              </a>
            )}
            <p className="mt-2 text-center text-[10px] text-muted">We attach your phone/browser type and screen size to help fix bugs. Nothing else.</p>
          </>
        )}
      </div>
    </div>
  );
}
