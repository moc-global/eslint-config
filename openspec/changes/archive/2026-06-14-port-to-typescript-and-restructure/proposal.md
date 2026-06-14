## Why

Today the package mixes its machinery (CLI, orchestrator, detection helpers) with its product (the ESLint rule modules) at the top of `src/`, and ~57 of 65 source files carry no type checking at all (`checkJs: false`, no `@ts-check`) — so the bulk of the config gets zero type safety and consumers get no `.d.ts`. Porting to TypeScript closes that gap and ships real types; restructuring into clear layers makes the package navigable and lets the bundled `eslint-plugin-boundaries` enforce the separation instead of leaving it to convention.

## What Changes

- **Restructure `src/` into explicit layers** — `src/config/` (the ESLint rule product), `src/core/` (shared machinery: detect, logger, tsconfig-utils, manifest), `src/cli/` (installer), with `src/index` remaining the public orchestrator. The shared manifest is lifted out of `cli/` (it is imported by the orchestrator and detection, not CLI-only).
- **Author all source in TypeScript** and build with `tsc` to `dist/*.js` + `dist/*.d.ts` (1:1 file output, no bundler — it maps onto the many subpath exports). Ship consumer-facing types for the first time.
- **BREAKING (install method): give up buildless distribution.** Node refuses to type-strip `.ts` inside `node_modules`, so authored TypeScript requires a build. `exports`/`main`/`bin` repoint to `dist/`, a `types` condition is added per subpath, and `files` becomes `["dist"]`.
- **Registry-agnostic publishing** — `dist/` can publish to npm public or a private registry, decided at publish time via `publishConfig`. The `git+ssh` install keeps working during migration via a `prepare` build (npm installs devDeps and runs `prepare` on git installs).
- **Enforce the new layers on this repo** with `eslint-plugin-boundaries` (currently shipped only as a consumer template): `config ✗→ cli`, `cli ✗→ config`, `core` stays leaf.
- **Keep dogfooding frictionless** — rename `eslint.config.mjs` → `eslint.config.ts` so ESLint's jiti loader lints the `.ts` source directly with no build-before-lint, now subjecting the package's own code to the full type-aware ruleset.
- **Public API is unchanged** — `moc()` and every subpath export (`./node`, `./react`, `./vue`, `./nest`, `./vitest`, `./jest`, `./zod`, `./i18n`, `./tailwind`, `./stacks`) keep their names; only the resolved paths move.
- **Major version bump** (install method changes) plus docs updates (README, getting-started, how-it-works, versioning, cli, contributing).

## Capabilities

### New Capabilities
- `typescript-authoring-and-build`: source authored in TypeScript and compiled with `tsc` to a `dist/` of runnable ESM `.js` plus `.d.ts`, with the CLI shebang preserved and `erasableSyntaxOnly` keeping the source transpile-only.
- `source-layering`: the `config` / `core` / `cli` / orchestrator layering, with `eslint-plugin-boundaries` enforcing the allowed import directions on this repo and the package linting its own TypeScript source.
- `build-based-distribution`: registry-agnostic publishing of the built `dist/` with `.d.ts`, the `prepare`-build bridge for `git+ssh` installs, and the unchanged public export surface — superseding the prior buildless/registry-free model.

### Modified Capabilities
<!-- None: openspec/specs/ has no archived baseline yet, so the prior buildless model is superseded via the build-based-distribution new capability above. -->

## Impact

- **Source tree:** every file under `src/` moves and is renamed `.mjs` → `.ts`; all relative imports rewrite.
- **package.json:** `exports`, `main`, `bin`, `files`, `scripts` (add `build`, `prepare`, `prepublishOnly`), `types`, `publishConfig`; add `jiti` devDep.
- **Build config:** `tsconfig.json` gains emit settings (`outDir`, `declaration`, `erasableSyntaxOnly`); a build-specific config may split type-check from emit.
- **Self-lint:** `eslint.config.mjs` → `eslint.config.ts`; boundaries wired onto the repo; a fix wave from the now-active type-aware rules (e.g. the `module_`/`error_` idiom, `require('../../package.json')`, dynamic `import()`).
- **Tests:** vitest suite imports move to the new paths; coverage `include`/`exclude` globs update for `.ts`.
- **Docs:** README + `docs/guide/{getting-started,how-it-works,versioning,cli,contributing}` and `docs/reference/api` reflect the build, `dist/`, registry-agnostic publishing, and the new layout.
- **Consumers:** install method changes (registry or `git+ssh`-with-prepare); the import API does not.
