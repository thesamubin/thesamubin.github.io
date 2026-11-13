---
name: Sakib Alam Mubin (SA Mubin) Dual-Mode Portfolio
description: Hardware-engineering workbench (D1 Aluminium Lab) that transforms into a red-team safelight darkroom (H1 Safelight Darkroom) on hoodie pull.
colors:
  dev-ground: "#dfe2e6"
  dev-ground-alt: "#d5d9df"
  dev-surface: "#f2f4f7"
  dev-surface-inset: "#e6e9ef"
  dev-ink: "#16171a"
  dev-ink-secondary: "#363940"
  dev-ink-muted: "#525660"
  dev-line: "#bfc5cf"
  dev-line-strong: "#9fa7b3"
  dev-signal-accent: "#ff5a1f"
  dev-signal-side: "#b8380c"
  dev-signal-ink: "#1a0d06"
  dev-signal-text: "#b33205"
  hack-ground: "#0b0708"
  hack-ground-alt: "#110a0c"
  hack-surface: "#160d0e"
  hack-surface-inset: "#1e1214"
  hack-ink: "#e9dcd8"
  hack-ink-secondary: "#ccb8b2"
  hack-ink-muted: "#a89089"
  hack-line: "#2e1b1e"
  hack-line-strong: "#46262a"
  hack-safelight-accent: "#c42018"
  hack-safelight-side: "#7f130d"
  hack-safelight-ink: "#fff8f7"
  hack-safelight-text: "#ff6e63"
  oled-ground: "#141619"
  oled-amber: "#f4a83a"
  oled-hack-ground: "#080405"
  oled-hack-phosphor: "#ff5e52"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.55rem, 4.8vw, 4.35rem)"
    fontWeight: 820
    lineHeight: 0.96
    letterSpacing: "-0.038em"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.85rem, 3.6vw, 2.95rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 2vw, 1.6rem)"
    fontWeight: 800
    lineHeight: 1.16
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  xs: "5px"
  sm: "8px"
  md: "11px"
  lg: "14px"
  xl: "20px"
  stage: "26px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "28px"
  xl: "44px"
  section: "72px"
components:
  button-primary:
    backgroundColor: "{colors.dev-signal-accent}"
    textColor: "{colors.dev-signal-ink}"
    rounded: "{rounded.md}"
    padding: "11px 20px 15px"
  button-hack-primary:
    backgroundColor: "{colors.hack-safelight-accent}"
    textColor: "{colors.hack-safelight-ink}"
    rounded: "{rounded.md}"
    padding: "11px 20px 15px"
  button-secondary:
    backgroundColor: "{colors.dev-surface}"
    textColor: "{colors.dev-ink}"
    rounded: "{rounded.md}"
    padding: "11px 20px 15px"
  chip-active:
    backgroundColor: "{colors.hack-safelight-accent}"
    textColor: "{colors.hack-safelight-ink}"
    rounded: "{rounded.sm}"
    padding: "7px 13px"
  card-enclosure:
    backgroundColor: "{colors.dev-surface}"
    textColor: "{colors.dev-ink}"
    rounded: "{rounded.xl}"
    padding: "16px"
  input-field:
    backgroundColor: "{colors.dev-ground}"
    textColor: "{colors.dev-ink}"
    rounded: "9px"
    padding: "12px 15px"
---

# Design System: Sakib Alam Mubin (SA Mubin) Dual-Mode Portfolio

## Overview

**Creative North Star: "Aluminium Lab ⇄ Safelight Darkroom"**

This design system treats the portfolio of Sakib Alam Mubin (SA Mubin) as a single physical hardware-engineering workbench (`html[data-mode="dev"]`) that transforms into a red-team photographic safelight darkroom (`html[data-mode="hack"]`) when the visitor switches profiles. Inspired by Teenage Engineering's machined anodized aluminium, Panic/Playdate's tactile whimsy, and Linear/Rauno Freiberg's 60fps spring-damper physics, every control feels weighted, acoustic, and responsive.

The interface rejects generic "cyber hacker" clichés (Matrix green rain, glowing cyber-skulls, blue/purple SaaS gradient blobs, glassmorphism card stacks, infinite logo marquees, and eyebrow/kicker labels above headings) in favor of honest hardware surfaces, synthesized Web Audio switches, and crisp typographic contrast across both rooms.

