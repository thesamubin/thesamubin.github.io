// Tiny synthesized sound kit (Web Audio, no audio files).
// Sounds only start after a user gesture; the toggle is remembered.

const STORE = "sam.sound";
let ctx = null;
let master = null;
let noiseBuf = null;
let enabled = localStorage.getItem(STORE) !== "off";
const listeners = new Set();

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

function burst({ freq = 2000, q = 1, dur = 0.04, gain = 0.4, type = "bandpass", when = 0 }) {
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

function tone({ freq = 200, to = null, dur = 0.06, gain = 0.25, type = "sine", when = 0 }) {
  const t = ctx.currentTime + when;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.03);
}

const recipes = {
  // keycap bottom-out: a short filtered tick plus a low body thump
  down(r) {
    burst({ freq: 1900 * r, q: 0.9, dur: 0.028, gain: 0.32 });
    tone({ freq: 160 * r, to: 85, dur: 0.07, gain: 0.32, type: "triangle" });
  },
  // keycap release: a brighter, quieter tick
  up(r) {
    burst({ freq: 3600 * r, q: 1.6, dur: 0.016, gain: 0.12 });
  },
  click(r) {
    burst({ freq: 2800 * r, q: 2.2, dur: 0.02, gain: 0.28 });
    tone({ freq: 520 * r, to: 300, dur: 0.03, gain: 0.07, type: "square" });
  },
  switch() {
    burst({ freq: 1300, q: 3, dur: 0.03, gain: 0.38 });
    burst({ freq: 3100, q: 2, dur: 0.02, gain: 0.22, when: 0.04 });
  },
  chirp(r) {
    tone({ freq: 2000 * r, to: 3400, dur: 0.06, gain: 0.08 });
    tone({ freq: 2500 * r, to: 3900, dur: 0.05, gain: 0.06, when: 0.075 });
  },
  catch() {
    tone({ freq: 520, to: 1040, dur: 0.12, gain: 0.16, type: "triangle" });
    tone({ freq: 780, to: 1560, dur: 0.16, gain: 0.12, type: "triangle", when: 0.09 });
  },
  auth() {
    [660, 880, 1320].forEach((f, i) => tone({ freq: f, dur: 0.14, gain: 0.12, when: i * 0.085 }));
  },
  deny() {
    tone({ freq: 240, to: 150, dur: 0.18, gain: 0.08, type: "square" });
  },
  whoosh() {
    burst({ freq: 900, q: 0.6, dur: 0.22, gain: 0.12, type: "lowpass" });
  },
};

export const sound = {
  get enabled() {
    return enabled;
  },
  set(v) {
    enabled = !!v;
    localStorage.setItem(STORE, enabled ? "on" : "off");
    listeners.forEach((fn) => fn(enabled));
    if (enabled) this.play("switch");
  },
  toggle() {
    this.set(!enabled);
  },
  onChange(fn) {
    listeners.add(fn);
  },
  play(name) {
    if (!enabled || !recipes[name]) return;
    if (!ensure()) return;
    recipes[name](0.92 + Math.random() * 0.16);
  },
};

