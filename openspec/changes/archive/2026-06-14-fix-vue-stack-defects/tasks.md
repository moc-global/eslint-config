## 1. Fix the Vue-stack config defects

- [x] 1.1 In `src/config/vue/vue-overrides.eslint.ts`, set `unicorn/filename-case` to `['error', { case: 'pascalCase', checkDirectories: false }]` so PascalCase applies to the SFC filename only
- [x] 1.2 In `src/config/vue/vue-overrides.eslint.ts`, add a `files: ['**/*.vue']` block disabling `n/no-missing-import` (n cannot alias-resolve in SFCs; vue-tsc/bundler cover real misses)
- [x] 1.3 In `src/config/vue/vue-overrides.eslint.ts`, re-apply `eslint-config-prettier`'s rule opt-outs for `**/*.vue` (last in the Vue chain) so eslint-plugin-vue's template formatting rules stop fighting `prettier/prettier`
- [x] 1.4 In `src/index.ts`, make `vueTs: true` enable the Vue stack (respecting an explicit `vue: false`) so it no longer silently no-ops when `vue` isn't detected
- [x] 1.5 Rebuild `dist/` and re-pack the tarball

## 2. Dogfood all framework stacks

- [x] 2.1 Add `fixtures/nest-ts/` (a decorated `.ts` sample + tsconfig) and `fixtures/vue-ts/` (a `.vue` sample under a lowercase dir + tsconfig)
- [x] 2.2 Generalize the React dogfood test into a stack table (React/Nest/Vue): compose each via `moc({ <stack> })` and run `ESLint.lintFiles`, asserting no crash and (Vue) no `unicorn/filename-case` directory error
- [x] 2.3 Run `npm run lint`, `npm run typecheck`, `npm run test:run` — all green

## 3. Finalize the example consumers

- [x] 3.1 Add `examples/vue-app/src/env.d.ts` (`declare module '*.vue'`) and rename the composable to a kebab-case filename
- [x] 3.2 Reinstall `examples/vue-app` against the rebuilt tarball; run `eslint . --fix`; confirm `vue-tsc --noEmit` and `eslint .` both exit 0
- [x] 3.3 Reinstall `examples/nest-app` against the rebuilt tarball; confirm `tsc --noEmit` and `eslint .` both still exit 0

## 4. Close-out

- [x] 4.1 Update docs if needed (stacks guide already documents `vueTs`); note the Vue example
- [x] 4.2 Final end-to-end verification across all four example consumers
