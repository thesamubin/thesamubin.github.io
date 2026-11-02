---
name: Sakib Alam Mubin Portfolio
description: Interactive Developer Studio & Tactile Keycaps — Anodized graphite, bone PBT switches, 3D-shaded interactive avatar, and live physics benches.
colors:
  ground-dark: "#111215"
  ground-dark-surface: "#17191d"
  ground-dark-card: "#1f2227"
  line-dark: "#2b2e35"
  ink-light: "#ece8df"
  ink-light-muted: "#b8b4ac"
  ink-light-subtle: "#9a968e"
  ground-bone: "#e6e0d2"
  ground-bone-surface: "#d8d1c0"
  bone-side: "#b9b19e"
  ink-bone: "#1a1a1c"
  ink-bone-muted: "#48453e"
  bone-accent: "#9c2805"
  slate-cap: "#3d414a"
  slate-side: "#252830"
  accent-signal: "#ff5a1f"
  accent-signal-deep: "#b8380c"
  accent-signal-ink: "#1a0d06"
  accent-auth: "#4ade80"
  kinetic-sky: "#38bdf8"
  kinetic-orchid: "#a855f7"
  kinetic-amber: "#facc15"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.65rem, 4.9vw, 4.45rem)"
    fontWeight: 820
    lineHeight: 0.93
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.4vw, 3.4rem)"
    fontWeight: 800
    lineHeight: 1.03
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.35rem, 2.2vw, 1.75rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, Cascadia Code, monospace"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.45
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "11px"
  lg: "18px"
  xl: "28px"
  pill: "999px"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2.5rem"
  xl: "4.75rem"
  xxl: "7.5rem"
components:
  button-primary:
    backgroundColor: "{colors.accent-signal}"
    textColor: "{colors.accent-signal-ink}"
    rounded: "{rounded.md}"
    padding: "0.7rem 1.3rem 1rem"
  button-bone:
    backgroundColor: "{colors.ground-bone}"
    textColor: "{colors.ink-bone}"
    rounded: "{rounded.md}"
    padding: "0.7rem 1.3rem 1rem"
  button-slate:
    backgroundColor: "{colors.slate-cap}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.md}"
    padding: "0.7rem 1.3rem 1rem"
  input-field:
    backgroundColor: "{colors.ground-dark-surface}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.sm}"
    padding: "0.82rem 0.95rem"
  card-enclosure:
    backgroundColor: "{colors.ground-dark-surface}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.lg}"
    padding: "1.5rem 1.6rem"
---

# Design System: Sakib Alam Mubin Portfolio

## Overview

**Creative North Star: "Interactive Developer Studio & Tactile Keycaps"**

The portfolio of Sakib Alam Mubin (SA Mubin) treats the browser as a joyful, physical full-stack developer studio rather than a static résumé or dark "cyber hacker" template. Grounded in machined graphite aluminium (`#111215`) alternating with warm bone PBT keycap fields (`#E6E0D2`), the world invites visitors to poke, drag, type, and listen from the very first viewport.

An original 3D-vinyl-shaded developer avatar of SA Mubin anchors the hero over a 360-degree cursor-reactive capsule-stroke canvas and peeks upside-down across the curved bone-to-graphite footer seam. Controls behave like real desk hardware: keycaps depress with physical travel and selectable synthesized Web Audio switch voices (`Thock`, `Clicky`, `Synth`), UI motion runs on real Hooke's-law spring solvers, and a comedic roving production bug mutters developer one-liners when discovered.

**Key Characteristics:**
- **Alternating Physical Grounds:** Full-bleed sections alternate strictly between warm anodized graphite (`#111215`) and matte bone PBT polymer (`#E6E0D2`).
- **Expressive 3D-Clay Avatar & Footer Peeker:** Custom multi-gradient SVG character rig with cursor-tracking parallax, `Boop` / `Shades` / `Say Hi` states, kinetic stroke wave, and upside-down footer peek.
- **Tactile Switch Acoustics & Physics Toys:** Selectable mechanical switch profiles (`Thock`, `Clicky`, `Synth`), `SAMUBIN` desk macropad, and live 60fps Hooke's-law spring playground with zero external audio or 3D bundle files.
- **Disciplined Typographic Voices:** Stretched variable `Archivo` carries display and human narrative; `JetBrains Mono` stays strictly inside hardware screens, code benches, and the `⌘K` terminal.

