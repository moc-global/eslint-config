# Stacks & add-ons

A **stack** is your primary framework. An **add-on** layers extra rules onto any stack. You select one base stack and any number of add-ons — the installer and `moc()` both speak this vocabulary.

## Base stacks

| Stack | Flag | Detected from | Extra plugins installed |
|---|---|---|---|
| Node / TypeScript | _(default)_ | always the base | none — all bundled |
| NestJS | `nest: true` | `@nestjs/core`, `@nestjs/common` | `@darraghor/eslint-plugin-nestjs-typed` |
| React | `react: true` | `react`, `react-dom` | `eslint-plugin-react`, `-react-hooks` |
| Next.js | `next: true` | `next` | `@next/eslint-plugin-next`, `eslint-plugin-react`, `-react-hooks`, `-react-refresh` |
| Vue | `vue: true` | `vue`, `nuxt` | `eslint-plugin-vue`, `vue-eslint-parser` |

- **Node** is always present. Every other stack builds on it.
- **NestJS** *replaces* the base call internally (it is Node + Nest rules), so you don't combine `nest` with raw Node.
- **React**, **Vue**, and **Next.js** *layer onto* the Node base.
- **Next.js** *is* React + Next rules, so it **supersedes** the React stack: a Next project (which depends on `react` and `react-dom` too) resolves to `next` only, and the React layer is applied exactly once.

### Next.js

The Next.js stack is **React + Next**. `createNextConfig()` composes the React
config and layers the official [`@next/eslint-plugin-next`](https://nextjs.org/docs/app/api-reference/config/eslint)
on top — applying its `core-web-vitals` rule set (which already includes
`recommended`, plus the warn→error upgrades for `no-html-link-for-pages` and
`no-sync-scripts`). It deliberately uses the plugin **directly** rather than
`eslint-config-next`, which would re-bundle its own copies of `eslint-plugin-react`,
`-react-hooks`, and `typescript-eslint` and clash with this package's tuning.

```js
import { moc } from '@moc-global/eslint-config';

// Zero-config — `next` is auto-detected and supersedes the React stack.
export default moc();
```

The stack supports **both routers**: it allows the non-component exports that the
App Router (`metadata`, `generateMetadata`, `generateStaticParams`, …) and the
Pages Router (`getStaticProps`, `getServerSideProps`, …) legitimately export, so
`react-refresh/only-export-components` doesn't flag them. It also relaxes
`jsdoc/require-jsdoc` for Route Handlers (`route.ts`) and `middleware.ts`, and
ignores Next build artifacts (`.next/`, `out/`, `next-env.d.ts`).

The **React Compiler** rules are reused as-is for Next — there is no separate
`next-compiler`. Opt in via the `@moc-global/eslint-config/react-compiler` export
(see below).

### React Compiler (opt-in)

The React stack does **not** enable the React Compiler rules by default, and
`eslint-plugin-react-compiler` is an *optional* peer — it is not auto-installed.
Enable it explicitly only if you run the React Compiler:

```js
import { moc } from '@moc-global/eslint-config';
import reactCompiler from '@moc-global/eslint-config/react-compiler';

const config = await moc();

export default [...config, ...reactCompiler];
```

```bash
npm i -D eslint-plugin-react-compiler
```

### Vue: JS vs. TypeScript SFCs

Vue single-file components can be parsed for plain JS or type-aware TS. Opt into the TypeScript parser chain with `vueTs`:

```js
moc({ vue: true, vueTs: true });
```

Remember to include `*.vue` in your `tsconfig.json` and ESLint file globs, and
add a `*.vue` type shim (`declare module '*.vue'`) so `import App from './App.vue'`
type-resolves under the TypeScript parser. PascalCase is enforced on SFC
**filenames** only (not directories), and Prettier — not eslint-plugin-vue —
owns SFC formatting.

## Add-ons

| Add-on | Flag | Detected from | Bundled? |
|---|---|---|---|
| Vite (React Fast Refresh) | `vite: true` | `vite` | needs `eslint-plugin-react-refresh` |
| Vitest | `vitest: true` | `vitest` | ✅ ships with the package |
| Jest | `jest: true` | `jest`, `@jest/globals` | needs `eslint-plugin-jest` |
| Zod | `zod: true` | `zod` | ✅ ships with the package |
| i18next | `i18n: true` | `i18next`, `react-i18next`, `vue-i18n` | needs `eslint-plugin-i18next` |
| Tailwind CSS | `tailwind: true` | `tailwindcss` | needs `eslint-plugin-better-tailwindcss` |

Bundled add-ons require no extra install — their plugins ship as dependencies of this package.

### Vite Fast Refresh

Fast Refresh is a bundler/HMR concern, so the React stack itself is **pristine** —
it no longer bakes in the Vite preset. Instead, the `vite` add-on supplies
`react-refresh`'s `vite` preset (`allowConstantExport`) and is **auto-enabled**
whenever a project depends on `vite`. So a `moc()` Vite + React project keeps Fast
Refresh linting with no change. The only consumers that need to act are those who
import the `@moc-global/eslint-config/react` subpath **directly** (not via `moc()`):
add `@moc-global/eslint-config/vite` alongside it.

## Putting it together

```js
import { moc } from '@moc-global/eslint-config';

// A NestJS service tested with Vitest, using Zod schemas:
export default moc({
  nest: true,
  vitest: true,
  zod: true,
});
```

```js
// A React app with Tailwind and i18n — everything auto-detected:
export default moc();
```

Each flag may be `true` (force on), `false` (force off), or omitted (auto-detect). See [How it works](/guide/how-it-works#auto-detection).
