## ADDED Requirements

### Requirement: Interactive installer
The package SHALL provide an `init` command that detects the package manager and framework, installs required packages, writes an `eslint.config.mjs`, and adds lint scripts.

#### Scenario: Detects and pre-selects the stack
- **WHEN** `init` runs in a project whose dependencies indicate React
- **THEN** the wizard pre-selects the React stack and lists detected add-ons

#### Scenario: Writes config and scripts
- **WHEN** `init` completes in a project without an existing ESLint config
- **THEN** an `eslint.config.mjs` calling `moc()` is written and `lint`/`lint:fix` scripts are added to `package.json`

#### Scenario: Does not overwrite an existing config
- **WHEN** `init` runs and `eslint.config.mjs` already exists
- **THEN** the existing file is preserved and the suggested contents are printed instead

### Requirement: Non-interactive mode
The `init` command SHALL support non-interactive operation via `--yes`, `--preset`, and `--extras` for use in CI, templates, and scripts.

#### Scenario: Preset-driven install
- **WHEN** `init --preset nest --extras vitest --yes` runs
- **THEN** the NestJS stack and Vitest add-on are selected without prompts and the matching packages are installed

#### Scenario: Dry run makes no changes
- **WHEN** `init --dry-run` runs
- **THEN** intended actions are printed and no files are written and no packages are installed

### Requirement: Diagnostics command
The package SHALL provide a `doctor` command that verifies every plugin required by the detected stack is installed and resolvable, reporting missing packages with an install command.

#### Scenario: Reports a missing plugin
- **WHEN** `doctor` runs in a React project missing `eslint-plugin-react-refresh`
- **THEN** it reports the package as missing and prints a command to install it, exiting non-zero

### Requirement: Manifest single source of truth
The stack/add-on manifest SHALL source plugin version ranges from the package's own `peerDependencies`, shared by the installer, `doctor`, and runtime errors.

#### Scenario: Manifest ranges match declared peers
- **WHEN** the manifest lists a plugin for a stack
- **THEN** its version range equals that plugin's declared `peerDependencies` range
