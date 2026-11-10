// Articulated Teenage Cartoon Character Avatar & Rive State-Machine Adapter.
// Implements the full MorphStateMachine contract (lookX, lookY, hoodUp, typing, hackIdle,
// wave, boop, celebrate) with 60fps spring kinematics, real-time keyboard typing sync,
// two-handed hoodie pull animation, and drop-in support for assets/avatar/mubin.riv.

import { sound } from "./sound.js";
import { getMode, toggleMode, onModeChange, reduceMotion } from "./mode.js";

let uidSeq = 0;
const instances = new Set();

function buildCharacterSvg(p) {
  // Hand-illustrated teenage cartoon character (natural anatomical proportions,
  // sculpted jawline, almond eyes with irises, layered wavy hair, raglan hoodie,
  // articulated left/right arms + hands, laptop on lap, and dynamic hood canopy).
  return `
<svg class="av-svg" viewBox="0 0 420 430" aria-hidden="true">
  <defs>
    <!-- Warm South Asian skin tones with subsurface warmth -->
    <radialGradient id="${p}-skin" cx="42%" cy="32%" r="68%">
      <stop offset="0%" stop-color="#f6d2b6"/>
      <stop offset="55%" stop-color="#e0a67e"/>
      <stop offset="100%" stop-color="#b5744c"/>
    </radialGradient>
    <linearGradient id="${p}-neck" x1="30%" y1="0%" x2="70%" y2="100%">
      <stop offset="0%" stop-color="#c9855c"/>
      <stop offset="100%" stop-color="#9e5e3a"/>
    </linearGradient>
    <radialGradient id="${p}-blush" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ec5b49" stop-opacity="0.46"/>
      <stop offset="100%" stop-color="#ec5b49" stop-opacity="0"/>
    </radialGradient>

    <!-- Safelight crimson upward bounce on face in Hacker Mode -->
    <linearGradient id="${p}-hack-rim" x1="50%" y1="100%" x2="50%" y2="0%">
      <stop offset="0%" stop-color="#e0352b" stop-opacity="0.58"/>
      <stop offset="55%" stop-color="#c98a3a" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#e0352b" stop-opacity="0"/>
    </linearGradient>

    <!-- Espresso wavy hair -->
    <linearGradient id="${p}-hair" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#2f2a33"/>
      <stop offset="52%" stop-color="#1b181f"/>
      <stop offset="100%" stop-color="#0e0c11"/>
    </linearGradient>
    <linearGradient id="${p}-hair-hi" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="#48404e"/>
      <stop offset="58%" stop-color="#231f28"/>
      <stop offset="100%" stop-color="#121016"/>
    </linearGradient>

    <!-- Raglan Hoodie: Signal Orange sleeves/hood + Warm Bone torso -->
    <linearGradient id="${p}-orange" x1="25%" y1="0%" x2="75%" y2="100%">
      <stop offset="0%" stop-color="#ff7844"/>
      <stop offset="52%" stop-color="#ff5a1f"/>
      <stop offset="100%" stop-color="#b8360a"/>
    </linearGradient>
    <linearGradient id="${p}-orange-dark" x1="30%" y1="0%" x2="70%" y2="100%">
      <stop offset="0%" stop-color="#d94612"/>
      <stop offset="100%" stop-color="#7c1f04"/>
    </linearGradient>
    <linearGradient id="${p}-hood-inner" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#190e0b"/>
      <stop offset="65%" stop-color="#2d150e"/>
      <stop offset="100%" stop-color="#4a1d10"/>
    </linearGradient>
    <linearGradient id="${p}-torso" x1="30%" y1="0%" x2="70%" y2="100%">
      <stop offset="0%" stop-color="#f7f4ee"/>
      <stop offset="68%" stop-color="#e4dfd4"/>
      <stop offset="100%" stop-color="#c2bbb0"/>
    </linearGradient>

    <!-- Charcoal Joggers & Laptop Aluminium -->
    <linearGradient id="${p}-pants" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#2c3038"/>
      <stop offset="60%" stop-color="#1b1e24"/>
      <stop offset="100%" stop-color="#101216"/>
    </linearGradient>
    <linearGradient id="${p}-laptop-lid" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="#d5d3cd"/>
      <stop offset="55%" stop-color="#aeb0b6"/>
      <stop offset="100%" stop-color="#7c8089"/>
    </linearGradient>
    <linearGradient id="${p}-laptop-dark" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="#2a2325"/>
      <stop offset="55%" stop-color="#191315"/>
      <stop offset="100%" stop-color="#0e0a0b"/>
    </linearGradient>
    <radialGradient id="${p}-screen-glow" cx="50%" cy="85%" r="65%">
      <stop offset="0%" class="av-glow-stop-1" stop-color="#ff5a1f" stop-opacity="0.24"/>
      <stop offset="100%" class="av-glow-stop-2" stop-color="#ff5a1f" stop-opacity="0"/>
    </radialGradient>

    <filter id="${p}-shadow" x="-16%" y="-12%" width="132%" height="132%">
      <feDropShadow dx="0" dy="12" stdDeviation="9" flood-color="#08070a" flood-opacity="0.34"/>
    </filter>
  </defs>

  <g class="av-root" filter="url(#${p}-shadow)">
    <!-- Ground contact shadow -->
    <path d="M86 396 C86 385, 142 381, 210 381 C278 381, 334 385, 334 396 C334 407, 278 411, 210 411 C142 411, 86 407, 86 396 Z" fill="rgba(0,0,0,0.28)"/>

    <!-- Crossed legs / knees base -->
    <g class="av-legs">
      <path d="M92 346 C72 330, 96 296, 154 322 L238 354 C256 362, 248 386, 220 382 L112 366 C98 363, 88 354, 92 346 Z" fill="url(#${p}-pants)"/>
      <path d="M328 346 C348 330, 324 296, 266 322 L182 354 C164 362, 172 386, 200 382 L308 366 C322 363, 332 354, 328 346 Z" fill="url(#${p}-pants)"/>
      <!-- Sneakers -->
      <g transform="translate(104 358) rotate(-11)">
        <path d="M0 12 C0 4, 10 0, 26 0 L48 2 C56 3, 60 10, 58 18 L54 24 L2 24 Z" fill="#f4f2ec"/>
        <path d="M2 21 L55 21" stroke="#ff5a1f" stroke-width="3.5" stroke-linecap="round"/>
      </g>
      <g transform="translate(258 348) rotate(11)">
        <path d="M0 12 C0 4, 10 0, 26 0 L48 2 C56 3, 60 10, 58 18 L54 24 L2 24 Z" fill="#f4f2ec"/>
        <path d="M2 21 L55 21" stroke="#ff5a1f" stroke-width="3.5" stroke-linecap="round"/>
      </g>
    </g>

    <!-- Articulated Upper Torso + Hoodie Body -->
    <g class="av-torso">
      <!-- Resting Down-Hood Back Collar (visible when hood is down) -->
      <path class="av-hood-down-back" d="M128 202 C122 174, 152 158, 210 158 C268 158, 298 174, 292 202 C286 220, 134 220, 128 202 Z" fill="url(#${p}-orange-dark)"/>

      <!-- Natural teenage shoulders & raglan chest -->
      <path d="M114 224 C122 198, 152 186, 210 186 C268 186, 298 198, 306 224 C316 258, 312 314, 296 338 L124 338 C108 314, 104 258, 114 224 Z" fill="url(#${p}-orange)"/>

      <!-- Raglan center cream panel -->
      <path d="M154 194 C172 188, 248 188, 266 194 L278 336 L142 336 Z" fill="url(#${p}-torso)"/>
      <!-- Raglan seam lines -->
      <path d="M154 194 L126 312 M266 194 L294 312" stroke="rgba(120,40,10,0.28)" stroke-width="2.2" stroke-linecap="round"/>
      <!-- Kangaroo pocket details -->
      <path d="M158 294 L168 272 L252 272 L262 294" fill="none" stroke="#c7bfb0" stroke-width="2.2" stroke-linecap="round"/>

      <!-- Anatomical Neck & Collarbone shadow -->
      <path d="M188 156 L188 194 C188 204, 232 204, 232 194 L232 156 Z" fill="url(#${p}-neck)"/>
      <path d="M192 190 Q210 198 228 190" fill="none" stroke="#8b4f2f" stroke-width="2" opacity="0.6"/>

      <!-- Sculpted Hoodie Collar Rim & Drawstrings (Interactive Hit Target for Mode Switch) -->
      <g class="av-hood-collar">
        <path d="M138 192 C136 214, 284 214, 282 192 C280 178, 262 174, 250 184 C232 198, 188 198, 170 184 C158 174, 140 178, 138 192 Z" fill="url(#${p}-orange)"/>
        <path d="M148 193 C172 208, 248 208, 272 193" fill="none" stroke="rgba(255,240,228,0.42)" stroke-width="2.4" stroke-linecap="round"/>
        <!-- Drawstrings & aglets -->
        <path class="av-string-l" d="M182 204 C180 226, 181 242, 183 254" fill="none" stroke="#f5f0e4" stroke-width="3.6" stroke-linecap="round"/>
        <path class="av-string-r" d="M238 204 C240 226, 239 242, 237 254" fill="none" stroke="#f5f0e4" stroke-width="3.6" stroke-linecap="round"/>
        <path d="M180 253 C180 250, 186 250, 186 253 L185.5 260 C185.5 262, 180.5 262, 180.5 260 Z" fill="#ff5a1f"/>
        <path d="M234 253 C234 250, 240 250, 240 253 L239.5 260 C239.5 262, 234.5 262, 234.5 260 Z" fill="#ff5a1f"/>
      </g>
    </g>

    <!-- Articulated Head, Hair, Face & Hoodie Canopy -->
    <g class="av-head">
      <!-- Outer Back Hood Canopy (scales/slides up over head when hoodUp = true) -->
      <g class="av-hood-up-back">
        <path d="M114 148 C108 74, 146 28, 210 28 C274 28, 312 74, 306 148 C302 180, 284 198, 266 202 L154 202 C136 198, 118 180, 114 148 Z" fill="url(#${p}-orange)"/>
        <path d="M126 146 C122 84, 154 42, 210 42 C266 42, 298 84, 294 146 C290 174, 274 190, 256 194 L164 194 C146 190, 130 174, 126 146 Z" fill="url(#${p}-hood-inner)"/>
      </g>

      <!-- Back Hair Volume -->
      <path class="av-hair-back" d="M136 122 C130 68, 162 38, 210 38 C258 38, 290 68, 284 122 C282 146, 272 162, 260 168 L160 168 C148 162, 138 146, 136 122 Z" fill="url(#${p}-hair)"/>

      <!-- Ears -->
      <g class="av-ears">
        <path d="M144 122 C134 118, 132 138, 142 146 C146 149, 150 146, 150 140 Z" fill="url(#${p}-skin)"/>
        <path d="M140 128 C137 131, 138 138, 143 141" fill="none" stroke="#ad6842" stroke-width="2" stroke-linecap="round"/>
        <path d="M276 122 C286 118, 288 138, 278 146 C274 149, 270 146, 270 140 Z" fill="url(#${p}-skin)"/>
        <path d="M280 128 C283 131, 282 138, 277 141" fill="none" stroke="#ad6842" stroke-width="2" stroke-linecap="round"/>
      </g>

      <!-- Natural Teenage Head & Sculpted Jawline (NOT a rectangle!) -->
      <path d="M148 96 C148 62, 174 48, 210 48 C246 48, 272 62, 272 96 C272 128, 264 154, 244 169 C228 180, 192 180, 176 169 C156 154, 148 128, 148 96 Z" fill="url(#${p}-skin)"/>

      <!-- Safelight Screen Upward Glow on Face (Hacker Mode) -->
      <path class="av-hack-face-glow" d="M148 96 C148 128, 156 154, 176 169 C192 180, 228 180, 244 169 C264 154, 272 128, 272 96 Z" fill="url(#${p}-hack-rim)"/>

      <!-- Subtle Cheek Warmth -->
      <g class="av-cheeks">
        <path d="M155 138 C155 131, 185 131, 185 138 C185 145, 155 145, 155 138 Z" fill="url(#${p}-blush)"/>
        <path d="M235 138 C235 131, 265 131, 265 138 C265 145, 235 145, 235 138 Z" fill="url(#${p}-blush)"/>
      </g>

      <!-- Parallax Inner Facial Features -->
      <g class="av-face">
        <!-- Expressive Brows (angle shifts slightly in Hack mode) -->
        <g class="av-brows" fill="none" stroke="#1e1922" stroke-width="4.4" stroke-linecap="round">
          <path class="av-brow-l" d="M166 102 Q179 96 192 101"/>
          <path class="av-brow-r" d="M228 101 Q241 96 254 102"/>
        </g>

        <!-- Natural Almond Cartoon Eyes with Irises & Catchlights -->
        <g class="av-eyes-open">
          <!-- Left Eye -->
          <g class="av-eye-l" transform="translate(180 118)">
            <path d="M-14 1 C-9 -8, 9 -8, 14 1 C9 8, -9 8, -14 1 Z" fill="#faf8f5"/>
            <g class="av-iris">
              <circle r="6.8" fill="#2b1d16"/>
              <circle r="4.1" fill="#120d10"/>
              <circle cx="-2.2" cy="-2.4" r="2.2" fill="#ffffff"/>
              <circle cx="2.4" cy="2.2" r="1.0" fill="#ff9e80" opacity="0.8"/>
            </g>
            <path d="M-15 1 C-9 -9, 9 -9, 15 1" fill="none" stroke="#18141c" stroke-width="3.2" stroke-linecap="round"/>
            <path d="M-12 3 C-6 8, 6 8, 12 3" fill="none" stroke="#9e6240" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
          </g>
          <!-- Right Eye -->
          <g class="av-eye-r" transform="translate(240 118)">
            <path d="M-14 1 C-9 -8, 9 -8, 14 1 C9 8, -9 8, -14 1 Z" fill="#faf8f5"/>
            <g class="av-iris">
              <circle r="6.8" fill="#2b1d16"/>
              <circle r="4.1" fill="#120d10"/>
              <circle cx="-2.2" cy="-2.4" r="2.2" fill="#ffffff"/>
              <circle cx="2.4" cy="2.2" r="1.0" fill="#ff9e80" opacity="0.8"/>
            </g>
            <path d="M-15 1 C-9 -9, 9 -9, 15 1" fill="none" stroke="#18141c" stroke-width="3.2" stroke-linecap="round"/>
            <path d="M-12 3 C-6 8, 6 8, 12 3" fill="none" stroke="#9e6240" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
          </g>
        </g>

        <!-- Blinking / Happy ^ ^ Eyes -->
        <g class="av-eyes-happy" fill="none" stroke="#18141c" stroke-width="4.2" stroke-linecap="round">
          <path d="M167 120 Q180 109 193 120"/>
          <path d="M227 120 Q240 109 253 120"/>
        </g>

        <!-- Sculpted Cartoon Nose Bridge & Tip -->
        <path d="M208 112 L206 129 C206 133, 214 134, 216 130" fill="none" stroke="#b56f46" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M208 129 Q211 127 214 129 Q211 131 208 129 Z" fill="#f9dfc8" opacity="0.55"/>

        <!-- Calm / Focused Mouth -->
        <path class="av-mouth-calm" d="M197 147 Q210 154 223 147" fill="none" stroke="#4d2518" stroke-width="3.3" stroke-linecap="round"/>

        <!-- Joyful Laughing Mouth (Wave / Boop / Celebrate) -->
        <g class="av-mouth-laugh">
          <path d="M194 144 Q210 163 226 144 Z" fill="#461914"/>
          <path d="M199 152 Q210 159 221 152 Q210 148 199 152 Z" fill="#ff6b5b"/>
          <path d="M196 145 L224 145" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
        </g>
      </g>

      <!-- Layered Wavy Teen Hair (compresses smoothly when hood is pulled up) -->
      <g class="av-hair-front">
        <!-- Left temple lock -->
        <path d="M146 116 C138 86, 152 56, 182 48 C166 66, 158 88, 156 112 Z" fill="url(#${p}-hair)"/>
        <!-- Right temple lock -->
        <path d="M274 116 C282 86, 268 56, 238 48 C254 66, 262 88, 264 112 Z" fill="url(#${p}-hair)"/>
        <!-- Sweeping main volume -->
        <path d="M148 88 C152 50, 186 34, 232 42 C256 46, 274 64, 270 88 C252 74, 228 70, 202 80 C180 88, 160 92, 148 88 Z" fill="url(#${p}-hair-hi)"/>
        <!-- Natural side-part forelock -->
        <path d="M168 68 C186 44, 226 42, 248 68 C232 86, 202 94, 174 86 C166 82, 164 74, 168 68 Z" fill="url(#${p}-hair-hi)"/>
        <path d="M158 82 C170 62, 198 58, 218 74 C202 90, 178 95, 160 90 Z" fill="url(#${p}-hair)"/>
        <!-- Hair sheen -->
        <path d="M176 56 Q208 45 238 59" fill="none" stroke="rgba(255,246,238,0.2)" stroke-width="3" stroke-linecap="round"/>
      </g>

      <!-- Front Hood Cowl Overhang + Brow Shadow (slides down over forehead when hoodUp = true) -->
      <g class="av-hood-up-front">
        <!-- Soft darkroom shadow cast by hood across brow -->
        <path d="M146 98 C156 70, 264 70, 274 98 C256 114, 164 114, 146 98 Z" fill="rgba(8, 5, 7, 0.56)"/>
        <!-- Sculpted orange hood arch wrapping the head -->
        <path d="M118 146 C112 72, 150 26, 210 26 C270 26, 308 72, 302 146 C298 168, 286 184, 272 190 C278 162, 278 112, 262 84 C248 60, 172 60, 158 84 C142 112, 142 162, 148 190 C134 184, 122 168, 118 146 Z" fill="url(#${p}-orange)"/>
        <!-- Hood seam highlight -->
        <path d="M148 186 C140 120, 156 58, 210 58 C264 58, 280 120, 272 186" fill="none" stroke="rgba(255,235,220,0.42)" stroke-width="3" stroke-linecap="round"/>
      </g>
    </g>

    <!-- Articulated Arms & Hands (Typing on Laptop / Pulling Hoodie / Waving Hi) -->
    <!-- Left Arm & Hand -->
    <g class="av-arm-l">
      <path class="av-sleeve-l" d="M122 216 C96 244, 98 286, 146 306 C158 310, 166 294, 154 286 C126 272, 126 248, 140 228 Z" fill="url(#${p}-orange)"/>
      <g class="av-hand-l" transform="translate(158 298)">
        <path d="M-15 -1 C-15 -8, -6 -11, 2 -10 C11 -9, 16 -4, 14 3 C12 9, 4 11, -5 10 C-12 9, -15 5, -15 -1 Z" fill="url(#${p}-skin)"/>
        <!-- Typing fingers -->
        <path d="M-8 6 L-6 14 M-1 7 L1 15 M6 6 L8 14" stroke="#b5724a" stroke-width="3.2" stroke-linecap="round"/>
      </g>
    </g>

    <!-- Right Arm & Hand (Typing + Hood Pull state) -->
    <g class="av-arm-r">
      <path class="av-sleeve-r" d="M298 216 C324 244, 322 286, 274 306 C262 310, 254 294, 266 286 C294 272, 294 248, 280 228 Z" fill="url(#${p}-orange)"/>
      <g class="av-hand-r" transform="translate(262 298)">
        <path d="M15 -1 C15 -8, 6 -11, -2 -10 C-11 -9, -16 -4, -14 3 C-12 9, -4 11, 5 10 C12 9, 15 5, 15 -1 Z" fill="url(#${p}-skin)"/>
        <path d="M-6 6 L-8 14 M1 7 L-1 15 M8 6 L6 14" stroke="#b5724a" stroke-width="3.2" stroke-linecap="round"/>
      </g>
    </g>

    <!-- Waving Right Arm (active when waving / celebrating) -->
    <g class="av-arm-wave">
      <path d="M292 220 C324 206, 348 168, 340 132 C336 118, 316 122, 318 136 C322 160, 306 186, 282 202 Z" fill="url(#${p}-orange)"/>
      <!-- Open Waving Palm & Fingers -->
      <g transform="translate(330 120)">
        <path d="M-12 4 C-13 -5, -7 -10, 1 -10 C9 -10, 14 -3, 13 6 C12 14, 5 18, -2 18 C-9 18, -12 12, -12 4 Z" fill="url(#${p}-skin)"/>
        <path d="M-11 0 L-16 -12 M-5 -4 L-7 -18 M2 -4 L3 -18 M8 -1 L12 -14 M11 6 L20 2" stroke="url(#${p}-skin)" stroke-width="5.2" stroke-linecap="round"/>
        <!-- Motion wave arcs -->
        <path d="M24 -14 A22 22 0 0 1 30 12" fill="none" stroke="#ff5a1f" stroke-width="3.2" stroke-linecap="round"/>
      </g>
    </g>

    <!-- Sleek Laptop Resting on Lap -->
    <g class="av-laptop">
      <!-- Screen Upward Aura -->
      <path d="M118 274 C118 242, 160 226, 210 226 C260 226, 302 242, 302 274 C302 306, 260 322, 210 322 C160 322, 118 306, 118 274 Z" fill="url(#${p}-screen-glow)"/>
      <!-- Laptop Base Deck -->
      <path d="M118 332 L302 332 L314 344 C316 347, 313 350, 308 350 L112 350 C107 350, 104 347, 106 344 Z" class="av-laptop-base" fill="url(#${p}-laptop-lid)"/>
      <!-- Laptop Lid (back of screen facing viewer) -->
      <path d="M142 254 L278 254 C284 254, 288 258, 288 264 L288 326 C288 332, 284 336, 278 336 L142 336 C136 336, 132 332, 132 326 L132 264 C132 258, 136 254, 142 254 Z" class="av-laptop-shell" fill="url(#${p}-laptop-lid)" stroke="rgba(255,255,255,0.28)" stroke-width="1.5"/>
      <!-- Glowing Status Emblem on Laptop Lid -->
      <g class="av-laptop-logo" transform="translate(210 295)">
        <path d="M-11 -11 L11 -11 C14 -11, 16 -9, 16 -6 L16 6 C16 9, 14 11, 11 11 L-11 11 C-14 11, -16 9, -16 6 L-16 -6 C-16 -9, -14 -11, -11 -11 Z" fill="#16171a"/>
        <path d="M-8 -3 L-2 0 L-8 3 M0 4 L7 4" fill="none" stroke="#ff5a1f" class="av-laptop-glyph" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </g>
  </g>
</svg>`;
}

