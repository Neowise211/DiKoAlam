# Di Ko Alam — Style Reference
> Electric-blue billboard for a Taglish chat decoder

**Theme:** light (saturated canvas, not light-gray chrome)

Di Ko Alam uses a saturated blue-canvas design system built for a product that wants energy, not restraint. The entire viewport is a single electric blue field (#008fff) with white and signal-yellow typography floating on it — no warm grays, no dark-purple cards, no light-mode chrome. Headlines are Archivo Black at 52px, tight-tracked, with **Alam** in the wordmark flipped to vivid yellow (#ffe400). Surfaces are minimal: everything either sits directly on the blue or uses a hard 16px-radius white panel as a product/UI element. Two to three white speech-bubble nubs float as decoration. The system reads as playful, confident, and loud on purpose: it is anti-corporate, anti-minimal, and uses color saturation as the primary brand carrier.

This is a **phone product page** (max-width 480px, single column), not a desktop marketing billboard. The demo is held in someone's hand. Section order is the demo script and does not change: hero → upload → emotion bars → verdict → recent reads → footer.

## Product

Upload a chat screenshot. Get probability bars for what she's actually feeling (`tampo` first among equals), plus what she means (`ibig_sabihin`) and what to say back (`gawin_mo`). The page lands already populated with a sample reading (`Halimbawa`) so it looks finished before anyone taps.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Honk Blue | `#008fff` | `--color-honk-blue` | Full-viewport page canvas — the electric blue IS the brand surface, not a secondary accent |
| Honk Sky | `#00a0ff` | `--color-honk-sky` | Secondary blue for gradient bands and large decorative shapes |
| Signal Yellow | `#ffe400` | `--color-signal-yellow` | The word **Alam** in the wordmark, and at most one other headline word — never buttons, never fills |
| Honk White | `#ffffff` | `--color-honk-white` | Text on blue, hairline borders on blue, white product panels |
| Carbon | `#111111` | `--color-carbon` | Primary text on white panels |
| True Black | `#000000` | `--color-true-black` | SVG fills, maximum-contrast graphic detail |
| Slate | `#363636` | `--color-slate` | Secondary text on white panels, icon strokes inside nubs |
| Game Green | `#3fcc6b` | `--color-game-green` | Unused on this page. Kept in the token set. Do not put it on the marketing surface. |

Emotion-bar fills are **product data**, not brand chrome. They come from `EMOTIONS[key].color` in `public/shared.js` and are the one place extra hues are allowed — the same quarantine Honk uses for in-device green. Do not edit `shared.js` to "match the theme."

The grey tabby squircle logo contains lavender. Those colors stay **inside the icon**. Do not pull purple onto the page.

## Tokens — Typography

### Display — Archivo Black — `--font-honk-header`
- **Face:** Archivo Black (Google Fonts), fallback `ui-sans-serif, system-ui, sans-serif`
- **Weights:** 400 (Archivo Black is a single black cut; treat as display 700)
- **Sizes:** 52px
- **Line height:** 1.23
- **Letter spacing:** -0.012em
- **Role:** Hero H1 only. Chunky, loud, billboard-scale on the blue field.

### UI — Inter — `--font-honk-sans`
- **Face:** Inter (Google Fonts), fallback `ui-sans-serif, system-ui, sans-serif`
- **Weights:** 400, 500, 600
- **Sizes:** 13px, 14px, 16px, 17px, 19px
- **Line height:** 1.20, 1.38, 1.47, 1.55
- **Letter spacing:** -0.026em at 13px, -0.024em at 14px, -0.018em at 16px, -0.006em at 17–19px
- **Role:** Everything that is not the H1 — wordmark, labels, body, buttons, footer, pills.

### Type Scale

| Role | Size | Line Height | Letter Spacing | Token |
|------|------|-------------|----------------|-------|
| caption | 13px | 1.55 | -0.026em | `--text-caption` |
| body-lg | 19px | 1.55 | -0.006em | `--text-body-lg` |
| display | 52px | 1.23 | -0.012em | `--text-display` |

## Tokens — Spacing & Shapes

**Base unit:** 8px

**Density:** comfortable, sparse on a phone — billboard gaps, not a utility form.

### Spacing Scale

| Name | Value | Token |
|------|-------|-------|
| 14 | 14px | `--spacing-14` |
| 16 | 16px | `--spacing-16` |
| 24 | 24px | `--spacing-24` |

### Border Radius

| Element | Value |
|---------|-------|
| cards / white panels | 16px |
| buttons | 6px |
| small-pills | 6px |
| notification-panels | 16px |

### Layout

- **Page max-width:** 480px (phone). Do not use the 1200px two-column Honk layout.
- **Section gap:** 24px between white panels (80px desktop gap scaled down)
- **Card padding:** 20–24px
- **Element gap:** 16px

## Logo

Grey tabby squircle (`public/logo.png`) — closed eyes, slight pout, *tampo* as a face. The only brand image.

- Topbar: 36px next to the wordmark `Di Ko` (white) `Alam` (`#ffe400`)
- Favicon: the same file
- Not in the hero. Not as a section illustration. Not a repeating pattern.

## Components

### Blue Canvas
**Role:** The page

`body` is `#008fff` edge to edge. No white page behind a blue hero. Topbar, hero, panels, footer all sit on this field.

### Topbar
**Role:** Brand chrome

Not sticky, no mega-menu, no extra links. Logo + wordmark, left. Hairline white border optional; no dark bar, no blur, no potato.

### Highlighted Wordmark
**Role:** The yellow punctuation

`Di Ko` white, `Alam` `#ffe400`. Color is the only differentiator — no underline, no italic, no extra bold.

### Hero Headline
**Role:** H1

Archivo Black 52px, white, tracking -0.012em, line-height 1.23. Copy: `Sabi niya okay lang.` No strikethrough. Split across at most 3 lines.

### Hero Sub-headline
**Role:** Lede

Inter 400 at 19px, white, line-height 1.55. Sits 24px below the headline. No divider.

### White Product Panel
**Role:** Upload, bars, history

White `#ffffff`, 16px radius, 20–24px padding, full width of the 480px column. Carbon text. This is the product sitting on the billboard, not a card on a dark app.

### Halimbawa Pill
**Role:** Honesty label

6px radius, caption Inter 600, carbon on white. Keep the word `Halimbawa`. Flips to `Iyong chat` after upload. Never hide that the first-paint reading is a sample.

### Upload Drop Zone
**Role:** The only CTA

Lives **inside** the white Ang chat panel. Dashed carbon/slate outline, 16px inner radius, centered Inter copy. No filled yellow/blue button. Ghost energy: the panel *is* the control.

### Emotion Bars
**Role:** `Ang nararamdaman niya`

Seven rows, high-to-low (sorting happens in `toBars()`, not CSS). Top row emphasized. Zeroes faded. Track is a light slate wash on the white panel; fill color comes from JS (`EMOTIONS[key].color`). Do not restyle fills to yellow/white.

### Verdict Panels
**Role:** `Ibig sabihin` / `Gawin mo`

Two separate white 16px panels, carbon body at 16–19px. Uppercase caption heading in slate. No pink left border. No dark cards.

### Recent Reads
**Role:** History nicety

Flat list inside a white panel: hairline dividers, no card grid. Hidden until there is one entry. Emotion color dots from `shared.js` are data, same quarantine as the bars.

### Speech Bubble Nubs
**Role:** Decoration

2–3 white rounded nubs (16–20px radius, ~44–64px) with a single 2px-stroke icon in carbon (heart, chat, spark). Float near the hero. Not buttons. No drop shadow.

### Error Box
**Role:** Demo-visible failure

Must be obviously an error so a judge can see a failed upload. A distinct fail color is allowed here even though the marketing surface is otherwise three-color. Never leave a spinner running.

### Footer
**Role:** Disclaimer

Still on the blue field. White Inter 400 at 14px. Keep the party-trick / never-stored copy. Flat, no column grid, no extra nav links.

## Do's and Don'ts

### Do
- Use `#008fff` as the full-viewport canvas — the blue IS the surface.
- Yellow only `Alam` in the wordmark (color shift, nothing else).
- Body in Inter at 16–19px with the negative tracking from the type scale.
- 16px radius on white panels; 6px radius on the Halimbawa pill.
- Keep Taglish section headings: `Ang chat`, `Ang nararamdaman niya`, `Ibig sabihin`, `Gawin mo`.
- Keep `Halimbawa` + “sample reading” so the seeded first paint stays honest.
- Keep rotating Taglish loading lines.
- Keep emotion-bar colors from `shared.js`.
- Keep icon strokes at 2px, carbon on white nubs / white on blue elsewhere.

### Don't
- Don't use a white or gray page background.
- Don't use `#ffe400` for body text, buttons, or large fills.
- Don't pull lavender/purple from the logo onto the canvas.
- Don't add drop shadows — elevation is contrast against the blue.
- Don't highlight more than two words with yellow.
- Don't use a third font — Archivo Black is display-only; Inter is everything else.
- Don't use 6px radius on panels or 16px radius on the pill.
- Don't introduce a phone mockup, tic-tac-toe, or Honk product copy.
- Don't ship an empty-state-only first paint.
- Don't put an API key in `public/`.

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Blue canvas | `#008fff` | Full-viewport page |
| 1 | Sky | `#00a0ff` | Optional depth / decorative shapes |
| 2 | White panel | `#ffffff` | Upload, bars, verdict, history |

## Imagery

The tabby squircle is the only brand image. The uploaded chat screenshot is product content, shown after pick, cropped at the top of the frame. No photography, no lifestyle shots, no human subjects as decoration. Two to three white nubs. No potato.

## Layout

Single column, `max-width: 480px`, centered, 18px side padding. Topbar (logo + wordmark) → hero (H1 + lede + nubs) → white panels in demo order → footer. No two-column hero, no sticky nav, no card grid.

## Agent Prompt Guide

**Quick Color Reference**
- background: `#008fff`
- text on blue: `#ffffff`
- text on panels: `#111111`
- accent word: `#ffe400` (`Alam` only)
- bar fills: from `EMOTIONS` in JS
- error: visible fail color, allowed

**Component prompts**
1. **Hero:** Blue canvas. H1 `Sabi niya okay lang.` in Archivo Black 52px white. Lede Inter 19px white, 24px below.
2. **Upload panel:** White 16px radius, 20px padding. Heading `Ang chat` + `Halimbawa` 6px pill. Dashed drop zone inside.
3. **Bars panel:** White 16px radius. Heading `Ang nararamdaman niya`. Seven tracks, JS fill colors, top row emphasized.
4. **Verdict:** Two white 16px panels stacked. Caption headings `Ibig sabihin` / `Gawin mo`, carbon body.
5. **Nubs:** 2–3 white circles, carbon line icons, no shadow, near the hero, `aria-hidden`.

## Color Discipline

Three-color marketing surface: blue field, white type/panels, yellow `Alam`. Extra hues live only in (1) emotion-bar fills from `shared.js`, (2) the logo file itself, (3) a clearly visible error state. Loading copy stays Taglish and white.

## Similar energy (not similar products)

Loud single-hue canvas + one yellow punch-word, youth-coded, anti-corporate. Think saturated billboard, not a settings screen.

## Quick Start

### CSS Custom Properties

```css
:root {
  --color-honk-blue: #008fff;
  --color-honk-sky: #00a0ff;
  --color-signal-yellow: #ffe400;
  --color-honk-white: #ffffff;
  --color-carbon: #111111;
  --color-true-black: #000000;
  --color-slate: #363636;

  --font-honk-header: "Archivo Black", ui-sans-serif, system-ui, sans-serif;
  --font-honk-sans: Inter, ui-sans-serif, system-ui, sans-serif;

  --text-caption: 13px;
  --leading-caption: 1.55;
  --tracking-caption: -0.026em;
  --text-body-lg: 19px;
  --leading-body-lg: 1.55;
  --tracking-body-lg: -0.006em;
  --text-display: 52px;
  --leading-display: 1.23;
  --tracking-display: -0.012em;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --spacing-unit: 8px;
  --spacing-14: 14px;
  --spacing-16: 16px;
  --spacing-24: 24px;

  --page-max-width: 480px;
  --section-gap: 24px;
  --card-padding: 20px;
  --element-gap: 16px;

  --radius-buttons: 6px;
  --radius-small-pills: 6px;
  --radius-cards: 16px;
  --radius-notification-panels: 16px;
}
```
