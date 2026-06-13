# Getting started

## Requirements

- **Node.js** `^22.21` or `>=24.10`
- **ESLint** `^9.24` or `^10` (flat config)
- A `package.json` in your project root

::: tip Node floor
The minimum supported Node version is 22. If a project is on something older, upgrade Node rather than pinning old plugin versions — see [Versioning](/guide/versioning).
:::

## The fast path: the installer

From the root of your project:

```bash
npx @moc-global/eslint-config init
```

The wizard will:

1. Detect your **package manager** (from the lockfile) and **framework** (from your dependencies).
2. Ask which stack you're on (pre-selecting the detected one) and which add-ons you want.
3. Install `@moc-global/eslint-config` plus any optional plugins your stack needs.
4. Write an `eslint.config.mjs`.
5. Add `lint` and `lint:fix` scripts to your `package.json`.

For most projects it's two `Enter` presses. See the [installer reference](/guide/cli) for non-interactive flags.

### Non-interactive (CI, templates, scripts)

```bash
npx @moc-global/eslint-config init --preset react --extras vitest,zod --yes
```

## The manual path

If you'd rather not run the wizard, install the package and the plugins your stack needs, then write the config yourself.

::: code-group

```bash [Node / TypeScript]
npm i -D @moc-global/eslint-config eslint
```

```bash [React]
npm i -D @moc-global/eslint-config eslint \
  eslint-plugin-react eslint-plugin-react-hooks \
  eslint-plugin-react-refresh eslint-plugin-react-compiler
```

```bash [Vue]
npm i -D @moc-global/eslint-config eslint \
  eslint-plugin-vue vue-eslint-parser
```

```bash [NestJS]
npm i -D @moc-global/eslint-config eslint \
  @darraghor/eslint-plugin-nestjs-typed
```

:::

Then create `eslint.config.mjs`:

```js
import { moc } from '@moc-global/eslint-config';

export default moc();
```

`moc()` auto-detects your stack. To be explicit:

```js
import { moc } from '@moc-global/eslint-config';

export default moc({
  react: true,
  vitest: true,
});
```

Not sure you installed the right plugins? Run the doctor:

```bash
npx @moc-global/eslint-config doctor
```

## Install without a registry

There is no public registry yet. Both of these work and need no build step:

::: code-group

```json [Git dependency]
{
  "devDependencies": {
    "@moc-global/eslint-config": "git+ssh://git@github.com/moc-global/eslint-config.git#semver:^1"
  }
}
```

```bash [Tarball]
# In the config repo:
npm pack            # → moc-global-eslint-config-1.0.0.tgz

# In your project:
npm i -D ./vendor/moc-global-eslint-config-1.0.0.tgz
```

:::

## Run it

```bash
npm run lint        # or: npx eslint
npm run lint:fix    # autofix what can be fixed
```

Adopting into a codebase that already has violations? Don't fix them all at once — see [Existing & legacy projects](/guide/existing-projects).
