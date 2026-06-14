## Context

`examples/vue-app` (a standard Vue 3 + TS SFC project) surfaced two Vue-stack
defects that no consumer can work around, plus the fact that the Nest and Vue
stacks are still undogfooded. Root causes were confirmed by reading the installed
plugin sources:

- `eslint-plugin-unicorn@65` `filename-case` defaults `checkDirectories` to
  `true` (`options.checkDirectories !== false`) and reports every non-conforming
  path segment. With the Vue override's `case: 'pascalCase'`, lowercase
  directories (`src`, `components`) are flagged.
- `eslint-plugin-n` `no-missing-import` resolves tsconfig `paths` for `.ts`/`.tsx`
  files but not for `.vue` files, so aliased SFC imports are falsely reported.

## Goals / Non-Goals

**Goals:**
- A standard Vue project (lowercase `src/`, `@/*` aliases, PascalCase SFCs)
  lints clean with `moc({ vueTs: true })`.
- The React, Nest, and Vue stacks are each exercised by the test suite.

**Non-Goals:**
- No change to React or Node behavior.
- No attempt to make `n/no-missing-import` alias-resolve inside `.vue` (fragile);
  disabling it there is sufficient because `vue-tsc` and the bundler catch real
  missing imports.
- No relaxing of the kebab-case filename convention for `.ts` files — Vue
  composables in the example simply use kebab-case filenames (e.g. `use-tasks.ts`).

## Decisions

| Decision | Mechanism |
| --- | --- |
| Enforce PascalCase on the SFC **filename only** | `unicorn/filename-case: ['error', { case: 'pascalCase', checkDirectories: false }]` in `vue-overrides.eslint.ts`. |
| Don't run `n/no-missing-import` on `.vue` | Add a `files: ['**/*.vue']` block disabling `n/no-missing-import` in `vue-overrides.eslint.ts`. Consistent with the repo's existing test-file treatment. |
| Prettier owns `.vue` formatting | Re-apply `eslintConfigPrettier.rules` in a `files: ['**/*.vue']` block in `vue-overrides.eslint.ts`. Because `vue-overrides` is last in the Vue chain, this re-disables the formatting rules that `flat/recommended` re-enabled after the Node base's `eslint-config-prettier`. `prettier/prettier` stays on (not disabled by eslint-config-prettier). |
| `vueTs: true` implies the Vue stack | In `src/index.ts`, gate the Vue layer on `enabled('vue', …) \|\| (options.vueTs === true && options.vue !== false)`. Fixes the silent no-op when `vue` isn't detected and makes the dogfood test non-vacuous. Surfaced by code review. |
| Dogfood all stacks | Generalize the existing React dogfood test to a table over React/Nest/Vue, each with a small fixture (`fixtures/react-ts`, `fixtures/nest-ts`, `fixtures/vue-ts`), composing the stack and running `ESLint.lintFiles`; assert no crash and (for Vue) no `unicorn/filename-case` directory error. |

Example-side (not config): the Vue example adds a standard `src/env.d.ts`
`declare module '*.vue'` shim so `.vue` imports type-resolve (fixing a
`no-unsafe-argument` on `createApp(App)`), uses a kebab-case composable filename,
and is `--fix`ed for Vue template formatting (attributes-per-line, self-closing,
single-line content) and import sorting.

## Risks / Trade-offs

- **[Disabling `n/no-missing-import` for `.vue` loses missing-import detection in SFCs]** → Acceptable: `vue-tsc` (typecheck) and the bundler both fail on a genuinely missing import; the rule was producing only false positives there.
- **[`checkDirectories: false` stops enforcing directory casing for `.vue`]** → Intended; directory casing was never the goal of the SFC-filename rule, and the Node base still governs `.ts` file/dir casing.
- **[Dogfood test depends on framework peer devDeps]** → They are already devDependencies of the repo.

## Open Questions

None.
