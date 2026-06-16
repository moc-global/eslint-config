## Context

VitePress docs live under `docs/` (config at `docs/.vitepress/config.mjs`).
`npm run docs:build` is already green (verified — no dead links). GitHub CI for
*checks* is disabled (checks run via the husky pre-push hook); this adds a
separate *deploy* workflow. The reference implementation is
`../own/eslint-config-naming/.github/workflows/docs.yml`.

## Goals / Non-Goals

**Goals:**
- Docs served at `https://dmytro-vakulenko-moc.github.io/eslint-config/`.
- One changelog, rendered on both the repo and the site.
- Catch docs-build breakage locally (CI checks are off).
- Repo URLs reflect the canonical repository.

**Non-Goals:**
- No change to the runtime ESLint config or the published package **name**.
- No per-PR docs previews (GitHub Pages serves a single site).
- No re-enabling of the disabled checks workflow.

## Decisions

| Decision | Mechanism |
| --- | --- |
| Project-page `base` | `resolveBase()` in `config.mjs`: `/` unless `GITHUB_ACTIONS`, else `/${GITHUB_REPOSITORY.split('/')[1]}/`. Portable across fork/org, no hardcoding. |
| Deploy pipeline | `docs.yml`: `permissions: { pages: write, id-token: write }`, `concurrency: pages`, build job (`configure-pages` → `vitepress build` → `touch dist/.nojekyll` → `upload-pages-artifact`) + deploy job (`deploy-pages`, `environment: github-pages`). |
| Triggers | `push: { branches: [main], paths: ['docs/**', '.github/workflows/docs.yml'] }` + `workflow_dispatch`. |
| Checkout depth | `fetch-depth: 0` — `config.mjs` sets `lastUpdated: true`, which needs full history for accurate per-page timestamps. |
| Node / install | Node `24`; `npm ci` with `env: HUSKY: '0'` (husky hooks are pointless in CI; consistent with `ci.yml`). |
| Single-source changelog | `docs/changelog.md` = `<!--@include: ../CHANGELOG.md-->`. VitePress's include handler resolves the path relative to the file with no boundary check (verified in `node_modules/vitepress`), strips frontmatter, and recurses. Nav "Changelog" → `/changelog`; sidebar entry under "Project". |
| Local docs gate | Append `&& npm run docs:build` to `.husky/pre-push` (after `test:run`, before the slow `verify:examples`). |
| URL sweep | `grep -rn moc-global` and replace the **repository** references with `dmytro-vakulenko-moc`, excluding the package **name** `@moc-global/eslint-config` and the npm scope. |

## Risks / Trade-offs

- **[`@include` silently no-ops on a wrong path]** → verify the changelog content actually renders in the build, not just that the build exits 0.
- **[`cleanUrls: true` can 404 inter-page links on some hosts]** → GitHub Pages handles it; spot-check after the first deploy.
- **[Scoped package name (`@moc-global`) with a personal-repo `repository` field]** → intentional and reversible; the user will revisit when the canonical home settles.
- **[Pages must be enabled with Source = "GitHub Actions"]** → owner's manual step; documented in the proposal and tasks.

## Migration Plan

Merge to `main` → the owner enables Pages (Source: GitHub Actions) → the first
`docs.yml` run (or a manual dispatch) publishes the site. Rollback: disable Pages
or revert the workflow; no consumer or data impact.

## Open Questions

None — settled during exploration.
