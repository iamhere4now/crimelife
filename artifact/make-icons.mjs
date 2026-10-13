// Makes the home-screen icons from artifact/icon.svg into cloudflare/icons/.
// Run once after changing the icon (the PNGs are committed):
//
//   node artifact/make-icons.mjs

import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(resolve(root, "artifact/icon.svg"));
const out = resolve(root, "cloudflare/icons");
mkdirSync(out, { recursive: true });

for (const [name, size] of [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["apple-touch-icon.png", 180],
  ["favicon-32.png", 32],
]) {
  await sharp(svg, { density: 300 }).resize(size, size).png().toFile(resolve(out, name));
  console.log("wrote", name);
}

// the small monochrome badge Android shows in the status bar: the glass only, white on clear
const badge = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><circle cx="40" cy="40" r="22" fill="none" stroke="#fff" stroke-width="9"/><path d="M57 57 L78 78" stroke="#fff" stroke-width="12" stroke-linecap="round"/></svg>`,
);
await sharp(badge, { density: 300 }).resize(96, 96).png().toFile(resolve(out, "badge-96.png"));
console.log("wrote badge-96.png");
