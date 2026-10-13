// Builds the standalone page for static hosting (Cloudflare Pages / Workers static assets):
//
//   npm run build:cloudflare        -> cloudflare/index.html
//
// It is the single-file game with its online features pointed at the Worker
// (worker/index.ts), plus what a page needs on its own: a doctype and a phone
// viewport (claude.ai adds those around artifacts).

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const raw = resolve(root, "artifact/out/standalone-raw.html");
const out = resolve(root, "cloudflare/index.html");

execFileSync(process.execPath, [resolve(root, "artifact/build.mjs"), raw], { stdio: "inherit", env: { ...process.env, ND_ENTRY: "artifact/main-cloudflare.tsx" } });

const body = readFileSync(raw, "utf8").replace(/^<meta charset="utf-8">\s*/i, "");
const head = [
  "<!doctype html>",
  '<html lang="en">',
  "<head>",
  '<meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
  '<meta name="theme-color" content="#e4e6ea">',
  // install on the home screen (the manifest, icons and sw.js sit next to the page)
  '<link rel="manifest" href="/manifest.webmanifest">',
  '<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png">',
  '<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-title" content="Naija Detective">',
  "",
].join("\n");

mkdirSync(dirname(out), { recursive: true });
const page = head + body + "\n</html>\n";
writeFileSync(out, page);

// the service worker, stamped with this build so phones pick up the new version
const build = createHash("sha256").update(page).digest("hex").slice(0, 12);
writeFileSync(resolve(root, "cloudflare/sw.js"), readFileSync(resolve(root, "artifact/sw.js"), "utf8").replace("__BUILD__", build));
console.log(`Wrote ${out} (${Math.round((head.length + body.length) / 1024)} KB)`);
