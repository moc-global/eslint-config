## Why

The docs are authored in VitePress (`npm run docs:dev`) but published nowhere —
contributors and consumers can only read them by running the dev server. We want
them live on GitHub Pages at `https://dmytro-vakulenko-moc.github.io/eslint-config/`.
Two things block that today: VitePress has no `base` (so a project-page build
would 404 on every asset), and there's no deploy pipeline. Separately, the repo's
source-of-truth URLs still point at the `moc-global` org even though
`dmytro-vakulenko-moc/eslint-config` is now the canonical repo.

## What Changes

- **Publish the docs to GitHub Pages** via a GitHub Actions workflow
  (`.github/workflows/docs.yml`): build VitePress, upload a Pages artifact, deploy.
  Triggers on `push` to `main` (path-filtered to `docs/**`) and manual dispatch.
- **Resolve the VitePress `base` for project-page hosting** — `/` locally,
  `/<repo>/` on CI (derived from `GITHUB_REPOSITORY`), so assets and links resolve
  whether the site is served from the personal fork or, later, the org.
- **Single-source the changelog**: a one-line `docs/changelog.md` transcludes the
  root `CHANGELOG.md` via VitePress `@include`, so the repo and the site render the
  same file. Repoint the nav "Changelog" item to it.
- **Gate the docs build locally**: append `npm run docs:build` to the husky
  pre-push hook (consistent with checks running locally, GitHub CI being disabled).
- **Sweep repo URLs** from `moc-global` to `dmytro-vakulenko-moc` across
  `package.json` (`repository`/`homepage`/`bugs`), `CHANGELOG.md` footer links,
  `README.md`, `SECURITY.md`, the issue-template config, and the docs social link.
  The published **package name** stays `@moc-global/eslint-config`.

## Capabilities

### New Capabilities
- `documentation-publishing`: the VitePress documentation site SHALL build with a
  GitHub-Pages-correct base path, deploy to GitHub Pages via CI, render a changelog
  that is single-sourced from the root `CHANGELOG.md`, be guarded by a local build
  check, and carry repository metadata/links that point at the canonical repository.

### Modified Capabilities
<!-- none -->

## Impact

- **New:** `.github/workflows/docs.yml`, `docs/changelog.md`.
- **Changed:** `docs/.vitepress/config.mjs` (base + social link + nav),
  `.husky/pre-push` (docs build), `package.json`, `CHANGELOG.md`, `README.md`,
  `SECURITY.md`, `.github/ISSUE_TEMPLATE/config.yml` (URLs).
- **Consumers:** none — runtime config behavior is unchanged; this is docs +
  metadata only. The package name is unchanged.
- **Manual step (owner):** enable repo Settings → Pages → Source: "GitHub Actions".
