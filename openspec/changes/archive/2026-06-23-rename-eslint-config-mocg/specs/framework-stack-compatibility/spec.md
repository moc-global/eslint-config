## MODIFIED Requirements

### Requirement: Framework stacks load without crashing in a clean consumer install

A framework stack composed by `mocg()` (React first) SHALL load and execute under
every ESLint version in the package's declared support range, in a fresh consumer
install, without aborting ESLint. The config SHALL NOT depend on npm `overrides`
declared in this repository to achieve this, because those do not propagate to
consumers.

#### Scenario: Clean React install lints successfully

- **WHEN** a consumer with `react`, `react-dom`, and the React peer plugins runs `npm install` and then `eslint .` with `export default mocg()`
- **THEN** ESLint runs to completion and reports lint results (it does not exit with a module-resolution or rule-loading crash)

#### Scenario: No missing subpath export breaks loading

- **WHEN** the React stack and its required peers are installed fresh
- **THEN** no transitive dependency resolves to a version missing a subpath export that another plugin imports (e.g. `zod-validation-error/v4`)

### Requirement: Required peers match the plugins the stack loads

A stack's set of required (non-optional) peer plugins SHALL contain only plugins
that the stack actually loads. A plugin that is opt-in (loaded only when the
consumer explicitly enables it) SHALL NOT be a required peer.

#### Scenario: React Compiler is opt-in, not required

- **WHEN** the React stack's required peers are inspected
- **THEN** `eslint-plugin-react-compiler` is absent (it is available only via the opt-in React Compiler config), and `mocg()` with the React stack does not import it

### Requirement: Framework stacks do not emit spurious errors on a standard project layout

A framework stack composed by `mocg()` SHALL NOT report errors that a consumer
following the framework's standard project layout cannot resolve. Filename and
import-resolution rules SHALL be scoped to what they can correctly evaluate for
that stack's file types.

#### Scenario: SFC PascalCase casing does not reject lowercase directories

- **WHEN** a `.vue` single-file component lives under a conventional lowercase path such as `src/components/Foo.vue`
- **THEN** `unicorn/filename-case` enforces PascalCase on the component filename only and does not require renaming directories like `src` or `components`

#### Scenario: Aliased imports in SFCs are not falsely flagged as missing

- **WHEN** a `.vue` file imports via a tsconfig path alias (e.g. `@/types/task`)
- **THEN** `n/no-missing-import` does not report it as unresolvable (alias resolution that n cannot perform for `.vue` files is not enforced there)

#### Scenario: Prettier solely owns SFC formatting

- **WHEN** a `.vue` file is autofixed (`eslint --fix`)
- **THEN** the fix converges — `prettier/prettier` and the framework's template formatting rules do not report contradictory fixes for the same code

### Requirement: Each framework stack is exercised by the repository's own checks

The repository's automated checks SHALL lint real framework source through
`mocg()` for every framework stack (React, NestJS, and Vue) so that a stack which
crashes ESLint at load or rule time, or emits spurious convention errors, fails
the test suite rather than shipping silently.

#### Scenario: React stack is linted in CI

- **WHEN** the test suite runs
- **THEN** it composes the React stack via `mocg({ react: true })` and runs ESLint over a `.tsx` sample, failing if ESLint crashes

#### Scenario: NestJS stack is linted in CI

- **WHEN** the test suite runs
- **THEN** it composes the NestJS stack via `mocg({ nest: true })` and runs ESLint over a decorated `.ts` sample, failing if ESLint crashes

#### Scenario: Vue stack is linted in CI

- **WHEN** the test suite runs
- **THEN** it composes the Vue stack via `mocg({ vueTs: true })` and runs ESLint over a `.vue` sample under a lowercase directory, failing if ESLint crashes or reports a directory-casing error

### Requirement: React Fast Refresh is a bundler add-on, not part of the React stack

The React stack SHALL be bundler-agnostic: it SHALL NOT bake in a bundler-specific
Fast Refresh preset. `react-refresh/only-export-components` is meaningful only with
an HMR-capable dev server, so the React configuration produced by
`createReactConfig()` SHALL NOT enable a Vite-specific Fast Refresh preset for every
consumer. Vite Fast Refresh SHALL instead be supplied by a dedicated `vite` add-on
that `mocg()` enables automatically when the project depends on `vite`, applying
`reactRefresh.configs.vite()`.

#### Scenario: Pristine React config carries no Vite Fast Refresh

- **WHEN** `createReactConfig()` is composed for a project that does not depend on `vite`
- **THEN** the resolved config does not enable `react-refresh/only-export-components` with the Vite preset

#### Scenario: Vite project keeps Fast Refresh via mocg()

- **WHEN** `mocg()` composes a project that depends on `vite` and `react`
- **THEN** the `vite` add-on is applied and `react-refresh/only-export-components` is enabled with `allowConstantExport` (so a constant exported alongside a component is tolerated)

#### Scenario: Vite add-on can be forced or disabled

- **WHEN** `mocg({ vite: true })` or `mocg({ vite: false })` is composed
- **THEN** the Vite Fast Refresh add-on is respectively force-enabled or force-disabled, overriding auto-detection

### Requirement: The Vite add-on is exercised by the repository's own checks

The repository's automated checks SHALL verify that a Vite-detected project receives
the Vite Fast Refresh add-on through `mocg()`, so a regression that drops Vite Fast
Refresh from `mocg()` Vite consumers fails the suite rather than shipping silently.

#### Scenario: Vite detection enables the add-on in CI

- **WHEN** the test suite composes `mocg()` for a fixture that depends on `vite` and `react`
- **THEN** the resolved config includes the Vite Fast Refresh add-on
