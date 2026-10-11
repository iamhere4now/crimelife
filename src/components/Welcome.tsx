"use client";

import { isCloudflareRuntime } from "@/lib/cfRuntime";
import { ChevronRight, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { moneyShort } from "@/lib/format";
import { profileFace, PLAYER_LOOKS } from "@/lib/looks";
import { rankFor } from "@/lib/ranks";
import { sfx } from "@/lib/SoundEffects";
import type { DetectiveProfile } from "@/lib/types";
import { Avatar } from "./Avatar";
import { BrandMark } from "./ui";

interface Props {
  profiles: DetectiveProfile[];
  onSignUp: (name: string, look: number, contact: { fullName: string; email: string }) => void;
  onSignIn: (id: string) => void;
  onGuest: () => void;
}

/**
 * The front door. Sign up makes a new detective, sign in picks one you already
 * made, and you can hop between the two (or skip both) without finishing either.
 * There are no passwords: detectives belong to whoever is signed in to Claude.
 */
export function Welcome({ profiles, onSignUp, onSignIn, onGuest }: Props) {
  const [tab, setTab] = useState<"up" | "in">(profiles.length ? "in" : "up");
  const [name, setName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [look, setLook] = useState(0);
  const trimmed = name.trim();
  const fullOk = fullName.trim().split(/\s+/).filter(Boolean).length >= 2;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const ready = !!trimmed && fullOk && emailOk;

  const switchTab = (t: "up" | "in") => {
    sfx.tap();
    setTab(t);
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-ink px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-[max(env(safe-area-inset-top),28px)]">
      <div className="flex flex-col items-center text-center">
        <BrandMark className="size-16" />
        <h1 className="mt-3 text-3xl font-black italic tracking-tight">
          Naija <span className="text-kick neon-text">Detective</span>
        </h1>
        <p className="mt-1 text-sm text-neutral-600">From Lagos to Kano, wahala dey everywhere. Na you go catch the thief?</p>
      </div>

      <div className="mt-6 grid grid-cols-2 rounded-full border border-line bg-night p-1" role="tablist">
        {(
          [
            ["up", "Sign up", UserPlus],
            ["in", "Sign in", LogIn],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => switchTab(id)}
            className={`flex h-10 items-center justify-center gap-1.5 rounded-full text-sm font-extrabold transition ${tab === id ? "bg-kick text-ink" : "text-neutral-600"}`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "up" ? (
        <form
          className="mt-5 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!ready) return;
            sfx.success();
            onSignUp(trimmed, look, { fullName: fullName.trim().replace(/\s+/g, " ").slice(0, 80), email: email.trim().toLowerCase().slice(0, 120) });
          }}
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-muted">Your full name</span>
            <input
              value={fullName}
              maxLength={80}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Adaeze Okafor"
              autoComplete="name"
              className={`h-12 rounded-xl border bg-night px-4 text-base text-fg placeholder:text-muted focus:border-kick focus:outline-none ${fullName && !fullOk ? "border-danger" : "border-line"}`}
            />
            {fullName && !fullOk && <span className="text-[11px] font-semibold text-danger">Please write your first name and surname.</span>}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-muted">Your email</span>
            <input
              type="email"
              value={email}
              maxLength={120}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              inputMode="email"
              className={`h-12 rounded-xl border bg-night px-4 text-base text-fg placeholder:text-muted focus:border-kick focus:outline-none ${email && !emailOk ? "border-danger" : "border-line"}`}
            />
            {email && !emailOk && <span className="text-[11px] font-semibold text-danger">That email doesn&apos;t look right.</span>}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-muted">Detective name (shown to other players)</span>
            <input
              id="detective-name"
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ada Sharp-Eye"
              autoComplete="nickname"
              className="h-12 rounded-xl border border-line bg-night px-4 text-base text-fg placeholder:text-muted focus:border-kick focus:outline-none"
            />
          </label>
          <fieldset>
            <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Pick your look</legend>
            <div className="grid grid-cols-6 gap-2">
              {PLAYER_LOOKS.map((face, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => {
                    sfx.tap();
                    setLook(i);
                  }}
                  aria-pressed={look === i}
                  aria-label={`Look ${i + 1}`}
                  className={`aspect-square overflow-hidden rounded-full transition active:scale-90 ${look === i ? "ring-3 ring-kick" : "ring-1 ring-line opacity-70"}`}
                >
                  <Avatar face={face} className="size-full" />
                </button>
              ))}
            </div>
          </fieldset>
          <button
            type="submit"
            disabled={!ready}
            className="h-12 rounded-full bg-kick font-extrabold text-ink shadow-[0_10px_24px_-14px_rgba(20,22,27,0.6)] transition enabled:active:scale-95 disabled:bg-raise disabled:text-muted disabled:shadow-none"
          >
            {ready ? `Oya, join Panti as Constable ${trimmed.split(" ")[0]}!` : !fullOk ? "Type your full name first" : !emailOk ? "Add your email" : "Pick a detective name"}
          </button>
          <p className="text-center text-[11px] leading-snug text-muted">
            Your full name and email are private: other players only see your detective name. The game&apos;s owner may email you about Naija Detective. We don&apos;t share them.
          </p>
          <p className="text-center text-xs text-muted">You start as a Constable with {moneyShort(250_000)}. No password needed: {isCloudflareRuntime() ? "your detectives are saved to this device and our server." : "your detectives stay with your Claude account."}</p>
        </form>
      ) : (
        <div className="mt-5 flex flex-col gap-2">
          {profiles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line p-5 text-center text-sm text-neutral-600">
              No detective don register here yet.{" "}
              <button onClick={() => switchTab("up")} className="font-bold text-kick underline">
                Sign up first
              </button>
              , or just play as guest.
            </div>
          ) : (
            profiles.map((p) => {
              const rank = rankFor(p.state.xp);
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    sfx.whoosh();
                    onSignIn(p.id);
                  }}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3 text-left transition hover:border-kick active:scale-[0.98]"
                >
                  <div className="size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-kick">
                    <Avatar face={profileFace(p)} className="size-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-extrabold">{p.name}</div>
                    <div className="text-xs text-muted">
                      {rank.name} · {moneyShort(p.state.balance)} · {p.state.solved.length} cases closed
                    </div>
                  </div>
                  <ChevronRight className="size-5 text-muted" />
                </button>
              );
            })
          )}
        </div>
      )}

      <button
        onClick={() => {
          sfx.whoosh();
          onGuest();
        }}
        className="mx-auto mt-6 text-sm font-bold text-neutral-600 underline decoration-line underline-offset-4 hover:text-fg"
      >
        Skip am, play as guest
      </button>
    </div>
  );
}
