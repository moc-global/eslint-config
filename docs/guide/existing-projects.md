# Existing & legacy projects

Adopting a strict config in a greenfield project is easy. The hard case is the four-year-old codebase where `npm run lint` suddenly reports two thousand violations. If the only option is "fix everything before CI goes green," adoption never happens.

It doesn't have to be all-or-nothing.

## The strategy: baseline, then ratchet

ESLint has a built-in mechanism for exactly this — **bulk suppressions** (ESLint ≥ 9.24). You record every *existing* violation as a baseline. From then on:

- Existing violations are **silenced**, so CI is green immediately.
- **New** violations (new code, or newly-introduced errors in files you touch) **fail** normally.
- As you fix old violations, the baseline only ever shrinks. It's a one-way ratchet toward clean.

```
  install config ──▶ baseline existing issues ──▶ CI green today
                                │
                                ├─ new code held to the full standard
                                └─ old issues fixed gradually, at your pace
```

## Step by step

1. **Install and configure** the way any project would:

   ```bash
   npx eslint-config-mocg init
   ```

2. **Create the baseline.** This writes `eslint-suppressions.json` capturing every current violation:

   ```bash
   npx eslint --suppress-all
   ```

3. **Commit `eslint-suppressions.json`.** It is part of the repo. CI is now green: only new violations fail.

4. **Burn it down over time.** After fixing some violations, prune the entries that no longer apply:

   ```bash
   npx eslint --prune-suppressions
   ```

   The file shrinks. When it's empty, you're fully on the standard — delete it.

::: tip Suppress one rule at a time
To adopt incrementally rule-by-rule instead of all at once, baseline a single rule:

```bash
npx eslint --suppress-rule unicorn/prevent-abbreviations
```
:::

## Fixing in bulk with an agent

Because the baseline keeps CI green, the cleanup is no longer time-critical — which makes it a great fit for an automated pass. A practical loop:

1. Pick a file or a rule from the suppressions file.
2. Run `npx eslint --fix` to clear the autofixable violations.
3. Have an agent (or a developer) resolve the rest, **with the project's tests as the safety net** — if the suds tests pass after the refactor, the change is sound.
4. `npx eslint --prune-suppressions` and commit.

Repeat until `eslint-suppressions.json` is empty. Nothing about this is big-bang; each step is independently shippable.

## Migrating from `eslint-config-next`

If a Next.js project already uses `eslint-config-next`, replace it — don't layer the
two. `eslint-config-next` re-bundles its own `eslint-plugin-react`,
`eslint-plugin-react-hooks`, and `typescript-eslint`, which would duplicate-register
against this config's own copies and conflict with its tuning. The Next stack here
uses `@next/eslint-plugin-next` directly and brings the React layer itself.

1. Remove the old config and dependency:

   ```bash
   npm rm eslint-config-next
   ```

2. Install and initialize (the wizard detects `next` and offers the Next stack):

   ```bash
   npx eslint-config-mocg init
   ```

3. Your `eslint.config.mjs` becomes a single zero-config call — Next is auto-detected:

   ```js
   import { mocg } from 'eslint-config-mocg';

   export default mocg();
   ```

The Next stack already covers what `eslint-config-next` gave you (the
`@next/eslint-plugin-next` Core Web Vitals rules, React, and hooks) plus this
config's full strict baseline. Build artifacts (`.next/`, `out/`, `next-env.d.ts`)
are ignored for you.

## What about per-rule relaxation?

If a particular rule genuinely doesn't fit a project, relax it locally and visibly in that project's `eslint.config.mjs` — append a config block after `mocg()`:

```js
import { mocg } from 'eslint-config-mocg';

const config = await mocg();

export default [
  ...config,
  {
    name: 'local/overrides',
    rules: {
      // Deliberately relaxed for this repo — explain why.
      'unicorn/prevent-abbreviations': 'off',
    },
  },
];
```

Prefer suppressions for *temporary* debt and local overrides for *permanent, intentional* deviations. Keep both rare — the value of a shared config is that everyone runs the same rules.
