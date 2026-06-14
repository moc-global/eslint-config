## Context

`@moc-global/eslint-config` is a pure-ESM, buildless package: it ships `.mjs` under `src/`, `exports`/`main`/`bin` point straight at source, and it installs via `git+ssh` or tarball. Type safety today comes from JSDoc + `// @ts-check`, but only 8 of 65 files opt in and `checkJs` is off, so the ~57 rule modules — the product itself — are unchecked, and consumers receive no `.d.ts`. The top of `src/` mixes the orchestrator, detection/logging helpers, the CLI, the stack manifest, and the rule barrels. The repo already dogfoods (`eslint.config.mjs` → `moc()`), and it bundles `eslint-plugin-boundaries` but only as a consumer-facing template.

Three decisions were settled in exploration: (1) full TypeScript with a `tsc` build to `dist/`, (2) a `src/config` + `src/core` + `src/cli` layout with the orchestrator at `src/index`, (3) enforce the layers with `eslint-plugin-boundaries` on this repo. Registry target (public npm vs private) is deferred — the build must be registry-agnostic.

## Goals / Non-Goals

**Goals:**
- Author every source file in TypeScript and type-check the whole package (no more unchecked rule modules).
- Ship `dist/*.js` + `dist/*.d.ts` so consumers get IntelliSense; keep the public import surface byte-for-byte identical.
- Restructure into `config` (product) / `core` (machinery) / `cli` (installer) / `index` (orchestrator), with `boundaries` enforcing the directions.
- Keep `git+ssh` installs working through a `prepare` build; make publishing registry-agnostic.
- Keep dogfooding build-free (lint the `.ts` source directly).

**Non-Goals:**
- Choosing the registry (public vs private) — deferred to publish time via `publishConfig`.
- Bundling/minifying — output stays 1:1 with source for clean subpath resolution.
- Changing any rule's behavior, the `moc()` API, or the set of subpath exports.
- Committing `dist/` to version control.

## Decisions

### D1: `tsc` for the build, not a bundler
`tsc` emits `.js` and `.d.ts` file-for-file, which maps directly onto the ~13 subpath exports and the many rule modules. A bundler (esbuild/tsdown/rollup) would collapse entries or need extra plumbing for declarations and multi-entry output, for no benefit on a config package that does no heavy transform. **Alternative considered:** `tsdown`/`unbuild` (faster, modern) — rejected because `.d.ts` + true multi-entry is exactly what `tsc` does natively, and build speed is a non-issue at this size.

### D2: ESM output, `module: nodenext`-style resolution, `.ts` → `.js`
The package is `"type": "module"`; `.ts` sources compile to ESM `.js`. Keep the descriptive `.eslint` infix in filenames (`config/node.eslint.ts` → `dist/config/node.eslint.js`) so the emitted paths read clearly and the `exports` map stays legible. **Alternative:** `.mts` everywhere — unnecessary given `"type": "module"` already makes `.js` ESM.

### D3: `erasableSyntaxOnly` on
Forbid runtime-emitting TS (`enum`, parameter properties, namespaces). This keeps the build a pure type-erasure step, guarantees the emitted JS is a faithful 1:1 of the source, and leaves the door open to native execution later. Low cost: the codebase has no such constructs today.

### D4: Layering and the manifest move
`src/index.ts` (orchestrator/public entry) · `src/cli/` (installer) · `src/core/` (detect, logger, tsconfig-utils, **manifest** — moved out of `cli/stacks.mjs` because `index` and `detect` both import it) · `src/config/` (all `*.eslint` modules + stack/extra barrels + `node/ react/ vue/ nest/ typescript/ zod/ vitest/ jest/ i18n/ tailwindcss/ boundaries/ lintlord/`). The manifest reads `package.json`; its relative path updates from `../../package.json` to match the new depth.

### D5: Boundaries directions
Element types by path: `core` (leaf), `config` (rules), `cli` (installer), `orchestrator` (index). Allowed imports: `orchestrator → {core, config}`; `config → {core}`; `cli → {core}`; `core → {}`. Forbidden and lint-enforced: `config ✗→ cli`, `cli ✗→ config`, `core ✗→ {cli, config}`. This is applied in the repo's own `eslint.config.ts`, separate from the consumer-facing boundaries template the package still ships.

### D6: Dogfood via `eslint.config.ts` + jiti
Rename `eslint.config.mjs` → `eslint.config.ts`. ESLint's jiti-backed loader imports the `.ts` source directly, so `npm run lint` works on a clean checkout with no `dist/`. Add `jiti` as a devDependency. **Alternative:** lint the built `dist/` — rejected because it forces `build` before every `lint` and lints generated output rather than source.

### D7: Distribution — registry-agnostic + prepare bridge
`files: ["dist"]`; `main`/`bin`/`exports`/`types` point to `dist/`; `prepare` runs the build (so `git+ssh` consumers compile on install, npm auto-installing devDeps to do it); `prepublishOnly` rebuilds before publish; `publishConfig` selects the registry at publish time. `dist/` stays git-ignored. Verify `tsc` preserves the CLI shebang on `dist/cli/index.js` (it preserves leading shebang comments; covered by an e2e check).

### D8: tsconfig split (check vs emit)
Keep `tsconfig.json` as the editor/type-check + lint project (covers `src`, `tests`, `eslint.config.ts`; `noEmit`). Add a build config (`tsconfig.build.json`) extending it that includes only `src`, sets `outDir: dist`, `declaration: true`, `noEmit: false`, and excludes tests/fixtures/docs. This keeps `typecheck` broad and `build` narrow.

## Risks / Trade-offs

- **Buildless property is lost (deliberate).** → Mitigated by the `prepare` bridge (git installs still work) and by shipping `.d.ts` (a capability gained). Documented as a major bump with a migration note.
- **Fix wave from newly-active type-aware rules on own source.** Naming conventions vs the `module_`/`package_`/`error_` idiom, `no-unsafe-*` around `require('../../package.json')` and dynamic `import()`. → Resolve in the same change; prefer typed helpers (`createRequire` with a typed manifest, `import()` with narrowed catch) over blanket disables; where the idiom is intentional, adjust the naming rule or annotate narrowly.
- **`prepare` on git install is heavier** (devDeps + compile on the consumer). → Acceptable as an interim bridge; the registry path removes it.
- **Shebang / executable bit on built CLI.** → e2e step runs `node dist/cli/index.js help` and asserts the shebang line; `bin` makes npm set the bit on install.
- **jiti loader drift / ESLint config-loading behavior.** → Pin `jiti`; e2e asserts `eslint` runs against the `.ts` config on a clean checkout.
- **Subpath export regressions during the move.** → `npm pack --dry-run` + an import smoke test for every subpath guard against a broken `exports` map.

## Migration Plan

1. Land the restructure + TS port behind the unchanged public API; keep `prepare` building `dist/`.
2. Release as a major version with a migration note: registry install is preferred; `git+ssh` keeps working via `prepare`.
3. Choose and configure the registry later via `publishConfig`; until then, `git+ssh` is the supported path.
4. **Rollback:** revert the change; the prior buildless `.mjs` tag remains installable via `git+ssh` with no build.

## Open Questions

- Registry target (public npm vs private GitHub Packages) — deferred to publish time; does not block this change.
- Whether to also publish a tagged tarball artifact for offline installs (nice-to-have, out of scope here).
