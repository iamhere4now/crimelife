// Naija Detective's service worker (copied to cloudflare/sw.js by `npm run build:cloudflare`).
//
//  - the game opens from the home screen even with no network: the page is fetched
//    fresh when online (a quick "not changed" check most of the time) and the last
//    copy is kept for offline
//  - reminders: a push arrives with no message, so ask the Worker what to show
//
// The API (/api/...) is never cached.

const VERSION = "de32a8d484ea";
const CACHE = `nd-${VERSION}`;
const SHELL = ["/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/badge-96.png"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => undefined));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  // the game page: network first, the saved copy when offline
  if (req.mode === "navigate") {
    e.respondWith(
      (async () => {
        try {
          const r = await fetch("/", { cache: "no-cache", credentials: "same-origin" });
          if (r.ok) {
            const copy = r.clone();
            e.waitUntil(caches.open(CACHE).then((c) => c.put("/", copy)));
          }
          return r;
        } catch {
          return (await caches.match("/")) ?? Response.error();
        }
      })(),
    );
    return;
  }

  // icons and poster pictures don't change: the saved copy first
  if (url.pathname.startsWith("/icons/") || url.pathname.startsWith("/media/")) {
    e.respondWith(
      (async () => {
        const hit = await caches.match(req);
        if (hit) return hit;
        const r = await fetch(req);
        if (r.ok) {
          const copy = r.clone();
          e.waitUntil(caches.open(CACHE).then((c) => c.put(req, copy)));
        }
        return r;
      })(),
    );
  }
});

self.addEventListener("push", (e) => {
  e.waitUntil(
    (async () => {
      let msg = { title: "Naija Detective", body: "New cases are waiting for you, Detective." };
      try {
        const r = await fetch("/api/push/latest", { cache: "no-store" });
        if (r.ok) {
          const j = await r.json();
          if (j && typeof j.title === "string" && typeof j.body === "string") msg = j;
        }
      } catch {
        // offline for a moment: the general reminder
      }
      await self.registration.showNotification(msg.title, {
        body: msg.body,
        icon: "/icons/icon-192.png",
        badge: "/icons/badge-96.png",
        tag: "naija-detective",
        data: { url: "/?source=reminder" },
      });
    })(),
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    (async () => {
      const open = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const c of open) if ("focus" in c) return c.focus();
      return self.clients.openWindow(e.notification.data?.url ?? "/");
    })(),
  );
});
