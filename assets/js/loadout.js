// Unified Hanging Mechanical Keyboard ("Loadout / Arsenal" + embedded S-A-M-U-B-I-N keys).
// Features:
// - Suspended from dual braided top cables with 60fps Hooke's-law spring-damper swing & recoil physics
// - Icon-only technology keycaps (matching recognizable dev & security logos, zero text clutter on caps)
// - Embedded S - A - M - U - B - I - N individual letter keycaps + Mode Flip key right inside the matrix
// - Top OLED telemetry readout strip + 7-LED SAMUBIN sequence progress indicator
// - Row-by-row 3D X-axis split-flap flip wave when morphing Developer ⇄ Ethical Hacker

import { sound } from "./sound.js";
import { getMode, onModeChange, toggleMode, reduceMotion } from "./mode.js";
import { triggerSamubinCipher } from "./keyboard.js";

// Recognizable 24x24 monochrome vector logos for every technology & security tool
const ICONS = {
  // --- Developer Row 1: Languages ---
  ts: '<rect x="3" y="3" width="18" height="18" rx="2.5" fill="currentColor" opacity="0.16" stroke="currentColor" stroke-width="1.8"/><path d="M7.2 10.5h5.2M9.8 10.5v7M17.8 11.6c-.6-.6-1.9-.7-2.5-.1-.5.6-.1 1.3 1.1 1.7 1.3.4 1.9 1 1.6 2-.3.9-1.8 1.2-3 .3" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round"/>',
  js: '<path d="M12 2.6l8.2 4.7v9.4L12 21.4l-8.2-4.7V7.3z" fill="currentColor" opacity="0.14" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10.4 9.5v5.6c0 1.2-.9 1.7-1.9 1.1M16.8 10.8c-.6-.5-1.8-.5-2.1.2-.4.6.2 1.2 1.3 1.5 1.1.3 1.6.9 1.3 1.8-.3.8-1.6.9-2.5.2" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>',
  py: '<path d="M11.8 3c-3.4 0-3.8 1.4-3.8 3.3V8.8h4v1H6.5C4.4 9.8 3 11.1 3 13.8c0 2.7 1.4 4 3.5 4H8v-2c0-1.5 1.2-2.7 2.7-2.7h4.5c1.4 0 2.6-1.1 2.6-2.6V6.3C17.8 4.4 15.2 3 11.8 3zm.4 18c3.4 0 3.8-1.4 3.8-3.3v-2.5h-4v-1h5.5c2.1 0 3.5-1.3 3.5-4 0-2.7-1.4-4-3.5-4H16v2c0 1.5-1.2 2.7-2.7 2.7H8.8c-1.4 0-2.6 1.1-2.6 2.6v4.2C6.2 19.6 8.8 21 12.2 21z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="10" cy="6" r="0.9" fill="currentColor"/><circle cx="14" cy="18" r="0.9" fill="currentColor"/>',
  go: '<path d="M2.5 10.2h3.2M1.8 12.5h3.9M3.2 14.8h2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M11.6 9.4a3.4 3.4 0 1 0 0 5.2h1.9v-2.3h-1.5M17.8 9.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 1 0 0-5.6z" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"/>',
  cpp: '<path d="M12 2.4l8.4 4.8v9.6L12 21.6l-8.4-4.8V7.2z" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10.8 8.6a3.9 3.9 0 1 0 0 6.8M14.8 10.6v2.8M13.4 12h2.8M18.6 10.6v2.8M17.2 12h2.8" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>',
  c: '<path d="M12 2.4l8.4 4.8v9.6L12 21.6l-8.4-4.8V7.2z" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M15.2 8.2a4.6 4.6 0 1 0 0 7.6" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>',
  sql: '<ellipse cx="12" cy="6.2" rx="7.2" ry="2.8" fill="currentColor" opacity="0.18" stroke="currentColor" stroke-width="1.8"/><path d="M4.8 6.2v11.6c0 1.6 3.2 2.8 7.2 2.8s7.2-1.2 7.2-2.8V6.2M4.8 12c0 1.6 3.2 2.8 7.2 2.8s7.2-1.2 7.2-2.8" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  bash: '<rect x="3" y="4" width="18" height="16" rx="2.8" fill="currentColor" opacity="0.14" stroke="currentColor" stroke-width="1.8"/><path d="M7.2 9.2L11 12l-3.8 2.8M12.4 15.2h4.4" fill="none" stroke="currentColor" stroke-width="1.95" stroke-linecap="round" stroke-linejoin="round"/>',

  // --- Developer Row 2: Frameworks ---
  react: '<circle cx="12" cy="12" r="2" fill="currentColor"/><ellipse cx="12" cy="12" rx="9.2" ry="3.7" fill="none" stroke="currentColor" stroke-width="1.65"/><ellipse cx="12" cy="12" rx="9.2" ry="3.7" transform="rotate(60 12 12)" fill="none" stroke="currentColor" stroke-width="1.65"/><ellipse cx="12" cy="12" rx="9.2" ry="3.7" transform="rotate(120 12 12)" fill="none" stroke="currentColor" stroke-width="1.65"/>',
  next: '<circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.85"/><path d="M8.8 15.8V8.2l8.6 10.6M15.2 8.2v4.8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  node: '<path d="M12 2.5l8.2 4.7v9.6L12 21.5l-8.2-4.7V7.2z" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.85" stroke-linejoin="round"/><path d="M9.6 9.5v5c0 1-.8 1.5-1.6 1M15.8 10.5c-.5-.5-1.6-.5-1.9.1-.3.6.2 1.1 1.2 1.4 1 .3 1.4.8 1.1 1.6-.3.7-1.4.8-2.2.1" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  express: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 2"/><path d="M5.5 9.5h5m-5 2.5h3.8m-3.8 2.5h5M13.5 9.5l5 5m0-5l-5 5" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round"/>',
  fastapi: '<circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.14" stroke="currentColor" stroke-width="1.85"/><path d="M13.2 6.2L8 13.2h4.2l-1.4 4.6 5.2-7h-4.2z" fill="currentColor"/>',
  tailwind: '<path d="M5.5 10.5c1.3-2.6 3.2-3.4 5.5-2.5 1.2.4 2 1.4 3 1.7 1.5.5 3 0 4.3-1.7-1.3 2.6-3.2 3.4-5.5 2.5-1.2-.4-2-1.4-3-1.7-1.5-.5-3 0-4.3 1.7zm0 5.6c1.3-2.6 3.2-3.4 5.5-2.5 1.2.4 2 1.4 3 1.7 1.5.5 3 0 4.3-1.7-1.3 2.6-3.2 3.4-5.5 2.5-1.2-.4-2-1.4-3-1.7-1.5-.5-3 0-4.3 1.7z" fill="currentColor"/>',

  // --- Developer Row 3: AI & ML ---
  pytorch: '<path d="M14.8 4.8l-2 2a6.8 6.8 0 1 0 4.2 6.2" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/><circle cx="15.8" cy="7.2" r="1.5" fill="currentColor"/>',
  tf: '<path d="M12 3l8 4.5v3.4l-4.8-2.7v3.3l3 1.7v3.2l-3-1.7v6.1L12 19V7.6L7.2 10.3V6.9z" fill="currentColor" opacity="0.88"/>',
  langchain: '<path d="M9.5 14.5l-2.2 2.2a3.3 3.3 0 0 1-4.6-4.6l2.6-2.6a3.3 3.3 0 0 1 4.6 0M14.5 9.5l2.2-2.2a3.3 3.3 0 0 1 4.6 4.6l-2.6 2.6a3.3 3.3 0 0 1-4.6 0M9.2 14.8l5.6-5.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  hf: '<circle cx="12" cy="12" r="8.6" fill="currentColor" opacity="0.14" stroke="currentColor" stroke-width="1.85"/><circle cx="9.2" cy="10" r="1.2" fill="currentColor"/><circle cx="14.8" cy="10" r="1.2" fill="currentColor"/><path d="M8.6 13.8c1.7 2 5.1 2 6.8 0" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
  openai: '<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 3.2a4.5 4.5 0 0 1 4.2 6.2 4.5 4.5 0 0 1 2.2 5.9 4.5 4.5 0 0 1-5.6 2.6A4.5 4.5 0 0 1 7.2 19a4.5 4.5 0 0 1-2.6-5.6 4.5 4.5 0 0 1 2.2-5.9A4.5 4.5 0 0 1 12 3.2z" fill="none" stroke="currentColor" stroke-width="1.75"/>',
  rag: '<circle cx="6.2" cy="6.8" r="2.4" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.8"/><circle cx="17.8" cy="6.8" r="2.4" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="17.4" r="2.6" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.8"/><path d="M8.2 8.2l2.6 6.8m5-6.8l-2.6 6.8M8.6 6.8h6.8" fill="none" stroke="currentColor" stroke-width="1.75"/>',

  // --- Developer Row 4: Databases (PostgreSQL Elephant, MongoDB Leaf, Redis, Prisma, SQLite) ---
  pg: '<path d="M7.5 6.5C5.2 7 4 9.5 4.5 12.5c.4 2.5 2 4.2 3.8 4.2.8 0 1.4-.5 1.7-1.2v3c0 1.2.9 2 2 2s2-.8 2-2v-2.2c1.2.4 2.6.2 3.6-.8 1.4-1.4 2-4.2 1.2-6.8C17.8 5.5 14.5 4 11.2 4.5 9.6 4.8 8.3 5.5 7.5 6.5z" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="10.2" cy="9.8" r="1" fill="currentColor"/><path d="M14.2 9.5c1.2-.4 2.4.4 2.4 1.8 0 1.2-.8 2.2-1.8 2.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  mongo: '<path d="M12 2.5C12 2.5 6.5 7.2 6.5 13c0 3.8 2.6 6.6 5.5 7.6 2.9-1 5.5-3.8 5.5-7.6C17.5 7.2 12 2.5 12 2.5z" fill="currentColor" opacity="0.18" stroke="currentColor" stroke-width="1.85" stroke-linejoin="round"/><path d="M12 6.5v15" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  redis: '<path d="M12 3.5l8 4v3l-8 4-8-4v-3z" fill="currentColor" opacity="0.18" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/><path d="M4 13.5l8 4 8-4M4 16.5l8 4 8-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  prisma: '<path d="M12.6 3L4.8 16.2 11.2 21l8-3.8L12.6 3zm0 0l-1.4 18" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linejoin="round"/>',
  sqlite: '<path d="M6 4h9l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" fill="currentColor" opacity="0.14" stroke="currentColor" stroke-width="1.8"/><path d="M9 13l2.2-5L15 16l-6-3z" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linejoin="round"/>',

  // --- Developer Row 5: Operating Systems (Linux Tux Penguin, Ubuntu, Arch, Windows, WSL2) ---
  linux: '<path d="M12 3c-2.6 0-4.2 2-4.2 4.8 0 1.6-.8 3.2-1.8 4.8-1 1.5-1.2 3.4-.4 4.8.7 1.2 2 1.6 3.2 2.2 1 .5 2.1.6 3.2.6s2.2-.1 3.2-.6c1.2-.6 2.5-1 3.2-2.2.8-1.4.6-3.3-.4-4.8-1-1.6-1.8-3.2-1.8-4.8C16.2 5 14.6 3 12 3z" fill="currentColor" opacity="0.16" stroke="currentColor" stroke-width="1.8"/><path d="M10.2 8.2l1.8 1.5 1.8-1.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10.4" cy="6.6" r="0.85" fill="currentColor"/><circle cx="13.6" cy="6.6" r="0.85" fill="currentColor"/>',
  ubuntu: '<circle cx="12" cy="12" r="5.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="4.2" r="1.9" fill="currentColor"/><circle cx="5.2" cy="15.8" r="1.9" fill="currentColor"/><circle cx="18.8" cy="15.8" r="1.9" fill="currentColor"/>',
  arch: '<path d="M12 2.8L4.2 20.5c2.6-1.4 4.8-2.2 7.8-2.2s5.2.8 7.8 2.2L12 2.8zm0 7.4c1.5 2.4 2.2 4.5 2.4 6.2-1.5-.4-3.3-.4-4.8 0 .2-1.7.9-3.8 2.4-6.2z" fill="currentColor"/>',
  win: '<path d="M3.5 5.2l7.5-1v7H3.5zM12.2 4l8.3-1.2v8.4h-8.3zM3.5 12.6H11v7l-7.5-1zM12.2 12.6h8.3V21l-8.3-1.2z" fill="currentColor"/>',
  wsl: '<rect x="3" y="4.5" width="18" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M6.8 9.5l3 2.5-3 2.5M11.5 14.5h3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="17" cy="9.5" r="1.6" fill="currentColor"/>',

  // --- Developer Row 6: Infra & Delivery (Git Diamond, Docker Whale, GH Actions, AWS, Cloudflare Cloud, Nginx) ---
  git: '<path d="M12 2.4L21.6 12 12 21.6 2.4 12 12 2.4z" fill="currentColor" opacity="0.16" stroke="currentColor" stroke-width="1.85" stroke-linejoin="round"/><path d="M9.2 6.8l5.6 5.6M12 9.6v6.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="9.6" r="1.5" fill="currentColor"/><circle cx="14.8" cy="12.4" r="1.5" fill="currentColor"/><circle cx="12" cy="15.8" r="1.5" fill="currentColor"/>',
  docker: '<path d="M3 13.2h13.8c1.8 0 3.2-.8 4.2-2.4-1.2-.4-2.2-.2-2.8.4-.4-1.4-1.4-2.2-2.6-2.4-.5 1-.4 2.2.2 3.2H3c-.2 3.8 2.2 6.8 6.8 6.8 5.2 0 8.5-2.6 9.5-5.6" fill="currentColor" opacity="0.18" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.2 10.2h2v2h-2zm2.8 0h2v2H9zm2.8 0h2v2h-2zm-2.8-2.8h2v2H9zm2.8 0h2v2h-2z" fill="currentColor"/>',
  gha: '<circle cx="7" cy="7" r="2.3" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17" cy="17" r="2.3" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17" cy="7" r="2.3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M7 9.5v4c0 2 1.5 3.5 3.5 3.5h4M9.5 7h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  aws: '<path d="M5.5 15.2c3.8 2.6 9.2 2.6 13 0M16.5 14.2l2.4.8-.6 2.4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 11.5l2-5.5 2 5.5M7.5 10h3M13 6l1.2 5.5 1.3-4 1.3 4L18 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  cf: '<path d="M6.8 17.5h11.4a3.6 3.6 0 0 0 .5-7.2 5.2 5.2 0 0 0-10-1.4A4.2 4.2 0 0 0 3 13.2a4.3 4.3 0 0 0 3.8 4.3z" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.85" stroke-linejoin="round"/>',
  nginx: '<path d="M12 2.5l8.2 4.7v9.6L12 21.5l-8.2-4.7V7.2z" fill="currentColor" opacity="0.14" stroke="currentColor" stroke-width="1.85" stroke-linejoin="round"/><path d="M8.5 15.5v-7l7 7v-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',

  // --- Hacker Row 1: Recon & OSINT ---
  nmap: '<circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3.6" fill="currentColor" opacity="0.22" stroke="currentColor" stroke-width="1.7"/><path d="M12 2v3.2m0 13.6V22M2 12h3.2m13.6 0H22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  amass: '<polygon points="12,2.8 20.5,7.6 20.5,16.4 12,21.2 3.5,16.4 3.5,7.6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.8v18.4M3.5 7.6l17 8.8M20.5 7.6l-17 8.8" stroke="currentColor" stroke-width="1.35" opacity="0.8"/>',
  subfinder: '<circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M15.8 15.8L20.5 20.5M8 11h6M11 8v6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
  httpx: '<path d="M13.5 3.5L6.5 13h5l-1 7.5 7-9.5h-5z" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.85" stroke-linejoin="round"/>',
  shodan: '<circle cx="12" cy="12" r="8.8" fill="none" stroke="currentColor" stroke-width="1.8"/><ellipse cx="12" cy="12" rx="8.8" ry="3.8" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="15" cy="10" r="1.8" fill="currentColor"/>',
  maltego: '<circle cx="12" cy="6" r="2.5" fill="currentColor"/><circle cx="6.5" cy="16.5" r="2.5" fill="currentColor"/><circle cx="17.5" cy="16.5" r="2.5" fill="currentColor"/><path d="M12 6l-5.5 10.5h11z" fill="none" stroke="currentColor" stroke-width="1.75"/>',
  whois: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="11" r="2.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M6.2 16c.6-1.6 1.6-2.4 2.8-2.4s2.2.8 2.8 2.4M14 9.5h4M14 13h3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  dig: '<path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="18" cy="17" r="2.2" fill="currentColor"/>',

  // --- Hacker Row 2: Web AppSec ---
  burp: '<path d="M12 2.8L4 7.4v9.2l8 4.6 8-4.6V7.4z" fill="currentColor" opacity="0.18" stroke="currentColor" stroke-width="1.85" stroke-linejoin="round"/><path d="M9.5 8h5l-3.5 4.2h4l-4.5 5.2" fill="none" stroke="currentColor" stroke-width="1.95" stroke-linecap="round" stroke-linejoin="round"/>',
  zap: '<path d="M13.8 2.8L5.2 13.4h6.2L9.8 21.2l9-10.6h-6.2z" fill="currentColor"/>',
  ffuf: '<path d="M4 8h10M4 12h14M4 16h8M16 7l4 5-4 5" fill="none" stroke="currentColor" stroke-width="1.95" stroke-linecap="round" stroke-linejoin="round"/>',
  sqlmap: '<ellipse cx="11" cy="6.5" rx="6.5" ry="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4.5 6.5v10c0 1.4 2.9 2.5 6.5 2.5M4.5 11.5c0 1.4 2.9 2.5 6.5 2.5M15 13l5 5m0-5l-5 5" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round"/>',
  nuclei: '<circle cx="12" cy="12" r="2.4" fill="currentColor"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(35 12 12)" fill="none" stroke="currentColor" stroke-width="1.75"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-35 12 12)" fill="none" stroke="currentColor" stroke-width="1.75"/>',
  xss: '<path d="M7.5 8L3.5 12l4 4M16.5 8l4 4-4 4M13.5 6l-3 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  xsstrike: '<path d="M7.5 8L3.5 12l4 4M16.5 8l4 4-4 4M13.5 6l-3 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',

  // --- Hacker Row 3: Exploitation & Auth ---
  msf: '<path d="M4.5 5.5L12 3l7.5 2.5v6.8c0 4.6-3.2 7.6-7.5 9.2-4.3-1.6-7.5-4.6-7.5-9.2V5.5z" fill="currentColor" opacity="0.16" stroke="currentColor" stroke-width="1.85" stroke-linejoin="round"/><path d="M8.2 15V9l3.8 3.6L15.8 9v6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  hydra: '<path d="M12 19v-7m0 0L7 7m5 5l5-5m-5 5V4" fill="none" stroke="currentColor" stroke-width="1.95" stroke-linecap="round"/><circle cx="7" cy="6" r="1.8" fill="currentColor"/><circle cx="17" cy="6" r="1.8" fill="currentColor"/><circle cx="12" cy="4" r="1.8" fill="currentColor"/>',
  john: '<circle cx="8.5" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M12.5 12H21v3m-3-3v2.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  hashcat: '<path d="M8 4L6 20M16 4l-2 16M4 9h16M3.5 15h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  impacket: '<rect x="3.5" y="6" width="7" height="12" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="13.5" y="6" width="7" height="12" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10.5 10h3m-3 4h3" stroke="currentColor" stroke-width="1.8"/>',
  lfi: '<path d="M3.5 6.5h6l2 2h9v10a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 18.5v-12z" fill="currentColor" opacity="0.14" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.5 14.5l2.5-2.5 2.5 2.5M12 12v5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',

  // --- Hacker Row 4: Network & Packet ---
  wireshark: '<path d="M3 17h18M6.5 17C7.6 10.2 11.2 6.4 17 5.8c-1.4 4-1.1 7.6 1.2 11.2" fill="currentColor" opacity="0.18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  tcpdump: '<path d="M3 12h3.5l2.2-5.5 3.6 11 2.6-7.5 1.8 2H21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  responder: '<path d="M12 12m-2.2 0a2.2 2.2 0 1 0 4.4 0 2.2 2.2 0 1 0-4.4 0" fill="currentColor"/><path d="M7.2 7.2a6.8 6.8 0 0 0 0 9.6M16.8 7.2a6.8 6.8 0 0 1 0 9.6M4.2 4.2a11 11 0 0 0 0 15.6M19.8 4.2a11 11 0 0 1 0 15.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  bettercap: '<path d="M4 8.5l8-4.5 8 4.5v7L12 20l-8-4.5v-7z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',
  aircrack: '<path d="M3.5 9.5a12 12 0 0 1 17 0M6.5 12.8a8 8 0 0 1 11 0M9.5 16a4 4 0 0 1 5 0" fill="none" stroke="currentColor" stroke-width="1.95" stroke-linecap="round"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/>',

  // --- Hacker Row 5: Reverse & Forensics ---
  ghidra: '<path d="M5.5 18.5c0-6.5 3.2-11.8 9.2-13.2L13 8.8l5 1.2-3.2 3.8 3.8 1.6c-2.8 2.2-6 3.1-13.1 3.1z" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.85" stroke-linejoin="round"/>',
  r2: '<rect x="4" y="4" width="16" height="16" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.85"/><path d="M8 15V9h3.2a2 2 0 0 1 0 4H8m2.2 0L12 15m2.5-6h2.8a1.6 1.6 0 0 1 0 3.2h-2.8V15h3.2" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>',
  radare2: '<rect x="4" y="4" width="16" height="16" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.85"/><path d="M8 15V9h3.2a2 2 0 0 1 0 4H8m2.2 0L12 15m2.5-6h2.8a1.6 1.6 0 0 1 0 3.2h-2.8V15h3.2" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>',
  gdb: '<circle cx="12" cy="12.5" r="5.5" fill="none" stroke="currentColor" stroke-width="1.85"/><path d="M9.5 7.2L8 4.5m6.5 2.7L16 4.5M4 11h2.5m11 0H20M4.5 15.5l2-1m11 0l2 1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  volatility: '<rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="currentColor" opacity="0.16" stroke="currentColor" stroke-width="1.85"/><path d="M9 3.5v3m6-3v3M9 17.5v3m6-3v3M3.5 9h3m-3 6h3M17.5 9h3m-3 6h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  autopsy: '<path d="M14.5 4.5l5 5-10 10H4.5v-5l10-10zM12 7l5 5" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linejoin="round"/>',

  // --- Hacker Row 6: Environments & Labs (Kali Dragon, Parrot, HTB Cube, TryHackMe, HackerOne, Bugcrowd) ---
  kali: '<path d="M4.5 8.5c3.5-3.8 8.2-4.8 13.5-2.5-3.2 1.2-5.4 2.8-6.4 4.8 2.8-.6 5.4 0 7.6 1.8-3.6.2-6.2 1.4-7.8 3.6 1.8 1.2 3.8 1.6 6 1.4-4.2 2.4-8.4 2.2-11.2-1.2-.8-2.2-.2-4.6 1.8-6.2-1.4-.4-2.6-.9-3.5-1.7z" fill="currentColor"/>',
  parrot: '<path d="M14.5 4L6 13.5l5.5 1.5L9.5 20l9-9.5-5.5-1.5z" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linejoin="round"/>',
  htb: '<path d="M12 2.6l8.2 4.7v9.4L12 21.4l-8.2-4.7V7.3z" fill="currentColor" opacity="0.18" stroke="currentColor" stroke-width="1.85" stroke-linejoin="round"/><path d="M3.8 7.3L12 12l8.2-4.7M12 12v9.4" fill="none" stroke="currentColor" stroke-width="1.75"/>',
  thm: '<path d="M6.8 17h10.8a3.4 3.4 0 0 0 .4-6.8 4.8 4.8 0 0 0-9.4-1.2A3.8 3.8 0 0 0 3.5 13a4 4 0 0 0 3.3 4z" fill="none" stroke="currentColor" stroke-width="1.85"/><path d="M10 12.5l2 2 3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  h1: '<path d="M7.5 4.5v15M14.5 4.5v15M7.5 12h7M14.5 4.5l3 2.5" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>',
  bugcrowd: '<polygon points="12,3 20,7.5 20,16.5 12,21 4,16.5 4,7.5" fill="currentColor" opacity="0.16" stroke="currentColor" stroke-width="1.85"/><circle cx="12" cy="12" r="3.2" fill="currentColor"/>',

  default: '<rect x="4.5" y="4.5" width="15" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="1.85"/><path d="M9 9h6v6H9z" fill="none" stroke="currentColor" stroke-width="1.6"/>',
};

