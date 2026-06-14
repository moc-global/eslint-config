## Context

`EXAMPLES-FINDINGS.md` documents a black-box consumption test of the packed
tarball. The Node/TS stack works; the React stack crashes ESLint twice on a
clean consumer install and the rule policy rejects idiomatic, type-safe code.
The repo only dogfoods Node/TS (`fixtures/node-ts`), so the React path was never
linted. Constraint: fixes must reach **consumers** — npm `overrides` declared in
this repo do not propagate, so they cannot be the mechanism.

## Goals / Non-Goals

**Goals:**
- A clean `npm i` + `eslint .` in a React consumer using `export default moc()`
  runs to completion (no crashes) under the supported ESLint range.
- Idiomatic, type-safe code in both example projects lints with **zero errors**.
- The repo's own test suite exercises the React stack so these regressions can't
  return.
- Remove the temporary workarounds from `examples/react-app`.

**Non-Goals:**
- No Vue/Nest fixes beyond what overlaps (they share the Node base; React is the
  proven-broken stack and the focus here).
- No wholesale re-evaluation of every rule — only the specific findings.
- No version bumps of ESLint itself.

## Decisions

Each maps to a finding in `EXAMPLES-FINDINGS.md`.

| # | Decision | Mechanism (files) |
| --- | --- | --- |
| 1 + 12 | **Drop `eslint-plugin-react-compiler` from the React stack's required peers** (it is opt-in and `moc()` never loads it). This removes the transitive pin to `zod-validation-error@3.5.4`, so `react-hooks` resolves a `4.x` that exposes `./v4`. Keep `react-compiler.eslint.ts` as an opt-in subpath export. | `src/core/manifest.ts` (STACKS.react.plugins), `package.json` (peer + peerDependenciesMeta), `exports`, docs. Verify empirically against `examples/react-app`. |
| 2 | **Resolve the React version concretely** instead of `'detect'`. Read the consumer's installed `react/package.json` version via `createRequire(<rootDir>/package.json)`, fall back to a recent literal (`'19.0'`) when unresolved. Never pass `'detect'` (its detector calls the removed `context.getFilename()`). | `src/config/react/react.eslint.ts` becomes a factory taking `{ rootDir }`; threaded through `src/config/react.eslint.ts` → `src/index.ts`. |
| 3 | **Allow the `*Props` convention**: add `props`/`Props` to the unicorn `prevent-abbreviations` allowList. | `src/config/node/unicorn.eslint.ts`. |
| 4 | **Scope out Node-builtin checks for React files**: disable `n/no-unsupported-features/node-builtins` for `**/*.{ts,tsx,jsx}` in the React overrides (only loaded when the React stack is active → never affects Node projects). | `src/config/react/react-overrides.eslint.ts`. |
| 5 | **Allow `void` as a statement**: `no-void: ['error', { allowAsStatement: true }]`, so the canonical floating-promise guard is legal. | wherever `no-void` is set (locate; likely `node/best-practices` or `node/eslint-rules`). |
| 6 | **Un-ban full English words** (`info`, `data`, …) in the naming denylist by post-overriding the offending `@typescript-eslint/naming-convention` selectors after extending `eslint-config-naming`. | `src/config/typescript/naming.eslint.ts`. |
| 7 | **One owner per concern**: keep `regexp/no-super-linear-backtracking` and `@typescript-eslint/no-deprecated`; turn off the `sonarjs` duplicates (`sonarjs/slow-regex`, `sonarjs/deprecation`). | `src/config/node/sonar.eslint.ts`. |
| 8 | **Components**: turn off `jsdoc/require-jsdoc` for `**/*.{jsx,tsx}` (FCs are not JSDoc'd by convention); **keep** `sonarjs/prefer-read-only-props` (good practice) and make example props `readonly`. | `src/config/react/react-overrides.eslint.ts` (jsdoc); example code (readonly). |
| 9 | **Disable `security/detect-object-injection`** — it is a warning-level, false-positive-prone rule that adds no value with typed keys. | `src/config/node/security.eslint.ts`. |
| 10 | **Relax `max-classes-per-file`** so a small co-located error hierarchy is allowed (set `off`). | wherever set (locate). |
| 11 | **Dogfood the React stack**: add a vitest test that composes `moc({ react: true })` and runs `ESLint.lintText` on a `.tsx` sample — asserting no crash and that the run completes. This reproduces Finding 2 today and guards it forever. | `tests/`, plus a small `fixtures/react-ts/` if needed. |

Example-code adjustments (not config): the email regex is rewritten to a
non-backtracking form; the deprecated `FormEvent` import is replaced with the
recommended type; `--fix` applies import-sort / Prettier / `array-type` /
`sort-union-types` / `prefer-alias` (relative-within-subtree); component prop
types are marked `readonly`.

### Why drop react-compiler from peers rather than force the override

npm `overrides` do not propagate from a dependency to the consumer, so the
repo's `overrides: { zod-validation-error: ^5 }` only protects the repo. The
crash is driven by `react-compiler@19.1.0-rc.2` pinning `zod-validation-error@3.5.4`.
Because `moc()` never imports `react-compiler` (it is wired only into the opt-in
`react-compiler.eslint.ts`), it has no business being a **required** peer. Making
it opt-in removes the pin from the default React install and fixes the crash for
the common case without any consumer action. (Opt-in React-Compiler users will
still need the override; that is documented.)

### React version resolution detail

`moc()` already passes `options` (including `rootDir`) into the stack factories.
`createReactConfig(options)` will forward `rootDir` to a new
`createReactRulesConfig({ rootDir })`, which computes
`settings.react.version` once at config-build time. The React stack only loads
when React is detected in the consumer's deps, so `react/package.json` is present
and resolvable; the literal fallback is pure defense-in-depth.

## Risks / Trade-offs

- **[Forcing a concrete React version could be slightly stale]** → It is read
  from the consumer's actually-installed `react`, so it matches reality; only the
  unreachable fallback is a literal.
- **[Relaxing rules (`detect-object-injection`, `max-classes-per-file`, naming
  denylist) weakens strictness]** → Each targets a demonstrated false-positive or
  anti-idiomatic rejection; stricter, higher-signal rules (`regexp/*`,
  `no-deprecated`, type-checking) remain.
- **[Dropping react-compiler from required peers changes the installer output]** →
  Intended; it was installing an unused plugin. Documented as opt-in.
- **[Dogfood lint test depends on react peer devDeps]** → They are already
  devDependencies of the repo; the test skips gracefully if absent.

## Migration Plan

Implement config fixes → rebuild `dist/` → in each example
`rm -rf node_modules && npm i` (react-app without workarounds) → `eslint .`
must exit 0 → add the dogfood test → `npm run test:run` green. Rollback is a
straight revert (no consumer data/state involved).

## Open Questions

- None blocking. The exact mechanism to override the `eslint-config-naming`
  denylist (re-declare selectors vs. narrow regex) is settled at implementation
  time after reading that package's config.
