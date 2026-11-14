// Funny comic production bug mascot: perches on card/section ledges, eyeballs the cursor,
// mutters classic dev excuses in a speech bubble, and cycles 5 cartoon gags when poked!
import { sound } from "./sound.js";
import { reduceMotion } from "./mode.js";

const BUG_SVG = `
<svg viewBox="0 0 24 22" aria-hidden="true">
  <!-- Rocket booster flame (shown during rocket gag) -->
  <g class="bug-jet">
    <path d="M9 19 L12 25 L15 19 Z" fill="#facc15"/>
    <path d="M10 19 L12 23 L14 19 Z" fill="#ff5a1f"/>
  </g>
  <!-- Fluttering wings -->
  <g class="wings" fill="#ece8df" fill-opacity="0.88" stroke="var(--bug-wing-edge, #1a1a1c)" stroke-width="0.65">
    <ellipse cx="6" cy="7" rx="4.2" ry="2.4" transform="rotate(-18 6 7)"/>
    <ellipse cx="18" cy="7" rx="4.2" ry="2.4" transform="rotate(18 18 7)"/>
  </g>
  <g class="shell">
    <!-- Antennae -->
    <path d="M9 5 Q7 1.5 5.5 2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M15 5 Q17 1.5 18.5 2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    <!-- Shell body -->
    <rect x="5" y="8" width="14" height="9" rx="4.5" fill="#ff5a1f"/>
    <path d="M12 8 L12 17" stroke="#1a1a1c" stroke-width="1.6"/>
    <circle cx="8.5" cy="12" r="1.3" fill="#1a1a1c"/>
    <circle cx="15.5" cy="12" r="1.3" fill="#1a1a1c"/>
    <ellipse cx="9" cy="9.6" rx="2.2" ry="0.9" fill="#ff9e78" opacity="0.8"/>
    <!-- Head -->
    <rect x="6.5" y="4" width="11" height="5.5" rx="2.7" fill="#1a1a1c"/>
    <!-- Goofy cartoon eyes -->
    <g class="bug-eyes-open">
      <circle cx="9.5" cy="6.6" r="2.1" fill="#ffffff"/>
      <circle class="bug-pupil" cx="9.8" cy="6.6" r="1.05" fill="#111215"/>
      <circle cx="14.5" cy="6.6" r="2.1" fill="#ffffff"/>
      <circle class="bug-pupil" cx="14.8" cy="6.6" r="1.05" fill="#111215"/>
    </g>
    <!-- X_X fainted eyes -->
    <g class="bug-eyes-ko" stroke="#facc15" stroke-width="1.2" stroke-linecap="round">
      <path d="M8.3 5.5 L10.7 7.7 M10.7 5.5 L8.3 7.7"/>
      <path d="M13.3 5.5 L15.7 7.7 M15.7 5.5 L13.3 7.7"/>
    </g>
    <!-- Pixel "Deal With It" shades -->
    <g class="bug-shades">
      <rect x="6.2" y="5.1" width="5.4" height="3.1" rx="0.6" fill="#0b0c0f" stroke="#38bdf8" stroke-width="0.7"/>
      <rect x="12.4" y="5.1" width="5.4" height="3.1" rx="0.6" fill="#0b0c0f" stroke="#38bdf8" stroke-width="0.7"/>
      <line x1="11.6" y1="6.2" x2="12.4" y2="6.2" stroke="#38bdf8" stroke-width="0.9"/>
    </g>
  </g>
  <!-- Walking legs -->
  <g class="legs-a" stroke="currentColor" stroke-width="1.45" stroke-linecap="round">
    <line x1="6.5" y1="16.5" x2="5" y2="20"/>
    <line x1="10" y1="17" x2="9.5" y2="20.2"/>
    <line x1="14" y1="17" x2="14.5" y2="20.2"/>
    <line x1="17.5" y1="16.5" x2="19" y2="20"/>
  </g>
  <g class="legs-b" stroke="currentColor" stroke-width="1.45" stroke-linecap="round">
    <line x1="6.5" y1="16.5" x2="7.5" y2="20"/>
    <line x1="10" y1="17" x2="11" y2="20.2"/>
    <line x1="14" y1="17" x2="13" y2="20.2"/>
    <line x1="17.5" y1="16.5" x2="16.5" y2="20"/>
  </g>
</svg>`;

