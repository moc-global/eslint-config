# Plugins reference

`@moc-global/eslint-config` is strict by design. It does not assemble a handful of "recommended" presets and call it a day — it layers a couple of dozen plugins, each chosen to catch a specific class of mistake before it reaches review or production. This page is the map: for every plugin we ship, what category of problems it catches and what it actually ensures for the team — not just its name.

Plugins fall into three groups. **Core plugins** are bundled as regular `dependencies` and are always active in the base Node/TypeScript config. **Framework plugins** and **add-on plugins** are optional `peerDependencies` — you install them only for the stacks you use, and they activate automatically when detected.

::: tip
Every rule cited below was read out of the ruleset source under `src/`. Where a plugin is enabled through its own `recommended` preset, that is noted as such rather than enumerating rules the config does not itself set.
:::

## Core plugins (always on)

These run on every file in every project. They are bundled with the package, so there is nothing extra to install.

### Code correctness & best practices

#### `@eslint/js`

The ESLint core recommended ruleset (`pluginJs.configs.recommended`). This is the floor: it catches outright bugs such as unreachable code, duplicate object keys, comparing against `NaN`, and `case` fall-through. Everything else builds on top of it.

#### Owned "best-practices" ruleset (core ESLint rules)

Defined in `src/config/node/best-practices.eslint.ts`, this is not a plugin but a hand-maintained set of core ESLint rules that replaces the now-unmaintained `eslint-config-airbnb-base`. It ensures the team keeps Airbnb's battle-tested logic-level conventions without depending on a dead package. Representative rules: `array-callback-return`, `no-param-reassign` (with carve-outs for accumulators and request/response objects), `consistent-return`, `no-await-in-loop`, `prefer-template`, `prefer-destructuring`, and a large `no-restricted-globals` list that blocks accidental use of browser globals like `name` or `location` in Node code.

#### `eslint-plugin-sonarjs`

SonarSource's code-quality and bug-detection rules (`recommended` preset). It ensures the team avoids cognitive-complexity traps and subtle logic bugs: duplicated branches in conditionals, identical expressions on both sides of an operator, collapsible `if` statements, and dead/redundant code. The config tunes a few rules down to warnings (`sonarjs/function-return-type`, `sonarjs/todo-tag`) and turns off opinions that fight the rest of the stack (`no-commented-code`, `redundant-type-aliases`).

#### `eslint-plugin-unicorn`

A broad collection of "modern, more correct JavaScript" rules (`recommended` preset). It ensures the codebase prefers current platform APIs and consistent idioms over legacy patterns — for example preferring `node:` protocol imports, modern `Array`/`String` methods, and explicit error handling. The config relaxes a few opinionated rules (`no-null`, `no-array-for-each`, `prefer-top-level-await`) and configures `prevent-abbreviations` with an allow-list (`spec`, `param`, `e2e`, `rootDir`, `props`/`Props`) so meaningful short names — including the universal React `*Props` convention — are not flagged.

#### `eslint-plugin-promise`

Promise and async correctness (`flat/recommended` preset). It ensures `Promise` chains are not silently broken: every `.then` returns or handles, `new Promise` executors are used correctly, and you do not accidentally nest or forget callbacks. This catches a whole category of "the await did nothing" bugs that type-checking alone misses.

#### `eslint-plugin-n`

Node.js-specific correctness (`flat/recommended-module` preset). It ensures code targets the Node version range the project actually supports: it flags deprecated Node APIs, unsupported syntax/built-ins for the declared engines, missing or unpublished imports, and `process.exit()` in library code. Scripts and config files relax these (see `src/config/node/scripts.eslint.ts` and `eslint-rules.eslint.ts`) since they run on the local toolchain rather than the shipped runtime.

#### `eslint-plugin-regexp`

Regular-expression correctness and safety (`flat/recommended` preset). It ensures regexes are well-formed and efficient: it catches redundant escapes, unintended character classes, and — importantly — patterns prone to catastrophic backtracking (ReDoS). This protects against both bugs and a real denial-of-service vector.

#### `eslint-plugin-depend`

