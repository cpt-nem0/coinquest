---
name: Coinquest Arcade
colors:
  surface: '#fffdf7'
  surface-dim: '#efe9db'
  surface-bright: '#ffffff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf7ec'
  surface-container: '#f5efe0'
  surface-container-high: '#ece4d1'
  surface-container-highest: '#e2d8c1'
  on-surface: '#14130f'
  on-surface-variant: '#54503f'
  inverse-surface: '#14130f'
  inverse-on-surface: '#f7f3e8'
  outline: '#14130f'
  outline-variant: '#14130f'
  surface-tint: '#5b3df0'
  primary: '#5b3df0'
  on-primary: '#ffffff'
  primary-container: '#d9d0ff'
  on-primary-container: '#1c0a66'
  inverse-primary: '#c9bdff'
  secondary: '#ffc01e'
  on-secondary: '#14130f'
  secondary-container: '#ffe7a3'
  on-secondary-container: '#3d2e00'
  tertiary: '#12a35a'
  on-tertiary: '#ffffff'
  tertiary-container: '#a7f0c6'
  on-tertiary-container: '#00391b'
  error: '#e23b2e'
  on-error: '#ffffff'
  error-container: '#ffdad4'
  on-error-container: '#410100'
  background: '#fffdf7'
  on-background: '#14130f'
  surface-variant: '#e2d8c1'
typography:
  display:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.1'
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.2'
  amount-lg:
    fontFamily: JetBrains Mono
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.0'
    fontFeatureSettings: "'tnum' 1"
  body-md:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Space Grotesk
    fontSize: 13px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.06em
  mono-num:
    fontFamily: JetBrains Mono
    fontSize: 15px
    fontWeight: '600'
    lineHeight: '1.2'
    fontFeatureSettings: "'tnum' 1"
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  border-width: 3px
  grid-columns: '12'
  gutter: 16px
---

## Brand & Style

Coinquest is a personal-finance app worn as a retro gaming cartridge. The design language is **Neo-Brutalist Arcade**: flat solid color blocks, thick black outlines, hard non-blurred offset shadows, sharp 90° corners, and confident geometric type. It should feel like a physical handheld console — tactile, high-contrast, a little loud — but the money underneath must always be legible, honest, and instantly recognizable.

The one rule that governs every screen: **the finance is the product; the game is the skin.** Real numbers, real merchants, and real dates are always the loudest thing on screen. RPG flavor decorates them; it never hides or replaces them.

## Colors — semantic, not decorative

Color always MEANS something. If a color does not carry meaning, it does not appear. There are exactly five roles:

- **Brand / Violet `#5b3df0`** — the app's identity and primary actions (main CTAs, active tab, brand). One accent, used sparingly.
- **Gain / Green `#12a35a`** — money saved, income, positive change, "Money Health," a won battle.
- **Loss / Red `#e23b2e`** — overspending, money out beyond plan, damage, a lost battle.
- **Reward / Gold `#ffc01e`** — the coin, XP, quest rewards, streaks. Gold is for *game rewards only*, never for real money.
- **Ink & Paper** — near-black `#14130f` for all text and all 3px borders; warm off-white `#fffdf7` paper as the canvas.

Hard rule: **a red bar means bad, a green bar means good — always.** Never render a healthy value in red or a spend value in green. (This directly fixes the two live bugs: Money Health at 82% is GREEN; "69% of budget used" is a neutral/amber consumption bar, never green with a "+".)

### Dark Mode
Dark mode is a first-class sibling, not an inversion. Same five roles, retuned for a dark canvas:
- paper → `#14130f` (base), cards `#1f1e18`, deepest `#0d0c09`
- ink → `#f7f3e8` (text); borders become `#f7f3e8` at 3px (light lines on dark)
- brand violet → `#b6a4ff` · gain green → `#4fd98d` · loss red → `#ff6a5c` · reward gold → `#ffcf45`
- hard shadows use pure black `#000000`
Every screen must be designed in BOTH themes; contrast and semantic meaning stay identical across them.

## Money & Currency (governance)

There is exactly ONE kind of money and ONE kind of points — never confuse them:

1. **Real money** is shown in the user's real currency (₹, $, €, … by locale) and is the DEFAULT everywhere a financial figure appears. All amounts use **tabular numerals** so columns line up and never jitter. This is India-first (Android bank-SMS parsing) but currency-agnostic by design; the symbol is a setting, never hardcoded.
2. **Coins** (the gold ✦ coin) are **reward points** earned from good behavior — a soft game currency, spendable only on cosmetics in the Shop. Coins are always drawn with the gold coin and NEVER carry a real-currency symbol. Do not label money as "Sparks" or "GP"; those were removed. Money is money; Coins are Coins.

