# Design System — Sakib Alam Mubin (SA Mubin) Dual-Mode Portfolio

## 1. Visual Direction & Domain Exemplars
- **Concept:** A single physical hardware-engineering workbench (`html[data-mode="dev"]`) that transforms into a red-team safelight darkroom (`html[data-mode="hack"]`) when the visitor pulls the avatar's hoodie up (`[H]`).
- **Exemplars:** Teenage Engineering (machined anodized aluminium, safety-orange accents, tactile switch grids), Panic / Playdate (playful industrial craft), and Linear / Rauno Freiberg (60fps spring-damper physics and synthesized Web Audio UI feedback).
- **Anti-Cliché Mandate:** Zero Matrix green rain, zero glowing cyber-skulls, zero blue/purple SaaS gradient blobs, zero glassmorphism card stacks, zero infinite logo marquees, and zero eyebrow/kicker labels above headings.

## 2. Dual Color Palettes

### Mode A — `D1 Aluminium Lab` (`html[data-mode="dev"]`, Default)
- **Primary Ground (`--ground`):** `#DFE2E6` (Bead-blasted anodized silver-aluminium)
- **Secondary Ground (`--ground-alt`):** `#D5D9DF` (Recessed machined chassis band)
- **Elevated Enclosure Surface (`--surface`):** `#F2F4F7` (Clean studio polymer enclosure)
- **Secondary Surface (`--surface-2`):** `#E6E9EF` (Inset pane surface)
- **Switch Plate (`--plate`):** `#C6CCD4` (Recessed aluminium switch plate)
- **OLED Telemetry Readout (`--oled-bg` / `--oled-ink`):** `#141619` / `#F4A83A` (Warm amber phosphor on carbon glass)
- **Typography Ink (`--ink` / `--ink-2` / `--ink-3`):** `#16171A` / `#363940` / `#525660`
- **Structural Hairlines (`--line` / `--line-strong`):** `#BFC5CF` / `#9FA7B3`
- **Primary Signal Accent (`--accent` / `--accent-side` / `--accent-text`):** `#FF5A1F` / `#B8380C` / `#B33205`
- **Keycap Tiers:**
  - Daily Driver: `#F8F9FB` top / `#EAECEF` body / `#B4BAC4` bevel / `#16171A` ink
  - Proficient: `#464B55` top / `#353942` body / `#1F2228` bevel / `#F2F4F7` ink
  - Familiar: `#D9DDE3` top / `#CDD2DA` body / `#9EA5B0` bevel / `#2C2F36` ink

### Mode B — `H1 Safelight Darkroom` (`html[data-mode="hack"]`, Hoodie Up)
- **Primary Ground (`--ground`):** `#0B0708` (Carbon-crimson darkroom black)
- **Secondary Ground (`--ground-alt`):** `#110A0C` (Deep obsidian-red band)
- **Elevated Enclosure Surface (`--surface`):** `#160D0E` (Darkroom instrument enclosure)
- **Secondary Surface (`--surface-2`):** `#1E1214` (Inset darkroom bay)
- **Switch Plate (`--plate`):** `#090506` (Anodized stealth switch plate)
- **OLED Telemetry Readout (`--oled-bg` / `--oled-ink`):** `#080405` / `#FF5E52` (High-alert safelight phosphor)
- **Typography Ink (`--ink` / `--ink-2` / `--ink-3`):** `#E9DCD8` / `#CCB8B2` / `#A89089`
- **Structural Hairlines (`--line` / `--line-strong`):** `#2E1B1E` / `#46262A`
- **Primary Safelight Accent (`--accent` / `--accent-side` / `--accent-text`):** `#E0352B` / `#8F1B14` / `#FF6E63`
- **Cursor Safelight Torch:** Radial spotlight (`560px` at `--torch-x`, `--torch-y`) that develops `[data-darkroom-note]` field notes when the cursor passes within `220px`.

## 3. Typography & Variable Axis Choreography
- **Display & Headings (`--font`):** `Archivo` variable (`font-weight: 800–820`).
  - In `dev` mode: expanded industrial stance (`--stretch-display: 118%`, `--stretch-head: 112%`, `--stretch-title: 106%`).
  - In `hack` mode: condensed tactical stance (`--stretch-display: 84%`, `--stretch-head: 88%`, `--stretch-title: 92%`).
- **Scale:**
  - `h1, .hero-name, .page-title`: `clamp(2.55rem, 4.8vw, 4.35rem)`, `line-height: 0.96`, `letter-spacing: -0.038em`
  - `h2, .section-title`: `clamp(1.85rem, 3.6vw, 2.95rem)`, `line-height: 1.04`, `letter-spacing: -0.025em`
  - `h3, .card-title, .index-title`: `clamp(1.25rem, 2vw, 1.6rem)`, `line-height: 1.16`, `letter-spacing: -0.015em`
  - Body prose: `1rem` (`16px`), `line-height: 1.6`, `66ch` max measure
- **Monospace Telemetry (`--mono`):** `JetBrains Mono` (`tabular-nums`) reserved strictly for OLED readouts, keycap legends, `<kbd>` shortcuts, and status tags (`>= 12px`).

## 4. Layout, Radii & Elevation Rules
- **Container:** `.wrap` max-width `1200px` centered with `24px–48px` horizontal padding.
- **Border Radius Scale:** `3px`, `5px`, `6px`, `8px`, `9px`, `10px`, `11px`, `14px`, `16px`, `19px`, `20px`, `22px`, `26px`, `999px`.
- **Single-Enclosure Rule:** Major interactive benches (`.avatar-stage`, `.kb-shell`, `.index-enclosure`, `.split-enclosure`) use a single outer bordered chassis (`1px solid var(--line)`) with `var(--shadow-enclosure)`.
- **Semantic Keycap Bevel Rule:** Bottom 3D keycap lips (`inset 0 -4px/-5px 0`) appear exclusively on pressable buttons and switches (`.key`, `.cap`, `.kb-cap`, `.kb-mod`, `.tool`, `.mode-switch`) that physically depress (`translateY(2px–3px)`) on active click/keypress.