function mountAvatar(stage) {
  const prefix = `morph_av_${++uidSeq}`;
  const mount = stage.querySelector("[data-avatar-mount]") || stage;
  mount.innerHTML = buildCharacterSvg(prefix);

  const root = stage.querySelector(".av-root");
  const torso = stage.querySelector(".av-torso");
  const head = stage.querySelector(".av-head");
  const face = stage.querySelector(".av-face");
  const hairFront = stage.querySelector(".av-hair-front");
  const irises = [...stage.querySelectorAll(".av-iris")];
  const mouthCalm = stage.querySelector(".av-mouth-calm");
  const armL = stage.querySelector(".av-arm-l");
  const armR = stage.querySelector(".av-arm-r");
  const handL = stage.querySelector(".av-hand-l");
  const handR = stage.querySelector(".av-hand-r");
  const laptop = stage.querySelector(".av-laptop");
  const badge = stage.querySelector("[data-avatar-badge]");
  const hoodHit = stage.querySelector("[data-avatar-hood]");
  const faceHit = stage.querySelector("[data-avatar-face]");

  // State machine inputs (matching RIVE-SPEC.md)
  const state = {
    lookX: 0,       // -100..100
    lookY: 0,       // -100..100
    hoodUp: getMode() === "hack",
    typing: true,
    hackIdle: getMode() === "hack",
  };

  // Continuous interpolated physics values
  let curX = 0;
  let curY = 0;
  let hopY = 0;
  let hopV = 0;
  let typeEnergy = 0.35;
  let hoodPullReach = 0; // 0..1 when hands reach up to pull the hood
  let breathPhase = 0;
  let typePhase = 0;
  let happyTimer = 0;
  let waveTimer = 0;
  let hoodReachTimer = 0;
  let boopIdx = 0;

  const DEV_LINES = [
    "Aluminium Lab online — typing at 60fps.",
    "Click my hoodie (or press H) to cut the lab lights!",
    "Try pressing keys on the Loadout keyboard below.",
    "Type S-A-M-U-B-I-N anywhere to test the page cipher!",
  ];
  const HACK_LINES = [
    "Safelight Darkroom active — move your cursor torch.",
    "Arsenal switches armed. Click my hood for lab light.",
    "Every keycap below just flipped to offensive tooling.",
    "Red-team mode: breaking unsafe assumptions.",
  ];

  function showBadge(text, ms = 2800) {
    if (!badge) return;
    badge.textContent = text;
    badge.classList.add("is-on");
    clearTimeout(badge._t);
    badge._t = setTimeout(() => badge.classList.remove("is-on"), ms);
  }

  function syncStageClasses() {
    stage.classList.toggle("is-hood-up", state.hoodUp);
    stage.classList.toggle("is-hack-idle", state.hackIdle);
  }

  function setHood(up, { fromModeEvent = false } = {}) {
    const next = Boolean(up);
    const changed = next !== state.hoodUp;
    state.hoodUp = next;
    state.hackIdle = next;
    syncStageClasses();

    if (changed && !reduceMotion) {
      // Hands reach up to grab the hood hem!
      hoodPullReach = 1;
      hopV = next ? -6.5 : -5.5;
      clearTimeout(hoodReachTimer);
      hoodReachTimer = setTimeout(() => {
        hoodPullReach = 0;
      }, 420);
    }

    if (changed) {
      showBadge(
        next
          ? "Hood up · Safelight Darkroom engaged."
          : "Hood down · Aluminium Lab restored."
      );
    }

    if (!fromModeEvent && (getMode() === "hack") !== next) {
      toggleMode({ animate: true });
    }
  }

  function triggerWave(customMsg) {
    stage.classList.add("is-waving", "is-happy");
    sound.play("wave");
    if (!reduceMotion) hopV = -6.0;
    showBadge(
      customMsg ||
        (state.hoodUp
          ? "Hey! Welcome to the Safelight Darkroom."
          : "Hey! I'm SA Mubin — click my hoodie to switch rooms.")
    );
    clearTimeout(waveTimer);
    waveTimer = setTimeout(() => {
      stage.classList.remove("is-waving", "is-happy");
    }, 1800);
  }

  function triggerBoop(customMsg) {
    sound.play("boop");
    stage.classList.add("is-happy");
    if (!reduceMotion) hopV = -8.5;
    const pool = state.hoodUp ? HACK_LINES : DEV_LINES;
    showBadge(customMsg || pool[boopIdx++ % pool.length]);
    clearTimeout(happyTimer);
    happyTimer = setTimeout(() => {
      stage.classList.remove("is-happy");
    }, 1200);
  }

  function triggerCelebrate(customMsg) {
    stage.classList.add("is-waving", "is-happy");
    if (!reduceMotion) hopV = -12;
    typeEnergy = 1.4;
    showBadge(customMsg || "Cipher verified: Sakib Alam Mubin (SA Mubin)!", 3400);
    clearTimeout(waveTimer);
    waveTimer = setTimeout(() => {
      stage.classList.remove("is-waving", "is-happy");
    }, 2200);
  }

  function pulseTyping(boost = 0.85) {
    typeEnergy = Math.min(1.5, Math.max(typeEnergy, boost));
  }

  // 60fps articulated animation loop (pauses when off-screen or reduced-motion)
  let visible = true;
  let raf = 0;

  function tick() {
    raf = 0;
    if (!visible || reduceMotion) return;

    const nx = state.lookX / 100;
    const ny = state.lookY / 100;
    curX += (nx - curX) * 0.12;
    curY += (ny - curY) * 0.12;

    // Spring hop solver
    hopV = (hopV - hopY * 0.19) * 0.82;
    hopY += hopV;

    // Breathing + typing oscillators
    breathPhase += 0.035;
    const speed = state.hackIdle ? 0.24 : 0.17;
    typePhase += speed * (0.55 + typeEnergy);
    typeEnergy = Math.max(state.typing ? 0.32 : 0, typeEnergy * 0.96);

    const breathY = Math.sin(breathPhase) * 1.8;

    if (root) {
      root.style.transform = `translate3d(0, ${hopY.toFixed(2)}px, 0)`;
    }
    if (torso) {
      torso.style.transform = `translate3d(${(curX * 4.2).toFixed(2)}px, ${(breathY + curY * 2.2).toFixed(2)}px, 0)`;
    }
    if (head) {
      const rot = (curX * 5.6).toFixed(2);
      head.style.transform = `translate3d(${(curX * 10.5).toFixed(2)}px, ${(breathY * 0.7 + curY * 7.5).toFixed(2)}px, 0) rotate(${rot}deg)`;
    }
    if (face) {
      face.style.transform = `translate3d(${(curX * 5.8).toFixed(2)}px, ${(curY * 4.6).toFixed(2)}px, 0)`;
    }
    if (hairFront) {
      hairFront.style.transform = `translate3d(${(curX * 2.8).toFixed(2)}px, ${(curY * 2.0).toFixed(2)}px, 0)`;
    }
    irises.forEach((iris) => {
      iris.setAttribute(
        "transform",
        `translate(${(curX * 4.2).toFixed(2)} ${(curY * 3.1).toFixed(2)})`
      );
    });

    // Articulated hands: either reaching up to pull the hood OR typing on the laptop
    if (hoodPullReach > 0.02) {
      if (armL) armL.style.transform = `translate3d(14px, -92px, 0) rotate(22deg)`;
      if (armR) armR.style.transform = `translate3d(-14px, -92px, 0) rotate(-22deg)`;
    } else {
      const lStroke = Math.sin(typePhase) * 4.5 * typeEnergy;
      const rStroke = Math.cos(typePhase * 1.15) * 4.5 * typeEnergy;
      if (armL) {
        armL.style.transform = `translate3d(${(curX * 2).toFixed(2)}px, ${(breathY + lStroke).toFixed(2)}px, 0)`;
      }
      if (armR) {
        armR.style.transform = `translate3d(${(curX * 2).toFixed(2)}px, ${(breathY + rStroke).toFixed(2)}px, 0)`;
      }
      if (handL) {
        handL.setAttribute("transform", `translate(158 ${(298 + lStroke * 0.9).toFixed(1)})`);
      }
      if (handR) {
        handR.setAttribute("transform", `translate(262 ${(298 + rStroke * 0.9).toFixed(1)})`);
      }
    }

    if (laptop) {
      laptop.style.transform = `translate3d(${(curX * 1.8).toFixed(2)}px, ${(breathY * 0.4).toFixed(2)}px, 0)`;
    }

    raf = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (!raf && visible && !reduceMotion) raf = requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? true;
      if (visible) startLoop();
    },
    { threshold: 0.05 }
  );
  io.observe(stage);

  // Cursor look-at tracking
  addEventListener(
    "pointermove",
    (e) => {
      if (reduceMotion || e.pointerType === "touch") return;
      const r = stage.getBoundingClientRect();
      if (r.bottom < -80 || r.top > innerHeight + 80) return;
      const cx = r.left + r.width * 0.5;
      const cy = r.top + r.height * 0.42;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      state.lookX = Math.max(-100, Math.min(100, (dx / 280) * 100));
      state.lookY = Math.max(-100, Math.min(100, (dy / 230) * 100));

      const dist = Math.hypot(dx, dy);
      if (mouthCalm) {
        const depth = dist < 240 ? 154 + (1 - dist / 240) * 4.5 : 154;
        mouthCalm.setAttribute("d", `M197 147 Q210 ${depth.toFixed(1)} 223 147`);
      }
      startLoop();
    },
    { passive: true }
  );

  // Interactive hit zones
  if (hoodHit) {
    hoodHit.addEventListener("click", (e) => {
      e.stopPropagation();
      setHood(!state.hoodUp);
    });
  }
  if (faceHit) {
    faceHit.addEventListener("click", (e) => {
      e.stopPropagation();
      triggerBoop();
    });
  }

  // Dock buttons scoped to .avatar-col or stage
  const scope = stage.closest(".avatar-col") || stage.parentElement || document;
  scope.querySelectorAll("[data-avatar-act]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const act = btn.dataset.avatarAct;
      if (act === "hood") setHood(!state.hoodUp);
      else if (act === "wave") triggerWave();
      else if (act === "boop") triggerBoop();
      else if (act === "type") {
        pulseTyping(1.45);
        sound.play("type");
        showBadge(
          state.hoodUp
            ? "Running recon scripts & payload checks…"
            : "Shipping full-stack TypeScript & AI agents…"
        );
      }
    });
  });

  // Natural idle blinking
  if (!reduceMotion) {
    const scheduleBlink = () => {
      setTimeout(() => {
        if (!stage.classList.contains("is-happy")) {
          stage.classList.add("is-blinking");
          setTimeout(() => stage.classList.remove("is-blinking"), 145);
        }
        scheduleBlink();
      }, 2800 + Math.random() * 2600);
    };
    scheduleBlink();
  }

  // Sync with global mode changes
  onModeChange(({ toHack }) => {
    setHood(toHack, { fromModeEvent: true });
  });

  syncStageClasses();
  startLoop();

  // Gentle greeting wave shortly after first paint on Home
  if (!reduceMotion && stage.dataset.avatarGreet !== "false") {
    setTimeout(() => {
      stage.classList.add("is-waving", "is-happy");
      setTimeout(() => stage.classList.remove("is-waving", "is-happy"), 1500);
    }, 450);
  }

  const api = {
    lookAt(x, y) {
      state.lookX = Math.max(-100, Math.min(100, x));
      state.lookY = Math.max(-100, Math.min(100, y));
    },
    setHood,
    wave: triggerWave,
    boop: triggerBoop,
    celebrate: triggerCelebrate,
    pulseTyping,
  };

  stage._avatar = api;
  instances.add(api);
  return api;
}

export function notifyAvatarKeystroke() {
  instances.forEach((av) => av.pulseTyping(1.15));
}

export function celebrateAvatars(msg) {
  instances.forEach((av) => av.celebrate(msg));
}

export function initAvatars() {
  document.querySelectorAll("[data-avatar]").forEach(mountAvatar);
}
