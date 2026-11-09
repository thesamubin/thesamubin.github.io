// Shared UI controls: header scroll state, sound mute & switch profile selectors,
// tactile button feedback, toast status bar, copy-email action, and contact composer.

import { sound } from "./sound.js";
import { getMode } from "./mode.js";

const TACTILE = ".key, .tool, .chip, .seg button, .dock-btn";

export function initTactile() {
  document.addEventListener("pointerdown", (e) => {
    const el = e.target.closest(TACTILE);
    if (!el) return;
    // Keydown listener handles physical keyboard sounds; pointerdown handles clicks
    sound.play(el.matches(".chip, .seg button") ? "click" : "down");
  });
  document.addEventListener("pointerup", (e) => {
    if (e.target.closest(".key, .tool, .dock-btn")) sound.play("up");
  });
}

export function initHeader() {
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-stuck", scrollY > 8);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
  }

  // Mute / unmute button
  const muteBtns = document.querySelectorAll("[data-sound-toggle]");
  const syncMute = (on) => {
    muteBtns.forEach((btn) => {
      btn.setAttribute("aria-pressed", String(on));
      btn.setAttribute("aria-label", on ? "Mute keyboard and UI sound" : "Turn keyboard and UI sound on");
    });
  };
  syncMute(sound.enabled);
  sound.onChange(syncMute);
  muteBtns.forEach((btn) => {
    btn.addEventListener("click", () => sound.toggle());
  });

  // Switch profile selector (Thock / Clicky / Synth)
  const profBtns = document.querySelectorAll("[data-switch-profile]");
  const syncProf = (prof) => {
    profBtns.forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.switchProfile === prof));
    });
  };
  syncProf(sound.profile);
  sound.onProfileChange(syncProf);
  profBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      sound.setProfile(btn.dataset.switchProfile);
    });
  });
}

let toastEl = null;
let toastTimer = 0;

export function toast(msg, { ms = 2800 } = {}) {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.className = "toast";
    toastEl.setAttribute("role", "status");
    toastEl.setAttribute("aria-live", "polite");
    toastEl.innerHTML = '<span class="dot" aria-hidden="true"></span><span class="msg"></span>';
    document.body.append(toastEl);
  }
  toastEl.querySelector(".msg").textContent = msg;
  requestAnimationFrame(() => toastEl.classList.add("is-on"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), ms);
}

export function initActions() {
  // Copy email buttons
  document.querySelectorAll("[data-copy-email]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const email = btn.dataset.copyEmail || "hello@samubin.com";
      try {
        await navigator.clipboard.writeText(email);
      } catch {}
      sound.play("auth");
      toast(`Copied ${email} to clipboard.`);
    });
  });

  // Contact form mailto composer
  const form = document.querySelector("[data-contact-form]");
  if (form) {
    const scopeBtns = form.querySelectorAll("[data-scope-chip]");
    let selectedScope = "Full-Stack / AI Project";

    scopeBtns.forEach((chip) => {
      chip.addEventListener("click", () => {
        selectedScope = chip.dataset.scopeChip;
        scopeBtns.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.querySelector('[name="name"]')?.value?.trim() || "Visitor";
      const from = form.querySelector('[name="email"]')?.value?.trim() || "";
      const message = form.querySelector('[name="message"]')?.value?.trim() || "";
      const modeTag = getMode() === "hack" ? "[Security / Red-Team Inquiry]" : "[Engineering / AI Inquiry]";
      const subject = encodeURIComponent(`${modeTag} ${selectedScope} — from ${name}`);
      const body = encodeURIComponent(
        `Name: ${name}${from ? `\nReply-To: ${from}` : ""}\nScope: ${selectedScope}\n\n${message}`
      );
      sound.play("auth");
      location.href = `mailto:hello@samubin.com?subject=${subject}&body=${body}`;
    });
  }
}
