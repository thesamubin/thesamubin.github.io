// Shared ES Module entry point across all pages.
import { initTactile, initHeader, initPalette } from "./ui.js";
import { initAvatars } from "./avatar.js";
import { initPlaygrounds } from "./playground.js";
import { initBugs } from "./bug.js";

initTactile();
initHeader();
initAvatars();
initPlaygrounds();
initPalette();

// Lazy-init the funny perched bug mascot right after first paint so LCP stays instant.
const runIdle = window.requestIdleCallback || ((fn) => setTimeout(fn, 120));
runIdle(() => initBugs());
