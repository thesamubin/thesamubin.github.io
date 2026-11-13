// H1 Safelight Darkroom torch controller (CSS custom properties).
// Zero canvas overhead: updates --torch-x / --torch-y on <html> for the red safelight cursor glow.

import { reduceMotion } from "./mode.js";

export function initTorch() {
  const root = document.documentElement;
  let raf = 0;
  let clientX = window.innerWidth * 0.5;
  let clientY = window.innerHeight * 0.36;

  function updateTorch() {
    raf = 0;
    root.style.setProperty("--torch-x", `${clientX.toFixed(1)}px`);
    root.style.setProperty("--torch-y", `${clientY.toFixed(1)}px`);
  }

  addEventListener(
    "pointermove",
    (e) => {
      if (reduceMotion) return;
      clientX = e.clientX;
      clientY = e.clientY;
      if (!raf) raf = requestAnimationFrame(updateTorch);
    },
    { passive: true }
  );

  updateTorch();
}
