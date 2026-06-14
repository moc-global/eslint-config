# `@moc-global/eslint-config` — Research & Design Notes

> Status: **Exploration complete, pre-proposal.** Captures the design decisions for
> extracting this repo's ESLint setup into a shareable, company-wide config package
> plus an installer CLI.
>
> Date: 2026-06-13 · Owner: Dmytro Vakulenko

---

## 1. Goal

Turn the ESLint setup that currently lives inside `typescript-boilerplate` into a
standalone, shareable package — **`@moc-global/eslint-config`** — so every company
project consumes the same, centrally-governed linting rules. Ship it with a small
**installer CLI** that detects the project type (Node/TS, NestJS, React, Vue),
installs the right plugins, and writes a minimal config file. Manual installation
(no wizard) stays fully supported.

---

## 2. Why this repo is a strong starting point

The codebase is already most of the way to a publishable library:

- **Factory pattern already exists.** `createNodeConfig(options)`, `createReactConfig()`,
  `createVueConfig()`, `createVueTsConfig()` with `rootDir` / `tsconfig` / `gitignore`
  options. This is the exact API shape a published config needs — the work is
  *extraction*, not redesign.
- **Implicit optional-plugin model already in place.** The react/vue/i18n/jest/tailwind
  configs import plugins that are **not** in this repo's `package.json`. That works today
  only because nothing imports those files here; in a published package it becomes a real
  decision — and the installer is the answer to it.
- **Runtime helpers travel cleanly.** `tsconfig.utils.mjs` (auto-discovery, project
  references, path merging) and `logger.mjs` are plain Node with no repo-specific
  assumptions. They publish as-is and are part of what makes this config better than a
  static ruleset.
- **airbnb-base already removed.** Replaced by an owned `best-practices.eslint.mjs` +
  `import-x` ruleset (commit `d8cca8b`). This eliminated the biggest foundational
  liability — a config the whole company depends on can't sit on an unmaintained
  flat-config-incompatible base.

---

## 3. Locked decisions (v1)

| Area | Decision |
|---|---|
| **Repo** | New repo. `typescript-boilerplate` stays as-is and becomes the **first consumer** (permanent dogfooding ground). |
| **Package name** | `@moc-global/eslint-config` |
| **Build** | **Buildless** — ship plain `.mjs`, no compile step. (Protects git-dependency installs and keeps things simple.) |
| **Dependency model** | Core plugins = bundled **`dependencies`** (central version governance). Framework plugins (react/vue/nest/tailwind) = **optional peers** (`peerDependenciesMeta: { optional: true }`), loaded via subpath exports so Node-only projects never resolve them. |
| **API entry** | Umbrella factory `moc({ flags })` with **auto-detection** (zero-config `moc()` works in most projects). Named factories (`createNodeConfig`, etc.) stay exported as the low-level escape hatch. |
| **Distribution** | **Git dependency** (`git+ssh://…#semver:^1`) **and** `npm pack` tarball (`file:./…tgz`). No registry yet. |
| **CLI** | `init` (wizard: detect → ask → install → write config → patch scripts; supports `--preset` / `--yes` for non-interactive use) and `doctor` (check installed plugin versions against the manifest). |
| **Manifest** | A `STACKS` map exported from the library is the **single source of truth** consumed by the wizard, `doctor`, and the helpful error messages. |
| **Legacy adoption** | Use ESLint **bulk suppressions** (`--suppress-all` → `eslint-suppressions.json`) as the ratchet. No `legacy: true` mode needed in the library. |
| **Testing** | Fixture projects (`fixtures/node-ts`, `react`, `vue`, `nest`) linted by the real `eslint` binary + `--print-config` snapshots + a `npm pack` install smoke-test. |
| **Versioning** | Rule additions = **minor**. Consumers pin with `^`. A CI failure after upgrade is **intended behavior**, not a break. |
| **Node floor** | **Node 22.** Update old projects rather than fighting old versions. |
| **Prettier** | **Bundled** into this package for v1 (config already drags Prettier via `eslint-plugin-prettier`). |
| **Maintenance** | Single owner (Dmytro), maximum checks. Cleverness (logger, auto-discovery, async peer loading) is justified — pair it with a `CONTRIBUTING.md` explaining the indirection for future maintainers. |

---

## 4. The central architectural decision: where the ~30 plugins live

```
                 ┌─────────────────────────────────────────┐
                 │   @moc-global/eslint-config deps model   │
                 └─────────────────────────────────────────┘
        Option A: peerDependencies          Option B: bundled dependencies
        (classic eslint-config style)       (antfu / sheriff style)  ← CHOSEN

  consumer installs 30+ plugins        consumer installs 1 package
  themselves; versions drift per       plugin versions controlled
  project; conflicts get noisy         centrally — one bump in the
                                       library updates every project
```

