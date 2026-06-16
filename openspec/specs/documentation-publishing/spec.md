# documentation-publishing Specification

## Purpose
Ensure the VitePress documentation site is publishable to GitHub Pages and stays correct and maintainable: it builds with a Pages-correct base path, deploys via CI, renders a changelog single-sourced from the root `CHANGELOG.md`, is guarded by a local build check, and carries repository metadata/links that point at the canonical repository.

## Requirements
### Requirement: The documentation site builds with a GitHub-Pages-correct base path

The VitePress site SHALL resolve its `base` so assets and internal links work
both in local development and when served as a GitHub Pages **project** site
(`https://<owner>.github.io/<repo>/`). The base SHALL be derived from the CI
environment, not hardcoded, so it is correct regardless of which account hosts it.

#### Scenario: Local development uses the root base

- **WHEN** the site is built or served outside CI (no `GITHUB_ACTIONS`)
- **THEN** `base` is `/`

#### Scenario: CI build uses the repository base

- **WHEN** the site is built in GitHub Actions with `GITHUB_REPOSITORY=<owner>/<repo>`
- **THEN** `base` is `/<repo>/`, so the deployed project-page assets and links resolve

### Requirement: The documentation site deploys to GitHub Pages via CI

A GitHub Actions workflow SHALL build the VitePress site and deploy it to GitHub
Pages using the official Pages actions, with the permissions and concurrency that
Pages deployment requires.

#### Scenario: Deploy on changes to main

- **WHEN** a commit lands on `main` that touches `docs/**` (or the workflow file), or the workflow is dispatched manually
- **THEN** the workflow builds the site, uploads a Pages artifact (with `.nojekyll`), and deploys it to the `github-pages` environment

#### Scenario: Pages-required configuration is present

- **WHEN** the deploy workflow runs
- **THEN** it grants `pages: write` and `id-token: write`, serializes via a `pages` concurrency group, and checks out full history so `lastUpdated` timestamps are accurate

### Requirement: The changelog is single-sourced

The changelog rendered on the documentation site SHALL be the same content as the
repository's root `CHANGELOG.md` — not a manually maintained copy.

#### Scenario: The site renders the root changelog

- **WHEN** the docs site is built
- **THEN** the `/changelog` page contains the content of the root `CHANGELOG.md` (transcluded, not duplicated), and editing `CHANGELOG.md` updates both the repo view and the site

### Requirement: The documentation build is guarded locally

The documentation build SHALL be part of the local pre-push gate, so a broken
docs build (e.g. a dead link) is caught before it can reach `main` and fail the
deploy. Automated CI checks are disabled in favour of that local gate.

#### Scenario: Pre-push runs the docs build

- **WHEN** the husky pre-push hook runs
- **THEN** it runs `npm run docs:build` and fails the push if the docs build fails

### Requirement: Repository metadata points at the canonical repository

Repository metadata and links SHALL point at the canonical repository — the
package `repository`/`homepage`/`bugs`, changelog footer links,
README/SECURITY/issue-template links, and the docs social link. The published
package **name** is independent of the repository location and is not changed by this.

#### Scenario: Metadata reflects the canonical repo

- **WHEN** repository URLs are inspected
- **THEN** they reference `dmytro-vakulenko-moc/eslint-config`, while the package name remains `@moc-global/eslint-config`
