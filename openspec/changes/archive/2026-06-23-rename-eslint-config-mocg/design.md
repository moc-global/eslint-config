## Context

The package currently identifies as the scoped `@moc-global/eslint-config` (version `2.1.0`, bin `moc-eslint`, umbrella export `moc()`). It has **never been published** — `npm view @moc-global/eslint-config` and `npm view eslint-config-mocg` both 404 — so this is a rename *before* first publish, not a migration of a live package. There is no Snowflake, database, or external data surface in this repository; it is a pure ESLint shareable-config + installer CLI distributed as an npm tarball.

The old identity appears across ~60+ files in two distinct token families that must not be confused: the **package name** (`@moc-global/eslint-config`, which contains the substring `moc`) and the **API symbol** (`moc()` / `MocOptions`). Company decision: publish as the unscoped, convention-correct `eslint-config-mocg`, fully rebrand the API to `mocg()` / `MocgOptions`, rename the bin to `eslint-config-mocg`, and bump to `2.2.0`.

A key architectural fact shapes the work: `src/core/manifest.ts` exports `PACKAGE_NAME = packageJson.name`, and the CLI help/usage, error messages, and the generated `eslint.config.mjs` all read from it. So the package-name change has a single functional linchpin (`package.json` → `name`) that cascades automatically; everything else is hard-coded strings.

## Goals / Non-Goals

**Goals:**
- After this change, `npm publish` ships `eslint-config-mocg@2.2.0` with a consistent public surface: name, `mocg()` export, `eslint-config-mocg` bin, generated config, docs, examples, tests, and living specs all agree.
- Zero stale references to the old identity in shipped or living artifacts (verified by an exhaustive grep gate).
- The existing verification net (unit + e2e example installs) proves the rename end-to-end.

**Non-Goals:**
- Moving the Git repository / homepage / bugs URLs (they stay at `dmytro-vakulenko-moc/eslint-config`).
- Renaming subpath exports (`./node`, `./react`, `./next`, …) or the `create*Config` factories — only the umbrella `moc` → `mocg`.
- Rewriting company branding (docs footer "Master of Code Global", the logo SVG `moc-logo` id) — these name the company, not the package.
- Rewriting archived OpenSpec history or past `CHANGELOG` entries — historical record stays; we append a `[2.2.0]` entry.
- Re-scoping to a different npm org or changing `publishConfig.access`.

## Decisions

**1. Unscoped `eslint-config-mocg` over keeping a scope.** Decided by the company. It follows the `eslint-config-*` shareable-config convention, the name is available on npm, and there is no published scoped package to retire. `publishConfig.access: "public"` is kept (it is the default for unscoped and harmless if the package is ever re-scoped). *Alternative considered:* `@mocg/eslint-config` (keep a scope) — rejected; the company chose unscoped.

**2. Full API rebrand `moc()` → `mocg()` (and `MocOptions` → `MocgOptions`), not package-name-only.** Decided by the user. Keeps the public verb consistent with the brand. *Trade-off:* this is the part that changes generated consumer config (`src/cli/project.ts` emits `import { mocg } from 'eslint-config-mocg'`) and every documented example, so it is genuinely breaking — but since the package name itself changes, every consumer must rewrite their dependency line regardless, so there is no in-place upgrade to break. *Alternative:* keep `moc()` — rejected for brand inconsistency.

**3. Bin = `eslint-config-mocg` (matches the package name).** The CLI is overwhelmingly invoked as `npx eslint-config-mocg init`, so an installed bin that mirrors the package name is the least surprising. *Alternative:* `mocg` (shorter) — rejected in favor of exact consistency with the package name.

**4. Version `2.2.0` (minor), not `3.0.0`.** Chosen deliberately. By strict SemVer a public-symbol rename is breaking (major), but with no published package and no in-place upgrade path, the bump is bookkeeping; `2.2.0` preserves the real maturity reflected in the existing history.

**5. Token-aware replacement, never a blind `s/moc/mocg/`.** `moc` is a substring of `@moc-global` and `moc-eslint`. The two families are transformed by distinct, anchored rules (see below). The package-name target `eslint-config-mocg` contains no standalone `moc(` token, and the API target `mocg(` is anchored on the call/identifier form — so the two sweeps cannot collide.

