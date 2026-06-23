# The installer CLI

The package ships a CLI exposed as `eslint-config-mocg` (and the `eslint-config-mocg` bin). It has two commands: `init` and `doctor`.

## `init`

```bash
npx eslint-config-mocg init [options]
```

What it does, in order:

1. **Detects** your package manager (npm / yarn / pnpm / bun, from the lockfile or the `packageManager` field) and your framework (from `package.json` dependencies).
2. **Asks** which base stack you're on — pre-selecting the detected one — and which add-ons to enable. (Skipped with `--yes`.)
3. **Installs** `eslint-config-mocg` plus the optional peer plugins your selection needs, using your package manager.
4. **Writes** `eslint.config.mjs` (it will not overwrite an existing one — it prints the suggested contents instead).
5. **Patches** `package.json` with `lint` and `lint:fix` scripts if they're missing.

### Options

| Option | Description |
|---|---|
| `--preset <stack>` | Base stack: `node`, `nest`, `react`, or `vue`. Skips the stack prompt. |
| `--extras <a,b>` | Comma-separated add-ons: `vitest`, `jest`, `zod`, `i18n`, `tailwind`. |
| `-y`, `--yes` | Non-interactive. Uses detection plus any `--preset`/`--extras` you pass. |
| `--no-install` | Write the config and scripts only; print the install command instead of running it. |
| `--dry-run` | Print every action without writing files or installing. |
| `--cwd <dir>` | Operate in `<dir>` instead of the current directory. |

### Examples

```bash
# Interactive, auto-detected:
npx eslint-config-mocg init

# Pin the stack, non-interactive (great for CI or templates):
npx eslint-config-mocg init --preset nest --extras vitest --yes

# See what it would do, without touching anything:
npx eslint-config-mocg init --preset react --dry-run
```

## `doctor`

```bash
npx eslint-config-mocg doctor
```

Detects your stack, then checks that every plugin it requires is actually installed and resolvable from your project. It reports versions for what's present and an install command for whatever's missing. Use it when lint behaves differently than expected — it answers "do I have the right plugins?" without a back-and-forth.

```
▸ Diagnosing ESLint config setup
Detected stacks: react
Detected extras: vitest

✔ eslint 10.5.0
✔ eslint-plugin-react 7.37.5
✔ eslint-plugin-react-hooks 7.1.1
! eslint-plugin-react-refresh is missing (required by your detected stack)

! 1 package(s) missing. Install them:
  npm i -D eslint-plugin-react-refresh
```

## `help`

```bash
npx eslint-config-mocg help
```
