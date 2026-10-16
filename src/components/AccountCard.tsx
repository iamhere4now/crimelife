"use client";

import { KeyRound, LogOut, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ACCOUNT_MESSAGES, accountChangePassword, accountDelete, accountEmail, accountRegister, isCloudflareRuntime } from "@/lib/cfRuntime";
import { disableReminders } from "@/lib/pwa";
import { signOutDevice } from "@/lib/signOut";
import { sfx } from "@/lib/SoundEffects";

/**
 * Profile's account card (the game's own site only): who this device is signed in
 * as, change password and sign out; or, for players from before passwords, a form to
 * add an email and password so their progress can follow them to other devices.
 */
export function AccountCard({ fullName, email: profileEmail }: { fullName?: string; email?: string }) {
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  const [mode, setMode] = useState<"" | "change" | "add">("");
  const [a, setA] = useState(profileEmail ?? "");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (isCloudflareRuntime()) void accountEmail().then(setEmail);
  }, []);
  if (!isCloudflareRuntime()) return null;

  const submit = async () => {
    setBusy(true);
    setMsg("");
    const problem =
      mode === "change"
        ? b.length < 8
          ? "weak_password"
          : await accountChangePassword(a, b)
        : b.length < 8
          ? "weak_password"
          : await accountRegister(a.trim().toLowerCase(), b, fullName ?? "");
    setBusy(false);
    if (problem) {
      sfx.error();
      setMsg(ACCOUNT_MESSAGES[problem]);
      return;
    }
    sfx.success();
    setMsg(mode === "change" ? "Password changed. Other devices have been signed out." : "Done! Sign in with this email and password on any device.");
    if (mode === "add") setEmail(a.trim().toLowerCase());
    setMode("");
    setA("");
    setB("");
    setC("");
  };

  return (
    <section className="mt-4 rounded-2xl border border-line bg-card p-4" aria-label="Account">
      <h2 className="flex items-center gap-1.5 text-sm font-extrabold">
        <ShieldCheck className="size-4 text-go" /> Account
      </h2>
      {email === undefined ? (
        <p className="mt-1 text-xs text-muted">Checking…</p>
      ) : email ? (
        <p className="mt-1 text-xs text-neutral-600">
          Signed in as <b className="text-fg">{email}</b>. Use this email and your password to play on any phone or laptop.
        </p>
      ) : (
        <p className="mt-1 text-xs text-neutral-600">Add an email and password so you can sign in on any device and never lose your progress.</p>
      )}
      {msg && <p className="mt-2 rounded-xl bg-raise px-3 py-2 text-xs font-semibold">{msg}</p>}

      {mode === "" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {email ? (
            <>
              <button onClick={() => setMode("change")} className="flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-xs font-bold active:scale-95">
                <KeyRound className="size-3.5" /> Change password
              </button>
              <button
                onClick={async () => {
                  if (!window.confirm("Sign out on this device? Your progress is saved to your account; sign in again with your email and password.")) return;
                  await signOutDevice();
                  window.location.reload();
                }}
                className="flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-xs font-bold active:scale-95"
              >
                <LogOut className="size-3.5" /> Sign out
              </button>
            </>
          ) : (
            email === null && (
              <button onClick={() => setMode("add")} className="h-9 rounded-full bg-kick px-4 text-xs font-black text-ink active:scale-95">
                Add email & password
              </button>
            )
          )}
        </div>
      ) : (
        <form
          className="mt-3 flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (b !== c) return setMsg("The two new passwords are not the same.");
            void submit();
          }}
        >
          <input
            type={mode === "change" ? "password" : "email"}
            value={a}
            onChange={(e) => setA(e.target.value)}
            placeholder={mode === "change" ? "Current password" : "you@example.com"}
            autoComplete={mode === "change" ? "current-password" : "email"}
            className="h-10 rounded-xl bg-raise px-3 text-sm focus:outline-none"
            aria-label={mode === "change" ? "Current password" : "Email"}
          />
          <input type="password" value={b} onChange={(e) => setB(e.target.value)} placeholder="New password (8+ characters)" autoComplete="new-password" className="h-10 rounded-xl bg-raise px-3 text-sm focus:outline-none" aria-label="New password" />
          <input type="password" value={c} onChange={(e) => setC(e.target.value)} placeholder="New password again" autoComplete="new-password" className="h-10 rounded-xl bg-raise px-3 text-sm focus:outline-none" aria-label="New password again" />
          <div className="flex gap-2">
            <button disabled={busy || !a || !b || !c} className="h-10 flex-1 rounded-full bg-fg text-xs font-bold text-white disabled:opacity-50">
              {busy ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={() => setMode("")} className="h-10 rounded-full border border-line px-4 text-xs font-bold">
              Cancel
            </button>
          </div>
        </form>
      )}
      {email !== undefined && <DeleteAccount hasPassword={!!email} />}
    </section>
  );
}

/** "Delete my account": the player's right to have their data removed (NDPA 2023). */
function DeleteAccount({ hasPassword }: { hasPassword: boolean }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-muted underline underline-offset-2">
        <Trash2 className="size-3" /> Delete my account
      </button>
    );
  return (
    <form
      className="mt-3 flex flex-col gap-2 rounded-xl bg-danger/5 p-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        await disableReminders();
        const problem = await accountDelete(hasPassword ? password : undefined);
        if (problem) {
          setBusy(false);
          sfx.error();
          setError(problem === "wrong_login" ? "That password isn't right." : ACCOUNT_MESSAGES[problem]);
          return;
        }
        window.location.replace("/");
      }}
    >
      <p className="text-xs font-bold text-danger">Delete my account for good</p>
      <p className="text-[11px] leading-snug text-neutral-700">
        This removes your detectives, progress, leaderboard row, chat messages, posters and sign-up details from our servers and this device. It can&apos;t be undone. Records of
        payments you made are kept for tax law, without your game data.
      </p>
      {hasPassword && (
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" className="h-10 rounded-xl bg-white px-3 text-sm focus:outline-none" aria-label="Your password" />
      )}
      <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder='Type DELETE to confirm' className="h-10 rounded-xl bg-white px-3 text-sm focus:outline-none" aria-label="Type DELETE to confirm" />
      {error && <p className="text-xs font-semibold text-danger">{error}</p>}
      <div className="flex gap-2">
        <button disabled={busy || typed.trim().toUpperCase() !== "DELETE" || (hasPassword && !password)} className="h-10 flex-1 rounded-full bg-danger text-xs font-bold text-white disabled:opacity-40">
          {busy ? "Deleting…" : "Delete everything"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="h-10 rounded-full border border-line px-4 text-xs font-bold">
          Keep my account
        </button>
      </div>
    </form>
  );
}
