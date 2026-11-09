// H1 Safelight Darkroom torch controller (CSS custom properties + proximity note reveal).
// Zero canvas overhead: updates --torch-x / --torch-y on <html> and illuminates
// [data-darkroom-note] elements when the red safelight beam passes over them.

import { getMode, onModeChange, reduceMotion } from "./mode.js";

export function initTorch() {
  const root = document.documentElement;
  let raf = 0;
  let clientX = window.innerWidth * 0.5;
  let clientY = window.innerHeight * 0.36;
  let notes = [];

  function collectNotes() {
    notes = [...document.querySelectorAll("[data-darkroom-note]")];
  }

  function updateTorch() {
    raf = 0;
    root.style.setProperty("--torch-x", `${clientX.toFixed(1)}px`);
    root.style.setProperty("--torch-y", `${clientY.toFixed(1)}px`);

    if (getMode() !== "hack") return;

    for (const el of notes) {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width * 0.5;
      const cy = r.top + r.height * 0.5;
      const dist = Math.hypot(clientX - cx, clientY - cy);
      const lit = dist < 280;
      el.classList.toggle("is-developed", lit);
    }
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

  onModeChange(({ toHack }) => {
    collectNotes();
    if (toHack) {
      updateTorch();
    } else {
      notes.forEach((n) => n.classList.remove("is-developed"));
    }
  });

  collectNotes();
  updateTorch();
}
