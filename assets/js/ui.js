// Shared UI: tactile keys, header, toast, crypt effect, switch, command palette.
import { sound } from "./sound.js";

export const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- tactile feedback for every key-like control ---------- */
const TACTILE = ".key, .tool, .chip, .seg button, .palette-list button";
export function initTactile() {
  document.addEventListener("pointerdown", (e) => {
    const el = e.target.closest(TACTILE);
    if (!el) return;
    sound.play(el.matches(".chip, .seg button, .palette-list button") ? "click" : "down");
  });
  document.addEventListener("pointerup", (e) => {
    if (e.target.closest(".key, .tool")) sound.play("up");
  });
  // keyboard activation gets the same travel and sound
  document.addEventListener("keydown", (e) => {
    if (e.repeat || (e.key !== "Enter" && e.key !== " ")) return;
    const el = document.activeElement?.closest?.(".key, .tool");
    if (!el) return;
    el.classList.add("is-down");
    sound.play("down");
  });
  document.addEventListener("keyup", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    document.querySelectorAll(".key.is-down, .tool.is-down").forEach((el) => el.classList.remove("is-down"));
  });
}

/* ---------- header ---------- */
export function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-stuck", scrollY > 8);
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });

  const btn = document.querySelector("[data-sound-toggle]");
  if (btn) {
    const sync = (on) => {
      btn.setAttribute("aria-pressed", String(on));
      btn.setAttribute("aria-label", on ? "Mute sound" : "Turn sound on");
    };
    sync(sound.enabled);
    sound.onChange(sync);
    btn.addEventListener("click", () => sound.toggle());
  }
}

/* ---------- toast ---------- */
let toastEl, toastTimer;
export function toast(msg, { auth = false, ms = 3200 } = {}) {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.className = "toast";
    toastEl.setAttribute("role", "status");
    toastEl.setAttribute("aria-live", "polite");
    toastEl.innerHTML = '<span class="dot" aria-hidden="true"></span><span class="msg"></span>';
    document.body.append(toastEl);
  }
  toastEl.querySelector(".msg").textContent = msg;
  toastEl.classList.toggle("is-auth", auth);
  requestAnimationFrame(() => toastEl.classList.add("is-on"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), ms);
}

/* ---------- crypt: scramble text to ciphertext, then decrypt ---------- */
const GLYPHS = "0123456789abcdef";
const running = new WeakSet();
export function crypt(el, { hold = 380, dur = 900 } = {}) {
  if (!el || running.has(el) || reduceMotion) return Promise.resolve();
  running.add(el);
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) nodes.push([walker.currentNode, walker.currentNode.nodeValue]);
  const total = nodes.reduce((n, [, t]) => n + t.length, 0) || 1;
  el.setAttribute("aria-busy", "true");
  el.classList.add("is-crypt");
  const t0 = performance.now();
  return new Promise((resolve) => {
    const frame = (now) => {
      const p = Math.max(0, (now - t0 - hold) / dur);
      let idx = 0;
      for (const [node, text] of nodes) {
        let out = "";
        for (const ch of text) {
          const revealed = idx / total < p;
          out += ch === " " || ch === "\n" || revealed ? ch : GLYPHS[(Math.random() * 16) | 0];
          idx++;
        }
        node.nodeValue = out;
      }
      if (p >= 0.35) el.classList.remove("is-crypt");
      if (p < 1) requestAnimationFrame(frame);
      else {
        nodes.forEach(([node, text]) => (node.nodeValue = text));
        el.classList.remove("is-crypt");
        el.removeAttribute("aria-busy");
        running.delete(el);
        resolve();
      }
    };
    requestAnimationFrame(frame);
  });
}
export function cryptVisible() {
  const els = [...document.querySelectorAll("main h1, main h2, main h3")].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight;
  });
  els.forEach((el, i) => setTimeout(() => crypt(el), i * 90));
  return els.length;
}

/* ---------- build / break switch ---------- */
export function initSwitches() {
  document.querySelectorAll("[data-switch]").forEach((sw) => {
    const panels = document.querySelectorAll(`[data-switch-panel="${sw.dataset.switch}"]`);
    sw.addEventListener("click", () => {
      const on = sw.getAttribute("aria-checked") !== "true";
      sw.setAttribute("aria-checked", String(on));
      panels.forEach((p) => (p.hidden = (p.dataset.mode === "break") !== on));
      sound.play("switch");
    });
  });
}

