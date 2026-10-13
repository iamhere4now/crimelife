"use client";

import { Bell, Download, Feather, Share, Smartphone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { isLite, liteIsAuto, setLite } from "@/lib/lite";
import { disableReminders, enableReminders, installState, onPwaChange, promptInstall, pushSupport, remindersOn } from "@/lib/pwa";

function usePwa() {
  const [, bump] = useState(0);
  useEffect(() => onPwaChange(() => bump((n) => n + 1)), []);
  return installState();
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-kick" : "bg-line"}`}>
      <span className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </span>
  );
}

/** Profile › App & data: install, reminders and lite mode. */
export function AppSettings() {
  const install = usePwa();
  const push = pushSupport();
  const [lite, setLiteState] = useState(false);
  const [auto, setAuto] = useState(false);
  const [reminders, setReminders] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    setLiteState(isLite());
    setAuto(liteIsAuto());
    void remindersOn().then(setReminders);
  }, []);

  const toggleLite = () => {
    setLite(!lite);
    setLiteState(!lite);
    setAuto(false);
  };

  const toggleReminders = async () => {
    if (busy) return;
    setBusy(true);
    setNote("");
    if (reminders) {
      await disableReminders();
      setReminders(false);
    } else {
      const r = await enableReminders();
      setReminders(r === "on");
      if (r === "denied") setNote("Notifications are blocked for this game. Allow them in your browser's site settings, then try again.");
      if (r === "failed") setNote("Couldn't turn reminders on just now. Check your connection and try again.");
    }
    setBusy(false);
  };

  return (
    <section className="mt-4 divide-y divide-line/60 rounded-2xl border border-line bg-card" aria-label="App and data">
      <div className="px-4 pb-2 pt-3.5 text-xs font-bold uppercase tracking-wide text-muted">App &amp; data</div>

      {install === "installed" && (
        <div className="flex items-center gap-3 p-4 font-semibold">
          <Smartphone className="size-5 text-kick" /> On your home screen
        </div>
      )}
      {install === "prompt" && (
        <button onClick={() => void promptInstall()} className="flex w-full items-center gap-3 p-4 text-left">
          <Download className="size-5 text-kick" />
          <span className="flex-1">
            <span className="block font-semibold">Add to home screen</span>
            <span className="block text-xs text-muted">Opens like an app, full screen, even with weak network.</span>
          </span>
        </button>
      )}
      {install === "ios" && (
        <div className="flex items-start gap-3 p-4">
          <Download className="mt-0.5 size-5 shrink-0 text-kick" />
          <span className="text-sm">
            <span className="block font-semibold">Add to home screen</span>
            <span className="text-xs text-muted">
              In Safari, tap <Share className="inline size-3.5 align-[-2px]" /> Share, then <b>Add to Home Screen</b>.
            </span>
          </span>
        </div>
      )}

      {push === "ok" && (
        <button onClick={() => void toggleReminders()} disabled={busy} className="flex w-full items-center gap-3 p-4 text-left disabled:opacity-60">
          <Bell className={`size-5 ${reminders ? "text-kick" : "text-muted"}`} />
          <span className="flex-1">
            <span className="block font-semibold">Reminders</span>
            <span className="block text-xs text-muted">One a day around 6pm: daily challenge, streak, the weekly tournament.</span>
          </span>
          <Toggle on={reminders} />
        </button>
      )}
      {push === "install-first" && (
        <div className="flex items-start gap-3 p-4">
          <Bell className="mt-0.5 size-5 shrink-0 text-muted" />
          <span className="text-sm">
            <span className="block font-semibold">Reminders</span>
            <span className="text-xs text-muted">On iPhone, add the game to your home screen first, then open it from there to turn reminders on.</span>
          </span>
        </div>
      )}
      {note && <p className="px-4 py-3 text-xs font-semibold text-danger">{note}</p>}

      <button onClick={toggleLite} className="flex w-full items-center gap-3 p-4 text-left">
        <Feather className={`size-5 ${lite ? "text-kick" : "text-muted"}`} />
        <span className="flex-1">
          <span className="block font-semibold">Lite mode</span>
          <span className="block text-xs text-muted">
            Drawn scenes instead of 3D, no street sounds. Easier on data, battery and older phones.
            {auto && " On because your phone's Data Saver is on."}
          </span>
        </span>
        <Toggle on={lite} />
      </button>
    </section>
  );
}

const DISMISS = "crime-life:install-dismissed";

/** A small "install the game" card on Home, until it's installed or dismissed. */
export function InstallBanner() {
  const install = usePwa();
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    try {
      setHidden(localStorage.getItem(DISMISS) === "1");
    } catch {
      setHidden(false);
    }
  }, []);
  if (hidden || (install !== "prompt" && install !== "ios")) return null;
  const close = () => {
    setHidden(true);
    try {
      localStorage.setItem(DISMISS, "1");
    } catch {
      // this visit only
    }
  };
  return (
    <div className="relative mt-4 flex items-center gap-3 rounded-2xl p-3.5 pr-10 text-white" style={{ background: "linear-gradient(120deg, #2457e6, #1b3fb8)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/icon-192.png" alt="" className="size-11 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-black">Play from your home screen</div>
        {install === "prompt" ? (
          <div className="text-xs text-white/85">One tap to open, full screen, and a reminder when there&apos;s a new challenge.</div>
        ) : (
          <div className="text-xs text-white/85">
            Tap <Share className="inline size-3.5 align-[-2px]" /> Share, then <b>Add to Home Screen</b>.
          </div>
        )}
      </div>
      {install === "prompt" && (
        <button onClick={() => void promptInstall()} className="shrink-0 rounded-full bg-white px-3.5 py-2 text-xs font-black text-[#1b3fb8] transition active:scale-95">
          Install
        </button>
      )}
      <button onClick={close} aria-label="Hide" className="absolute right-2 top-2 grid size-7 place-items-center rounded-full text-white/80">
        <X className="size-4" />
      </button>
    </div>
  );
}
