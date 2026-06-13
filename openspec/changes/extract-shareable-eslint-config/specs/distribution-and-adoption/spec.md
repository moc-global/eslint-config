## ADDED Requirements

### Requirement: Buildless packaging
The package SHALL ship runnable `.mjs` source with no build step, publishing only the `src` directory and exposing stacks via subpath exports.

#### Scenario: Tarball contains only source
- **WHEN** the package is packed with `npm pack`
- **THEN** the tarball contains `package.json` and `src` only, excluding fixtures, tests, and docs

#### Scenario: Subpath exports resolve
- **WHEN** a consumer imports `@moc-global/eslint-config/react`
- **THEN** the React factory resolves without a build step

### Requirement: Registry-free distribution
The package SHALL be installable as a git dependency and as a packed tarball without a package registry.

#### Scenario: Git dependency install
- **WHEN** a consumer declares the package via a `git+ssh` URL with a semver tag
- **THEN** it installs and runs without a separate build/prepare step

### Requirement: Legacy adoption via bulk suppressions
The package SHALL document and rely on ESLint bulk suppressions for adopting the config into codebases with existing violations, rather than a library-level legacy mode.

#### Scenario: Baseline existing violations
- **WHEN** a project with existing violations runs `eslint --suppress-all` after installing the config
- **THEN** existing violations are baselined and only new violations fail subsequent lint runs

### Requirement: Versioning policy
The package SHALL follow semver where adding or strengthening a rule is a minor bump, and consumers pin with a caret range.

#### Scenario: New rule is a minor release
- **WHEN** a new error-level rule is added
- **THEN** the release is a minor version bump and post-upgrade lint failures are treated as intended behavior
