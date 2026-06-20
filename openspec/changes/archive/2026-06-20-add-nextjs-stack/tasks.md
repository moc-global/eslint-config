## 1. Dependencies & manifest

- [x] 1.1 Add `@next/eslint-plugin-next` to `package.json` `peerDependencies` (with `peerDependenciesMeta.optional`) and `devDependencies`; update `description` and `keywords` (add `next`, `nextjs`); bump `version` to `2.1.0`.
- [x] 1.2 Add `./next` and `./vite` subpath exports to `package.json` `exports`.
- [x] 1.3 In `src/core/manifest.ts`: add `STACKS.next` (`entry: 'next'`, `factory: 'createNextConfig'`, `detect: ['next']`, `plugins` incl. `@next/eslint-plugin-next` and the React peers); remove `'next'` from `STACKS.react.detect`; add `EXTRAS.vite` (`detect: ['vite']`).

## 2. Detection precedence

- [x] 2.1 In `src/core/detect.ts`: add a post-pass so that when `next` is detected, `react` is dropped from `result.stacks` (next supersedes react). Explicit-flag behavior intact.

## 3. Make the React stack bundler-agnostic + Vite add-on

- [x] 3.1 In `src/config/react/react.eslint.ts`: remove the `eslint-plugin-react-refresh` import and `reactRefresh.configs.vite` from the `extends` array (kept `reactHooks` recommended). `createReactConfig` is now pristine.
- [x] 3.2 Create `src/config/react-refresh/vite.eslint.ts` applying `reactRefresh.configs.vite` scoped to `**/*.{ts,tsx,jsx}`. (Verified: 0.5.2 exposes presets as flat-config objects; used via `extends`.)
- [x] 3.3 Create `src/config/vite.eslint.ts` entry re-exporting the vite add-on.

## 4. Next stack configuration

- [x] 4.1 Create `src/config/next/next.eslint.ts`: register `@next/next`, apply `core-web-vitals` rules; `globalIgnores` `.next/**`, `out/**`, `next-env.d.ts`.
- [x] 4.2 Create `src/config/next/next-refresh.eslint.ts`: `react-refresh/only-export-components` with App-Router (from the plugin's `next` preset) + Pages-Router export names. (Verified built-in list; union is explicit.)
- [x] 4.3 Create `src/config/next/next-overrides.eslint.ts`: `jsdoc/require-jsdoc` off for `**/route.ts` and `**/middleware.ts`.
- [x] 4.4 Create `src/config/next.eslint.ts`: `createNextConfig(options)` = `createReactConfig(options)` + next rules + next refresh + next overrides.
- [x] 4.5 Type shim: NOT needed — `@next/eslint-plugin-next@16.2.9` ships its own types and the project typechecks clean.

## 5. Compose in moc() + options + entry importers

- [x] 5.1 In `src/index.ts`: add `next` and `vite` to `ENTRY_IMPORTERS`; add `next?`/`vite?` to `MocOptions`.
- [x] 5.2 In `src/index.ts` `moc()`: when `next` is enabled, apply the Next stack (incl. React once) and skip the standalone `react` branch; `vite` participates via the extras loop.

## 6. CLI

- [x] 6.1 In `src/cli/init.ts`: add `'next'` to `BASE_ORDER`.
- [x] 6.2 In `src/cli/index.ts`: add `next` to the `--preset` help + validation strings (and `vite` to the extras strings).

## 7. Tests & fixtures

- [x] 7.1 Add `fixtures/detect/next`, `fixtures/detect/vite`, and `fixtures/next-ts` (App Router page+route+client, Pages Router page).
- [x] 7.2 Extend `tests/detect.test.mjs`: Next detects `next` and NOT `react`; react fixture still detects `react`; vite extra detected.
- [x] 7.3 Extend `tests/moc.test.mjs`: `moc({ next: true })` registers `@next/next` and applies `react/rules` exactly once; `next: false` opts out; vite add-on enabled; pristine react has no `react-refresh`.
- [x] 7.4 Extend `tests/stacks.test.mjs`: `next` in `STACKS`; `requiredPlugins(['next'])`; pristine react set; vite set; peer SoT invariant covers `@next/eslint-plugin-next`.
- [x] 7.5 Add `tests/next-stack.test.mjs`: dogfood lint asserting no fatal errors, the next block present, and the refresh/jsdoc relaxations take effect.
- [x] 7.6 Extend `tests/exports.test.mjs` (`./next`, `./vite`) and `tests/project.test.mjs` (`isStack('next')`, `isExtra('vite')`, generated `next: true`).

## 8. Example app

- [x] 8.1 Create `examples/next-app` (App + Pages Router, `eslint.config.mjs` = `moc()`, tsconfig, package.json, `.npmrc`, `.gitignore`, README).
- [x] 8.2 Tarball references bumped to `2.1.0` across all examples (auto-discovered by `verify-examples.sh`).

## 9. Docs

- [x] 9.1 `docs/guide/stacks.md`: Next stack row + `vite` add-on row; React row updated.
- [x] 9.2 `docs/guide/getting-started.md` + `docs/guide/how-it-works.md`: zero-config Next; precedence.
- [x] 9.3 `docs/reference/plugins.md` (+ `@next/eslint-plugin-next`, refresh presets) and `docs/reference/api.md` (`createNextConfig`, pristine `createReactConfig`, vite add-on, options).
- [x] 9.4 `docs/guide/existing-projects.md`: "migrating from `eslint-config-next`" note.
- [x] 9.5 `README.md`: stacks table + Next quick-start.
- [x] 9.6 `CHANGELOG.md` / `docs/changelog.md`: `2.1.0` entry incl. breaking note for direct `/react`-subpath Vite importers. (`docs/changelog.md` is an `@include` of `CHANGELOG.md`.)

## 10. Verify

- [x] 10.1 `npm run build` + `npm run typecheck` clean.
- [x] 10.2 `npm run test:run` green (68 tests).
- [x] 10.3 `npm run lint` (self-lint) clean.
- [x] 10.4 `npm run verify:examples` green — all 5 consumers (`nest-app`, `next-app`, `react-app`, `typescript-app`, `vue-app`) passed.
