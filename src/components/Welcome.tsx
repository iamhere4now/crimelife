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
import { DOOR_BLUE, Doodles, Onboarding } from "./Onboarding";
import { BrandMark } from "./ui";
import { isRude } from "@/lib/clean";
import { LegalLinks } from "./LegalLinks";

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
  // new players see the three intro screens first (once per device)
  const [intro, setIntro] = useState(() => !profiles.length && !seenIntro());
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
  // other players see the detective name: no insults or slurs
  const nameRude = isRude(trimmed, true);
  const ready = !!trimmed && !nameRude && fullOk && emailOk && pwOk && pwMatch && !busy;
  // signing in with email and password
  const [inEmail, setInEmail] = useState("");
  const [inPassword, setInPassword] = useState("");
  const [inError, setInError] = useState("");
  const [forgot, setForgot] = useState<string | null>(null);

  const switchTab = (t: "up" | "in") => {
    sfx.tap();
    setTab(t);
  };

  if (intro)
    return (
      <Onboarding
        onDone={() => {
          markIntroSeen();
          setTab("up");
          setIntro(false);
        }}
        onSignIn={() => {
          markIntroSeen();
          setTab("in");
          setIntro(false);
        }}
      />
    );

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-md flex-col overflow-hidden bg-[#f3f5f8] px-6 pb-[max(env(safe-area-inset-bottom),20px)] pt-[max(env(safe-area-inset-top),18px)] text-[#14161b]">
      <Doodles />
      <div className="relative flex items-center justify-center gap-2">
        <BrandMark className="size-7" />
        <span className="text-lg font-black tracking-tight">Naija Detective</span>
      </div>
      <div className="relative mt-7 text-center">
        <h1 className="text-[28px] font-extrabold leading-tight tracking-tight">{tab === "up" ? "Create your detective" : "Welcome back, detective"}</h1>
        <p className="mx-auto mt-1.5 max-w-xs text-[15px] leading-snug text-[#5b6475]">
          {tab === "up" ? "From Lagos to Kano, wahala dey everywhere. Na you go catch the thief?" : "Sign in to pick up your cases where you left them."}
        </p>
      </div>

      <div className="relative mt-6 grid grid-cols-2 rounded-full bg-white p-1 shadow-sm" role="tablist">
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
            className={`flex h-11 items-center justify-center gap-1.5 rounded-full text-sm font-bold transition ${tab === id ? "text-white shadow" : "text-[#5b6475]"}`}
            style={tab === id ? { background: DOOR_BLUE } : undefined}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "up" ? (
        <form
          className="relative mt-5 flex flex-col gap-4"
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
            <span className="text-xs font-bold uppercase tracking-wide text-[#5b6475]">Your full name</span>
            <input
              value={fullName}
              maxLength={80}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Adaeze Okafor"
              autoComplete="name"
              className={`h-12 rounded-2xl border bg-white px-4 text-base text-[#14161b] placeholder:text-[#9aa2b1] focus:border-[#2457e6] focus:outline-none focus:ring-2 focus:ring-[#2457e6]/25 ${fullName && !fullOk ? "border-danger" : "border-[#e3e6ec]"}`}
            />
            {fullName && !fullOk && <span className="text-[11px] font-semibold text-danger">Please write your first name and surname.</span>}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-[#5b6475]">Your email</span>
            <input
              type="email"
              value={email}
              maxLength={120}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              inputMode="email"
              className={`h-12 rounded-2xl border bg-white px-4 text-base text-[#14161b] placeholder:text-[#9aa2b1] focus:border-[#2457e6] focus:outline-none focus:ring-2 focus:ring-[#2457e6]/25 ${email && !emailOk ? "border-danger" : "border-[#e3e6ec]"}`}
            />
            {email && !emailOk && <span className="text-[11px] font-semibold text-danger">That email doesn&apos;t look right.</span>}
          </label>
          {cloud && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-[#5b6475]">Password (at least 8 characters)</span>
                <span className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={password}
                    maxLength={128}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className={`h-12 w-full rounded-2xl border bg-white px-4 pr-12 text-base text-[#14161b] focus:border-[#2457e6] focus:outline-none focus:ring-2 focus:ring-[#2457e6]/25 ${password && !pwOk ? "border-danger" : "border-[#e3e6ec]"}`}
                  />
                  <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center text-muted">
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </span>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-[#5b6475]">Type the password again</span>
                <input
                  type={show ? "text" : "password"}
                  value={password2}
                  maxLength={128}
                  onChange={(e) => setPassword2(e.target.value)}
                  autoComplete="new-password"
                  className={`h-12 rounded-2xl border bg-white px-4 text-base text-[#14161b] focus:border-[#2457e6] focus:outline-none focus:ring-2 focus:ring-[#2457e6]/25 ${password2 && !pwMatch ? "border-danger" : "border-[#e3e6ec]"}`}
                />
                {password2 && !pwMatch && <span className="text-[11px] font-semibold text-danger">The two passwords are not the same.</span>}
              </label>
            </>
          )}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-[#5b6475]">Detective name (shown to other players)</span>
            <input
              id="detective-name"
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ada Sharp-Eye"
              autoComplete="nickname"
              className="h-12 rounded-2xl border border-[#e3e6ec] bg-white px-4 text-base text-[#14161b] placeholder:text-[#9aa2b1] focus:border-[#2457e6] focus:outline-none focus:ring-2 focus:ring-[#2457e6]/25"
            />
          </label>
          <fieldset>
            <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-[#5b6475]">Pick your look</legend>
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
                  className={`aspect-square overflow-hidden rounded-full transition active:scale-90 ${look === i ? "ring-[3px] ring-[#2457e6]" : "ring-1 ring-[#e3e6ec] opacity-70"}`}
                >
                  <Avatar face={face} className="size-full" />
                </button>
              ))}
            </div>
          </fieldset>
          <button
            type="submit"
            disabled={!ready}
            className="h-14 rounded-full text-[16px] font-bold text-white shadow-[0_12px_24px_-12px_rgba(36,87,230,0.8)] transition enabled:active:scale-[0.98] disabled:opacity-45 disabled:shadow-none"
            style={{ background: DOOR_BLUE }}
          >
            {busy ? "Creating your account…" : ready ? `Oya, join Panti as Constable ${trimmed.split(" ")[0]}!` : !fullOk ? "Type your full name first" : !emailOk ? "Add your email" : !pwOk ? "Choose a password (8+ characters)" : !pwMatch ? "Passwords must match" : nameRude ? "Pick a different detective name" : "Pick a detective name"}
          </button>
          <p className="text-center text-[11px] leading-snug text-muted">
            Your full name and email are private: other players only see your detective name. The game&apos;s owner may email you about Naija Detective. We don&apos;t share them.
          </p>
          <LegalLinks prefix="By joining you agree to the" />
          {error && <p className="rounded-xl bg-danger/10 px-3 py-2 text-center text-xs font-semibold text-danger">{error}</p>}
          <p className="text-center text-xs text-muted">
            You start as a Constable with {moneyShort(250_000)}.{" "}
            {cloud ? "Sign in with your email and password on any phone or laptop, and your progress follows you." : "Your detectives stay with your Claude account."}
          </p>
        </form>
      ) : (
        <div className="relative mt-5 flex flex-col gap-2">
          {cloud && (
            <form
              className="mb-3 flex flex-col gap-2.5 rounded-3xl bg-white p-4 shadow-[0_18px_40px_-28px_rgba(20,22,27,0.5)]"
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
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#5b6475]">
                <KeyRound className="size-3.5" /> Sign in with email
              </span>
              <input type="email" value={inEmail} onChange={(e) => setInEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" inputMode="email" className="h-11 rounded-2xl border border-[#e3e6ec] bg-white px-4 text-base focus:border-[#2457e6] focus:outline-none focus:ring-2 focus:ring-[#2457e6]/25" aria-label="Email" />
              <input type="password" value={inPassword} onChange={(e) => setInPassword(e.target.value)} placeholder="Password" autoComplete="current-password" className="h-11 rounded-2xl border border-[#e3e6ec] bg-white px-4 text-base focus:border-[#2457e6] focus:outline-none focus:ring-2 focus:ring-[#2457e6]/25" aria-label="Password" />
              {inError && <p className="text-xs font-semibold text-danger">{inError}</p>}
              <button disabled={busy || !inEmail || !inPassword} className="h-14 rounded-full text-[16px] font-bold text-white shadow-[0_12px_24px_-12px_rgba(36,87,230,0.8)] transition enabled:active:scale-[0.98] disabled:opacity-45" style={{ background: DOOR_BLUE }}>
                {busy ? "Signing in…" : "Sign in"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  sfx.tap();
                  setForgot("…");
                  setForgot(await supportContact());
                }}
                className="text-sm font-semibold underline" style={{ color: DOOR_BLUE }}
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
          {cloud && profiles.length > 0 && <span className="text-xs font-bold uppercase tracking-wide text-[#5b6475]">Detectives on this device</span>}
          {profiles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#cdd3df] bg-white/70 p-5 text-center text-sm text-[#5b6475]">
              No detective don register here yet.{" "}
              <button onClick={() => switchTab("up")} className="font-bold underline" style={{ color: DOOR_BLUE }}>
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
                  className="flex items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm transition hover:ring-2 hover:ring-[#2457e6]/30 active:scale-[0.98]"
                >
                  <div className="size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-[#2457e6]">
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
        className="relative mx-auto mt-6 text-sm font-semibold text-[#5b6475] underline decoration-[#cdd3df] underline-offset-4 hover:text-[#14161b]"
      >
        Skip am, play as guest
      </button>
      <button
        onClick={() => {
          sfx.tap();
          setIntro(true);
        }}
        className="relative mx-auto mt-2 text-xs font-semibold text-[#9aa2b1]"
      >
        See the intro again
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

const INTRO_KEY = "crime-life:intro-seen";

function seenIntro() {
  try {
    return window.localStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
}

function markIntroSeen() {
  try {
    window.localStorage.setItem(INTRO_KEY, "1");
  } catch {
    // only a convenience
  }
}
