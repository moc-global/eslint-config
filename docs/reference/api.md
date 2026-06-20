# API: `moc()` & factories

## `moc(options?)`

The umbrella factory. Returns a `Promise` resolving to a flat-config array. Use it as the default export of your `eslint.config.mjs`.

```js
import { moc } from '@moc-global/eslint-config';

export default moc(options);
```

### Options

All options are optional. Stack/add-on flags are `boolean | undefined` — `true` forces on, `false` forces off, omitted means auto-detect.

| Option | Type | Default | Description |
|---|---|---|---|
| `node` | `boolean` | always on | The Node/TypeScript base. Always included. |
| `nest` | `boolean` | auto | NestJS rules (replaces the base with Node + Nest). |
| `react` | `boolean` | auto | React, hooks, and JSX-runtime rules. (Fast Refresh is the `vite` add-on; React Compiler is opt-in — see `/react-compiler`.) |
| `next` | `boolean` | auto | Next.js rules — React + the official `@next/eslint-plugin-next` Core Web Vitals rules. Supersedes `react`. |
| `vue` | `boolean` | auto | Vue SFC rules. |
| `vueTs` | `boolean` | `false` | Use the TypeScript parser chain for `.vue` files. |
| `vite` | `boolean` | auto | React Fast Refresh rules (auto-enabled when `vite` is a dependency). |
| `vitest` | `boolean` | auto | Vitest test-file rules (plugin bundled). |
| `jest` | `boolean` | auto | Jest test-file rules. |
| `zod` | `boolean` | auto | Zod schema rules (plugin bundled). |
| `i18n` | `boolean` | auto | i18next rules. |
| `tailwind` | `boolean` | auto | Tailwind class rules. |
| `rootDir` | `string` | `process.cwd()` | Project root for resolving tsconfig and detection. |
| `tsconfig` | `string` | auto-discovered | Explicit tsconfig filename for type-aware linting. |
| `scriptstsconfig` | `string` | `tsconfig.scripts.json` | Explicit tsconfig for the `scripts/` directory. |
| `gitignore` | `string` | `<rootDir>/.gitignore` | Path to the `.gitignore` to honor as ignores. |

### Examples

```js
export default moc();                              // auto-detect everything
export default moc({ react: true, vitest: true }); // explicit stacks
export default moc({ tsconfig: 'tsconfig.app.json' });
export default moc({ vue: true, vueTs: true });    // type-aware Vue SFCs
```

## Subpath exports (escape hatches)

Each stack is also exported on its own subpath, importing its optional peers directly. Use these when you want to hand-compose the array instead of letting `moc()` orchestrate.

| Import | Export(s) |
|---|---|
| `@moc-global/eslint-config` | `moc` (default & named), `createNodeConfig`, `detectStacks`, `STACKS`, `EXTRAS` |
| `@moc-global/eslint-config/node` | `createNodeConfig`, default |
| `@moc-global/eslint-config/react` | `createReactConfig`, default (pristine — no Fast Refresh) |
| `@moc-global/eslint-config/next` | `createNextConfig`, default (React + Next) |
| `@moc-global/eslint-config/react-compiler` | default (opt-in; requires `eslint-plugin-react-compiler`) |
| `@moc-global/eslint-config/vite` | default (React Fast Refresh; requires `eslint-plugin-react-refresh`) |
| `@moc-global/eslint-config/vue` | `createVueConfig`, `createVueTsConfig`, default |
| `@moc-global/eslint-config/nest` | `createNestConfig`, default |
| `@moc-global/eslint-config/vitest` | default |
| `@moc-global/eslint-config/jest` | default |
| `@moc-global/eslint-config/zod` | default |
| `@moc-global/eslint-config/i18n` | default |
| `@moc-global/eslint-config/tailwind` | default |
| `@moc-global/eslint-config/stacks` | `STACKS`, `EXTRAS`, `requiredPlugins`, `PACKAGE_NAME` |

::: warning Why framework factories aren't on the root
The root entry only re-exports `createNodeConfig` (which has no optional peers). Framework factories live on their subpaths so importing the root never forces React/Vue/Nest plugins to resolve. Import `createReactConfig` from `@moc-global/eslint-config/react`, not from the root.
:::

### Hand-composing

```js
import { defineConfig } from 'eslint/config';
import { createNodeConfig } from '@moc-global/eslint-config/node';
import { createReactConfig } from '@moc-global/eslint-config/react';

export default defineConfig([
  ...createNodeConfig({ tsconfig: 'tsconfig.json' }),
  ...createReactConfig(),
]);
```

## `detectStacks(rootDir?)`

Returns `{ stacks: string[], extras: string[] }` for a project root, based on its declared dependencies. This is what `moc()` uses internally and what the CLI uses for pre-selection.

```js
import { detectStacks } from '@moc-global/eslint-config';

detectStacks(process.cwd()); // → { stacks: ['react'], extras: ['vitest'] }
```

## `STACKS` / `EXTRAS` / `requiredPlugins`

The manifest that drives the installer, `doctor`, and error messages. `requiredPlugins(selection)` returns the `{ packageName: versionRange }` map an install would need for a given selection of stack/extra keys. Versions are sourced from this package's own `peerDependencies`, so there is a single source of truth.
