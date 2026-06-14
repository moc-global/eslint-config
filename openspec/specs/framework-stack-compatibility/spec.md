# framework-stack-compatibility Specification

## Purpose
Guarantee that framework stacks composed by `moc()` (React first) load and run in a fresh consumer install without crashing ESLint, resolve framework versions without removed ESLint APIs, scope rules to the stack's actual runtime, keep required peers consistent with the plugins the stack loads, and are exercised by the repository's own checks so regressions surface before shipping.

## Requirements
### Requirement: Framework stacks load without crashing in a clean consumer install

A framework stack composed by `moc()` (React first) SHALL load and execute under
every ESLint version in the package's declared support range, in a fresh consumer
install, without aborting ESLint. The config SHALL NOT depend on npm `overrides`
declared in this repository to achieve this, because those do not propagate to
consumers.

#### Scenario: Clean React install lints successfully

- **WHEN** a consumer with `react`, `react-dom`, and the React peer plugins runs `npm install` and then `eslint .` with `export default moc()`
- **THEN** ESLint runs to completion and reports lint results (it does not exit with a module-resolution or rule-loading crash)

#### Scenario: No missing subpath export breaks loading

- **WHEN** the React stack and its required peers are installed fresh
- **THEN** no transitive dependency resolves to a version missing a subpath export that another plugin imports (e.g. `zod-validation-error/v4`)

### Requirement: Framework version is resolved without removed ESLint APIs

The React configuration SHALL provide `settings.react.version` as a concrete
version resolved from the consumer's installed `react`, and SHALL NOT use
`'detect'`, whose detector calls `context.getFilename()` — an API removed in the
supported ESLint range.

#### Scenario: React version comes from the installed package

- **WHEN** the React config is composed for a project with `react` installed
- **THEN** `settings.react.version` equals the installed React version and no version-detection code path runs

#### Scenario: Rule loading does not call removed context APIs

- **WHEN** a React rule that needs the React version (e.g. `react/display-name`) loads
- **THEN** it does not throw `getFilename is not a function`

### Requirement: Environment-specific rules match the stack's runtime

When the React stack is active, rules that assume a Node.js runtime SHALL NOT be
applied to browser-targeted source. In particular, Node-builtin availability
checks SHALL NOT flag standard browser globals.

#### Scenario: Browser API is not flagged as an unsupported Node builtin

- **WHEN** React source uses a browser global such as `localStorage`
- **THEN** `n/no-unsupported-features/node-builtins` does not report it

### Requirement: Required peers match the plugins the stack loads

A stack's set of required (non-optional) peer plugins SHALL contain only plugins
that the stack actually loads. A plugin that is opt-in (loaded only when the
consumer explicitly enables it) SHALL NOT be a required peer.

#### Scenario: React Compiler is opt-in, not required

- **WHEN** the React stack's required peers are inspected
- **THEN** `eslint-plugin-react-compiler` is absent (it is available only via the opt-in React Compiler config), and `moc()` with the React stack does not import it

### Requirement: Each framework stack is exercised by the repository's own checks

The repository's automated checks SHALL lint real framework source through
`moc()` so that a stack that crashes ESLint at load or rule time fails the test
suite rather than shipping silently.

#### Scenario: React stack is linted in CI

- **WHEN** the test suite runs
- **THEN** it composes the React stack via `moc({ react: true })` and runs ESLint over a `.tsx` sample, failing if ESLint crashes
