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
npx eslint-config-mocg init
```

The wizard will:

1. Detect your **package manager** (from the lockfile) and **framework** (from your dependencies).
2. Ask which stack you're on (pre-selecting the detected one) and which add-ons you want.
3. Install `eslint-config-mocg` plus any optional plugins your stack needs.
4. Write an `eslint.config.mjs`.
5. Add `lint` and `lint:fix` scripts to your `package.json`.

For most projects it's two `Enter` presses. A **Next.js** project is detected from its `next` dependency and offered as its own stack (Next = React + Next rules). See the [installer reference](/guide/cli) for non-interactive flags.

### Non-interactive (CI, templates, scripts)

```bash
npx eslint-config-mocg init --preset react --extras vitest,zod --yes
```

## The manual path

If you'd rather not run the wizard, install the package and the plugins your stack needs, then write the config yourself.

::: code-group

```bash [Node / TypeScript]
npm i -D eslint-config-mocg eslint
```

```bash [React]
npm i -D eslint-config-mocg eslint \
  eslint-plugin-react eslint-plugin-react-hooks
```

```bash [Next.js]
npm i -D eslint-config-mocg eslint \
  @next/eslint-plugin-next \
  eslint-plugin-react eslint-plugin-react-hooks \
  eslint-plugin-react-refresh
```

```bash [Vue]
npm i -D eslint-config-mocg eslint \
  eslint-plugin-vue vue-eslint-parser
```

```bash [NestJS]
npm i -D eslint-config-mocg eslint \
  @darraghor/eslint-plugin-nestjs-typed
```

:::

Then create `eslint.config.mjs`:

```js
import { mocg } from 'eslint-config-mocg';

export default mocg();
```

`mocg()` auto-detects your stack. To be explicit:

```js
import { mocg } from 'eslint-config-mocg';

export default mocg({
  react: true,
  vitest: true,
});
```

Not sure you installed the right plugins? Run the doctor:

```bash
npx eslint-config-mocg doctor
```

## Install without a public registry

There is no public registry yet. Both paths work; the package is authored in
TypeScript and compiles itself to `dist/` on install via the `prepare` script
(for Git installs npm pulls the build devDependencies and runs the build for you):

::: code-group

```json [Git dependency]
{
  "devDependencies": {
    "eslint-config-mocg": "git+ssh://git@github.com/dmytro-vakulenko-moc/eslint-config.git#semver:^2"
  }
}
```

```bash [Tarball]
# In the config repo (build first; the tarball ships dist/):
npm run build && npm pack   # → eslint-config-mocg-2.2.0.tgz

# In your project:
npm i -D ./vendor/eslint-config-mocg-2.2.0.tgz
```

:::

Once published to a registry, the tarball carries the prebuilt `dist/` (with `.d.ts`) and no install-time build runs.

## Run it

```bash
npm run lint        # or: npx eslint
npm run lint:fix    # autofix what can be fixed
```

Adopting into a codebase that already has violations? Don't fix them all at once — see [Existing & legacy projects](/guide/existing-projects).
