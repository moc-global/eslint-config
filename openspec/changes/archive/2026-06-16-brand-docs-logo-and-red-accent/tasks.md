## 1. Brand-red accent theme

- [x] 1.1 Create `docs/.vitepress/theme/index.js` that extends VitePress's default theme and imports `./custom.css`
- [x] 1.2 Create `docs/.vitepress/theme/custom.css` with the per-theme brand-red overrides: `:root` → `--vp-c-brand-1:#d6401f`, `--vp-c-brand-2:#de3c21`, `--vp-c-brand-3:#f1563c`, `--vp-c-brand-soft:rgba(241,86,60,.14)`, `--vp-home-hero-name-color:#f1563c`; `.dark` → `--vp-c-brand-1:#f1563c`, `--vp-c-brand-2:#de3c21`, `--vp-c-brand-3:#f1563c`, `--vp-c-brand-soft:rgba(241,86,60,.22)`

## 2. Logo in the documentation site

- [x] 2.1 Add `themeConfig.logo: '/logo.svg'` in `docs/.vitepress/config.mjs`
- [x] 2.2 Add `hero.image` (`{ src: '/logo.svg', alt: ... }`) to the hero front-matter in `docs/index.md`

## 3. Logo in the README

- [x] 3.1 Add a centered `<p align="center"><img src="docs/public/logo.svg" …></p>` banner above the H1 in `README.md`, with descriptive `alt` text and a sensible width

## 4. Verify

- [x] 4.1 Run `npm run docs:build` and confirm it succeeds — build completes in ~1.8s
- [x] 4.2 Verify (built output) that the logo shows in nav + hero and the accent is red in BOTH light and dark themes; confirm the README logo renders — `logo.svg` emitted to `dist/` and referenced 3× in `index.html`; brand-red `--vp-c-brand-1` overrides (`#d6401f` light, `#f1563c` dark) bundled *after* the default indigo (bytes 108306/108461 vs 6810), so they win the cascade
- [x] 4.3 Re-confirm the stated AA contrast ratios for the final color values — light link `#d6401f` 4.55:1 ✓, dark link `#f1563c` 5.02:1 ✓, white-on-`#f1563c` button 3.42:1 ✓ (computed with sRGB WCAG formula)
