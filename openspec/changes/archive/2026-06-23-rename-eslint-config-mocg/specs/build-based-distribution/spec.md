## MODIFIED Requirements
### Requirement: Distribution ships the built output
The package SHALL publish the compiled `dist/` directory (JavaScript plus declarations) and SHALL NOT publish TypeScript source as the runnable surface. `files`, `main`, `bin`, and `exports` SHALL resolve to `dist/`.

#### Scenario: Tarball contains the build, not the source
- **WHEN** the package is packed with `npm pack`
- **THEN** the tarball contains `package.json` and `dist/` (with `.js` and `.d.ts`), and excludes `src`, `tests`, `fixtures`, and `docs`

#### Scenario: Subpath exports resolve to built files
- **WHEN** a consumer imports `eslint-config-mocg/react`
- **THEN** it resolves to the compiled `dist/config/react.eslint.js` with its declaration
