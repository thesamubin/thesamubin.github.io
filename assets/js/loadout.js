// Compact 3-Layer Hanging Mechanical Keyboard ("Loadout / Arsenal" + embedded S-A-M-U-B-I-N keys in every stack).
// Features:
// - Suspended from dual braided top cables with 60fps Hooke's-law spring-damper swing & recoil physics
// - 3 Merged Stack Selector Buttons on the left:
//     Dev:  01 · CORE (Lang & Frameworks) | 02 · AI & DATA (AI/ML & DBs) | 03 · SYSTEMS (OS, Cloud & DevOps)
//     Hack: 01 · RECON & WEB              | 02 · EXPLOIT & NET           | 03 · RE & LABS
// - Clicking any merged button flips the 3-row switch matrix in-place to show ONLY that stack's 12 oversized tech icons
// - S · A · M · U · B · I · N keys embedded right inside the center row of EVERY stack layer
// - High-contrast, oversized (38px × 38px) recognizable vector silhouettes

import { sound } from "./sound.js";
import { getMode, onModeChange, toggleMode, reduceMotion } from "./mode.js";
import { triggerSamubinCipher } from "./keyboard.js";

// Bold, high-contrast, immediately recognizable 24x24 vector silhouettes
const ICONS = {
  // --- CORE: Languages (Row 1) ---
  ts: '<rect x="2.2" y="2.2" width="19.6" height="19.6" rx="3.2" fill="currentColor"/><path d="M6.4 10.2h6M9.4 10.2v8.2M18.4 11.6c-.7-.8-2.2-.9-3-.2-.7.6-.2 1.5 1.3 2 1.6.5 2.3 1.2 1.9 2.4-.4 1.1-2.2 1.5-3.6.4" fill="none" stroke="var(--c-bg, #fff)" stroke-width="2.15" stroke-linecap="round"/>',
  js: '<polygon points="12,1.8 21,6.9 21,17.1 12,22.2 3,17.1 3,6.9" fill="currentColor"/><path d="M10.4 8.8v6.2c0 1.4-1 2-2.2 1.3M17.2 10.4c-.7-.6-2-.6-2.4.2-.4.7.2 1.4 1.5 1.7 1.3.4 1.8 1 1.5 2.1-.3.9-1.8 1.1-2.9.2" fill="none" stroke="var(--c-bg, #fff)" stroke-width="2.05" stroke-linecap="round"/>',
  py: '<path d="M11.8 2.2c-3.8 0-4.4 1.6-4.4 3.8v2.6h4.6v1.1H6.1c-2.4 0-3.9 1.5-3.9 4.4 0 2.9 1.5 4.4 3.9 4.4h1.7v-2.2c0-1.7 1.4-3 3.1-3h5c1.5 0 2.7-1.2 2.7-2.8V6c0-2.2-2.8-3.8-6.8-3.8zm.4 19.6c3.8 0 4.4-1.6 4.4-3.8v-2.6H12v-1.1h5.9c2.4 0 3.9-1.5 3.9-4.4 0-2.9-1.5-4.4-3.9-4.4h-1.7v2.2c0 1.7-1.4 3-3.1 3h-5c-1.5 0-2.7 1.2-2.7 2.8V18c0 2.2 2.8 3.8 6.8 3.8z" fill="currentColor"/><circle cx="9.8" cy="5.5" r="1.1" fill="var(--c-bg, #fff)"/><circle cx="14.2" cy="18.5" r="1.1" fill="var(--c-bg, #fff)"/>',
  go: '<path d="M1.5 9.8h3.6M1 12.4h4.2M2.2 15h2.9" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/><path d="M12.2 9a3.8 3.8 0 1 0 0 6h2.2v-2.6h-1.8M18.6 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 1 0 0-6.4z" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>',
  cpp: '<polygon points="12,1.8 21,6.9 21,17.1 12,22.2 3,17.1 3,6.9" fill="currentColor"/><path d="M10.8 8.2a4.3 4.3 0 1 0 0 7.6M14.7 10.3v3.4M13 12h3.4M18.7 10.3v3.4M17 12h3.4" fill="none" stroke="var(--c-bg, #fff)" stroke-width="2.05" stroke-linecap="round"/>',
  c: '<circle cx="12" cy="12" r="9.5" fill="currentColor"/><path d="M15.8 7.8a5.2 5.2 0 1 0 0 8.4" fill="none" stroke="var(--c-bg, #fff)" stroke-width="3" stroke-linecap="round"/>',

  // --- CORE: Frameworks (Row 3) ---
  react: '<circle cx="12" cy="12" r="2.3" fill="currentColor"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" stroke-width="1.95"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" fill="none" stroke="currentColor" stroke-width="1.95"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" fill="none" stroke="currentColor" stroke-width="1.95"/>',
  next: '<circle cx="12" cy="12" r="9.6" fill="currentColor"/><path d="M8.6 16.2V7.8l9.2 11.4M15.4 7.8v5.2" fill="none" stroke="var(--c-bg, #fff)" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round"/>',
  node: '<polygon points="12,1.8 20.8,6.8 20.8,17.2 12,22.2 3.2,17.2 3.2,6.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M9.6 9v5.6c0 1.1-.9 1.6-1.8 1M16 10.2c-.6-.5-1.8-.5-2.1.2-.3.6.2 1.2 1.3 1.5 1.1.3 1.5.9 1.2 1.8-.3.8-1.6.9-2.4.1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  express: '<rect x="2.2" y="4.2" width="19.6" height="15.6" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5.5 9h5.2M5.5 12h4M5.5 15h5.2M13.6 9l5 6m0-6l-5 6" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round"/>',
  fastapi: '<circle cx="12" cy="12" r="9.6" fill="currentColor"/><path d="M13.4 5.4L7.4 13.2h4.6l-1.4 5.4 6-7.8H12z" fill="var(--c-bg, #fff)"/>',
  tailwind: '<path d="M4.8 10.4c1.5-3 3.6-3.9 6.2-2.8 1.3.5 2.2 1.6 3.3 1.9 1.7.6 3.4 0 4.9-1.9-1.5 3-3.6 3.9-6.2 2.8-1.3-.5-2.2-1.6-3.3-1.9-1.7-.6-3.4 0-4.9 1.9zm0 6.2c1.5-3 3.6-3.9 6.2-2.8 1.3.5 2.2 1.6 3.3 1.9 1.7.6 3.4 0 4.9-1.9-1.5 3-3.6 3.9-6.2 2.8-1.3-.5-2.2-1.6-3.3-1.9-1.7-.6-3.4 0-4.9 1.9z" fill="currentColor"/>',

  // --- AI & DATA: AI/ML (Row 1) ---
  pytorch: '<path d="M15.2 4.2l-2.2 2.2a7.4 7.4 0 1 0 4.6 6.8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="16.2" cy="6.8" r="1.9" fill="currentColor"/>',
  tf: '<path d="M12 2.4l8.6 4.8v3.6l-5.2-2.9v3.5l3.2 1.8v3.4l-3.2-1.8v6.6L12 19.6V7.4L6.8 10.3V6.7z" fill="currentColor"/>',
  langchain: '<path d="M9.4 14.6l-2.4 2.4a3.6 3.6 0 0 1-5-5l2.8-2.8a3.6 3.6 0 0 1 5 0M14.6 9.4L17 7a3.6 3.6 0 0 1 5 5l-2.8 2.8a3.6 3.6 0 0 1-5 0M9 15l6-6" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"/>',
  hf: '<circle cx="12" cy="12" r="9.4" fill="none" stroke="currentColor" stroke-width="2.15"/><circle cx="9" cy="9.8" r="1.4" fill="currentColor"/><circle cx="15" cy="9.8" r="1.4" fill="currentColor"/><path d="M8.2 13.8c1.9 2.4 5.7 2.4 7.6 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  openai: '<circle cx="12" cy="12" r="3.2" fill="currentColor"/><path d="M12 2.6a4.8 4.8 0 0 1 4.5 6.5 4.8 4.8 0 0 1 2.3 6.3 4.8 4.8 0 0 1-6 2.8A4.8 4.8 0 0 1 6.8 19.4a4.8 4.8 0 0 1-2.8-6 4.8 4.8 0 0 1 2.3-6.3A4.8 4.8 0 0 1 12 2.6z" fill="none" stroke="currentColor" stroke-width="2.05"/>',
  rag: '<circle cx="5.8" cy="6.4" r="2.8" fill="currentColor"/><circle cx="18.2" cy="6.4" r="2.8" fill="currentColor"/><circle cx="12" cy="18" r="3" fill="currentColor"/><path d="M7.6 8.4l3 7.2m5.8-7.2l-3 7.2M8.6 6.4h6.8" fill="none" stroke="currentColor" stroke-width="2.1"/>',

  // --- AI & DATA: Databases (Row 3) ---
  pg: '<path d="M7.2 6C4.8 6.6 3.5 9.3 4 12.6c.4 2.7 2.2 4.5 4.1 4.5.9 0 1.5-.5 1.8-1.3v3.2c0 1.3 1 2.2 2.2 2.2s2.2-.9 2.2-2.2v-2.4c1.3.4 2.8.2 3.9-.9 1.5-1.5 2.2-4.5 1.3-7.3C18.4 4.8 14.8 3.2 11.2 3.8 9.4 4.1 8 4.9 7.2 6z" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/><circle cx="10" cy="9.6" r="1.25" fill="currentColor"/><path d="M14.2 9.4c1.4-.4 2.6.4 2.6 2 0 1.4-.9 2.4-2 2.7" fill="none" stroke="currentColor" stroke-width="1.95" stroke-linecap="round"/>',
  mongo: '<path d="M12 1.8S5.8 7 5.8 13.2c0 4.2 2.9 7.2 6.2 8.4 3.3-1.2 6.2-4.2 6.2-8.4C18.2 7 12 1.8 12 1.8z" fill="currentColor"/><path d="M12 6v15.6" stroke="var(--c-bg, #fff)" stroke-width="2" stroke-linecap="round"/>',
  redis: '<polygon points="12,2.8 20.8,7.2 12,11.6 3.2,7.2" fill="currentColor"/><path d="M3.2 12l8.8 4.4 8.8-4.4M3.2 16.4l8.8 4.4 8.8-4.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  prisma: '<path d="M12.8 2.2L4.2 16.4 11.2 21.8l8.6-4.1L12.8 2.2zm0 0L11.2 21.8" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linejoin="round"/>',
  sqlite: '<path d="M5.5 3.5h9.5l4.5 4.5v12.5a1.2 1.2 0 0 1-1.2 1.2H5.5a1.2 1.2 0 0 1-1.2-1.2V4.7a1.2 1.2 0 0 1 1.2-1.2z" fill="none" stroke="currentColor" stroke-width="2.05"/><path d="M8.5 13.5l2.5-5.5 4.5 8.5-7-3z" fill="currentColor"/>',
  sql: '<ellipse cx="12" cy="5.8" rx="7.8" ry="3" fill="currentColor"/><path d="M4.2 5.8v12.4c0 1.7 3.5 3 7.8 3s7.8-1.3 7.8-3V5.8M4.2 12c0 1.7 3.5 3 7.8 3s7.8-1.3 7.8-3" fill="none" stroke="currentColor" stroke-width="2.15"/>',

  // --- SYSTEMS: OS & Shell (Row 1) ---
  linux: '<path d="M12 2.4c-2.8 0-4.6 2.2-4.6 5.2 0 1.8-.9 3.5-2 5.2-1.1 1.6-1.3 3.7-.4 5.2.8 1.3 2.2 1.8 3.5 2.4 1.1.5 2.3.7 3.5.7s2.4-.2 3.5-.7c1.3-.6 2.7-1.1 3.5-2.4.9-1.5.7-3.6-.4-5.2-1.1-1.7-2-3.4-2-5.2 0-3-1.8-5.2-4.6-5.2z" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="M9.8 8.2L12 10l2.2-1.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10.2" cy="6.4" r="1.05" fill="currentColor"/><circle cx="13.8" cy="6.4" r="1.05" fill="currentColor"/>',
  ubuntu: '<circle cx="12" cy="12" r="5.6" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="3.6" r="2.2" fill="currentColor"/><circle cx="4.6" cy="16.2" r="2.2" fill="currentColor"/><circle cx="19.4" cy="16.2" r="2.2" fill="currentColor"/>',
  arch: '<path d="M12 2L3.5 21.2c2.9-1.6 5.3-2.5 8.5-2.5s5.6.9 8.5 2.5L12 2zm0 7.8c1.7 2.6 2.4 4.9 2.6 6.8-1.7-.5-3.5-.5-5.2 0 .2-1.9.9-4.2 2.6-6.8z" fill="currentColor"/>',
  win: '<path d="M3 4.8l8-1.1v7.5H3zM12.4 3.5L21 2.2v9h-8.6zM3 12.8h8v7.5l-8-1.1zM12.4 12.8H21v9l-8.6-1.3z" fill="currentColor"/>',
  wsl: '<rect x="2.5" y="4" width="19" height="16" rx="2.8" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="M6.5 9.2l3.4 2.8-3.4 2.8M11.6 14.8h4" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round"/><circle cx="17.2" cy="9.2" r="1.8" fill="currentColor"/>',
  bash: '<rect x="2.5" y="3.8" width="19" height="16.4" rx="3" fill="currentColor"/><path d="M6.8 9L11 12l-4.2 3M12.4 15.2h4.8" fill="none" stroke="var(--c-bg, #fff)" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>',

  // --- SYSTEMS: Cloud & DevOps (Row 3) ---
  git: '<path d="M12 1.8L22.2 12 12 22.2 1.8 12 12 1.8z" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linejoin="round"/><path d="M9 6.5l6 6M12 9.5v6.8" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/><circle cx="12" cy="9.5" r="1.8" fill="currentColor"/><circle cx="15" cy="12.5" r="1.8" fill="currentColor"/><circle cx="12" cy="16.3" r="1.8" fill="currentColor"/>',
  docker: '<path d="M2.5 13.2h14.4c2 0 3.5-.9 4.6-2.6-1.3-.4-2.4-.2-3 .4-.4-1.5-1.5-2.4-2.8-2.6-.6 1.1-.4 2.4.2 3.4H2.5c-.2 4.1 2.4 7.2 7.2 7.2 5.6 0 9-2.8 10.1-5.8" fill="currentColor"/><path d="M5.8 9.6h2.3v2.3H5.8zm3 0h2.3v2.3H8.8zm3 0h2.3v2.3h-2.3zm-3-3h2.3v2.3H8.8zm3 0h2.3v2.3h-2.3z" fill="currentColor"/>',
  gha: '<circle cx="6.8" cy="6.8" r="2.6" fill="currentColor"/><circle cx="17.2" cy="17.2" r="2.6" fill="currentColor"/><circle cx="17.2" cy="6.8" r="2.6" fill="currentColor"/><path d="M6.8 9.4v4.2c0 2 1.6 3.6 3.6 3.6h4.2M9.4 6.8h5.2" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round"/>',
  aws: '<path d="M4.8 15.8c4.2 2.8 10.2 2.8 14.4 0M16.8 14.6l2.8.9-.7 2.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 11.8l2.2-6 2.2 6M7 10.2h3.4M13 5.8l1.3 6 1.4-4.4 1.4 4.4 1.3-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  cf: '<path d="M6.6 18h11.8a3.8 3.8 0 0 0 .5-7.6 5.6 5.6 0 0 0-10.6-1.5A4.5 4.5 0 0 0 2.6 13.4 4.6 4.6 0 0 0 6.6 18z" fill="currentColor"/>',
  nginx: '<polygon points="12,1.8 20.8,6.8 20.8,17.2 12,22.2 3.2,17.2 3.2,6.8" fill="currentColor"/><path d="M8.4 15.8V8.2l7.2 7.6V8.2" fill="none" stroke="var(--c-bg, #fff)" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>',

  // --- HACK 01: RECON & WEB ---
  nmap: '<circle cx="12" cy="12" r="8.8" fill="none" stroke="currentColor" stroke-width="2.15"/><circle cx="12" cy="12" r="3.6" fill="currentColor"/><path d="M12 1.6v3.6m0 13.6v3.6M1.6 12h3.6m13.6 0h3.6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  amass: '<polygon points="12,2.2 21,7.3 21,16.7 12,21.8 3,16.7 3,7.3" fill="none" stroke="currentColor" stroke-width="2.15"/><path d="M12 2.2v19.6M3 7.3l18 9.4M21 7.3L3 16.7" stroke="currentColor" stroke-width="1.75"/>',
  subfinder: '<circle cx="10.8" cy="10.8" r="6.8" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.8 15.8L21 21M7.8 10.8h6M10.8 7.8v6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  httpx: '<path d="M13.8 2.6L5.8 13.2h5.6l-1.2 8.2 8-10.6h-5.6z" fill="currentColor"/>',
  shodan: '<circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" stroke-width="2.1"/><ellipse cx="12" cy="12" rx="9.2" ry="4" fill="none" stroke="currentColor" stroke-width="1.9"/><circle cx="15.2" cy="9.8" r="2.2" fill="currentColor"/>',
  dig: '<path d="M3.5 6.8h17M3.5 12h17M3.5 17.2h10.5" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/><circle cx="18.2" cy="17.2" r="2.6" fill="currentColor"/>',
  burp: '<polygon points="12,2.2 3.4,7.1 3.4,16.9 12,21.8 20.6,16.9 20.6,7.1" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linejoin="round"/><path d="M9.2 7.5h5.6L11 12h4.4l-5 5.8" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>',
  zap: '<path d="M14.2 2.2L4.8 13.6h6.6L9.6 21.8l9.6-11.4h-6.6z" fill="currentColor"/>',
  ffuf: '<path d="M3.5 7.6h10.5M3.5 12h14.5M3.5 16.4h8.5M15.8 6.6l4.6 5.4-4.6 5.4" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>',
  sqlmap: '<ellipse cx="10.8" cy="6.2" rx="6.8" ry="2.6" fill="currentColor"/><path d="M4 6.2v10.4c0 1.5 3 2.6 6.8 2.6M4 11.4c0 1.5 3 2.6 6.8 2.6M14.8 12.8l5.4 5.4m0-5.4l-5.4 5.4" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round"/>',
  nuclei: '<circle cx="12" cy="12" r="2.8" fill="currentColor"/><ellipse cx="12" cy="12" rx="9.6" ry="4.2" transform="rotate(35 12 12)" fill="none" stroke="currentColor" stroke-width="2.05"/><ellipse cx="12" cy="12" rx="9.6" ry="4.2" transform="rotate(-35 12 12)" fill="none" stroke="currentColor" stroke-width="2.05"/>',
  xsstrike: '<path d="M7.2 7.6L2.8 12l4.4 4.4M16.8 7.6l4.4 4.4-4.4 4.4M13.8 5.4l-3.6 13.2" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>',

  // --- HACK 02: EXPLOIT & NET ---
  msf: '<path d="M4 5L12 2.4 20 5v7.2c0 5-3.4 8.2-8 9.8-4.6-1.6-8-4.8-8-9.8V5z" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linejoin="round"/><path d="M7.8 15.4V8.6l4.2 4 4.2-4v6.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  hydra: '<path d="M12 20v-7.5m0 0L6.6 7m5.4 5.5L17.4 7M12 12.5V4" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"/><circle cx="6.6" cy="5.8" r="2.1" fill="currentColor"/><circle cx="17.4" cy="5.8" r="2.1" fill="currentColor"/><circle cx="12" cy="3.8" r="2.1" fill="currentColor"/>',
  john: '<circle cx="8.2" cy="12" r="4.4" fill="none" stroke="currentColor" stroke-width="2.25"/><path d="M12.6 12H21.2v3.4m-3.4-3.4v2.8" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>',
  hashcat: '<path d="M8.2 3.5L6 20.5M16.2 3.5L14 20.5M3.5 9h17M3 15h17" stroke="currentColor" stroke-width="2.35" stroke-linecap="round"/>',
  impacket: '<rect x="3" y="5.5" width="7.4" height="13" rx="1.8" fill="currentColor"/><rect x="13.6" y="5.5" width="7.4" height="13" rx="1.8" fill="none" stroke="currentColor" stroke-width="2.15"/><path d="M10.4 9.8h3.2m-3.2 4.4h3.2" stroke="currentColor" stroke-width="2.15"/>',
  lfi: '<path d="M3 6h6.4l2.2 2.2h9.4v10.4a1.6 1.6 0 0 1-1.6 1.6H4.6A1.6 1.6 0 0 1 3 18.6V6z" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linejoin="round"/><path d="M9.2 14.6L12 11.8l2.8 2.8M12 11.8v5.6" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round"/>',
  wireshark: '<path d="M2.5 17.5h19M6.2 17.5C7.4 10 11.2 5.8 17.5 5.2c-1.5 4.4-1.2 8.2 1.3 12.3" fill="currentColor"/><path d="M2.5 17.5h19" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>',
  tcpdump: '<path d="M2.5 12h3.8l2.4-6 3.8 12 2.8-8.2 2 2.2h4.2" fill="none" stroke="currentColor" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round"/>',
  responder: '<circle cx="12" cy="12" r="2.5" fill="currentColor"/><path d="M7 7a7.2 7.2 0 0 0 0 10M17 7a7.2 7.2 0 0 1 0 10M3.8 3.8a11.6 11.6 0 0 0 0 16.4M20.2 3.8a11.6 11.6 0 0 1 0 16.4" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round"/>',
  bettercap: '<polygon points="12,3.4 20.4,8.2 20.4,15.8 12,20.6 3.6,15.8 3.6,8.2" fill="none" stroke="currentColor" stroke-width="2.15"/><circle cx="12" cy="12" r="3.6" fill="currentColor"/>',
  aircrack: '<path d="M3 9.2a12.8 12.8 0 0 1 18 0M6.2 12.8a8.4 8.4 0 0 1 11.6 0M9.4 16.2a4.2 4.2 0 0 1 5.2 0" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"/><circle cx="12" cy="19.4" r="1.8" fill="currentColor"/>',
  whois: '<rect x="3" y="4" width="18" height="16" rx="2.8" fill="none" stroke="currentColor" stroke-width="2.15"/><circle cx="8.8" cy="10.8" r="2.4" fill="currentColor"/><path d="M5.8 16.4c.7-1.8 1.8-2.6 3-2.6s2.3.8 3 2.6M14 9.2h4.2M14 13h3.2" fill="none" stroke="currentColor" stroke-width="2.05" stroke-linecap="round"/>',

  // --- HACK 03: RE & LABS ---
  ghidra: '<path d="M5 19c0-7 3.5-12.6 10-14l-1.8 3.8 5.4 1.3-3.5 4 4.1 1.7C16.2 18.2 12.6 19 5 19z" fill="currentColor"/>',
  radare2: '<rect x="3.4" y="3.4" width="17.2" height="17.2" rx="2.8" fill="none" stroke="currentColor" stroke-width="2.15"/><path d="M7.6 15.4V8.6H11a2.1 2.1 0 0 1 0 4.2H7.6m2.4 0l2 2.6m2.4-6.8h3a1.7 1.7 0 0 1 0 3.4h-3v3.4h3.4" fill="none" stroke="currentColor" stroke-width="2.05" stroke-linecap="round" stroke-linejoin="round"/>',
  gdb: '<circle cx="12" cy="12.6" r="5.8" fill="currentColor"/><path d="M9.4 7L7.6 4m7 3L16.4 4M3.5 11h3m11 0h3M4 15.8l2.5-1.2m11 0l2.5 1.2" stroke="currentColor" stroke-width="2.15" stroke-linecap="round"/>',
  volatility: '<rect x="6.2" y="6.2" width="11.6" height="11.6" rx="2.2" fill="currentColor"/><path d="M9 2.8v3.4m6-3.4v3.4M9 17.8v3.4m6-3.4v3.4M2.8 9h3.4m-3.4 6h3.4M17.8 9h3.4m-3.4 6h3.4" stroke="currentColor" stroke-width="2.15" stroke-linecap="round"/>',
  autopsy: '<path d="M14.6 4l5.4 5.4L9.4 20H4v-5.4L14.6 4zM12 6.6l5.4 5.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>',
  maltego: '<circle cx="12" cy="5.5" r="2.8" fill="currentColor"/><circle cx="6" cy="17" r="2.8" fill="currentColor"/><circle cx="18" cy="17" r="2.8" fill="currentColor"/><path d="M12 5.5L6 17h12z" fill="none" stroke="currentColor" stroke-width="2.1"/>',
  kali: '<path d="M4 8.2c3.8-4.2 8.8-5.2 14.4-2.8-3.4 1.3-5.8 3-6.8 5.2 3-.6 5.8 0 8.2 2-3.8.2-6.6 1.5-8.4 3.8 2 1.3 4 1.7 6.4 1.5-4.5 2.6-9 2.4-12-1.3-.9-2.4-.2-5 2-6.6-1.5-.4-2.8-1-3.8-1.8z" fill="currentColor"/>',
  parrot: '<path d="M14.8 3.4L5.6 13.6l6 1.6-2.2 5.4 9.6-10.2-6-1.6z" fill="currentColor"/>',
  htb: '<polygon points="12,2.2 20.8,7.2 20.8,16.8 12,21.8 3.2,16.8 3.2,7.2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M3.2 7.2L12 12l8.8-4.8M12 12v9.8" fill="none" stroke="currentColor" stroke-width="2.05"/>',
  thm: '<path d="M6.6 17.5h11.2a3.6 3.6 0 0 0 .4-7.2 5.2 5.2 0 0 0-10-1.3A4.1 4.1 0 0 0 3 13.2a4.3 4.3 0 0 0 3.6 4.3z" fill="none" stroke="currentColor" stroke-width="2.15"/><path d="M9.6 12.6l2.2 2.2 3.8-3.8" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round"/>',
  h1: '<path d="M7.2 4v16M14.8 4v16M7.2 12h7.6M14.8 4l3.4 2.8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  bugcrowd: '<polygon points="12,2.4 20.6,7.3 20.6,16.7 12,21.6 3.4,16.7 3.4,7.3" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="12" r="3.8" fill="currentColor"/>',

  default: '<rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="2.15"/><path d="M9 9h6v6H9z" fill="currentColor"/>',
};

