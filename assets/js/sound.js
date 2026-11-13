// Synthesized mechanical switch & darkroom acoustics (Web Audio API, zero external audio files).
// Honours user gesture gating and persists both mute state and switch profile.

const STORE_MUTE = "sam.sound";
const STORE_PROFILE = "sam.switch";
const PROFILES = ["thock", "clicky", "synth"];
const PENTA = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];

let ctx = null;
let master = null;
let noiseBuf = null;
let enabled = true;
let profile = "thock";
try {
  enabled = localStorage.getItem(STORE_MUTE) !== "off";
  const savedProf = localStorage.getItem(STORE_PROFILE);
  if (PROFILES.includes(savedProf)) profile = savedProf;
} catch {}

let noteIdx = 0;
const muteListeners = new Set();
const profileListeners = new Set();
const waveListeners = new Set();

function emitWave(energy = 0.7, hue = "thock") {
  waveListeners.forEach((fn) => fn({ energy, hue, profile, time: performance.now() }));
}

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function noise() {
  if (noiseBuf) return noiseBuf;
  const len = Math.floor(ctx.sampleRate * 0.25);
  noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuf;
}

function burst({ freq = 2000, q = 1, dur = 0.04, gain = 0.35, type = "bandpass", when = 0 }) {
  const t = ctx.currentTime + when;
  const src = ctx.createBufferSource();
  src.buffer = noise();
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t, Math.random() * 0.1);
  src.stop(t + dur + 0.03);
}

function tone({ freq = 200, to = null, dur = 0.06, gain = 0.24, type = "sine", when = 0 }) {
  const t = ctx.currentTime + when;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.03);
}

const switchDown = {
  thock(r) {
    burst({ freq: 1450 * r, q: 1.05, dur: 0.026, gain: 0.3 });
    tone({ freq: 172 * r, to: 78, dur: 0.072, gain: 0.34, type: "triangle" });
  },
  clicky(r) {
    burst({ freq: 3900 * r, q: 3.1, dur: 0.015, gain: 0.34 });
    burst({ freq: 4650 * r, q: 2.6, dur: 0.012, gain: 0.22, when: 0.014 });
    tone({ freq: 410 * r, to: 185, dur: 0.032, gain: 0.14, type: "square" });
  },
  synth(r) {
    const base = PENTA[noteIdx % PENTA.length] * (0.98 + (r - 1) * 0.15);
    noteIdx++;
    tone({ freq: base, to: base * 0.995, dur: 0.13, gain: 0.2, type: "triangle" });
    tone({ freq: base * 1.5, dur: 0.09, gain: 0.09, type: "sine", when: 0.008 });
    burst({ freq: 2400, q: 1.8, dur: 0.014, gain: 0.12 });
  },
};

const switchUp = {
  thock(r) {
    burst({ freq: 2950 * r, q: 1.5, dur: 0.014, gain: 0.11 });
  },
  clicky(r) {
    burst({ freq: 4400 * r, q: 2.8, dur: 0.011, gain: 0.16 });
  },
  synth(r) {
    burst({ freq: 3200 * r, q: 2.0, dur: 0.01, gain: 0.08 });
  },
};

