/**
 * The game as a home-screen app (Cloudflare build only): the service worker
 * (cloudflare/sw.js), the "Add to home screen" prompt, and reminders by push.
 */

import { apiCall, isCloudflareRuntime } from "./cfRuntime";

type InstallPrompt = Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

let deferred: InstallPrompt | null = null;
let justInstalled = false;
const listeners = new Set<() => void>();
const changed = () => listeners.forEach((l) => l());

/** Start the service worker and listen for the browser's install offer. Call once at start. */
export function initPwa() {
  if (!isCloudflareRuntime() || typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => void navigator.serviceWorker.register("/sw.js").catch(() => undefined));
  window.addEventListener("beforeinstallprompt", (e) => {
    // keep it for our own button instead of the browser's mini-bar
    e.preventDefault();
    deferred = e as InstallPrompt;
    changed();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    justInstalled = true;
    changed();
  });
}

export function onPwaChange(fn: () => void) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}

export const isStandalone = () =>
  typeof window !== "undefined" && (window.matchMedia?.("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);

export const isIOS = () =>
  typeof navigator !== "undefined" && (/iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

/**
 * "installed": running from the home screen (or just added)
 * "prompt": the browser offers an install we can trigger
 * "ios": Safari, where it's Share › Add to Home Screen
 * "none": not here (claude.ai, or a browser that can't)
 */
export function installState(): "installed" | "prompt" | "ios" | "none" {
  if (!isCloudflareRuntime()) return "none";
  if (isStandalone() || justInstalled) return "installed";
  if (deferred) return "prompt";
  if (isIOS()) return "ios";
  return "none";
}

export async function promptInstall(): Promise<boolean> {
  const p = deferred;
  if (!p) return false;
  deferred = null;
  await p.prompt();
  const { outcome } = await p.userChoice;
  if (outcome === "accepted") justInstalled = true;
  changed();
  return outcome === "accepted";
}

/* ---------------------------------------------------------------- reminders */

/**
 * "ok": can turn reminders on here
 * "install-first": iPhone/iPad, where pushes only work from the home-screen app
 * "none": this browser can't
 */
export function pushSupport(): "ok" | "install-first" | "none" {
  if (!isCloudflareRuntime() || typeof window === "undefined") return "none";
  const has = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  if (isIOS() && !isStandalone()) return "install-first";
  return has ? "ok" : "none";
}

const registration = () => navigator.serviceWorker.ready;

export async function remindersOn(): Promise<boolean> {
  if (pushSupport() !== "ok" || Notification.permission !== "granted") return false;
  try {
    return !!(await (await registration()).pushManager.getSubscription());
  } catch {
    return false;
  }
}

function keyBytes(b64url: string) {
  const b64 = (b64url + "===".slice((b64url.length + 3) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

/** Ask for permission and subscribe this device. */
export async function enableReminders(): Promise<"on" | "denied" | "failed"> {
  if (pushSupport() !== "ok") return "failed";
  try {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return "denied";
    const reg = await registration();
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const { key } = (await (await fetch("/api/push/key")).json()) as { key: string };
      sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(key) });
    }
    await apiCall("/api/push/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) });
    return "on";
  } catch (e) {
    console.warn("[reminders]", e);
    return "failed";
  }
}

export async function disableReminders() {
  try {
    const sub = await (await registration()).pushManager.getSubscription();
    if (!sub) return;
    await apiCall("/api/push/unsubscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) }).catch(() => undefined);
    await sub.unsubscribe();
  } catch {
    // already off
  }
}