**Chosen: Option B (bundled), with framework plugins as the exception.**

- Core plugins (typescript-eslint, unicorn, sonarjs, perfectionist, stylistic, prettier,
  etc.) → `dependencies`. The governance win is the whole point: upgrade + tune a rule
  once, every project gets the tested combination on `npm update`.
- Framework plugins (react, vue, nest, tailwind) → **optional peers** loaded via subpath
  exports. `@moc-global/eslint-config/react` is the only entry importing
  `eslint-plugin-react`, so Node projects never pull Vue/React plugins.

This is exactly where the installer earns its keep — it installs the right optional peers
for the selected stack.

---

## 5. API shape

```js
// eslint.config.mjs — the whole file in a consuming project
import { moc } from '@moc-global/eslint-config';

export default moc({
  react: true,    // or omit — auto-detected from package.json
  vitest: true,
  zod: true,
});
```

- `moc()` auto-detects via `isPackageExists('react')` etc., so zero-config does the right
  thing in most projects.
- The umbrella owns **composition order** — e.g. the "overrides must be last" invariant
  (currently `node.eslint.mjs:111`) becomes the library's responsibility, not the
  consumer's.
- Framework entries use dynamic `await import()` so that `react: true` **without**
  `eslint-plugin-react` installed fails with a *helpful* error:
  `run "npx @moc-global/eslint-config init" or install: eslint-plugin-react …`.
  ESLint supports async configs, so this works — but it's a structural decision to make
  **before** extraction.

---

## 6. The installer CLI

```
npx @moc-global/eslint-config init        (or: npm create @moc-global/eslint)
        │
        ├─ detect: package manager (lockfile), existing eslint config,
        │          framework (react/vue/nest already in package.json?)
        ├─ ask:    stack? (Node/TS · NestJS · React · Vue)   ← pre-selected from detection
        │          extras? (vitest/jest · zod · i18n · tailwind)
        ├─ install: @moc-global/eslint-config + the optional peers for that stack
        ├─ write:  eslint.config.mjs (a ~10-line file calling the factory)
        └─ patch:  package.json scripts (lint, lint:fix), maybe .vscode/settings.json
```

Design principles:

1. **Auto-detect before asking.** Propose answers (found `react` → pre-select React) so
   for most projects it's "press Enter twice."
2. **Non-interactive mode** (`init --preset nest --yes`) for templates, CI, and agents
   setting up new repos.
3. **Wizard is optional.** Manual path = `npm i -D @moc-global/eslint-config eslint-plugin-vue`
   + write the config yourself. The CLI is a `bin` entry **inside** the one package — not
   a second package to version/publish.

---

## 7. Single source of truth: the `STACKS` manifest

```js
export const STACKS = {
  react: { plugins: { 'eslint-plugin-react': '^7.37.0', 'eslint-plugin-react-hooks': '^7.0.0', /* … */ } },
  vue:   { plugins: { 'eslint-plugin-vue': '^10.0.0' } },
  nest:  { plugins: { '@darraghor/eslint-plugin-nestjs-typed': '^7.1.0' } },
  // …
};
```

Three consumers, one source:

- **`init` wizard** — what to install for a chosen stack.
- **`doctor` command** — compares installed plugin versions against the manifest.
  (`scripts/find-missing-deps.scripts.ts` is effectively a prototype of this.) Worth more
  than it looks: "why does lint behave differently on my machine" becomes a command, not a
  Slack thread.
- **Helpful error messages** from the async peer loading.

Bump a plugin → update exactly one place.

---

## 8. Legacy / soft adoption — ESLint bulk suppressions

Shipped in ESLint v9.24. This is the "soft adoption" mechanism that makes company-wide
rollout to old projects actually feasible:

```
npx eslint --suppress-all          →  writes eslint-suppressions.json
                                      (a baseline of every existing violation)
```

After that:

- All **existing** violations are silenced → CI is green on day one.
- Any **new** violation (new code, or new errors in touched files) fails normally.
- Fixing a violation and re-running prunes it (`--prune-suppressions`) → the file only
  shrinks. It's a **ratchet**.

```
install config → suppress-all → CI green immediately
      │
      ├── new code held to full standard from day one
      └── agent refactors the baseline file by file, at leisure,
          tests verifying each chunk — no big-bang risk
```

The installer can ask: *"Existing violations found (1,243). Suppress as baseline? [Y/n]"*.
Costs nothing — built into ESLint, no library support needed.

