## ADDED Requirements

### Requirement: Framework stacks do not emit spurious errors on a standard project layout

A framework stack composed by `moc()` SHALL NOT report errors that a consumer
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

## MODIFIED Requirements

### Requirement: Each framework stack is exercised by the repository's own checks

The repository's automated checks SHALL lint real framework source through
`moc()` for every framework stack (React, NestJS, and Vue) so that a stack which
crashes ESLint at load or rule time, or emits spurious convention errors, fails
the test suite rather than shipping silently.

#### Scenario: React stack is linted in CI

- **WHEN** the test suite runs
- **THEN** it composes the React stack via `moc({ react: true })` and runs ESLint over a `.tsx` sample, failing if ESLint crashes

#### Scenario: NestJS stack is linted in CI

- **WHEN** the test suite runs
- **THEN** it composes the NestJS stack via `moc({ nest: true })` and runs ESLint over a decorated `.ts` sample, failing if ESLint crashes

#### Scenario: Vue stack is linted in CI

- **WHEN** the test suite runs
- **THEN** it composes the Vue stack via `moc({ vueTs: true })` and runs ESLint over a `.vue` sample under a lowercase directory, failing if ESLint crashes or reports a directory-casing error