**Key Characteristics:**
- Dual-mode architectural morph between D1 Aluminium Lab and H1 Safelight Darkroom persisted cleanly via `localStorage` and `#dev`/`#hack` URL fragments.
- Expressive articulated 2.5D character avatar and upside-down footer peeker built on a Rive-compatible state machine with cursor gaze tracking and two-handed hoodie pull.
- Tactile 3D sculpted Loadout/Arsenal keyboard and suspended Hooke's-law S-A-M-U-B-I-N keypad synced with synthesized Web Audio switch acoustics (`Thock`, `Clicky`, `Synth`).
- Variable width-axis typography (`Archivo`) that relaxes into an expanded industrial stance in Developer mode and tightens into a condensed tactical stance in Hacker mode.

## Colors

Each mode owns a complete, high-contrast physical palette where structural surfaces stay calm and signal accents earn attention through restraint and WCAG AA legibility.

### Primary
- **Safety Signal Orange** (`dev-signal-accent`): Drives primary action keycaps, active mode toggles, status LEDs, and focus outlines in Developer mode, paired exclusively with deep espresso ink (`dev-signal-ink`) for crisp readability on light-to-mid orange fills.
- **Signal Deep Lip & Prose Accent** (`dev-signal-side`, `dev-signal-text`): `dev-signal-side` anchors the 3D bottom bevel on orange keycaps; `dev-signal-text` provides WCAG AA high-contrast orange typography on aluminium grounds and studio surfaces.
- **Safelight Crimson** (`hack-safelight-accent`): Powers active darkroom switches, accent keycaps, selected scope chips, and focus rings in Hacker mode, paired with warm safelight white (`hack-safelight-ink`) to maintain ≥ 4.9:1 contrast across gradients and solid pills.
- **Darkroom Deep Lip & Phosphor Text** (`hack-safelight-side`, `hack-safelight-text`): `hack-safelight-side` grounds 3D keycap bevels in the darkroom; `hack-safelight-text` renders readable crimson-coral headings and role badges over obsidian trays.

### Secondary
- **OLED Carbon & Amber Telemetry** (`oled-ground`, `oled-amber`): Embedded instrument viewports and frequency readouts inside Developer cards use warm amber phosphor over matte carbon glass.
- **Darkroom OLED Phosphor** (`oled-hack-ground`, `oled-hack-phosphor`): Hacker-mode hardware viewports and toast readouts shift to alert safelight phosphor over near-black obsidian glass.

### Neutral
- **Anodized Aluminium Grounds** (`dev-ground`, `dev-ground-alt`, `dev-surface`, `dev-surface-inset`): Full-bleed bands alternate between bead-blasted silver-aluminium (`dev-ground`) and recessed chassis bands (`dev-ground-alt`), elevating instrument enclosures (`dev-surface`) and inset panes (`dev-surface-inset`) framed by machined hairlines (`dev-line`, `dev-line-strong`) and carbon-ink prose (`dev-ink`, `dev-ink-secondary`, `dev-ink-muted`).
- **Darkroom Obsidian Grounds** (`hack-ground`, `hack-ground-alt`, `hack-surface`, `hack-surface-inset`): Full-bleed darkroom bands step subtly from carbon-crimson black (`hack-ground`) and deep trays (`hack-ground-alt`) into dark instrument bays (`hack-surface`, `hack-surface-inset`) divided by burgundy hairlines (`hack-line`, `hack-line-strong`) with silver-gelatin bone inks (`hack-ink`, `hack-ink-secondary`, `hack-ink-muted`).

### Named Rules
**The Safelight Torch Rule.** In Hacker mode, a radial CSS safelight spotlight (`560px` circle tracking `--torch-x` / `--torch-y`) subtly illuminates darkroom surfaces while keeping all body copy legible at WCAG AA contrast without requiring pointer hover and disabling the overlay under `prefers-reduced-motion: reduce`.

**The Reserved Mono Rule.** `JetBrains Mono` (`tabular-nums`) stays strictly inside OLED telemetry readouts, keycap legends, `<kbd>` shortcuts, and metadata tags (`>= 11px` floor across viewports) rather than decorative body prose or headings.

## Typography

**Display Font:** `Archivo` variable (`font-weight: 800–820`, `font-stretch: 62%–125%`, self-hosted WOFF2)
**Body Font:** `Archivo` variable (`font-weight: 400–760`, self-hosted WOFF2)
**Label/Mono Font:** `JetBrains Mono` (`font-weight: 400–700`, `tabular-nums`, self-hosted WOFF2)

**Character:** A single multi-axis variable grotesque bridges editorial readability with industrial instrument precision. In Developer mode it expands (`--stretch-display: 118%`, `--stretch-head: 112%`, `--stretch-title: 106%`); in Hacker mode it compresses (`--stretch-display: 84%`, `--stretch-head: 88%`, `--stretch-title: 92%`) to signal a physical shift in room tension.

