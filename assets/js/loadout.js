// 3D Sculpted Compact Mechanical Keyboard ("Key Stack in the Board"):
// - Realistic 3D beveled keycaps with concave finger scoop + matte PBT chassis + switch plate
// - Top Stack Category Pill Bar + hover/tap micro-badge + left modifier layer keys (Esc/Tab/Shift)
// - Scrambled S-A-M-U-B-I-N keys woven across Rows 1-3 + 2u Enter ↵
// - Braided dual USB-C cables with wall grommet mounts & tangent-aligned pendulum physics when left cable unplugs

import { sound } from "./sound.js";
import { getMode, onModeChange, toggleMode, reduceMotion } from "./mode.js";
import { triggerSamubinCipher } from "./keyboard.js";
import { DEV_ICONS } from "./icons-dev.js";
import { HACK_ICONS } from "./icons-hack.js";

const ICONS = {
  ...DEV_ICONS,
  ...HACK_ICONS,
  default:
    '<rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="2.15"/><path d="M9 9h6v6H9z" fill="currentColor"/>',
};

function iconFor(id) {
  return ICONS[id] || ICONS.default;
}

const SHORT_HOVER_NAMES = {
  tailwind: "Tailwind",
  hf: "HuggingFace",
  rag: "Vector/RAG",
  arch: "Arch",
  xsstrike: "XSS Lab",
  john: "JohnRipper",
  lfi: "LFI Lab",
  aircrack: "Aircrack",
  whois: "Whois",
  gdb: "GDB",
  bugcrowd: "Bugcrowd",
};

function shortHoverName(item) {
  return SHORT_HOVER_NAMES[item.id] || item.name;
}

const SAMUBIN_META = {
  s: { key: "s", label: "S", role: "Sequence 01 // S — Press S-A-M-U-B-I-N to unlock page cipher" },
  a: { key: "a", label: "A", role: "Sequence 02 // A — Sakib Alam Mubin (SA Mubin) key" },
  m: { key: "m", label: "M", role: "Sequence 03 // M — Mechanical switch synth active" },
  u: { key: "u", label: "U", role: "Sequence 04 // U — Unified Dual-Mode Architecture" },
  b: { key: "b", label: "B", role: "Sequence 05 // B — Builder & Breaker workbench" },
  i: { key: "i", label: "I", role: "Sequence 06 // I — Interactive 60fps physics rig" },
  n: { key: "n", label: "N", role: "Sequence 07 // N — Complete sequence to unlock cipher!" },
  enter: { key: "enter", label: "Enter ↵", role: "Enter // Tactile return key" },
};

