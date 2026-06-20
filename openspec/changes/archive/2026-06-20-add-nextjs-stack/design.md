## Context

`@moc-global/eslint-config` composes a Node base with framework layers (`react`, `vue`), an alternate base (`nest`), and orthogonal add-ons (`vitest`, `jest`, `zod`, `i18n`, `tailwind`). `moc()` resolves each flag (explicit boolean or auto-detected from dependencies) and concatenates flat-config arrays. Stacks/add-ons are declared once in `src/core/manifest.ts`; `detect.ts`, the CLI installer, and `doctor` all read from it.

Today the `react` stack lists `next` in its `detect` array, so Next projects silently get the bare React config. The React config (`src/config/react/react.eslint.ts`) also hard-codes `reactRefresh.configs.vite` — a Vite-only Fast Refresh preset every React consumer inherits, including Next and webpack users. Investigation (recorded in issue #4) confirmed `eslint-plugin-react-refresh` ships dedicated `vite` and `next` presets and that `reactRefresh.configs.vite` is the **only** bundler coupling in the React stack.

## Goals / Non-Goals

**Goals:**
- A first-class `next` stack composed as React + Next, importable standalone via `./next`.
- Use `@next/eslint-plugin-next` directly; apply its `core-web-vitals` config.
- Make `createReactConfig()` bundler-agnostic; move Vite Fast Refresh to an auto-detected `vite` add-on so `moc()` Vite users stay non-breaking.
- Next detection supersedes React; React layer applied exactly once.
- A Next example linted clean under the e2e harness; full docs sweep; semver 2.1.0.

**Non-Goals:**
- A `next-compiler` config — Next reuses the existing `/react-compiler` subpath (same compiler).
- Per-directory (server vs client) globals for Server Components — a future tightening, not required for correctness.
- Next-specific `eslint-plugin-boundaries` layering (`app/` vs `src/pages/**`) — boundaries is not wired into any stack today; out of scope.
- Pages-Router-only or App-Router-only restriction — both are supported by a permissive union of allowed export names.

## Decisions

### D1: `@next/eslint-plugin-next` directly, not `eslint-config-next`
`eslint-config-next` re-bundles its own `eslint-plugin-react`, `eslint-plugin-react-hooks`, and `typescript-eslint`. This package already brings tuned copies, so spreading the meta-config causes duplicate plugin registration (ESLint hard-errors) and rule conflicts. The Next docs' own "use the plugin directly" path targets exactly this case. **Alternative considered:** spread `eslint-config-next` — rejected for the conflict above.

### D2: `next` is a framework stack that absorbs React
`createNextConfig(options)` = `createReactConfig(options)` + a `@next/next` rules block + Next Fast Refresh + Next overrides + ignores. In `moc()`, when `next` is enabled the React layer is applied **once via the Next stack** and the standalone `react` branch is skipped. **Alternative considered:** model Next as an orthogonal add-on layered onto an independently-applied React stack — rejected because the model can't express "depends on React" and it risks double-applying React.

### D3: `core-web-vitals` only (it already includes `recommended`)
`@next/eslint-plugin-next`'s `core-web-vitals` config is `{ ...recommendedRules, ...coreWebVitalsRules }` — a superset of `recommended`, upgrading `no-html-link-for-pages` and `no-sync-scripts` to errors. Applying `core-web-vitals` alone satisfies "apply both." The plugin namespace MUST be `@next/next` (rule ids are `@next/next/*`). The plugin ships its own TypeScript types — no module shim needed.

### D4: Pristine React + auto-detected `vite` add-on
Drop `reactRefresh.configs.vite` from the React stack. Add a `vite` add-on (`detect: ['vite']`, bundled — no extra peer beyond the existing `eslint-plugin-react-refresh`) applying `reactRefresh.configs.vite()`. `moc()` Vite users keep Fast Refresh automatically (non-breaking). Direct `/react`-subpath importers using Vite must add `./vite` — the one breaking edge, documented in CHANGELOG. **Alternative considered:** detect Vite inside `createReactConfig` via `rootDir` — rejected as hidden magic that couples the React config to bundler detection; the manifest-driven add-on is consistent with every other stack and is visible to the wizard/doctor.

### D5: Next Fast Refresh = `next()` preset + Pages-Router extension
Use `reactRefresh.configs.next()` (App-Router export names built in) and extend `allowExportNames` with the Pages-Router exports (`getStaticProps`, `getServerSideProps`, `getStaticPaths`, `getInitialProps`, `config`, `reportWebVitals`). A permissive union across both routers is acceptable — a file can only be one kind, and over-allowing a name never produces a false negative that matters for Fast Refresh.

### D6: Detection precedence in `detect.ts`, single-apply in `moc()`
Remove `next` from react's `detect`; add a post-pass in `detect.ts` that drops `react` from detected stacks when `next` is present. This single source feeds `moc()`, the wizard, and `doctor` consistently. `moc()` additionally guarantees the React layer is emitted once. The wizard's `askBase` is single-select, so adding `next` to `BASE_ORDER` naturally enforces "one framework."

### D7: CLI touch-points
Manifest-driven paths (`requiredPlugins`, `detectStacks`, `doctor`, `isStack`, config-file generation) auto-wire from the new `STACKS.next`/`EXTRAS.vite` entries. Only the hard-coded literals need edits: `BASE_ORDER` in `init.ts` and the `--preset` help + validation strings in `index.ts`.

## Risks / Trade-offs

- **[react-refresh 0.5.x API shape]** Presets may be exposed as functions (`.next()`/`.vite()`) rather than objects, and the current code uses the object form (`.configs.vite`). → Verify the installed version's shape during implementation; adapt the call sites accordingly and confirm via the dogfood test that ESLint loads.
- **[`allowExportNames` merge vs replace]** Passing `allowExportNames` to `reactRefresh.configs.next({...})` may replace rather than merge the built-in App-Router list. → Verify; if it replaces, spell out the full App+Pages union explicitly so App-Router names are not lost.
- **[Breaking direct `/react` Vite importers]** They lose bundled Vite Fast Refresh. → Mitigate with a clear CHANGELOG migration note (add `@moc-global/eslint-config/vite`); `moc()` users (the documented path) are unaffected.
- **[Example tarball version pin]** `verify-examples.sh` / the example `package.json` reference `moc-global-eslint-config-<version>.tgz`. → Keep the reference in sync with the 2.1.0 bump (or make it version-agnostic).
- **[`vite` add-on on a Vite+Vue project]** The add-on enables a React-only rule; on a Vite+Vue project it is inert (the rule only checks files importing React/JSX), so no false positives. → Accept; document the rule's React-file scoping.

## Migration Plan

1. Ship as **2.1.0** (minor). `moc()` consumers upgrade with no config change; Vite Fast Refresh is auto-restored via the `vite` add-on.
2. CHANGELOG entry calls out the one breaking edge for direct `/react`-subpath Vite importers: add `import vite from '@moc-global/eslint-config/vite'`.
3. Next consumers run `npx @moc-global/eslint-config init` (wizard now offers Next) or set `export default moc()` and install `@next/eslint-plugin-next`.

## Open Questions

- None blocking. The two verification items (react-refresh API shape, `allowExportNames` merge semantics) are resolved during implementation against the pinned package versions, with the dogfood test and `examples/next-app` as the safety net.
