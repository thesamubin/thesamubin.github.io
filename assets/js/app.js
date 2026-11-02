// Entry point shared across all pages.
import { initTactile, initHeader, initSwitches, initPalette } from "./ui.js";
import { initKeypad } from "./keypad.js";
import { initLabs } from "./lab.js";
import { initBugs } from "./bug.js";

initTactile();
initHeader();
initSwitches();
initPalette();
initKeypad();
initLabs();

// Lazy-init the perched bug mascot right after first paint so LCP is never delayed.
const runIdle = window.requestIdleCallback || ((fn) => setTimeout(fn, 120));
runIdle(() => initBugs());