export async function initLoadout() {
  const section = document.querySelector("[data-loadout]");
  if (!section) return;

  const rig = section.querySelector("[data-hanging-kb]");
  const wallShadow = section.querySelector("[data-kb-shadow]");
  const chassis = section.querySelector("[data-kb-chassis]");
  const caseSvg = section.querySelector("[data-kb-case-svg]");
  const caseLipPath = section.querySelector("[data-kb-case-lip]");
  const caseBodyPath = section.querySelector("[data-kb-case-body]");
  const caseSeamPath = section.querySelector("[data-kb-case-seam]");
  const caseClipPath = section.querySelector("[data-kb-case-clip]");
  const caseSpecPath = section.querySelector("[data-kb-case-spec]");
  const caseBorderPath = section.querySelector("[data-kb-case-border]");
  const cableSvg = section.querySelector("[data-kb-cables]");
  const mountL = section.querySelector("[data-mount-l]");
  const mountR = section.querySelector("[data-mount-r]");
  const usbTipL = section.querySelector("[data-usb-tip-l]");
  const usbTipR = section.querySelector("[data-usb-tip-r]");
  const portL = section.querySelector(".kb-usb-port--left");
  const portR = section.querySelector(".kb-usb-port--right");
  const socketL = section.querySelector(".kb-usb-port--left .kb-usb-socket");
  const plugL = section.querySelector("[data-plug-l]");
  const freePlugL = section.querySelector("[data-free-plug-l]");
  const board = section.querySelector("[data-loadout-board]");
  const tipEl = section.querySelector("[data-kb-tip]");
  const pillsWrap = section.querySelector("[data-stack-pills]");
  const titleEl = section.querySelector("[data-loadout-title]");
  const subEl = section.querySelector("[data-loadout-sub]");
  if (!board) return;

  let data = null;
  try {
    const url = new URL("../../data/loadout.json", import.meta.url);
    const res = await fetch(url);
    if (res.ok) data = await res.json();
  } catch {}
  if (!data) return;

  let activeLayerIdx = 0;
  let letterCursor = {};
  let samBuffer = "";
  let altKeyRef = null;

  // --- Coupled Dual-Cable & Single-Cable Pendulum + Magnetic USB-C Seating Physics ---
  // plugState:
  //   "plugged"  -> both cables locked; left socket tracks elastic retention & slip tension (--plug-slip)
  //   "detached" -> left cable hangs as true polar pendulum around wall grommet; board swings from right cable
  //   "seating"  -> 2-stage magnetic align + axial pin insertion before latch lock
  let plugState = "plugged";
  let yankEnergy = 0;
  let plugSlip = 0;
  let dragNearSocket = false;
  let dragAttractAng = 0;
  let dragAttractStrength = 0;

  let x = 0;
  let y = 0;
  let vx = 0;
  let vy = 0;
  let ang = 0;
  let vang = 0;

  // True polar pendulum state of unplugged left cable (pivoting from wall grommet)
  let restCordLen = 56;
  let cordAng = 0;
  let cordAngVel = 0;
  let cordLen = 62;
  let cordLenVel = 0;
  let headSvgAngle = 0;
  let headAngVel = 0;
  let freePlugX = 0;
  let freePlugY = 68;

  // Multi-phase seating capture animation state
  let seatStartMs = 0;
  let seatDurMs = 235;
  let seatFromX = 0;
  let seatFromY = 68;
  let seatFromAng = 0;
  let seatFromDrag = false;
  let seatAudioPlayed = false;

  let raf = 0;
  let lastStepMs = 0;
  let dragging = false;
  let pendingDrag = false;
  let pointerId = null;
  let downClientX = 0;
  let downClientY = 0;
  let grabNorm = 0.5;
  let startX = 0;
  let startY = 0;
  let suppressClickUntil = 0;

  // Direct mouse/touch dragging of the detached left USB-C plug ([data-free-plug-l])
  let plugPending = false;
  let plugDragging = false;
  let plugPointerId = null;
  let plugDownX = 0;
  let plugDownY = 0;
  let plugGrabOffsetX = 0;
  let plugGrabOffsetY = 0;
  let suppressPlugClickUntil = 0;

  let portRatio = 0.14;
  let tipHideTimer = 0;

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const resist = (v, s) => {
    const a = Math.abs(v);
    return Math.sign(v) * ((a * s) / (a + s));
  };
  const invResist = (d, s) => {
    const cap = Math.min(Math.abs(d), s * 0.92);
    return Math.sign(d) * ((cap * s) / (s - cap));
  };
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function showCapTip(cap, { autoHideMs = 0 } = {}) {
    if (!tipEl || !chassis || !cap) return;
    const text = cap.dataset.tip;
    if (!text) {
      hideCapTip();
      return;
    }
    clearTimeout(tipHideTimer);
    tipEl.textContent = text;

    let ox = 0;
    let oy = 0;
    let el = cap;
    while (el && el !== chassis) {
      ox += el.offsetLeft;
      oy += el.offsetTop;
      el = el.offsetParent;
    }

    const W = chassis.offsetWidth || 600;
    const halfTip = Math.min(76, (tipEl.offsetWidth || 68) * 0.5 + 6);
    const cx = Math.max(halfTip, Math.min(W - halfTip, ox + cap.offsetWidth * 0.5));

    const inBottomRow = Boolean(cap.closest(".kb-bottom-row"));
    const firstMatrixRow = board.querySelector(".kb-caps");
    const inTopRow = cap.classList.contains("kb-mod--esc") || (firstMatrixRow && cap.parentElement === firstMatrixRow);

    let cy = oy - 2;
    let place = "mid";

    if (inBottomRow) {
      cy = oy + cap.offsetHeight + 8;
      place = "below";
    } else if (inTopRow) {
      const tabsW = pillsWrap?.offsetWidth || 280;
      const tabsH = pillsWrap?.offsetHeight || 30;
      const bezel = parseFloat(getComputedStyle(chassis).paddingTop) || 7;
      const tabsLeft = W * 0.5 - tabsW * 0.5 - bezel - 6;
      const tabsRight = W * 0.5 + tabsW * 0.5 + bezel + 6;
      cy = cx + halfTip > tabsLeft && cx - halfTip < tabsRight ? -tabsH - bezel - 8 : -8;
      place = "above";
    } else {
      // Middle rows: sit cleanly in the inter-row bevel gap so the icon above remains visible
      cy = oy - 1;
      place = "mid";
    }

    tipEl.dataset.place = place;
    tipEl.style.left = `${cx.toFixed(1)}px`;
    tipEl.style.top = `${cy.toFixed(1)}px`;
    tipEl.classList.add("is-visible");

    if (autoHideMs > 0) {
      tipHideTimer = setTimeout(() => hideCapTip(), autoHideMs);
    }
  }

  function hideCapTip() {
    clearTimeout(tipHideTimer);
    if (!tipEl) return;
    tipEl.classList.remove("is-visible");
  }

  // Draws the unified one-piece molded plastic keyboard body + inner seam & top tab slot
  function updateCaseSvg() {
    if (!chassis || !caseSvg || !pillsWrap) return;
    const W = chassis.offsetWidth;
    const H = chassis.offsetHeight;
    if (W <= 0 || H <= 0) return;

    const cs = getComputedStyle(chassis);
    const bezel = parseFloat(cs.paddingTop) || 7;
    const padBot = parseFloat(cs.paddingBottom) || 14;
    const lipH = Math.max(4, padBot - bezel);
    const cornerR = Math.max(9, Math.min(15, bezel * 2.1));
    const topR = Math.max(7, Math.min(9.5, bezel * 1.35));

    const tabsW = pillsWrap.offsetWidth || 280;
    const tabsH = pillsWrap.offsetHeight || 30;

    const hx1 = W * 0.5 - tabsW * 0.5 - bezel;
    const hx2 = W * 0.5 + tabsW * 0.5 + bezel;
    const hy1 = -tabsH - bezel;

    const filletH = Math.min(7.5, Math.max(4.5, -hy1 - topR - 2));
    const maxFilletW = Math.max(3.5, (hx1 - cornerR) * 0.25);
    const filletW = Math.min(8.5, maxFilletW);

    const shoulderSpan = Math.max(16, hx1 - filletW - cornerR);
    portRatio = Math.min(0.14, Math.max(0.065, (cornerR + shoulderSpan * 0.46) / W));
    if (portL) portL.style.left = `${(portRatio * 100).toFixed(2)}%`;
    if (portR) portR.style.left = `${((1 - portRatio) * 100).toFixed(2)}%`;
    chassis.style.transformOrigin = `${((1 - portRatio) * 100).toFixed(2)}% 0`;

    const topPad = Math.ceil(-hy1 + 12);
    const totalH = H + topPad + 8;
    caseSvg.style.top = `${-topPad}px`;
    caseSvg.style.height = `${totalH}px`;
    caseSvg.setAttribute("viewBox", `0 ${-topPad} ${W} ${totalH}`);

    const buildClosedCase = (botY) => {
      const f = (n) => n.toFixed(2);
      return [
        `M ${f(cornerR)} 0`,
        `L ${f(hx1 - filletW)} 0`,
        `Q ${f(hx1)} 0, ${f(hx1)} ${f(-filletH)}`,
        `L ${f(hx1)} ${f(hy1 + topR)}`,
        `Q ${f(hx1)} ${f(hy1)}, ${f(hx1 + topR)} ${f(hy1)}`,
        `L ${f(hx2 - topR)} ${f(hy1)}`,
        `Q ${f(hx2)} ${f(hy1)}, ${f(hx2)} ${f(hy1 + topR)}`,
        `L ${f(hx2)} ${f(-filletH)}`,
        `Q ${f(hx2)} 0, ${f(hx2 + filletW)} 0`,
        `L ${f(W - cornerR)} 0`,
        `Q ${f(W)} 0, ${f(W)} ${f(cornerR)}`,
        `L ${f(W)} ${f(botY - cornerR)}`,
        `Q ${f(W)} ${f(botY)}, ${f(W - cornerR)} ${f(botY)}`,
        `L ${f(cornerR)} ${f(botY)}`,
        `Q 0 ${f(botY)}, 0 ${f(botY - cornerR)}`,
        `L 0 ${f(cornerR)}`,
        `Q 0 0, ${f(cornerR)} 0`,
        "Z",
      ].join(" ");
    };

    const buildTopSpec = () => {
      const s = 1.15;
      const f = (n) => n.toFixed(2);
      return [
        `M ${f(s)} ${f(cornerR)}`,
        `Q ${f(s)} ${f(s)}, ${f(cornerR)} ${f(s)}`,
        `L ${f(hx1 - filletW)} ${f(s)}`,
        `Q ${f(hx1 + s)} ${f(s)}, ${f(hx1 + s)} ${f(-filletH)}`,
        `L ${f(hx1 + s)} ${f(hy1 + topR)}`,
        `Q ${f(hx1 + s)} ${f(hy1 + s)}, ${f(hx1 + topR)} ${f(hy1 + s)}`,
        `L ${f(hx2 - topR)} ${f(hy1 + s)}`,
        `Q ${f(hx2 - s)} ${f(hy1 + s)}, ${f(hx2 - s)} ${f(hy1 + topR)}`,
        `L ${f(hx2 - s)} ${f(-filletH)}`,
        `Q ${f(hx2 - s)} ${f(s)}, ${f(hx2 + filletW)} ${f(s)}`,
        `L ${f(W - cornerR)} ${f(s)}`,
        `Q ${f(W - s)} ${f(s)}, ${f(W - s)} ${f(cornerR)}`,
      ].join(" ");
    };

    const seamY = H - lipH;
    const seamPath = `M 2 ${(seamY - 3).toFixed(2)} Q 2 ${seamY.toFixed(2)} ${cornerR.toFixed(2)} ${seamY.toFixed(2)} L ${(W - cornerR).toFixed(2)} ${seamY.toFixed(2)} Q ${(W - 2).toFixed(2)} ${seamY.toFixed(2)} ${(W - 2).toFixed(2)} ${(seamY - 3).toFixed(2)}`;

    const fullPath = buildClosedCase(H);
    const bodyPath = buildClosedCase(seamY);
    const specPath = buildTopSpec();

    if (caseLipPath) caseLipPath.setAttribute("d", fullPath);
    if (caseBodyPath) caseBodyPath.setAttribute("d", bodyPath);
    if (caseSeamPath) caseSeamPath.setAttribute("d", seamPath);
    if (caseClipPath) caseClipPath.setAttribute("d", bodyPath);
    if (caseSpecPath) caseSpecPath.setAttribute("d", specPath);
    if (caseBorderPath) caseBorderPath.setAttribute("d", fullPath);
  }

  function getSingleRest() {
    const narrow = window.innerWidth < 760;
    return {
      restX: narrow ? -8 : 6,
      restY: narrow ? 14 : 22,
      restAng: narrow ? -0.18 : -0.29,
    };
  }

  function getPlugScale() {
    return window.innerWidth <= 580 ? 0.78 : 1;
  }

  // Exact live SVG-space target coordinates for aligning freePlugL cleanly into the left USB-C socket
  function getLeftSocketTarget(svgRect) {
    const w = svgRect.width || rig?.clientWidth || 740;
    const plugScale = getPlugScale();
    if (socketL && svgRect.width > 0) {
      const r = socketL.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        const sockCx = r.left + r.width * 0.5 - svgRect.left;
        const sockCy = r.top + r.height * 0.5 - svgRect.top;
        const sinA = Math.sin(ang);
        const cosA = Math.cos(ang);
        return {
          sockCx,
          sockCy,
          pinEntryX: sockCx + sinA * (2 * plugScale),
          pinEntryY: sockCy - cosA * (2 * plugScale),
          seatX: sockCx + sinA * (24 * plugScale),
          seatY: sockCy - cosA * (24 * plugScale),
        };
      }
    }
    const lx = w * portRatio;
    return {
      sockCx: lx + x,
      sockCy: 8 + restCordLen + 24 + y,
      pinEntryX: lx + x,
      pinEntryY: 8 + restCordLen + 22 + y,
      seatX: lx + x,
      seatY: 8 + restCordLen + y,
    };
  }

  // Measure live distance & magnetic alignment between free USB-C gold pins and left socket
  function evaluatePlugProximity(svgRect) {
    if (!svgRect || svgRect.width <= 0 || plugState !== "detached") {
      dragNearSocket = false;
      dragAttractStrength = 0;
      rig?.classList.remove("is-plug-ready");
      return Infinity;
    }
    const leftAnchorX = svgRect.width * portRatio;
    const sc = getPlugScale();
    const target = getLeftSocketTarget(svgRect);
    const pinX = freePlugX - Math.sin(headSvgAngle) * (25 * sc);
    const pinY = freePlugY + Math.cos(headSvgAngle) * (25 * sc);
    const distToSock = Math.hypot(target.pinEntryX - pinX, target.pinEntryY - pinY);

    dragAttractAng = clamp(Math.atan2(target.seatX - leftAnchorX, Math.max(20, target.seatY - 8)), -0.95, 0.95);
    if (distToSock < 64) {
      dragNearSocket = true;
      dragAttractStrength = clamp((64 - distToSock) / 40, 0, 1);
      rig?.classList.add("is-plug-ready");
    } else {
      dragNearSocket = false;
      dragAttractStrength = 0;
      rig?.classList.remove("is-plug-ready");
    }
    return distToSock;
  }

  function startPhysicsLoop() {
    if (!raf) {
      lastStepMs = performance.now();
      raf = requestAnimationFrame(stepPhysics);
    }
  }

  function drawHanging() {
    if (!chassis) return;
    const deg = (ang * 180) / Math.PI;
    chassis.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${deg.toFixed(2)}deg)`;

    if (plugL) {
      plugL.style.setProperty("--plug-slip", `${plugSlip.toFixed(2)}px`);
    }

    if (wallShadow) {
      const shX = x * 0.72 + 4 - ang * 18;
      const shY = y * 0.78 + 20 + Math.abs(ang) * 14;
      const shScale = 0.96 + Math.min(0.06, Math.abs(y) * 0.0012);
      wallShadow.style.transform = `translate3d(${shX.toFixed(1)}px, ${shY.toFixed(1)}px, 0) rotate(${(deg * 0.88).toFixed(2)}deg) scale(${shScale.toFixed(3)})`;
    }

    if (!cableSvg || !rig) return;
    const svgRect = cableSvg.getBoundingClientRect();
    const w = svgRect.width || rig.clientWidth || 740;
    const h = svgRect.height || 145;
    cableSvg.setAttribute("viewBox", `0 0 ${w.toFixed(1)} ${h.toFixed(1)}`);

    const leftAnchorX = w * portRatio;
    const rightAnchorX = w * (1 - portRatio);
    const grommetY = 8;

    if (mountL) mountL.setAttribute("transform", `translate(${leftAnchorX.toFixed(1)}, 0)`);
    if (mountR) mountR.setAttribute("transform", `translate(${rightAnchorX.toFixed(1)}, 0)`);

    // 1. Right Power Cable: measure live USB-C plug tip + align Bezier tangent cleanly along plug tilt
    let rightPortX = rightAnchorX;
    let rightPortY = grommetY + restCordLen + y;
    if (usbTipR && svgRect.width > 0) {
      const tipR = usbTipR.getBoundingClientRect();
      rightPortX = tipR.left + tipR.width * 0.5 - svgRect.left;
      rightPortY = tipR.top + tipR.height * 0.5 - svgRect.top + 2;
      if (plugState === "plugged" && !dragging && Math.abs(y) < 0.8 && plugSlip < 0.2) {
        restCordLen = clamp(rightPortY - grommetY, 36, 76);
      }
    }

    const rSpan = Math.max(24, rightPortY - grommetY);
    const rSag = rSpan * 0.48;
    const rRestSlack = plugState === "plugged" ? -2.2 : 0;
    const rc1x = rightAnchorX + rRestSlack + vx * 0.35;
    const rc1y = grommetY + rSag * 0.85;
    const rc2x = rightPortX + Math.sin(ang) * rSag + vx * 0.28;
    const rc2y = rightPortY - Math.cos(ang) * rSag;
    const dR = `M ${rightAnchorX.toFixed(1)} ${grommetY} C ${rc1x.toFixed(1)} ${rc1y.toFixed(1)}, ${rc2x.toFixed(1)} ${rc2y.toFixed(1)}, ${rightPortX.toFixed(1)} ${rightPortY.toFixed(1)}`;
    cableSvg.querySelectorAll("[data-cable-r]").forEach((p) => p.setAttribute("d", dR));

    // 2. Left Power Cable: connected usbTipL (with slip creep), polar detached pendulum, or seating capture
    let leftPortX = leftAnchorX;
    let leftPortY = grommetY + restCordLen;
    let plugAngleRad = ang;

    if (plugState === "plugged") {
      if (usbTipL && svgRect.width > 0) {
        const tipL = usbTipL.getBoundingClientRect();
        leftPortX = tipL.left + tipL.width * 0.5 - svgRect.left;
        leftPortY = tipL.top + tipL.height * 0.5 - svgRect.top + 2;
      } else {
        leftPortY += y - plugSlip;
      }
      freePlugX = leftPortX;
      freePlugY = leftPortY;
    } else if (plugState === "detached") {
      leftPortX = leftAnchorX + Math.sin(cordAng) * cordLen;
      leftPortY = grommetY + Math.cos(cordAng) * cordLen;
      freePlugX = leftPortX;
      freePlugY = leftPortY;
      plugAngleRad = headSvgAngle;
    } else {
      // "seating": freePlugX, freePlugY, headSvgAngle driven smoothly by stepPhysics()
      leftPortX = freePlugX;
      leftPortY = freePlugY;
      plugAngleRad = headSvgAngle;
    }

    const lSpan = Math.max(24, leftPortY - grommetY);
    const lSag = lSpan * 0.48;
    const lRestSlack = plugState === "plugged" ? 2.2 : clamp(-(leftPortX - leftAnchorX) * 0.14, -8, 8);
    const lVelX = plugState === "plugged" ? vx * 0.35 : -cordAngVel * 14;
    const lc1x = leftAnchorX + lRestSlack + lVelX;
    const lc1y = grommetY + lSag * 0.85;
    const lc2x = leftPortX + Math.sin(plugAngleRad) * lSag * 0.88;
    const lc2y = leftPortY - Math.cos(plugAngleRad) * lSag * 0.88;
    const dL = `M ${leftAnchorX.toFixed(1)} ${grommetY} C ${lc1x.toFixed(1)} ${lc1y.toFixed(1)}, ${lc2x.toFixed(1)} ${lc2y.toFixed(1)}, ${leftPortX.toFixed(1)} ${leftPortY.toFixed(1)}`;
    cableSvg.querySelectorAll("[data-cable-l]").forEach((p) => p.setAttribute("d", dL));

    if (freePlugL) {
      const plugDeg = (plugAngleRad * 180) / Math.PI;
      const sc = getPlugScale();
      freePlugL.setAttribute(
        "transform",
        `translate(${leftPortX.toFixed(1)}, ${leftPortY.toFixed(1)}) rotate(${plugDeg.toFixed(1)}) scale(${sc})`
      );
    }
  }

  function releaseLeftHand({ fromAlt = false } = {}) {
    if (plugState !== "plugged") return;

    // Capture exact SVG coords of the mounted left plug BEFORE switching state
    let curTipX = (cableSvg?.clientWidth || rig?.clientWidth || 740) * portRatio;
    let curTipY = 8 + restCordLen + y - plugSlip;
    if (cableSvg && usbTipL) {
      const svgRect = cableSvg.getBoundingClientRect();
      if (svgRect.width > 0) {
        const leftAnchorX = svgRect.width * portRatio;
        const tipL = usbTipL.getBoundingClientRect();
        curTipX = tipL.left + tipL.width * 0.5 - svgRect.left;
        curTipY = tipL.top + tipL.height * 0.5 - svgRect.top + 2;
        const relX = curTipX - leftAnchorX;
        const relY = Math.max(18, curTipY - 8);
        cordAng = clamp(Math.atan2(relX, relY), -0.9, 0.9);
        cordLen = Math.max(24, Math.hypot(relX, relY));
      }
    }

    plugState = "detached";
    yankEnergy = 0;
    plugSlip = 0;
    dragNearSocket = false;
    rig?.classList.remove("is-left-seating", "is-plug-ready");
    rig?.classList.add("is-left-released");
    if (altKeyRef) altKeyRef.dataset.tip = "Plug Cable";

    if (reduceMotion) {
      const eq = getSingleRest();
      x = eq.restX;
      y = eq.restY;
      ang = eq.restAng;
      cordAng = -0.05;
      cordLen = restCordLen + 6;
      headSvgAngle = -cordAng;
      drawHanging();
      return;
    }

    sound.play("unplug");

    // Elastic snap-back recoil: stretched cord pulls connector sharply back & whips into gravity pendulum
    const extraStretch = Math.max(0, cordLen - restCordLen);
    cordLenVel = fromAlt ? -4.2 : -extraStretch * 0.52 - 3.8;
    cordAngVel = fromAlt ? -0.058 : clamp(vx * 0.0025 - 0.048, -0.14, 0.14);
    headSvgAngle = ang;
    headAngVel = vang - cordAngVel * 0.7;

    // Immediate weight transfer onto the single right USB-C cable
    vy += 5.4;
    vx += 1.6;
    vang -= 0.052;
    if (dragging) {
      startX = downClientX - invResist(x, 82);
      startY = downClientY - invResist(y, y < 0 ? 34 : 76);
    }
    startPhysicsLoop();
  }

  function regrabLeftHand({ fromDrag = false } = {}) {
    if (plugState !== "detached") return;

    plugPending = false;
    plugDragging = false;
    plugPointerId = null;
    if (fromDrag && dragging) {
      dragging = false;
      pendingDrag = false;
      try {
        if (pointerId !== null) chassis?.releasePointerCapture(pointerId);
      } catch {}
      pointerId = null;
      chassis?.classList.remove("is-dragging");
    }

    if (reduceMotion) {
      plugState = "plugged";
      x = 0;
      y = 0;
      vx = 0;
      vy = 0;
      ang = 0;
      vang = 0;
      plugSlip = 0;
      rig?.classList.remove("is-left-released", "is-left-seating", "is-plug-ready", "is-plug-dragging");
      if (altKeyRef) altKeyRef.dataset.tip = "Unplug Cable";
      drawHanging();
      return;
    }

    plugState = "seating";
    yankEnergy = 0;
    dragNearSocket = false;
    dragAttractStrength = 0;
    seatFromDrag = fromDrag;
    seatAudioPlayed = false;
    seatStartMs = performance.now();
    seatDurMs = fromDrag ? 170 : 240;
    seatFromX = freePlugX;
    seatFromY = freePlugY;
    seatFromAng = headSvgAngle;

    rig?.classList.remove("is-left-released", "is-plug-ready", "is-plug-dragging");
    rig?.classList.add("is-left-seating");
    if (altKeyRef) altKeyRef.dataset.tip = "Unplug Cable";

    startPhysicsLoop();
  }

  if (freePlugL) {
    freePlugL.addEventListener("click", () => {
      if (performance.now() < suppressPlugClickUntil) {
        suppressPlugClickUntil = 0;
        return;
      }
      regrabLeftHand({ fromDrag: false });
    });

    freePlugL.addEventListener("pointerdown", (e) => {
      if (e.button && e.button !== 0) return;
      if (plugState !== "detached" || reduceMotion || !cableSvg) return;
      e.stopPropagation();
      plugPointerId = e.pointerId;
      plugPending = true;
      plugDragging = false;
      plugDownX = e.clientX;
      plugDownY = e.clientY;
      const svgRect = cableSvg.getBoundingClientRect();
      plugGrabOffsetX = e.clientX - svgRect.left - freePlugX;
      plugGrabOffsetY = e.clientY - svgRect.top - freePlugY;
    });

    addEventListener("pointermove", (e) => {
      if (e.pointerId !== plugPointerId || plugState !== "detached" || !cableSvg) return;
      if (plugPending && !plugDragging) {
        if (Math.hypot(e.clientX - plugDownX, e.clientY - plugDownY) > 5) {
          plugPending = false;
          plugDragging = true;
          suppressPlugClickUntil = performance.now() + 450;
          rig?.classList.add("is-plug-dragging");
          try {
            freePlugL.setPointerCapture(plugPointerId);
          } catch {}
          startPhysicsLoop();
        } else {
          return;
        }
      }
      if (!plugDragging) return;

      const svgRect = cableSvg.getBoundingClientRect();
      if (svgRect.width <= 0) return;
      const leftAnchorX = svgRect.width * portRatio;
      const grommetY = 8;
      const freeRestLen = Math.max(42, restCordLen + 6);
      const maxFreeLen = 285;

      const cursorX = e.clientX - svgRect.left - plugGrabOffsetX;
      const cursorY = Math.max(grommetY + 16, e.clientY - svgRect.top - plugGrabOffsetY);
      const rawDx = cursorX - leftAnchorX;
      const rawDy = cursorY - grommetY;
      const rawDist = Math.hypot(rawDx, rawDy);

      const targetAng = clamp(Math.atan2(rawDx, Math.max(12, rawDy)), -1.18, 1.18);
      const targetLen =
        rawDist <= freeRestLen
          ? Math.max(24, rawDist)
          : rawDist <= maxFreeLen
            ? freeRestLen + (rawDist - freeRestLen) * 0.96
            : maxFreeLen + resist(rawDist - maxFreeLen, 42);

      cordAngVel = (targetAng - cordAng) * 0.42;
      cordLenVel = (targetLen - cordLen) * 0.42;
      cordAng = targetAng;
      cordLen = targetLen;
      freePlugX = leftAnchorX + Math.sin(cordAng) * cordLen;
      freePlugY = grommetY + Math.cos(cordAng) * cordLen;

      const distToSock = evaluatePlugProximity(svgRect);
      if (dragNearSocket) {
        const target = getLeftSocketTarget(svgRect);
        const pull = dragAttractStrength * 0.22;
        const aimDx = target.seatX - leftAnchorX;
        const aimDy = Math.max(16, target.seatY - grommetY);
        const aimAng = clamp(Math.atan2(aimDx, aimDy), -1.18, 1.18);
        const aimLen = Math.hypot(aimDx, aimDy);
        cordAng = cordAng * (1 - pull) + aimAng * pull;
        cordLen = cordLen * (1 - pull) + aimLen * pull;
        freePlugX = leftAnchorX + Math.sin(cordAng) * cordLen;
        freePlugY = grommetY + Math.cos(cordAng) * cordLen;
        headSvgAngle = -cordAng * (1 - dragAttractStrength * 0.85) + ang * (dragAttractStrength * 0.85);
      } else {
        headSvgAngle = -cordAng * 0.85;
      }

      if (distToSock < 24) {
        regrabLeftHand({ fromDrag: true });
        return;
      }
      drawHanging();
    });

    const endFreePlugDrag = (e) => {
      if (e.pointerId !== undefined && e.pointerId !== plugPointerId) return;
      const wasDragging = plugDragging;
      plugPending = false;
      plugDragging = false;
      plugPointerId = null;
      rig?.classList.remove("is-plug-dragging");
      if (!wasDragging) return;
      if (plugState === "detached" && dragNearSocket) {
        regrabLeftHand({ fromDrag: true });
        return;
      }
      dragNearSocket = false;
      dragAttractStrength = 0;
      rig?.classList.remove("is-plug-ready");
      startPhysicsLoop();
    };
    addEventListener("pointerup", endFreePlugDrag);
    addEventListener("pointercancel", endFreePlugDrag);
  }

  function stepPhysics(now = performance.now()) {
    raf = 0;
    const rawDt = lastStepMs ? (now - lastStepMs) / 16.667 : 1;
    lastStepMs = now;
    const dt = clamp(rawDt, 0.25, 2.0);
    const sub = dt > 1.05 ? 2 : 1;
    const h = dt / sub;

    const svgRect = cableSvg ? cableSvg.getBoundingClientRect() : null;
    const w = svgRect?.width || rig?.clientWidth || 740;
    const leftAnchorX = w * portRatio;
    const freeRestLen = Math.max(42, restCordLen + 6);

    for (let s = 0; s < sub; s++) {
      if (plugState === "detached" && !plugDragging) {
        // 1. Dangling left cable polar pendulum around (leftAnchorX, grommetY)
        const gTorque = -0.03 * Math.sin(cordAng) - 0.008 * cordAng;
        const mTorque = dragNearSocket ? (dragAttractAng - cordAng) * 0.08 * dragAttractStrength : 0;
        cordAngVel = (cordAngVel + (gTorque + mTorque) * h) * Math.pow(0.955, h);
        cordAng = clamp(cordAng + cordAngVel * h, -1.05, 1.05);

        const targetLen = dragNearSocket ? freeRestLen + dragAttractStrength * 4 : freeRestLen;
        cordLenVel = (cordLenVel + (targetLen - cordLen) * 0.22 * h) * Math.pow(0.79, h);
        cordLen = Math.max(24, cordLen + cordLenVel * h);

        // Connector head angle trails cord swing (positive cordAng right -> CCW SVG rotation -cordAng)
        const desiredSvgHead = dragNearSocket
          ? -cordAng * (1 - dragAttractStrength * 0.72) + ang * (dragAttractStrength * 0.72)
          : -cordAng;
        headAngVel = (headAngVel + ((desiredSvgHead - headSvgAngle) * 0.26 + cordAngVel * 0.08) * h) * Math.pow(0.81, h);
        headSvgAngle += headAngVel * h;
      }

      if (plugState === "seating") {
        const u = clamp((now - seatStartMs) / seatDurMs, 0, 1);

        // Level the keyboard smoothly back up toward connected position (if user is not actively holding/dragging)
        if (!dragging) {
          const targetBoardY = u < 0.62 ? -2.5 : 1.5;
          vx = (vx + (-x * 0.22) * h) * Math.pow(0.8, h);
          vy = (vy + ((targetBoardY - y) * 0.24) * h) * Math.pow(0.8, h);
          x += vx * h;
          y += vy * h;
          vang = (vang + (-ang * 0.24) * h) * Math.pow(0.8, h);
          ang += vang * h;
        }
      } else if (!dragging) {
        if (plugState === "plugged") {
          vx = (vx + (-x * 0.13) * h) * Math.pow(0.83, h);
          vy = (vy + (-y * 0.15) * h) * Math.pow(0.83, h);
          x += vx * h;
          y += vy * h;

          const targetAng = clamp(x * 0.0012 + vx * 0.0032, -0.09, 0.09);
          vang = (vang + (targetAng - ang) * 0.19 * h) * Math.pow(0.82, h);
          ang += vang * h;
          yankEnergy *= Math.pow(0.9, h);
          plugSlip *= Math.pow(0.74, h);
          if (plugSlip < 0.05) plugSlip = 0;
        } else {
          // Single-cable pendulum suspended strictly from Right USB-C cable
          const { restX, restY, restAng } = getSingleRest();
          const swingDelta = ang - restAng;
          const angAccel = -0.082 * Math.sin(swingDelta) - vx * 0.0022;
          vang = (vang + angAccel * h) * Math.pow(0.93, h);
          ang += vang * h;

          const coupledX = restX + Math.sin(swingDelta) * 14;
          const coupledY = restY + Math.abs(Math.sin(swingDelta)) * 5;
          vx = (vx + (coupledX - x) * 0.09 * h) * Math.pow(0.89, h);
          vy = (vy + (coupledY - y) * 0.11 * h) * Math.pow(0.87, h);
          x += vx * h;
          y += vy * h;
        }
      }
    }

    // Update 2-stage seating trajectory AFTER board transform step so target socket stays pixel-exact
    if (plugState === "seating") {
      const u = clamp((now - seatStartMs) / seatDurMs, 0, 1);
      const target = getLeftSocketTarget(svgRect || { width: w, left: 0, top: 0 });
      const scale = getPlugScale();
      const poiseDist = 9 * scale;
      const poiseX = target.seatX + Math.sin(ang) * poiseDist;
      const poiseY = target.seatY - Math.cos(ang) * poiseDist;

      if (u < 0.56) {
        const p = easeOutCubic(u / 0.56);
        const arcLift = Math.sin(p * Math.PI) * -6;
        freePlugX = seatFromX + (poiseX - seatFromX) * p;
        freePlugY = seatFromY + (poiseY - seatFromY) * p + arcLift;
        headSvgAngle = seatFromAng + (ang - seatFromAng) * p;
      } else {
        if (!seatAudioPlayed) {
          seatAudioPlayed = true;
          sound.play("plug");
        }
        const p = easeInOutCubic((u - 0.56) / 0.44);
        const bottomOut = p > 0.8 ? Math.sin(((p - 0.8) / 0.2) * Math.PI) * (1.8 * scale) : 0;
        const insDist = (1 - p) * poiseDist - bottomOut;
        freePlugX = target.seatX + Math.sin(ang) * insDist;
        freePlugY = target.seatY - Math.cos(ang) * insDist;
        headSvgAngle = ang;
      }

      if (u >= 1) {
        plugState = "plugged";
        plugSlip = 0;
        rig?.classList.remove("is-left-released", "is-left-seating", "is-plug-ready");
        if (altKeyRef) altKeyRef.dataset.tip = "Unplug Cable";
        // Crisp latch insertion recoil thump onto the board
        vy += 3.2;
        vang -= 0.018;
      }
    }

    drawHanging();

    if (plugState === "seating") {
      raf = requestAnimationFrame(stepPhysics);
      return;
    }

    const single = getSingleRest();
    const restX = plugState === "plugged" ? 0 : single.restX;
    const restY = plugState === "plugged" ? 0 : single.restY;
    const restAng = plugState === "plugged" ? 0 : single.restAng;
    const plugEnergy =
      plugState === "plugged"
        ? plugSlip * 0.05
        : Math.abs(cordAngVel) * 18 +
          Math.abs(cordLenVel) * 0.35 +
          Math.abs(headAngVel) * 8 +
          Math.abs(cordAng) * 0.35 +
          Math.abs(cordLen - freeRestLen) * 0.04;
    const energy =
      plugEnergy +
      Math.abs(vx) +
      Math.abs(vy) +
      Math.abs(vang) * 26 +
      Math.abs(x - restX) * 0.03 +
      Math.abs(y - restY) * 0.03 +
      Math.abs(ang - restAng) * 2.2;

    if (dragging || plugDragging || energy > 0.015) {
      raf = requestAnimationFrame(stepPhysics);
    } else {
      x = restX;
      y = restY;
      ang = restAng;
      vx = 0;
      vy = 0;
      vang = 0;
      plugSlip = 0;
      if (plugState === "detached") {
        cordAng = 0;
        cordAngVel = 0;
        cordLen = freeRestLen;
        cordLenVel = 0;
        headSvgAngle = 0;
        headAngVel = 0;
        freePlugX = leftAnchorX;
        freePlugY = 8 + freeRestLen;
      }
      drawHanging();
    }
  }

  function impulseKeyboard(colRatio = 0, downForce = 3.0) {
    if (reduceMotion) return;
    vy += downForce;
    vx += colRatio * 1.05;
    if (plugState === "plugged") {
      vang += colRatio * 0.009;
      if (colRatio < -0.2) yankEnergy += 0.14;
      if (yankEnergy > 1.35) {
        releaseLeftHand({ fromAlt: false });
        return;
      }
    } else if (plugState === "detached") {
      vang += (colRatio - 0.45) * 0.018;
    }
    startPhysicsLoop();
  }

  let lastPointerType = "mouse";

  if (board) {
    board.addEventListener("pointerdown", (e) => {
      lastPointerType = e.pointerType || "mouse";
    });
    board.addEventListener("pointerover", (e) => {
      if (dragging || e.pointerType === "touch") return;
      const cap = e.target.closest(".kb-cap[data-tip]");
      if (cap) showCapTip(cap);
    });
    board.addEventListener("pointerout", (e) => {
      const cap = e.target.closest(".kb-cap[data-tip]");
      if (cap && !cap.contains(e.relatedTarget)) hideCapTip();
    });
    board.addEventListener("focusin", (e) => {
      const cap = e.target.closest(".kb-cap[data-tip]");
      if (cap) showCapTip(cap);
    });
    board.addEventListener("focusout", () => hideCapTip());
  }

  if (chassis) {
    // Prevent vertical page scroll on touch devices when pulling/dragging anywhere on the keyboard
    chassis.addEventListener(
      "touchmove",
      (e) => {
        if (!reduceMotion) e.preventDefault();
      },
      { passive: false }
    );

    // Swallow synthetic click right after a drag gesture that started on a keycap/button
    chassis.addEventListener(
      "click",
      (e) => {
        if (performance.now() < suppressClickUntil) {
          e.preventDefault();
          e.stopPropagation();
          suppressClickUntil = 0;
        }
      },
      true
    );

    chassis.addEventListener("pointerdown", (e) => {
      if (e.button && e.button !== 0) return;
      if (reduceMotion) return;
      pointerId = e.pointerId;
      downClientX = e.clientX;
      downClientY = e.clientY;
      const rigRect = rig?.getBoundingClientRect();
      grabNorm =
        rigRect && rigRect.width > 0
          ? clamp(((e.clientX - rigRect.left) / rigRect.width - (1 - portRatio)) / (2 * portRatio - 1), -0.25, 1.15)
          : 0.5;
      const sxScale = plugState === "plugged" ? 72 : 82;
      const syScale = plugState === "plugged" ? (y < 0 ? 28 : 58) : (y < 0 ? 44 : 76);
      startX = e.clientX - invResist(x, sxScale);
      startY = e.clientY - invResist(y, syScale);

      const onBtn = Boolean(e.target.closest("button"));
      if (onBtn) {
        // Allow normal tap/click if finger/mouse doesn't drag past 6px
        pendingDrag = true;
        dragging = false;
      } else {
        pendingDrag = false;
        dragging = true;
        hideCapTip();
        chassis.classList.add("is-dragging");
        try {
          chassis.setPointerCapture(pointerId);
        } catch {}
        startPhysicsLoop();
      }
    });

    addEventListener("pointermove", (e) => {
      if (e.pointerId !== pointerId) return;
      if (pendingDrag && !dragging) {
        if (Math.hypot(e.clientX - downClientX, e.clientY - downClientY) > 6) {
          pendingDrag = false;
          dragging = true;
          suppressClickUntil = performance.now() + 450;
          hideCapTip();
          chassis.classList.add("is-dragging");
          try {
            chassis.setPointerCapture(pointerId);
          } catch {}
          startPhysicsLoop();
        } else {
          return;
        }
      }
      downClientX = e.clientX;
      downClientY = e.clientY;
      if (!dragging) return;
      const rawDx = e.clientX - startX;
      const rawDy = e.clientY - startY;

      if (plugState === "plugged") {
        const dx = resist(rawDx, 72);
        const dy = rawDy < 0 ? resist(rawDy, 28) : resist(rawDy, 58);
        const speed = Math.hypot(dx - x, dy - y);
        vx = (dx - x) * 0.45;
        vy = (dy - y) * 0.45;
        x = dx;
        y = dy;
        ang = clamp(dx * 0.0014 - dy * 0.0022, -0.15, 0.12);

        yankEnergy += speed * 0.018;
        const pullDist = Math.hypot(dx, Math.max(0, dy));
        // Left USB-C connector begins creeping visibly up out of the socket right before friction release
        plugSlip = clamp((pullDist - 12) * 0.2 + Math.max(0, dy - 14) * 0.16 + yankEnergy * 1.4, 0, 5.5);

        if (pullDist > 37 || dy > 29 || yankEnergy > 1.08) {
          releaseLeftHand({ fromAlt: false });
        }
      } else if (plugState === "detached") {
        const dx = resist(rawDx, 82);
        const dy = rawDy < 0 ? resist(rawDy, 44) : resist(rawDy, 76);
        vx = (dx - x) * 0.45;
        vy = (dy - y) * 0.45;
        x = dx;
        y = dy;
        const single = getSingleRest();
        const restRawY = invResist(single.restY, 76);
        const liftStroke = Math.max(0, restRawY - rawDy);
        const levelBoost = liftStroke * 0.0052 * (0.58 + Math.max(0, grabNorm) * 0.52);
        const prevAng = ang;
        ang = clamp(single.restAng + levelBoost + dx * 0.0022 - Math.max(0, dy - single.restY) * 0.0024, -0.58, 0.14);
        vang = (ang - prevAng) * 0.65;

        // Real geometric socket-to-plug proximity for magnetic capture & pre-latch readiness
        if (cableSvg) {
          const svgRect = cableSvg.getBoundingClientRect();
          const distToSock = evaluatePlugProximity(svgRect);
          if (distToSock < 24) {
            regrabLeftHand({ fromDrag: true });
          }
        }
      }
      drawHanging();
    });

    const endDrag = (e) => {
      if (e.pointerId !== undefined && e.pointerId !== pointerId) return;
      const shouldSnap = dragging && plugState === "detached" && dragNearSocket;
      pendingDrag = false;
      pointerId = null;
      dragNearSocket = false;
      dragAttractStrength = 0;
      rig?.classList.remove("is-plug-ready");
      if (!dragging) return;
      dragging = false;
      chassis.classList.remove("is-dragging");
      if (shouldSnap) {
        regrabLeftHand({ fromDrag: true });
        return;
      }
      startPhysicsLoop();
    };
    addEventListener("pointerup", endDrag);
    addEventListener("pointercancel", endDrag);
    addEventListener(
      "resize",
      () => {
        hideCapTip();
        updateCaseSvg();
        drawHanging();
      },
      { passive: true }
    );
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => {
        updateCaseSvg();
        drawHanging();
      });
      ro.observe(chassis);
      if (pillsWrap) ro.observe(pillsWrap);
    }
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        updateCaseSvg();
        drawHanging();
      });
    }
  }

  let flipTimers = [];
  function clearFlipTimers() {
    flipTimers.forEach((id) => clearTimeout(id));
    flipTimers = [];
  }

  function updateTechCap(cap, item, layerMod, isHack) {
    if (!cap || !item) return;
    cap._item = item;
    cap._layerMod = layerMod;
    const detailText = item.detail || "";
    const shortLabel = shortHoverName(item);
    const tierName =
      item.tier === "daily" ? "Daily Driver" : item.tier === "proficient" ? "Proficient" : "Familiar";

    cap.dataset.itemId = item.id;
    cap.dataset.letter = item.name[0].toLowerCase();
    cap.dataset.tip = shortLabel;
    cap.setAttribute("aria-label", `${item.name} — ${tierName} — ${detailText}`);

    cap.classList.remove("kb-cap--daily", "kb-cap--proficient", "kb-cap--familiar");
    cap.classList.add(`kb-cap--${item.tier}`);

    const dish = cap.querySelector(".kb-cap-dish");
    if (dish) {
      dish.innerHTML = `<svg class="kb-cap-ico" viewBox="0 0 24 24" aria-hidden="true">${iconFor(item.id)}</svg>`;
    }
  }

  function pulseKeyDown(cap, duration = 135) {
    if (!cap) return;
    if (cap._downTimer) clearTimeout(cap._downTimer);
    cap.classList.add("is-down");
    cap._downTimer = setTimeout(() => {
      cap.classList.remove("is-down");
      cap._downTimer = null;
    }, duration);
  }

  function createTechCap(item, layerMod, isHack, colRatio) {
    const detailText = item.detail || "";
    const shortLabel = shortHoverName(item);
    const tierName =
      item.tier === "daily" ? "Daily Driver" : item.tier === "proficient" ? "Proficient" : "Familiar";
    const cap = document.createElement("button");
    cap.type = "button";
    cap.className = `kb-cap kb-cap--icon kb-cap--${item.tier}`;
    cap.dataset.itemId = item.id;
    cap.dataset.letter = item.name[0].toLowerCase();
    cap.dataset.tip = shortLabel;
    cap.setAttribute("aria-label", `${item.name} — ${tierName} — ${detailText}`);
    cap.innerHTML = `
      <span class="kb-cap-dish">
        <svg class="kb-cap-ico" viewBox="0 0 24 24" aria-hidden="true">${iconFor(item.id)}</svg>
      </span>
    `;

    cap._item = item;
    cap._layerMod = layerMod;
    cap._colRatio = colRatio;

    cap.addEventListener("click", (e) => {
      sound.play("down");
      setTimeout(() => sound.play("up"), 70);
      pulseKeyDown(cap);
      impulseKeyboard(cap._colRatio ?? colRatio, 2.8);
      const isTouchLike =
        e.pointerType === "touch" ||
        lastPointerType === "touch" ||
        (typeof matchMedia === "function" && matchMedia("(hover: none)").matches);
      if (isTouchLike) showCapTip(cap, { autoHideMs: 1800 });
    });
    return cap;
  }

  function createSamCap(metaKey, layerMod, colRatio, isWideEnter = false) {
    const item = SAMUBIN_META[metaKey];
    const cap = document.createElement("button");
    cap.type = "button";
    cap.className = isWideEnter ? "kb-cap kb-cap--enter" : "kb-cap kb-cap--sam";
    cap.dataset.samKey = item.key;
    cap.setAttribute("aria-label", item.role);
    cap.innerHTML = `
      <span class="kb-cap-dish">
        <span class="kb-sam-char">${item.label}</span>
      </span>
    `;

    cap._layerMod = layerMod;

    cap.addEventListener("click", () => {
      sound.play("down");
      setTimeout(() => sound.play("up"), 75);
      pulseKeyDown(cap);
      impulseKeyboard(colRatio, 3.4);

      if (!isWideEnter) {
        samBuffer = (samBuffer + item.key).slice(-10);
        if (samBuffer.endsWith("samubin")) {
          samBuffer = "";
          triggerSamubinCipher();
        }
      }
    });
    return cap;
  }

  function renderPills(layers) {
    if (!pillsWrap) return;
    pillsWrap.innerHTML = "";
    layers.forEach((layer, idx) => {
      const isSelected = idx === activeLayerIdx;
      const pill = document.createElement("button");
      pill.type = "button";
      pill.role = "tab";
      pill.className = "stack-pill";
      pill.setAttribute("aria-selected", String(isSelected));
      pill.innerHTML = `
        <span class="stack-pill-dot"></span>
        <span class="stack-pill-label">${layer.label}</span>
      `;
      pill.addEventListener("click", () => {
        if (activeLayerIdx === idx) return;
        sound.play("down");
        setTimeout(() => sound.play("up"), 75);
        impulseKeyboard((idx - 1) * 0.45, 3.0);
        renderBoard(getMode(), { flipping: true, layerIndex: idx });
      });
      pillsWrap.appendChild(pill);
    });
  }

  function renderBoard(mode, { flipping = false, layerIndex = activeLayerIdx } = {}) {
    hideCapTip();
    const modeData = data[mode] || data.dev;
    const isHack = mode === "hack";
    const layers = modeData.layers || [];
    if (!layers.length) return;

    const prevIdx = activeLayerIdx;
    activeLayerIdx = Math.max(0, Math.min(layers.length - 1, layerIndex));
    const currentLayer = layers[activeLayerIdx];

    if (titleEl) titleEl.textContent = modeData.title;
    if (subEl) subEl.textContent = modeData.subtitle;

    renderPills(layers);

    const allTwelveTech = [...(currentLayer.topRow || []), ...(currentLayer.bottomRow || [])];

    const row1Spec = [
      { type: "tech", item: allTwelveTech[0] },
      { type: "sam", key: "a" },
      { type: "tech", item: allTwelveTech[1] },
      { type: "tech", item: allTwelveTech[2] },
      { type: "sam", key: "b" },
      { type: "tech", item: allTwelveTech[3] },
      { type: "tech", item: allTwelveTech[4] },
    ];
    const row2Spec = [
      { type: "sam", key: "s" },
      { type: "tech", item: allTwelveTech[5] },
      { type: "tech", item: allTwelveTech[6] },
      { type: "sam", key: "u" },
      { type: "tech", item: allTwelveTech[7] },
      { type: "sam", key: "n" },
      { type: "tech", item: allTwelveTech[8] },
    ];
    const row3Spec = [
      { type: "tech", item: allTwelveTech[9] },
      { type: "tech", item: allTwelveTech[10] },
      { type: "sam", key: "m" },
      { type: "tech", item: allTwelveTech[11] },
      { type: "sam", key: "i" },
      { type: "enter", key: "enter" },
    ];
    const rowSpecs = [row1Spec, row2Spec, row3Spec];

    const existingMatrix = board.querySelector(".kb-matrix");
    if (existingMatrix) {
      // Dynamic in-place 3D keycap wave transition
      clearFlipTimers();

      // Update Left Bank modifier keys (Esc, Tab, Shift)
      const modBtns = board.querySelectorAll(".kb-layer-bank .kb-mod");
      modBtns.forEach((btn, idx) => {
        const isSelected = idx === activeLayerIdx;
        const targetLayer = layers[idx];
        btn.setAttribute("aria-pressed", String(isSelected));
        if (targetLayer) {
          btn.dataset.tip = targetLayer.label;
          btn.setAttribute("aria-label", `Switch keyboard to ${targetLayer.label}`);
        }
        btn.classList.remove("is-punching");
        if (isSelected && flipping && !reduceMotion) {
          void btn.offsetWidth;
          btn.classList.add("is-punching");
          const pTimer = setTimeout(() => btn.classList.remove("is-punching"), 280);
          flipTimers.push(pTimer);
        }
      });

      const rowEls = existingMatrix.querySelectorAll(".kb-caps");
      rowSpecs.forEach((spec, rIdx) => {
        const rowEl = rowEls[rIdx];
        if (!rowEl) return;
        const caps = rowEl.children;

        spec.forEach((slot, cIdx) => {
          const cap = caps[cIdx];
          if (!cap) return;

          if (!flipping || reduceMotion) {
            if (slot.type === "tech" && slot.item) {
              updateTechCap(cap, slot.item, currentLayer.mod, isHack);
            } else if (slot.type === "sam" || slot.type === "enter") {
              cap._layerMod = currentLayer.mod;
            }
            return;
          }

          // Directional ripple wave timing:
          // Left->Right when advancing (01->02, 02->03)
          // Right->Left when retreating (03->02, 02->01)
          // Outward from center when targeting 02 from outside
          let waveDelay;
          if (activeLayerIdx > prevIdx) {
            waveDelay = cIdx * 32 + rIdx * 24;
          } else if (activeLayerIdx < prevIdx) {
            waveDelay = (6 - cIdx) * 32 + rIdx * 24;
          } else {
            waveDelay = Math.abs(cIdx - 3) * 36 + rIdx * 24;
          }

          cap.style.setProperty("--k-delay", `${waveDelay}ms`);
          cap.classList.remove("is-flipping", "is-settling");
          void cap.offsetWidth; // force reflow

          if (slot.type === "tech" && slot.item) {
            cap.classList.add("is-flipping");

            // Invisible content swap at edge-on rotation midpoint
            const mTimer = setTimeout(() => {
              updateTechCap(cap, slot.item, currentLayer.mod, isHack);
            }, waveDelay + 165);
            flipTimers.push(mTimer);

            const eTimer = setTimeout(() => {
              cap.classList.remove("is-flipping");
              cap.style.removeProperty("--k-delay");
            }, waveDelay + 390);
            flipTimers.push(eTimer);
          } else {
            // SAMUBIN cipher key (S, A, M, U, B, I, N, Enter) tactile spring re-seat bounce
            cap._layerMod = currentLayer.mod;
            cap.classList.add("is-settling");
            const eTimer = setTimeout(() => {
              cap.classList.remove("is-settling");
              cap.style.removeProperty("--k-delay");
            }, waveDelay + 330);
            flipTimers.push(eTimer);
          }
        });
      });

      // Synchronized cascading audio clacks across the columns
      if (flipping && !reduceMotion) {
        for (let c = 0; c < 7; c++) {
          const colTime = (activeLayerIdx < prevIdx ? (6 - c) : c) * 32;
          const sTimer = setTimeout(() => {
            sound.play("flip");
          }, colTime);
          flipTimers.push(sTimer);
        }
      }

      // Update bottom row mode button text/tip if mode changed
      const modeKey = board.querySelector(".kb-bottom-row .kb-cap--mode");
      if (modeKey) modeKey.dataset.tip = isHack ? "Dev Mode" : "Hack Mode";
      const devKeyText = board.querySelector(".kb-bottom-row .kb-cap--badge .kb-bot-main");
      if (devKeyText) devKeyText.textContent = isHack ? "Red" : "Dev";

      return;
    }

    // INITIAL RENDER (only runs on initial mount)
    board.innerHTML = "";

    // Build 4-Row Realistic 3D Mechanical Keyboard:
    // Rows 1-3: Left 1.25u Layer Key (Esc / Tab / Shift) + 7u Main Tech & Scrambled SAMUBIN Matrix
    const topGrid = document.createElement("div");
    topGrid.className = "kb-top-grid";

    // Left Bank: 3 Clean Mechanical Modifier Keys (Esc, Tab, Shift)
    const leftBank = document.createElement("div");
    leftBank.className = "kb-layer-bank";
    const modKeyHints = ["Esc", "Tab", "Shift"];
    layers.forEach((layer, idx) => {
      const isSelected = idx === activeLayerIdx;
      const modBtn = document.createElement("button");
      modBtn.type = "button";
      modBtn.className = `kb-cap kb-mod ${idx === 0 ? "kb-mod--esc" : ""}`;
      modBtn.dataset.tip = layer.label;
      modBtn.setAttribute("aria-pressed", String(isSelected));
      modBtn.setAttribute("aria-label", `Switch keyboard to ${layer.label}`);
      modBtn.innerHTML = `
        <span class="kb-cap-dish kb-mod-dish">
          <span class="kb-mod-top">
            <span class="kb-mod-led" aria-hidden="true"></span>
            <span class="kb-mod-code">${modKeyHints[idx]}</span>
          </span>
        </span>
      `;
      modBtn.addEventListener("click", () => {
        sound.play("down");
        setTimeout(() => sound.play("up"), 75);
        pulseKeyDown(modBtn);
        impulseKeyboard(-0.85, 3.4);
        if (activeLayerIdx !== idx) {
          renderBoard(getMode(), { flipping: true, layerIndex: idx });
        }
      });
      leftBank.appendChild(modBtn);
    });

    // Right 3-Row Matrix (7u per row)
    const matrixEl = document.createElement("div");
    matrixEl.className = "kb-matrix";

    rowSpecs.forEach((spec) => {
      const rowEl = document.createElement("div");
      rowEl.className = "kb-caps";

      spec.forEach((slot, cIdx) => {
        const colRatio = (cIdx - 3) / 3;
        if (slot.type === "tech" && slot.item) {
          rowEl.appendChild(createTechCap(slot.item, currentLayer.mod, isHack, colRatio));
        } else if (slot.type === "sam") {
          rowEl.appendChild(createSamCap(slot.key, currentLayer.mod, colRatio, false));
        } else if (slot.type === "enter") {
          rowEl.appendChild(createSamCap("enter", currentLayer.mod, 0.85, true));
        }
      });

      matrixEl.appendChild(rowEl);
    });

    topGrid.appendChild(leftBank);
    topGrid.appendChild(matrixEl);

    // Row 4: Bottom Modifier & Spacebar Row (Spacebar ONLY says "Space")
    const bottomRow = document.createElement("div");
    bottomRow.className = "kb-bottom-row";

    // 1. Fn Key (Outer Modifier)
    const fnKey = document.createElement("button");
    fnKey.type = "button";
    fnKey.className = "kb-cap kb-cap--mod";
    fnKey.dataset.tip = "Next Layer";
    fnKey.innerHTML = `<span class="kb-cap-dish"><span class="kb-bot-main">Fn</span></span>`;
    fnKey.addEventListener("click", () => {
      sound.play("down");
      setTimeout(() => sound.play("up"), 70);
      pulseKeyDown(fnKey);
      impulseKeyboard(-0.8, 3.0);
      renderBoard(getMode(), { flipping: true, layerIndex: (activeLayerIdx + 1) % layers.length });
    });

    // 2. Mode Badge Key ("Dev" / "Red")
    const winKey = document.createElement("button");
    winKey.type = "button";
    winKey.className = "kb-cap kb-cap--badge";
    winKey.dataset.tip = "36 Stack";
    winKey.innerHTML = `<span class="kb-cap-dish"><span class="kb-bot-main">${isHack ? "Red" : "Dev"}</span></span>`;
    winKey.addEventListener("click", () => {
      sound.play("down");
      setTimeout(() => sound.play("up"), 70);
      pulseKeyDown(winKey);
      impulseKeyboard(-0.55, 2.8);
    });

    // 3. Alt / Cable Detach Test Key (Outer Modifier)
    const altKey = document.createElement("button");
    altKey.type = "button";
    altKey.className = "kb-cap kb-cap--mod";
    altKey.dataset.tip = plugState === "plugged" ? "Unplug Cable" : "Plug Cable";
    altKey.innerHTML = `<span class="kb-cap-dish"><span class="kb-bot-main">Alt</span></span>`;
    altKeyRef = altKey;
    altKey.addEventListener("click", (e) => {
      pulseKeyDown(altKey);
      if (plugState === "plugged") {
        releaseLeftHand({ fromAlt: true });
      } else if (plugState === "detached") {
        regrabLeftHand({ fromDrag: false });
      }
      const isTouchLike = e.pointerType === "touch" || lastPointerType === "touch";
      if (isTouchLike || tipEl?.classList.contains("is-visible")) {
        showCapTip(altKey, isTouchLike ? { autoHideMs: 1600 } : undefined);
      }
    });

    // 4. Center Sculpted Accent Spacebar (ONLY says "Space")
    const spaceKey = document.createElement("button");
    spaceKey.type = "button";
    spaceKey.className = "kb-cap kb-cap--space";
    spaceKey.innerHTML = `
      <span class="kb-cap-dish kb-space-dish">
        <span class="kb-space-barline" aria-hidden="true"></span>
        <span class="kb-space-text">Space</span>
      </span>
    `;
    spaceKey.addEventListener("click", () => {
      sound.play("space");
      pulseKeyDown(spaceKey);
      impulseKeyboard(0, 3.8);
    });

    // 5. Wide Cipher Key ("SAMUBIN")
    const backKey = document.createElement("button");
    backKey.type = "button";
    backKey.className = "kb-cap kb-cap--mod kb-cap--back";
    backKey.dataset.tip = "Run Cipher";
    backKey.innerHTML = `<span class="kb-cap-dish"><span class="kb-bot-main">SAMUBIN</span></span>`;
    backKey.addEventListener("click", () => {
      sound.play("auth");
      pulseKeyDown(backKey);
      impulseKeyboard(0.45, 3.4);
      triggerSamubinCipher();
    });

    // 6. Bottom-Right Mode Toggle Key ("Mode ⇄")
    const modeKey = document.createElement("button");
    modeKey.type = "button";
    modeKey.className = "kb-cap kb-cap--mode";
    modeKey.dataset.tip = isHack ? "Dev Mode" : "Hack Mode";
    modeKey.innerHTML = `<span class="kb-cap-dish"><span class="kb-bot-main">Mode ⇄</span></span>`;
    modeKey.addEventListener("click", () => {
      sound.play("down");
      setTimeout(() => sound.play("up"), 75);
      pulseKeyDown(modeKey);
      impulseKeyboard(0.85, 3.4);
      toggleMode({ animate: true });
    });

    bottomRow.appendChild(fnKey);
    bottomRow.appendChild(winKey);
    bottomRow.appendChild(altKey);
    bottomRow.appendChild(spaceKey);
    bottomRow.appendChild(backKey);
    bottomRow.appendChild(modeKey);

    board.appendChild(topGrid);
    board.appendChild(bottomRow);

    requestAnimationFrame(() => {
      updateCaseSvg();
      drawHanging();
    });
  }

  // Physical keyboard integration
  addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = e.target?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target?.isContentEditable) return;
    const ch = (e.key || "").toLowerCase();

    const r = section.getBoundingClientRect();
    if (r.bottom < -100 || r.top > innerHeight + 100) return;

    if (ch === "enter") {
      const enterCap = board.querySelector(".kb-cap--enter");
      if (enterCap && e.target !== enterCap && !e.repeat) {
        pulseKeyDown(enterCap);
        impulseKeyboard(0.85, 3.4);
      }
      return;
    }

    if (!/^[a-z0-9]$/.test(ch)) return;

    if (ch === "1" || ch === "2" || ch === "3") {
      const targetIdx = Number(ch) - 1;
      if (targetIdx !== activeLayerIdx) {
        sound.play("down");
        impulseKeyboard(-0.7, 3.2);
        renderBoard(getMode(), { flipping: true, layerIndex: targetIdx });
      }
      return;
    }

    const samCap = board.querySelector(`.kb-cap--sam[data-sam-key="${ch}"]`);
    if (samCap) {
      samCap.classList.add("is-down");
      setTimeout(() => samCap.classList.remove("is-down"), 145);
      impulseKeyboard(0, 2.6);
    }

    const matches = [...board.querySelectorAll(`.kb-cap--icon[data-letter="${ch}"]`)];
    if (!matches.length) return;
    const idx = (letterCursor[ch] || 0) % matches.length;
    letterCursor[ch] = idx + 1;
    const target = matches[idx];
    target.classList.add("is-down");
    target.click();
    setTimeout(() => target.classList.remove("is-down"), 140);
  });

  onModeChange(({ mode }) => {
    renderBoard(mode, { flipping: true, layerIndex: activeLayerIdx });
    impulseKeyboard(0, 4.8);
  });

  renderBoard(getMode(), { flipping: false, layerIndex: 0 });
  if (!reduceMotion) {
    vy = -2.8;
    ang = 0.014;
    raf = requestAnimationFrame(stepPhysics);
  }
}
