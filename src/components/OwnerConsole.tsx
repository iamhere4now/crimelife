"use client";

import { Ban, LogOut, Megaphone, RefreshCw, ShieldCheck, Trash2, Wrench, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { resetAdStore } from "@/lib/ads";
import { adminCall, checkOwner, isCloudflareRuntime, setAdminKey } from "@/lib/cfRuntime";
import { money } from "@/lib/format";
import { sfx } from "@/lib/SoundEffects";
import { OwnerSignIn, Signups } from "./AdsSheet";

type Snap = { id: string; data(): Record<string, unknown> | undefined };
type Db = { collection(p: string): { get(): Promise<{ docs: Snap[] }> }; doc(p: string): { delete(): Promise<void> } };

interface Overview {
  players: number;
  newToday: number;
  accounts?: number;
  bans: { uid: string; at: number; note: string }[];
  media: boolean;
  ask: boolean;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);

/**
 * The owner's private control room. Opened only by going to the game's address
 * with #owner on the end, and only works after signing in with the owner
 * password (ADMIN_KEY on the Cloudflare Worker). Players never see a way in.
 */
export function OwnerConsole({ onClose, onAds, onGrant }: { onClose: () => void; onAds: () => void; onGrant: (money: number, xp: number) => void }) {
  const [owner, setOwner] = useState<boolean | null>(null);
  const [over, setOver] = useState<Overview | null>(null);
  const [board, setBoard] = useState<{ id: string; name: string; balance: number; xp: number }[]>([]);
  const [chat, setChat] = useState<{ id: string; name: string; last: string; count: number }[]>([]);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    const me = await checkOwner();
    setOwner(me.owner);
    if (!me.owner) return;
    // the Ad manager reads who is owner when it opens: let it check again now
    resetAdStore();
    const db = (await (window as unknown as { claude: { use(n: string): Promise<unknown> } }).claude.use("db")) as Db;
    const [o, b, c] = await Promise.all([adminCall("overview") as Promise<Overview>, db.collection("board").get(), db.collection("chat").get()]);
    setOver(o);
    setBoard(
      b.docs
        .map((d) => ({ id: d.id, name: str(d.data()?.name), balance: num(d.data()?.balance), xp: num(d.data()?.xp) }))
        .sort((x, y) => y.balance - x.balance),
    );
    setChat(
      c.docs.map((d) => {
        const msgs = Array.isArray(d.data()?.msgs) ? (d.data()!.msgs as { text?: string }[]) : [];
        return { id: d.id, name: str(d.data()?.name), last: str(msgs[msgs.length - 1]?.text), count: msgs.length };
      }),
    );
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (fn: () => Promise<unknown>, done: string) => {
    try {
      await fn();
      sfx.tap();
      setNote(done);
      await load();
    } catch {
      setNote("That didn't work. Please try again.");
    }
  };
  const db = async () => (await (window as unknown as { claude: { use(n: string): Promise<unknown> } }).claude.use("db")) as Db;
  const ban = (uid: string, name: string) => {
    if (!window.confirm(`Ban ${name || uid}? They can still play alone, but can't post, chat, appear on the leaderboard or join co-op. Their leaderboard row and chat are removed.`)) return;
    void act(() => adminCall("ban", { uid, ban: true, wipe: true, note: name }), `${name || uid} banned.`);
  };

  return (
    <div className="fixed inset-0 z-[55] overflow-y-auto bg-ink fade-in" role="dialog" aria-label="Owner console">
      <div className="mx-auto max-w-2xl px-4 pb-10 pt-[max(env(safe-area-inset-top),16px)]">
        <div className="flex items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-black">
            <ShieldCheck className="size-6 text-kick" /> Owner console
          </h1>
          <button onClick={onClose} aria-label="Close" className="soft grid size-10 place-items-center rounded-full bg-card active:scale-90">
            <X className="size-4" />
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">Only for you. Players have no link to this page; it opens only with the owner password.</p>

        {!isCloudflareRuntime() ? (
          <p className="mt-6 rounded-2xl bg-card p-4 text-sm">The owner console runs on the Cloudflare version of the game. On claude.ai, use Profile › Advertise › Ad manager.</p>
        ) : owner === null ? (
          <p className="mt-6 text-sm text-muted">Checking…</p>
        ) : !owner ? (
          <OwnerSignIn onDone={() => void load()} />
        ) : (
          <div className="mt-4 space-y-4">
            {note && <p className="rounded-xl bg-kick/10 px-3 py-2 text-xs font-semibold">{note}</p>}

            {/* overview */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ["Players", over?.players ?? "…"],
                ["New today", over?.newToday ?? "…"],
                ["With password", over?.accounts ?? "…"],
                ["Banned", over?.bans.length ?? "…"],
              ].map(([label, v]) => (
                <div key={label as string} className="soft rounded-2xl bg-card px-3 py-3 text-center">
                  <div className="text-xl font-black">{v}</div>
                  <div className="text-[10px] font-semibold text-muted">{label}</div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted">
              Poster images: {over?.media ? "R2 storage ✓" : "inside the database (R2 not set up)"} · Senior Inspector AI: {over?.ask ? "on ✓" : "off (scripted tips)"}
            </p>

            <div className="flex flex-wrap gap-2">
              <button onClick={onAds} className="flex h-10 items-center gap-2 rounded-full bg-fg px-4 text-xs font-bold text-white active:scale-95">
                <Megaphone className="size-4" /> Posters & hunts (Ad manager)
              </button>
              <button onClick={() => void load()} className="flex h-10 items-center gap-2 rounded-full border border-line px-4 text-xs font-bold active:scale-95">
                <RefreshCw className="size-4" /> Refresh
              </button>
            </div>

            <Signups />

            <ResetPassword onDone={(t) => setNote(t)} />

            {/* leaderboard moderation */}
            <section className="soft rounded-2xl bg-card p-3">
              <h3 className="text-sm font-bold">🏆 Leaderboard ({board.length})</h3>
              <p className="text-[11px] text-muted">Remove cheaters or rude names. Removing a row only clears it; ban to stop them posting again.</p>
              <ul className="mt-2 max-h-72 divide-y divide-line overflow-y-auto text-xs">
                {board.map((r) => (
                  <li key={r.id} className="flex items-center gap-2 py-1.5">
                    <span className="min-w-0 flex-1 truncate font-semibold">{r.name || "(no name)"}</span>
                    <span className="tabular-nums text-muted">{money(r.balance)} · {Math.round(r.xp)} XP</span>
                    <button onClick={() => void act(async () => (await db()).doc(`board/${r.id}`).delete(), `Removed ${r.name}'s row.`)} aria-label={`Remove ${r.name}`} className="grid size-8 place-items-center rounded-full bg-raise active:scale-90">
                      <Trash2 className="size-3.5" />
                    </button>
                    <button onClick={() => ban(r.id, r.name)} aria-label={`Ban ${r.name}`} className="grid size-8 place-items-center rounded-full bg-danger/10 text-danger active:scale-90">
                      <Ban className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {/* chat moderation */}
            <section className="soft rounded-2xl bg-card p-3">
              <h3 className="text-sm font-bold">💬 Detectives&apos; Line ({chat.length} players)</h3>
              <ul className="mt-2 max-h-72 divide-y divide-line overflow-y-auto text-xs">
                {chat.map((c) => (
                  <li key={c.id} className="flex items-center gap-2 py-1.5">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">
                        {c.name || "(no name)"} <span className="font-normal text-muted">· {c.count} messages</span>
                      </span>
                      <span className="block truncate text-muted">{c.last}</span>
                    </span>
                    <button onClick={() => void act(async () => (await db()).doc(`chat/${c.id}`).delete(), `Cleared ${c.name}'s messages.`)} aria-label={`Clear ${c.name}'s messages`} className="grid size-8 place-items-center rounded-full bg-raise active:scale-90">
                      <Trash2 className="size-3.5" />
                    </button>
                    <button onClick={() => ban(c.id, c.name)} aria-label={`Ban ${c.name}`} className="grid size-8 place-items-center rounded-full bg-danger/10 text-danger active:scale-90">
                      <Ban className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {/* bans */}
            <section className="soft rounded-2xl bg-card p-3">
              <h3 className="text-sm font-bold">⛔ Banned ({over?.bans.length ?? 0})</h3>
              {!over?.bans.length ? (
                <p className="mt-1 text-xs text-muted">Nobody is banned.</p>
              ) : (
                <ul className="mt-2 divide-y divide-line text-xs">
                  {over.bans.map((b) => (
                    <li key={b.uid} className="flex items-center gap-2 py-1.5">
                      <span className="min-w-0 flex-1 truncate">
                        <b>{b.note || b.uid}</b> <span className="text-muted">· {new Date(b.at).toLocaleDateString()}</span>
                      </span>
                      <button onClick={() => void act(() => adminCall("ban", { uid: b.uid, ban: false }), "Unbanned.")} className="h-8 rounded-full border border-line px-3 font-bold active:scale-95">
                        Unban
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-[10px] text-muted">Players are anonymous, so a banned player could start over by clearing their browser. Bans stop the casual troublemaker.</p>
            </section>

            {/* test tools */}
            <section className="soft rounded-2xl bg-card p-3">
              <h3 className="flex items-center gap-1.5 text-sm font-bold">
                <Wrench className="size-4" /> My test tools
              </h3>
              <p className="text-[11px] text-muted">For trying out modes, ranks and unlocks on your own detective. They change your leaderboard row too.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(
                  [
                    ["+₦1M", 1_000_000, 0],
                    ["+₦10M", 10_000_000, 0],
                    ["+100 XP", 0, 100],
                    ["Jump to General", 0, 1500],
                  ] as [string, number, number][]
                ).map(([label, m, x]) => (
                  <button
                    key={label}
                    onClick={() => {
                      onGrant(m, x);
                      sfx.success();
                      setNote(`${label} added to your detective.`);
                    }}
                    className="h-9 rounded-full bg-kick px-3.5 text-xs font-black text-ink active:scale-95"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </section>

            <button
              onClick={() => {
                setAdminKey(null);
                resetAdStore();
                setOwner(false);
                sfx.tap();
              }}
              className="flex h-10 items-center gap-2 rounded-full border border-line px-4 text-xs font-bold active:scale-95"
            >
              <LogOut className="size-4" /> Sign out of owner on this device
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** "Forgot password?": the owner sets a temporary password for a player's email. */
function ResetPassword({ onDone }: { onDone: (note: string) => void }) {
  const [email, setEmail] = useState("");
  const [temp, setTemp] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const make = () => {
    const words = ["lagos", "kano", "suya", "danfo", "jollof", "okada", "agege", "zobo", "keke", "gele", "amala", "puff"];
    const pick = () => words[crypto.getRandomValues(new Uint32Array(1))[0] % words.length];
    setTemp(`${pick()}-${pick()}-${1000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 9000)}`);
  };
  return (
    <section className="soft rounded-2xl bg-card p-3">
      <h3 className="text-sm font-bold">🔑 Reset a player&apos;s password</h3>
      <p className="text-[11px] text-muted">For players who forgot theirs. Set a temporary password, send it to them privately, and tell them to change it in Profile. Their other devices are signed out.</p>
      <form
        className="mt-2 flex flex-col gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErr("");
          try {
            await adminCall("reset-password", { email: email.trim().toLowerCase(), password: temp });
            onDone(`Password reset for ${email.trim().toLowerCase()}. Send them the temporary password: ${temp}`);
            setEmail("");
            setTemp("");
          } catch (e2) {
            setErr((e2 as { code?: string }).code === "not_found" ? "No account with that email." : "Couldn't reset. Check the email and use 8+ characters.");
          }
          setBusy(false);
        }}
      >
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Player's email" className="h-10 rounded-xl bg-raise px-3 text-sm focus:outline-none" aria-label="Player's email" />
        <div className="flex gap-2">
          <input value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="Temporary password (8+)" className="h-10 min-w-0 flex-1 rounded-xl bg-raise px-3 font-mono text-sm focus:outline-none" aria-label="Temporary password" />
          <button type="button" onClick={make} className="h-10 rounded-xl border border-line px-3 text-xs font-bold">
            Make one
          </button>
        </div>
        {err && <p className="text-xs font-semibold text-danger">{err}</p>}
        <button disabled={busy || !email || temp.length < 8} className="h-10 rounded-full bg-fg text-xs font-bold text-white disabled:opacity-50">
          {busy ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </section>
  );
}
