# typescript-authoring-and-build Specification

## Purpose
TBD - created by archiving change port-to-typescript-and-restructure. Update Purpose after archive.
## Requirements
### Requirement: TypeScript source compiled to a distributable build
The package source SHALL be authored in TypeScript and compiled with `tsc` to a `dist/` directory of runnable ESM `.js` files, preserving the module structure 1:1 (no bundler) so every subpath export maps to a single emitted file.

#### Scenario: Build emits runnable ESM
- **WHEN** `npm run build` runs
- **THEN** `dist/index.js` and each subpath entry (`dist/config/node.eslint.js`, …) exist as ESM and import successfully under Node

#### Scenario: Output mirrors source layout
- **WHEN** the build completes
- **THEN** the `dist/` tree mirrors the `src/` layer layout (`config/`, `core/`, `cli/`, `index`) rather than a single bundled file

### Requirement: Consumer-facing type declarations
The build SHALL emit `.d.ts` declaration files alongside the JavaScript, and the package SHALL expose them via a `types` export condition so consumers get IntelliSense on `moc(options)` and every subpath.

#### Scenario: Declarations ship for every entry
- **WHEN** the package is packed
- **THEN** a `.d.ts` exists for the root entry and for each subpath export, and `package.json` `exports` declares a `types` condition for each

#### Scenario: Options are typed for consumers
- **WHEN** a TypeScript consumer calls `moc({ ... })`
- **THEN** the options object and return type are resolved from the shipped declarations without the consumer installing anything extra

### Requirement: CLI binary remains executable after build
The compiled CLI entry SHALL retain its `#!/usr/bin/env node` shebang and remain directly executable, and `bin` SHALL point at the built file.

#### Scenario: Built CLI runs
- **WHEN** `node dist/cli/index.js help` runs after a build
- **THEN** it prints the help output and exits 0, with the shebang present on the emitted file

### Requirement: Transpile-only source
The TypeScript configuration SHALL enable `erasableSyntaxOnly` so the source contains no runtime-emitting TypeScript constructs (no `enum`, no parameter properties), keeping the build a pure type-erasure step.

#### Scenario: No non-erasable syntax
- **WHEN** the project is type-checked
- **THEN** `erasableSyntaxOnly` reports no violations and the emitted JS differs from the source only by removed type annotations