**6. Living specs are updated via OpenSpec deltas, not hand-edits.** Seven living specs reference a renamed token. Because `openspec archive` syncs deltas into `openspec/specs/`, each affected requirement is restated under `## MODIFIED Requirements` (full body, exact `### Requirement:` header) so the sync lands. A new `package-identity` spec captures the canonical name/export/bin/version contract — which the existing `tests/stacks.test.mjs` (asserts `PACKAGE_NAME`) and `tests/project.test.mjs` (asserts the generated import) already test.

### Token transformation rules

```
Family A — PACKAGE NAME (string literal, no standalone "moc(")
  @moc-global/eslint-config            → eslint-config-mocg
  @moc-global/eslint-config/<subpath>  → eslint-config-mocg/<subpath>
  moc-eslint            (bin key)      → eslint-config-mocg
  moc-global-eslint-config-2.1.0.tgz   → eslint-config-mocg-2.2.0.tgz   (name + version)

Family B — API SYMBOL (identifier / call form)
  moc(            → mocg(           |  { moc }        → { mocg }
  default moc;    → default mocg;   |  function moc(  → function mocg(
  MocOptions      → MocgOptions     |  `moc()` (prose) → `mocg()`

UNTOUCHED
  company branding: "Master of Code Global", id="moc-logo"
  repo/homepage/bugs URLs: dmytro-vakulenko-moc/eslint-config
  subpath export *names*: ./node ./react ./next … (only the leading specifier changes)
  archived openspec/changes/archive/**, historical CHANGELOG [2.1.0]/[2.0.0] sections
```

### The example triad (must move together)

```
examples/*/package.json
  "@moc-global/eslint-config": "file:../../moc-global-eslint-config-2.1.0.tgz"
   └─ dep KEY → eslint-config-mocg   └─ TARBALL → eslint-config-mocg-2.2.0.tgz
examples/*/eslint.config.mjs
  import { moc } from '@moc-global/eslint-config'; export default moc();
   → import { mocg } from 'eslint-config-mocg'; export default mocg();
```
If any leg lags, `verify:examples` (real `npm install` of the packed tarball) fails — which is the safety net, not a risk.

## Risks / Trade-offs

- **Silent MODIFIED data loss at archive** (OpenSpec restates by exact header; a mismatched `### Requirement:` title drops that requirement's update silently) → After archive, grep every living spec for `@moc-global`, `moc-eslint`, `\bmoc(`, `MocOptions`, `2.1.0` and require zero hits; run `openspec validate --specs --strict`.
- **Blind find/replace corrupting `@moc-global`/`moc-eslint`** → Family-anchored rules above; verify with a post-sweep grep that no `@moc-global`, `moc-eslint`, standalone `moc(`, or `MocOptions` remains outside historical/archived paths and company branding.
- **Tarball/version drift in examples** → The five example `file:` deps embed `…-2.1.0.tgz`; the name *and* version both change. `verify:examples` packs the real tarball and installs it, so any drift fails loudly.
- **Hard-coded name in runtime code** (`src/cli/doctor.ts:100` prints `npx @moc-global/eslint-config init` as a literal, not via `PACKAGE_NAME`) → Update it; prefer deriving from `PACKAGE_NAME` so it can never drift again.
- **Built docs out of sync** (`docs/.vitepress/dist/` contains the old name in compiled HTML) → It is gitignored; never hand-edited, just rebuilt by `docs:build` when needed.
- **npm name later taken** → Low; verified available today, and `pack:check` confirms the resolved name before any publish.

## Migration Plan

1. Flip the linchpin: `package.json` `name` → `eslint-config-mocg`, `version` → `2.2.0`, `bin` key → `eslint-config-mocg`. Run `npm install` to regenerate `package-lock.json`.
2. Rebrand the API in `src/` (`mocg`/`MocgOptions`), update the config generator and the `doctor.ts` literal, and sweep source JSDoc.
3. Sweep docs, examples (the triad), GitHub meta, and tests to the new name/export/version.
4. Update living specs through the change deltas; archive syncs them.
5. Verify: `test:run`, `typecheck`, `lint`, `pack:check`, `verify:examples`, plus the stale-token grep gate.

**Rollback:** the change is confined to a feature branch and contains no data migrations or external side effects, so rollback is `git revert`/branch-drop with no cleanup. Nothing is published until a separate, deliberate `npm publish`.

## Open Questions

None — name (`eslint-config-mocg`), API (`mocg()`/`MocgOptions`), bin (`eslint-config-mocg`), version (`2.2.0`), repo URLs (unchanged), and historical/branding scope are all decided.
