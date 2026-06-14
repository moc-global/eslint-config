# Example-project findings — `@moc-global/eslint-config@2.0.0`

A real-world consumption test of the packed tarball against two fresh example
projects.

> **Status: RESOLVED.** Every finding below was addressed by the OpenSpec change
> `fix-consumer-stack-defects` (`openspec/changes/.../`). Both example projects
> now lint with **exit 0** using a bare `export default moc()` and no
> consumer-side workarounds. Per-finding resolution is in the table below; the
> detail under each finding is kept for the record.

## Resolution

| # | Finding | Resolution |
| --- | --- | --- |
| 1 | `zod-validation-error/v4` crash | `eslint-plugin-react-compiler` dropped from the React stack's required plugins (now an optional, opt-in peer). Without its `3.5.4` pin, `react-hooks` resolves `zod-validation-error@4.x` (has `./v4`). Verified: fresh React install no longer crashes. |
| 2 | `react.version: 'detect'` crash | React version is now resolved from the consumer's installed `react/package.json`; `'detect'` is never used. Guarded by a new dogfood test. |
| 3 | `*Props` rejected | `props`/`Props` added to the unicorn `prevent-abbreviations` allowList. |
| 4 | `n` flags browser `localStorage` | `n/no-unsupported-features/node-builtins` disabled for files when the React stack is active. |
| 5 | `no-void` vs `no-floating-promises` | `no-void` set to `{ allowAsStatement: true }`. |
| 6 | naming denylist bans `info` | `info`/`data` reclaimed from the `eslint-config-naming` denylist. |
| 7 | duplicate ReDoS / deprecation reports | `sonarjs/slow-regex` and `sonarjs/deprecation` disabled; `regexp/no-super-linear-backtracking` and `@typescript-eslint/no-deprecated` are the sole owners. |
| 8 | per-component friction | `jsdoc/require-jsdoc` off for `.tsx`/`.jsx`; `prefer-read-only-props` kept (examples use `Readonly<…>` props). |
| 9 | `detect-object-injection` noise | `security/detect-object-injection` disabled. |
| 10 | `max-classes-per-file: 1` | Relaxed to `off`. |
| 11 | React stack not dogfooded | New `tests/react-stack.test.mjs` composes `moc({ react: true })` and lints a `.tsx` fixture. |
| 12 | `react-compiler` installed but unused | Now an optional peer + opt-in `@moc-global/eslint-config/react-compiler` export; documented in the stacks guide. |

The original assessment follows.

## How this was tested

1. Built and packed the config: `npm run build && npm pack` →
   `moc-global-eslint-config-2.0.0.tgz` (44.7 kB, 135 files).
2. Created two example consumers under `examples/`, each installing the tarball
   via `file:../../moc-global-eslint-config-2.0.0.tgz`, with path aliases and a
   layered structure (13 source files each):
   - `examples/typescript-app` — Node + TypeScript, alias group per layer
     (`@config`, `@domain`, `@errors`, `@repositories`, `@services`, `@utils`).
   - `examples/react-app` — React 19 + TypeScript (JSX runtime), single `@/*`
     alias.
3. Ran `tsc --noEmit` (sanity: both projects type-check cleanly) and
   `eslint .` in each, with `eslint.config.mjs` = `export default moc()`.

| Environment | Version |
| --- | --- |
| Node | v24.14.0 |
| npm | 11.9.0 |
| ESLint (resolved in consumers) | 10.5.0 |
| TypeScript (consumers) | 5.7.x |
| Stated support | Node `^22.21 \|\| >=24.10`, ESLint `^9.24 \|\| ^10` |

All tested versions are inside the config's declared support matrix.

## Summary

| # | Severity | Area | Finding |
| --- | --- | --- | --- |
| 1 | 🔴 Blocking | packaging / peers | React install crashes ESLint: `zod-validation-error` has no `./v4` export |
| 2 | 🔴 Blocking | React stack | `react: { version: 'detect' }` crashes on ESLint 10 (`context.getFilename`) |
| 3 | 🟠 High | React friction | `unicorn/prevent-abbreviations` rejects `*Props` (the universal React naming convention) |
| 4 | 🟠 High | React / env | `eslint-plugin-n` lints browser globals (`localStorage`) as unsupported Node builtins |
| 5 | 🟡 Medium | rule tension | `no-void` forbids the `void` operator that `@typescript-eslint/no-floating-promises` pushes you toward |
| 6 | 🟡 Medium | naming | `@typescript-eslint/naming-convention` denylist bans full words like `info` as method/property names |
| 7 | 🟡 Medium | redundancy | Two plugins flag the same issue (ReDoS regex; deprecated `FormEvent`) with duplicate errors |
| 8 | 🟡 Medium | React ergonomics | Every component gets 3 errors out of the box: `require-jsdoc` + `prefer-read-only-props` + `prevent-abbreviations` |
| 9 | 🟢 Low | security noise | `security/detect-object-injection` false-positives on typed-key record access |
| 10 | 🟢 Low | style strictness | `max-classes-per-file: 1` forbids co-locating a small error hierarchy |
| 11 | ℹ️ Info | dogfooding gap | The React stack is never linted by the repo itself (only `node-ts` fixtures), which is why #1/#2 went unnoticed |
| 12 | ℹ️ Info | manifest | `eslint-plugin-react-compiler` is a required React peer but `moc()` never loads it (opt-in only) |

