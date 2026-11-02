// Shared UI: tactile keys, sticky header, toast notifications, and developer command palette.
import { sound } from "./sound.js";
import { boopPrimaryAvatar } from "./avatar.js";

export const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- tactile feedback for every key-like control ---------- */
const TACTILE = ".key, .tool, .chip, .seg button, .palette-list button";
export function initTactile() {
  document.addEventListener("pointerdown", (e) => {
    const el = e.target.closest(TACTILE);
    if (!el || el.hasAttribute("data-switch-profile")) return;
    sound.play(el.matches(".chip, .seg button, .palette-list button") ? "click" : "down");
  });
  document.addEventListener("pointerup", (e) => {
    const el = e.target.closest(".key, .tool");
    if (el && !el.hasAttribute("data-switch-profile")) sound.play("up");
  });
  document.addEventListener("keydown", (e) => {
    if (e.repeat || (e.key !== "Enter" && e.key !== " ")) return;
    const el = document.activeElement?.closest?.(".key, .tool");
    if (!el) return;
    el.classList.add("is-down");
    if (!el.hasAttribute("data-switch-profile")) sound.play("down");
  });
  document.addEventListener("keyup", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    document
      .querySelectorAll(".key.is-down, .tool.is-down")
      .forEach((el) => el.classList.remove("is-down"));
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

/* ---------- developer command palette ---------- */
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
    {
      c: "whoami",
      d: "Developer profile",
      run: () =>
        print(
          "Sakib Alam Mubin (SA Mubin)\nFull-Stack Software Developer — tactile UIs, clean APIs, resilient web apps.\nSocial: @thesamubin · @samubin"
        ),
    },
    { c: "work", d: "Selected engineering & teaching labs", run: go("work/") },
    { c: "about", d: "Story, stack & how SA Mubin builds", run: go("about/") },
    { c: "contact", d: "Email & quick message composer", run: go("contact/") },
    {
      c: "boop",
      d: "Boop SA Mubin's interactive avatar",
      run: () => {
        dlg.close();
        if (!boopPrimaryAvatar("Booped from the command palette!")) {
          toast("SA Mubin says hi from the terminal!", { auth: true });
        }
      },
    },
    {
      c: "switch",
      d: "Cycle keycap switch (Thock / Clicky / Synth)",
      run: () => {
        const next = sound.cycleProfile();
        print(`active switch profile: ${next}`);
      },
    },
    { c: "hire", d: "Start a project or role conversation", run: runHire },
    {
      c: "github",
      d: "Open github.com/thesamubin",
      run: () => {
        dlg.close();
        window.open("https://github.com/thesamubin", "_blank", "noopener");
      },
    },
    {
      c: "sound",
      d: "Toggle audio on or off",
      run: () => {
        sound.toggle();
        print(`sound: ${sound.enabled ? "on" : "off"} (${sound.profile})`);
      },
    },
    { c: "home", d: "Back to Home", run: go("./") },
    { c: "clear", d: "Clear terminal output", run: () => print("") },
  ];
  cmds.push({
    c: "help",
    d: "List available commands",
    run: () => print(cmds.map((x) => x.c.padEnd(14) + x.d).join("\n")),
  });

  function runHire() {
    print("building collaboration bundle ");
    let n = 0;
    const t = setInterval(() => {
      out.textContent += ".";
      sound.play("click");
      if (++n === 6) {
        clearInterval(t);
        setTimeout(() => {
          out.textContent += "\n[ok] checks green — opening /contact/…";
          sound.play("auth");
          setTimeout(go("contact/"), 750);
        }, 200);
      }
    }, 65);
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

  function execute() {
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
      execute();
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
