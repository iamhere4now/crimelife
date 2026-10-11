import { createRoot } from "react-dom/client";
import { installCloudflareRuntime } from "../src/lib/cfRuntime";
import Home from "../src/app/page";

// The Cloudflare build: the same game, with its online features (database, poster
// storage, live rooms, the Senior Inspector) on the owner's Worker (worker/index.ts).
installCloudflareRuntime();
createRoot(document.getElementById("root")!).render(<Home />);
