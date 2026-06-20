## ADDED Requirements

### Requirement: React Fast Refresh is a bundler add-on, not part of the React stack

The React stack SHALL be bundler-agnostic: it SHALL NOT bake in a bundler-specific
Fast Refresh preset. `react-refresh/only-export-components` is meaningful only with
an HMR-capable dev server, so the React configuration produced by
`createReactConfig()` SHALL NOT enable a Vite-specific Fast Refresh preset for every
consumer. Vite Fast Refresh SHALL instead be supplied by a dedicated `vite` add-on
that `moc()` enables automatically when the project depends on `vite`, applying
`reactRefresh.configs.vite()`.

#### Scenario: Pristine React config carries no Vite Fast Refresh

- **WHEN** `createReactConfig()` is composed for a project that does not depend on `vite`
- **THEN** the resolved config does not enable `react-refresh/only-export-components` with the Vite preset

#### Scenario: Vite project keeps Fast Refresh via moc()

- **WHEN** `moc()` composes a project that depends on `vite` and `react`
- **THEN** the `vite` add-on is applied and `react-refresh/only-export-components` is enabled with `allowConstantExport` (so a constant exported alongside a component is tolerated)

#### Scenario: Vite add-on can be forced or disabled

- **WHEN** `moc({ vite: true })` or `moc({ vite: false })` is composed
- **THEN** the Vite Fast Refresh add-on is respectively force-enabled or force-disabled, overriding auto-detection

### Requirement: The Vite add-on is exercised by the repository's own checks

The repository's automated checks SHALL verify that a Vite-detected project receives
the Vite Fast Refresh add-on through `moc()`, so a regression that drops Vite Fast
Refresh from `moc()` Vite consumers fails the suite rather than shipping silently.

#### Scenario: Vite detection enables the add-on in CI

- **WHEN** the test suite composes `moc()` for a fixture that depends on `vite` and `react`
- **THEN** the resolved config includes the Vite Fast Refresh add-on
