# package-identity Specification

## Purpose
TBD - created by archiving change rename-eslint-config-mocg. Update Purpose after archive.
## Requirements
### Requirement: Package is published under the unscoped name eslint-config-mocg

The package SHALL declare its npm name as `eslint-config-mocg` (unscoped) in `package.json`, SHALL set its version to `2.2.0` or later, and SHALL expose a CLI bin entry named `eslint-config-mocg`. The package SHALL NOT publish under the former scoped name `@moc-global/eslint-config` or the former bin `moc-eslint`.

#### Scenario: Manifest declares the canonical identity

- **WHEN** `package.json` is read
- **THEN** `name` equals `eslint-config-mocg`, `version` is `>= 2.2.0`, and `bin` contains an `eslint-config-mocg` entry

#### Scenario: Packed tarball carries the new name and version

- **WHEN** `npm pack --dry-run` is run
- **THEN** the resolved tarball filename is `eslint-config-mocg-<version>.tgz` (e.g. `eslint-config-mocg-2.2.0.tgz`), not `moc-global-eslint-config-*.tgz`

### Requirement: The public umbrella factory is named mocg

The public umbrella factory SHALL be exported as `mocg()` with its options type exported as `MocgOptions`. The former `moc` / `MocOptions` names SHALL NOT be exported. Subpath export names (`./node`, `./react`, `./next`, `./vue`, `./nest`, `./vitest`, `./jest`, `./zod`, `./i18n`, `./tailwind`, `./stacks`) and the `create*Config` factories SHALL be unchanged.

#### Scenario: Consumer imports the umbrella under the new name

- **WHEN** a consumer writes `import { mocg } from 'eslint-config-mocg'` and calls `mocg()`
- **THEN** it resolves to the umbrella factory and returns the composed flat-config array

#### Scenario: Legacy export names are gone

- **WHEN** the package's public types and exports are inspected
- **THEN** `MocgOptions` is the umbrella options type and no `moc` or `MocOptions` export is present

### Requirement: CLI output and generated config derive from the package name

CLI usage/help text, missing-peer error messages, and the installer-generated `eslint.config.mjs` SHALL derive the package name from `package.json` (via the `PACKAGE_NAME` constant) so they always match the published name. The generated config file SHALL contain `import { mocg } from 'eslint-config-mocg'` and a `mocg(...)` default export.

#### Scenario: Generated config uses the new name and export

- **WHEN** the installer generates an `eslint.config.mjs`
- **THEN** the file contains `import { mocg } from 'eslint-config-mocg'` and a default export that calls `mocg(...)`

#### Scenario: Missing-peer guidance references the new name

- **WHEN** a required peer dependency is missing and the package emits remediation guidance
- **THEN** the guidance references `npx eslint-config-mocg init` (derived from `PACKAGE_NAME`, not a hard-coded literal)

