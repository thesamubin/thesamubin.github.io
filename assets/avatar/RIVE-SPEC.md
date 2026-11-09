# Rive Character Rigging Specification — `mubin.riv`

This document specifies the exact artboard, state machine, and input contract for the teenage cartoon character avatar of **Sakib Alam Mubin (SA Mubin)**.

The live site (`assets/js/avatar.js`) is built against this exact API:
- When `assets/avatar/mubin.riv` is absent, `assets/js/avatar.js` renders an articulated, multi-jointed teenage cartoon rig with spring bone physics, natural upper-body proportions, laptop typing animation, cursor look-at tracking, hand wave, boop reaction, celebration jump, and a two-handed hoodie pull animation.
- When `assets/avatar/mubin.riv` is placed in `assets/avatar/mubin.riv`, the adapter automatically detects and boots the Rive WebGL2/Canvas runtime and binds all state-machine inputs below with **zero code changes**.

---

## 1. Artboard & Export Settings

| Property | Value |
|---|---|
| **File Path** | `assets/avatar/mubin.riv` |
| **Artboard Name** | `MubinAvatar` |
| **Artboard Dimensions** | `520 × 520` (transparent background) |
| **State Machine Name** | `MorphStateMachine` |
| **Target File Size** | `<= 220 KB` (vector shapes only, no embedded raster bitmaps) |

---

## 2. Character Visual Direction

- **Proportion & Anatomy:** Natural teenage/young-adult cartoon character (18–21 yrs, stylized like modern animated series / Duolingo World characters — natural shoulder-to-head ratio `2.4:1`, articulated neck, forearms, wrists, fingers, and torso mesh deformation; **never** boxy geometric primitives).
- **Complexion & Hair:** Warm South Asian complexion; thick, wavy espresso-black hair with a natural side-part forelock that compresses underneath the hood when `hoodUp = true`.
- **Outfit:** Safety-orange (`#FF5A1F`) and warm bone (`#F4F3EF`) raglan pullover hoodie with cream drawstrings; charcoal joggers; sleek matte aluminium laptop resting on his crossed legs.
- **Lighting Layers:**
  - In **Developer Mode (`hoodUp = false`):** warm daylight key light from top-left; cool subtle screen bounce on chest/chin.
  - In **Hacker Mode (`hoodUp = true`):** deep hood shadow over brow; crimson-amber safelight screen glow (`#E0352B` / `#C98A3A`) reflecting upward onto the lower face, nose bridge, and fingertips.

---

## 3. State Machine Inputs (`MorphStateMachine`)

| Input Name | Type | Range / Default | Behaviour |
|---|---|---|---|
| `lookX` | `Number` | `-100` to `100` (`0`) | Horizontal target from cursor. Blends eye gaze (`100%`), head turn (`65%`), neck tilt (`30%`), and upper torso lean (`15%`). |
| `lookY` | `Number` | `-100` to `100` (`0`) | Vertical target from cursor. Blends eye pitch, chin nod, and brow lift. |
| `hoodUp` | `Boolean` | `false` (Dev) / `true` (Hack) | **Primary Mode Switch.** When toggled, both hands briefly leave the laptop, grip the hood hem, and pull the hood smoothly over the head (or push it back down onto the shoulders) over `650ms`. |
| `typing` | `Boolean` | `true` | Hands rest on the laptop keyboard with alternating finger keystrokes and subtle wrist bounce. |
| `hackIdle` | `Boolean` | `false` | Activated alongside `hoodUp = true`: narrows eyes into a focused expression, increases typing cadence by `1.35x`, and enables the crimson laptop screen rim-glow layer. |
| `wave` | `Trigger` | — | Right hand lifts from the laptop, waves warmly for `1.6s` with a bright smile, then settles back to typing. Fired on initial load and when clicking `Wave Hi`. |
| `boop` | `Trigger` | — | Quick squash-and-stretch head recoil, happy `^ ^` squint eyes, rosy cheek blush, and a soft chuckle. Fired when clicking the face or `Boop`. |
| `celebrate` | `Trigger` | — | Double fist-pump above the laptop + joyful hop (`900ms`). Fired when the visitor types `samubin` to decrypt the page. |

---

## 4. Hit Areas (Rive Listeners or DOM Overlay)

`assets/js/avatar.js` provides accessible `<button>` hit zones mapped over the stage:
1. **Hood / Collar Hit Zone (`[data-avatar-hood]`):** Clicking the hood or collar toggles `hoodUp` and fires the site-wide Developer ⇄ Ethical Hacker morph.
2. **Face Hit Zone (`[data-avatar-face]`):** Clicking the face triggers `boop`.
3. **Dock Controls:** Explicit tactile buttons below the stage (`Pull Hoodie Up / Down [H]`, `Wave Hi`, `Boop`, `Fast Type`) so every animation is discoverable by mouse, touch, and keyboard.
