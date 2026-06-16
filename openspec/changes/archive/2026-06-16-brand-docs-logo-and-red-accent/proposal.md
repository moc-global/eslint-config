## Why

The documentation site and README carry no MOC visual identity: there is no logo,
and VitePress ships its default (blue) accent. The project now has a brand logo
(`docs/public/logo.svg`) and a known brand palette, so the docs should look like
ours — a recognizable mark and the brand red — while remaining readable in both the
light and dark themes.

## What Changes

- **README** gains a centered logo banner above the H1 (`docs/public/logo.svg`). The
  single red mark reads correctly on both GitHub light and dark backgrounds, so no
  dual-asset `<picture>` is needed.
- **VitePress nav** shows the logo beside the site title (`themeConfig.logo`).
- **VitePress hero** (home page) shows the logo as its image, and the hero name is
  recolored to the brand red.
- **Accent color** changes from the default blue to the MOC brand red across the whole
  site, via a new VitePress custom theme that overrides the brand CSS variables
  **per theme** (light and dark).
- The chosen accent values are **WCAG AA contrast-tested in both themes**: link/accent
  text meets ≥4.5:1 against its background, and button labels meet ≥3:1 — see `design.md`
  for the palette and computed ratios.

No application code, lint rules, or published-package behavior change — this is
docs/README presentation only.

## Capabilities

### New Capabilities
- `docs-branding`: The README and documentation site carry the MOC logo (README banner,
  VitePress nav, and home hero) and use the brand-red accent color, with accent values
  that satisfy WCAG AA contrast in both the light and dark themes.

### Modified Capabilities
<!-- None. Publishing mechanics (base path, CI deploy, changelog, build gate, metadata)
     are unchanged; this adds a separate visual-identity capability. -->

## Impact

- `README.md` — add centered logo banner.
- `docs/index.md` — add `hero.image`.
- `docs/.vitepress/config.mjs` — add `themeConfig.logo`.
- `docs/.vitepress/theme/` — **new** folder: `index.js` (extends the default theme)
  and `custom.css` (brand-red CSS variable overrides per theme).
- `docs/public/logo.svg` — already present; referenced, not changed.
- Existing assets: relies on the existing `npm run docs:build` gate to verify the
  site still builds.
