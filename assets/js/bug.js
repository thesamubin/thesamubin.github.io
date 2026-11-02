// Pixel bug mascot: stands on horizontal ledges, walks, flutters away from cursor, click to triage (0..5).
import { sound } from "./sound.js";
import { reduceMotion, toast } from "./ui.js";

const KEY = "sam.bugs";
const TOTAL = 5;

const BUG_SVG = `
<svg viewBox="0 0 16 14" aria-hidden="true">
  <g class="wings" fill="#ece8df" fill-opacity="0.75">
    <rect x="2" y="2" width="4" height="3"/>
    <rect x="10" y="2" width="4" height="3"/>
  </g>
  <g class="shell">
    <rect x="5" y="1" width="1" height="2" fill="#ece8df"/>
    <rect x="10" y="1" width="1" height="2" fill="#ece8df"/>
    <rect x="5" y="3" width="6" height="2" fill="#1a1a1c"/>
    <rect x="6" y="3" width="1" height="1" fill="#ece8df"/>
    <rect x="9" y="3" width="1" height="1" fill="#ece8df"/>
    <rect x="4" y="5" width="8" height="5" fill="#ff5a1f"/>
    <rect x="3" y="6" width="10" height="3" fill="#ff5a1f"/>
    <rect x="5" y="5" width="2" height="1" fill="#ff9a73"/>
    <rect x="7" y="5" width="2" height="5" fill="#1a1a1c"/>
    <rect x="4" y="7" width="2" height="2" fill="#1a1a1c"/>
    <rect x="10" y="7" width="2" height="2" fill="#1a1a1c"/>
  </g>
  <g class="legs-a" fill="#ece8df">
    <rect x="3" y="10" width="1" height="3"/>
    <rect x="6" y="10" width="1" height="3"/>
    <rect x="9" y="10" width="1" height="3"/>
    <rect x="12" y="10" width="1" height="3"/>
  </g>
  <g class="legs-b" fill="#ece8df">
    <rect x="4" y="10" width="1" height="3"/>
    <rect x="7" y="10" width="1" height="3"/>
    <rect x="8" y="10" width="1" height="3"/>
    <rect x="11" y="10" width="1" height="3"/>
  </g>
</svg>`;

function getCount() {
  return Math.max(0, Math.min(TOTAL, parseInt(localStorage.getItem(KEY) || "0", 10) || 0));
}

function setCount(n) {
  const v = Math.max(0, Math.min(TOTAL, n));
  localStorage.setItem(KEY, String(v));
  syncMeters(v);
  return v;
}

export function syncMeters(count = getCount()) {
  document.querySelectorAll("[data-bugmeter]").forEach((el) => {
    const label = el.querySelector("[data-bugcount]");
    if (label) label.textContent = `${count}/${TOTAL}`;
    const dots = el.querySelectorAll(".bugmeter-dots i");
    dots.forEach((d, i) => d.classList.toggle("is-caught", i < count));
  });
  document.querySelectorAll("[data-hof]").forEach((el) => {
    el.hidden = count < TOTAL;
  });
}