### Hierarchy
- **Display** (`820`, `clamp(2.55rem, 4.8vw, 4.35rem)`, `0.96` line-height): Hero name and top-level page headers with `-0.038em` tracking and `text-wrap: balance`.
- **Headline** (`800`, `clamp(1.85rem, 3.6vw, 2.95rem)`, `1.04` line-height): Major section titles across alternating workbench bands (`-0.025em` tracking).
- **Title** (`800`, `clamp(1.25rem, 2vw, 1.6rem)`, `1.16` line-height): Card titles, index row titles, and split-pane headings (`-0.015em` tracking).
- **Body** (`400`, `1rem` / `16px`, `1.6` line-height): Narrative paragraphs capped at `66ch` with `text-wrap: pretty` to eliminate single-word stragglers on desktop and mobile.
- **Label** (`600–700`, `0.75rem–0.875rem`, `tabular-nums`): Monospace switch tags, channel IDs, keyboard shortcuts, and metadata labels (`>= 11.2px` even on compact `360px` phone keycaps).

### Named Rules
**The No-Kicker Rule.** Headings carry their own authority; never place small uppercase eyebrow or kicker labels above `<h1>`, `<h2>`, or `<h3>`.

## Layout

Pages follow an alternating full-bleed band rhythm separated by `1px solid var(--line)` seams. Inside each band, `.wrap` centers content at `max-width: 1200px` with responsive horizontal gutters (`12px` at `<=360px`, `16px` at `<=480px`, `24px` tablet, `40px` at `>=768px`, `48px` at `>=1120px`) while sections own vertical rhythm (`padding-block: 72px` desktop, `46px` at `<=480px`) so header and body rails align flush.

Desktop grids split asymmetrically in the Hero (`1.12fr / 0.96fr`) and cleanly into 2-column enclosures (`.exp-matrix`, `.proj-grid`, `.dispatch-console`, `.split-enclosure`) before stacking to single-column below `900px` (`860px` for inner enclosures). On viewports `<=640px`, the sticky header switches to a 2-row grid with a touch-scrollable horizontal nav rail (`mask-image` edge fade) and `>= 36–38px` interactive targets.

## Elevation & Depth

Depth communicates physical chassis layering rather than floating SaaS blur: outer instrument enclosures combine a crisp `1px solid var(--line)` seam with a controlled directional drop shadow and subtle top-edge specular highlight, while inner panes rely purely on tonal surface shifts (`--surface-2`, `--oled-bg`) and `1px` hairlines.

### Shadow Vocabulary
- **Lab Enclosure** (`box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 22px 44px -20px rgba(22, 23, 26, 0.18), 0 4px 12px -4px rgba(22, 23, 26, 0.08)`): Machined lift for Developer mode hardware benches and project cartridges.
- **Darkroom Enclosure** (`box-shadow: inset 0 1px 0 rgba(255, 190, 180, 0.08), 0 16px 34px -16px rgba(0, 0, 0, 0.84), 0 4px 12px -4px rgba(0, 0, 0, 0.65)`): Compact, tight elevation in Hacker mode tuned to avoid diffuse dark halos.
- **Keycap Resting** (`box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55), inset 0 -5px 0 var(--cap-side), 0 7px 14px -6px rgba(0, 0, 0, 0.35), 0 2px 4px rgba(0, 0, 0, 0.2)`): Physical 5px mechanical keycap skirt at rest.
- **Keycap Depressed** (`box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 -2px 0 var(--cap-side), 0 2px 4px -2px rgba(0, 0, 0, 0.35)`): Active `translateY(3px)` travel state on click or keypress.

### Named Rules
**The Single-Enclosure Rule.** Major interactive benches (`.avatar-stage`, `.kb-shell`, `.exp-matrix`, `.proj-card`, `.ledger-enclosure`, `.dispatch-console`, `.index-enclosure`, `.split-enclosure`) carry at most one outer bordered enclosure; nested OLED wells (`.proj-viewport`, `.exp-ch-Schematic`, `.freq-readout`) sit borderless inside them using tonal contrast and subtle inset shadow.

**The Semantic Keycap Bevel Rule.** Bottom 3D keycap bevels (`inset 0 -4px/-5px 0`) belong exclusively to pressable buttons and switches (`.key`, `.cap`, `.kb-cap`, `.mode-switch`, `.tool`, `.dock-btn`) that physically depress (`translateY(2px–3px)`) on interaction.

## Shapes

