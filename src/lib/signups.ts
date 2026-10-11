/**
 * Sign-up details (full name and email) for the game's owner. Each player's
 * browser keeps one private document, `signups/<player id>`, listing the
 * detectives made on it. Only that player and the owner can read it (see the
 * rules in worker/index.ts). On claude.ai there is no such store, and nothing
 * is sent.
 */

import { isCloudflareRuntime } from "./cfRuntime";

type Snap = { exists: boolean; data(): Record<string, unknown> | undefined; id: string };
type DocRef = { get(): Promise<Snap>; set(d: Record<string, unknown>): Promise<void> };
type Db = { doc(p: string): DocRef; collection(p: string): { get(): Promise<{ docs: Snap[] }> } };
type Runtime = { use(name: string): Promise<unknown> };

export interface Signup {
  fullName: string;
  email: string;
  detective: string;
  at: number;
  /** The player (browser) it came from. */
  player: string;
}

async function runtime() {
  if (!isCloudflareRuntime()) return null;
  const rt = (window as unknown as { claude?: Runtime }).claude;
  if (!rt) return null;
  const [db, user] = (await Promise.all([rt.use("db"), rt.use("user")])) as [Db | null, { id(): Promise<string | null> } | null];
  const id = user ? await user.id() : null;
  return db && id ? { db, id } : null;
}

const str = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "");

/** Send a new sign-up to the owner's list (best effort: the game works without it). */
export async function saveSignup(s: { fullName: string; email: string; detective: string }) {
  try {
    const r = await runtime();
    if (!r) return;
    const ref = r.db.doc(`signups/${r.id}`);
    const cur = await ref.get();
    const people = Array.isArray(cur.data()?.people) ? (cur.data()!.people as unknown[]) : [];
    const entry = { fullName: s.fullName.slice(0, 80), email: s.email.slice(0, 120), detective: s.detective.slice(0, 24), at: Date.now() };
    await ref.set({ people: [...people, entry].slice(-10), updatedAt: Date.now() });
  } catch {
    // try again next sign-up; nothing else depends on it
  }
}

/** The owner's list of everyone who signed up, newest first. */
export async function listSignups(): Promise<Signup[] | null> {
  const r = await runtime();
  if (!r) return null;
  const all = await r.db.collection("signups").get();
  const out: Signup[] = [];
  for (const d of all.docs) {
    const people = d.data()?.people;
    if (!Array.isArray(people)) continue;
    for (const p of people as Record<string, unknown>[]) {
      const email = str(p?.email, 120);
      if (!email) continue;
      out.push({ fullName: str(p.fullName, 80), email, detective: str(p.detective, 24), at: typeof p.at === "number" ? p.at : 0, player: d.id });
    }
  }
  return out.sort((a, b) => b.at - a.at);
}

/** The list as a CSV file, for a spreadsheet or a mailing tool. */
export function signupsCsv(list: Signup[]) {
  const cell = (v: string) => `"${v.replace(/"/g, '""').replace(/^([=+\-@])/, "'$1")}"`;
  const rows = [["Full name", "Email", "Detective name", "Signed up"], ...list.map((s) => [s.fullName, s.email, s.detective, s.at ? new Date(s.at).toISOString() : ""])];
  return rows.map((r) => r.map(cell).join(",")).join("\r\n");
}