The TypeScript project worked end-to-end (config loaded, type-aware linting ran,
aliases resolved). **The React project does not work out of the box** — it needs
two consumer-side workarounds (documented below) before ESLint will even start.

---

## 🔴 Finding 1 — React install crashes: `zod-validation-error` missing `./v4`

**Symptom** — a clean `npm i` + `eslint .` in the React example aborts with no
results:

```
Oops! Something went wrong! :(
ESLint: 10.5.0
Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './v4' is not defined by
"exports" in .../node_modules/zod-validation-error/package.json
```

**Root cause**

- `eslint-plugin-react-hooks@7.1.1` does `require('zod-validation-error/v4')` and
  declares `zod-validation-error: "^3.5.0 || ^4.0.0"`.
- The `./v4` subpath exists only in `zod-validation-error@4+` (v5 exposes
  `.`, `./v3`, `./v4`). **It does not exist in `3.5.4`.**
- `eslint-plugin-react-compiler@19.1.0-rc.2` pins `zod-validation-error@3.5.4`,
  and that resolution wins and is hoisted. So a React consumer ends up with
  `3.5.4`, and react-hooks' `require('.../v4')` throws.
- The config repo hides this from itself with a **private `overrides`** in its
  own `package.json`:

  ```jsonc
  "overrides": { "zod-validation-error": "^5.0.0" }
  ```

  npm `overrides` are **not applied transitively to consumers** — they only act
  on the package that declares them. So the repo's own dev install is fine, but
  every downstream React consumer reproduces the crash.

**Reproduction** — `examples/react-app` without the override:
`rm -rf node_modules && npm i && npx eslint .` → crash above.

**Consumer workaround used in the example** (so it can run at all) —
`examples/react-app/package.json`:

```jsonc
"overrides": { "zod-validation-error": "^5.0.0" }
```

After this, `zod-validation-error@5.0.0` resolves and the `./v4` subpath exists.

**Possible directions for review**

- The config can't rely on a private `overrides`. Options: depend on
  `zod-validation-error@^5` directly so it hoists for consumers; surface the
  required override from the installer (`init`) and `doctor`; document it; or
  pin/raise the react-hooks/react-compiler peer ranges to versions whose
  `zod-validation-error` resolution is internally consistent.

---

## 🔴 Finding 2 — React `version: 'detect'` crashes ESLint 10

**Symptom** — after Finding 1 is worked around, ESLint still aborts:

```
TypeError: Error while loading rule 'react/display-name':
contextOrFilename.getFilename is not a function
    at resolveBasedir (.../eslint-plugin-react/lib/util/version.js:31:100)
    at detectReactVersion (.../version.js:85:19)
    at getReactVersionFromContext (.../version.js:116:25)
```

**Root cause**

- `src/config/react/react.eslint.ts` hard-codes `settings.react.version: 'detect'`.
- `eslint-plugin-react@7.37.5`'s version detector calls the legacy
  `context.getFilename()` API, which modern ESLint (10.x, tested 10.5.0) no
  longer provides on the rule context — so the very first React rule that needs
  the React version (`react/display-name`) throws while loading.

**Consumer workaround used in the example** —
`examples/react-app/eslint.config.mjs` appends a concrete version so detection
is skipped:

```js
const config = await moc();
export default [...config, { settings: { react: { version: '19.0' } } }];
```

**Possible directions for review**

- Don't hard-code `'detect'`; either detect the installed `react` version inside
  the config (read `react/package.json`) and pass a concrete string, or accept a
  `reactVersion` option on `moc()`/`createReactConfig()`, or bump
  `eslint-plugin-react` to a release compatible with ESLint 10's context API.

---

## 🟠 Finding 3 — `prevent-abbreviations` rejects the `*Props` convention

Every React component's prop type triggers:

```
The variable `ButtonProps` should be named `ButtonProperties`.  unicorn/prevent-abbreviations
The variable `HeaderProps` should be named `HeaderProperties`.  unicorn/prevent-abbreviations
... (one per component: AddTaskFormProps, StatusBadgeProps, TaskItemProps, TaskListProps)
```

