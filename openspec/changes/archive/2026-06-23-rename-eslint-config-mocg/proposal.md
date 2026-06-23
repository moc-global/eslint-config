## Why

The package was never published to npm under its current scoped name `@moc-global/eslint-config` (the registry returns 404), and the company has settled on a single canonical identity: the unscoped, convention-correct `eslint-config-mocg` (`mocg` = MOC Global). Renaming now — before the first publish — means `npm publish` ships under the right name with no legacy package to deprecate, no scope to maintain, and no in-place upgrade path to break. Doing it as one deliberate change keeps every dimension of the old identity (source, generated output, docs, examples, tests, and the living specs that are our source of truth) consistent instead of drifting.

## What Changes

- **BREAKING** Rename the npm package from the scoped `@moc-global/eslint-config` to the unscoped `eslint-config-mocg`. This is the linchpin: `src/core/manifest.ts` derives `PACKAGE_NAME` from `package.json`'s `name`, so the CLI usage/help, error messages, and the generated `eslint.config.mjs` import all follow automatically.
- **BREAKING** Rebrand the public API: the umbrella export `moc()` → `mocg()` and its options type `MocOptions` → `MocgOptions`. This changes the generated config output (`import { mocg } from 'eslint-config-mocg'`) and every documented example. Subpath export names (`./node`, `./react`, `./next`, …) and the `create*Config` factories are unchanged.
- **BREAKING** Rename the CLI bin from `moc-eslint` to `eslint-config-mocg`.
- Bump the version `2.1.0` → `2.2.0`. The version is embedded in the packed-tarball filename, so every reference to `…-2.1.0.tgz` (README, getting-started, and the five example `package.json` files) moves in lockstep with the name.
- Sweep all documentation, examples, GitHub meta, and source JSDoc to the new name and export, and add a `CHANGELOG.md` `[2.2.0]` entry recording the rename.
- Keep unchanged: the repository / homepage / bugs URLs (`github.com/dmytro-vakulenko-moc/eslint-config`), `publishConfig.access: "public"`, company branding (docs footer, logo SVG id), and archived OpenSpec history.

## Capabilities

### New Capabilities

- `package-identity`: The canonical published identity — unscoped npm name `eslint-config-mocg`, umbrella export `mocg()` with options type `MocgOptions`, CLI bin `eslint-config-mocg`, version baseline `2.2.0` — and the single-source-of-truth property that CLI output, error messages, and the generated config file all derive from `package.json`'s `name` via `PACKAGE_NAME`.

### Modified Capabilities

- `build-based-distribution`: the public subpath import specifier consumers use changes from `@moc-global/eslint-config/<subpath>` to `eslint-config-mocg/<subpath>`.
- `documentation-publishing`: the stated published package name changes to `eslint-config-mocg` while the docs/repo URLs continue to reference `dmytro-vakulenko-moc/eslint-config`.
- `docs-branding`: the README H1 / logo `alt` heading reads `eslint-config-mocg`.
- `source-layering`: the public umbrella orchestrator export is renamed `moc()` → `mocg()` (subpath export names are unchanged).
- `framework-stack-compatibility`: requirement language describing the umbrella composer uses `mocg()` instead of `moc()`; behavior is unchanged.
- `nextjs-stack`: the umbrella composer is referred to as `mocg()` and the `/next` subpath specifier updates to `eslint-config-mocg/next`; behavior is unchanged.
- `typescript-authoring-and-build`: the typed export referenced for IntelliSense is `mocg(options)` / `mocg({ … })` instead of `moc(...)`.

## Impact

- **Package manifest:** `package.json` `name`, `version`, and `bin` key. `package-lock.json` regenerated via `npm install`.
- **Public API (BREAKING):** `mocg()` / `MocgOptions` replace `moc()` / `MocOptions` in `src/index.ts`; the config generator (`src/cli/project.ts`) emits the new import + call; a hard-coded `npx @moc-global/eslint-config init` string in `src/cli/doctor.ts` updates (ideally to derive from `PACKAGE_NAME`).
- **Tests:** `tests/stacks.test.mjs` (asserts `PACKAGE_NAME`) and `tests/project.test.mjs` (asserts the generated import + `moc`) must assert the new values.
- **Docs & examples:** ~14 docs pages, the VitePress title + sidebar label, all five example apps (dependency key, the `file:…tgz` value, `eslint.config.mjs` import + call, READMEs). Built docs (`docs/.vitepress/dist/`) are gitignored — regenerated, never hand-edited.
- **GitHub meta:** `.github/CODEOWNERS`, `.github/ISSUE_TEMPLATE/bug_report.md`.
- **Token safety:** `moc` is a substring of `@moc-global` and `moc-eslint`; replacements must be token-aware so the package-name swap and the API-symbol swap don't collide.
- **Verification net (existing):** `test:run`, `typecheck`, `lint`, `pack:check` (dry-run pack — confirms the new tarball name + `files`), and `verify:examples` (real install of all five examples against the packed tarball). No Snowflake or data dependencies exist in this repo.
