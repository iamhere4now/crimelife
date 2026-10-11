"use client";

import { KeyRound, LogOut, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { ACCOUNT_MESSAGES, accountChangePassword, accountEmail, accountRegister, isCloudflareRuntime } from "@/lib/cfRuntime";
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
    </section>
  );
}
