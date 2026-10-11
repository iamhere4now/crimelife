"use client";

import { ACCOUNT_MESSAGES, accountLogin, isCloudflareRuntime } from "@/lib/cfRuntime";
import { ChevronRight, Eye, EyeOff, KeyRound, LogIn, UserPlus } from "lucide-react";
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
  /** Resolves with an error message to show, or nothing when the sign-up went through. */
  onSignUp: (name: string, look: number, contact: { fullName: string; email: string; password?: string }) => void | Promise<string | null | void>;
  onSignIn: (id: string) => void;
  onGuest: () => void;
}

/**
 * The front door. Sign up makes a new detective, sign in picks one you already
 * made, and you can hop between the two (or skip both) without finishing either.
 * On claude.ai detectives belong to whoever is signed in to Claude. On the game's own
 * (Cloudflare) site, sign-up also sets an email and password so players can sign in on
 * any device; "Forgot password?" sends them to the owner, who can reset it.
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
  // passwords only on the game's own site (claude.ai signs people in itself)
  const cloud = isCloudflareRuntime();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pwOk = !cloud || (password.length >= 8 && password.length <= 128);
  const pwMatch = !cloud || password === password2;
  const ready = !!trimmed && fullOk && emailOk && pwOk && pwMatch && !busy;
  // signing in with email and password
  const [inEmail, setInEmail] = useState("");
  const [inPassword, setInPassword] = useState("");
  const [inError, setInError] = useState("");
  const [forgot, setForgot] = useState<string | null>(null);

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
          onSubmit={async (e) => {
            e.preventDefault();
            if (!ready) return;
            setBusy(true);
            setError("");
            const problem = await onSignUp(trimmed, look, { fullName: fullName.trim().replace(/\s+/g, " ").slice(0, 80), email: email.trim().toLowerCase().slice(0, 120), password: cloud ? password : undefined });
            setBusy(false);
            if (problem) {
              sfx.error();
              setError(problem);
            } else sfx.success();
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
          {cloud && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-muted">Password (at least 8 characters)</span>
                <span className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={password}
                    maxLength={128}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className={`h-12 w-full rounded-xl border bg-night px-4 pr-12 text-base text-fg focus:border-kick focus:outline-none ${password && !pwOk ? "border-danger" : "border-line"}`}
                  />
                  <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center text-muted">
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </span>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-muted">Type the password again</span>
                <input
                  type={show ? "text" : "password"}
                  value={password2}
                  maxLength={128}
                  onChange={(e) => setPassword2(e.target.value)}
                  autoComplete="new-password"
                  className={`h-12 rounded-xl border bg-night px-4 text-base text-fg focus:border-kick focus:outline-none ${password2 && !pwMatch ? "border-danger" : "border-line"}`}
                />
                {password2 && !pwMatch && <span className="text-[11px] font-semibold text-danger">The two passwords are not the same.</span>}
              </label>
            </>
          )}
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
            {busy ? "Creating your account…" : ready ? `Oya, join Panti as Constable ${trimmed.split(" ")[0]}!` : !fullOk ? "Type your full name first" : !emailOk ? "Add your email" : !pwOk ? "Choose a password (8+ characters)" : !pwMatch ? "Passwords must match" : "Pick a detective name"}
          </button>
          <p className="text-center text-[11px] leading-snug text-muted">
            Your full name and email are private: other players only see your detective name. The game&apos;s owner may email you about Naija Detective. We don&apos;t share them.
          </p>
          {error && <p className="rounded-xl bg-danger/10 px-3 py-2 text-center text-xs font-semibold text-danger">{error}</p>}
          <p className="text-center text-xs text-muted">
            You start as a Constable with {moneyShort(250_000)}.{" "}
            {cloud ? "Sign in with your email and password on any phone or laptop, and your progress follows you." : "Your detectives stay with your Claude account."}
          </p>
        </form>
      ) : (
        <div className="mt-5 flex flex-col gap-2">
          {cloud && (
            <form
              className="mb-3 flex flex-col gap-2 rounded-2xl border border-line bg-card p-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                setInError("");
                const problem = await accountLogin(inEmail.trim().toLowerCase(), inPassword);
                setBusy(false);
                if (problem) {
                  sfx.error();
                  setInError(ACCOUNT_MESSAGES[problem]);
                  return;
                }
                sfx.success();
                // load this player's detectives and progress
                window.location.reload();
              }}
            >
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted">
                <KeyRound className="size-3.5" /> Sign in with email
              </span>
              <input type="email" value={inEmail} onChange={(e) => setInEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" inputMode="email" className="h-11 rounded-xl border border-line bg-night px-3 text-base focus:border-kick focus:outline-none" aria-label="Email" />
              <input type="password" value={inPassword} onChange={(e) => setInPassword(e.target.value)} placeholder="Password" autoComplete="current-password" className="h-11 rounded-xl border border-line bg-night px-3 text-base focus:border-kick focus:outline-none" aria-label="Password" />
              {inError && <p className="text-xs font-semibold text-danger">{inError}</p>}
              <button disabled={busy || !inEmail || !inPassword} className="h-11 rounded-full bg-kick font-extrabold text-ink transition enabled:active:scale-95 disabled:bg-raise disabled:text-muted">
                {busy ? "Signing in…" : "Sign in"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  sfx.tap();
                  setForgot("…");
                  setForgot(await supportContact());
                }}
                className="text-xs font-bold text-muted underline"
              >
                Forgot password?
              </button>
              {forgot && (
                <p className="rounded-xl bg-raise px-3 py-2 text-xs leading-snug text-neutral-700">
                  Ask the game&apos;s owner to reset it: they will give you a new password to sign in with, then you can change it in Profile.
                  {forgot !== "…" && forgot !== "" && (
                    <>
                      {" "}
                      Contact: <b className="select-all break-words">{forgot}</b>
                    </>
                  )}
                </p>
              )}
            </form>
          )}
          {cloud && profiles.length > 0 && <span className="text-xs font-bold uppercase tracking-wide text-muted">Detectives on this device</span>}
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

/** The owner's contact for password resets (set in the Ad manager settings), or "". */
async function supportContact(): Promise<string> {
  try {
    const rt = (window as unknown as { claude?: { use(n: string): Promise<unknown> } }).claude;
    const db = (await rt?.use("db")) as { doc(p: string): { get(): Promise<{ data(): Record<string, unknown> | undefined }> } } | null;
    const d = db ? (await db.doc("adsettings/main").get()).data() : undefined;
    return typeof d?.support === "string" ? d.support.slice(0, 160) : "";
  } catch {
    return "";
  }
}