Dependency-weight hygiene (`flat/recommended` preset). It ensures the team does not reach for a heavyweight package when a native or lighter alternative exists — for example suggesting native optional chaining over `lodash.get`, or built-in crypto over a UUID library for simple IDs. The benefit is smaller installs and fewer transitive dependencies. It is disabled on config files where dev-only tooling imports are expected.

#### `eslint-plugin-lintlord`

A custom rules plugin (`strict` preset). Here it ensures all logging goes through the project logger rather than ad-hoc `console.*`: `lintlord/prefer-logger` runs in `mode: 'all'`, flagging every `console` method. Scripts opt out, since CLI tools are expected to write to stdout.

#### Owned "custom-style" logic rules

In `src/config/node/custom-style.eslint.ts`, another set of core ESLint rules covering logic-level style (not formatting, which Prettier owns). It ensures consistent, defensive code: `eqeqeq` (with `null` ignored), `curly: all`, `no-eval`, `no-console` as an error, `prefer-const`, `no-var`, `no-throw-literal`, `radix`, and `no-use-before-define`.

### Imports & module hygiene

#### `eslint-plugin-import-x`

A maintained, flat-config-native fork of `eslint-plugin-import`, registered under the `import-x` namespace. It ensures imports actually resolve to something real and the module graph stays sane: it flags imports of names that an exporting module does not provide (`import-x/named`), duplicate imports, self-imports, circular dependencies (`import-x/no-cycle`), absolute paths, and importing extraneous (non-declared) dependencies. The `no-extraneous-dependencies` rule allows `devDependencies` in test and config files but errors on stray runtime imports elsewhere.

#### `eslint-plugin-simple-import-sort`

Deterministic import ordering. It ensures every file's imports are grouped and sorted the same way, removing an entire category of merge conflicts and review noise. The grouping is project-aware: it puts `node:` built-ins first, then NestJS, then React, then other npm packages, then **internal alias groups that are generated dynamically from your `tsconfig` paths**, then side-effect imports, then relative imports, then styles.

#### `@dword-design/eslint-plugin-import-alias`

Path-alias enforcement (`recommended` preset). It ensures deep relative imports (`../../../utils`) are rewritten to the project's `tsconfig` path aliases via `import-alias/prefer-alias`. The alias map is built automatically from `tsconfig` `paths` + `baseUrl`, so the rule only activates when a project defines aliases — otherwise the config contributes nothing.

#### `eslint-plugin-unused-imports`

Dead-import removal. `unused-imports/no-unused-imports` ensures imports that are no longer referenced are reported and auto-removed on `--fix`, keeping module headers honest and avoiding accidental coupling.

#### `eslint-plugin-no-barrel-files`

Barrel-file prevention (`flat` preset). It ensures the team does not create `index` files that re-export a whole directory. Barrel files defeat tree-shaking and inflate bundle sizes by pulling in modules that are never actually used.

### Style & formatting

#### `eslint-plugin-prettier` + `eslint-config-prettier`

Formatting as a lint rule, via `eslint-plugin-prettier/recommended`. It ensures Prettier is the single source of truth for formatting: Prettier violations surface as ESLint errors, and `eslint-config-prettier` (bundled in the recommended preset) turns off every ESLint rule that would otherwise fight Prettier. The team never argues about quotes, semicolons, or wrapping.

#### `@stylistic/eslint-plugin`

The stylistic rules that survive Prettier — the layout decisions Prettier does not make. It ensures consistent vertical rhythm: `@stylistic/lines-between-class-members` requires blank lines between class members, and a detailed `@stylistic/padding-line-between-statements` configuration enforces blank lines around returns, blocks, multiline declarations, and import boundaries while keeping `switch` cases tight.

#### `eslint-plugin-perfectionist`

Sorting and organization (`recommended-natural` preset, heavily tuned). Rather than sorting everything, this config narrows it to the cases the team cares about: `perfectionist/sort-jsx-props` (with a priority group so `key`, `className`, `title`, etc. come first) and `perfectionist/sort-union-types` (so TypeScript unions follow a consistent type-category order). Most other perfectionist sorters are explicitly disabled so they do not conflict with `simple-import-sort` or become noisy.

