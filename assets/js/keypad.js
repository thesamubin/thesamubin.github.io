// Hanging S-A-M-U-B-I-N hardware keypad suspended below the Hero section.
// Damped Hooke's-law spring-cable physics + tactile key travel + mode-aware LED.

import { sound } from "./sound.js";
import { reduceMotion } from "./mode.js";
import { triggerSamubinCipher } from "./keyboard.js";

let padApi = null;

export function flashKeypadAuth(ms = 2800) {
  padApi?.flashLed("is-auth", ms);
}

export function pressKeypadLetter(ch) {
  padApi?.pressByChar(ch);
}

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
  let restY = 58;
  let x = 0;
  let y = 58;
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
    ax = r.width * 0.5;
    restY = innerWidth <= 760 ? 44 : 56;
    if (resetPos) {
      x = ax + (reduceMotion ? 0 : 14);
      y = restY - (reduceMotion ? 0 : 10);
      ang = reduceMotion ? 0 : 0.045;
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
    const sag = Math.max(26, (portY + 8) * 0.5);
    const c1x = ax;
    const c1y = -6 + sag;
    const c2x = portX - Math.sin(ang) * sag * 0.68;
    const c2y = portY - Math.cos(ang) * sag * 0.68;
    const d = `M ${ax.toFixed(1)} -6 C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${portX.toFixed(1)} ${portY.toFixed(1)}`;
    pathShadow?.setAttribute("d", d);
    pathBody?.setAttribute("d", d);
    pathSpec?.setAttribute("d", d);
  }

  function step() {
    raf = 0;
    if (!dragging) {
      const fx = (ax - x) * 0.088;
      const fy = (restY - y) * 0.098;
      vx = (vx + fx) * 0.85;
      vy = (vy + fy) * 0.85;
      x += vx;
      y += vy;

      const targetAng = Math.max(-0.34, Math.min(0.34, (x - ax) * 0.0024 + vx * 0.011));
      vang = (vang + (targetAng - ang) * 0.14) * 0.84;
      ang += vang;
    }
    draw();
    const energy =
      Math.abs(vx) +
      Math.abs(vy) +
      Math.abs(vang) +
      Math.abs(ax - x) * 0.02 +
      Math.abs(restY - y) * 0.02;
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

  function flashLed(kind = "is-on", ms = 200) {
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
    if (!fromKeyboard) sound.play("down");

    if (!reduceMotion) {
      vy += 2.4;
      vx += (col - 1.5) * 0.65;
      vang += (col - 1.5) * 0.02;
      wake();
    }

    if (key === "lock") {
      flashLed("is-auth", 2200);
      triggerSamubinCipher();
    } else {
      flashLed("is-on", 200);
      if (!fromKeyboard) {
        buffer = (buffer + key).slice(-12);
        if (buffer.endsWith("samubin")) {
          buffer = "";
          flashLed("is-auth", 3000);
          triggerSamubinCipher();
        }
      }
    }

    if (fromKeyboard) {
      setTimeout(() => {
        cap.classList.remove("is-down");
      }, 130);
    }
  }

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
      try {
        pad.setPointerCapture(pointerId);
      } catch {}
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
      try {
        pad.setPointerCapture(pointerId);
      } catch {}
      wake();
    }
    if (!dragging) return;
    const r = rig.getBoundingClientRect();
    const nx = e.clientX - r.left - grabDx;
    const ny = e.clientY - r.top - grabDy;
    const dx = nx - ax;
    const dy = Math.max(16, ny) - restY;
    const dist = Math.hypot(dx, dy);
    const maxR = innerWidth <= 760 ? 85 : 150;
    const scale = dist > maxR ? maxR / dist : 1;
    const tx = ax + dx * scale;
    const ty = restY + dy * scale;
    vx = (tx - x) * 0.45;
    vy = (ty - y) * 0.45;
    x = tx;
    y = ty;
    ang = Math.max(-0.4, Math.min(0.4, (x - ax) * 0.0026 + vx * 0.01));
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

  caps.forEach((cap) => {
    cap.addEventListener("click", (e) => {
      if (dragMoved) {
        e.preventDefault();
        return;
      }
      if (e.detail === 0) {
        sound.play("down");
        triggerCap(cap, true);
      }
    });
  });

  addEventListener("resize", () => measure(false), { passive: true });
  measure(true);
  wake();

  padApi = {
    flashLed,
    pressByChar(ch) {
      const match = caps.find((c) => c.dataset.key === ch);
      if (match) triggerCap(match, true);
    },
  };
}