function iconFor(id) {
  return ICONS[id] || ICONS.default;
}

const SAMUBIN_KEYS = [
  { key: "s", label: "S", role: "Sequence 01 // S — Press S-A-M-U-B-I-N in any stack to run live DOM cipher decryption" },
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

  let activeLayerIdx = 0;
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
      const w = rig.clientWidth || 780;
      const leftAnchorX = w * 0.24;
      const rightAnchorX = w * 0.76;
      const topY = 0;
      const baseDrop = 44 + y;
      const leftPortX = leftAnchorX + x - Math.sin(ang) * 16;
      const leftPortY = baseDrop - Math.sin(ang) * 90;
      const rightPortX = rightAnchorX + x - Math.sin(ang) * 16;
      const rightPortY = baseDrop + Math.sin(ang) * 90;

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
      const dx = Math.max(-56, Math.min(56, e.clientX - startX));
      const dy = Math.max(-16, Math.min(48, e.clientY - startY));
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

  function buildTechCapRow(items, layerMod, isHack, rowIdx, isFlipping) {
    const rowEl = document.createElement("div");
    rowEl.className = "kb-caps kb-caps--tech";
    if (isFlipping && !reduceMotion) {
      rowEl.classList.add("is-flipping");
      setTimeout(() => sound.play("flip"), rowIdx * 55);
      setTimeout(() => rowEl.classList.remove("is-flipping"), 500 + rowIdx * 55);
    }

    items.forEach((item, cIdx) => {
      const detailText = item.detail || "";
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
          const colRatio = (cIdx - (items.length - 1) / 2) / 3;
          impulseKeyboard(colRatio, 3.0);
        }
        const tierName =
          item.tier === "daily" ? "Daily Driver" : item.tier === "proficient" ? "Proficient" : "Familiar";
        const prefix = isHack ? `ARSENAL // ${layerMod}` : `LOADOUT // ${layerMod}`;
        typeOled(`${item.name} · ${tierName} · ${detailText}`, prefix);
      };

      cap.addEventListener("pointerenter", () => inspect(false));
      cap.addEventListener("focus", () => inspect(false));
      cap.addEventListener("click", () => inspect(true));

      rowEl.appendChild(cap);
    });

    return rowEl;
  }

  function buildSamubinCapRow(layerMod, isFlipping) {
    const rowEl = document.createElement("div");
    rowEl.className = "kb-caps kb-caps--sam";
    if (isFlipping && !reduceMotion) {
      rowEl.classList.add("is-flipping");
      setTimeout(() => rowEl.classList.remove("is-flipping"), 520);
    }

    SAMUBIN_KEYS.forEach((item, idx) => {
      const cap = document.createElement("button");
      cap.type = "button";
      cap.className = `kb-cap kb-cap--sam ${item.key === "lock" ? "kb-cap--mode" : ""}`;
      cap.dataset.samKey = item.key;
      cap.dataset.tip = item.key === "lock" ? "Flip Mode [H]" : `Key ${item.label} · SAMUBIN`;
      cap.setAttribute("aria-label", item.role);
      cap.innerHTML = `<span class="kb-sam-char">${item.label}</span>`;

      const inspect = () => {
        typeOled(item.role, `${layerMod} // SAM-08`);
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

      rowEl.appendChild(cap);
    });

    return rowEl;
  }

  function renderBoard(mode, { flipping = false, layerIndex = activeLayerIdx } = {}) {
    const modeData = data[mode] || data.dev;
    const isHack = mode === "hack";
    const layers = modeData.layers || [];
    if (!layers.length) return;

    activeLayerIdx = Math.max(0, Math.min(layers.length - 1, layerIndex));
    const currentLayer = layers[activeLayerIdx];

    if (titleEl) titleEl.textContent = modeData.title;
    if (subEl) subEl.textContent = modeData.subtitle;

    const firstTool = currentLayer.topRow?.[0];
    const defaultPrefix = isHack ? `ARSENAL // ${currentLayer.mod}` : `LOADOUT // ${currentLayer.mod}`;
    if (firstTool) {
      const tierName =
        firstTool.tier === "daily" ? "Daily Driver" : firstTool.tier === "proficient" ? "Proficient" : "Familiar";
      typeOled(`${firstTool.name} · ${tierName} · ${firstTool.detail}`, defaultPrefix);
    } else {
      typeOled(modeData.defaultOled, defaultPrefix);
    }

    board.innerHTML = "";

    // 1. Left Bank: 3 Merged Stack Selector Buttons
    const leftBank = document.createElement("div");
    leftBank.className = "kb-layer-bank";
    leftBank.setAttribute("role", "tablist");
    leftBank.setAttribute("aria-label", "Merged stack layers");

    layers.forEach((layer, idx) => {
      const isSelected = idx === activeLayerIdx;
      const modBtn = document.createElement("button");
      modBtn.type = "button";
      modBtn.role = "tab";
      modBtn.className = "kb-mod";
      modBtn.dataset.layerId = layer.id;
      modBtn.setAttribute("aria-selected", String(isSelected));
      modBtn.setAttribute("aria-pressed", String(isSelected));
      modBtn.setAttribute("aria-label", `Switch keyboard to ${layer.mod} — ${layer.label}`);
      modBtn.innerHTML = `
        <span class="kb-mod-top">
          <span class="kb-mod-led" aria-hidden="true"></span>
          <span class="kb-mod-code">${layer.code}</span>
        </span>
        <span class="kb-mod-sub">${layer.label}</span>
      `;
      modBtn.addEventListener("click", () => {
        if (activeLayerIdx === idx) {
          sound.play("down");
          setTimeout(() => sound.play("up"), 65);
          impulseKeyboard(-0.7, 2.4);
          return;
        }
        sound.play("down");
        setTimeout(() => sound.play("up"), 75);
        impulseKeyboard(-0.85, 3.6);
        renderBoard(getMode(), { flipping: true, layerIndex: idx });
      });
      leftBank.appendChild(modBtn);
    });

    // 2. Right Matrix: 3 Compact Rows (Row 1: 6 Tech Icons, Row 2: S-A-M-U-B-I-N + ⇄, Row 3: 6 Tech Icons)
    const rightMatrix = document.createElement("div");
    rightMatrix.className = "kb-matrix";

    rightMatrix.appendChild(buildTechCapRow(currentLayer.topRow || [], currentLayer.mod, isHack, 0, flipping));
    rightMatrix.appendChild(buildSamubinCapRow(currentLayer.mod, flipping));
    rightMatrix.appendChild(buildTechCapRow(currentLayer.bottomRow || [], currentLayer.mod, isHack, 2, flipping));

    board.appendChild(leftBank);
    board.appendChild(rightMatrix);

    const firstCap = rightMatrix.querySelector(".kb-cap--icon");
    if (firstCap) firstCap.setAttribute("aria-pressed", "true");
    requestAnimationFrame(drawHanging);
  }

  // Real physical keyboard integration:
  // Typing S-A-M-U-B-I-N depresses the embedded SAMUBIN keycaps in the active stack;
  // pressing 1/2/3 switches stack layers; typing any letter highlights matching tech keycap!
  addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = e.target?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) return;
    const ch = (e.key || "").toLowerCase();
    if (!/^[a-z0-9]$/.test(ch) || ch === "h") return;

    const r = section.getBoundingClientRect();
    if (r.bottom < -100 || r.top > innerHeight + 100) return;

    if (ch === "1" || ch === "2" || ch === "3") {
      const targetIdx = Number(ch) - 1;
      if (targetIdx !== activeLayerIdx) {
        sound.play("down");
        impulseKeyboard(-0.7, 3.2);
        renderBoard(getMode(), { flipping: true, layerIndex: targetIdx });
      }
      return;
    }

    // 1. Depress embedded S-A-M-U-B-I-N key if it matches
    const samCap = board.querySelector(`.kb-cap--sam[data-sam-key="${ch}"]`);
    if (samCap) {
      samCap.classList.add("is-down");
      setTimeout(() => samCap.classList.remove("is-down"), 145);
      impulseKeyboard(0, 2.6);
    }

    // 2. Highlight matching tech icon keycap in active stack
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
    impulseKeyboard(0, 5.2);
  });

  renderBoard(getMode(), { flipping: false, layerIndex: 0 });
  if (!reduceMotion) {
    vy = -3.2;
    ang = 0.016;
    raf = requestAnimationFrame(stepPhysics);
  }
}
