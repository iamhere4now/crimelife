import { createRoot } from "react-dom/client";
import { installCloudflareRuntime } from "../src/lib/cfRuntime";
import { initPwa } from "../src/lib/pwa";
import Home from "../src/app/page";

// The Cloudflare build: the same game, with its online features (database, poster
// storage, live rooms, the Senior Inspector) on the owner's Worker (worker/index.ts),
// and installable on the home screen with reminders (src/lib/pwa.ts, cloudflare/sw.js).
installCloudflareRuntime();
initPwa();
createRoot(document.getElementById("root")!).render(<Home />);
