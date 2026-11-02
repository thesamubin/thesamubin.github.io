// Interactive security lab benches (XSS sink analyzer, LFI path jail, HTTP header bench) + contact tools.
import { sound } from "./sound.js";
import { toast } from "./ui.js";

function escHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function initXssBench(root) {
  const input = root.querySelector("[data-xss-input]");
  const rawBody = root.querySelector("[data-xss-raw]");
  const safeBody = root.querySelector("[data-xss-safe]");
  const rawVerdict = root.querySelector("[data-xss-raw-verdict]");
  const safeVerdict = root.querySelector("[data-xss-safe-verdict]");
  const rawPane = rawBody?.closest(".pane");
  const ctxBtns = [...root.querySelectorAll("[data-xss-ctx]")];
  let context = "html";

  function evaluate(fromUser = false) {
    const val = input.value;
    let fires = false;
    let triggerReason = "";

    if (context === "html") {
      const hasScript = /<\s*script\b/i.test(val);
      const hasHandler = /<\s*[a-z][^>]*\bon[a-z]+\s*=/i.test(val);
      const hasSvgLoad = /<\s*(svg|iframe|object|embed)\b/i.test(val);
      fires = hasScript || hasHandler || hasSvgLoad;
      triggerReason = hasHandler
        ? "event handler executes JS"
        : hasScript
        ? "<script> tag injected"
        : hasSvgLoad
        ? "active element injected"
        : "rendered as inert markup";

      rawBody.innerHTML = "";
      const pre = document.createElement("span");
      pre.textContent = "<div>Hello, ";
      const mid = document.createElement("span");
      mid.className = fires ? "hl" : "";
      mid.textContent = val;
      const post = document.createElement("span");
      post.textContent = `</div>\n\n// ${triggerReason}`;
      rawBody.append(pre, mid, post);

      safeBody.innerHTML = "";
      const s1 = document.createElement("span");
      s1.textContent = "// textContent / entity-encoded:\n<div>Hello, ";
      const s2 = document.createElement("span");
      s2.className = "ok";
      s2.textContent = escHtml(val);
      const s3 = document.createElement("span");
      s3.textContent = "</div>";
      safeBody.append(s1, s2, s3);

      safeVerdict.textContent = "ESCAPED";
    } else {
      const trimmed = val.trim().replace(/[\u0000-\u0020]+/g, "");
      fires = /^(javascript|data|vbscript):/i.test(trimmed);
      rawBody.innerHTML = "";
      const p1 = document.createElement("span");
      p1.textContent = '<a href="';
      const p2 = document.createElement("span");
      p2.className = fires ? "hl" : "";
      p2.textContent = val;
      const p3 = document.createElement("span");
      p3.textContent = `">Profile</a>\n\n// ${fires ? "dangerous URI scheme runs on click" : "navigates relative/HTTP URL"}`;
      rawBody.append(p1, p2, p3);

      safeBody.innerHTML = "";
      let safeHref = "#blocked-scheme";
      try {
        const u = new URL(val, "https://example.org");
        if (u.protocol === "https:" || u.protocol === "http:") safeHref = u.href;
      } catch {}
      const g1 = document.createElement("span");
      g1.textContent = '// allowlist: http(s) only\n<a href="';
      const g2 = document.createElement("span");
      g2.className = "ok";
      g2.textContent = safeHref;
      const g3 = document.createElement("span");
      g3.textContent = '">Profile</a>';
      safeBody.append(g1, g2, g3);

      safeVerdict.textContent = fires ? "SCHEME BLOCKED" : "ALLOWED";
    }

    rawVerdict.textContent = fires ? "EXECUTES" : "INERT";
    rawVerdict.className = `verdict ${fires ? "verdict--bad" : "verdict--ok"}`;
    rawPane?.classList.remove("is-fired");
    if (fires) {
      void rawPane?.offsetWidth;
      rawPane?.classList.add("is-fired");
      if (fromUser) sound.play("deny");
    }
  }

  input.addEventListener("input", () => evaluate(false));
  root.querySelectorAll("[data-payload]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.ctx && btn.dataset.ctx !== context) {
        context = btn.dataset.ctx;
        ctxBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.xssCtx === context)));
      }
      input.value = btn.dataset.payload;
      evaluate(true);
    });
  });
  ctxBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      context = btn.dataset.xssCtx;
      ctxBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      evaluate(true);
    });
  });

  evaluate(false);
}

