# @moc-global/eslint-config

> The shared, company-wide ESLint flat config for Node.js, NestJS, React, and Vue — with a one-command installer.

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

- **Stacks:** Node/TypeScript (base), NestJS, React, Vue
- **Add-ons:** Vitest, Jest, Zod, i18next, Tailwind CSS
- **Out of the box:** type-aware TS linting, import hygiene, security rules, naming conventions, Prettier integration, dead-code detection, and more — see the [rules reference](./docs/reference/plugins.md).

## Install without a registry

```jsonc
// git dependency
"@moc-global/eslint-config": "git+ssh://git@github.com/moc-global/eslint-config.git#semver:^1"
```

```bash
# or a packed tarball
npm pack && npm i -D ./moc-global-eslint-config-1.0.0.tgz
```

Both are buildless — the package ships plain `.mjs`, nothing to compile.

## Adopting in an existing codebase

Don't fix everything at once. Baseline existing violations and ratchet down:

```bash
npx @moc-global/eslint-config init
npx eslint --suppress-all      # CI green today; only new violations fail
```

See [Existing & legacy projects](./docs/guide/existing-projects.md).

## Documentation

Full docs (VitePress): `npm run docs:dev`. Start with:

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
npm install          # legacy-peer-deps (some plugins lag on the ESLint 10 peer range)
npm run lint         # the config lints itself
npm run typecheck
npm run test:run
npm run docs:dev
```

## License

MIT — Master of Code Global. Maintained by Dmytro Vakulenko.