Corners step systematically by scale: compact `<kbd>` pills and tags (`5px–6px`), toggle chips and navigation links (`8px–9px`), tactile keycaps and dock switches (`10px–11px`), inset wells (`14px–16px`), instrument enclosures (`20px–22px`), the hero avatar stage (`26px`), and pill badges/toasts (`999px`). The main page closes with a full-bleed SVG wave seam (`footer-seam-wave`) matching `--ground` where the upside-down peeker hangs over the dark footer.

## Components

### Buttons
- **Shape:** Sculpted keycaps (`11px` radius on `.key`, `10px` on `.mode-switch` and `.dock-btn`).
- **Primary:** High-contrast accent fill (`dev-signal-accent` + `dev-signal-ink` in Dev; `#d12820` to `hack-safelight-accent` + `hack-safelight-ink` in Hack) with `0.7rem 1.25rem 0.96rem` padding and a `5px` bottom bevel.
- **Hover / Focus:** Subtle brightness lift (`1.03`), `2px solid var(--accent)` focus-visible ring (`3px` offset), and `translateY(3px)` active depression synced to Web Audio click synthesis.
- **Secondary:** Studio polymer (`--cap-daily-top` to `--cap-daily-bg`) and dark anodized slate (`--cap-prof-top` to `--cap-prof-bg`) variants.

### Chips
- **Style:** Monospace scope chips (`8px` radius, `38px` min height, `1px solid var(--line-strong)`) on `--ground` fill with `--ink-2` text.
- **State:** Selected chips fill with `var(--accent)`, `var(--accent-ink)`, and `border-color: var(--accent)` (meeting >= 4.5:1 AA contrast in both modes).

### Cards / Containers
- **Corner Style:** `20px–22px` outer enclosures wrapping `14px–16px` tonal inset panes (`--surface-2`) or borderless `--oled-bg` viewports.
- **Background:** `--surface` outer container over `--ground` / `--ground-alt` alternating section bands.
- **Shadow Strategy:** Single machined `--shadow-enclosure` paired with `1px solid var(--line)`.
- **Border:** Outer enclosure only; internal panes divide via tonal shift, `1px solid var(--line)` row dividers, or dashed traces.
- **Internal Padding:** `16px` enclosure gutter (tightened to `10px` at `<=480px`) around `26px–28px` panes (`16px 14px` on phones).

### Inputs / Fields
- **Style:** `9px` radius, `1px solid var(--line-strong)`, `var(--ground)` fill, `1rem` `Archivo` body text, and `var(--ink-3)` placeholders.
- **Focus:** `2px solid var(--accent)` focus ring with `3px` offset and `--accent` caret color.

### Navigation
- Sticky translucent-free `--ground` header (`4.35rem` min-height desktop) housing the `SA Mubin` LED emblem, mode-morphing nav links, acoustic profile switch (`Thock` / `Clicky` / `Synth`), Profile Mode Switch, and dual-icon mute button (`.ico-on` / `.ico-off`). Below `640px`, it reflows into a 2-row grid with a touch-scrollable nav strip.

### Signature Interactive Benches
- **Loadout / Arsenal 3D Keyboard (`#loadout`):** One-piece molded SVG chassis suspended by dual USB-C cables (left plug detaches and swings as a single-cable pendulum on strong pull), top layer tabs (`>= 11.2px` mobile floor), 3D sculpted keycaps that flip row-by-row on mode change, and embedded `S-A-M-U-B-I-N` cipher keys.
- **Hanging S-A-M-U-B-I-N Macropad & Avatar Stage:** Spring-cable suspended 4x2 keypad beneath the hero paired with the articulated SVG avatar stage (`[data-avatar]`) and footer peeker (`[data-peeker]`).

## Do's and Don'ts

### Do:
- **Do** use **Sakib Alam Mubin** and **SA Mubin** exclusively in visible copy, metadata, and JSON-LD, keeping `@thesamubin` and `@samubin` naturally scoped to profile links and handles.
- **Do** maintain >= 4.5:1 WCAG AA contrast across all gradient buttons, chips, stack tabs, and form controls in both `dev` and `hack` modes, and keep interactive UI labels >= `11px` across `360px` phone screens.
- **Do** honor `prefers-reduced-motion: reduce` across every spring solver, scramble cipher, avatar rig, and darkroom torch overlay.

### Don't:
- **Don't** use standalone "Mubin", "Syed", or visible SEO alias dumps anywhere on the site.
- **Don't** place kickers/eyebrows above headings, nest bordered cards inside bordered enclosures, or apply `inset 0 -4px/-5px 0` keycap bevels to static badges or containers.
- **Don't** introduce Matrix code rain, neon-green terminal clichés, purple-blue orbs, or glassmorphism overlays.