### Security

#### `eslint-plugin-security`

Node.js security heuristics (`recommended` preset). It ensures risky patterns get a second look: non-literal `fs` filenames (path traversal), non-literal `RegExp` (ReDoS), `child_process` with dynamic input, unsafe `eval`-like calls, and pseudo-random values used where cryptographic randomness is expected.

#### `eslint-plugin-no-secrets`

Entropy-based secret detection. `no-secrets/no-secrets` ensures high-entropy strings — API keys, tokens, private-key material — are not accidentally committed in source. It is a cheap last line of defense against leaking credentials.

### Documentation

#### `eslint-plugin-jsdoc`

JSDoc completeness and correctness. It ensures public surface area is documented and that the docs stay in sync with the code. The config applies the TypeScript-aware preset (`flat/recommended-typescript-error`) to `.ts`/`.tsx` files and the plain preset (`flat/recommended-error`) to JavaScript, and on top of both requires a description (`jsdoc/require-description`). Test files relax these requirements.

### TypeScript & type-aware

#### `typescript-eslint`

The TypeScript engine of the whole config — parser plus rules. It ensures TypeScript code is held to the strictest practical standard using **type-aware linting**: `src/config/typescript/project.eslint.ts` wires up the parser with `projectService: true`, so rules can read the type checker, not just the syntax tree. The ruleset applies both `strictTypeChecked` and `stylisticTypeChecked` presets to `*.{ts,tsx,mts,cts}` files. On top of the presets, `src/config/typescript/overrides.eslint.ts` enforces team conventions: `consistent-type-definitions: interface`, `consistent-type-imports` (separate `import type`), `switch-exhaustiveness-check`, `prefer-readonly`, and the typed replacements (`@typescript-eslint/no-unused-vars`, `no-shadow`, `no-useless-constructor`) for their core counterparts, which are turned off on TS files so they do not double-report.

#### `eslint-config-naming`

A shareable naming-convention config layered onto the `@typescript-eslint` plugin, scoped to TypeScript files (`src/config/typescript/naming.eslint.ts`). It ensures consistent identifier naming across the codebase — types, interfaces, variables, and members — going beyond what the core `camelcase` rule (which covers plain `.js`/`.ts`) can express.

## Framework plugins (optional peers)

These are optional `peerDependencies`. Install them only for the frameworks you use; the config activates the matching ruleset automatically when the stack is detected.

### React

#### `eslint-plugin-react`