/* ---------- command palette ---------- */
export function initPalette() {
  const dlg = document.getElementById("palette");
  if (!dlg) return;
  const input = dlg.querySelector("input");
  const list = dlg.querySelector(".palette-list");
  const out = dlg.querySelector(".palette-out");
  let sel = 0;
  let shown = [];

  const siteRoot = new URL("../../", import.meta.url);
  const go = (rel) => () => {
    dlg.close();
    location.href = new URL(rel, siteRoot).href;
  };
  const print = (txt) => {
    out.textContent = txt;
  };
  const cmds = [
    { c: "whoami", d: "Who is this?", run: () => print("Sakib Alam Mubin\naka SA Mubin · Mubin · @thesamubin · @samubin\nFull-stack developer & security engineer. Ethical hacking instructor.") },
    { c: "ls work", d: "Projects and security tools", run: go("work/") },
    { c: "cat about", d: "Story, focus, teaching", run: go("about/") },
    { c: "contact", d: "Email and profiles", run: go("contact/") },
    { c: "sudo hire mubin", d: "Elevated request", run: sudo },
    { c: "open github", d: "github.com/thesamubin", run: () => { dlg.close(); window.open("https://github.com/thesamubin", "_blank", "noopener"); } },
    { c: "encrypt", d: "Scramble the page, then decrypt it", run: () => { dlg.close(); sound.play("whoosh"); cryptVisible(); } },
    { c: "bugs", d: "Your bug report count", run: () => { const n = +localStorage.getItem("sam.bugs") || 0; print(`bugs reported: ${n}/5${n >= 5 ? "  · hall of fame unlocked" : "  · they perch on ledges. catch them."}`); } },
    { c: "sound", d: "Toggle sound on or off", run: () => { sound.toggle(); print(`sound: ${sound.enabled ? "on" : "off"}`); } },
    { c: "home", d: "Back to the start", run: go("./") },
    { c: "clear", d: "Clear output", run: () => print("") },
  ];
  cmds.push({ c: "help", d: "List every command", run: () => print(cmds.map((x) => x.c.padEnd(18) + x.d).join("\n")) });

  function sudo() {
    print("[sudo] password for recruiter: ");
    let n = 0;
    const t = setInterval(() => {
      out.textContent += "*";
      sound.play("click");
      if (++n === 8) {
        clearInterval(t);
        setTimeout(() => {
          out.textContent += "\naccess granted. opening a secure channel…";
          sound.play("auth");
          setTimeout(go("contact/"), 900);
        }, 250);
      }
    }, 70);
  }

  function render() {
    const q = input.value.trim().toLowerCase();
    shown = cmds.filter((x) => !q || x.c.includes(q) || x.d.toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    list.innerHTML = "";
    shown.forEach((x, i) => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "option");
      b.setAttribute("aria-selected", String(i === sel));
      b.innerHTML = '<span class="c"></span><span class="d"></span>';
      b.querySelector(".c").textContent = x.c;
      b.querySelector(".d").textContent = x.d;
      b.addEventListener("click", () => x.run());
      li.append(b);
      list.append(li);
    });
  }
  function run() {
    const q = input.value.trim().toLowerCase();
    const exact = cmds.find((x) => x.c === q);
    const pick = exact || shown[sel];
    if (pick) pick.run();
    else {
      sound.play("deny");
      print(`command not found: ${q}\ntry: help`);
    }
  }
  function open() {
    if (dlg.open) return;
    out.textContent = "";
    input.value = "";
    sel = 0;
    render();
    dlg.showModal();
    sound.play("click");
    input.focus();
  }

  input.addEventListener("input", () => {
    sel = 0;
    render();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + shown.length) % Math.max(1, shown.length);
      render();
      list.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      run();
    } else if (e.key.length === 1) {
      sound.play("up");
    }
  });
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) dlg.close();
  });
  document.querySelectorAll("[data-palette]").forEach((b) => b.addEventListener("click", open));
  document.addEventListener("keydown", (e) => {
    const typing = e.target.closest?.("input, textarea, [contenteditable]");
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      dlg.open ? dlg.close() : open();
    } else if (e.key === "/" && !typing && !dlg.open) {
      e.preventDefault();
      open();
    }
  });
}