## Colors

The palette pairs calm, industrial desk hardware neutrals with safety-orange primary caps and lively multi-hue kinetic strokes reserved for active canvas waveforms and avatar stages.

### Primary
- **Safety Signal Orange** (`#ff5a1f`): Primary keycap CTAs, avatar raglan hoodie accents, active filter chips, and focus outlines, paired with `#b8380c` keycap side depth, `#9c2805` bone-surface emphasis, and `#1a0d06` espresso ink.

### Secondary
- **Verified Green** (`#4ade80`): Live bench indicators, successful macropad chord states, and pipeline readiness badges.

### Tertiary
- **Kinetic Studio Spectrum** (`#38bdf8`, `#a855f7`, `#facc15`): Electric sky, vivid orchid, and warm amber strokes used strictly inside the cursor-reactive avatar wave canvas, procedural audio oscilloscope traces, and playful avatar spark accents.

### Neutral
- **Anodized Graphite Aluminium** (`#111215`, `#17191d`, `#1f2227`): Primary dark grounds, bench enclosures, and recessed tracks divided by `#2b2e35` hairlines.
- **Bone PBT Polymer** (`#e6e0d2`, `#d8d1c0`, `#b9b19e`): Alternating light studio sections, keycap tops, speech bubbles, and the curved footer seam arch.
- **Warm Studio Inks** (`#ece8df`, `#b8b4ac`, `#9a968e` on dark; `#1a1a1c`, `#48453e` on bone): Hue-tinted foregrounds calibrated well above WCAG AA contrast minimums.

### Named Rules
**The Alternating Field Rule.** Full-width page bands alternate between Anodized Graphite (`#111215`) and Bone PBT (`#e6e0d2`), terminating in a curved bone wave seam where SA Mubin peeks upside-down into the dark footer.

**The Kinetic Color Containment Rule.** Multi-hue tertiary colors (`#38bdf8`, `#a855f7`, `#facc15`) live exclusively inside dynamic canvas waveforms, oscilloscope traces, and avatar spark accents—never on static page chrome or typography.

## Typography

**Display Font:** Archivo Variable (Latin subset, self-hosted `.woff2`, stretch `62%–125%`)
**Body Font:** Archivo Variable (Latin subset, self-hosted `.woff2`, stretch `100%`)
**Label/Mono Font:** JetBrains Mono Variable (Latin subset, self-hosted `.woff2`)

**Character:** Monumental and architectural at display sizes—stretching `Archivo` to `125%` width at `820` weight—while settling into warm, unhurried `100%` normal-width proportions for long-form engineering copy.

### Hierarchy
- **Display** (820 weight, 125% stretch, `clamp(2.65rem, 4.9vw, 4.45rem)`, line-height 0.93, tracking `-0.04em`): Hero name and primary page headers (`<= 6rem` ceiling).
- **Headline** (800 weight, 118% stretch, `clamp(2rem, 4.4vw, 3.4rem)`, line-height 1.03, tracking `-0.025em`): Section headings without kickers or eyebrows above them.
- **Title** (800 weight, 110%–120% stretch, `clamp(1.35rem, 2.2vw, 1.75rem)`, line-height 1.08, tracking `-0.015em`): Project cards, craft switcher panels, and split-row subheadings.
- **Body** (400–600 weight, `1.0625rem`, line-height 1.6, measure `66ch` max): Engineering narratives, descriptions, and form inputs.
- **Label / Code** (600 weight, `0.8125rem` minimum, `tabular-nums`): OLED macropad readout, spring physics solver telemetry, middleware code panes, and `⌘K` palette commands.

