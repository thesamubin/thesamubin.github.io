// Signature "Loadout / Arsenal" custom mechanical keyboard board.
// Features:
// - 6 rows × modifier key + tech keycaps (36 switches total)
// - Scroll-into-view row-by-row switch drop-in
// - OLED telemetry readout bar with typewriter output on key press
// - Left-hand modifier key row isolation filter
// - Real keyboard letter-jump (pressing 'r' cycles React -> Redis -> ...)
// - Row-by-row split-flap X-axis flip wave when morphing Developer ⇄ Ethical Hacker

import { sound } from "./sound.js";
import { getMode, onModeChange, reduceMotion } from "./mode.js";

// Crisp monochrome vector glyphs per category/tech (24x24 viewBox, stroke/fill clean)
const ICONS = {
  // Dev — Languages
  ts: '<path d="M4 4h16v16H4z" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M8 10h5m-2.5 0v6M17.5 11.2c-.5-.6-1.8-.6-2.2.1-.4.7.3 1.3 1.4 1.6 1.1.3 1.6 1 1.2 1.8-.4.8-1.8.8-2.6.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  js: '<path d="M4 4h16v16H4z" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M10.5 10v5.2c0 1.2-1 1.8-2 1.2M17.2 11.2c-.6-.5-1.8-.5-2.1.2-.3.7.4 1.2 1.4 1.5 1 .3 1.5 1 1.1 1.8-.4.8-1.7.8-2.5.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  py: '<path d="M12 3c-3.5 0-4 1.5-4 3.5V9h4v1H6.5C4.5 10 3 11.2 3 14s1.5 4 3.5 4H8v-2.2c0-1.6 1.2-2.8 2.8-2.8h4.4c1.5 0 2.8-1.2 2.8-2.7V6.5C18 4.5 15.5 3 12 3zm0 18c3.5 0 4-1.5 4-3.5V15h-4v-1h5.5c2 0 3.5-1.2 3.5-4s-1.5-4-3.5-4H16v2.2c0 1.6-1.2 2.8-2.8 2.8H8.8C7.3 11 6 12.2 6 13.7v3.8C6 19.5 8.5 21 12 21z" fill="none" stroke="currentColor" stroke-width="1.75"/>',
  go: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.85"/><path d="M9.5 9.8a2.6 2.6 0 1 0 0 4.4h1.8v-2h-1.4M15.2 9.8a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 1 0 0-4.4z" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>',
  cpp: '<path d="M11 8.2a4.5 4.5 0 1 0 0 7.6M15.5 10.5v3M14 12h3M19.5 10.5v3M18 12h3" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round"/>',
  c: '<path d="M15.5 8.2a5 5 0 1 0 0 7.6" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>',
  sql: '<ellipse cx="12" cy="6.5" rx="7" ry="2.8" fill="none" stroke="currentColor" stroke-width="1.85"/><path d="M5 6.5v11c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-11M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8" fill="none" stroke="currentColor" stroke-width="1.85"/>',
  bash: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.85"/><path d="M7.5 9.5L11 12l-3.5 2.5M12.5 15h4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  // Dev — Frameworks & AI
  react: '<circle cx="12" cy="12" r="1.8" fill="currentColor"/><ellipse cx="12" cy="12" rx="9" ry="3.6" fill="none" stroke="currentColor" stroke-width="1.65"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" fill="none" stroke="currentColor" stroke-width="1.65"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" fill="none" stroke="currentColor" stroke-width="1.65"/>',
  next: '<circle cx="12" cy="12" r="8.8" fill="none" stroke="currentColor" stroke-width="1.85"/><path d="M9 15.5V8.5l8.2 10.2M15 8.5v4.5" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"/>',
  node: '<path d="M12 3.2l7.6 4.4v8.8L12 20.8l-7.6-4.4V7.6z" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linejoin="round"/><path d="M12 8v8m-3-6.2l3-1.8 3 1.8" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>',
  express: '<path d="M4 9h6m-6 3h4.5M4 15h6m4-6l5 6m0-6l-5 6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
  fastapi: '<circle cx="12" cy="12" r="8.8" fill="none" stroke="currentColor" stroke-width="1.85"/><path d="M13 6.5L8.2 13h4.1l-1.3 4.5L15.8 11h-4.1z" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/>',
  tailwind: '<path d="M6 10.5c1.2-2.4 3-3.2 5.2-2.4 1.1.4 1.9 1.3 2.8 1.6 1.4.5 2.8 0 4-1.6-1.2 2.4-3 3.2-5.2 2.4-1.1-.4-1.9-1.3-2.8-1.6-1.4-.5-2.8 0-4 1.6zm0 5.4c1.2-2.4 3-3.2 5.2-2.4 1.1.4 1.9 1.3 2.8 1.6 1.4.5 2.8 0 4-1.6-1.2 2.4-3 3.2-5.2 2.4-1.1-.4-1.9-1.3-2.8-1.6-1.4-.5-2.8 0-4 1.6z" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>',
  pytorch: '<path d="M14.8 5.2l-1.8 1.8a6.5 6.5 0 1 0 3.8 5.9" fill="none" stroke="currentColor" stroke-width="1.95" stroke-linecap="round"/><circle cx="15.5" cy="7.5" r="1.4" fill="currentColor"/>',
  tf: '<path d="M12 3.5l7.5 4.3v3.2l-4.5-2.6v3.2l2.8 1.6v3l-2.8-1.6v5.9L12 18.8V7.8L7.5 10.4V7.2z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
  langchain: '<path d="M9.5 14.5l-2 2a3.2 3.2 0 0 1-4.5-4.5l2.5-2.5a3.2 3.2 0 0 1 4.5 0M14.5 9.5l2-2a3.2 3.2 0 0 1 4.5 4.5l-2.5 2.5a3.2 3.2 0 0 1-4.5 0M9.5 14.5l5-5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
  hf: '<circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="1.85"/><circle cx="9.3" cy="10.2" r="1.1" fill="currentColor"/><circle cx="14.7" cy="10.2" r="1.1" fill="currentColor"/><path d="M8.8 14.2c1.6 1.8 4.8 1.8 6.4 0" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round"/>',
  openai: '<circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 3.5v3.2m0 10.6v3.2M4.6 7.7l2.8 1.6m9.2 5.4l2.8 1.6M4.6 16.3l2.8-1.6m9.2-5.4l2.8-1.6" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round"/>',
  rag: '<circle cx="6.5" cy="7" r="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.5" cy="7" r="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="17.2" r="2.4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 8.2l2.4 6.8m4.6-6.8l-2.4 6.8M8.7 7h6.6" fill="none" stroke="currentColor" stroke-width="1.65"/>',
  // Default fallback geometric chip icon
  default: '<rect x="4.5" y="4.5" width="15" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="1.85"/><path d="M9 9h6v6H9z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 2.5v2m6-2v2M9 19.5v2m6-2v2M2.5 9h2m-2 6h2M19.5 9h2m-2 6h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  // Security / Arsenal icons
  nmap: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  burp: '<path d="M12 3L4.5 7.5v9L12 21l7.5-4.5v-9L12 3z" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linejoin="round"/><path d="M9 12h6m-3-3v6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
  wireshark: '<path d="M3 16.5h18M6.5 16.5C7.5 10 11 6.5 16.5 6c-1.2 3.8-1 7.2 1.2 10.5" fill="none" stroke="currentColor" stroke-width="1.95" stroke-linecap="round" stroke-linejoin="round"/>',
  ghidra: '<path d="M6 18c0-6 3-11 8.5-12.5L13 9l4.5 1-3 3.5 3.5 1.5c-2.5 2-5.5 3-12 3z" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linejoin="round"/>',
  kali: '<path d="M12 3.5l7.5 4.2v8.6L12 20.5 4.5 16.3V7.7z" fill="none" stroke="currentColor" stroke-width="1.85"/><path d="M8.5 14.5l7-5m-7 0l7 5" stroke="currentColor" stroke-width="1.85" stroke-linecap="round"/>',
};

