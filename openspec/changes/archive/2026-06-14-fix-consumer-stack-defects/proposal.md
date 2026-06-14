## Why

Consuming the packed `@moc-global/eslint-config@2.0.0` from two fresh example
projects (`examples/typescript-app`, `examples/react-app`) proved the React
stack is unusable: in a clean consumer install ESLint **crashes before linting
anything** — twice. The repo never exercises the React path (its only fixtures
are Node/TS), so both crashes shipped undetected. Beyond the crashes, the rule
policy rejects idiomatic, type-safe framework code (the `*Props` naming
convention, browser `localStorage`, the `void promise` floating-promise guard).
See `EXAMPLES-FINDINGS.md` for the full evidence.

## What Changes

- **Fix the two consumer crashes in the React stack:**
  - `zod-validation-error` resolving to `3.5.4` (no `./v4` export) while
    `eslint-plugin-react-hooks@7` requires `zod-validation-error/v4`. The repo's
    private `overrides` masks this for itself but does not reach consumers.
  - `settings.react.version: 'detect'` invoking `eslint-plugin-react`'s detector,
    which calls the `context.getFilename()` API removed in ESLint 9/10. Resolve
    the React version concretely instead of detecting.
- **Stop Node-only rules from judging browser React code:** `eslint-plugin-n`
  builtin checks (e.g. `n/no-unsupported-features/node-builtins` on
  `localStorage`) must not apply when the React stack is active.
- **Reconcile contradictory/over-broad rule policy** so idiomatic type-safe code
  passes: allow the `*Props` convention (`unicorn/prevent-abbreviations`), allow
  `void` as a statement (`no-void` vs `@typescript-eslint/no-floating-promises`),
  un-ban full words such as `info` in the naming denylist, and remove
  duplicate-owner reports (ReDoS: `sonarjs/slow-regex` vs
  `regexp/no-super-linear-backtracking`; deprecation: `sonarjs/deprecation` vs
  `@typescript-eslint/no-deprecated`).
- **Decide the React-component policy** for `jsdoc/require-jsdoc` and
  `sonarjs/prefer-read-only-props` and apply it consistently.
- **Resolve the `react-compiler` inconsistency:** it is a required React peer but
  `moc()` never loads it — either wire it in or make it opt-in and drop it from
  the required peers.
- **Dogfood the framework stacks:** the `examples/` projects become the
  fixtures that the repo's own test suite lints, so React/stack regressions are
  caught. The temporary consumer-side workarounds in `examples/react-app` are
  removed once the config is fixed.

## Capabilities

### New Capabilities
- `framework-stack-compatibility`: a framework stack (React first) composed by
  `moc()` SHALL load and run under the supported ESLint range in a clean
  consumer install without crashing — covering dependency resolution
  (no missing subpath exports), framework-version resolution without removed
  APIs, environment-correct rule scoping (browser vs Node), required-peer ↔
  loaded-plugin consistency, and repo-level dogfooding of each stack.
- `rule-policy-coherence`: the shared rule set SHALL accept idiomatic,
  type-safe code and SHALL NOT contradict itself — no rule rejects a widely-used
  safe convention that another rule (or the language) requires, and no single
  concern is reported by two rules at once.

### Modified Capabilities
<!-- None: the active baseline (build-based-distribution, source-layering,
     typescript-authoring-and-build) covers build/packaging/layout, not
     composition or rule policy. These behaviors are new spec contracts. -->

## Impact

- **Code:** `src/config/react/*` (version resolution, browser env, n-rule
  scoping, component policy), `src/config/node/*` (`unicorn`, `no-void`,
  naming, ReDoS dedup), `src/index.ts` / `src/core/manifest.ts` (react-compiler
  wiring/peers), `package.json` (dependency/peer/override changes for consumers).
- **Tests:** new fixture/example-based lint checks that exercise the React stack.
- **Examples:** `examples/react-app` loses its workarounds; both examples lint
  clean.
- **Consumers:** a fresh React install works with bare `export default moc()`.
- **Docs:** `EXAMPLES-FINDINGS.md` resolutions reflected in the React/stacks guide.