function iconFor(id) {
  return ICONS[id] || ICONS.default;
}

const SAMUBIN_KEYS = [
  { key: "s", label: "S", role: "Sequence 01 // S — Press S-A-M-U-B-I-N to run live DOM hex-cipher decryption" },
  { key: "a", label: "A", role: "Sequence 02 // A — Sakib Alam Mubin (SA Mubin) hardware signature key" },
  { key: "m", label: "M", role: "Sequence 03 // M — Mechanical Web Audio switch synthesizer active" },
  { key: "u", label: "U", role: "Sequence 04 // U — Unified Dual-Mode Architecture (Dev ⇄ Ethical Hacker)" },
  { key: "b", label: "B", role: "Sequence 05 // B — Builder & Breaker engineering workbench" },
  { key: "i", label: "I", role: "Sequence 06 // I — Interactive 60fps spring-damper physics rig" },
  { key: "n", label: "N", role: "Sequence 07 // N — Complete sequence to unlock page cipher!" },
  { key: "lock", label: "⇄", role: "Persona Flip // Toggle Developer Lab ⇄ Ethical Hacker Darkroom [Shortcut: H]" },
];

export async function initLoadout() {
  const section = document.querySelector("[data-loadout]");
  if (!section) return;

  const rig = section.querySelector("[data-hanging-kb]");
  const chassis = section.querySelector("[data-kb-chassis]");
  const cableSvg = section.querySelector("[data-kb-cables]");
  const board = section.querySelector("[data-loadout-board]");
  const oledText = section.querySelector("[data-loadout-oled]");
  const oledModeTag = section.querySelector("[data-loadout-tag]");
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

  let activeFilterMod = null;
  let typeTimer = 0;
  let letterCursor = {};
  let samBuffer = "";

  // --- Hanging Keyboard Spring-Damper Physics ---
  let x = 0;
  let y = 0;
  let vx = 0;
  let vy = 0;
  let ang = 0;
  let vang = 0;
  let raf = 0;
  let dragging = false;
  let pointerId = null;
  let startX = 0;
  let startY = 0;

  function drawHanging() {
    if (!chassis) return;
    const deg = (ang * 180) / Math.PI;
    chassis.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${deg.toFixed(2)}deg)`;

    if (cableSvg && rig) {
      const w = rig.clientWidth || 1000;
      const leftAnchorX = w * 0.24;
      const rightAnchorX = w * 0.76;
      const topY = 0;
      const baseDrop = 48 + y;
      const leftPortX = leftAnchorX + x - Math.sin(ang) * 18;
      const leftPortY = baseDrop - Math.sin(ang) * 110;
      const rightPortX = rightAnchorX + x - Math.sin(ang) * 18;
      const rightPortY = baseDrop + Math.sin(ang) * 110;

      const dL = `M ${leftAnchorX.toFixed(1)} ${topY} C ${leftAnchorX.toFixed(1)} ${(leftPortY * 0.55).toFixed(1)}, ${leftPortX.toFixed(1)} ${(leftPortY * 0.55).toFixed(1)}, ${leftPortX.toFixed(1)} ${leftPortY.toFixed(1)}`;
      const dR = `M ${rightAnchorX.toFixed(1)} ${topY} C ${rightAnchorX.toFixed(1)} ${(rightPortY * 0.55).toFixed(1)}, ${rightPortX.toFixed(1)} ${(rightPortY * 0.55).toFixed(1)}, ${rightPortX.toFixed(1)} ${rightPortY.toFixed(1)}`;

      cableSvg.querySelectorAll("[data-cable-l]").forEach((p) => p.setAttribute("d", dL));
      cableSvg.querySelectorAll("[data-cable-r]").forEach((p) => p.setAttribute("d", dR));
    }
  }

  function stepPhysics() {
    raf = 0;
    if (!dragging) {
      const fx = -x * 0.095;
      const fy = -y * 0.11;
      vx = (vx + fx) * 0.84;
      vy = (vy + fy) * 0.84;
      x += vx;
      y += vy;

      const targetAng = Math.max(-0.08, Math.min(0.08, x * 0.0009 + vx * 0.003));
      vang = (vang + (targetAng - ang) * 0.15) * 0.82;
      ang += vang;
    }
    drawHanging();
    const energy = Math.abs(vx) + Math.abs(vy) + Math.abs(vang) * 20 + Math.abs(x) * 0.02 + Math.abs(y) * 0.02;
    if (dragging || energy > 0.02) {
      raf = requestAnimationFrame(stepPhysics);
    } else {
      x = 0;
      y = 0;
      ang = 0;
      drawHanging();
    }
  }

  function impulseKeyboard(colRatio = 0, downForce = 3.2) {
    if (reduceMotion) return;
    vy += downForce;
    vx += colRatio * 1.1;
    vang += colRatio * 0.008;
    if (!raf) raf = requestAnimationFrame(stepPhysics);
  }

  if (chassis) {
    chassis.addEventListener("pointerdown", (e) => {
      if (e.button && e.button !== 0) return;
      if (e.target.closest("button")) return;
      if (reduceMotion) return;
      pointerId = e.pointerId;
      startX = e.clientX - x;
      startY = e.clientY - y;
      dragging = true;
      chassis.classList.add("is-dragging");
      try {
        chassis.setPointerCapture(pointerId);
      } catch {}
      if (!raf) raf = requestAnimationFrame(stepPhysics);
    });

    addEventListener("pointermove", (e) => {
      if (!dragging || e.pointerId !== pointerId) return;
      const dx = Math.max(-64, Math.min(64, e.clientX - startX));
      const dy = Math.max(-18, Math.min(54, e.clientY - startY));
      vx = (dx - x) * 0.4;
      vy = (dy - y) * 0.4;
      x = dx;
      y = dy;
      ang = Math.max(-0.06, Math.min(0.06, dx * 0.0008));
      drawHanging();
    });

    const endDrag = (e) => {
      if (!dragging || (e.pointerId !== undefined && e.pointerId !== pointerId)) return;
      dragging = false;
      pointerId = null;
      chassis.classList.remove("is-dragging");
      if (!raf) raf = requestAnimationFrame(stepPhysics);
    };
    addEventListener("pointerup", endDrag);
    addEventListener("pointercancel", endDrag);
    addEventListener("resize", drawHanging, { passive: true });
  }

  function typeOled(str, prefixTag = null) {
    if (!oledText) return;
    clearInterval(typeTimer);
    if (oledModeTag && prefixTag) oledModeTag.textContent = prefixTag;

    if (reduceMotion) {
      oledText.textContent = str;
      return;
    }
    oledText.textContent = "";
    let i = 0;
    typeTimer = setInterval(() => {
      i += 3;
      oledText.textContent = str.slice(0, i);
      if (i >= str.length) clearInterval(typeTimer);
    }, 11);
  }

  function buildSamubinRow(isFlipping = false) {
    const rowEl = document.createElement("div");
    rowEl.className = "kb-row kb-row--samubin";
    if (isFlipping && !reduceMotion) {
      rowEl.classList.add("is-flipping");
      setTimeout(() => rowEl.classList.remove("is-flipping"), 550);
    }

    const modBtn = document.createElement("button");
    modBtn.type = "button";
    modBtn.className = "kb-mod kb-mod--sam";
    modBtn.setAttribute("aria-label", "Trigger SAMUBIN page cipher");
    modBtn.innerHTML = `
      <span class="kb-mod-led" aria-hidden="true"></span>
      <span class="kb-mod-code">SAM-08</span>
      <span class="kb-mod-sub">Cipher Keys</span>
    `;
    modBtn.addEventListener("click", () => {
      sound.play("auth");
      impulseKeyboard(-0.5, 4);
      triggerSamubinCipher();
    });

    const capsWrap = document.createElement("div");
    capsWrap.className = "kb-caps kb-caps--sam";

    SAMUBIN_KEYS.forEach((item, idx) => {
      const cap = document.createElement("button");
      cap.type = "button";
      cap.className = `kb-cap kb-cap--sam ${item.key === "lock" ? "kb-cap--mode" : ""}`;
      cap.dataset.samKey = item.key;
      cap.dataset.tip = item.key === "lock" ? "Flip Mode [H]" : `Key ${item.label}`;
      cap.setAttribute("aria-label", item.role);
      cap.innerHTML = `<span class="kb-sam-char">${item.label}</span>`;

      const inspect = () => {
        typeOled(item.role, "SAM-08 // MACRO");
      };
      cap.addEventListener("pointerenter", inspect);
      cap.addEventListener("focus", inspect);
      cap.addEventListener("click", () => {
        sound.play("down");
        setTimeout(() => sound.play("up"), 75);
        cap.classList.add("is-down");
        setTimeout(() => cap.classList.remove("is-down"), 140);
        const colRatio = (idx - 3.5) / 3.5;
        impulseKeyboard(colRatio, 3.6);
        inspect();

        if (item.key === "lock") {
          toggleMode({ animate: true });
        } else {
          samBuffer = (samBuffer + item.key).slice(-10);
          if (samBuffer.endsWith("samubin")) {
            samBuffer = "";
            triggerSamubinCipher();
          }
        }
      });

      capsWrap.appendChild(cap);
    });

    rowEl.appendChild(modBtn);
    rowEl.appendChild(capsWrap);
    return rowEl;
  }

  function renderBoard(mode, { flipping = false } = {}) {
    const modeData = data[mode] || data.dev;
    const isHack = mode === "hack";

    if (titleEl) titleEl.textContent = modeData.title;
    if (subEl) subEl.textContent = modeData.subtitle;
    typeOled(modeData.defaultOled, isHack ? "ARSENAL // SAFELIGHT" : "LOADOUT // LAB");

    activeFilterMod = null;
    board.innerHTML = "";

    modeData.rows.forEach((row, rIdx) => {
      // Insert the embedded S-A-M-U-B-I-N hardware keycap row right in the center (before Row 4)
      if (rIdx === 3) {
        board.appendChild(buildSamubinRow(flipping));
      }

      const rowEl = document.createElement("div");
      rowEl.className = "kb-row";
      rowEl.style.setProperty("--row-idx", String(rIdx));
      if (flipping && !reduceMotion) {
        rowEl.classList.add("is-flipping");
        setTimeout(() => sound.play("flip"), rIdx * 55);
        setTimeout(() => rowEl.classList.remove("is-flipping"), 520 + rIdx * 55);
      }

      const modBtn = document.createElement("button");
      modBtn.type = "button";
      modBtn.className = "kb-mod";
      modBtn.dataset.mod = row.mod;
      modBtn.setAttribute("aria-pressed", "false");
      modBtn.setAttribute("aria-label", `Filter ${row.label} row`);
      modBtn.innerHTML = `
        <span class="kb-mod-led" aria-hidden="true"></span>
        <span class="kb-mod-code">${row.mod}</span>
        <span class="kb-mod-sub">${row.label}</span>
      `;
      modBtn.addEventListener("click", () => {
        sound.play("down");
        setTimeout(() => sound.play("up"), 75);
        impulseKeyboard(-0.8, 2.8);
        toggleRowFilter(row.mod);
      });

      const capsWrap = document.createElement("div");
      capsWrap.className = "kb-caps";

      const capsList = row.caps || row.items || [];
      capsList.forEach((item, cIdx) => {
        const detailText = item.detail || item.role || "";
        const cap = document.createElement("button");
        cap.type = "button";
        cap.className = `kb-cap kb-cap--icon kb-cap--${item.tier}`;
        cap.dataset.itemId = item.id;
        cap.dataset.letter = item.name[0].toLowerCase();
        cap.dataset.tip = item.name;
        cap.setAttribute("aria-pressed", "false");
        cap.setAttribute("aria-label", `${item.name} — ${item.tier} — ${detailText}`);
        cap.innerHTML = `
          <svg class="kb-cap-ico" viewBox="0 0 24 24" aria-hidden="true">${iconFor(item.id)}</svg>
        `;

        const inspect = (fromClick = false) => {
          board.querySelectorAll(".kb-cap[aria-pressed='true']").forEach((el) => {
            el.setAttribute("aria-pressed", "false");
          });
          cap.setAttribute("aria-pressed", "true");
          if (fromClick) {
            sound.play("down");
            setTimeout(() => sound.play("up"), 70);
            const colRatio = (cIdx - (capsList.length - 1) / 2) / 3.5;
            impulseKeyboard(colRatio, 3.0);
          }
          const tierName =
            item.tier === "daily" ? "Daily Driver" : item.tier === "proficient" ? "Proficient" : "Familiar";
          const prefix = isHack ? `ARSENAL // ${row.mod}` : `LOADOUT // ${row.mod}`;
          typeOled(`${item.name} · ${tierName} · ${detailText}`, prefix);
        };

        cap.addEventListener("pointerenter", () => inspect(false));
        cap.addEventListener("focus", () => inspect(false));
        cap.addEventListener("click", () => inspect(true));

        capsWrap.appendChild(cap);
      });

      rowEl.appendChild(modBtn);
      rowEl.appendChild(capsWrap);
      board.appendChild(rowEl);
    });

    const firstCap = board.querySelector(".kb-cap--icon");
    if (firstCap) firstCap.setAttribute("aria-pressed", "true");
    requestAnimationFrame(drawHanging);
  }

  function toggleRowFilter(mod) {
    const rows = [...board.querySelectorAll(".kb-row:not(.kb-row--samubin)")];
    if (activeFilterMod === mod) {
      activeFilterMod = null;
      rows.forEach((r) => {
        r.classList.remove("is-dimmed");
        r.querySelector(".kb-mod")?.setAttribute("aria-pressed", "false");
      });
      typeOled("ALL ROWS ACTIVE — Hover or press any icon switch to inspect runtime telemetry.");
    } else {
      activeFilterMod = mod;
      rows.forEach((r) => {
        const m = r.querySelector(".kb-mod");
        const match = m?.dataset.mod === mod;
        r.classList.toggle("is-dimmed", !match);
        m?.setAttribute("aria-pressed", String(match));
      });
      typeOled(`ROW ISOLATED [${mod}] — Click [${mod}] again to restore full 44-key switchboard.`);
    }
  }

  // Real physical keyboard integration:
  // If user types S-A-M-U-B-I-N, depress the embedded SAMUBIN keycaps; also jump to matching tech icon!
  addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = e.target?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) return;
    const ch = (e.key || "").toLowerCase();
    if (!/^[a-z0-9]$/.test(ch) || ch === "h") return;

    const r = section.getBoundingClientRect();
    if (r.bottom < -100 || r.top > innerHeight + 100) return;

    // 1. Depress embedded S-A-M-U-B-I-N key if it matches
    const samCap = board.querySelector(`.kb-cap--sam[data-sam-key="${ch}"]`);
    if (samCap) {
      samCap.classList.add("is-down");
      setTimeout(() => samCap.classList.remove("is-down"), 145);
      impulseKeyboard(0, 2.6);
    }

    // 2. Highlight matching tech icon keycap
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
    renderBoard(mode, { flipping: true });
    impulseKeyboard(0, 5.2);
  });

  renderBoard(getMode(), { flipping: false });
  if (!reduceMotion) {
    vy = -3.5;
    ang = 0.018;
    raf = requestAnimationFrame(stepPhysics);
  }
}
