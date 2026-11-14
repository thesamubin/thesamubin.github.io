// Interactive 3D-clay-shaded developer avatar (Hero + About) + cursor-reactive wave.
// Zero external assets; 60fps rAF when visible.
import { sound } from "./sound.js";
import { reduceMotion } from "./mode.js";

let uidSeq = 0;

function avatarSvg(prefix, { compact = false } = {}) {
  // Original 3D-vinyl-shaded character for SA Mubin:
  // Warm South Asian complexion, thick sculpted espresso hair waves,
  // safety-orange & bone-cream raglan developer hoodie, expressive eyes/shades/wave.
  const vb = compact ? "40 16 240 232" : "0 0 320 310";
  return `
<svg class="av-svg" viewBox="${vb}" aria-hidden="true">
  <defs>
    <radialGradient id="${prefix}-skin" cx="38%" cy="30%" r="68%">
      <stop offset="0%" stop-color="#f7d5b9"/>
      <stop offset="56%" stop-color="#e2aa82"/>
      <stop offset="100%" stop-color="#b97850"/>
    </radialGradient>
    <radialGradient id="${prefix}-ear" cx="45%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#eab58e"/>
      <stop offset="100%" stop-color="#b5724b"/>
    </radialGradient>
    <radialGradient id="${prefix}-blush" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff5e4d" stop-opacity="0.52"/>
      <stop offset="100%" stop-color="#ff5e4d" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${prefix}-hair" x1="25%" y1="0%" x2="75%" y2="100%">
      <stop offset="0%" stop-color="#353038"/>
      <stop offset="48%" stop-color="#1e1b21"/>
      <stop offset="100%" stop-color="#110f14"/>
    </linearGradient>
    <linearGradient id="${prefix}-hair-hi" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#524a56"/>
      <stop offset="60%" stop-color="#26222a"/>
      <stop offset="100%" stop-color="#151318"/>
    </linearGradient>
    <radialGradient id="${prefix}-hood" cx="36%" cy="22%" r="78%">
      <stop offset="0%" stop-color="#ff8a57"/>
      <stop offset="52%" stop-color="#ff5a1f"/>
      <stop offset="100%" stop-color="#a83208"/>
    </radialGradient>
    <linearGradient id="${prefix}-chest" x1="30%" y1="0%" x2="70%" y2="100%">
      <stop offset="0%" stop-color="#f8f4ec"/>
      <stop offset="65%" stop-color="#e5dfd0"/>
      <stop offset="100%" stop-color="#beb6a2"/>
    </linearGradient>
    <linearGradient id="${prefix}-pants" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#343943"/>
      <stop offset="55%" stop-color="#20232a"/>
      <stop offset="100%" stop-color="#13151a"/>
    </linearGradient>
    <linearGradient id="${prefix}-shoe" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#faf7f0"/>
      <stop offset="70%" stop-color="#ded8c8"/>
      <stop offset="100%" stop-color="#b4ad9b"/>
    </linearGradient>
    <linearGradient id="${prefix}-lens" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2b3340"/>
      <stop offset="50%" stop-color="#12161d"/>
      <stop offset="100%" stop-color="#0b0d12"/>
    </linearGradient>
    <filter id="${prefix}-drop" x="-18%" y="-14%" width="136%" height="138%">
      <feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#07080a" flood-opacity="0.45"/>
    </filter>
  </defs>

  <g class="av-root" filter="url(#${prefix}-drop)">
    ${
      compact
        ? ""
        : `
    <!-- Ground plinth shadow -->
    <ellipse cx="160" cy="288" rx="86" ry="13" fill="rgba(0,0,0,0.42)"/>`
    }

    <!-- Torso & Raglan Hoodie -->
    <g class="av-body">
      <!-- Back hood rim -->
      <ellipse cx="160" cy="166" rx="46" ry="20" fill="#9c2d07"/>
      <!-- Hoodie torso -->
      <path d="M108 174 C104 202, 104 236, 114 252 L206 252 C216 236, 216 202, 212 174 C198 162, 122 162, 108 174 Z" fill="url(#${prefix}-hood)"/>
      <!-- Cream raglan front panel -->
      <path d="M130 175 C126 198, 127 232, 133 250 L187 250 C193 232, 194 198, 190 175 C176 169, 144 169, 130 175 Z" fill="url(#${prefix}-chest)"/>
      <!-- Kangaroo pocket seam -->
      <path d="M136 226 L142 214 L178 214 L184 226" fill="none" stroke="#c8c0ac" stroke-width="2" stroke-linecap="round"/>

      <!-- Left resting arm -->
      <path class="av-arm-rest-l" d="M114 176 C95 194, 96 228, 138 242 C145 244, 150 234, 143 229 C118 220, 118 199, 128 184 Z" fill="url(#${prefix}-hood)"/>
      <!-- Right resting arm (hidden when waving) -->
      <path class="av-arm-rest-r" d="M206 176 C225 194, 224 228, 182 242 C175 244, 170 234, 177 229 C202 220, 202 199, 192 184 Z" fill="url(#${prefix}-hood)"/>
      <!-- Clasped 3D hands -->
      <g class="av-hands">
        <ellipse cx="153" cy="238" rx="12" ry="9.5" fill="url(#${prefix}-skin)"/>
        <ellipse cx="167" cy="238" rx="12" ry="9.5" fill="url(#${prefix}-skin)"/>
        <path d="M148 235 Q160 241 172 235" fill="none" stroke="#b97850" stroke-width="2" stroke-linecap="round"/>
      </g>

      <!-- Waving right arm (shown when .is-waving) -->
      <g class="av-arm-wave">
        <path d="M202 180 C226 172, 242 146, 236 122 C234 114, 220 116, 221 126 C223 142, 212 158, 194 168 Z" fill="url(#${prefix}-hood)"/>
        <circle cx="229" cy="115" r="12.5" fill="url(#${prefix}-skin)"/>
        <circle cx="219" cy="113" r="4.5" fill="url(#${prefix}-skin)"/>
        <!-- Motion wave arcs -->
        <path d="M246 102 A18 18 0 0 1 252 122" fill="none" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
        <path d="M254 96 A26 26 0 0 1 262 124" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
      </g>

      <!-- Sculpted puffy hood collar -->
      <path d="M116 166 C116 183, 204 183, 204 166 C204 157, 192 154, 186 160 C174 169, 146 169, 134 160 C128 154, 116 157, 116 166 Z" fill="url(#${prefix}-hood)"/>
      <path d="M124 166 C138 176, 182 176, 196 166" fill="none" stroke="rgba(255,235,220,0.35)" stroke-width="2.2" stroke-linecap="round"/>
      <!-- Hoodie drawstrings -->
      <path d="M146 176 Q145 192 147 200" fill="none" stroke="#f5efe2" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M174 176 Q175 192 173 200" fill="none" stroke="#f5efe2" stroke-width="3.2" stroke-linecap="round"/>
      <circle cx="147" cy="201" r="2.6" fill="#ff5a1f"/>
      <circle cx="173" cy="201" r="2.6" fill="#ff5a1f"/>

      ${
        compact
          ? ""
          : `
      <!-- Cross-legged sculpted joggers & sneakers -->
      <g class="av-legs">
        <path d="M98 250 C82 238, 102 216, 142 236 L192 260 C206 266, 198 282, 178 278 L108 264 C99 261, 95 255, 98 250 Z" fill="url(#${prefix}-pants)"/>
        <path d="M222 250 C238 238, 218 216, 178 236 L128 260 C114 266, 122 282, 142 278 L212 264 C221 261, 225 255, 222 250 Z" fill="url(#${prefix}-pants)"/>
        <!-- Left sneaker -->
        <g transform="translate(116 262) rotate(-14)">
          <rect x="0" y="0" width="38" height="21" rx="10.5" fill="url(#${prefix}-shoe)"/>
          <path d="M3 16 L35 16" stroke="#ff5a1f" stroke-width="3.2" stroke-linecap="round"/>
          <path d="M14 5 L22 5 M13 9 L23 9" stroke="#8a8475" stroke-width="2" stroke-linecap="round"/>
        </g>
        <!-- Right sneaker -->
        <g transform="translate(168 252) rotate(14)">
          <rect x="0" y="0" width="38" height="21" rx="10.5" fill="url(#${prefix}-shoe)"/>
          <path d="M3 16 L35 16" stroke="#ff5a1f" stroke-width="3.2" stroke-linecap="round"/>
          <path d="M14 5 L22 5 M13 9 L23 9" stroke="#8a8475" stroke-width="2" stroke-linecap="round"/>
        </g>
      </g>`
      }
    </g>

    <!-- Neck shadow -->
    <ellipse cx="160" cy="161" rx="22" ry="9" fill="#8f5332"/>

    <!-- Sculpted 3D Head & Hair -->
    <g class="av-head">
      <!-- Back hair mass -->
      <path d="M104 114 C100 72, 126 46, 162 46 C198 46, 220 72, 216 114 C215 132, 208 144, 200 148 L120 148 C112 144, 105 132, 104 114 Z" fill="url(#${prefix}-hair)"/>

      <!-- Ears -->
      <g class="av-ears">
        <circle cx="111" cy="123" r="11.5" fill="url(#${prefix}-ear)"/>
        <circle cx="112" cy="123" r="5" fill="#b06b45" opacity="0.55"/>
        <circle cx="209" cy="123" r="11.5" fill="url(#${prefix}-ear)"/>
        <circle cx="208" cy="123" r="5" fill="#b06b45" opacity="0.55"/>
      </g>

      <!-- Sculpted clay face -->
      <rect x="114" y="72" width="92" height="90" rx="43" fill="url(#${prefix}-skin)"/>

      <!-- Rosy 3D cheeks -->
      <g class="av-cheeks">
        <circle cx="132" cy="133" r="13" fill="url(#${prefix}-blush)"/>
        <circle cx="188" cy="133" r="13" fill="url(#${prefix}-blush)"/>
      </g>

      <!-- Facial features (parallax inner layer) -->
      <g class="av-face">
        <!-- Brows -->
        <g class="av-brows" fill="none" stroke="#221d24" stroke-width="4.2" stroke-linecap="round">
          <path d="M133 106 Q142 101 150 105"/>
          <path d="M170 105 Q178 101 187 106"/>
        </g>

        <!-- Open glossy vinyl bead eyes -->
        <g class="av-eyes-open">
          <g class="av-eye" transform="translate(142 119)">
            <circle r="8.2" fill="#17151a"/>
            <circle class="av-pupil" cx="-2.4" cy="-2.6" r="2.7" fill="#ffffff"/>
            <circle cx="2.5" cy="2.8" r="1.2" fill="#ffd9c4" opacity="0.75"/>
          </g>
          <g class="av-eye" transform="translate(178 119)">
            <circle r="8.2" fill="#17151a"/>
            <circle class="av-pupil" cx="-2.4" cy="-2.6" r="2.7" fill="#ffffff"/>
            <circle cx="2.5" cy="2.8" r="1.2" fill="#ffd9c4" opacity="0.75"/>
          </g>
        </g>

        <!-- Blinking / Happy ^ ^ squint eyes -->
        <g class="av-eyes-happy" fill="none" stroke="#17151a" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M134 121 Q142 111 150 121"/>
          <path d="M170 121 Q178 111 186 121"/>
        </g>

        <!-- Dizzy @ @ spiral eyes -->
        <g class="av-eyes-dizzy" fill="none" stroke="#17151a" stroke-width="2.5" stroke-linecap="round">
          <path d="M142 119 m-1 0 a2 2 0 1 0 4 0 a4.5 4.5 0 1 0 -9 0 a7 7 0 1 0 14 0"/>
          <path d="M178 119 m-1 0 a2 2 0 1 0 4 0 a4.5 4.5 0 1 0 -9 0 a7 7 0 1 0 14 0"/>
        </g>

        <!-- Cute 3D clay nose button -->
        <ellipse cx="160" cy="126" rx="4.2" ry="3.1" fill="#cf8a62"/>
        <ellipse cx="159" cy="125" rx="2" ry="1.2" fill="#f9dec6" opacity="0.65"/>

        <!-- Calm/proximity smile -->
        <path class="av-mouth-calm" d="M152 136 Q160 143 168 136" fill="none" stroke="#4a2518" stroke-width="3.4" stroke-linecap="round"/>

        <!-- Joyful open laughing mouth (on boop) -->
        <g class="av-mouth-laugh">
          <path d="M149 134 Q160 151 171 134 Z" fill="#4a1c17"/>
          <path d="M153 141 Q160 147 167 141 Q160 138 153 141 Z" fill="#ff6e5e"/>
        </g>

        <!-- Sleek developer sunglasses (shown when .has-shades) -->
        <g class="av-shades">
          <path d="M115 113 L125 114 M205 113 L195 114" stroke="#14161c" stroke-width="3.5" stroke-linecap="round"/>
          <rect x="124" y="108" width="32" height="21" rx="6" fill="url(#${prefix}-lens)" stroke="#14161c" stroke-width="3"/>
          <rect x="164" y="108" width="32" height="21" rx="6" fill="url(#${prefix}-lens)" stroke="#14161c" stroke-width="3"/>
          <path d="M156 114 Q160 111 164 114" fill="none" stroke="#14161c" stroke-width="3.2"/>
          <path d="M129 113 L137 124 M169 113 L177 124" stroke="#38bdf8" stroke-width="2.4" stroke-linecap="round" opacity="0.65"/>
        </g>
      </g>

      <!-- Chunky sculpted 3D hair locks (overlapping forehead with soft clay speculars) -->
      <g class="av-hair-front">
        <!-- Left side sweep -->
        <path d="M111 116 C106 88, 120 64, 144 60 C132 76, 124 94, 121 114 C117 118, 112 119, 111 116 Z" fill="url(#${prefix}-hair)"/>
        <!-- Right side sweep -->
        <path d="M209 116 C214 88, 200 62, 174 58 C188 74, 196 92, 199 114 C203 118, 208 119, 209 116 Z" fill="url(#${prefix}-hair)"/>
        <!-- Sculpted voluminous top waves -->
        <path d="M116 92 C118 60, 148 44, 182 52 C198 56, 208 70, 204 88 C190 78, 174 76, 158 84 C142 90, 126 94, 116 92 Z" fill="url(#${prefix}-hair-hi)"/>
        <!-- Signature 3D center-right swoop lock -->
        <path d="M132 74 C146 52, 180 50, 196 72 C184 88, 158 95, 136 88 C130 85, 129 79, 132 74 Z" fill="url(#${prefix}-hair-hi)"/>
        <!-- Secondary sculpted forelock -->
        <path d="M122 86 C132 68, 156 64, 172 78 C158 92, 138 96, 124 92 Z" fill="url(#${prefix}-hair)"/>
        <!-- Subtle clay rim highlights -->
        <path d="M140 62 Q165 53 187 65" fill="none" stroke="rgba(255,245,235,0.2)" stroke-width="3" stroke-linecap="round"/>
        <path d="M129 79 Q148 70 165 77" fill="none" stroke="rgba(255,245,235,0.16)" stroke-width="2.4" stroke-linecap="round"/>
      </g>
    </g>

    <!-- Joyful SVG burst sparks on boop -->
    <g class="av-sparks" fill="none" stroke-width="3" stroke-linecap="round">
      <path d="M88 86 L76 78 M86 102 L72 103" stroke="#ff5a1f"/>
      <path d="M232 86 L244 78 M234 102 L248 103" stroke="#38bdf8"/>
      <path d="M160 34 L160 20 M138 38 L131 26 M182 38 L189 26" stroke="#facc15"/>
    </g>
  </g>
</svg>`;
}

