# Design

## Context

The source material is a mature `.eslint/` flat-config tree (~30 plugins, factory functions like `createNodeConfig`/`createReactConfig`) inside a personal boilerplate. The extraction is mostly relocation + packaging; the new work is the umbrella factory, the optional-peer model, the installer, and distribution.

## Key decisions

### 1. Bundled core, optional framework peers
Core plugins (typescript-eslint, unicorn, sonarjs, perfectionist, @stylistic, import-x, jsdoc, n, security, no-secrets, promise, regexp, depend, prettier, plus the bundled zod/vitest plugins) are `dependencies` — their versions are locked by this package, giving central governance. Framework plugins (React/Vue/Nest) and Jest/i18n/Tailwind are optional `peerDependencies`, so a Node-only project never installs React. Trade-off: a heavier base install, in exchange for "the same tested combination everywhere."

### 2. Subpath exports + lazy loading
Each framework lives behind a subpath export (`/react`, `/vue`, `/nest`, …). The umbrella imports them with dynamic `import()` only when a flag is on. The root entry deliberately re-exports **only** `createNodeConfig` (no optional peers) — re-exporting framework factories statically would force their peers to resolve at import time and break Node-only projects. A missing peer is caught and rethrown as an actionable install message. `moc()` therefore returns a `Promise` (ESLint supports async config).

### 3. Single source of truth for versions
`src/cli/stacks.mjs` reads plugin version ranges from the package's own `peerDependencies`. The manifest, the `init` installer, the `doctor` command, and the runtime error messages all consume it. A test asserts every manifest plugin range equals the declared peer range, so they can't drift.

### 4. Buildless
The package publishes plain `.mjs` (the `files` field is just `src`). No compile step keeps git-dependency and tarball installs working and removes a class of "dist out of sync" bugs. Type safety is via JSDoc + `// @ts-check` on authored files; the ported rule modules are validated by ESLint and fixture tests rather than `checkJs`.

### 5. Auto-detection with explicit override
`detectStacks(rootDir)` reads all dependency fields of the consumer's `package.json` and maps marker packages (`react`, `@nestjs/core`, `vitest`, …) to stacks/extras. `moc()` enables a stack if its flag is `true`, disables if `false`, otherwise falls back to detection.

### 6. Legacy adoption via bulk suppressions
Rather than a `legacy: true` mode in the library, we rely on ESLint's built-in `--suppress-all` / `--prune-suppressions`. Existing violations baseline into `eslint-suppressions.json`; new violations still fail. No library support needed; documented as the adoption path.

### 7. Distribution without a registry
Git dependency (`git+ssh://…#semver:^1`) and `npm pack` tarball are both first-class and buildless. `npm pack` doubles as a CI smoke test (pack + install into a fixture catches bad `files`/`exports`).

## Risks / mitigations
- **Plugin peer-range lag** (e.g. `eslint-plugin-react` not yet declaring ESLint 10): dev environment uses `legacy-peer-deps`; consumers resolve their own trees.
- **Transitive version conflict** (`react-hooks` needs `zod-validation-error/v4` while `react-compiler` pins an older one): resolved with a top-level `overrides` to `zod-validation-error@^5`.
- **eslint-plugin-vue v10 API change** (`flat/vue3-recommended` → `flat/recommended`): updated in the ported Vue ruleset.

## Migration / dogfooding
The boilerplate stays as-is and becomes the first consumer. The package lints itself with its own `moc()` config (the strongest possible dogfood).
