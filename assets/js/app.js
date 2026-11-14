// Entry point for the single-page portfolio on the avatar branch.
import { initMode } from "./mode.js";
import { initTorch } from "./torch.js";
import { initTactile, initHeader, initActions } from "./ui.js";
import { initAvatars } from "./avatar.js";
import { initKeyboard } from "./keyboard.js";
import { initPeeker } from "./peeker.js";
import { initBugs } from "./bug.js";

initMode();
initTactile();
initHeader();
initActions();
initAvatars();
initKeyboard();
initTorch();

const runIdle = window.requestIdleCallback || ((fn) => setTimeout(fn, 80));
runIdle(() => {
  initPeeker();
  initBugs();
});
