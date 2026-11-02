---
name: Sakib Alam Mubin Portfolio
description: Tactile Security Lab — Anodized aluminium, bone PBT keycaps, and live client-side vulnerability sandboxes.
colors:
  ground-dark: "#111215"
  ground-dark-surface: "#17191d"
  ground-dark-card: "#1f2227"
  line-dark: "#2b2e35"
  ink-light: "#ece8df"
  ink-light-muted: "#b1ada5"
  ground-bone: "#e6e0d2"
  ground-bone-surface: "#d8d1c0"
  bone-side: "#b9b19e"
  ink-bone: "#1a1a1c"
  ink-bone-muted: "#4a4740"
  accent-signal: "#ff5a1f"
  accent-signal-deep: "#b8380c"
  accent-signal-ink: "#1a0d06"
  accent-auth: "#4ade80"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.8rem, 7.5vw, 6rem)"
    fontWeight: 820
    lineHeight: 0.92
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.6vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.35rem, 2.2vw, 1.75rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.85rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.05em"
rounded:
  sm: "7px"
  md: "11px"
  lg: "16px"
  pill: "999px"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2.5rem"
  xl: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.accent-signal}"
    textColor: "{colors.accent-signal-ink}"
    rounded: "{rounded.md}"
    padding: "0.7rem 1.3rem 1rem"
  button-primary-hover:
    backgroundColor: "{colors.accent-signal}"
    textColor: "{colors.accent-signal-ink}"
  button-slate:
    backgroundColor: "#3d414a"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.md}"
    padding: "0.7rem 1.3rem 1rem"
---

# Design System: Sakib Alam Mubin Portfolio

## Overview

**Creative North Star: "Tactile Security Lab"**

The visual world of Sakib Alam Mubin treats the screen as a physical hardware security workbench rather than an abstract SaaS landing page. It refuses the tired "hacker" clichés of green matrix rain, dark hoodies, and neon wireframes, grounding itself instead in authentic engineering materials: anodized graphite aluminium plates, weighted bone-white PBT keycap plastic, and safety-orange status accents.

The interface lives and reacts physically: buttons possess tangible mechanical travel, synthesized Web Audio thocks provide acoustic feedback without downloading audio assets, untrusted input parameters execute in live client-side sandboxes, and a skittish pixel bug perches across structural ledges.

**Key Characteristics:**
- **Material Ground Alternation:** High-contrast alternating bands of deep anodized graphite (`#111215`) and warm matte PBT plastic (`#E6E0D2`).
- **Tactile Keycap Controls:** Deep interactive travel, spring rebound, and multi-tone Web Audio acoustic feedback on click.
- **Hardware Authenticity:** Continuous cord specular, machined bulkheads, and FIDO2 status LEDs.
- **Strict Typographic Roles:** High-impact variable Archivo for all editorial copy; JetBrains Mono strictly reserved for security toys, headers, and terminal commands.

## Colors

The palette derives from physical lab equipment: industrial graphite enclosures, unbleached polymer plastic, and high-visibility danger markers.

### Primary
- **Safety Signal Orange** (`#FF5A1F`): Used strictly for primary calls-to-action, keycaps, interactive alerts, and verification accents. Accompanied by `#B8380C` shadow depth and `#1A0D06` high-contrast ink.

### Secondary
- **FIDO Auth Green** (`#4ADE80`): Reserved exclusively for verified states, live sandbox status, successful cipher checks, and cryptographic passes.

### Neutral
- **Graphite Aluminium** (`#111215`, `#17191D`, `#1F2227`): Deep anodized dark surfaces with `#2B2E35` hairline structural dividers.
- **Bone PBT Plastic** (`#E6E0D2`, `#D8D1C0`, `#B9B19E`): Warm polymer grounds, cards, and keycap chassis.
- **Light Plate Ink** (`#ECE8DF`, `#B1ADA5`): Primary and muted text on dark aluminium surfaces.
- **Dark Polymer Ink** (`#1A1A1C`, `#4A4740`): Primary and muted text on bone surfaces.

### Named Rules
**The Strict Semantic Bevel Rule.** Depressed bottom-lip shadow bevels (`inset 0 -3px/-5px/-6px 0`) are granted exclusively to interactive keys, caps, and switches that depress on press. Static cards, tags, and status containers remain flat or softly elevated to preserve true affordance clarity.

**The Reserved Mono Rule.** `JetBrains Mono` is permitted only in code sandboxes, simulated file paths, HTTP headers, and the `⌘K` command terminal. All human communication (bios, stories, titles, contact forms) stays in `Archivo`.

## Typography

