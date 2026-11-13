// 3D Sculpted Compact Mechanical Keyboard ("Key Stack in the Board"):
// - Realistic 3D beveled keycaps with concave finger scoop + matte PBT chassis + switch plate
// - Top Stack Category Pill Bar + hover/tap micro-badge + left modifier layer keys (Esc/Tab/Shift)
// - Scrambled S-A-M-U-B-I-N keys woven across Rows 1-3 + 2u Enter ↵
// - Dual permanently-connected braided USB-C cables with machined wall grommets, multi-node wave physics & damped suspension

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
  const board = section.querySelector("[data-loadout-board]");
  const tipEl = section.querySelector("[data-kb-tip]");
  const pillsWrap = section.querySelector("[data-stack-pills]");
  const titleEl = section.querySelector("[data-loadout-title]");
  const subEl = section.querySelector("[data-loadout-sub]");
  if (!board) return;

  // Cached SVG cable stroke layers for 60fps Catmull-Rom updates
  const cablePathsL = cableSvg ? [...cableSvg.querySelectorAll("[data-cable-l]")] : [];
  const cablePathsR = cableSvg ? [...cableSvg.querySelectorAll("[data-cable-r]")] : [];
  const cableShadowL = cableSvg ? cableSvg.querySelector("[data-cable-l-shadow]") : null;
  const cableShadowR = cableSvg ? cableSvg.querySelector("[data-cable-r-shadow]") : null;
  const cableContactL = cableSvg ? cableSvg.querySelector("[data-cable-l-contact]") : null;
  const cableContactR = cableSvg ? cableSvg.querySelector("[data-cable-r-contact]") : null;
  const cableSpecL = cableSvg ? cableSvg.querySelector("[data-cable-l-spec]") : null;
  const cableSpecR = cableSvg ? cableSvg.querySelector("[data-cable-r-spec]") : null;
  const cableWeaveAL = cableSvg ? cableSvg.querySelector("[data-cable-l-weave-a]") : null;
  const cableWeaveBL = cableSvg ? cableSvg.querySelector("[data-cable-l-weave-b]") : null;
  const cableWeaveAR = cableSvg ? cableSvg.querySelector("[data-cable-r-weave-a]") : null;
  const cableWeaveBR = cableSvg ? cableSvg.querySelector("[data-cable-r-weave-b]") : null;
  const cablePulseL = cableSvg ? cableSvg.querySelector("[data-cable-l-pulse]") : null;
  const cablePulseR = cableSvg ? cableSvg.querySelector("[data-cable-r-pulse]") : null;

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

  // --- Coupled Dual-Cable Damped Suspension & Multi-Node Wave Chain Physics ---
  let x = 0;
  let y = 0;
  let vx = 0;
  let vy = 0;
  let ang = 0;
  let vang = 0;
  let restCordLen = 58;

  const WIRE_SEGMENTS = 5;
  const createWireState = (outSign) => ({
    outSign,
    initialized: false,
    wx: new Float64Array(WIRE_SEGMENTS + 1),
    wy: new Float64Array(WIRE_SEGMENTS + 1),
    vx: new Float64Array(WIRE_SEGMENTS + 1),
    vy: new Float64Array(WIRE_SEGMENTS + 1),
    baseX: new Float64Array(WIRE_SEGMENTS + 1),
    baseY: new Float64Array(WIRE_SEGMENTS + 1),
    ax: 0,
    ay: 12,
    px: 0,
    py: 70,
    prevPx: 0,
    prevPy: 70,
    pulse: 0,
    pulseT: 0,
    pulseDir: -1,
  });

  const wireL = createWireState(-1);
  const wireR = createWireState(1);

  let raf = 0;
  let lastStepMs = 0;
  let dragging = false;
  let pendingDrag = false;
  let pointerId = null;
  let downClientX = 0;
  let downClientY = 0;
  let startX = 0;
  let startY = 0;
  let suppressClickUntil = 0;

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
    chassis.style.transformOrigin = "50% 0";

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

  function startPhysicsLoop() {
    if (!raf) {
      lastStepMs = performance.now();
      raf = requestAnimationFrame(stepPhysics);
    }
  }

  // Evaluate 6 Hermite + natural compression-bow points along a suspended braided cable
  function updateWireTargetGeometry(wire, ax, ay, px, py) {
    wire.ax = ax;
    wire.ay = ay;
    wire.px = px;
    wire.py = py;

    const dx = px - ax;
    const dy = py - ay;
    const dist = Math.max(16, Math.hypot(dx, dy));
    const tx = dx / dist;
    const ty = dy / dist;
    // Outward world perpendicular when cable runs top-to-bottom (ty > 0 -> +1 is world right)
    const nx = ty;
    const ny = -tx;

    // Subtle natural rest drape lets cables hang realistically vertical and bow outward under upward compression
    const naturalLen = Math.max(restCordLen + 3.2, 42);
    const excessSlack = Math.max(0, naturalLen - dist);
    const stretchTaut = clamp((dist - naturalLen) / 30, 0, 1);
    const bowAmp = (1.75 * (1 - stretchTaut * 0.85) + Math.sqrt(excessSlack) * 3.8) * wire.outSign;

    // Grommet exit downward tangent & USB-C boot coaxial tangent
    const tanLen = clamp(dist * 0.52, 18, 42);
    const m0x = 0;
    const m0y = tanLen;
    const m1x = -Math.sin(ang) * tanLen;
    const m1y = Math.cos(ang) * tanLen;

    for (let i = 0; i <= WIRE_SEGMENTS; i++) {
      const t = i / WIRE_SEGMENTS;
      const t2 = t * t;
      const t3 = t2 * t;
      const h00 = 2 * t3 - 3 * t2 + 1;
      const h10 = t3 - 2 * t2 + t;
      const h01 = -2 * t3 + 3 * t2;
      const h11 = t3 - t2;

      const bowProfile = Math.sin(Math.PI * t) * Math.pow(Math.sin(Math.PI * t), 0.35);
      const bx = h00 * ax + h10 * m0x + h01 * px + h11 * m1x + nx * bowAmp * bowProfile;
      const by = h00 * ay + h10 * m0y + h01 * py + h11 * m1y + ny * bowAmp * bowProfile;

      wire.baseX[i] = bx;
      wire.baseY[i] = by;
    }

    if (!wire.initialized || Math.hypot(wire.wx[3] - wire.baseX[3], wire.wy[3] - wire.baseY[3]) > 120) {
      for (let i = 0; i <= WIRE_SEGMENTS; i++) {
        wire.wx[i] = wire.baseX[i];
        wire.wy[i] = wire.baseY[i];
        wire.vx[i] = 0;
        wire.vy[i] = 0;
      }
      wire.prevPx = px;
      wire.prevPy = py;
      wire.initialized = true;
    } else {
      wire.wx[0] = ax;
      wire.wy[0] = ay;
      wire.wx[WIRE_SEGMENTS] = px;
      wire.wy[WIRE_SEGMENTS] = py;
    }
  }

  // Integrate physical transverse wave propagation & inertial whip along wire interior nodes
  function stepWirePhysics(wire, h) {
    if (!wire.initialized) return 0;

    // True port endpoint velocity relative to last step injects natural cord lag/whip
    const portVelX = (wire.px - wire.prevPx) / Math.max(0.25, h);
    const portVelY = (wire.py - wire.prevPy) / Math.max(0.25, h);
    wire.prevPx = wire.px;
    wire.prevPy = wire.py;

    const kBase = 0.24;
    const kNeighbor = 0.28;
    const damp = Math.pow(0.84, h);
    let maxEnergy = 0;

    for (let i = 1; i < WIRE_SEGMENTS; i++) {
      const t = i / WIRE_SEGMENTS;
      const devX = wire.wx[i] - wire.baseX[i];
      const devY = wire.wy[i] - wire.baseY[i];

      const leftDevX = wire.wx[i - 1] - wire.baseX[i - 1];
      const leftDevY = wire.wy[i - 1] - wire.baseY[i - 1];
      const rightDevX = wire.wx[i + 1] - wire.baseX[i + 1];
      const rightDevY = wire.wy[i + 1] - wire.baseY[i + 1];

      // End nodes stiffer to keep grommet & USB-C strain-relief collars crisp
      const endStiff = i === 1 || i === WIRE_SEGMENTS - 1 ? 1.38 : 0.92;
      const fx =
        -devX * kBase * endStiff +
        (leftDevX + rightDevX - 2 * devX) * kNeighbor -
        portVelX * t * 0.042;
      const fy =
        -devY * kBase * endStiff +
        (leftDevY + rightDevY - 2 * devY) * kNeighbor -
        portVelY * t * 0.028;

      wire.vx[i] = clamp((wire.vx[i] + fx * h) * damp, -24, 24);
      wire.vy[i] = clamp((wire.vy[i] + fy * h) * damp, -24, 24);
    }

    for (let i = 1; i < WIRE_SEGMENTS; i++) {
      wire.wx[i] = wire.baseX[i] + clamp(wire.wx[i] + wire.vx[i] * h - wire.baseX[i], -34, 34);
      wire.wy[i] = wire.baseY[i] + clamp(wire.wy[i] + wire.vy[i] * h - wire.baseY[i], -28, 28);
      maxEnergy += Math.abs(wire.vx[i]) + Math.abs(wire.vy[i]) + Math.abs(wire.wx[i] - wire.baseX[i]) * 0.14 + Math.abs(wire.wy[i] - wire.baseY[i]) * 0.14;
    }

    if (wire.pulse > 0.005) {
      wire.pulseT += 0.048 * h;
      wire.pulse *= Math.pow(0.925, h);
      if (wire.pulseT >= 1.15 || wire.pulse <= 0.012) {
        wire.pulse = 0;
        wire.pulseT = 0;
      } else {
        maxEnergy += 0.25;
      }
    }

    return maxEnergy;
  }

  function catmullChainToPath(pts, tanStartX, tanStartY, tanEndX, tanEndY) {
    const n = pts.length - 1;
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const p0 = i === 0 ? { x: pts[0].x - tanStartX, y: pts[0].y - tanStartY } : pts[i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i + 1 === n ? { x: pts[n].x + tanEndX, y: pts[n].y + tanEndY } : pts[i + 2];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  }

  function drawWire(wire, pathsMain, shadowEl, contactEl, specEl, weaveAEl, weaveBEl, pulseEl) {
    if (!wire.initialized) return;

    const mainPts = [];
    const shadowPts = [];
    const specPts = [];
    const weaveAPts = [];
    const weaveBPts = [];

    const liftX = 2.6 + x * 0.12 - ang * 14;
    const liftY = 4.6 + y * 0.08 + Math.abs(ang) * 10;
    const cosA = Math.cos(ang);
    const sinA = Math.sin(ang);

    for (let i = 0; i <= WIRE_SEGMENTS; i++) {
      const t = i / WIRE_SEGMENTS;
      const px = wire.wx[i];
      const py = wire.wy[i];
      mainPts.push({ x: px, y: py });

      // Depth-projected wall shadow: flush at top grommet (t=0), separated cleanly down at USB-C port (t=1)
      const wScale = 0.25 + t * 0.75;
      shadowPts.push({ x: px + liftX * wScale, y: py + liftY * wScale });

      const nx = (1 - t) + cosA * t;
      const ny = sinA * t;

      // Specular rim & fine staggered herringbone paracord weave tracks along cylindrical sides
      specPts.push({ x: px - nx * 1.5, y: py - ny * 1.5 - 0.15 });
      weaveAPts.push({ x: px - nx * 1.05, y: py - ny * 1.05 });
      weaveBPts.push({ x: px + nx * 1.05, y: py + ny * 1.05 });
    }

    const startTanX = 0;
    const startTanY = 16;
    const endTanX = -Math.sin(ang) * 16;
    const endTanY = Math.cos(ang) * 16;

    const dMain = catmullChainToPath(mainPts, startTanX, startTanY, endTanX, endTanY);
    const dShadow = catmullChainToPath(shadowPts, startTanX, startTanY, endTanX, endTanY);
    const dSpec = catmullChainToPath(specPts, startTanX, startTanY, endTanX, endTanY);
    const dWeaveA = catmullChainToPath(weaveAPts, startTanX, startTanY, endTanX, endTanY);
    const dWeaveB = catmullChainToPath(weaveBPts, startTanX, startTanY, endTanX, endTanY);

    for (let i = 0; i < pathsMain.length; i++) pathsMain[i].setAttribute("d", dMain);
    if (shadowEl) shadowEl.setAttribute("d", dShadow);
    if (contactEl) contactEl.setAttribute("d", dMain);
    if (specEl) specEl.setAttribute("d", dSpec);
    if (weaveAEl) weaveAEl.setAttribute("d", dWeaveA);
    if (weaveBEl) weaveBEl.setAttribute("d", dWeaveB);

    if (pulseEl) {
      if (wire.pulse > 0.02) {
        const estLen = Math.hypot(wire.px - wire.ax, wire.py - wire.ay) * 1.14;
        const segLen = clamp(estLen * 0.28, 13, 22);
        const travel = wire.pulseDir < 0 ? 1 - clamp(wire.pulseT, 0, 1) : clamp(wire.pulseT, 0, 1);
        const dashOff = -(travel * (estLen + segLen) - segLen);
        const op = clamp(wire.pulse * Math.sin(clamp(wire.pulseT, 0, 1) * Math.PI), 0, 0.92);
        pulseEl.setAttribute("d", dMain);
        pulseEl.style.strokeDasharray = `${segLen.toFixed(1)} ${(estLen * 2.4).toFixed(1)}`;
        pulseEl.style.strokeDashoffset = `${dashOff.toFixed(1)}`;
        pulseEl.style.opacity = op.toFixed(3);
      } else {
        pulseEl.style.opacity = "0";
      }
    }
  }

  function triggerWireWave(strengthL = 1, strengthR = 1, { xImpulse = 0, dir = -1 } = {}) {
    if (reduceMotion) return;
    if (wireL.initialized) {
      wireL.vx[4] += (-1.35 * strengthL + xImpulse * 0.65);
      wireL.vx[3] += (0.85 * strengthL - xImpulse * 0.3);
      wireL.vy[4] += 0.9 * strengthL;
      wireL.pulse = Math.max(wireL.pulse, clamp(0.45 + strengthL * 0.42, 0, 0.95));
      wireL.pulseT = 0.04;
      wireL.pulseDir = dir;
    }
    if (wireR.initialized) {
      wireR.vx[4] += (1.35 * strengthR + xImpulse * 0.65);
      wireR.vx[3] += (-0.85 * strengthR - xImpulse * 0.3);
      wireR.vy[4] += 0.9 * strengthR;
      wireR.pulse = Math.max(wireR.pulse, clamp(0.45 + strengthR * 0.42, 0, 0.95));
      wireR.pulseT = 0.04;
      wireR.pulseDir = dir;
    }
  }

  function measureAndSyncWires() {
    if (!cableSvg || !rig) return;
    const svgRect = cableSvg.getBoundingClientRect();
    const w = svgRect.width || rig.clientWidth || 740;
    const h = svgRect.height || 155;
    cableSvg.setAttribute("viewBox", `0 0 ${w.toFixed(1)} ${h.toFixed(1)}`);

    const leftAnchorX = w * portRatio;
    const rightAnchorX = w * (1 - portRatio);
    const grommetY = 12;

    if (mountL) mountL.setAttribute("transform", `translate(${leftAnchorX.toFixed(1)}, 0)`);
    if (mountR) mountR.setAttribute("transform", `translate(${rightAnchorX.toFixed(1)}, 0)`);

    let rightPortX = rightAnchorX;
    let rightPortY = grommetY + restCordLen + y;
    if (usbTipR && svgRect.width > 0) {
      const tipR = usbTipR.getBoundingClientRect();
      rightPortX = tipR.left + tipR.width * 0.5 - svgRect.left;
      rightPortY = tipR.top + tipR.height * 0.5 - svgRect.top + 3;
      if (!dragging && Math.abs(y) < 0.8 && Math.abs(ang) < 0.015) {
        restCordLen = clamp(rightPortY - grommetY, 38, 86);
      }
    }

    let leftPortX = leftAnchorX;
    let leftPortY = grommetY + restCordLen + y;
    if (usbTipL && svgRect.width > 0) {
      const tipL = usbTipL.getBoundingClientRect();
      leftPortX = tipL.left + tipL.width * 0.5 - svgRect.left;
      leftPortY = tipL.top + tipL.height * 0.5 - svgRect.top + 3;
    }

    updateWireTargetGeometry(wireL, leftAnchorX, grommetY, leftPortX, leftPortY);
    updateWireTargetGeometry(wireR, rightAnchorX, grommetY, rightPortX, rightPortY);
  }

  function drawHanging() {
    if (!chassis) return;
    const deg = (ang * 180) / Math.PI;
    chassis.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${deg.toFixed(2)}deg)`;

    if (wallShadow) {
      const shX = x * 0.72 + 4 - ang * 18;
      const shY = y * 0.78 + 20 + Math.abs(ang) * 14;
      const shScale = 0.96 + Math.min(0.06, Math.abs(y) * 0.0012);
      wallShadow.style.transform = `translate3d(${shX.toFixed(1)}px, ${shY.toFixed(1)}px, 0) rotate(${(deg * 0.88).toFixed(2)}deg) scale(${shScale.toFixed(3)})`;
    }

    measureAndSyncWires();
    drawWire(wireL, cablePathsL, cableShadowL, cableContactL, cableSpecL, cableWeaveAL, cableWeaveBL, cablePulseL);
    drawWire(wireR, cablePathsR, cableShadowR, cableContactR, cableSpecR, cableWeaveAR, cableWeaveBR, cablePulseR);
  }

  function stepPhysics(now = performance.now()) {
    raf = 0;
    const rawDt = lastStepMs ? (now - lastStepMs) / 16.667 : 1;
    lastStepMs = now;
    const dt = clamp(rawDt, 0.25, 2.0);
    const sub = dt > 1.05 ? 2 : 1;
    const h = dt / sub;

    let wireEnergy = 0;

    for (let s = 0; s < sub; s++) {
      if (!dragging) {
        vx = (vx + (-x * 0.145) * h) * Math.pow(0.835, h);
        vy = (vy + (-y * 0.16) * h) * Math.pow(0.835, h);
        x += vx * h;
        y += vy * h;

        const targetAng = clamp(x * 0.0013 + vx * 0.0036, -0.1, 0.1);
        vang = (vang + (targetAng - ang) * 0.2 * h) * Math.pow(0.825, h);
        ang += vang * h;
      }

      if (chassis) {
        const deg = (ang * 180) / Math.PI;
        chassis.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${deg.toFixed(2)}deg)`;
      }
      measureAndSyncWires();
      wireEnergy = stepWirePhysics(wireL, h) + stepWirePhysics(wireR, h);
    }

    drawHanging();

    const boardEnergy =
      Math.abs(vx) +
      Math.abs(vy) +
      Math.abs(vang) * 26 +
      Math.abs(x) * 0.03 +
      Math.abs(y) * 0.03 +
      Math.abs(ang) * 2.2;

    if (dragging || boardEnergy + wireEnergy > 0.025) {
      raf = requestAnimationFrame(stepPhysics);
    } else {
      x = 0;
      y = 0;
      ang = 0;
      vx = 0;
      vy = 0;
      vang = 0;
      wireL.pulse = 0;
      wireR.pulse = 0;
      for (let i = 0; i <= WIRE_SEGMENTS; i++) {
        wireL.wx[i] = wireL.baseX[i];
        wireL.wy[i] = wireL.baseY[i];
        wireL.vx[i] = 0;
        wireL.vy[i] = 0;
        wireR.wx[i] = wireR.baseX[i];
        wireR.wy[i] = wireR.baseY[i];
        wireR.vx[i] = 0;
        wireR.vy[i] = 0;
      }
      drawHanging();
    }
  }

  function impulseKeyboard(colRatio = 0, downForce = 3.0, { waveDir = -1 } = {}) {
    if (reduceMotion) return;
    vy += downForce;
    vx += colRatio * 1.15;
    vang += colRatio * 0.01;
    const biasL = clamp(1 - colRatio * 0.45, 0.45, 1.45);
    const biasR = clamp(1 + colRatio * 0.45, 0.45, 1.45);
    triggerWireWave(biasL, biasR, { xImpulse: colRatio * 0.9, dir: waveDir });
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
      const syScale = y < 0 ? 32 : 58;
      startX = e.clientX - invResist(x, 76);
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

      const dx = resist(rawDx, 76);
      const dy = rawDy < 0 ? resist(rawDy, 32) : resist(rawDy, 58);
      vx = (dx - x) * 0.48;
      vy = (dy - y) * 0.48;
      x = dx;
      y = dy;
      ang = clamp(dx * 0.0014 - dy * 0.0016 + vx * 0.0022, -0.14, 0.14);
      startPhysicsLoop();
      drawHanging();
    });

    const endDrag = (e) => {
      if (e.pointerId !== undefined && e.pointerId !== pointerId) return;
      pendingDrag = false;
      pointerId = null;
      if (!dragging) return;
      dragging = false;
      chassis.classList.remove("is-dragging");
      triggerWireWave(0.8, 0.8, { xImpulse: clamp(vx * 0.25, -2.5, 2.5), dir: 1 });
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

    // 3. Alt / Cable Wave Impulse Key (Outer Modifier)
    const altKey = document.createElement("button");
    altKey.type = "button";
    altKey.className = "kb-cap kb-cap--mod";
    altKey.dataset.tip = "Flex Cables";
    altKey.innerHTML = `<span class="kb-cap-dish"><span class="kb-bot-main">Alt</span></span>`;
    altKey.addEventListener("click", (e) => {
      sound.play("down");
      setTimeout(() => sound.play("up"), 70);
      pulseKeyDown(altKey);
      impulseKeyboard(-0.35, 3.6, { waveDir: -1 });
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
    impulseKeyboard(0, 4.8, { waveDir: 1 });
  });

  renderBoard(getMode(), { flipping: false, layerIndex: 0 });
  if (!reduceMotion) {
    requestAnimationFrame(() => {
      updateCaseSvg();
      drawHanging();
      vy = -2.8;
      ang = 0.014;
      triggerWireWave(0.65, 0.65, { xImpulse: 0.55, dir: 1 });
      startPhysicsLoop();
    });
  }
}