// Multi-hue palette for the cursor-reactive radial capsule-dash wave
const WAVE_STOPS = [
  [255, 90, 31],   // #ff5a1f safety orange
  [251, 146, 60],  // #fb923c warm amber
  [168, 85, 247],  // #a855f7 vivid orchid
  [56, 189, 248],  // #38bdf8 electric sky
];

function sampleWaveColor(t) {
  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (WAVE_STOPS.length - 1);
  const idx = Math.min(WAVE_STOPS.length - 2, Math.floor(scaled));
  const f = scaled - idx;
  const a = WAVE_STOPS[idx];
  const b = WAVE_STOPS[idx + 1];
  const r = Math.round(a[0] + (b[0] - a[0]) * f);
  const g = Math.round(a[1] + (b[1] - a[1]) * f);
  const bl = Math.round(a[2] + (b[2] - a[2]) * f);
  return `rgb(${r},${g},${bl})`;
}

function initWaveCanvas(canvas, stage) {
  if (!canvas) return { pulse() {}, setFocus() {} };
  const ctx = canvas.getContext("2d");
  let w = 0;
  let h = 0;
  let dpr = 1;
  let targetFx = 0.22;
  let targetFy = 0.62;
  let fx = 0.22;
  let fy = 0.62;
  let phase = 0;
  let ripple = 0;
  let rippleRadius = 0;
  let visible = true;
  let raf = 0;

  function resize() {
    const r = stage.getBoundingClientRect();
    w = Math.max(260, r.width);
    h = Math.max(240, r.height);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame();
  }

  function drawFrame() {
    ctx.clearRect(0, 0, w, h);
    const ox = fx * w;
    const oy = fy * h;
    const maxDist = Math.hypot(w, h) * 1.05;
    const rays = w < 460 ? 20 : 26;
    ctx.lineCap = "round";

    for (let i = 0; i < rays; i++) {
      // Full 360-degree kinetic fan from the cursor-tracked vortex origin
      const baseAngle = (i / rays) * Math.PI * 2;
      const nx = -Math.sin(baseAngle);
      const ny = Math.cos(baseAngle);
      const dx = Math.cos(baseAngle);
      const dy = Math.sin(baseAngle);

      let dist = 28 + (i % 3) * 10;
      let segIdx = 0;
      while (dist < maxDist) {
        const segLen = 15 + (segIdx % 3) * 6;
        const gap = 12 + ((i + segIdx) % 2) * 4;
        const tNorm = Math.min(1, dist / (maxDist * 0.72));

        // Gentle sine ribbon + click shockwave ripple
        const shock =
          ripple > 0.01
            ? Math.exp(-Math.pow((dist - rippleRadius) / 44, 2)) * ripple * 16
            : 0;
        const wave1 = Math.sin(dist * 0.034 - phase + i * 0.3) * (5 + tNorm * 11) + shock;
        const wave2 =
          Math.sin((dist + segLen) * 0.034 - phase + i * 0.3) * (5 + tNorm * 11) + shock;

        const x1 = ox + dx * dist + nx * wave1;
        const y1 = oy + dy * dist + ny * wave1;
        const x2 = ox + dx * (dist + segLen) + nx * wave2;
        const y2 = oy + dy * (dist + segLen) + ny * wave2;

        if (x2 > -24 && x1 < w + 24 && y2 > -24 && y1 < h + 24) {
          ctx.strokeStyle = sampleWaveColor(tNorm * 0.86 + (i / rays) * 0.14);
          ctx.globalAlpha = 0.36 + (1 - tNorm) * 0.48;
          ctx.lineWidth = w < 460 ? 5.5 : 7.0;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        dist += segLen + gap;
        segIdx++;
      }
    }
    ctx.globalAlpha = 1;
  }

  function tick() {
    raf = 0;
    if (!visible || reduceMotion) return;
    fx += (targetFx - fx) * 0.075;
    fy += (targetFy - fy) * 0.075;
    phase += 0.032;
    if (ripple > 0.005) {
      rippleRadius += 9.5;
      ripple *= 0.94;
    } else {
      ripple = 0;
    }
    drawFrame();
    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (!raf && visible && !reduceMotion) raf = requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? true;
      if (visible) start();
    },
    { threshold: 0.05 }
  );
  io.observe(stage);

  addEventListener("resize", resize, { passive: true });
  resize();
  start();

  return {
    pulse(originX = null, originY = null) {
      if (originX !== null && originY !== null) {
        targetFx = Math.max(0.08, Math.min(0.92, originX));
        targetFy = Math.max(0.12, Math.min(0.88, originY));
      }
      ripple = 1;
      rippleRadius = 18;
      if (reduceMotion) drawFrame();
      else start();
    },
    setFocus(nx, ny) {
      targetFx = Math.max(0.08, Math.min(0.92, nx));
      targetFy = Math.max(0.12, Math.min(0.88, ny));
      if (!reduceMotion) start();
    },
  };
}

