## ADDED Requirements

### Requirement: Umbrella factory composes the configuration
The package SHALL export a `moc(options)` factory that returns a Promise resolving to an ESLint flat-config array, composing the Node base, any enabled framework stack, and any enabled add-ons in a deterministic order.

#### Scenario: Zero-config default
- **WHEN** a consumer's `eslint.config.mjs` does `export default moc()`
- **THEN** ESLint receives a non-empty flat-config array containing the Node/TypeScript base

#### Scenario: Composition order is owned by the umbrella
- **WHEN** multiple stacks/add-ons are enabled
- **THEN** the Node base is emitted first, framework layers next, and add-ons last, so later blocks correctly override earlier ones

### Requirement: Dependency-based auto-detection
The factory SHALL detect stacks and add-ons from the consumer project's declared dependencies, and an explicit flag SHALL override detection.

#### Scenario: Detects a framework from dependencies
- **WHEN** the consumer's `package.json` lists `react`
- **THEN** `moc()` enables the React stack without an explicit flag

#### Scenario: Explicit flag overrides detection
- **WHEN** `react` is present in dependencies but the consumer calls `moc({ react: false })`
- **THEN** React rules are NOT included

### Requirement: Lazy optional-peer loading with actionable errors
Framework configs SHALL be loaded only when enabled, and a missing optional peer SHALL produce an actionable error naming the packages to install.

#### Scenario: Node-only project never resolves framework peers
- **WHEN** a Node-only project uses `moc()` and React/Vue plugins are not installed
- **THEN** configuration resolves successfully without attempting to import those plugins

#### Scenario: Missing peer yields install guidance
- **WHEN** `moc({ react: true })` runs but React plugins are absent
- **THEN** the thrown error names the missing packages and the `init` command

### Requirement: Type-aware TypeScript linting
The Node base SHALL enable type-aware TypeScript linting using the project service, auto-discovering `tsconfig.json` or honoring an explicit `tsconfig` option.

#### Scenario: tsconfig auto-discovery
- **WHEN** no `tsconfig` option is passed and a `tsconfig.json` exists at the root
- **THEN** type-aware rules lint `.ts` files using that tsconfig

### Requirement: Tolerate a missing .gitignore
The Node base SHALL honor the consumer's `.gitignore` as ignores when present and SHALL not fail when it is absent.

#### Scenario: No .gitignore present
- **WHEN** a consumer has no `.gitignore`
- **THEN** configuration resolves without error
