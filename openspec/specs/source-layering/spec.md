# source-layering Specification

## Purpose
TBD - created by archiving change port-to-typescript-and-restructure. Update Purpose after archive.
## Requirements
### Requirement: Layered source structure
The source tree SHALL separate the ESLint rule product from the supporting machinery: rule modules and stack/extra barrels live under `src/config/`, shared machinery (detection, logger, tsconfig utilities, the stack manifest) lives under `src/core/`, the installer lives under `src/cli/`, and the public `moc()` orchestrator remains the `src/index` entry.

#### Scenario: Rule modules are isolated under config
- **WHEN** the source tree is inspected
- **THEN** every `*.eslint` rule module and stack/extra barrel resides under `src/config/`, and no rule module resides at the `src/` root or under `src/cli/`

#### Scenario: Manifest is shared, not CLI-local
- **WHEN** the stack/extra manifest is located
- **THEN** it resides under `src/core/` and is imported by both the orchestrator and the detection helper (it is not nested under `src/cli/`)

### Requirement: Enforced import boundaries
The repository SHALL apply `eslint-plugin-boundaries` to its own source to enforce the layer directions: `config` MUST NOT import from `cli`, `cli` MUST NOT import from `config`, and `core` MUST NOT import from `cli` or `config`.

#### Scenario: Forbidden cross-layer import fails lint
- **WHEN** a module under `src/config/` imports a module under `src/cli/` (or vice versa)
- **THEN** `npm run lint` reports a `boundaries/element-types` error

#### Scenario: Allowed dependencies pass
- **WHEN** the orchestrator imports from `core` and `config`, and `config`/`cli` import from `core`
- **THEN** lint passes with no boundary violation

### Requirement: Self-linting of TypeScript source
The repository SHALL lint its own TypeScript source with its own published config, loading the config from the TypeScript source directly (no build-before-lint), so the package's code is held to the full type-aware ruleset.

#### Scenario: Lint runs without a prior build
- **WHEN** `npm run lint` runs on a clean checkout (no `dist/`)
- **THEN** ESLint loads the TypeScript config via its loader and lints `src/` and `tests/` with the type-aware ruleset, exiting 0

#### Scenario: Public API surface is unchanged
- **WHEN** the package is consumed after restructuring
- **THEN** `moc()` and every subpath export (`./node`, `./react`, `./vue`, `./nest`, `./vitest`, `./jest`, `./zod`, `./i18n`, `./tailwind`, `./stacks`) resolve under their existing names

