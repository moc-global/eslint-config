# Changelog

All notable changes to `@moc-global/eslint-config` are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project adheres to [Semantic Versioning](https://semver.org/). See the
[versioning policy](https://github.com/dmytro-vakulenko-moc/eslint-config/blob/main/docs/guide/versioning.md)
for what counts as a major, minor, or patch.

## [Unreleased]

_Nothing yet._

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

[Unreleased]: https://github.com/dmytro-vakulenko-moc/eslint-config/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/dmytro-vakulenko-moc/eslint-config/releases/tag/v2.0.0
