# Stacks & add-ons

A **stack** is your primary framework. An **add-on** layers extra rules onto any stack. You select one base stack and any number of add-ons — the installer and `moc()` both speak this vocabulary.

## Base stacks

| Stack | Flag | Detected from | Extra plugins installed |
|---|---|---|---|
| Node / TypeScript | _(default)_ | always the base | none — all bundled |
| NestJS | `nest: true` | `@nestjs/core`, `@nestjs/common` | `@darraghor/eslint-plugin-nestjs-typed` |
| React | `react: true` | `react`, `react-dom`, `next` | `eslint-plugin-react`, `-react-hooks`, `-react-refresh`, `-react-compiler` |
| Vue | `vue: true` | `vue`, `nuxt` | `eslint-plugin-vue`, `vue-eslint-parser` |

- **Node** is always present. Every other stack builds on it.
- **NestJS** *replaces* the base call internally (it is Node + Nest rules), so you don't combine `nest` with raw Node.
- **React** and **Vue** *layer onto* the Node base.

### Vue: JS vs. TypeScript SFCs

Vue single-file components can be parsed for plain JS or type-aware TS. Opt into the TypeScript parser chain with `vueTs`:

```js
moc({ vue: true, vueTs: true });
```

Remember to include `*.vue` in your `tsconfig.json` and ESLint file globs.

## Add-ons

| Add-on | Flag | Detected from | Bundled? |
|---|---|---|---|
| Vitest | `vitest: true` | `vitest` | ✅ ships with the package |
| Jest | `jest: true` | `jest`, `@jest/globals` | needs `eslint-plugin-jest` |
| Zod | `zod: true` | `zod` | ✅ ships with the package |
| i18next | `i18n: true` | `i18next`, `react-i18next`, `vue-i18n` | needs `eslint-plugin-i18next` |
| Tailwind CSS | `tailwind: true` | `tailwindcss` | needs `eslint-plugin-better-tailwindcss` |

Bundled add-ons require no extra install — their plugins ship as dependencies of this package.

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