---

## 9. Distribution mechanisms (no registry yet)

| Mechanism | How | Good for |
|---|---|---|
| **Git dependency** | `"@moc-global/eslint-config": "git+ssh://git@github.com/moc/eslint-config.git#semver:^1"` | Teammates, version-pinned, private via SSH. No registry infra. |
| **npm pack tarball** | `npm pack` → `…​.tgz`, install via `file:./vendor/…tgz` | Air-gapped / vendored installs. Also the right **CI smoke-test** — pack + install into a fixture catches missing `files` / bad `exports` before publish. |
| `file:` / `npm link` | local path | Local development only (first-consumer dogfooding). |

**Caveat:** git deps don't run `prepare` builds unless configured — so keep the package
**buildless** (already true here). Treat buildless as a protected design constraint.

Migrating to GitHub Packages / npm later is **non-breaking**.

---

## 10. Testing strategy

- **Fixture projects**: `fixtures/{node-ts,react,vue,nest}` — minimal projects with
  deliberately-bad code. CI runs the real `eslint` binary against each and snapshots which
  rules fire. Catches the real failure mode: a plugin upgrade silently changing behavior.
- **`--print-config` snapshots**: assert the resolved config for a representative file
  doesn't change unexpectedly. This makes the versioning policy (rule additions = minor)
  **enforceable** — the snapshot diff tells you patch vs. minor vs. breaking.
- **Wizard test**: `init --preset react --yes` against a temp fixture, then assert the
  produced project lints.
- **Pack test**: `npm pack` + install the tarball into a fixture (see §9).

---

## 11. Versioning policy

- Rule additions = **minor** version bump.
- Consumers pin with `^` and upgrade deliberately.
- A CI failure after upgrading the config is **intended behavior** (the new rule found a
  real issue), not a regression.

---

## 12. Future ideas — noted, **out of v1 scope**

- Split into a **`@moc-global/code-style`** umbrella with siblings:
  `eslint-config` · `prettier-config` · `tsconfig`. For v1, Prettier stays **bundled**
  inside `@moc-global/eslint-config`.
- Name the CLI/repo so prettier-config and tsconfig packages can join **without a rename**
  (e.g. CLI verb `init`, not `init-eslint`).
- The installer could also write the Prettier config file, base `tsconfig`, and
  `.vscode/settings.json` from templates.

### Open question carried forward

- **Repo shape**: `moc-global/eslint-config` (narrow, matches package name) **vs.**
  `moc-global/code-style` (umbrella now, eslint-config as first workspace). Affects the
  eventual repo layout but not the v1 package. Not committed yet.

---

## 13. Suggested implementation phases

1. **Extract** the `.eslint/` tree into the new repo; wire `package.json` exports
   (subpaths per framework), `files`, `peerDependenciesMeta`.
2. **Umbrella factory** `moc({ flags })` + auto-detection; preserve composition order
   invariants; async peer loading with helpful errors.
3. **`STACKS` manifest** + `init` wizard (+ `--preset`/`--yes`) + `doctor` command.
4. **Fixtures + tests** (lint snapshots, `--print-config`, pack smoke-test).
5. **Docs**: `README.md` (install: wizard + manual + git-dep + tarball), `CONTRIBUTING.md`
   (explain logger / auto-discovery / async peer loading), legacy-adoption guide
   (`--suppress-all`).
6. **Dogfood**: make `typescript-boilerplate` consume the published package.

---

## 14. Reference — current `.eslint/` structure (source of the extraction)

- **Entry**: `eslint.config.mjs` → composes `node` + `vitest` + `zod` configs.
- **`node.eslint.mjs`**: `createNodeConfig(options)` — the core. Composes ~20 rulesets
  under `node/` (best-practices, import-x, jsdoc, stylistic, n, sonar, prettier,
  ordered-imports, import-alias, unused-imports, no-secrets, security, perfectionist,
  unicorn, no-barrel-files, promise, regexp, depend, lintlord, custom-style) + TypeScript
  config, with per-file overrides last.
- **Framework factories**: `react.eslint.mjs` (`createReactConfig`),
  `vue.eslint.mjs` (`createVueConfig` / `createVueTsConfig`), `nest.eslint.mjs`,
  plus `i18n`, `jest`, `tailwind` — each importing plugins **not** in this repo's deps
  (the optional-peer set).
- **Helpers**: `tsconfig.utils.mjs` (tsconfig auto-discovery + path/reference merging),
  `logger.mjs`, `eslint-compat.config.mjs`.
- **Boundaries**: per-stack `boundaries/{node,nest,react,vue}.eslint.mjs`.
