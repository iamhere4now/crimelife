// Builds the standalone page for static hosting (Cloudflare Pages / Workers static assets):
//
//   npm run build:cloudflare        -> cloudflare/index.html
//
// It is the claude.ai single-file build plus what a page needs on its own:
// a doctype and a phone viewport (claude.ai adds those around artifacts).

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const raw = resolve(root, "artifact/out/standalone-raw.html");
const out = resolve(root, "cloudflare/index.html");

execFileSync(process.execPath, [resolve(root, "artifact/build.mjs"), raw], { stdio: "inherit" });

const body = readFileSync(raw, "utf8").replace(/^<meta charset="utf-8">\s*/i, "");
const head = [
  "<!doctype html>",
  '<html lang="en">',
  "<head>",
  '<meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
  '<meta name="theme-color" content="#e4e6ea">',
  "",
].join("\n");

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, head + body + "\n</html>\n");
console.log(`Wrote ${out} (${Math.round((head.length + body.length) / 1024)} KB)`);
