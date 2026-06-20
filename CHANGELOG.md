# Changelog

All notable changes to `@moc-global/eslint-config` are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project adheres to [Semantic Versioning](https://semver.org/). See the
[versioning policy](https://github.com/dmytro-vakulenko-moc/eslint-config/blob/main/docs/guide/versioning.md)
for what counts as a major, minor, or patch.

## [Unreleased]

_Nothing yet._

## [2.1.0]

Adds a first-class **Next.js** stack and makes the React stack bundler-agnostic.

### Added

- **Next.js stack** (`moc({ next: true })`, auto-detected from `next`): the React
  config plus the official `@next/eslint-plugin-next` **Core Web Vitals** rules,
  Next-aware Fast Refresh export names (App Router **and** Pages Router), a
  `jsdoc/require-jsdoc` relaxation for `route.ts`/`middleware.ts`, and ignores for
  `.next/`, `out/`, and `next-env.d.ts`. Uses `@next/eslint-plugin-next` **directly**
  (not `eslint-config-next`, which would duplicate-bundle react/react-hooks/
  typescript-eslint). New optional peer dependency `@next/eslint-plugin-next`.
- **`vite` add-on** (`moc({ vite: true })`, auto-detected from `vite`): supplies
  React Fast Refresh via `eslint-plugin-react-refresh`'s `vite` preset.
- **Subpath exports** `/next` (`createNextConfig`) and `/vite`; new `next`/`vite`
  `moc()` flags; `next` offered by the installer wizard and `--preset`.
- A runnable **`examples/next-app`** consumer (App Router + Pages Router) under the
  `verify:examples` gate.

### Changed

- **`createReactConfig` is now pristine (bundler-agnostic).** Fast Refresh is no
  longer baked into the React stack — it is a bundler/HMR concern now supplied by
  the `vite` add-on (for Vite projects) or the `next` stack. `next` is removed from
  the React stack's auto-detection; a Next.js project resolves to the **Next stack**,
  which supersedes React and applies the React layer exactly once.
- **Note for direct `/react`-subpath importers (not `moc()` users):** if you import
  `@moc-global/eslint-config/react` directly and relied on the previously-bundled
  Vite Fast Refresh, add `@moc-global/eslint-config/vite` alongside it. `moc()` users
  are unaffected — the `vite` add-on is auto-detected from the `vite` dependency.

## [2.0.0]

A ground-up rework into a standalone, shareable package. **Breaking** — the
distribution model, layout, and minimum tooling versions all changed.

### Added

- **`moc()` umbrella** with dependency-based stack auto-detection — zero-config
  `export default moc()` resolves the right stack and reads tsconfig path aliases.
- **Stacks:** Node/TypeScript (base), NestJS, React, Vue (with `vueTs` for
  type-aware SFCs). **Add-ons:** Vitest, Jest, Zod, i18next, Tailwind CSS.
- **Interactive installer** (`npx @moc-global/eslint-config init`) and a
  `doctor` diagnostics command.
- **Subpath exports** for hand-composition (`/node`, `/react`, `/vue`, `/nest`,
  `/vitest`, `/jest`, `/zod`, `/i18n`, `/tailwind`, `/stacks`), plus an opt-in
  `/react-compiler` export.
- **Type declarations** (`.d.ts`) for `moc()` and every subpath.
- Four runnable **example consumers** under `examples/` and a `verify:examples`
  check; framework-stack **dogfood tests**; a husky **pre-push** gate.

### Changed

- **BREAKING:** authored in **TypeScript** and shipped as a compiled `dist/`
  (JavaScript + `.d.ts`); `src/` restructured into `config/` (rules), `core/`
  (machinery), and `cli/` (installer) layers, enforced with
  `eslint-plugin-boundaries`.
- **BREAKING:** flat-config only; minimum **ESLint `^9.24 || ^10`** and
  **Node `^22.21 || >=24.10`**.
- Plugin version ranges are sourced from `peerDependencies` as the single source
  of truth for the manifest, installer, and `doctor`.

### Fixed

- **React stack** no longer crashes a clean consumer install: `react-compiler`
  is an opt-in (not required) peer so it can't pull a `zod-validation-error`
  without the `./v4` export, and the React version is resolved concretely
  instead of via `'detect'` (which called a removed ESLint API).
- **Vue stack** works on a standard project: SFC PascalCase is enforced on the
  filename only (not directories), `n/no-missing-import` no longer false-flags
  aliased SFC imports, Prettier solely owns SFC formatting, and `vueTs: true`
  implies the Vue stack.
- **Rule policy** accepts idiomatic, type-safe code: allows the `*Props`
  convention and full words like `info`; reconciles `no-void` with
  `no-floating-promises`; removes duplicate ReDoS/deprecation reports; disables
  the false-positive-prone `detect-object-injection`; and relaxes
  `max-classes-per-file`.

[Unreleased]: https://github.com/dmytro-vakulenko-moc/eslint-config/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/dmytro-vakulenko-moc/eslint-config/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/dmytro-vakulenko-moc/eslint-config/releases/tag/v2.0.0
