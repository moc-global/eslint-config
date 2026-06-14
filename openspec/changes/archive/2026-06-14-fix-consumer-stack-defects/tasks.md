## 1. Fix the two React-stack crashes

- [x] 1.1 Remove `eslint-plugin-react-compiler` from `STACKS.react.plugins` in `src/core/manifest.ts`; drop it from `package.json` `peerDependencies`/`peerDependenciesMeta` (keep `react-compiler.eslint.ts` and expose it as an opt-in subpath export)
- [x] 1.2 Convert `src/config/react/react.eslint.ts` to a factory that resolves `settings.react.version` from the consumer's installed `react/package.json` (via `createRequire(<rootDir>/package.json)`), with a literal fallback; never use `'detect'`
- [x] 1.3 Thread `rootDir`/options from `src/index.ts` → `src/config/react.eslint.ts` (`createReactConfig`) → the new React rules factory
- [x] 1.4 Rebuild `dist/`; in `examples/react-app` remove the `overrides` and the `react-compiler` devDep and the version-pin workaround in `eslint.config.mjs`; `rm -rf node_modules && npm i`; confirm `eslint .` runs without crashing

## 2. Reconcile rule policy

- [x] 2.1 Add `props`/`Props` to the unicorn `prevent-abbreviations` allowList (`src/config/node/unicorn.eslint.ts`)
- [x] 2.2 Locate the `no-void` rule and set `['error', { allowAsStatement: true }]`
- [x] 2.3 Un-ban full words (`info`, `data`, …) by overriding the offending `@typescript-eslint/naming-convention` selectors in `src/config/typescript/naming.eslint.ts`
- [x] 2.4 Turn off the duplicate `sonarjs/slow-regex` and `sonarjs/deprecation` in `src/config/node/sonar.eslint.ts` (keep `regexp/no-super-linear-backtracking` and `@typescript-eslint/no-deprecated`)
- [x] 2.5 Disable `security/detect-object-injection` (`src/config/node/security.eslint.ts`)
- [x] 2.6 Relax `max-classes-per-file` (locate and set `off`)

## 3. React environment + component policy

- [x] 3.1 In `src/config/react/react-overrides.eslint.ts`, disable `n/no-unsupported-features/node-builtins` for React files (browser runtime)
- [x] 3.2 In the React overrides, turn off `jsdoc/require-jsdoc` for `**/*.{jsx,tsx}` (components); keep `sonarjs/prefer-read-only-props`

## 4. Make both examples lint clean

- [x] 4.1 Rebuild `dist/`; reinstall both examples against the rebuilt tarball
- [x] 4.2 Run `eslint . --fix` in both examples (import-sort, Prettier, `array-type`, `sort-union-types`, `prefer-alias` relative-within-subtree)
- [x] 4.3 Manually fix non-autofixable example code: rewrite the email regex to a non-backtracking form, replace the deprecated `FormEvent` type, mark component prop types `readonly`
- [x] 4.4 Confirm `tsc --noEmit` and `eslint .` both exit 0 in `examples/typescript-app` and `examples/react-app`

## 5. Dogfood the React stack

- [x] 5.1 Add a vitest test that composes `moc({ react: true })` and runs `ESLint.lintText` over a `.tsx` sample, asserting no crash (add a `fixtures/react-ts/` if needed)
- [x] 5.2 Run `npm run lint`, `npm run typecheck`, `npm run test:run` on the config repo — all green

## 6. Docs + close-out

- [x] 6.1 Update the README/stacks/React docs to reflect React Compiler as opt-in and the removed workarounds
- [x] 6.2 Update `EXAMPLES-FINDINGS.md` to mark each finding resolved (or note residual)
- [x] 6.3 Re-run the full verification (`npm pack` + both examples) end-to-end