const SANDBOX_FILES = {
  "/srv/docs/welcome.md": "# Welcome\nPublic handbook loaded from /srv/docs/welcome.md.",
  "/srv/docs/api.md": "# API Notes\nRate limits and token rotation guide.",
  "/etc/passwd": "[simulated sandbox]\nroot:x:0:0:root:/root:/bin/bash\nwww-data:x:33:33:/var/www:/usr/sbin/nologin",
  "/srv/.env": "[simulated sandbox]\nDB_URL=postgres://app:***@10.0.0.4/prod\nJWT_SECRET=dev_unrotated_secret",
  "/proc/self/environ": "[simulated sandbox]\nNODE_ENV=production\nPORT=8080\nWORKER_ROLE=web",
};

function normalizePosix(p) {
  const parts = p.split("/");
  const stack = [];
  for (const seg of parts) {
    if (!seg || seg === ".") continue;
    if (seg === "..") stack.pop();
    else stack.push(seg);
  }
  return "/" + stack.join("/");
}

function initLfiBench(root) {
  const input = root.querySelector("[data-lfi-input]");
  const rawBody = root.querySelector("[data-lfi-raw]");
  const safeBody = root.querySelector("[data-lfi-safe]");
  const rawVerdict = root.querySelector("[data-lfi-raw-verdict]");
  const safeVerdict = root.querySelector("[data-lfi-safe-verdict]");
  const rawPane = rawBody?.closest(".pane");
  const JAIL = "/srv/docs/";

  function evaluate(fromUser = false) {
    const raw = input.value.trim();
    let decoded = raw;
    try {
      decoded = decodeURIComponent(decodeURIComponent(raw));
    } catch {
      try { decoded = decodeURIComponent(raw); } catch {}
    }
    const cleaned = decoded.replace(/\\/g, "/");
    const joined = cleaned.startsWith("/") ? normalizePosix(cleaned) : normalizePosix(JAIL + cleaned);
    const escaped = !joined.startsWith(JAIL);
    const hit = SANDBOX_FILES[joined];

    rawBody.innerHTML = "";
    const r1 = document.createElement("span");
    r1.textContent = "resolved -> ";
    const r2 = document.createElement("span");
    r2.className = escaped ? "hl" : "ok";
    r2.textContent = joined + "\n\n";
    const r3 = document.createElement("span");
    r3.textContent = hit || (escaped ? "[simulated sandbox]\nENOENT outside webroot (path escaped jail)" : "# File not in demo set\nStayed inside /srv/docs/.");
    rawBody.append(r1, r2, r3);

    rawVerdict.textContent = escaped ? "ESCAPED JAIL" : "IN ROOT";
    rawVerdict.className = `verdict ${escaped ? "verdict--bad" : "verdict--ok"}`;
    rawPane?.classList.remove("is-fired");
    if (escaped) {
      void rawPane?.offsetWidth;
      rawPane?.classList.add("is-fired");
      if (fromUser) sound.play("deny");
    }

    safeBody.innerHTML = "";
    const s1 = document.createElement("span");
    if (escaped || !/^[a-z0-9/_-]+\.md$/i.test(cleaned)) {
      s1.textContent = `realpath("${joined}")\nprefix check: startsWith("${JAIL}") -> `;
      const s2 = document.createElement("span");
      s2.className = "ok";
      s2.textContent = "403 FORBIDDEN\n// blocked before fs.open()";
      safeBody.append(s1, s2);
      safeVerdict.textContent = "CONTAINED";
    } else {
      s1.textContent = "allowlisted -> ";
      const s2 = document.createElement("span");
      s2.className = "ok";
      s2.textContent = `${joined}\n\n${hit || "200 OK (markdown document)"}`;
      safeBody.append(s1, s2);
      safeVerdict.textContent = "200 OK";
    }
  }

  input.addEventListener("input", () => evaluate(false));
  root.querySelectorAll("[data-payload]").forEach((btn) => {
    btn.addEventListener("click", () => {
      input.value = btn.dataset.payload;
      evaluate(true);
    });
  });

  evaluate(false);
}

