// Interactive developer playgrounds:
// 1. Tactile Desk Macropad + Mechanical Switch Acoustic Selector
// 2. 60fps Hooke's Law Spring Physics Lab (draggable puck + live response canvas)
// 3. Full-Stack Craft Switcher
// 4. /work/ Web Audio Scope & Edge Pipeline Inspector
// 5. /contact/ Clipboard Copy & Local Mailto Composer
import { sound } from "./sound.js";
import { toast } from "./ui.js";
import { reduceMotion } from "./mode.js";

const SWITCH_SPECS = {
  thock: "Lubed PBT linear · 172 Hz housing thock",
  clicky: "Tactile click-bar · 3.9 kHz dual snap",
  synth: "Harmonic poly-pluck · C major pentatonic",
};

function initSwitchSelectors() {
  const btns = [...document.querySelectorAll("[data-switch-profile]")];
  const specs = [...document.querySelectorAll("[data-switch-spec]")];
  if (!btns.length && !specs.length) return;

  function sync(prof) {
    btns.forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.switchProfile === prof))
    );
    specs.forEach((el) => {
      el.textContent = SWITCH_SPECS[prof] || SWITCH_SPECS.thock;
    });
  }

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      sound.setProfile(btn.dataset.switchProfile);
    });
  });

  sound.onProfileChange(sync);
  sync(sound.profile);
}

function initMacropad() {
  const shell = document.querySelector("[data-macropad]");
  if (!shell) return;
  const chassis = shell.querySelector(".macropad");
  const led = shell.querySelector(".pad-led");
  const oled = shell.querySelector("[data-pad-oled]");
  const caps = [...shell.querySelectorAll(".cap")];
  let buffer = "";
  let ledTimer = 0;
  let tiltTimer = 0;

  function flashLed(cls = "is-on", ms = 220) {
    if (!led) return;
    clearTimeout(ledTimer);
    led.classList.remove("is-on", "is-auth");
    led.classList.add(cls);
    ledTimer = setTimeout(() => led.classList.remove("is-on", "is-auth"), ms);
  }

  function setOled(text) {
    if (oled) oled.textContent = text;
  }

  function dominoWave() {
    caps.forEach((c, i) => {
      setTimeout(() => {
        c.classList.add("is-down");
        setTimeout(() => c.classList.remove("is-down"), 120);
      }, i * 42);
    });
  }

  function triggerCap(cap, fromKey = false) {
    if (!cap) return;
    const key = (cap.dataset.key || "").toLowerCase();
    const idx = caps.indexOf(cap);
    const col = idx >= 0 ? (idx % 4) - 1.5 : 0;
    const row = idx >= 4 ? 1 : -1;

    cap.classList.add("is-down");
    if (key === "spark") {
      sound.play("taDa");
      flashLed("is-auth", 1400);
      setOled("CHORD // ALL SYSTEMS GREEN");
      if (!reduceMotion) dominoWave();
    } else {
      sound.play("down");
      flashLed("is-on", 200);
      buffer = (buffer + key.toUpperCase()).slice(-7);
      setOled(`KEY [${key.toUpperCase()}] · ${buffer.padEnd(7, "·")}`);

      if (buffer === "SAMUBIN") {
        buffer = "";
        flashLed("is-auth", 2800);
        setTimeout(() => sound.play("taDa"), 75);
        setOled("VERIFIED // SAKIB ALAM MUBIN");
        toast("Combo unlocked: Sakib Alam Mubin (SA Mubin)!", { auth: true });
        if (!reduceMotion) dominoWave();
      }
    }

    if (chassis && !reduceMotion) {
      chassis.style.transform = `perspective(720px) rotateX(${(-row * 2.4).toFixed(1)}deg) rotateY(${(col * 2.8).toFixed(1)}deg) translateY(2px)`;
      clearTimeout(tiltTimer);
      tiltTimer = setTimeout(() => {
        chassis.style.transform = "";
      }, 150);
    }

    if (fromKey) {
      setTimeout(() => {
        cap.classList.remove("is-down");
        if (key !== "spark") sound.play("up");
      }, 125);
    }
  }

  caps.forEach((cap) => {
    cap.addEventListener("pointerdown", (e) => {
      if (e.button && e.button !== 0) return;
      triggerCap(cap, false);
    });
    const release = () => {
      if (cap.classList.contains("is-down")) {
        cap.classList.remove("is-down");
        if (cap.dataset.key !== "spark") sound.play("up");
      }
    };
    cap.addEventListener("pointerup", release);
    cap.addEventListener("pointerleave", release);
    cap.addEventListener("pointercancel", release);
    cap.addEventListener("click", (e) => {
      if (e.detail === 0) triggerCap(cap, true);
    });
  });

  // Physical keyboard support when macropad is on screen
  document.addEventListener("keydown", (e) => {
    if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.getElementById("palette")?.open) return;
    if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;
    const r = shell.getBoundingClientRect();
    if (r.bottom < 40 || r.top > innerHeight - 40) return;
    const match = caps.find((c) => c.dataset.key === e.key.toLowerCase());
    if (match) triggerCap(match, true);
  });
}