### Named Rules
**The Reserved Mono Rule.** `JetBrains Mono` appears strictly inside code panes, hardware telemetry readouts, keyboard `<kbd>` legends, and the `⌘K` command terminal—never as a decorative "tech" costume on prose, headings, or navigation.

**The No-Kicker Rule.** Headings carry their own visual authority; never place small uppercase eyebrow or kicker labels above `<h1>`, `<h2>`, or `<h3>`.

## Layout

Content aligns to a `1240px` outer frame (`1144px` inner column) with explicit responsive gutters (`1.5rem` mobile, `2.5rem` at `768px+`, `3rem` at `1120px+`) and generous vertical section padding (`4.75rem` mobile up to `7.5rem` desktop). Asymmetric two-column splits (`1.12fr / 0.98fr` on Hero, `1.12fr / 0.88fr` on Craft + Macropad, `0.94fr / 1.06fr` on Spring Physics, `0.95fr / 1.05fr` on Work benches) collapse cleanly to single-column stacks below `860px–960px` with zero horizontal overflow at `390px`.

## Elevation & Depth

Depth separates pressable hardware switches from calm structural enclosures through physical keycap travel on controls and soft, offset ambient shadows on stages and benches.

### Shadow Vocabulary
- **Resting Keycap** (`inset 0 1px 0 rgba(255, 255, 255, 0.55), inset 0 -5px 0 var(--cap-side), 0 7px 14px -6px rgba(0, 0, 0, 0.65), 0 2px 4px rgba(0, 0, 0, 0.35)`): Tactile buttons and links (`.key`).
- **Depressed Keycap** (`inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -2px 0 var(--cap-side), 0 2px 4px -2px rgba(0, 0, 0, 0.6)` with `translateY(3px)`): Active/pressed mechanical travel state.
- **Desk Macropad Cap** (`inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 -6px 0 var(--cap-side), 0 5px 8px -3px rgba(0, 0, 0, 0.7)`): Sculpted spherical-dish keycaps inside `.macropad`.
- **Avatar & Bench Stage** (`inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 28px 56px -24px rgba(0, 0, 0, 0.82)`): Single-layer hardware enclosures (`.avatar-stage`, `.spring-card`, `.bench`, `.macropad-shell`).

### Named Rules
**The Strict Semantic Bevel Rule.** Deep bottom-lip inset bevels (`inset 0 -5px/-6px 0`) belong exclusively to pressable buttons and keycaps that physically depress on click. Static badges, cards, and containers never mimic keycap lips or single-edge accent stripes.

**The Single-Enclosure Rule.** Hardware benches (`.macropad-shell`, `.spring-card`, `.bench`, `.composer-box`) use one outer bordered/shadowed enclosure divided internally by `1px` hairlines—never cards nested inside cards.

## Shapes

- **Avatar Stage (`28px`):** Rounded studio window framing the 3D-shaded character and radial wave canvas.
- **Hardware Enclosures (`18px–22px`):** Machined corners on `.macropad-shell`, `.spring-card`, `.bench`, `.teach-box`, and `.idcard`.
- **Keycaps & Inputs (`9px–11px`):** Tactile PBT key radius with crisp `6px` focus-ring rounding.
- **Speech Notes & Badges (`999px` / `10px`):** Pill badges for avatar reactions and comic speech bubbles (`1.5px` ink border on bone) for the roving bug.
- **Footer Wave Seam:** Full-bleed curved SVG arch transitioning `#e6e0d2` bone into `#111215` graphite around the central upside-down peeker.

## Components

### Buttons (`.key`)
Tactile mechanical keycaps with 3px downward travel and Web Audio switch synthesis.
- **Shape:** Gently sculpted keycap corners (`11px` default, `9px` on `.key--sm`).
- **Primary (`.key--accent`):** Safety orange (`#ff5a1f`) top gradient, `#b8380c` bottom bevel, `#1a0d06` text, `0.7rem 1.3rem 1rem` padding.
- **Hover / Focus:** Subtle `brightness(1.04)` lift on hover; `2px solid #ff5a1f` focus ring at `3px` offset; `translateY(3px)` physical depression on `:active` and `aria-pressed="true"`.
- **Secondary / Slate:** Bone (`.key`, `#e6e0d2` with `#1a1a1c` ink) and Slate (`.key--slate`, `#3d414a` with `#ece8df` ink).

