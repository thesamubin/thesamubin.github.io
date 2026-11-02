// Hanging hardware security keypad: damped spring-cable physics + tactile keys + auth sequence.
import { sound } from "./sound.js";
import { reduceMotion, toast, crypt, cryptVisible } from "./ui.js";

export function initKeypad() {
  const rig = document.querySelector("[data-rig]");
  if (!rig) return;
  const pad = rig.querySelector(".pad");
  const led = rig.querySelector(".pad-led");
  const cable = rig.querySelector(".rig-cable");
  const pathShadow = cable?.querySelector(".cable-shadow");
  const pathBody = cable?.querySelector(".cable-body");
  const pathSpec = cable?.querySelector(".cable-spec");
  const caps = [...rig.querySelectorAll(".cap")];
  if (!pad || !cable) return;

  let ax = 0;
  let restY = 128;
  let x = 0;
  let y = 128;
  let vx = 0;
  let vy = 0;
  let ang = 0;
  let vang = 0;
  let raf = 0;
  let dragging = false;
  let dragMoved = false;
  let pointerId = null;
  let grabDx = 0;
  let grabDy = 0;
  let ledTimer = 0;
  let buffer = "";

  function measure(resetPos = false) {
    const r = rig.getBoundingClientRect();
    const mobile = innerWidth <= 860;
    ax = mobile ? r.width * 0.5 : Math.min(r.width - pad.offsetWidth * 0.52, r.width * 0.56);
    restY = mobile ? 66 : Math.max(108, Math.min(165, r.height * 0.24));
    if (resetPos) {
      x = ax + (reduceMotion ? 0 : 18);
      y = restY - (reduceMotion ? 0 : 14);
      ang = reduceMotion ? 0 : 0.06;
    }
    draw();
  }

  function draw() {
    const pw = pad.offsetWidth;
    const left = x - pw / 2;
    const deg = (ang * 180) / Math.PI;
    pad.style.transform = `translate3d(${left.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${deg.toFixed(2)}deg)`;

    const portX = x + Math.sin(ang) * 6;
    const portY = y - Math.cos(ang) * 6;
    const sag = Math.max(36, (portY + 10) * 0.52);
    const c1x = ax;
    const c1y = -10 + sag;
    const c2x = portX - Math.sin(ang) * sag * 0.7;
    const c2y = portY - Math.cos(ang) * sag * 0.7;
    const d = `M ${ax.toFixed(1)} -12 C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${portX.toFixed(1)} ${portY.toFixed(1)}`;
    pathShadow?.setAttribute("d", d);
    pathBody?.setAttribute("d", d);
    pathSpec?.setAttribute("d", d);
  }

  function step() {
    raf = 0;
    if (!dragging) {
      const fx = (ax - x) * 0.085;
      const fy = (restY - y) * 0.095;
      vx = (vx + fx) * 0.86;
      vy = (vy + fy) * 0.86;
      x += vx;
      y += vy;

      const targetAng = Math.max(-0.38, Math.min(0.38, (x - ax) * 0.0024 + vx * 0.012));
      vang = (vang + (targetAng - ang) * 0.14) * 0.84;
      ang += vang;
    }
    draw();
    const energy = Math.abs(vx) + Math.abs(vy) + Math.abs(vang) + Math.abs(ax - x) * 0.02 + Math.abs(restY - y) * 0.02;
    if (dragging || energy > 0.015) {
      raf = requestAnimationFrame(step);
    } else {
      x = ax;
      y = restY;
      ang = 0;
      draw();
    }
  }

  function wake() {
    if (!raf && !reduceMotion) raf = requestAnimationFrame(step);
    else if (reduceMotion) {
      x = ax;
      y = restY;
      ang = 0;
      draw();
    }
  }

  function flashLed(kind = "is-on", ms = 180) {
    if (!led) return;
    clearTimeout(ledTimer);
    led.classList.remove("is-on", "is-auth");
    led.classList.add(kind);
    ledTimer = setTimeout(() => led.classList.remove("is-on", "is-auth"), ms);
  }

  function triggerCap(cap, fromKeyboard = false) {
    if (!cap) return;
    const key = (cap.dataset.key || "").toLowerCase();
    const idx = caps.indexOf(cap);
    const col = idx >= 0 ? idx % 4 : 1.5;

    cap.classList.add("is-down");
    sound.play("down");
    if (!reduceMotion) {
      vy += 2.6;
      vx += (col - 1.5) * 0.7;
      vang += (col - 1.5) * 0.022;
      wake();
    }

    if (key === "lock") {
      flashLed("is-auth", 1400);
      sound.play("whoosh");
      cryptVisible();
      toast("Hardware cipher pass — headings decrypted.", { auth: true });
    } else {
      flashLed("is-on", 200);
      buffer = (buffer + key).slice(-12);
      if (buffer.endsWith("samubin") || buffer.endsWith("mubin")) {
        buffer = "";
        flashLed("is-auth", 3200);
        setTimeout(() => sound.play("auth"), 70);
        crypt(document.querySelector(".hero-name"), { hold: 220, dur: 760 });
        toast("Token verified: Sakib Alam Mubin (SA Mubin)", { auth: true });
      }
    }

    if (fromKeyboard) {
      setTimeout(() => {
        cap.classList.remove("is-down");
        sound.play("up");
      }, 130);
    }
  }

  // Pointer drag on pad chassis (and drag threshold if started on a cap)
  let startX = 0;
  let startY = 0;
  let pressedCap = null;

  pad.addEventListener("pointerdown", (e) => {
    if (e.button && e.button !== 0) return;
    const cap = e.target.closest(".cap");
    pointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    dragMoved = false;
    const r = rig.getBoundingClientRect();
    grabDx = e.clientX - r.left - x;
    grabDy = e.clientY - r.top - y;

    if (cap) {
      pressedCap = cap;
      triggerCap(cap, false);
    } else if (!reduceMotion) {
      dragging = true;
      pad.classList.add("is-dragging");
      pad.setPointerCapture(pointerId);
      wake();
    }
  });

  addEventListener("pointermove", (e) => {
    if (pointerId === null || e.pointerId !== pointerId) return;
    const moved = Math.hypot(e.clientX - startX, e.clientY - startY);
    if (!dragging && !reduceMotion && moved > 9) {
      dragging = true;
      dragMoved = true;
      if (pressedCap) {
        pressedCap.classList.remove("is-down");
        pressedCap = null;
      }
      pad.classList.add("is-dragging");
      try { pad.setPointerCapture(pointerId); } catch {}
      wake();
    }
    if (!dragging) return;
    const r = rig.getBoundingClientRect();
    const nx = e.clientX - r.left - grabDx;
    const ny = e.clientY - r.top - grabDy;
    const dx = nx - ax;
    const dy = Math.max(24, ny) - restY;
    const dist = Math.hypot(dx, dy);
    const maxR = innerWidth <= 860 ? 95 : 175;
    const scale = dist > maxR ? maxR / dist : 1;
    const tx = ax + dx * scale;
    const ty = restY + dy * scale;
    vx = (tx - x) * 0.45;
    vy = (ty - y) * 0.45;
    x = tx;
    y = ty;
    ang = Math.max(-0.45, Math.min(0.45, (x - ax) * 0.0028 + vx * 0.01));
    draw();
  });

  function endPointer(e) {
    if (pointerId === null || (e.pointerId !== undefined && e.pointerId !== pointerId)) return;
    if (pressedCap) {
      pressedCap.classList.remove("is-down");
      sound.play("up");
      pressedCap = null;
    }
    if (dragging) {
      dragging = false;
      pad.classList.remove("is-dragging");
      wake();
    }
    pointerId = null;
  }
  addEventListener("pointerup", endPointer);
  addEventListener("pointercancel", endPointer);

  // Prevent synthetic click re-triggering after pointer handling, while keeping keyboard Enter/Space working
  caps.forEach((cap) => {
    cap.addEventListener("click", (e) => {
      if (dragMoved) {
        e.preventDefault();
        return;
      }
      // Keyboard Enter/Space fires click with detail === 0
      if (e.detail === 0) triggerCap(cap, true);
    });
  });

  // Real physical keyboard support when hero is visible and user is not typing in a field
  document.addEventListener("keydown", (e) => {
    if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.getElementById("palette")?.open) return;
    if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;
    const r = rig.getBoundingClientRect();
    if (r.bottom < 40 || r.top > innerHeight) return;

    const k = e.key.toLowerCase();
    const match = caps.find((c) => c.dataset.key === k);
    if (match) triggerCap(match, true);
  });

  addEventListener("resize", () => measure(false), { passive: true });
  measure(true);
  wake();
}