function initCraftTabs() {
  document.querySelectorAll("[data-craft-tabs]").forEach((root) => {
    const btns = [...root.querySelectorAll("[data-craft-tab]")];
    const panels = [...root.querySelectorAll("[data-craft-panel]")];
    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.craftTab;
        btns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        panels.forEach((p) => {
          p.hidden = p.dataset.craftPanel !== target;
        });
        sound.play("switch");
      });
    });
  });
}

function initSpringLab() {
  const lab = document.querySelector("[data-spring-lab]");
  if (!lab) return;

  const kIn = lab.querySelector("[data-spring-k]");
  const cIn = lab.querySelector("[data-spring-c]");
  const kVal = lab.querySelector("[data-k-val]");
  const cVal = lab.querySelector("[data-c-val]");
  const meta = lab.querySelector("[data-spring-meta]");
  const track = lab.querySelector("[data-spring-track]");
  const puck = lab.querySelector("[data-spring-puck]");
  const coil = lab.querySelector("[data-spring-coil]");
  const chart = lab.querySelector("[data-spring-chart]");
  const pluckBtn = lab.querySelector("[data-spring-pluck]");
  const presets = [...lab.querySelectorAll("[data-spring-preset]")];

  let k = Number(kIn?.value || 210);
  let c = Number(cIn?.value || 14);
  let disp = 0; // normalized -1..1 around track center
  let vel = 0;
  let dragging = false;
  let pointerId = null;
  let raf = 0;
  let simTime = 0;
  let activeTrace = false;
  let lastTickZero = 0;

  function simulateCurve(stiff, damp) {
    const pts = [];
    let x = 1;
    let v = 0;
    const dt = 1 / 120;
    let settleT = 1.8;
    for (let i = 0; i <= 216; i++) {
      const t = i * dt;
      pts.push({ t, x });
      if (Math.abs(x) > 0.02 || Math.abs(v) > 0.08) settleT = t;
      const a = -stiff * x - damp * v;
      v += a * dt;
      x += v * dt;
    }
    return { pts, settleMs: Math.round(settleT * 1000) };
  }

  function drawChart() {
    if (!chart) return;
    const r = chart.getBoundingClientRect();
    const w = Math.max(220, r.width || 320);
    const h = Math.max(110, r.height || 130);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (chart.width !== Math.round(w * dpr) || chart.height !== Math.round(h * dpr)) {
      chart.width = Math.round(w * dpr);
      chart.height = Math.round(h * dpr);
    }
    const ctx = chart.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const midY = h * 0.52;
    const amp = h * 0.34;

    // Rest axis
    ctx.strokeStyle = "rgba(236, 232, 223, 0.14)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(12, midY);
    ctx.lineTo(w - 12, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    const { pts, settleMs } = simulateCurve(k, c);
    const zeta = c / (2 * Math.sqrt(k));
    const regime =
      zeta < 0.92 ? "Underdamped" : zeta <= 1.08 ? "Critically damped" : "Overdamped";
    if (meta) {
      meta.textContent = `${regime} · ζ = ${zeta.toFixed(2)} · settles in ~${settleMs} ms`;
    }

    // Response curve
    ctx.strokeStyle = "#ff5a1f";
    ctx.lineWidth = 2.6;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    pts.forEach((p, idx) => {
      const px = 14 + (p.t / 1.8) * (w - 28);
      const py = midY - p.x * amp;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Live playhead dot when oscillating
    if (activeTrace && simTime <= 1.8) {
      const idx = Math.min(pts.length - 1, Math.round(simTime * 120));
      const p = pts[idx];
      const px = 14 + (p.t / 1.8) * (w - 28);
      const py = midY - disp * amp;
      ctx.fillStyle = "#ece8df";
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawTrack() {
    if (!track || !puck || !coil) return;
    const w = track.clientWidth || 300;
    const center = w * 0.54;
    const maxTravel = Math.max(54, w * 0.34);
    const puckX = center + disp * maxTravel;

    puck.style.transform = `translate3d(${(puckX - 28).toFixed(2)}px, -50%, 0)`;

    // Build elastic zig-zag spring coil from left anchor (18px) to puck left edge
    const startX = 18;
    const endX = Math.max(startX + 26, puckX - 28);
    const coils = 11;
    const span = endX - startX;
    let d = `M ${startX} 32 L ${startX + 8} 32`;
    const innerSpan = Math.max(12, span - 16);
    for (let i = 0; i < coils; i++) {
      const x = startX + 8 + ((i + 0.5) / coils) * innerSpan;
      const y = i % 2 === 0 ? 19 : 45;
      d += ` L ${x.toFixed(1)} ${y}`;
    }
    d += ` L ${endX.toFixed(1)} 32`;
    coil.setAttribute("d", d);
  }

  let prevNow = 0;
  function step(now) {
    raf = 0;
    const dt = Math.min(0.032, prevNow ? (now - prevNow) / 1000 : 1 / 60);
    prevNow = now;

    if (!dragging) {
      const prevDisp = disp;
      // Sub-step twice for rock-solid high-stiffness stability
      const sub = dt / 2;
      for (let s = 0; s < 2; s++) {
        const acc = -k * disp - c * vel;
        vel += acc * sub;
        disp += vel * sub;
      }
      simTime += dt;

      // Subtle acoustic tick on fast zero-crossing
      if (
        prevDisp * disp < 0 &&
        Math.abs(vel) > 1.8 &&
        now - lastTickZero > 95
      ) {
        lastTickZero = now;
        sound.play("up");
      }
    }

    drawTrack();
    drawChart();

    if (dragging || Math.abs(disp) > 0.003 || Math.abs(vel) > 0.015) {
      if (!reduceMotion) raf = requestAnimationFrame(step);
      else {
        disp = 0;
        vel = 0;
        activeTrace = false;
        drawTrack();
        drawChart();
      }
    } else {
      disp = 0;
      vel = 0;
      activeTrace = false;
      drawTrack();
      drawChart();
    }
  }

  function wake() {
    prevNow = 0;
    if (!raf && !reduceMotion) raf = requestAnimationFrame(step);
    else if (reduceMotion) {
      disp = 0;
      vel = 0;
      drawTrack();
      drawChart();
    }
  }

  function pluck(amount = 0.85) {
    disp = amount;
    vel = 0;
    simTime = 0;
    activeTrace = true;
    sound.play("boing");
    wake();
  }

  function syncParams() {
    k = Number(kIn.value);
    c = Number(cIn.value);
    if (kVal) kVal.textContent = String(k);
    if (cVal) cVal.textContent = String(c);
    presets.forEach((btn) => {
      const [pk, pc] = btn.dataset.springPreset.split(",").map(Number);
      btn.setAttribute("aria-pressed", String(pk === k && pc === c));
    });
    drawChart();
  }

  kIn?.addEventListener("input", syncParams);
  cIn?.addEventListener("input", syncParams);
  kIn?.addEventListener("change", () => pluck(0.78));
  cIn?.addEventListener("change", () => pluck(0.78));

  presets.forEach((btn) => {
    btn.addEventListener("click", () => {
      const [pk, pc] = btn.dataset.springPreset.split(",").map(Number);
      kIn.value = String(pk);
      cIn.value = String(pc);
      syncParams();
      pluck(0.85);
    });
  });

  pluckBtn?.addEventListener("click", () => pluck(disp > 0.2 ? -0.85 : 0.88));

  // Drag & release the physical spring puck
  puck?.addEventListener("pointerdown", (e) => {
    if (e.button && e.button !== 0) return;
    dragging = true;
    activeTrace = false;
    pointerId = e.pointerId;
    puck.classList.add("is-dragging");
    try {
      puck.setPointerCapture(pointerId);
    } catch {}
    sound.play("down");
    wake();
  });

  addEventListener("pointermove", (e) => {
    if (!dragging || e.pointerId !== pointerId || !track) return;
    const r = track.getBoundingClientRect();
    const center = r.width * 0.54;
    const maxTravel = Math.max(54, r.width * 0.34);
    const localX = e.clientX - r.left;
    disp = Math.max(-0.95, Math.min(0.95, (localX - center) / maxTravel));
    vel = 0;
    drawTrack();
  });

  const releaseDrag = (e) => {
    if (!dragging || (e.pointerId !== undefined && e.pointerId !== pointerId)) return;
    dragging = false;
    pointerId = null;
    puck?.classList.remove("is-dragging");
    simTime = 0;
    activeTrace = true;
    sound.play("boing");
    wake();
  };
  addEventListener("pointerup", releaseDrag);
  addEventListener("pointercancel", releaseDrag);
  addEventListener("resize", () => {
    drawTrack();
    drawChart();
  }, { passive: true });

  syncParams();
  drawTrack();
}

function initAudioBench() {
  const root = document.querySelector("[data-audio-bench]");
  if (!root) return;
  const scope = root.querySelector("[data-audio-scope]");
  const readout = root.querySelector("[data-audio-readout]");
  const pads = [...root.querySelectorAll("[data-voice]")];

  const VOICES = {
    thock: { play: () => { sound.setProfile("thock", { silent: true }); sound.play("down"); }, freq: 2.2, decay: 3.4, color: "#ff5a1f", desc: "triangle 172→78 Hz + bandpass 1.45 kHz · 0 KB external audio" },
    clicky: { play: () => { sound.setProfile("clicky", { silent: true }); sound.play("down"); }, freq: 6.5, decay: 5.2, color: "#38bdf8", desc: "dual bandpass 3.9 kHz / 4.65 kHz + square transient · 32 ms" },
    synth: { play: () => { sound.setProfile("synth", { silent: true }); sound.play("down"); }, freq: 3.8, decay: 1.9, color: "#a855f7", desc: "pentatonic triangle + 5th harmonic sine · polyphonic Web Audio" },
    boop: { play: () => sound.play("boop"), freq: 4.4, decay: 2.4, color: "#facc15", desc: "sine pitch glide 330→760 Hz + sparkle overtone · avatar voice" },
    taDa: { play: () => sound.play("taDa"), freq: 5.0, decay: 1.5, color: "#4ade80", desc: "C5–E5–G5–C6 arpeggio triad · reward cue" },
  };

  let current = VOICES.thock;
  let animAmp = 0.65;
  let raf = 0;
  let phase = 0;

  function draw() {
    raf = 0;
    if (!scope) return;
    const r = scope.getBoundingClientRect();
    const w = Math.max(220, r.width || 320);
    const h = Math.max(96, r.height || 108);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (scope.width !== Math.round(w * dpr) || scope.height !== Math.round(h * dpr)) {
      scope.width = Math.round(w * dpr);
      scope.height = Math.round(h * dpr);
    }
    const ctx = scope.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const mid = h / 2;
    ctx.strokeStyle = "rgba(236,232,223,0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(w, mid);
    ctx.stroke();

    ctx.strokeStyle = current.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const t = x / w;
      const env = Math.exp(-t * current.decay) * Math.sin(Math.PI * Math.min(1, t * 8));
      const y =
        mid -
        Math.sin(t * Math.PI * 2 * current.freq * 3 - phase) *
          env *
          (h * 0.4) *
          animAmp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    if (!reduceMotion && animAmp > 0.28) {
      phase += 0.24;
      animAmp = Math.max(0.26, animAmp * 0.95);
      raf = requestAnimationFrame(draw);
    }
  }

  pads.forEach((btn) => {
    btn.addEventListener("click", () => {
      const v = VOICES[btn.dataset.voice] || VOICES.thock;
      current = v;
      pads.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      if (readout) readout.textContent = v.desc;
      v.play();
      animAmp = 1;
      if (!raf) draw();
    });
  });

  addEventListener("resize", draw, { passive: true });
  draw();
}

function initApiBench() {
  const root = document.querySelector("[data-api-bench]");
  if (!root) return;
  const chips = [...root.querySelectorAll("[data-pipe]")];
  const codeOut = root.querySelector("[data-pipe-code]");
  const statusOut = root.querySelector("[data-pipe-status]");
  const badge = root.querySelector("[data-pipe-badge]");

  const LAYERS = {
    schema: {
      code: "const input = ProjectQuerySchema.parse(req.query);",
      win: "Rejects malformed payloads at the route boundary (400)",
    },
    cache: {
      code: 'res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=600");',
      win: "Sub-20ms edge reads without hammering origin DB",
    },
    ratelimit: {
      code: "await tokenBucket.consume(clientIp, { burst: 30 });",
      win: "Protects expensive mutations against noisy spikes",
    },
    csp: {
      code: "res.setHeader(\"Content-Security-Policy\", \"default-src 'self'; object-src 'none'\");",
      win: "Defense-in-depth browser policy & __Host- session safety",
    },
  };

  function render() {
    const active = chips
      .filter((c) => c.getAttribute("aria-pressed") === "true")
      .map((c) => c.dataset.pipe);

    const lines = ["export async function handleRequest(req, res) {"];
    active.forEach((k) => lines.push("  " + LAYERS[k].code));
    lines.push("  return res.json(await loadProjects());\n}");
    if (codeOut) codeOut.textContent = lines.join("\n");

    if (statusOut) {
      statusOut.textContent = active.length
        ? active.map((k) => "[ok] " + LAYERS[k].win).join("\n")
        : "Raw handler only — toggle middleware layers above to inspect the stack.";
    }
    if (badge) {
      badge.textContent = `${active.length}/4 LAYERS`;
      badge.className = `verdict ${active.length >= 3 ? "verdict--ok" : "verdict--bad"}`;
    }
  }

  chips.forEach((btn) => {
    btn.addEventListener("click", () => {
      const on = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", String(on));
      render();
      if (chips.every((c) => c.getAttribute("aria-pressed") === "true")) {
        sound.play("auth");
      }
    });
  });

  render();
}

function initContactTools() {
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const val = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(val);
        sound.play("auth");
        toast(`Copied ${val} to clipboard.`, { auth: true });
      } catch {
        toast(`Copy manually: ${val}`);
      }
    });
  });

  const composer = document.querySelector("[data-composer]");
  if (!composer) return;
  const topicBtns = [...composer.querySelectorAll("[data-topic]")];
  const msg = composer.querySelector("[data-compose-msg]");
  const link = composer.querySelector("[data-compose-send]");
  const nameIn = composer.querySelector("[data-compose-name]");

  const templates = {
    engineering: {
      subject: "Full-Stack Engineering Role / Collaboration — Sakib Alam Mubin",
      body: "Hi SA Mubin,\n\nWe checked out your portfolio and would love to chat about a software engineering role / product build:\n\n- Team / product:\n- Stack & timeline:\n\nBest,",
    },
    product: {
      subject: "Interactive Web / Frontend Architecture Inquiry — SA Mubin",
      body: "Hi SA Mubin,\n\nWe're building a web product that needs fast, polished UI engineering and clean backend APIs:\n\n- Project scope:\n- Target launch:\n\nBest,",
    },
    teaching: {
      subject: "Developer Workshop / Web Security Session — Sakib Alam Mubin",
      body: "Hi SA Mubin,\n\nWe're organizing a hands-on engineering / web security session and would love to invite you:\n\n- Audience:\n- Preferred dates:\n\nBest,",
    },
  };

  let currentTopic = "engineering";
  function syncMailto() {
    const t = templates[currentTopic];
    const sender = nameIn?.value.trim();
    const fullBody = sender ? `${msg.value}\n${sender}` : msg.value;
    link.href = `mailto:hello@samubin.com?subject=${encodeURIComponent(t.subject)}&body=${encodeURIComponent(fullBody)}`;
  }

  topicBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentTopic = btn.dataset.topic;
      topicBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      msg.value = templates[currentTopic].body;
      syncMailto();
    });
  });
  msg?.addEventListener("input", syncMailto);
  nameIn?.addEventListener("input", syncMailto);
  msg.value = templates[currentTopic].body;
  syncMailto();
}

export function initPlaygrounds() {
  initSwitchSelectors();
  initMacropad();
  initCraftTabs();
  initSpringLab();
  initAudioBench();
  initApiBench();
  initContactTools();
}