function iconFor(id) {
  return ICONS[id] || ICONS.default;
}

const FALLBACK_DATA = {
  dev: {
    title: "Engineering Loadout",
    subtitle: "Press any keycap—or type its first letter—to inspect the stack on the OLED readout. Pull the hoodie up to flip every switch into the Security Arsenal.",
    defaultOled: "LOADOUT // READY — TypeScript · Daily Driver · Strict end-to-end types across React, Next.js, Node, and agent SDKs",
    rows: [],
  },
  hack: {
    title: "Offensive & Defensive Arsenal",
    subtitle: "Every keycap flipped to its darkroom counterpart. Move your safelight torch across the board or press any switch to inspect its role.",
    defaultOled: "ARSENAL // SAFELIGHT — Burp Suite · Core tool · Manual HTTP interception, auth bypass & AppSec auditing",
    rows: [],
  },
};

export async function initLoadout() {
  const section = document.querySelector("[data-loadout]");
  if (!section) return;

  const board = section.querySelector("[data-loadout-board]");
  const oledText = section.querySelector("[data-loadout-oled]");
  const oledModeTag = section.querySelector("[data-loadout-tag]");
  const titleEl = section.querySelector("[data-loadout-title]");
  const subEl = section.querySelector("[data-loadout-sub]");
  if (!board) return;

  let data = FALLBACK_DATA;
  try {
    const url = new URL("../../data/loadout.json", import.meta.url);
    const res = await fetch(url);
    if (res.ok) data = await res.json();
  } catch {}

  let activeFilterMod = null;
  let typeTimer = 0;
  let letterCursor = {};

  function typeOled(str, prefixTag = null) {
    if (!oledText) return;
    clearInterval(typeTimer);
    if (oledModeTag && prefixTag) oledModeTag.textContent = prefixTag;

    if (reduceMotion) {
      oledText.textContent = str;
      return;
    }
    oledText.textContent = "";
    let i = 0;
    typeTimer = setInterval(() => {
      i += 2;
      oledText.textContent = str.slice(0, i);
      if (i >= str.length) clearInterval(typeTimer);
    }, 12);
  }

  function renderBoard(mode, { flipping = false } = {}) {
    const modeData = data[mode] || data.dev;
    const isHack = mode === "hack";

    if (titleEl) titleEl.textContent = modeData.title;
    if (subEl) subEl.textContent = modeData.subtitle;
    typeOled(modeData.defaultOled, isHack ? "ARSENAL // SAFELIGHT" : "LOADOUT // LAB");

    activeFilterMod = null;
    board.innerHTML = "";

    modeData.rows.forEach((row, rIdx) => {
      const rowEl = document.createElement("div");
      rowEl.className = "kb-row";
      rowEl.style.setProperty("--row-idx", String(rIdx));
      if (flipping && !reduceMotion) {
        rowEl.classList.add("is-flipping");
        setTimeout(() => {
          sound.play("flip");
        }, rIdx * 55);
        setTimeout(() => {
          rowEl.classList.remove("is-flipping");
        }, 520 + rIdx * 55);
      }

      // Left-hand Modifier Key ([LANG], [FRAME], etc.)
      const modBtn = document.createElement("button");
      modBtn.type = "button";
      modBtn.className = "kb-mod";
      modBtn.dataset.mod = row.mod;
      modBtn.setAttribute("aria-pressed", "false");
      modBtn.setAttribute("aria-label", `Filter ${row.label} row`);
      modBtn.innerHTML = `
        <span class="kb-mod-led" aria-hidden="true"></span>
        <span class="kb-mod-code">${row.mod}</span>
        <span class="kb-mod-sub">${row.label}</span>
      `;
      modBtn.addEventListener("click", () => {
        sound.play("switch");
        if (activeFilterMod === row.mod) {
          activeFilterMod = null;
          board.querySelectorAll(".kb-row").forEach((el) => el.classList.remove("is-dimmed"));
          board.querySelectorAll(".kb-mod").forEach((b) => b.setAttribute("aria-pressed", "false"));
          typeOled(modeData.defaultOled, isHack ? "ARSENAL // ALL ROWS" : "LOADOUT // ALL ROWS");
        } else {
          activeFilterMod = row.mod;
          board.querySelectorAll(".kb-row").forEach((el) => {
            const m = el.querySelector(".kb-mod")?.dataset.mod;
            el.classList.toggle("is-dimmed", m !== activeFilterMod);
          });
          board.querySelectorAll(".kb-mod").forEach((b) => {
            b.setAttribute("aria-pressed", String(b.dataset.mod === activeFilterMod));
          });
          typeOled(
            `${row.mod} // ${row.label.toUpperCase()} — ${row.caps.map((c) => c.name).join(" · ")}`,
            isHack ? `ROW // ${row.mod}` : `ROW // ${row.mod}`
          );
        }
      });

      const capsWrap = document.createElement("div");
      capsWrap.className = "kb-caps";

      row.caps.forEach((cap, cIdx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `kb-cap kb-cap--${cap.tier}`;
        btn.dataset.capId = cap.id;
        btn.dataset.capName = cap.name;
        btn.dataset.letter = cap.name[0].toLowerCase();
        btn.style.setProperty("--cap-idx", String(cIdx));
        btn.setAttribute("aria-pressed", "false");
        btn.setAttribute("aria-label", `${cap.name} — ${cap.years}: ${cap.detail}`);

        btn.innerHTML = `
          <span class="kb-cap-top">
            <svg class="kb-cap-ico" viewBox="0 0 24 24" aria-hidden="true">${iconFor(cap.id)}</svg>
            <span class="kb-cap-code">${cap.short}</span>
          </span>
          <span class="kb-cap-name">${cap.name}</span>
        `;

        btn.addEventListener("click", () => {
          selectCap(btn, cap, row, isHack);
        });

        capsWrap.append(btn);
      });

      rowEl.append(modBtn, capsWrap);
      board.append(rowEl);
    });

    // Mark first cap active by default
    const firstCap = board.querySelector(".kb-cap");
    if (firstCap) firstCap.setAttribute("aria-pressed", "true");
  }

  function selectCap(btn, cap, row, isHack, playSound = true) {
    if (playSound) sound.play("down");
    board.querySelectorAll(".kb-cap[aria-pressed='true']").forEach((el) => {
      el.setAttribute("aria-pressed", "false");
    });
    btn.setAttribute("aria-pressed", "true");
    btn.classList.add("is-down");
    setTimeout(() => btn.classList.remove("is-down"), 140);

    const tag = `${row.mod} // ${cap.years.toUpperCase()}`;
    const line = `${cap.name} — ${cap.detail}`;
    typeOled(line, tag);
  }

  // Scroll-into-view row-by-row drop-in animation
  const io = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        board.classList.add("is-assembled");
        io.disconnect();
      }
    },
    { threshold: 0.14 }
  );
  io.observe(board);

  // Real keyboard letter jump when Loadout is in viewport
  document.addEventListener("keydown", (e) => {
    if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;
    const key = e.key.toLowerCase();
    if (key.length !== 1 || key < "a" || key > "z" || key === "h") return;

    const r = section.getBoundingClientRect();
    // Only jump if Loadout section is visible on screen
    if (r.bottom < 80 || r.top > innerHeight - 80) return;

    const matches = [...board.querySelectorAll(`.kb-cap[data-letter="${key}"]`)];
    if (!matches.length) return;

    const idx = (letterCursor[key] || 0) % matches.length;
    letterCursor[key] = idx + 1;
    const targetBtn = matches[idx];

    const mode = getMode();
    const modeData = data[mode] || data.dev;
    for (const row of modeData.rows) {
      const cap = row.caps.find((c) => c.id === targetBtn.dataset.capId);
      if (cap) {
        selectCap(targetBtn, cap, row, mode === "hack", false);
        break;
      }
    }
  });

  onModeChange(({ mode, animate }) => {
    renderBoard(mode, { flipping: animate });
  });

  renderBoard(getMode(), { flipping: false });
}
