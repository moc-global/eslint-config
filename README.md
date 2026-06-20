<p align="center">
  <img src="docs/public/logo.svg" alt="@moc-global/eslint-config" width="140">
</p>

# @moc-global/eslint-config

> The shared, company-wide ESLint flat config for Node.js, NestJS, React, Next.js, and Vue — with a one-command installer.

A single, versioned package that encodes one strict standard for our TypeScript and JavaScript. Core plugins ship bundled and version-locked; framework plugins load on demand. Adopt it in one command, govern it in one place.

## Quick start

```bash
npx @moc-global/eslint-config init
```

This detects your framework and package manager, installs what you need, writes `eslint.config.mjs`, and adds lint scripts. Or do it manually:

```bash
npm i -D @moc-global/eslint-config eslint
```

```js
// eslint.config.mjs
import { moc } from '@moc-global/eslint-config';

export default moc(); // auto-detects your stack
```

```bash
npm run lint
```

## What it covers

- **Stacks:** Node/TypeScript (base), NestJS, React, Next.js (= React + Next), Vue
- **Add-ons:** Vite (React Fast Refresh), Vitest, Jest, Zod, i18next, Tailwind CSS
- **Out of the box:** type-aware TS linting, import hygiene, security rules, naming conventions, Prettier integration, dead-code detection, and more — see the [rules reference](./docs/reference/plugins.md).

## Examples

Five runnable example consumers live in [`examples/`](./examples) — each installs the
packed tarball and lints with a bare `export default moc()` (Vue opts into type-aware
SFCs with `moc({ vueTs: true })`):

| Example | Stack |
| --- | --- |
| [`typescript-app`](./examples/typescript-app) | Node + TypeScript, path aliases, layered architecture |
| [`react-app`](./examples/react-app) | React 19 + TypeScript (JSX runtime) |
| [`next-app`](./examples/next-app) | Next.js 16 — App Router + Pages Router, Route Handler, `'use client'` |
| [`nest-app`](./examples/nest-app) | NestJS — decorators, class-validator DTOs, Swagger |
| [`vue-app`](./examples/vue-app) | Vue 3 `<script setup lang="ts">` single-file components |

They double as living documentation **and** as a verification gate:
`npm run verify:examples` installs the freshly-packed config into each one and runs its
lint + typecheck, so a rule or plugin that breaks in a real consumer install fails
loudly. The husky **pre-push** hook runs it locally before every push.

## Installing without a public registry

Until it's published to a registry, install from Git or a tarball. The package is
authored in TypeScript and **builds itself on install** via the `prepare` script
(npm installs the build's devDependencies and compiles `dist/` automatically):

```jsonc
// git dependency — `prepare` compiles dist/ on install
"@moc-global/eslint-config": "git+ssh://git@github.com/dmytro-vakulenko-moc/eslint-config.git#semver:^2"
```

```bash
# or a packed tarball (the tarball ships the prebuilt dist/)
npm run build && npm pack && npm i -D ./moc-global-eslint-config-2.1.0.tgz
```

Once published, the registry tarball ships the prebuilt `dist/` (with `.d.ts`), so consumers need no build step.

## Adopting in an existing codebase

Don't fix everything at once. Baseline existing violations and ratchet down:

```bash
npx @moc-global/eslint-config init
npx eslint --suppress-all      # CI green today; only new violations fail
```

See [Existing & legacy projects](./docs/guide/existing-projects.md).

## Documentation

📖 **Published:** [dmytro-vakulenko-moc.github.io/eslint-config](https://dmytro-vakulenko-moc.github.io/eslint-config/)
— deployed from `main` by [`.github/workflows/docs.yml`](./.github/workflows/docs.yml)
(live once GitHub Pages is enabled with Source: "GitHub Actions").

Or run it locally (`npm run docs:dev`). Start with:

- [Why this config](./docs/guide/why.md)
- [Getting started](./docs/guide/getting-started.md)
- [How it works](./docs/guide/how-it-works.md)
- [Stacks & add-ons](./docs/guide/stacks.md)
- [The installer CLI](./docs/guide/cli.md)
- [API reference](./docs/reference/api.md)
- [Rules & plugins](./docs/reference/plugins.md)
- [Contributing](./docs/guide/contributing.md)

## Development

```bash
npm install              # legacy-peer-deps; `prepare` builds dist/ and installs husky git hooks
npm run build            # tsc → dist/*.js + *.d.ts
npm run lint             # the config lints its own TypeScript source
npm run typecheck
npm run test:run         # vitest — includes the React/Nest/Vue dogfood tests
npm run verify:examples  # install the packed config into examples/* and lint each
npm run docs:dev
```

All checks run **locally** via a **husky `pre-push` hook** before every push:
`lint` + `typecheck` + `test:run` (whose dogfood tests compose `moc()` for each stack and
lint a fixture) + `docs:build` + `pack:check` + `verify:examples`. The checks workflow
(`.github/workflows/ci.yml`) is kept on hand but **disabled** for now (manual-only); the
docs deploy (`.github/workflows/docs.yml`) is the one active workflow. Use
`git push --no-verify` to skip the hook for a one-off push.

## License

MIT — Master of Code Global. Maintained by Dmytro Vakulenko.
