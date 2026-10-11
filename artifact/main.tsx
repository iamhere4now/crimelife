import { createRoot } from "react-dom/client";
import Home from "../src/app/page";

// The claude.ai artifact build: the same game, mounted without Next.js.
createRoot(document.getElementById("root")!).render(<Home />);