**Display Font:** Archivo Variable (Latin subset, self-hosted `.woff2`)
**Body Font:** Archivo Variable (Latin subset, self-hosted `.woff2`)
**Label/Mono Font:** JetBrains Mono (Latin subset, self-hosted `.woff2`)

**Character:** Technical and authoritative yet deeply human: Archivo stretches up to 125% width at 820 weight for monumental, engraved display titles, relaxing to 100% width and 400 weight for effortless readability in body prose.

### Hierarchy
- **Display** (820 weight, `clamp(2.8rem, 7.5vw, 6rem)`, line-height 0.92, tracking -0.04em): Hero name and major section entries.
- **Headline** (800 weight, `clamp(2rem, 4.6vw, 3.5rem)`, line-height 1.02, tracking -0.025em): Page section titles.
- **Title** (700 weight, `clamp(1.35rem, 2.2vw, 1.75rem)`, line-height 1.15): Project cards and lab bench headings.
- **Body** (400–600 weight, `1.0625rem`, line-height 1.6, max line length 68ch): Prose narratives and technical descriptions.
- **Label / Code** (500–700 weight, `0.85rem`, tracking 0.05em): Terminal outputs, payload inputs, and HTTP header policies.

## Layout

12-column responsive layout constrained to a maximum width of `1240px` with fluid gutters `clamp(1.25rem, 4vw, 3rem)`. Sections maintain a generous vertical rhythm of `clamp(4.5rem, 11vw, 8.5rem)` padding, strictly alternating between dark graphite fields and bone polymer fields.

## Elevation & Depth

Surfaces combine physical keycap drop-shadows with subtle ambient occlusion:
- **Resting Keycap:** `inset 0 1px 0 rgba(255,255,255,.55), inset 0 -5px 0 var(--cap-side), 0 7px 14px -6px rgba(0,0,0,.65)`
- **Depressed Keycap:** `translateY(3px)` with `inset 0 -2px 0 var(--cap-side), 0 2px 4px -2px rgba(0,0,0,.6)`
- **Bench Enclosure:** `box-shadow: 0 0 0 1px var(--line), 0 30px 60px -30px rgba(0,0,0,.8)`
- **Command Palette:** `box-shadow: 0 0 0 1px var(--line), 0 40px 80px -20px rgba(0,0,0,.9)`

## Shapes

- Keycaps feature a rounded rectangular radius of `11px` (desktop) and `9px` (compact).
- Lab enclosures and dialogs maintain a structured `16px` radius.
- Switches feature full pill curvature (`999px`).

## Components

### Keycap Buttons (`.key`)
- **Primary (`.key--accent`):** Safety orange `#FF5A1F` body, `#B8380C` bottom lip, `#1A0D06` text.
- **Secondary (`.key`):** Bone `#E6E0D2` body, `#B9B19E` bottom lip, `#1A1A1C` text.
- **Slate (`.key--slate`):** Dark slate `#3D414A` body, `#262930` bottom lip, `#ECE8DF` text.
- **Travel:** 3px mechanical downward displacement on `:active` and keyboard activation.

### Hardware Security Keypad (`.pad`)
- An 8-key spring-physics keypad dangling from a continuous specular cable anchored to a top ceiling bulkhead.
- Features draggable physics, per-key acoustic thocks, auth LED status flashes, and interactive typing detection (`M-U-B-I-N`).

### Live Lab Benches (`.bench`)
- Client-side security testbeds featuring real-time input reflection, payload sanitization analyzers, and directory traversal path resolver jails.

### Command Terminal (`#palette`)
- Clean keyboard-driven command palette (`Ctrl+K` or `/`) featuring commands like `whoami`, `ls work`, `cat about`, `sudo hire mubin`, and `encrypt`.

## Do's and Don'ts

### Do:
- **Do** maintain the strict alternating rhythm of Dark Aluminium (`#111215`) and Bone Polymer (`#E6E0D2`) fields across every page.
- **Do** preserve the physical travel and Web Audio click feedback on all newly added button-like controls.
- **Do** keep `Sakib Alam Mubin` and short name `SA Mubin` verbatim in all entity tags, titles, and headers for search engine authority.
- **Do** ensure all text inputs maintain `::placeholder` contrast `>= 4.5:1` against their container backgrounds.

### Don't:
- **Don't** use `JetBrains Mono` for conversational copy, stories, or contact forms; keep it strictly in terminals and code blocks.
- **Don't** add bevels or bottom-lip shadows to static, non-interactive containers.
- **Don't** introduce generic AI slop: no glowing zero-offset halos, no repeating CSS stripes, and no bouncy cartoon easings.
- **Don't** claim or reference `samubin.com` as canonical on this static deployment; preserve `https://thesamubin.github.io/` until the full Next.js site arrives.