const AVATAR_LINES = [
  "Hey! Welcome to my studio.",
  "Boop registered at 60fps!",
  "Built with zero frameworks.",
  "Try flipping the switch sound below!",
  "Press ⌘K for terminal shortcuts!",
];

function mountAvatarStage(stage) {
  const prefix = `av${++uidSeq}`;
  const compact = stage.dataset.avatar === "compact";
  const mount = stage.querySelector("[data-avatar-mount]") || stage;
  mount.innerHTML = avatarSvg(prefix, { compact });

  const canvas = stage.querySelector("canvas");
  const wave = initWaveCanvas(canvas, stage);
  const root = stage.querySelector(".av-root");
  const head = stage.querySelector(".av-head");
  const face = stage.querySelector(".av-face");
  const hairFront = stage.querySelector(".av-hair-front");
  const body = stage.querySelector(".av-body");
  const pupils = [...stage.querySelectorAll(".av-pupil")];
  const mouthCalm = stage.querySelector(".av-mouth-calm");
  const badge = stage.querySelector("[data-avatar-badge]");
  const actorBtn = stage.querySelector("[data-avatar-hit]") || mount;

  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;
  let hopY = 0;
  let hopV = 0;
  let raf = 0;
  let boopIdx = 0;
  let happyTimer = 0;
  let waveTimer = 0;
  let dizzyTimer = 0;
  let lastAngle = null;
  let spinAccum = 0;

  function showBadge(text, ms = 2400) {
    if (!badge) return;
    badge.textContent = text;
    badge.classList.add("is-on");
    clearTimeout(badge._t);
    badge._t = setTimeout(() => badge.classList.remove("is-on"), ms);
  }

  function step() {
    raf = 0;
    cx += (tx - cx) * 0.14;
    cy += (ty - cy) * 0.14;

    // Damped spring hop in JS (no CSS overshoot easing)
    const force = -hopY * 0.18;
    hopV = (hopV + force) * 0.82;
    hopY += hopV;

    if (root) root.style.transform = `translate3d(0, ${hopY.toFixed(2)}px, 0)`;
    if (head) {
      const rot = (cx * 5.2).toFixed(2);
      head.style.transform = `translate3d(${(cx * 9).toFixed(2)}px, ${(cy * 6.5).toFixed(2)}px, 0) rotate(${rot}deg)`;
    }
    if (face) {
      face.style.transform = `translate3d(${(cx * 5.5).toFixed(2)}px, ${(cy * 4.5).toFixed(2)}px, 0)`;
    }
    if (hairFront) {
      hairFront.style.transform = `translate3d(${(cx * 2.5).toFixed(2)}px, ${(cy * 2).toFixed(2)}px, 0)`;
    }
    if (body) {
      body.style.transform = `translate3d(${(cx * 3).toFixed(2)}px, ${(cy * 1.8).toFixed(2)}px, 0)`;
    }
    pupils.forEach((p) => {
      p.setAttribute("cx", (-1.6 + cx * 3.1).toFixed(2));
      p.setAttribute("cy", (-2.0 + cy * 2.8).toFixed(2));
    });

    const moving =
      Math.abs(tx - cx) + Math.abs(ty - cy) + Math.abs(hopY) + Math.abs(hopV) > 0.015;
    if (moving && !reduceMotion) raf = requestAnimationFrame(step);
  }

  function wake() {
    if (!raf && !reduceMotion) raf = requestAnimationFrame(step);
  }

  function boop(customMsg = null) {
    sound.play("boop");
    stage.classList.remove("is-dizzy");
    stage.classList.add("is-happy");
    clearTimeout(happyTimer);
    happyTimer = setTimeout(() => stage.classList.remove("is-happy"), 1150);

    if (!reduceMotion) {
      hopV = -9.5;
      wake();
    }
    wave.pulse(0.5, 0.48);
    showBadge(customMsg || AVATAR_LINES[boopIdx++ % AVATAR_LINES.length]);
  }

  const controlScope = stage.closest(".avatar-col") || stage;

  function toggleShades() {
    const on = !stage.classList.contains("has-shades");
    stage.classList.toggle("has-shades", on);
    controlScope
      .querySelectorAll('[data-avatar-act="shades"]')
      .forEach((b) => b.setAttribute("aria-pressed", String(on)));
    sound.play(on ? "shades" : "click");
    if (!reduceMotion) {
      hopV = -5.2;
      wake();
    }
    showBadge(on ? "Ship mode: shades on." : "Back to bright eyes.");
  }

  function triggerWave() {
    stage.classList.add("is-waving", "is-happy");
    sound.play("wave");
    if (!reduceMotion) {
      hopV = -6.5;
      wake();
    }
    wave.pulse(0.68, 0.42);
    showBadge("Hi! I'm SA Mubin.");
    clearTimeout(waveTimer);
    waveTimer = setTimeout(() => {
      stage.classList.remove("is-waving", "is-happy");
    }, 1850);
  }

  actorBtn.addEventListener("click", () => boop());

  controlScope.querySelectorAll("[data-avatar-act]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const act = btn.dataset.avatarAct;
      if (act === "boop") boop();
      else if (act === "shades") toggleShades();
      else if (act === "wave") triggerWave();
    });
  });

  // Pointer tracking across window for smooth 3D head & eye follow
  addEventListener(
    "pointermove",
    (e) => {
      if (reduceMotion || e.pointerType === "touch") return;
      const r = stage.getBoundingClientRect();
      if (r.bottom < -100 || r.top > innerHeight + 100) return;

      const centerX = r.left + r.width * 0.5;
      const centerY = r.top + r.height * 0.44;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      tx = Math.max(-1, Math.min(1, dx / 280));
      ty = Math.max(-1, Math.min(1, dy / 240));

      // Proximity smile widening
      const dist = Math.hypot(dx, dy);
      if (mouthCalm) {
        const smileDepth = dist < 240 ? 143 + (1 - dist / 240) * 4.5 : 143;
        mouthCalm.setAttribute("d", `M152 136 Q160 ${smileDepth.toFixed(1)} 168 136`);
      }

      // Update wave focal origin when cursor is near stage
      if (dist < 520) {
        const nx = (e.clientX - r.left) / Math.max(1, r.width);
        const ny = (e.clientY - r.top) / Math.max(1, r.height);
        wave.setFocus(nx * 0.65 + 0.1, ny * 0.65 + 0.15);
      }

      // Rapid circular cursor spin around head -> dizzy easter egg
      if (dist > 28 && dist < 240 && !stage.classList.contains("is-dizzy")) {
        const ang = Math.atan2(dy, dx);
        if (lastAngle !== null) {
          let delta = ang - lastAngle;
          if (delta > Math.PI) delta -= Math.PI * 2;
          if (delta < -Math.PI) delta += Math.PI * 2;
          spinAccum = spinAccum * 0.96 + Math.abs(delta);
          if (spinAccum > 13.5) {
            spinAccum = 0;
            stage.classList.add("is-dizzy");
            sound.play("boing");
            hopV = -8;
            showBadge("Whoa! 60fps spin cycle!", 2400);
            clearTimeout(dizzyTimer);
            dizzyTimer = setTimeout(() => stage.classList.remove("is-dizzy"), 2300);
          }
        }
        lastAngle = ang;
      }
      wake();
    },
    { passive: true }
  );

  // Natural idle blinking
  if (!reduceMotion) {
    const scheduleBlink = () => {
      setTimeout(() => {
        if (
          !stage.classList.contains("is-happy") &&
          !stage.classList.contains("is-dizzy") &&
          !stage.classList.contains("has-shades")
        ) {
          stage.classList.add("is-blinking");
          setTimeout(() => stage.classList.remove("is-blinking"), 150);
        }
        scheduleBlink();
      }, 2800 + Math.random() * 2800);
    };
    scheduleBlink();
  }

  // Pulse wave subtly when mechanical keys are pressed nearby
  sound.onWave(({ energy }) => {
    if (!reduceMotion && energy >= 0.85) wave.pulse();
  });

  stage._boop = boop;
  stage._wave = triggerWave;
  stage._pulse = () => wave.pulse();
}

export function notifyAvatarKeystroke() {
  document.querySelectorAll("[data-avatar]").forEach((s) => s._pulse && s._pulse());
}

export function celebrateAvatars(msg) {
  document.querySelectorAll("[data-avatar]").forEach((s) => s._boop && s._boop(msg));
}

export function initAvatars() {
  document.querySelectorAll("[data-avatar]").forEach(mountAvatarStage);
}