const WHISPERS = [
  "Shh... I'm an undocumented feature.",
  "It works on my machine!",
  "Please don't git blame me.",
  "Careful, I'm load-bearing!",
  "I survived three code reviews.",
  "Blame CSS specificity, not me!",
];

export function initBugs() {
  let wrapEl = null;
  let bugEl = null;
  let bubbleEl = null;
  let ledges = [];
  let ledgeIdx = 0;
  let bx = 0;
  let by = 0;
  let dir = 1;
  let busy = false;
  let gagIdx = 0;
  let whisperIdx = 0;
  let lastWhisperAt = 0;
  let patrolTimer = 0;
  let bubbleTimer = 0;

  function collectLedges() {
    const candidates = [
      ...document.querySelectorAll(
        ".site-footer, .avatar-dock"
      ),
    ];
    ledges = candidates.filter(
      (el) => el.offsetParent !== null && el.getBoundingClientRect().width > 180
    );
  }

  function ledgeCoords(el, ratio = 0.76) {
    const r = el.getBoundingClientRect();
    const minX = r.left + scrollX + 26;
    const maxX = Math.max(minX + 10, r.right + scrollX - 62);
    const x = minX + (maxX - minX) * Math.max(0.1, Math.min(0.9, ratio));
    const y = r.top + scrollY - 28;
    return { x, y, minX, maxX };
  }

  function syncBubbleSide(x = bx, y = by) {
    if (!bubbleEl) return;
    const vw = document.documentElement.clientWidth;
    const viewX = x - scrollX;
    let shift = 0;
    if (viewX < 135) shift = 135 - viewX;
    else if (viewX > vw - 135) shift = vw - 135 - viewX;
    bubbleEl.style.setProperty("--b-shift", `${shift.toFixed(0)}px`);

    const headerEl = document.querySelector(".site-header");
    const headerBottom = headerEl ? headerEl.getBoundingClientRect().bottom : 74;
    bubbleEl.classList.toggle("is-below", y - scrollY < headerBottom + 48);
  }

  function place(x, y, flip = 1) {
    bx = x;
    by = y;
    if (!wrapEl || !bugEl) return;
    wrapEl.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    bugEl.querySelector("svg").style.transform = `scaleX(${flip})`;
    // Keep speech bubble safely inside viewport and clear of the sticky header
    syncBubbleSide(x, y);
  }

  function say(text, ms = 2800) {
    if (!bubbleEl) return;
    bubbleEl.textContent = text;
    place(bx, by, dir);
    bubbleEl.classList.add("is-on");
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => bubbleEl.classList.remove("is-on"), ms);
  }

  function flyTo(nextIdx, { loopArc = false, afterMsg = null } = {}) {
    if (!wrapEl || !ledges[nextIdx]) return;
    busy = true;
    ledgeIdx = nextIdx;
    const dest = ledgeCoords(ledges[ledgeIdx], 0.22 + Math.random() * 0.62);
    const sx = bx;
    const sy = by;
    dir = dest.x >= sx ? 1 : -1;

    if (reduceMotion) {
      place(dest.x, dest.y, dir);
      busy = false;
      if (afterMsg) say(afterMsg, 2800);
      return;
    }

    bugEl.classList.remove("is-walking");
    bugEl.classList.add("is-flying");
    if (loopArc) bugEl.classList.add("is-jet");
    const dur = loopArc ? 760 : 540;
    const arc = loopArc ? 135 : Math.min(85, 34 + Math.hypot(dest.x - sx, dest.y - sy) * 0.13);
    const t0 = performance.now();

    function frame(now) {
      if (!wrapEl) return;
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      const cx = sx + (dest.x - sx) * e;
      const cy = sy + (dest.y - sy) * e - Math.sin(p * Math.PI) * arc;
      place(cx, cy, dir);
      if (p < 1) requestAnimationFrame(frame);
      else {
        bugEl.classList.remove("is-flying", "is-jet");
        busy = false;
        if (afterMsg) say(afterMsg, 3000);
        patrol();
      }
    }
    requestAnimationFrame(frame);
  }

  function spawnTwin() {
    if (!wrapEl) return;
    const twin = document.createElement("div");
    twin.className = "bug bug--twin is-walking";
    twin.setAttribute("aria-hidden", "true");
    twin.innerHTML = BUG_SVG;
    document.body.append(twin);

    const startX = bx;
    const targetX = Math.min(document.documentElement.clientWidth - 48, bx + (dir > 0 ? 40 : -40));
    const sy = by;
    const t0 = performance.now();

    function hop(now) {
      const p = Math.min(1, (now - t0) / 360);
      const cx = startX + (targetX - startX) * p;
      const cy = sy - Math.sin(p * Math.PI) * 24;
      twin.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) scale(0.86)`;
      if (p < 1) requestAnimationFrame(hop);
    }
    if (!reduceMotion) requestAnimationFrame(hop);
    else twin.style.transform = `translate3d(${targetX}px, ${sy}px, 0) scale(0.86)`;

    setTimeout(() => {
      twin.classList.add("is-poof");
      setTimeout(() => twin.remove(), 350);
    }, 2400);
  }

  function runGag() {
    if (!bugEl || busy) return;
    clearTimeout(patrolTimer);
    const gag = gagIdx++ % 5;

    if (gag === 0) {
      // Gag 1: Deal-With-It pixel sunglasses
      bugEl.classList.toggle("has-shades", true);
      bugEl.classList.remove("is-faint");
      sound.play("taDa");
      say("Closed as: Works on my machine!", 3200);
      patrol();
    } else if (gag === 1) {
      // Gag 2: Dramatic soap-opera faint upside down
      busy = true;
      bugEl.classList.remove("has-shades", "is-walking");
      bugEl.classList.add("is-faint");
      sound.play("slide");
      say("Tell main... I was just a missing semicolon...", 2500);
      setTimeout(() => {
        if (!bugEl) return;
        bugEl.classList.remove("is-faint");
        sound.play("pop");
        say("jk! Hotfix reverted, I'm back!", 2400);
        busy = false;
        patrol();
      }, 2400);
    } else if (gag === 2) {
      // Gag 3: Classic mitosis — fix 1 bug, create 2!
      sound.play("pop");
      spawnTwin();
      say("Classic fix: squashed 1, spawned 2!", 3000);
      patrol();
    } else if (gag === 3) {
      // Gag 4: Friday 5pm espresso turbo sprint
      busy = true;
      sound.play("boing");
      say("Had 4 espressos — pushing straight to prod!", 2800);
      const l = ledgeCoords(ledges[ledgeIdx] || document.body, 0.5);
      const originX = bx;
      const t0 = performance.now();
      bugEl.classList.add("is-walking");
      const sprint = (now) => {
        if (!bugEl) return;
        const p = Math.min(1, (now - t0) / 900);
        const wave = Math.sin(p * Math.PI * 6) * 28;
        const nx = Math.max(l.minX, Math.min(l.maxX, originX + wave));
        place(nx, l.y, Math.cos(p * Math.PI * 6) >= 0 ? 1 : -1);
        if (p < 1 && !reduceMotion) requestAnimationFrame(sprint);
        else {
          bugEl.classList.remove("is-walking");
          busy = false;
          patrol();
        }
      };
      requestAnimationFrame(sprint);
    } else {
      // Gag 5: Rocket evacuation to another ledge
      sound.play("whoosh");
      setTimeout(() => sound.play("boing"), 140);
      if (ledges.length > 1) {
        const next = (ledgeIdx + 1) % ledges.length;
        say("Evacuating before unit tests run!", 1600);
        flyTo(next, { loopArc: true, afterMsg: "Ticket closed: Cannot reproduce!" });
      } else {
        say("Ticket closed: Cannot reproduce!", 2800);
        patrol();
      }
    }
  }

  function patrol() {
    clearTimeout(patrolTimer);
    if (!bugEl || reduceMotion) return;
    patrolTimer = setTimeout(() => {
      if (!bugEl || busy || !ledges[ledgeIdx]) {
        patrol();
        return;
      }
      const l = ledgeCoords(ledges[ledgeIdx], 0.5);
      let nx = bx + dir * (22 + Math.random() * 34);
      if (nx > l.maxX || nx < l.minX) {
        dir *= -1;
        nx = Math.max(l.minX, Math.min(l.maxX, bx + dir * 28));
      }
      busy = true;
      bugEl.classList.add("is-walking");
      const sx = bx;
      const sy = l.y;
      const t0 = performance.now();
      const dur = 430;
      function step(now) {
        if (!bugEl) return;
        const p = Math.min(1, (now - t0) / dur);
        place(sx + (nx - sx) * p, sy, dir);
        if (p < 1) requestAnimationFrame(step);
        else {
          bugEl.classList.remove("is-walking");
          busy = false;
          patrol();
        }
      }
      requestAnimationFrame(step);
    }, 2600 + Math.random() * 2400);
  }

  function spawn() {
    collectLedges();
    if (!ledges.length) return;
    if (wrapEl) wrapEl.remove();

    wrapEl = document.createElement("div");
    wrapEl.className = "bug-wrap";

    bubbleEl = document.createElement("span");
    bubbleEl.className = "bug-bubble";
    bubbleEl.setAttribute("role", "status");
    bubbleEl.setAttribute("aria-live", "polite");

    bugEl = document.createElement("button");
    bugEl.type = "button";
    bugEl.className = "bug";
    bugEl.setAttribute("aria-label", "Poke the roving production bug");
    bugEl.innerHTML = BUG_SVG;

    wrapEl.append(bubbleEl, bugEl);
    document.body.append(wrapEl);

    ledgeIdx = 0;
    const c = ledgeCoords(ledges[ledgeIdx], 0.78);
    place(c.x, c.y, 1);

    bugEl.addEventListener("click", runGag);
    bugEl.addEventListener("pointerenter", () => {
      const now = performance.now();
      if (!busy && now - lastWhisperAt > 3600) {
        lastWhisperAt = now;
        sound.play("chirp");
        say(WHISPERS[whisperIdx++ % WHISPERS.length], 2400);
      }
    });

    patrol();
  }

  // Track bug pupils toward pointer when nearby
  addEventListener(
    "pointermove",
    (e) => {
      if (!bugEl || reduceMotion || e.pointerType === "touch") return;
      const px = e.clientX + scrollX;
      const py = e.clientY + scrollY;
      const dx = px - (bx + 17);
      const dy = py - (by + 14);
      const d = Math.hypot(dx, dy);
      if (d < 280) {
        const ox = (dx / Math.max(1, d)) * 0.75 * dir;
        const oy = (dy / Math.max(1, d)) * 0.65;
        const pupils = bugEl.querySelectorAll(".bug-pupil");
        if (pupils[0]) {
          pupils[0].setAttribute("cx", (9.5 + ox).toFixed(2));
          pupils[0].setAttribute("cy", (6.6 + oy).toFixed(2));
        }
        if (pupils[1]) {
          pupils[1].setAttribute("cx", (14.5 + ox).toFixed(2));
          pupils[1].setAttribute("cy", (6.6 + oy).toFixed(2));
        }
      }
    },
    { passive: true }
  );

  addEventListener(
    "scroll",
    () => {
      if (bubbleEl && bubbleEl.classList.contains("is-on")) syncBubbleSide();
    },
    { passive: true }
  );

  function reanchor() {
    collectLedges();
    if (wrapEl && ledges[ledgeIdx] && !busy) {
      const c = ledgeCoords(ledges[ledgeIdx], 0.76);
      place(c.x, c.y, dir);
    }
  }

  addEventListener("resize", reanchor, { passive: true });

  // Re-perch immediately when toggling Dev <-> Hacker mode shifts mobile card offsets
  new MutationObserver(() => requestAnimationFrame(reanchor)).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-mode"],
  });

  spawn();
}
