# build-based-distribution Specification

## Purpose
TBD - created by archiving change port-to-typescript-and-restructure. Update Purpose after archive.
## Requirements
### Requirement: Distribution ships the built output
The package SHALL publish the compiled `dist/` directory (JavaScript plus declarations) and SHALL NOT publish TypeScript source as the runnable surface. `files`, `main`, `bin`, and `exports` SHALL resolve to `dist/`.

#### Scenario: Tarball contains the build, not the source
- **WHEN** the package is packed with `npm pack`
- **THEN** the tarball contains `package.json` and `dist/` (with `.js` and `.d.ts`), and excludes `src`, `tests`, `fixtures`, and `docs`

#### Scenario: Subpath exports resolve to built files
- **WHEN** a consumer imports `@moc-global/eslint-config/react`
- **THEN** it resolves to the compiled `dist/config/react.eslint.js` with its declaration

### Requirement: Registry-agnostic publishing
The package SHALL be publishable to either a public or a private npm registry without source changes, with the target selected at publish time via `publishConfig`.

#### Scenario: Target chosen at publish time
- **WHEN** the maintainer publishes
- **THEN** the registry is determined by `publishConfig`/environment and no spec-level source change is required to switch between a public and a private registry

### Requirement: Git-dependency install builds via prepare
The package SHALL remain installable as a `git+ssh` dependency during migration by building itself through the `prepare` lifecycle, so a git consumer receives compiled output without committing `dist/` to the repository.

#### Scenario: Git install produces runnable output
- **WHEN** a consumer installs the package via a `git+ssh` URL
- **THEN** npm installs the build devDependencies, runs `prepare` to compile `dist/`, and the consumer can import the package and run the CLI

#### Scenario: Build artifacts are not committed
- **WHEN** the repository is inspected
- **THEN** `dist/` is git-ignored and absent from version control, produced only by the build

### Requirement: Versioning reflects the install-method change
Removing buildless installation SHALL be released as a major version bump, and the documentation SHALL describe the migration from the buildless/registry-free model to the build-based model.

#### Scenario: Install-method change is a major release
- **WHEN** this change is released
- **THEN** the version is bumped to the next major and the docs include a migration note covering the new install paths

> Supersedes the prior buildless/registry-free model: authoring in TypeScript requires a compile step (Node refuses to type-strip `.ts` inside `node_modules` — `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`), so a runnable build is mandatory. The `git+ssh` path keeps working via the `prepare` build during migration; subpath import names are unchanged.