`SomethingProps` is the near-universal React convention for a component's props
type. `unicorn/prevent-abbreviations` expands `Props` → `Properties`. The config
(`src/config/node/unicorn.eslint.ts`) sets an `allowList`, but it does not
include `props`/`Props`. This fights idiomatic React in every component file.

**Direction** — add `props`/`Props` to the unicorn `allowList` (likely scoped to
the React/TS overrides), or relax `prevent-abbreviations` for `.tsx`.

---

## 🟠 Finding 4 — Node-builtin rules leak into browser (React) code

`src/hooks/useLocalStorage.ts`:

```
The 'localStorage' is still an experimental feature  n/no-unsupported-features/node-builtins
```

`localStorage` is a **browser** API. `eslint-plugin-n` (Node-oriented) is being
applied to browser-targeted React files and flags `globalThis.localStorage`
against Node's experimental-builtins list. The React stack sets
`globals.browser` but never relaxes/disables the Node-specific `n/*` rules for
component code, so ordinary browser APIs error.

**Direction** — when the React stack is active, disable or scope the Node-only
`n/*` rules (and/or set the appropriate environment) for browser source so
browser globals aren't judged against Node's builtins.

---

## 🟡 Finding 5 — `no-void` vs `no-floating-promises` tension

`src/hooks/useTasks.ts`:

```js
void fetchTasks().then(setTasks).catch(() => { setTasks([]); });
```

```
Expected 'undefined' and instead saw 'void'  no-void
```

`@typescript-eslint/no-floating-promises` is enabled (a fire-and-forget promise
in a non-async effect callback must be handled), and the canonical way to mark
it handled is the `void` operator — which `no-void` then forbids. The two rules
push in opposite directions for a very common React/effect pattern.

**Direction** — allow `void` for statement-position promises
(`no-void: ['error', { allowAsStatement: true }]`), or otherwise reconcile the
two rules.

---

## 🟡 Finding 6 — naming denylist bans full words (`info`)

TypeScript example, `src/utils/logger.ts` — a logger with `.info()` / `info:`:

```
Method name `info` must not match the RegExp: /^(a|b|...|msg|err)$/u
                                                  @typescript-eslint/naming-convention
Object Literal Method name `info` must not match ...   @typescript-eslint/naming-convention
```

The denylist (from `eslint-config-naming`) includes `info` (and `data`, `val`,
`obj`, `req`, `res`, `msg`, `err`, single letters `a`–`w`, …). `info` is a full
word and the standard log-level method name used by `console`, `pino`, `winston`,
etc. Banning it makes the ubiquitous `logger.info(...)` shape impossible without
disabling the rule.

**Direction** — review the denylist; at minimum allow `info` (and reconsider
other full words like `data`) for method/property selectors.

---

## 🟡 Finding 7 — duplicate findings from overlapping plugins

Two independent plugins report the same problem, doubling the noise:

- **ReDoS** (TypeScript example, `src/domain/user.ts`, a standard email regex):
  ```
  sonarjs/slow-regex            Make sure the regex ... cannot lead to denial of service
  regexp/no-super-linear-backtracking  The quantifier '[^\s@]+' can exchange characters ...
  ```
- **Deprecated `FormEvent`** (React example, `src/components/AddTaskForm.tsx`):
  ```
  sonarjs/deprecation                 'FormEvent' is deprecated
  @typescript-eslint/no-deprecated    'FormEvent' is deprecated. FormEvent doesn't actually exist...
  ```

Both are arguably correct individually, but firing two rules for one issue is
redundant. The `FormEvent` case is also a React-19-types reality (`@types/react`
deprecated several event aliases) that idiomatic React code will hit constantly.

**Direction** — decide on one owner per concern (e.g. keep `regexp/*` and drop
`sonarjs/slow-regex`, or vice-versa); consider how aggressively to surface
`@types/react@19` deprecations.

---

## 🟡 Finding 8 — every React component costs 3 errors on a clean file

A textbook component (typed props, returns JSX) trips three rules at once:

```
jsdoc/require-jsdoc            Missing JSDoc comment
sonarjs/prefer-read-only-props Mark the props of the component as read-only
unicorn/prevent-abbreviations  `XProps` should be `XProperties`   (see Finding 3)
```

`jsdoc/require-jsdoc` (from `flat/recommended-typescript-error`) requires a
JSDoc block on every exported function — including React function components,
which conventionally have none. Combined with `prefer-read-only-props` and the
`Props` rename, a freshly-written component is never green. This is consistent
with the repo's heavily-documented style, but it's a steep adoption curve for
typical React code and worth an explicit decision.

**Direction** — decide whether `require-jsdoc` and `prefer-read-only-props`
should apply to components; if intentional, document it prominently in the React
guide.

---

