## Why

Lint configuration drifts across our projects: each repo pins slightly different plugin versions and toggles slightly different rules, so a rule that errors in one codebase warns in another and onboarding a new project means copy-pasting whichever config looks freshest. We have a mature, strict ESLint setup living inside a personal TypeScript boilerplate; extracting it into a single, versioned, company-owned package lets us govern one standard centrally instead of maintaining N divergent copies.

## What Changes

- Extract the boilerplate's `.eslint/` rule tree into a standalone, **buildless** package `@moc-global/eslint-config` (ships plain `.mjs`, no compile step).
- Add an umbrella factory `moc({ flags })` that auto-detects the project's stack from its dependencies and composes the Node base, framework layers, and add-ons in the correct order. ESLint async config means `export default moc()` works directly.
- Split dependencies: core plugins ship **bundled** (version-locked centrally); framework plugins (React/Vue/NestJS) and some add-ons are **optional peers** loaded lazily via subpath exports, with actionable errors when a peer is missing.
- Add an installer CLI (`init`, `doctor`) driven by a single `STACKS` manifest that sources plugin version ranges from the package's own `peerDependencies` (one source of truth).
- Support **git-dependency** and **npm-pack tarball** distribution (no registry required yet).
- Document a **legacy-adoption** path using ESLint bulk suppressions so existing codebases go green on day one and ratchet down over time.
- Establish a **versioning policy**: adding/strengthening a rule is a minor bump; consumers pin `^` and treat post-upgrade lint failures as intended.
- Ship VitePress documentation and a Vitest + fixture test suite that lints real sample projects.

## Capabilities

### New Capabilities

- `eslint-config-composition`: The `moc()` umbrella, the Node/TypeScript base, framework stacks (React/Vue/NestJS), add-ons (Vitest/Jest/Zod/i18n/Tailwind), dependency auto-detection, and lazy optional-peer loading with helpful errors.
- `installer-cli`: The `init` wizard and `doctor` command, package-manager detection, config-file generation, script patching, and the `STACKS` manifest as the single source of truth.
- `distribution-and-adoption`: Buildless packaging, git/tarball distribution, the bulk-suppressions legacy-adoption flow, and the semver policy.

### Modified Capabilities

<!-- None — this is a new package. -->

## Impact

- **New repository:** `/Users/master/Documents/Projects/moc/eslint-config` (package `@moc-global/eslint-config`).
- **Source repo:** the `typescript-boilerplate` remains as-is and becomes the first downstream consumer (dogfooding).
- **Dependencies:** ~27 core ESLint plugins become bundled `dependencies`; framework plugins become optional `peerDependencies`. `eslint` and `typescript` are peers.
- **Consumers:** install via git URL or tarball; adopt with one `init` command; existing projects use `eslint --suppress-all` to baseline.
