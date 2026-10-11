// Builds the game as one self-contained HTML page for a claude.ai artifact.
//
//   node artifact/build.mjs [out.html]
//
// React and ReactDOM load from cdnjs as UMD globals (the artifact CSP allows
// it); everything else — the game code, icons and Tailwind CSS — is inlined.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwind from "@tailwindcss/postcss";
import { build } from "esbuild";
import postcss from "postcss";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(process.argv[2] ?? resolve(root, "artifact/out/naija-detective.html"));

const REACT_VERSION = "18.3.1";

// Map the React imports onto the UMD globals instead of bundling React.
const reactGlobals = {
  name: "react-globals",
  setup(b) {
    const globals = {
      react: "window.React",
      "react-dom": "window.ReactDOM",
      "react-dom/client": "window.ReactDOM",
    };
    b.onResolve({ filter: /^react(-dom(\/client)?)?$/ }, (args) => ({ path: args.path, namespace: "global" }));
    b.onResolve({ filter: /^react\/jsx-(dev-)?runtime$/ }, () => ({ path: "jsx-runtime", namespace: "global" }));
    b.onLoad({ filter: /.*/, namespace: "global" }, (args) =>
      args.path === "jsx-runtime"
        ? {
            contents: `
              const R = window.React;
              const withKey = (props, key) => (key === undefined ? props : { ...props, key });
              export const Fragment = R.Fragment;
              export const jsx = (type, props, key) => R.createElement(type, withKey(props, key));
              export const jsxs = jsx;
              export const jsxDEV = jsx;`,
            loader: "js",
          }
        : { contents: `module.exports = ${globals[args.path]};`, loader: "js" },
    );
  },
};

const js = await build({
  // ND_ENTRY picks another entry (the Cloudflare build uses artifact/main-cloudflare.tsx)
  entryPoints: [resolve(root, process.env.ND_ENTRY ?? "artifact/main.tsx")],
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2020",
  jsx: "automatic",
  write: false,
  logLevel: "warning",
  tsconfig: resolve(root, "tsconfig.json"),
  define: { "process.env.NODE_ENV": '"production"' },
  plugins: [reactGlobals],
});

// Tailwind scans the project for class names, the same as the Next.js build.
const cssSource = readFileSync(resolve(root, "src/app/globals.css"), "utf8");
const css = await postcss([tailwind({ base: root, optimize: { minify: true } })]).process(cssSource, {
  from: resolve(root, "src/app/globals.css"),
});

// Inline <script> content must never contain a closing script tag.
const bundle = js.outputFiles[0].text.replaceAll("</script", "<\\/script");

const html = `<meta charset="utf-8">
<title>Naija Detective</title>
<meta name="description" content="Live crime scenes across Nigeria, from Lagos to Kano, and one big question: who did it?">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300..900&display=swap">
<style>
:root { --font-inter: "Inter"; color-scheme: light; }
html, body { background: #e4e6ea; color: #14161b; }
${css.css}
</style>
<div id="root" class="font-sans antialiased"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/${REACT_VERSION}/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/${REACT_VERSION}/umd/react-dom.production.min.js"></script>
<script>${bundle}</script>
`;

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`Wrote ${out} (${(html.length / 1024).toFixed(0)} KB)`);
