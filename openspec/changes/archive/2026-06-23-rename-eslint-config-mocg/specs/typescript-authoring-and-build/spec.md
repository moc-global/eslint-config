## MODIFIED Requirements
### Requirement: Consumer-facing type declarations
The build SHALL emit `.d.ts` declaration files alongside the JavaScript, and the package SHALL expose them via a `types` export condition so consumers get IntelliSense on `mocg(options)` and every subpath.

#### Scenario: Declarations ship for every entry
- **WHEN** the package is packed
- **THEN** a `.d.ts` exists for the root entry and for each subpath export, and `package.json` `exports` declares a `types` condition for each

#### Scenario: Options are typed for consumers
- **WHEN** a TypeScript consumer calls `mocg({ ... })`
- **THEN** the options object and return type are resolved from the shipped declarations without the consumer installing anything extra
