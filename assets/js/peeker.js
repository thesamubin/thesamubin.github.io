// Upside-down peeking character hanging from the curved footer seam on every main page.
// Adapts its hood and dialogue between Developer Mode (Aluminium Lab) and Hacker Mode (Darkroom).

import { sound } from "./sound.js";
import { getMode, reduceMotion } from "./mode.js";

let uidSeq = 0;

function peekerSvg(p) {
  return `
<svg class="peeker-svg" viewBox="0 0 220 190" aria-hidden="true">
  <defs>
    <radialGradient id="${p}-skin" cx="50%" cy="65%" r="65%">
      <stop offset="0%" stop-color="#f7d5b9"/>
      <stop offset="58%" stop-color="#e2aa82"/>
      <stop offset="100%" stop-color="#b97850"/>
    </radialGradient>
    <radialGradient id="${p}-blush" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff5e4d" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#ff5e4d" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${p}-hair" x1="20%" y1="100%" x2="80%" y2="0%">
      <stop offset="0%" stop-color="#38323c"/>
      <stop offset="52%" stop-color="#1e1b22"/>
      <stop offset="100%" stop-color="#110f14"/>
    </linearGradient>
    <radialGradient id="${p}-hood" cx="50%" cy="68%" r="76%">
      <stop offset="0%" stop-color="#ff8a57"/>
      <stop offset="54%" stop-color="#ff5a1f"/>
      <stop offset="100%" stop-color="#9e2d06"/>
    </radialGradient>
    <linearGradient id="${p}-chest" x1="50%" y1="100%" x2="50%" y2="0%">
      <stop offset="0%" stop-color="#f4f2ec"/>
      <stop offset="100%" stop-color="#cbc4b6"/>
    </linearGradient>
    <filter id="${p}-shadow" x="-20%" y="-15%" width="140%" height="140%">
      <feDropShadow dx="0" dy="7" stdDeviation="6" flood-color="#050608" flood-opacity="0.48"/>
    </filter>
  </defs>

  <g filter="url(#${p}-shadow)" transform="translate(220 190) rotate(180)">
    <!-- Raglan Hoodie Shoulders -->
    <path d="M58 126 C54 152, 56 184, 66 196 L154 196 C164 184, 166 152, 162 126 C146 116, 74 116, 58 126 Z" fill="url(#${p}-hood)" stroke="#7c2004" stroke-width="1.5"/>
    <path d="M81 128 C78 150, 79 180, 85 196 L135 196 C141 180, 142 150, 139 128 Z" fill="url(#${p}-chest)"/>
    <path d="M66 120 C66 136, 154 136, 154 120 C154 111, 142 108, 136 114 C124 122, 96 122, 84 114 C78 108, 66 111, 66 120 Z" fill="url(#${p}-hood)"/>
    <path d="M96 131 Q95 147 97 156" fill="none" stroke="#ece8df" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M124 131 Q125 147 123 156" fill="none" stroke="#ece8df" stroke-width="2.8" stroke-linecap="round"/>
    <circle cx="97" cy="157" r="2.4" fill="#ff5a1f"/>
    <circle cx="123" cy="157" r="2.4" fill="#ff5a1f"/>

    <!-- Hood Canopy (shown when in Hack Mode) -->
    <path class="pk-hood-canopy" d="M50 74 C46 24, 76 2, 110 2 C144 2, 174 24, 170 74 C168 96, 156 112, 144 118 L76 118 C64 112, 52 96, 50 74 Z" fill="url(#${p}-hood)"/>

    <!-- Back hair -->
    <path d="M56 70 C52 30, 78 6, 110 6 C142 6, 168 30, 164 70 C162 88, 154 100, 146 104 L74 104 C66 100, 58 88, 56 70 Z" fill="url(#${p}-hair)"/>

    <!-- Ears -->
    <circle cx="63" cy="79" r="10.5" fill="#d99d75"/>
    <circle cx="157" cy="79" r="10.5" fill="#d99d75"/>

    <!-- Natural sculpted face -->
    <path d="M66 56 C66 34, 84 26, 110 26 C136 26, 154 34, 154 56 C154 84, 144 108, 126 115 C116 119, 104 119, 94 115 C76 108, 66 84, 66 56 Z" fill="url(#${p}-skin)"/>

    <!-- Cheeks -->
    <circle cx="84" cy="88" r="12.5" fill="url(#${p}-blush)"/>
    <circle cx="136" cy="88" r="12.5" fill="url(#${p}-blush)"/>

    <!-- Curious eyes -->
    <g class="pk-eyes-calm">
      <g transform="translate(93 75)">
        <circle r="7.8" fill="#17151a"/>
        <circle class="pk-pupil" cx="-2" cy="2.2" r="2.6" fill="#ffffff"/>
      </g>
      <g transform="translate(127 75)">
        <circle r="7.8" fill="#17151a"/>
        <circle class="pk-pupil" cx="-2" cy="2.2" r="2.6" fill="#ffffff"/>
      </g>
      <path d="M103 91 Q110 97 117 91" fill="none" stroke="#4a2518" stroke-width="3.2" stroke-linecap="round"/>
    </g>

    <!-- Laughing ^ ^ eyes & big grin -->
    <g class="pk-eyes-laugh">
      <path d="M85 77 Q93 66 101 77" fill="none" stroke="#17151a" stroke-width="4.4" stroke-linecap="round"/>
      <path d="M119 77 Q127 66 135 77" fill="none" stroke="#17151a" stroke-width="4.4" stroke-linecap="round"/>
      <path d="M98 89 Q110 106 122 89 Z" fill="#4a1c17"/>
      <path d="M102 96 Q110 102 118 96 Q110 93 102 96 Z" fill="#ff6e5e"/>
    </g>

    <!-- Nose -->
    <ellipse cx="110" cy="82" rx="4" ry="2.8" fill="#cf8a62"/>

    <!-- Hanging sculpted hair locks -->
    <path d="M64 72 C60 44, 74 22, 98 18 C86 34, 78 52, 74 70 Z" fill="url(#${p}-hair)"/>
    <path d="M156 72 C160 44, 146 22, 122 18 C134 34, 142 52, 146 70 Z" fill="url(#${p}-hair)"/>
    <path d="M68 48 C72 18, 100 4, 132 12 C148 16, 156 30, 152 46 C138 36, 122 34, 106 42 C92 48, 78 50, 68 48 Z" fill="url(#${p}-hair)"/>
    <path d="M84 32 C98 10, 130 8, 144 30 C132 46, 108 52, 88 45 Z" fill="url(#${p}-hair)"/>
  </g>
</svg>`;
}

