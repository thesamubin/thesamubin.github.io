# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML + CSS + vanilla JS, no build step (user decision). Runs unchanged on GitHub Pages (`thesamubin.github.io`) and Cloudflare Pages. `samubin.com` is reserved for a future Next.js/Node site; this site uses `https://thesamubin.github.io/` as canonical.

## Users

- Engineering managers, founders, AI/full-stack leads, and security teams evaluating Sakib Alam Mubin (SA Mubin) across his dual disciplines: Full-Stack AI Engineering and Ethical Hacking / Cybersecurity.
- Visitors arriving from GitHub or social profiles who expect memorable, tactile interaction design and genuine engineering depth.
- Search engines indexing the authoritative entity page for "Sakib Alam Mubin" and "SA Mubin".

## Product Purpose

The dual-mode ("Morph") personal portfolio of Sakib Alam Mubin (SA Mubin). One site, two complete identities controlled by pulling the character avatar's hoodie up or down:
1. **Developer Mode (default — Hoodie Down):** "Full-Stack AI Engineer & Developer" set in a bright, precision **Anodized Aluminium Lab** (`#E4E2DD` / `#F4F3EF` ground, `#16171A` ink, `#FF5A1F` signal orange accent).
2. **Hacker Mode (Hoodie Up):** "Cybersecurity Specialist · Ethical Hacker" set in an atmospheric **Photographic Darkroom** (`#0B0708` / `#160D0E` ground, `#E9DCD8` warm bone ink, `#E0352B` safelight red + `#C98A3A` dim amber, with a cursor-tracked red safelight torch).

## Positioning

One engineer operating across both sides of the stack: building intelligent full-stack web & AI systems by day, and breaking unsafe assumptions, auditing applications, and teaching practical ethical hacking by night.

## Capabilities and Constraints

- 4 main multi-page routes: Home (`/`), Work (`/work/`), About (`/about/`), Contact (`/contact/`), plus `404.html` (and standalone `/keypad/` and `/avatar/` demos). Mode persists across pages in `localStorage` with an inline `<head>` script for zero flash, plus `#dev` / `#hack` hash support and a header mode switch on every page. No `⌘K` command palette. No blog. English only.
- **Teenage Cartoon Character Avatar with Rive State-Machine Adapter:** Articulated upper-body character sitting with a laptop, featuring smooth cursor-tracking head/eyes/torso (`lookX`, `lookY`), active laptop typing (`typing`), hand wave (`wave`), face boop (`boop`), celebration (`celebrate`), and physical two-handed hoodie pull (`hoodUp`) that triggers the site-wide "Lights Out" morph choreography. Built on a drop-in Rive state-machine adapter (`assets/js/avatar.js` + `assets/avatar/RIVE-SPEC.md`).
- **Hanging S-A-M-U-B-I-N Hardware Keypad:** Suspended on a damped Hooke's-law spring cable directly beneath the Hero section, synced with physical keyboard presses.
- **Global Mechanical Keyboard Acoustics & `samubin` Scramble:** Pressing any key anywhere on the site (outside form inputs) plays a synthesized mechanical switch sound (`Thock`, `Clicky`, `Synth`). Typing `samubin` in sequence scrambles visible page text into ciphertext and decrypts it back while triggering avatar celebration and keypad verification.
- **Signature "Loadout / Arsenal" Split-Flap Mechanical Keyboard Board:** Custom keyboard enclosure with an OLED telemetry strip and left-hand modifier keys (`LANG`, `FRAME`, `AI/ML`, `DATA`, `OS`, `SHIP` in Dev mode; `RECON`, `WEB`, `EXPL`, `NET`, `RE/FR`, `OPS` in Hack mode). Keycaps drop in row-by-row on scroll, depress with physical travel to print telemetry on the OLED readout, support real keyboard letter-jump, filter by modifier row, and flip 180° row-by-row on their X-axis when morphing between Developer Stack and Hacker Arsenal.
- **Upside-Down Footer Peeker:** Hangs across the curved footer wave seam on every main page, sliding down with laughing eyes and mode-aware notes on hover or click.

## Brand Commitments

- Names: **Sakib Alam Mubin** and **SA Mubin** only. Never use standalone "Mubin" or "Syed".
- Never display an awkward visible "also known as SA Mubin, Sakib Alam Mubin, samubin, thesamubin" SEO dump in prominent copy.
- Social handles **`samubin`** and **`thesamubin`** appear naturally only in social/profile contexts (Footer, Contact channels, metadata).
- Zero AI clichés: no Matrix code rain, no neon-green-on-black terminal costumes, no purple-blue floating gradient orbs, no glassmorphism cards, no logo marquee strips, no fake traffic-light terminal chrome.

## Evidence on Hand

- Open-source GitHub profile: `https://github.com/thesamubin`
- Teaching labs: Interactive XSS Simulator (`https://thesamubin.github.io/interactive-xss-simulator/`) and LFI Simulator (`https://thesamubin.github.io/LFI-Simulator/`).
- Email: `hello@samubin.com`.
- Placeholders clearly structured in `data/loadout.json` and page templates so real metrics, certs, and writeups can be swapped cleanly without fabricating claims.

## Product Principles

1. Two authentic worlds ("Aluminium Lab" for Developer, "Safelight Darkroom" for Ethical Hacker) joined by one physical hardware vocabulary and one character avatar.
2. Every interaction has physical weight, sound, and purpose: hoodie mode switch, split-flap Loadout/Arsenal keyboard, hanging S-A-M-U-B-I-N macropad, and cursor safelight torch.
3. Accessible and fast by default: WCAG AA contrast in both modes, keyboard operable, `prefers-reduced-motion` instant swap without flicker/torch hiding content, persistent mute toggle.
