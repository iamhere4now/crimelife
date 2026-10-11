/**
 * Cloud save for the published claude.ai artifact: mirrors progress to the
 * player's private `data/users/<id>/save` document so it follows them between
 * phone and desktop. Everywhere else (the Next.js dev app, a saved copy of the
 * page) `window.claude` is missing and every call here quietly does nothing.
 */

type DocRef = {
  get(): Promise<{ exists: boolean; data(): Record<string, unknown> | undefined }>;
  set(data: Record<string, unknown>): Promise<void>;
};

type ClaudeRuntime = {
  use(name: "db"): Promise<{ doc(path: string): DocRef } | null>;
  use(name: "user"): Promise<{ id(): Promise<string | null> } | null>;
};

export interface CloudSave {
  savedAt: number;
  state: unknown;
}

let refPromise: Promise<DocRef | null> | null = null;

function saveDoc(): Promise<DocRef | null> {
  refPromise ??= (async () => {
    const claude = (window as unknown as { claude?: ClaudeRuntime }).claude;
    if (!claude?.use) return null;
    const [db, user] = await Promise.all([claude.use("db"), claude.use("user")]);
    if (!db || !user) return null;
    const id = await user.id();
    return id ? db.doc(`data/users/${id}/save`) : null;
  })().catch(() => null);
  return refPromise;
}

export async function readCloudSave(): Promise<CloudSave | null> {
  try {
    const ref = await saveDoc();
    if (!ref) return null;
    const snap = await ref.get();
    const data = snap.exists ? snap.data() : undefined;
    if (!data || typeof data.savedAt !== "number" || typeof data.state !== "object") return null;
    return { savedAt: data.savedAt, state: data.state };
  } catch {
    return null;
  }
}

// One write at a time; a newer save replaces any write still waiting.
let writing = false;
let pending: CloudSave | null = null;

export async function writeCloudSave(save: CloudSave): Promise<void> {
  pending = save;
  if (writing) return;
  writing = true;
  try {
    const ref = await saveDoc();
    while (ref && pending) {
      const next = pending;
      pending = null;
      try {
        await ref.set({ savedAt: next.savedAt, state: next.state as Record<string, unknown> });
      } catch {
        // Offline or not allowed to write: the local copy still has it.
      }
    }
  } finally {
    writing = false;
  }
}