## 🟢 Finding 9 — `security/detect-object-injection` false positives

TypeScript example (warnings):

```
src/domain/priority.ts  Generic Object Injection Sink   PRIORITY_WEIGHT[second] (second: Priority)
src/config/env.ts       Variable Assigned to Object Injection Sink   process.env[name]
src/utils/logger.ts     Function Call Object Injection Sink          console[level]
```

These are the well-known noisy false positives of `eslint-plugin-security`:
indexing a `Record<Priority, number>` with a typed-union key is safe, and
`process.env[name]` is everyday config code. Three hits in a 13-file app.

**Direction** — consider downgrading/disabling `detect-object-injection` (it's
already only a warning) or documenting the expected suppression pattern.

---

## 🟢 Finding 10 — `max-classes-per-file: 1`

TypeScript example, `src/errors/app-error.ts`:

```
File has too many classes (3). Maximum allowed is 1   max-classes-per-file
```

A small error hierarchy (`ApplicationError` + `NotFoundError` + `ValidationError`)
is conventionally co-located in one file. The limit of 1 forces a file per error
class.

**Direction** — confirm whether `max-classes-per-file: 1` is intended; if so,
note it; otherwise relax it.

---

## ℹ️ Finding 11 — the React stack is not dogfooded

The repo lints its own source with `moc()`, but the source is the config itself
(no React) and the only fixtures are `fixtures/node-ts`. Nothing in the repo ever
loads `createReactConfig()` against real `.tsx`, so Findings 1 and 2 (both of
which abort ESLint before any rule runs) were invisible to the repo's own lint,
tests, and CI. The `examples/react-app` here is the first time the React path is
exercised against real components.

**Direction** — add a React (and ideally Vue/Nest) example or fixture that the
test suite lints, so framework-stack regressions are caught.

---

## ℹ️ Finding 12 — `react-compiler` peer is installed but never loaded

`STACKS.react` lists `eslint-plugin-react-compiler` among its required plugins
(so `init`/`doctor` install it), but `createReactConfig()` only composes
`react.eslint` + `react-overrides.eslint`. `react-compiler.eslint.ts` is opt-in
and is never wired into `moc()`. Consumers install a plugin the default config
never uses.

**Direction** — either wire React Compiler in (perhaps behind a flag/detection)
or drop it from the React stack's required plugins and document it as opt-in.

---

## Working as designed (not bugs — noted to pre-empt the review)

- **Import-alias policy.** `@dword-design/import-alias/prefer-alias` prefers a
  **relative** path when the target is reachable without `../`, and the alias
  only when you'd otherwise climb out of the directory (`../`). So in the
  TypeScript example, `src/index.ts` importing `@config/env` is flagged in favor
  of `./config/env`, while `src/services/*` importing `@domain/*` correctly
  keeps the alias. The example deliberately over-aliases to show this; it's the
  rule behaving as configured, not a defect. (Autofixable.)
- **Ordinary autofixable style.** Import sorting (`simple-import-sort`), Prettier
  formatting, `@typescript-eslint/dot-notation`, `unicorn/no-array-sort`
  (`toSorted`), `@typescript-eslint/array-type`, `perfectionist/sort-*`,
  `unicorn/no-useless-promise-resolve-reject`, `sonarjs/todo-tag` all fired as
  expected and are `--fix`-able. ~18–19 of each project's errors are autofixable.

## What works well

- The packed tarball installs cleanly and ships a complete prebuilt `dist/`
  (135 files); no consumer build step was needed.
- `moc()` zero-config **stack auto-detection** works: the Node/TS project loaded
  the base, and the React project detected React from dependencies and layered
  the React rules.
- **Type-aware linting** engaged in both projects (`projectService`), and both
  projects `tsc --noEmit` clean.
- **tsconfig path-alias resolution** works: aliases are read from `tsconfig.json`
  and drive both `import-alias` and the `simple-import-sort` internal groups.
- The TypeScript project is fully functional end-to-end; all of its findings are
  ordinary rule reports, not failures of the config machinery.

## Raw output & repro

```bash
# from repo root
npm run build && npm pack            # → moc-global-eslint-config-2.0.0.tgz

cd examples/typescript-app && npm i && npx tsc --noEmit && npx eslint .
#   tsc: clean.  eslint: exit 1, 29 problems (24 errors, 5 warnings).

cd ../react-app && npm i && npx eslint .
#   WITHOUT workarounds: exit 2, ESLint crashes (Finding 1, then Finding 2).
#   WITH the package.json override + eslint.config.mjs version pin:
#   tsc: clean.  eslint: exit 1, 31 problems (31 errors).
```

The two example projects are committed under `examples/` (with `node_modules/`
and `*.tgz` git-ignored) and double as usage references once the findings above
are resolved.