const DEV_PEEK_LINES = [
  "Thanks for scrolling all the way down the lab!",
  "Caught me hanging from the aluminium seam!",
  "Use the top profile button anytime to flip the darkroom safelight.",
  "Say hi anytime — hello@samubin.com",
];

const HACK_PEEK_LINES = [
  "Hanging upside-down in the red-team darkroom!",
  "Your safelight torch found the footer hideout.",
  "Type S-A-M-U-B-I-N to run the full-page cipher!",
  "Secure channel open — hello@samubin.com",
];

export function initPeeker() {
  document.querySelectorAll("[data-peeker]").forEach((btn) => {
    const prefix = `pk_${++uidSeq}`;
    const art = btn.querySelector("[data-peeker-art]") || btn;
    art.innerHTML = peekerSvg(prefix);

    const note = btn.parentElement?.querySelector("[data-peeker-note]");
    const pupils = [...btn.querySelectorAll(".pk-pupil")];
    const REST_Y = -18;
    const OPEN_Y = 8;
    let y = REST_Y;
    let targetY = REST_Y;
    let vy = 0;
    let raf = 0;
    let pinned = false;
    let lineIdx = 0;

    function render() {
      raf = 0;
      const f = (targetY - y) * 0.16;
      vy = (vy + f) * 0.78;
      y += vy;
      art.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      if (Math.abs(targetY - y) + Math.abs(vy) > 0.04 && !reduceMotion) {
        raf = requestAnimationFrame(render);
      } else {
        y = targetY;
        art.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      }
    }

    function setOpen(open, fromClick = false) {
      btn.classList.toggle("is-peeking", open);
      targetY = open ? OPEN_Y : REST_Y;
      if (fromClick && !reduceMotion) vy += 5.5;
      if (reduceMotion) {
        y = targetY;
        art.style.transform = `translate3d(0, ${y}px, 0)`;
      } else if (!raf) {
        raf = requestAnimationFrame(render);
      }
    }

    art.style.transform = `translate3d(0, ${REST_Y}px, 0)`;

    btn.addEventListener("pointerenter", () => {
      if (!pinned) setOpen(true, false);
    });
    btn.addEventListener("pointerleave", () => {
      if (!pinned) setOpen(false, false);
    });
    btn.addEventListener("focus", () => setOpen(true, false));
    btn.addEventListener("blur", () => {
      pinned = false;
      setOpen(false, false);
    });
    btn.addEventListener("click", () => {
      pinned = !pinned || !btn.classList.contains("is-peeking");
      setOpen(pinned, true);
      if (pinned) {
        sound.play("wave");
        if (note) {
          const pool = getMode() === "hack" ? HACK_PEEK_LINES : DEV_PEEK_LINES;
          note.textContent = pool[lineIdx++ % pool.length];
          note.classList.add("is-on");
          clearTimeout(note._t);
          note._t = setTimeout(() => note.classList.remove("is-on"), 3200);
        }
      } else {
        sound.play("click");
        note?.classList.remove("is-on");
      }
    });

    addEventListener(
      "pointermove",
      (e) => {
        if (reduceMotion || e.pointerType === "touch") return;
        const r = btn.getBoundingClientRect();
        if (r.top > innerHeight + 60 || r.bottom < -60) return;
        const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / 220));
        const dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / 180));
        pupils.forEach((p) => {
          p.setAttribute("cx", (-dx * 2.8).toFixed(2));
          p.setAttribute("cy", (-dy * 2.4).toFixed(2));
        });
      },
      { passive: true }
    );
  });
}
