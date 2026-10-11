"use client";

import { CircleCheckBig, Info, ShieldAlert } from "lucide-react";
import { useEffect } from "react";

export interface ToastMessage {
  id: number;
  text: string;
  tone: "good" | "bad" | "info";
}

export function Toast({ toast, onDone }: { toast: ToastMessage | null; onDone: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onDone, 2600);
    return () => window.clearTimeout(t);
  }, [toast, onDone]);

  if (!toast) return null;
  const Icon = toast.tone === "good" ? CircleCheckBig : toast.tone === "bad" ? ShieldAlert : Info;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[max(env(safe-area-inset-top),12px)] z-[80] mx-auto flex max-w-md justify-center px-4 lg:pl-[248px] lg:max-w-none">
      <div
        key={toast.id}
        role="status"
        className={`pop-in flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold shadow-2xl backdrop-blur ${
          toast.tone === "good"
            ? "border-kick bg-ink/95 text-kick"
            : toast.tone === "bad"
              ? "border-danger bg-ink/95 text-danger"
              : "border-line bg-card/95 text-fg"
        }`}
      >
        <Icon className="size-4 shrink-0" />
        {toast.text}
      </div>
    </div>
  );
}
