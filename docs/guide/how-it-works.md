# How it works

## The big picture

```
                       your eslint.config.mjs
                                │
                        moc({ flags })          ← umbrella factory
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                        │
   Node base            Framework layer            Add-on layer
 createNodeConfig   react / next / vue / nest   vite / vitest / jest
   (always)          (optional peers)           zod / i18n / tailwind
        │                       │                        │
        └───────────────────────┴────────────────────────┘
                                │
                    a single flat-config array
```

`moc()` is a thin orchestrator. It decides **which** layers to include, then composes them **in the right order**. All the actual rules live in small, focused modules under the package.

## Composition order matters

ESLint flat config is last-write-wins: a later config block overrides an earlier one for any file it matches. `moc()` owns that order so you don't have to:

1. **Node base** (`createNodeConfig`) — JavaScript + TypeScript rules, with per-file overrides placed last internally.
2. **Framework layer** — React, Next.js, Vue, or (as a base replacement) NestJS, layered on top of the Node base. **Next.js is React + Next rules**, so it supersedes the React stack: the React layer is composed inside the Next stack and applied exactly once, never twice.
3. **Add-ons** — Vite Fast Refresh, Vitest/Jest test rules, Zod, i18n, Tailwind.

Because the umbrella controls this, your config file stays a single `moc()` call and still gets correct precedence.

## Bundled core vs. optional peers

```
dependencies (bundled, version-locked)        peerDependencies (optional)
────────────────────────────────────          ───────────────────────────
typescript-eslint, unicorn, sonarjs,           eslint-plugin-react (+hooks,
perfectionist, @stylistic, import-x,             refresh, compiler)
jsdoc, n, security, no-secrets, promise,       eslint-plugin-vue (+ parser)
regexp, depend, prettier, …                    @darraghor/…nestjs-typed
                                               eslint-plugin-jest, i18next,
zod + vitest plugins also bundled              better-tailwindcss
```

- **Core plugins are dependencies.** Their versions are pinned by this package, so every project runs the same, tested combination.
- **Framework plugins are optional peers.** A Node-only backend never installs React or Vue plugins. The installer adds exactly the peers your stack needs.

## Optional peers load lazily

Each framework lives behind a subpath export (`@moc-global/eslint-config/react`, `/next`, `/vue`, `/nest`). `moc()` imports these **dynamically**, only when the corresponding flag is on. If a required peer is missing, you get an actionable error instead of a cryptic module-resolution failure:

```
[@moc-global/eslint-config] The "React" config requires packages that are not installed.

  Install them:   npm i -D eslint-plugin-react eslint-plugin-react-hooks …
  Or run:         npx @moc-global/eslint-config init
```

This is also why `moc()` returns a **Promise** — ESLint supports async flat config, so `export default moc()` works directly.

## Auto-detection

`moc()` reads your `package.json` (all dependency fields) and enables stacks/add-ons whose marker packages are present — `react` → React, `next` → Next.js, `@nestjs/core` → NestJS, `vite` → Vite Fast Refresh, `vitest` → Vitest rules, and so on. An explicit flag always wins:

```js
moc()                  // fully auto-detected
moc({ react: true })   // force React on
moc({ vue: false })    // force Vue off even if detected
moc({ next: false })   // force Next off even if `next` is detected
```

::: tip Next supersedes React
A Next.js project depends on `next`, `react`, and `react-dom`, so both stacks would match. Detection resolves this in one place: when `next` is present it **wins**, and `react` is dropped from the detected stacks. The Next stack already composes the React layer, so React is applied exactly once.
:::

## Type-aware linting

The TypeScript layer uses `projectService`, so type-aware rules work without you wiring up `parserOptions.project`. The config auto-discovers your `tsconfig.json` (or a candidate like `tsconfig.base.json`), and you can point it explicitly:

```js
moc({ tsconfig: 'tsconfig.app.json' });
```

See the [API reference](/reference/api) for every option.
