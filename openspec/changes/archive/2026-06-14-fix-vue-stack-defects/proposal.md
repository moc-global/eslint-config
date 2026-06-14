## Why

Building a standard Vue 3 + TypeScript example consumer (`examples/vue-app`)
proved the Vue stack emits spurious errors that no consumer can work around,
making it unusable out of the box:

- `unicorn/filename-case` is set to `pascalCase` for `.vue` files, but unicorn
  v65 checks **directory** names too (default `checkDirectories: true`). So a
  normal `src/components/Foo.vue` fails with "Directory name `src` is not in
  pascal case. Rename it to `Src`." You cannot rename `src`.
- `n/no-missing-import` resolves tsconfig `@/*` path aliases in `.ts`/`.tsx`
  files but **not** in `.vue` files, so every aliased import in an SFC is
  falsely reported as unresolvable.

Like React before it, the Vue (and Nest) stacks are not exercised by the repo's
own checks, so these shipped undetected. The NestJS example built alongside this
revealed **no** config defects (it lints clean once Swagger/strict conventions
are followed), but it is still undogfooded.

## What Changes

- **Scope `unicorn/filename-case` to the SFC filename, not its directories:** set
  `checkDirectories: false` on the Vue `.vue` override so PascalCase is enforced
  on the component filename only.
- **Stop `n/no-missing-import` from firing in `.vue` files:** disable it for
  `**/*.vue`, where n cannot apply tsconfig path-alias resolution (real missing
  imports are still caught by `vue-tsc` and the bundler). This mirrors the
  existing test-file treatment.
- **Stop eslint-plugin-vue's template formatting rules from fighting Prettier:**
  `flat/recommended` re-enables formatting rules (`max-attributes-per-line`,
  `html-closing-bracket-newline`, `html-indent`, …) *after* the Node base applied
  `eslint-config-prettier`, so `--fix` oscillates between them and
  `prettier/prettier`. Re-apply the prettier opt-outs last in the Vue chain so
  Prettier solely owns `.vue` formatting.
- **`vueTs: true` implies the Vue stack:** previously `moc({ vueTs: true })` only
  selected the TS variant *after* `vue` was independently detected/enabled, so on
  a project where `vue` wasn't detected it silently produced no Vue config at all.
  Now `vueTs: true` enables the Vue stack (unless `vue: false` is explicit).
- **Dogfood the Nest and Vue stacks:** extend the repo's framework-stack test so
  `moc({ nest: true })` and `moc({ vueTs: true })` are each composed and run
  through ESLint over real fixtures, failing CI on load/rule crashes or spurious
  convention errors.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `framework-stack-compatibility`: add a requirement that a framework stack must
  not emit spurious errors on a standard project layout (Vue SFC casing must not
  reject lowercase directories; aliased SFC imports must not be falsely flagged),
  and extend the dogfooding requirement to cover the Nest and Vue stacks, not
  only React.

## Impact

- **Code:** `src/config/vue/vue-overrides.eslint.ts` (filename-case directory
  scoping + `n/no-missing-import` off for `.vue`).
- **Tests:** extend the dogfood test (`tests/`) and add `fixtures/vue-ts/` (and a
  Nest fixture) so all framework stacks are exercised.
- **Examples:** `examples/vue-app` lints clean with `moc({ vueTs: true })` after
  the fix (plus a standard `*.vue` type shim and kebab-case composable filename);
  `examples/nest-app` lints clean with `moc()`.
- **Consumers:** a standard Vue project (lowercase `src/`, `@/*` aliases) works.
