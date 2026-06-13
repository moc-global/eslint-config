## 1. Repo & packaging

- [x] 1.1 Create the repo and copy the `.eslint/` rule tree into `src/`
- [x] 1.2 Author `package.json`: bundled core `dependencies`, optional framework `peerDependencies` + `peerDependenciesMeta`, subpath `exports`, `bin`, `files: [src]`, engines
- [x] 1.3 Add buildless tooling config: `tsconfig.json` (JSDoc, `// @ts-check` opt-in), `.prettierrc`, `.gitignore`, `.npmrc` (legacy-peer-deps)
- [x] 1.4 Resolve dependency conflicts (`zod-validation-error@^5` override; `vue-eslint-parser` peer; eslint-plugin-vue v10 `flat/recommended`)

## 2. Composition

- [x] 2.1 Implement the `moc()` umbrella factory (async, ordered composition)
- [x] 2.2 Implement dependency-based auto-detection (`detect.mjs`)
- [x] 2.3 Implement lazy optional-peer loading with actionable errors
- [x] 2.4 Re-export only `createNodeConfig` + manifest/detect from the root; frameworks via subpaths
- [x] 2.5 Make the Node base tolerate a missing `.gitignore`

## 3. Installer CLI

- [x] 3.1 Author the `STACKS`/`EXTRAS` manifest sourcing versions from `peerDependencies`
- [x] 3.2 Implement package-manager detection, config generation, and script patching
- [x] 3.3 Implement the `init` wizard (interactive + `--preset`/`--extras`/`--yes`/`--no-install`/`--dry-run`)
- [x] 3.4 Implement the `doctor` command and the `bin` entry with arg parsing/help

## 4. Quality gates

- [x] 4.1 Self-lint clean (`eslint .` exits 0) and typecheck clean (`tsc --noEmit`)
- [x] 4.2 Add fixtures (node-ts integration target + detection fixtures)
- [x] 4.3 Add Vitest suites: manifest, detection, CLI helpers, `moc()` composition, integration lint
- [x] 4.4 Verify pack contents (`npm pack` ships only `src`)

## 5. Documentation

- [x] 5.1 VitePress site: why, getting-started, how-it-works, stacks, cli, existing-projects, versioning, contributing
- [x] 5.2 Reference: API (`moc()` + factories) and per-plugin rules reference
- [x] 5.3 Repo `README.md`
- [x] 5.4 Confirm `vitepress build` succeeds

## 6. OpenSpec

- [x] 6.1 Initialize OpenSpec and author proposal, design, specs, and tasks