The canonical React linting plugin (`recommended` + `jsx-runtime` presets). It ensures correct JSX and component usage: valid prop types and usage, no missing `key` props in lists, no deprecated lifecycle patterns, and — via `jsx-runtime` — that the new automatic JSX transform is respected (no spurious "React must be in scope" errors). The config resolves the React version from your installed `react` package and pins it in `settings.react.version` (it does **not** use the plugin's `'detect'` mode, whose version detector calls a `context.getFilename()` API removed in modern ESLint).

#### `eslint-plugin-react-hooks`

Rules of Hooks enforcement (`recommended-latest` preset). It ensures Hooks are only called at the top level and only from React functions, and that effect dependency arrays are complete. This catches the single most common source of subtle React bugs — stale closures and conditionally-called hooks.

#### `eslint-plugin-react-refresh`

Fast Refresh safety (`vite` preset). It ensures component modules stay compatible with hot module replacement by flagging exports that would break Fast Refresh (for example mixing component and non-component exports in one file). The benefit is a reliable dev experience.

#### `eslint-plugin-react-compiler` (opt-in — not part of the React stack)

React Compiler validation. Unlike the three plugins above, this is **not** activated by the React stack and is **not** auto-installed: it is an optional peer that `moc()` never loads. Enable it explicitly via the `@moc-global/eslint-config/react-compiler` export (see [Stacks → React Compiler](/guide/stacks#react-compiler-opt-in)) only when your project runs the React 19 compiler. When enabled, `react-compiler/react-compiler` ensures components follow the rules the compiler depends on for safe auto-memoization, surfacing code the compiler would otherwise bail out on.

### Vue

#### `eslint-plugin-vue` + `vue-eslint-parser`

Vue 3 Single-File-Component linting (`flat/recommended` preset). The plugin ensures `<template>` and `<script>` blocks follow the official Vue 3 style guide — correct directive usage, component naming, prop and event conventions, and template best practices. `vue-eslint-parser` is the parser that makes SFCs lintable at all; the optional Vue+TS layer (`src/config/vue/vue-ts.eslint.ts`) chains it with the `@typescript-eslint` parser so `<script lang="ts">` blocks get full type-aware linting. SFC filenames are enforced to PascalCase per the style guide.

### NestJS

#### `@darraghor/eslint-plugin-nestjs-typed`

NestJS-specific, type-aware rules (`flatRecommended` preset). It ensures Nest applications follow framework conventions that the compiler cannot check: that injectables and providers are wired correctly, that controllers/DTOs use validation decorators consistently, and that Swagger/OpenAPI decorators match the actual property optionality. The config relaxes a handful of rules for module files and model/entity files where the defaults are too strict.

## Add-on plugins

Cross-cutting tools that attach to specific file patterns or domains. Vitest and Zod plugins are bundled (`dependencies`); the rest are optional `peerDependencies`.

#### `@vitest/eslint-plugin` (bundled)

Vitest test-file rules (`recommended` preset), scoped to test directories and `*.spec.*` files. It ensures tests are well-formed: no focused/skipped tests left in, valid assertions, and consistent structure. This config also enforces `vitest/consistent-test-filename` (a `.spec.` suffix) and caps nesting with `vitest/max-nested-describe` at 3, and registers Vitest globals so tests do not trip `no-undef`.

#### `eslint-plugin-jest`

Jest test-file rules (`flat/recommended` preset), scoped to `*.spec.*` and `*.test.*` files. The Jest counterpart to the Vitest plugin: it ensures correct matcher usage, no disabled tests slipping into the suite, and consistent test structure for projects that use Jest instead of Vitest.

#### `eslint-plugin-zod` + `eslint-plugin-import-zod` (bundled)

Zod schema hygiene (both `recommended` presets). `eslint-plugin-zod` ensures schema definitions follow consistent, correct patterns, while `eslint-plugin-import-zod` ensures Zod is imported in the expected way. Together they keep validation schemas uniform across a codebase.

#### `eslint-plugin-i18next`

Internationalization enforcement (`flat/recommended` preset). `i18next/no-literal-string` in `mode: 'all'` ensures no user-facing string literals are hard-coded in TypeScript — developers are pushed to route copy through the translation layer (e.g. `i18nService.t(...)`). The config ignores tests, migrations, config, exceptions, and mocks where literal strings are legitimate.

#### `eslint-plugin-better-tailwindcss`

Tailwind class-attribute linting (`recommended-error` preset). It ensures Tailwind utility classes are valid and tidy: `better-tailwindcss/no-unknown-classes` flags typos and classes that do not exist (with component-class detection), and `enforce-consistent-line-wrapping` keeps long class lists readable. It is pointed at the Tailwind v4 CSS entry point via settings.

## How rules are tuned

A few principles run through the whole config:

- **Prettier owns formatting.** `eslint-plugin-prettier` reports formatting as errors and `eslint-config-prettier` switches off every ESLint rule that would conflict, so the two never fight. Everything ESLint reports is a logic or correctness concern, not a whitespace preference.
- **Type-aware rules need a `tsconfig`.** The TypeScript layer uses `projectService`, which auto-discovers your `tsconfig.json` (falling back through `tsconfig.base.json`, `tsconfig.main.json`, `tsconfig.app.json`). The dynamic import-ordering and alias groups are derived from that same `tsconfig` — no manual configuration needed.
- **Projects relax rules locally, not globally.** The shared config is intentionally strict. Individual projects that cannot satisfy a rule yet should disable it locally (or baseline it) rather than weakening the shared defaults — see [Existing & legacy projects](../guide/existing-projects.md) for the baseline-and-ratchet approach.
