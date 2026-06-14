## 1. Restructure the source tree (still `.mjs`)

- [x] 1.1 Create `src/config/`, `src/core/`, `src/cli/` (cli already exists) and move the rule product into `src/config/`: all `*.eslint.mjs` barrels (`node`, `react`, `vue`, `nest`, `vitest`, `jest`, `zod`, `i18n`, `tailwind`) and the rule folders (`node/ react/ vue/ nest/ typescript/ zod/ vitest/ jest/ i18n/ tailwindcss/ boundaries/ lintlord/`)
- [x] 1.2 Move `detect.mjs`, `logger.mjs`, `tsconfig.utils.mjs` into `src/core/`; keep `src/index.mjs` (orchestrator) at the root
- [x] 1.3 Lift the manifest out of `src/cli/stacks.mjs` → `src/core/manifest.mjs` and fix its `../../package.json` require for the new depth
- [x] 1.4 Rewrite every relative import to the new paths (orchestrator, cli, core, config)
- [x] 1.5 Repoint `package.json` `exports`/`main`/`bin`/`./stacks` to the new `src/` paths; confirm subpath names are unchanged
- [x] 1.6 Verify the move with `npm run test:run` and `npm run lint` before any TS change (green baseline)

## 2. TypeScript port

- [x] 2.1 Rename all `src/**/*.mjs` → `.ts`; remove `// @ts-check` pragmas (now redundant) and convert JSDoc `@param`/`@typedef` types to real TS types/interfaces where it improves safety
- [x] 2.2 Add explicit types to the public surface: `MocOptions`, `NodeConfigOptions`, the manifest `StackDefinition`, CLI option types, and the `moc()` return type
- [x] 2.3 Update `tsconfig.json` for the type-check/lint project (`erasableSyntaxOnly: true`, `checkJs` no longer needed, include `src`, `tests`, `eslint.config.ts`, keep `noEmit`)
- [x] 2.4 Add `tsconfig.build.json` (extends base; `include: ["src"]`, `outDir: "dist"`, `declaration: true`, `noEmit: false`, exclude tests/fixtures/docs)
- [x] 2.5 Resolve type errors surfaced by the port (typed `createRequire` manifest, narrowed dynamic `import()` catch, fs calls)

## 3. Build & packaging

- [x] 3.1 Add `build` (`tsc -p tsconfig.build.json`), `prepare` (build), and `prepublishOnly` (clean + build) scripts
- [x] 3.2 Repoint `package.json` to `dist/`: `main`, `bin`, `exports` (with a `types` condition per subpath), `files: ["dist"]`, `types`; add `publishConfig` placeholder for registry-agnostic publishing
- [x] 3.3 Add `jiti` devDependency; add `dist/` to `.gitignore`
- [x] 3.4 Run `npm run build` and confirm `dist/` mirrors the layer layout with `.js` + `.d.ts` for every entry
- [x] 3.5 Verify the CLI shebang survives the build: `node dist/cli/index.js help` runs and the emitted file starts with `#!/usr/bin/env node`

## 4. Dogfood & boundaries

- [x] 4.1 Rename `eslint.config.mjs` → `eslint.config.ts` importing the `.ts` source; confirm ESLint's jiti loader lints on a clean checkout (no `dist/`)
- [x] 4.2 Add a repo-local `eslint-plugin-boundaries` config wiring element types (`core`, `config`, `cli`, `orchestrator`) and the allowed directions (`config ✗→ cli`, `cli ✗→ config`, `core` leaf)
- [x] 4.3 Resolve the type-aware-rule fix wave on the package's own source (naming idiom vs `module_`/`error_`, `no-unsafe-*`, etc.); prefer typed fixes over blanket disables
- [x] 4.4 Add a boundaries regression check (a deliberate forbidden import fails lint) — verify then revert

## 5. Tests

- [x] 5.1 Update vitest test imports to the new paths; update `vitest.config.ts` coverage `include`/`exclude` for `.ts` and the new folders
- [x] 5.2 Add an exports smoke test: import the root and every subpath export and assert each resolves
- [x] 5.3 Add a packaging test: `npm pack --dry-run` contains `dist/` (with `.d.ts`) and excludes `src`/`tests`/`fixtures`/`docs`
- [x] 5.4 `npm run test:run`, `npm run typecheck`, `npm run lint` all green

## 6. Docs & versioning

- [x] 6.1 Update README: replace the "buildless" claims with the build + `dist/` + registry-agnostic story; keep the import examples
- [x] 6.2 Update `docs/guide/{getting-started,how-it-works,versioning,cli,contributing}` and `docs/reference/api` for the build step, install paths, and the new `src/` layout
- [x] 6.3 Bump to the next major version and add a migration note (buildless/registry-free → build-based; `git+ssh` via `prepare` still works)

## 7. End-to-end verification

- [x] 7.1 In a temp project, install the packed tarball and run `eslint` with `export default moc()` — confirm linting works against the built package
- [x] 7.2 Confirm a TypeScript consumer gets resolved types for `moc(options)` from the shipped `.d.ts`
- [x] 7.3 Run `openspec validate port-to-typescript-and-restructure --strict`