## Financial Clarity First (governance)

- **Ledger rows show the REAL merchant name and REAL amount as the primary line** (e.g. "Swiggy  −₹487"). Recognition is the ledger's whole job.
- RPG flavor is allowed only as a **category** label or a small subtitle (e.g. category "Feasts 🍗"), never as a replacement for the merchant.
- The Home screen must always show a **real spend figure** (e.g. "Spent this month ₹44,500 of ₹50,000") near the top. "Money Health %" may accompany it but never stands alone.

## Gamification Rules (governance)

- **Boss targets use a rolling 3-month median**, not "last month," so a frugal month can't ratchet the next into a guaranteed loss.
- **Fixed obligations are excluded** from battles (you can't "fight" Rent or an insurance premium) — they live in a separate "Bills" area.
- **Loss is de-escalating, never punishing:** a missed target is "the boss got away / retreats," shown in calm amber, not a red "DEFEATED." Never mock a user whose finances are struggling.
- **XP flows only from restraint, review, or planning** (staying under a target, setting a budget, a no-spend day, reviewing the week). XP NEVER rewards activity volume — remove anything like "log 3 expenses," since tracking is automatic.

## Typography

A **High-Tech Retro** pairing:
- **Space Grotesk** for all UI, headlines, labels, and body copy — geometric and legible.
- **JetBrains Mono** for **every money value and numeric data** (amounts, budgets, percentages, XP, coins, dates in tables). Its monospaced figures line up in columns, never jitter, and read like a terminal/RPG dialogue box — the finance stays unmistakable. Always with tabular figures (`font-feature-settings: 'tnum' 1`).
- A **pixel display font** (e.g. "Silkscreen" / "Press Start 2P") is permitted for the logo and large arcade headers ONLY, at integer sizing — never for data.

Labels are uppercase with letter-spacing to read like a terminal. Rule of thumb: **if it's a number about money, it's JetBrains Mono; everything else is Space Grotesk.**

## Layout & Spacing

4px baseline; all spacing is a multiple of 4. Density is tiered so real data breathes:
- **Chrome tier** (cards, heroes, buttons, tab bar): full 3px black border + hard shadow.
- **Row tier** (transaction lists, quest lists): 1px divider only, NO per-row border or shadow, so a 50-row list doesn't clog.
16px minimum internal padding on bordered containers so the heavy borders never crowd content.

## Elevation & Depth

Depth = **hard offset shadows**, never blur. A raised element sits on a solid 4px black (light mode: `#14130f`; dark mode: `#000000`) offset to the bottom-right. Interactive press: the element shifts +4px down/right and the shadow disappears (physical click). No transparency, no backdrop blur.

## Shapes

Strictly **sharp — 0px radius** everywhere. Avatars are square with a thick border, not circles. This keeps the pixel grid crisp.

## Components

### Buttons
3px black border, solid fill, hard 4px offset shadow. Primary = violet fill / white text. Reward/claim actions = gold fill / black text. Destructive = red. Press animates down-right; shadow vanishes.

### Cards
Paper (light) or `#1f1e18` (dark) with a 3px border. Neutral border = ink; an "active quest/battle" card border = the relevant semantic color (violet/green/red).

### Progress & Meters (HP / XP style)
Thick, flat, **segmented** bars: discrete blocks with a 2px gap, mimicking hardware readouts. Money Health = green blocks. XP = gold blocks. Budget consumption = neutral/amber, filling toward a red zone only past 100%.

### Chips & Badges
Small sharp rectangles, 3px border, uppercase label. Category chips use a muted tint of ink; status badges use the semantic color they mean.

### Inputs
Rectangular, darkest surface fill, 3px border, solid block cursor. Focus = border turns violet.

### Tab Bar (locked — the ONLY navigation)
Five slots, bottom, 3px top border: **HOME · BATTLES · ＋(log) · LEDGER · HERO**. The center ＋ is a raised gold button that opens the Encounter (log/confirm a spend). Active tab = violet.

## One System (governance)

- **One tab bar** (above) on every screen — no per-screen variations.
- **One art style** — all pixel art matches the gold coin's grid and palette (chunky, hard-edged, no painterly renders). The coin asset is the reference for every sprite.
- **One currency model** — real money default; Coins = rewards only.
