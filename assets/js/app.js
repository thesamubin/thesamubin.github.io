// Entry point shared across all pages of the Dual-Mode ("Morph") Portfolio.
import { initMode } from "./mode.js";
import { initTorch } from "./torch.js";
import { initTactile, initHeader, initActions } from "./ui.js";
import { initAvatars } from "./avatar.js";
import { initKeypad } from "./keypad.js";
import { initLoadout } from "./loadout.js";
import { initKeyboard } from "./keyboard.js";
import { initPeeker } from "./peeker.js";

initMode();
initTactile();
initHeader();
initActions();
initAvatars();
initKeypad();
initLoadout();
initKeyboard();
initTorch();

const runIdle = window.requestIdleCallback || ((fn) => setTimeout(fn, 80));
runIdle(() => initPeeker());
