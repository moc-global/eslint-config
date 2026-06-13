# Contributing

## Repository layout

```
src/
  index.mjs            # the moc() umbrella + public re-exports
  detect.mjs           # dependency-based stack auto-detection
  node.eslint.mjs      # createNodeConfig — the base
  react.eslint.mjs     # createReactConfig
  vue.eslint.mjs       # createVueConfig / createVueTsConfig
  nest.eslint.mjs      # createNestConfig (Node + Nest)
  vitest|jest|zod|i18n|tailwind.eslint.mjs   # add-on entries
  node/                # the individual core rulesets (one file per plugin)
  typescript/          # type-aware TS rulesets
  react/ vue/ nest/ …  # framework-specific rulesets
  boundaries/          # per-stack architectural-boundary configs
  logger.mjs           # namespaced debug logger
  tsconfig.utils.mjs   # tsconfig discovery + path/reference merging
  cli/
    index.mjs          # the bin entry (init / doctor / help)
    init.mjs           # the installer wizard
    doctor.mjs         # the diagnostics command
    project.mjs        # PM detection, config generation, script patching
    stacks.mjs         # the STACKS / EXTRAS manifest (single source of truth)
    ui.mjs             # zero-dependency terminal output helpers
fixtures/              # sample projects for integration tests (deliberately-bad code)
tests/                 # vitest suites
docs/                  # this VitePress site
```

## Dev workflow

```bash
npm install            # uses legacy-peer-deps (see below)
npm run lint           # the package lints itself with its own config
npm run typecheck      # tsc over @ts-check-annotated source
npm run test:run       # vitest
npm run docs:dev       # preview these docs
```

::: tip Buildless on purpose
The package ships plain `.mjs`. There is **no build step** — what's in `src/` is what's published. This keeps git-dependency and tarball installs working and means there is nothing to get out of sync. Don't introduce a compile step.
:::

## Conventions this repo holds itself to

The package eats its own dog food: `npm run lint` runs `moc()` against `src/`, so the config's own source must pass the company standard. A few deliberate design choices:

- **`// @ts-check` opt-in.** The authored `.mjs` files (umbrella, detect, CLI) carry JSDoc types and are type-checked. The ported rule modules are validated by ESLint and the fixture tests rather than `checkJs`.
- **The `STACKS` manifest is the single source of truth.** Plugin version ranges are read from this package's own `peerDependencies` — never hard-coded. When you bump a peer version, the manifest, the installer, `doctor`, and the error messages all update together. A test enforces this.
- **`legacy-peer-deps`.** Some ESLint plugins haven't widened their peer ranges to declare ESLint 10 yet (they work with it). The `.npmrc` accepts those ranges in this dev environment. Published consumers resolve their own dependency trees.

## Adding or changing a rule

1. Edit the relevant ruleset module under `src/`.
2. Run `npm run test:run`. The fixture-based integration tests lint real sample code and assert which rule IDs fire — update or add a fixture if you're introducing new behavior.
3. Decide the version bump using the [versioning policy](/guide/versioning). A new error-level rule is a **minor**.
4. Update the [Rules & plugins reference](/reference/plugins) so the docs stay accurate.

## Adding a stack or add-on

1. Add a ruleset entry module (e.g. `src/svelte.eslint.mjs`) and a subpath export in `package.json`.
2. Register it in `src/cli/stacks.mjs` with its `detect` markers and optional-peer `plugins`.
3. Wire it into `moc()` in `src/index.mjs` (or, for an add-on, it's picked up automatically from `EXTRAS`).
4. Add its peers to `package.json` (`peerDependencies` + `peerDependenciesMeta.optional`), and a fixture + tests.

## Testing strategy

- **Unit tests** cover the manifest, detection, and CLI helpers.
- **Integration tests** build the real `moc()` config and run the ESLint API against fixture projects, asserting that specific rules fire on bad code and that clean code passes.
- **Pack check** (`npm run pack:check`) confirms the published tarball contains only `src/` — no fixtures, tests, or docs.
