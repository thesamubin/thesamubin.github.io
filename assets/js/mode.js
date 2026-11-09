// Dual-Mode ("Morph") state engine: Developer (D1 Aluminium Lab) ⇄ Ethical Hacker (H1 Safelight Darkroom).
// Coordinates localStorage persistence, URL hash deep-linking, header hoodie controls,
// H keyboard shortcut, and the 900ms "Lights Out" choreography.

import { sound } from "./sound.js";

const STORE_KEY = "sam.mode";
const VALID = new Set(["dev", "hack"]);
const listeners = new Set();
let morphTimer = 0;
let blackoutTimer = 0;

export const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

export function getMode() {
  const attr = document.documentElement.getAttribute("data-mode");
  return VALID.has(attr) ? attr : "dev";
}

function readInitialMode() {
  const hash = location.hash.replace("#", "").toLowerCase();
  if (hash === "hack" || hash === "hacker") return "hack";
  if (hash === "dev" || hash === "developer") return "dev";
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (VALID.has(saved)) return saved;
  } catch {}
  return "dev";
}

function syncControls(mode) {
  const isHack = mode === "hack";
  document.documentElement.setAttribute("data-mode", mode);

  // Sync theme-color meta for browser chrome
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute("content", isHack ? "#0B0708" : "#E4E2DD");
  }

  // Sync every mode toggle button (header hoodie switch, hero hoodie button, etc.)
  document.querySelectorAll("[data-mode-toggle]").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(isHack));
    btn.setAttribute(
      "aria-label",
      isHack
        ? "Pull hoodie down — switch to Developer Mode (Aluminium Lab)"
        : "Pull hoodie up — switch to Ethical Hacker Mode (Safelight Darkroom)"
    );
    const labelEl = btn.querySelector("[data-mode-label]");
    if (labelEl) {
      labelEl.textContent = isHack ? "Hood Up · Hacker" : "Hood Down · Dev";
    }
  });

  // Sync mode-segmented buttons if any ([data-mode-set="dev"|"hack"])
  document.querySelectorAll("[data-mode-set]").forEach((btn) => {
    const active = btn.dataset.modeSet === mode;
    btn.setAttribute("aria-pressed", String(active));
  });
}

export function setMode(next, { animate = true, silent = false, updateHash = false } = {}) {
  const target = VALID.has(next) ? next : "dev";
  const prev = getMode();
  if (target === prev) {
    syncControls(target);
    return target;
  }

  const toHack = target === "hack";
  try {
    localStorage.setItem(STORE_KEY, target);
  } catch {}

  if (updateHash && (location.hash === "#hack" || location.hash === "#dev" || location.hash === "#hacker")) {
    history.replaceState(null, "", `#${target}`);
  }

  if (!silent) {
    sound.play("breaker", toHack);
  }

  const root = document.documentElement;
  clearTimeout(morphTimer);
  clearTimeout(blackoutTimer);

  if (animate && !reduceMotion) {
    root.classList.add("is-morphing");
    if (toHack) {
      root.classList.add("is-blackout");
      blackoutTimer = setTimeout(() => {
        root.classList.remove("is-blackout");
      }, 95);
    }
    morphTimer = setTimeout(() => {
      root.classList.remove("is-morphing", "is-blackout");
    }, 880);
  }

  syncControls(target);

  const detail = { mode: target, previous: prev, toHack, animate: animate && !reduceMotion };
  listeners.forEach((fn) => fn(detail));
  window.dispatchEvent(new CustomEvent("sam:modechange", { detail }));
  return target;
}

export function toggleMode(opts = {}) {
  return setMode(getMode() === "hack" ? "dev" : "hack", opts);
}

export function onModeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function initMode() {
  const initial = readInitialMode();
  syncControls(initial);

  document.addEventListener("click", (e) => {
    const toggleBtn = e.target.closest("[data-mode-toggle]");
    if (toggleBtn) {
      e.preventDefault();
      toggleMode({ animate: true });
      return;
    }
    const setBtn = e.target.closest("[data-mode-set]");
    if (setBtn) {
      e.preventDefault();
      const targetMode = setBtn.dataset.modeSet;
      if (targetMode === getMode()) {
        sound.play("down");
        setTimeout(() => sound.play("up"), 70);
      } else {
        setMode(targetMode, { animate: true });
      }
    }
  });

  // H key toggles the hoodie / mode when not typing in an input
  document.addEventListener("keydown", (e) => {
    if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;
    if (e.key.toLowerCase() === "h") {
      // Wait briefly if the user is mid-way through typing "samubin" (no 'h' in samubin, so safe!)
      toggleMode({ animate: true });
    }
  });

  window.addEventListener("hashchange", () => {
    const h = location.hash.replace("#", "").toLowerCase();
    if (h === "hack" || h === "hacker") setMode("hack", { animate: true });
    else if (h === "dev" || h === "developer") setMode("dev", { animate: true });
  });
}