const voices = {
  down(r) {
    (switchDown[profile] || switchDown.thock)(r);
    emitWave(0.95, profile);
  },
  space(r) {
    if (profile === "clicky") {
      burst({ freq: 2600 * r, q: 2.2, dur: 0.02, gain: 0.34 });
      tone({ freq: 270 * r, to: 118, dur: 0.048, gain: 0.22, type: "triangle" });
    } else if (profile === "synth") {
      const base = PENTA[noteIdx % PENTA.length] * 0.5;
      noteIdx++;
      tone({ freq: base, to: base * 0.99, dur: 0.16, gain: 0.26, type: "triangle" });
      burst({ freq: 1500, q: 1.4, dur: 0.018, gain: 0.14 });
    } else {
      // Deeper stabilized spacebar cavity resonance
      burst({ freq: 1050 * r, q: 0.95, dur: 0.032, gain: 0.34 });
      tone({ freq: 126 * r, to: 58, dur: 0.095, gain: 0.4, type: "triangle" });
    }
    emitWave(1.0, profile);
  },
  up(r) {
    (switchUp[profile] || switchUp.thock)(r);
  },
  click(r) {
    burst({ freq: 2800 * r, q: 2.2, dur: 0.014, gain: 0.2 });
    tone({ freq: 520 * r, to: 300, dur: 0.028, gain: 0.06, type: "square" });
    emitWave(0.45, profile);
  },
  type(r) {
    burst({ freq: 1800 * r, q: 1.4, dur: 0.018, gain: 0.14 });
    tone({ freq: 210 * r, to: 110, dur: 0.04, gain: 0.12, type: "triangle" });
  },
  switch() {
    burst({ freq: 1400, q: 2.8, dur: 0.028, gain: 0.34 });
    burst({ freq: 3200, q: 2.0, dur: 0.02, gain: 0.2, when: 0.038 });
    emitWave(0.65, profile);
  },
  // Heavy lab breaker clack + safelight warm relay hum for the Lights-Out morph
  breaker(toHack = true) {
    burst({ freq: 980, q: 1.8, dur: 0.032, gain: 0.42 });
    tone({ freq: toHack ? 190 : 130, to: toHack ? 68 : 240, dur: 0.09, gain: 0.36, type: "triangle" });
    burst({ freq: 2650, q: 2.4, dur: 0.022, gain: 0.26, when: 0.055 });
    if (toHack) {
      // Safelight filament warm-up hum
      tone({ freq: 110, to: 120, dur: 0.28, gain: 0.11, type: "sine", when: 0.12 });
      tone({ freq: 440, to: 330, dur: 0.18, gain: 0.08, type: "triangle", when: 0.16 });
    } else {
      // Lab daylight ballast chime
      tone({ freq: 440, to: 660, dur: 0.16, gain: 0.12, type: "triangle", when: 0.1 });
      tone({ freq: 660, to: 880, dur: 0.18, gain: 0.1, type: "sine", when: 0.16 });
    }
    emitWave(1.0, "breaker");
  },
  flip(r) {
    burst({ freq: 2100 * r, q: 1.9, dur: 0.016, gain: 0.15 });
    tone({ freq: 260 * r, to: 140, dur: 0.035, gain: 0.1, type: "triangle" });
  },
  unplug(r) {
    // High-friction USB-C collar slip followed by hollow cavity pop
    burst({ freq: 2900 * r, q: 2.6, dur: 0.018, gain: 0.16 });
    tone({ freq: 340 * r, to: 118, dur: 0.068, gain: 0.24, type: "triangle", when: 0.012 });
    burst({ freq: 1150 * r, q: 1.4, dur: 0.024, gain: 0.22, when: 0.014 });
    emitWave(0.85, "unplug");
  },
  plug(r) {
    // Metal sleeve guide slide + sharp mechanical USB-C click-latch & chassis seat thump
    burst({ freq: 3400 * r, q: 2.2, dur: 0.016, gain: 0.14 });
    burst({ freq: 1850 * r, q: 2.4, dur: 0.022, gain: 0.3, when: 0.032 });
    tone({ freq: 520 * r, to: 165, dur: 0.052, gain: 0.28, type: "triangle", when: 0.034 });
    tone({ freq: 1320 * r, to: 880 * r, dur: 0.04, gain: 0.12, type: "sine", when: 0.048 });
    emitWave(0.95, "plug");
  },
  boop(r) {
    tone({ freq: 330 * r, to: 760 * r, dur: 0.095, gain: 0.22, type: "sine" });
    tone({ freq: 988 * r, to: 1318 * r, dur: 0.08, gain: 0.11, type: "triangle", when: 0.055 });
    emitWave(1.0, "boop");
  },
  wave(r) {
    tone({ freq: 523.25 * r, to: 659.25 * r, dur: 0.085, gain: 0.15, type: "sine" });
    tone({ freq: 659.25 * r, to: 880 * r, dur: 0.11, gain: 0.14, type: "sine", when: 0.085 });
    emitWave(0.8, "wave");
  },
  auth() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      tone({ freq: f, dur: i === 3 ? 0.24 : 0.12, gain: 0.14, type: "triangle", when: i * 0.07 })
    );
    emitWave(1.0, "auth");
  },
  whoosh() {
    burst({ freq: 920, q: 0.65, dur: 0.2, gain: 0.14, type: "lowpass" });
  },
};

export const sound = {
  get enabled() {
    return enabled;
  },
  get profile() {
    return profile;
  },
  get profiles() {
    return PROFILES;
  },
  play(kind = "down", arg) {
    if (!enabled) return;
    if (!ensure()) return;
    const r = 0.94 + Math.random() * 0.12;
    if (kind === "breaker") voices.breaker(arg);
    else (voices[kind] || voices.down)(r);
  },
  toggle(force) {
    enabled = typeof force === "boolean" ? force : !enabled;
    try {
      localStorage.setItem(STORE_MUTE, enabled ? "on" : "off");
    } catch {}
    if (enabled && ensure()) voices.switch();
    muteListeners.forEach((fn) => fn(enabled));
    return enabled;
  },
  setProfile(next) {
    if (!PROFILES.includes(next)) return profile;
    profile = next;
    try {
      localStorage.setItem(STORE_PROFILE, profile);
    } catch {}
    if (enabled && ensure()) voices.down(1);
    profileListeners.forEach((fn) => fn(profile));
    return profile;
  },
  onChange(fn) {
    muteListeners.add(fn);
    return () => muteListeners.delete(fn);
  },
  onProfileChange(fn) {
    profileListeners.add(fn);
    return () => profileListeners.delete(fn);
  },
  onWave(fn) {
    waveListeners.add(fn);
    return () => waveListeners.delete(fn);
  },
};
