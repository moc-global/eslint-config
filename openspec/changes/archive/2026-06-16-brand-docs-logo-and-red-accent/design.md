## Context

The VitePress docs and README carry no MOC visual identity. A brand logo exists at
`docs/public/logo.svg` (a hexagon "M" mark + "MOC" wordmark, all in `#f1563c`), and the
brand palette was extracted from masterofcode.com's production CSS:

| Hex | Brand role (by usage on masterofcode.com) |
|---|---|
| `#f1563c` | **Primary red** — link text *and* button fills (237 uses; matches the logo exactly) |
| `#de3c21` | **Hover red** — button hover background |
| `#0c1b2c` | **Navy** — heading/body text |

VitePress themes its accent through brand CSS variables (`--vp-c-brand-1` links/accent
text, `--vp-c-brand-2` hover, `--vp-c-brand-3` solid button fill, `--vp-c-brand-soft`
translucent fills) plus `--vp-home-hero-name-color` for the home hero title. There is
currently no `docs/.vitepress/theme/` folder, so overriding these requires creating one.

Constraint: a single red cannot serve link **text** on both a white (light) and a near-
black (dark) background while meeting WCAG AA (4.5:1). Measured ratios:

| Color | on white `#fff` | on dark `#1b1b1f` | normal-text AA (4.5) | large/UI AA (3.0) |
|---|---|---|---|---|
| `#f1563c` | 3.40:1 | 5.18:1 | light ❌ / dark ✅ | ✅ |
| `#de3c21` | 4.40:1 | 4.01:1 | ❌ (just misses) | ✅ |
| `#d6401f` | 4.56:1 | — | ✅ | ✅ |
| white on `#f1563c` | 3.40:1 | — | ❌ | ✅ (button labels are large) |

## Goals / Non-Goals

**Goals:**
- Logo present in three places: README banner, VitePress nav, VitePress home hero.
- Brand-red accent replaces the default blue across the whole site, in both themes.
- Accent values meet WCAG AA in both themes (link text ≥4.5:1; button labels ≥3:1).
- Stay as close to the brand palette as accessibility allows.

**Non-Goals:**
- No changes to lint rules, the published package, or any application code.
- No favicon / OG-image / social-card work (could be a follow-up).
- No redesign of layout, typography, or content — accent + logo only.

## Decisions

### 1. Per-theme link-text color; shared button/hover tokens
Light-theme link text uses `#d6401f` (4.56:1 on white, AA); dark-theme link text uses
the pure brand `#f1563c` (5.18:1 on dark, AA). Button fill is `#f1563c` with a white
label in both themes (3.40:1 — passes the 3:1 large-text bar), and hover is the brand's
own `#de3c21`. Only `--vp-c-brand-1` differs per theme; `-2`/`-3`/`-soft` are shared.

**Why:** matches MOC's real button system (`#f1563c` → hover `#de3c21`, white label)
exactly, while nudging only the one token that would otherwise fail AA.

**Alternatives considered:**
- *Pure `#f1563c` everywhere* (pixel-exact brand, what masterofcode.com does): rejected
  — link text on white is 3.40:1, fails AA. The user chose accessibility.
- *Brand hover red `#de3c21` for light links* (reuses an existing brand token): rejected
  — 4.40:1 misses AA by 0.1; `#d6401f` is visually indistinguishable and clears 4.5.

Final token set:

```css
:root {
  --vp-c-brand-1: #d6401f;            /* links/accent text — 4.56:1 on white (AA) */
  --vp-c-brand-2: #de3c21;            /* hover — MOC's own hover red */
  --vp-c-brand-3: #f1563c;            /* solid button fill — brand primary, white label */
  --vp-c-brand-soft: rgba(241, 86, 60, 0.14);
  --vp-home-hero-name-color: #f1563c; /* home hero title → red */
}
.dark {
  --vp-c-brand-1: #f1563c;            /* pure brand red — 5.18:1 on dark (AA) */
  --vp-c-brand-2: #de3c21;
  --vp-c-brand-3: #f1563c;
  --vp-c-brand-soft: rgba(241, 86, 60, 0.22);
}
```

### 2. Custom theme via `docs/.vitepress/theme/`
Create `theme/index.js` that re-exports VitePress's default theme and imports
`./custom.css`, and `theme/custom.css` holding the variables above. This is the
idiomatic VitePress override path and keeps the accent in one auditable file. JS
(not TS) to match the existing `.mjs` config style.

### 3. Single logo asset for README (no `<picture>`)
The mark is a saturated red shape, legible on both GitHub light (`#fff`) and dark
(`#0d1117`) canvases, so one `<img>` suffices. A centered `<p align="center">` banner
above the H1 (chosen over inline-left) reads more like a product page.

### 4. Logo served from `/logo.svg`
`docs/public/` is VitePress's static root, so `themeConfig.logo: '/logo.svg'` and
`hero.image: { src: '/logo.svg' }` both resolve. README references the repo-relative
path `docs/public/logo.svg`.

## Risks / Trade-offs

- **Button label contrast is tight (3.40:1).** → Acceptable: VitePress brand button
  labels are bold/large, where AA requires only 3:1. Verified in both themes during the
  e2e/build check.
- **`#d6401f` is a hair off pixel-exact brand.** → Deliberate, user-approved trade for
  AA compliance; visually near-identical to `#f1563c`/`#de3c21`.
- **SVG with embedded base64 raster masks rendering on GitHub.** → Rendered as a static
  `<img>`, which GitHub supports; verified by viewing the README.
- **Exact greys/tints only judgeable in-browser.** → Mitigated by the docs build check
  plus a visual pass over light and dark themes.

## Migration Plan

Additive and reversible. Deploy via the existing docs pipeline; `npm run docs:build`
(already in the pre-push gate) verifies the build. Rollback = revert the commits; no
data or schema involved.

## Open Questions

None — palette, placements, and AA policy were resolved during exploration
(see `scratch/palette.md`). Favicon/social-card branding is deferred as out of scope.
