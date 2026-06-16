## 1. VitePress base + changelog page

- [x] 1.1 Add a `resolveBase()` helper to `docs/.vitepress/config.mjs` (`/` locally, `/${GITHUB_REPOSITORY.split('/')[1]}/` under `GITHUB_ACTIONS`) and set `base`
- [x] 1.2 Point the nav "Changelog" item to `/changelog` and add it to the sidebar (Project group); update the GitHub social link to `dmytro-vakulenko-moc`
- [x] 1.3 Create `docs/changelog.md` containing only `<!--@include: ../CHANGELOG.md-->`; build and confirm the changelog content actually renders

## 2. GitHub Pages deploy workflow

- [x] 2.1 Add `.github/workflows/docs.yml` — triggers (`push` to `main` path-filtered to `docs/**` + the workflow file, plus `workflow_dispatch`), `permissions` (pages/id-token), `concurrency: pages`, `env: HUSKY: '0'`
- [x] 2.2 Build job: checkout `fetch-depth: 0` → `configure-pages` → Node 24 → `npm ci` → `vitepress build docs` → `touch docs/.vitepress/dist/.nojekyll` → `upload-pages-artifact`
- [x] 2.3 Deploy job (`needs: build`): `deploy-pages` with `environment: github-pages`

## 3. Local docs gate

- [x] 3.1 Append `&& npm run docs:build` to `.husky/pre-push` (after `test:run`, before `verify:examples`)

## 4. Canonical-repo URL sweep

- [x] 4.1 `grep -rn moc-global` (excluding the package name / npm scope) and update `package.json` (`repository`/`homepage`/`bugs`), `CHANGELOG.md` footer links, `README.md`, `SECURITY.md`, and `.github/ISSUE_TEMPLATE/config.yml` to `dmytro-vakulenko-moc`

## 5. Verify

- [x] 5.1 `npm run docs:build` is green and the `/changelog` page shows the root changelog content
- [x] 5.2 Run the full pre-push gate (`lint`, `typecheck`, `test:run`, `docs:build`, `pack:check`, `verify:examples`) — all green
- [x] 5.3 Simulate CI base resolution: `GITHUB_ACTIONS=1 GITHUB_REPOSITORY=dmytro-vakulenko-moc/eslint-config npm run docs:build` produces a `/eslint-config/`-based site
