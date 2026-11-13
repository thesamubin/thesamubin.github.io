// Global mechanical keyboard acoustics + "samubin" full-page cipher scramble easter egg.
// Pressing any key on the site plays the active switch sound (Thock / Clicky / Synth),
// animates matching S-A-M-U-B-I-N caps on the hanging keypad, pulses avatar typing,
// and typing "samubin" in sequence scrambles and decrypts all visible text on the page.

import { sound } from "./sound.js";
import { reduceMotion } from "./mode.js";
import { notifyAvatarKeystroke, celebrateAvatars } from "./avatar.js";
import { flashKeypadAuth, pressKeypadLetter } from "./keypad.js";

const GLYPHS = "0123456789abcdef";
const running = new WeakSet();

export function crypt(el, { hold = 320, dur = 820 } = {}) {
  if (!el || running.has(el) || reduceMotion) return Promise.resolve();
  running.add(el);
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    if (walker.currentNode.nodeValue.trim()) {
      nodes.push([walker.currentNode, walker.currentNode.nodeValue]);
    }
  }
  const total = nodes.reduce((n, [, t]) => n + t.length, 0) || 1;
  el.setAttribute("aria-busy", "true");
  el.classList.add("is-crypt");
  const t0 = performance.now();

  return new Promise((resolve) => {
    const frame = (now) => {
      const p = Math.max(0, (now - t0 - hold) / dur);
      let idx = 0;
      for (const [node, text] of nodes) {
        let out = "";
        for (const ch of text) {
          const revealed = idx / total < p;
          out += ch === " " || ch === "\n" || revealed ? ch : GLYPHS[(Math.random() * 16) | 0];
          idx++;
        }
        node.nodeValue = out;
      }
      if (p >= 0.35) el.classList.remove("is-crypt");
      if (p < 1) requestAnimationFrame(frame);
      else {
        nodes.forEach(([node, text]) => (node.nodeValue = text));
        el.classList.remove("is-crypt");
        el.removeAttribute("aria-busy");
        running.delete(el);
        resolve();
      }
    };
    requestAnimationFrame(frame);
  });
}

export function triggerSamubinCipher() {
  sound.play("whoosh");
  setTimeout(() => sound.play("auth"), 90);
  flashKeypadAuth(3200);
  celebrateAvatars("SAMUBIN cipher verified — decrypting page!");

  // Scramble all visible headings, paragraphs, and key labels on the page, then decrypt back
  const targets = [
    ...document.querySelectorAll(
      "main h1, main h2, main h3, main .hero-lead, main .section-sub, main .index-title"
    ),
  ].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.bottom > -120 && r.top < innerHeight + 120;
  });

  targets.forEach((el, i) => {
    setTimeout(() => crypt(el, { hold: 240, dur: 760 }), i * 55);
  });

  // Unlock secret contact cipher card if on /contact/
  const secretCard = document.querySelector("[data-cipher-unlock]");
  if (secretCard) {
    secretCard.hidden = false;
    secretCard.classList.add("is-unlocked");
  }
}

export function initKeyboard() {
  let buffer = "";

  document.addEventListener("keydown", (e) => {
    if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    const typingInField = e.target.closest?.("input, textarea, select, [contenteditable]");
    if (typingInField) return;

    // Play global mechanical switch thock for every key press
    sound.play("down");
    notifyAvatarKeystroke();

    const k = e.key.toLowerCase();
    if ("samubin".includes(k) && k.length === 1) {
      pressKeypadLetter(k);
    }

    if (k.length === 1 && k >= "a" && k <= "z") {
      buffer = (buffer + k).slice(-14);
      if (buffer.endsWith("samubin")) {
        buffer = "";
        triggerSamubinCipher();
      }
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;
    sound.play("up");
  });
}
