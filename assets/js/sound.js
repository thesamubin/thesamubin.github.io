// Synthesized mechanical switch & UI sound kit (Web Audio API, zero audio files).
// Honours user gesture gating and persists both mute state and switch profile.

const STORE_MUTE = "sam.sound";
const STORE_PROFILE = "sam.switch";
const PROFILES = ["thock", "clicky", "synth"];
const PENTA = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];

let ctx = null;
let master = null;
let noiseBuf = null;
let enabled = localStorage.getItem(STORE_MUTE) !== "off";
let profile = PROFILES.includes(localStorage.getItem(STORE_PROFILE))
  ? localStorage.getItem(STORE_PROFILE)
  : "thock";
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
    burst({ freq: 4300 * r, q: 2.8, dur: 0.012, gain: 0.16 });
  },
  synth() {
    tone({ freq: 1046.5, dur: 0.028, gain: 0.045, type: "sine" });
  },
};

const recipes = {
  down(r) {
    (switchDown[profile] || switchDown.thock)(r);
    emitWave(0.85, profile);
  },
  up(r) {
    (switchUp[profile] || switchUp.thock)(r);
  },
  click(r) {
    burst({ freq: 2800 * r, q: 2.2, dur: 0.018, gain: 0.24 });
    tone({ freq: 520 * r, to: 300, dur: 0.028, gain: 0.06, type: "square" });
    emitWave(0.45, profile);
  },
  switch() {
    burst({ freq: 1400, q: 2.8, dur: 0.028, gain: 0.34 });
    burst({ freq: 3200, q: 2.0, dur: 0.02, gain: 0.2, when: 0.038 });
    emitWave(0.65, profile);
  },
  boop(r) {
    tone({ freq: 330 * r, to: 760 * r, dur: 0.095, gain: 0.22, type: "sine" });
    tone({ freq: 988 * r, to: 1318 * r, dur: 0.08, gain: 0.11, type: "triangle", when: 0.055 });
    emitWave(1.0, "boop");
  },
  shades() {
    [329.63, 415.3, 493.88, 659.25].forEach((f, i) =>
      tone({ freq: f, dur: 0.15, gain: 0.11, type: "triangle", when: i * 0.042 })
    );
    emitWave(0.9, "shades");
  },
  wave(r) {
    tone({ freq: 523.25 * r, to: 659.25 * r, dur: 0.085, gain: 0.15, type: "sine" });
    tone({ freq: 659.25 * r, to: 880 * r, dur: 0.11, gain: 0.14, type: "sine", when: 0.085 });
    emitWave(0.8, "wave");
  },
  pop(r) {
    tone({ freq: 440 * r, to: 960 * r, dur: 0.045, gain: 0.2, type: "sine" });
    emitWave(0.6, "pop");
  },
  boing(r) {
    tone({ freq: 190 * r, to: 520 * r, dur: 0.11, gain: 0.18, type: "sine" });
    tone({ freq: 340 * r, to: 640 * r, dur: 0.13, gain: 0.13, type: "triangle", when: 0.08 });
    emitWave(0.95, "boing");
  },
  slide() {
    tone({ freq: 860, to: 185, dur: 0.26, gain: 0.16, type: "sine" });
    tone({ freq: 195, to: 145, dur: 0.12, gain: 0.1, type: "triangle", when: 0.24 });
    emitWave(0.75, "slide");
  },
  taDa() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      tone({ freq: f, dur: i === 3 ? 0.24 : 0.11, gain: 0.14, type: "triangle", when: i * 0.065 })
    );
    emitWave(1.0, "taDa");
  },
  chirp(r) {
    tone({ freq: 1850 * r, to: 3100, dur: 0.055, gain: 0.08 });
    tone({ freq: 2350 * r, to: 3600, dur: 0.048, gain: 0.06, when: 0.068 });
  },
  auth() {
    [587.33, 783.99, 1174.66].forEach((f, i) =>
      tone({ freq: f, dur: 0.14, gain: 0.12, type: "triangle", when: i * 0.078 })
    );
    emitWave(0.9, "auth");
  },
  deny() {
    tone({ freq: 240, to: 150, dur: 0.16, gain: 0.08, type: "square" });
  },
  whoosh() {
    burst({ freq: 920, q: 0.65, dur: 0.2, gain: 0.13, type: "lowpass" });
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
  set(v) {
    enabled = !!v;
    localStorage.setItem(STORE_MUTE, enabled ? "on" : "off");
    muteListeners.forEach((fn) => fn(enabled));
    if (enabled) this.play("switch");
  },
  toggle() {
    this.set(!enabled);
  },
  setProfile(next, { silent = false } = {}) {
    if (!PROFILES.includes(next)) return profile;
    profile = next;
    localStorage.setItem(STORE_PROFILE, profile);
    profileListeners.forEach((fn) => fn(profile));
    if (!silent) this.play("down");
    return profile;
  },
  cycleProfile() {
    const idx = (PROFILES.indexOf(profile) + 1) % PROFILES.length;
    return this.setProfile(PROFILES[idx]);
  },
  onChange(fn) {
    muteListeners.add(fn);
  },
  onProfileChange(fn) {
    profileListeners.add(fn);
  },
  onWave(fn) {
    waveListeners.add(fn);
  },
  play(name, scale = null) {
    if (!recipes[name]) return;
    if (!enabled) {
      emitWave(0.5, name);
      return;
    }
    if (!ensure()) return;
    const r = scale ?? 0.94 + Math.random() * 0.12;
    recipes[name](r);
  },
};