### Chips & Segmented Controls (`.chip`, `.seg`)
Compact tactile toggles for switch profiles, spring presets, and middleware layers.
- **Style:** Recessed `#111215` or `#d3ccb9` track for `.seg`; `#1f2227` mono pill buttons (`8px` radius, `0.8125rem`) for `.chip`.
- **State:** `aria-pressed="true"` shifts `.chip` to `#ff5a1f` (`#1a0d06` bold ink) and `.seg button` to raised slate or bone-ink pill.

### Cards / Containers (`.work-card`, `.bench`, `.spring-card`, `.macropad-shell`)
Single-layer dark anodized enclosures with hairline header/footer bars.
- **Corner Style:** `18px–20px` outer radius.
- **Background:** `#17191d` (`--ground-2`) or subtle anodized linear gradient (`#21252d` to `#131519`).
- **Shadow Strategy:** Soft offset ambient shadow (`0 24px 48px -22px`) with `1px` top inner specular.
- **Border:** `1px solid #2b2e35`.
- **Internal Padding:** `1.25rem–1.6rem` body padding (`2rem–3rem` on `.teach-box` and `.idcard`).

### Inputs / Fields (`.composer-body input`, `.composer-body textarea`)
Clean, tracker-free dark studio fields inside the mailto composer.
- **Style:** `1px solid #2b2e35` stroke, `#17191d` background, `10px` radius, `#9c988f` accessible placeholder (`>= 4.5:1`).
- **Focus:** `2px solid #ff5a1f` outline with `2px` offset and matching `#ff5a1f` border + caret.

### Navigation (`.site-header`)
Sticky translucent graphite bar (`backdrop-filter: saturate(1.2) blur(10px)`, `border-bottom: 1px solid #2b2e35`) housing the `SA Mubin` brand mark, 4 route links (`Home`, `Work`, `About`, `Contact`) with a `2px` `#ff5a1f` active underline, and compact slate tool keys (`⌘K` palette + persistent sound mute toggle).

### Interactive 3D Avatar Stage & Footer Peeker (`[data-avatar]`, `[data-peeker]`)
Signature character system built in pure SVG + `<canvas>`. The hero and `/about/` stages layer a 3D-shaded developer character over a cursor-tracked 360-degree multi-hue capsule wave, paired with `Boop`, `Shades`, and `Say Hi` keys plus a rapid-spin dizzy easter egg. At every main page footer, an upside-down twin hangs shyly behind the `#e6e0d2` wave arch and slides down with laughing `^ ^` eyes on hover or click.

## Do's and Don'ts

### Do:
- **Do** use **Sakib Alam Mubin** and **SA Mubin** exclusively as names across all copy, metadata, JSON-LD, and social cards, keeping `@thesamubin` and `@samubin` strictly for social/profile handles.
- **Do** keep the alternating `#111215` graphite and `#e6e0d2` bone section rhythm and single-layer bench enclosures (`>= 13px` minimum text size and `tabular-nums` on telemetry).
- **Do** respect `prefers-reduced-motion: reduce` across every canvas loop, spring solver, avatar rig, and roving bug animation, and persist the user's mute preference.

### Don't:
- **Don't** use standalone `"Mubin"`, `"Syed"`, or visible SEO alias dumps (`"also known as..."`) anywhere in user-facing or structured copy.
- **Don't** place kickers/eyebrows above headings, nest bordered cards inside bordered cards, or put `inset 0 -3px/-4px 0` stripes on non-keycap elements.
- **Don't** let heavy "cybersecurity hacker" tropes dominate the portfolio; lead ~80% with full-stack software engineering and interactive UI craft, keeping XSS/LFI labs strictly as 2 launch buttons in `/work/#teaching`.