function initHeaderBench(root) {
  const toggles = [...root.querySelectorAll("[data-hdr]")];
  const out = root.querySelector("[data-hdr-out]");
  const risks = root.querySelector("[data-hdr-risks]");
  const scoreBadge = root.querySelector("[data-hdr-score]");

  const specs = {
    csp: {
      line: "Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'",
      stops: "Inline XSS & rogue script exfiltration",
    },
    hsts: {
      line: "Strict-Transport-Security: max-age=63072000; includeSubDomains; preload",
      stops: "TLS downgrade & cookie sniffing on public Wi-Fi",
    },
    frame: {
      line: "X-Frame-Options: DENY\nCross-Origin-Opener-Policy: same-origin",
      stops: "Clickjacking & cross-window tabnabbing",
    },
    cookie: {
      line: "Set-Cookie: __Host-sid=...; Secure; HttpOnly; SameSite=Strict; Path=/",
      stops: "Session theft via document.cookie & cross-site POST",
    },
  };

  function render() {
    const active = toggles.filter((b) => b.getAttribute("aria-pressed") === "true").map((b) => b.dataset.hdr);
    const lines = ["HTTP/2 200 OK", "Content-Type: text/html; charset=utf-8", "X-Content-Type-Options: nosniff"];
    active.forEach((k) => lines.push(specs[k].line));
    out.textContent = lines.join("\n");

    const openRisks = Object.keys(specs).filter((k) => !active.includes(k));
    if (!openRisks.length) {
      risks.innerHTML = '<span class="ok">All 4 browser defense layers active — baseline hardened.</span>';
    } else {
      risks.textContent = "Exposed without remaining headers:\n" + openRisks.map((k) => "• " + specs[k].stops).join("\n");
    }
    scoreBadge.textContent = `${active.length}/4 ACTIVE`;
    scoreBadge.className = `verdict ${active.length >= 3 ? "verdict--ok" : "verdict--bad"}`;
  }

  toggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", String(next));
      render();
      if (toggles.every((b) => b.getAttribute("aria-pressed") === "true")) {
        sound.play("auth");
      }
    });
  });

  render();
}

function initWorkFilter() {
  const bar = document.querySelector("[data-work-filter]");
  if (!bar) return;
  const btns = [...bar.querySelectorAll("button[data-filter]")];
  const items = [...document.querySelectorAll("[data-work-cat]")];
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      btns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      items.forEach((el) => {
        const cats = el.dataset.workCat.split(/\s+/);
        el.hidden = f !== "all" && !cats.includes(f);
      });
    });
  });
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
      subject: "Full-Stack Engineering Opportunity — Sakib Alam Mubin",
      body: "Hi Mubin,\n\nWe're looking for a full-stack engineer with strong security instincts. Here's a quick overview of the role / project:\n\n- Team / product:\n- Timeline:\n\nBest,",
    },
    security: {
      subject: "Application Security / Pentest Inquiry — SA Mubin",
      body: "Hi Mubin,\n\nWe'd like to discuss an application security review / hardening engagement:\n\n- Target stack:\n- Scope & timeline:\n\nBest,",
    },
    teaching: {
      subject: "Cybersecurity Workshop / Instruction — Sakib Alam Mubin",
      body: "Hi Mubin,\n\nWe're organizing a practical cybersecurity / ethical hacking session and would love to invite you:\n\n- Audience:\n- Preferred dates:\n\nBest,",
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

export function initLabs() {
  document.querySelectorAll('[data-bench="xss"]').forEach(initXssBench);
  document.querySelectorAll('[data-bench="lfi"]').forEach(initLfiBench);
  document.querySelectorAll('[data-bench="headers"]').forEach(initHeaderBench);
  initWorkFilter();
  initContactTools();
}