export function initBugs() {
  syncMeters();

  document.querySelectorAll("[data-bug-reset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setCount(0);
      toast("Bug bounty reset — 5 fresh bugs loose on the site.");
      spawn();
    });
  });

  let bugEl = null;
  let ledges = [];
  let ledgeIdx = 0;
  let bx = 0;
  let by = 0;
  let dir = 1;
  let dodges = 0;
  let busy = false;
  let patrolTimer = 0;

  function collectLedges() {
    const candidates = [
      ...document.querySelectorAll(".bench, .work, .idcard, .contact-grid"),
    ];
    ledges = candidates.filter((el) => el.offsetParent !== null && el.getBoundingClientRect().width > 180);
  }

  function ledgeCoords(el, ratio = 0.72) {
    const r = el.getBoundingClientRect();
    const minX = r.left + scrollX + 24;
    const maxX = r.right + scrollX - 54;
    const x = minX + (maxX - minX) * Math.max(0.08, Math.min(0.92, ratio));
    const y = r.top + scrollY - 24;
    return { x, y, minX, maxX };
  }

  function place(x, y, flip = 1) {
    bx = x;
    by = y;
    if (bugEl) {
      bugEl.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scaleX(${flip})`;
    }
  }

  function flyTo(nextIdx) {
    if (!bugEl || busy || !ledges[nextIdx]) return;
    busy = true;
    ledgeIdx = nextIdx;
    const dest = ledgeCoords(ledges[ledgeIdx], 0.2 + Math.random() * 0.65);
    const sx = bx;
    const sy = by;
    const flip = dest.x >= sx ? 1 : -1;
    dir = flip;

    if (reduceMotion) {
      place(dest.x, dest.y, flip);
      busy = false;
      return;
    }

    sound.play("chirp");
    bugEl.classList.remove("is-walking");
    bugEl.classList.add("is-flying");
    const dur = 520;
    const arc = Math.min(90, 35 + Math.hypot(dest.x - sx, dest.y - sy) * 0.14);
    const t0 = performance.now();

    function frame(now) {
      if (!bugEl) return;
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      const cx = sx + (dest.x - sx) * e;
      const cy = sy + (dest.y - sy) * e - Math.sin(p * Math.PI) * arc;
      place(cx, cy, flip);
      if (p < 1) requestAnimationFrame(frame);
      else {
        bugEl.classList.remove("is-flying");
        busy = false;
      }
    }
    requestAnimationFrame(frame);
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
      let nx = bx + dir * (26 + Math.random() * 38);
      if (nx > l.maxX || nx < l.minX) {
        dir *= -1;
        nx = Math.max(l.minX, Math.min(l.maxX, bx + dir * 34));
      }
      busy = true;
      bugEl.classList.add("is-walking");
      const sx = bx;
      const sy = l.y;
      const t0 = performance.now();
      const dur = 420;
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
    }, 2200 + Math.random() * 2200);
  }

  function spawn() {
    if (getCount() >= TOTAL) return;
    collectLedges();
    if (!ledges.length) return;
    if (bugEl) bugEl.remove();

    bugEl = document.createElement("button");
    bugEl.type = "button";
    bugEl.className = "bug";
    bugEl.setAttribute("aria-label", "Report runaway security bug");
    bugEl.innerHTML = BUG_SVG;
    document.body.append(bugEl);

    ledgeIdx = Math.min(ledges.length - 1, Math.floor(Math.random() * Math.min(2, ledges.length)));
    dodges = 0;
    busy = false;
    const c = ledgeCoords(ledges[ledgeIdx], 0.78);
    place(c.x, c.y, 1);

    bugEl.addEventListener("click", () => {
      if (!bugEl || bugEl.classList.contains("is-caught")) return;
      clearTimeout(patrolTimer);
      bugEl.classList.remove("is-walking", "is-flying");
      bugEl.classList.add("is-caught");
      const next = setCount(getCount() + 1);
      if (next >= TOTAL) {
        sound.play("auth");
        toast(`5/${TOTAL} bugs triaged — Hall of Fame unlocked in the footer.`, { auth: true, ms: 4400 });
      } else {
        sound.play("catch");
        toast(`Bug reported (${next}/${TOTAL}) — ${TOTAL - next} still loose.`);
      }
      const dead = bugEl;
      bugEl = null;
      setTimeout(() => dead.remove(), 600);
      if (next < TOTAL) setTimeout(spawn, 2000);
    });

    patrol();
  }

  // Skittish flee when desktop pointer approaches (up to 2 dodges per bug so it stays catchable)
  let fleePending = false;
  addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse" || !bugEl || busy || fleePending || dodges >= 2 || reduceMotion) return;
      if (ledges.length < 2) return;
      const px = e.clientX + scrollX;
      const py = e.clientY + scrollY;
      const d = Math.hypot(px - (bx + 15), py - (by + 13));
      if (d < 64) {
        fleePending = true;
        setTimeout(() => {
          fleePending = false;
          if (!bugEl || busy) return;
          dodges++;
          const next = (ledgeIdx + 1 + Math.floor(Math.random() * (ledges.length - 1))) % ledges.length;
          flyTo(next);
        }, 165);
      }
    },
    { passive: true }
  );

  addEventListener(
    "resize",
    () => {
      collectLedges();
      if (bugEl && ledges[ledgeIdx] && !busy) {
        const c = ledgeCoords(ledges[ledgeIdx], 0.75);
        place(c.x, c.y, dir);
      }
    },
    { passive: true }
  );

  spawn();
}
