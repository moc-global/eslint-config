## Why

Next.js projects currently get the bare React stack — the `react` stack merely lists `next` in its `detect` array, so Next-specific issues (`<img>` over `next/image`, sync scripts, `next/head` misuse, App-Router export conventions) go unlinted. A Next.js app is a React app plus Next rules, so the config should treat Next as a first-class framework stack: **next = react + next**.

Pursuing this also surfaces a latent defect to fix: the React stack bakes in `reactRefresh.configs.vite`, a Vite-only Fast Refresh preset, so today **every** React consumer (Vite, webpack, and Next) inherits Vite-specific assumptions. Refresh is a bundler concern, not a React concern.

## What Changes

- **Add a `next` framework stack** composed as React + Next: it reuses `createReactConfig()`, layers `@next/eslint-plugin-next`'s `core-web-vitals` rules (which already include `recommended`), applies `eslint-plugin-react-refresh`'s built-in `next` preset (extended with Pages-Router export names), relaxes `jsdoc/require-jsdoc` for `route.ts`/`middleware.ts`, and `globalIgnores` the Next build artifacts (`.next/`, `out/`, `next-env.d.ts`).
- Use **`@next/eslint-plugin-next` directly**, NOT `eslint-config-next` (which re-bundles its own react/react-hooks/typescript-eslint and would duplicate-register plugins and conflict with this package's tuning).
- **Make `createReactConfig()` bundler-agnostic (BREAKING for direct `/react`-subpath Vite importers):** remove the baked-in `reactRefresh.configs.vite`. React Fast Refresh moves out of the React stack.
- **Add an auto-detected `vite` add-on** (`detect: ['vite']`) that supplies `reactRefresh.configs.vite()`. This keeps `moc()` Vite users non-breaking — their Fast Refresh linting is restored automatically.
- **Detection precedence:** remove `'next'` from the React stack's `detect`; add `next`-supersedes-`react` precedence in `detect.ts` so a Next project (which has `react` + `react-dom` + `next`) resolves to `next` only, and `moc()` applies the React layer exactly once.
- **New subpath exports** `./next` and `./vite`; register `next` in `ENTRY_IMPORTERS`; add `next?`/`vite?` flags to `MocOptions`.
- **CLI:** add `next` to the wizard's `BASE_ORDER` and to the `--preset` help/validation strings (everything else auto-wires from the manifest).
- **Dependencies:** add `@next/eslint-plugin-next` as an optional peer + dev dependency.
- **New example** `examples/next-app` exercising both App Router (metadata, route handler, `'use client'`) and Pages Router (`getServerSideProps`), consumed via zero-config `moc()`.
- **Docs sweep:** README, VitePress guide/reference, and CHANGELOG (semver **2.1.0**).
- Reuse the existing `/react-compiler` subpath for Next (no `next-compiler`).

## Capabilities

### New Capabilities
- `nextjs-stack`: The Next.js framework stack — composed as React + Next, loading the official `@next/eslint-plugin-next` rules, applying Next-aware Fast Refresh export conventions, ignoring Next build artifacts, detected as superseding React, applied exactly once, and exercised by the repository's own checks.

### Modified Capabilities
- `framework-stack-compatibility`: The React stack becomes bundler-agnostic — Vite Fast Refresh is no longer baked in. A new auto-detected `vite` add-on supplies `reactRefresh.configs.vite()` when `vite` is a dependency, preserving `moc()` Vite users' behavior.
- `rule-policy-coherence`: The intentional component-documentation policy extends to Next.js Route Handlers and middleware — exported `route.ts`/`middleware.ts` functions are not required to carry JSDoc, matching the existing React-component exemption.

## Impact

- **Source:** `src/core/manifest.ts` (new `next` stack, new `vite` extra, react `detect` change), `src/core/detect.ts` (precedence), `src/index.ts` (`ENTRY_IMPORTERS`, `MocOptions`, single-apply composition), `src/config/react/react.eslint.ts` (drop Vite coupling), new `src/config/next.eslint.ts` + `src/config/next/*`, new `src/config/react-refresh/vite.eslint.ts`, `src/cli/index.ts` + `src/cli/init.ts`.
- **APIs:** new `createNextConfig()` factory; new `./next` and `./vite` exports; `MocOptions.next`/`MocOptions.vite`.
- **Dependencies:** `@next/eslint-plugin-next` (optional peer + dev). `eslint-plugin-react-refresh` peer retained (now consumed by the `vite` add-on and `next` stack rather than the React stack).
- **Consumers:** non-breaking for `moc()` users (Vite refresh auto-restored). Breaking only for consumers importing the `/react` subpath directly and relying on the previously-bundled Vite Fast Refresh — they add `@moc-global/eslint-config/vite`. Documented in CHANGELOG.
- **Tests + examples:** new `fixtures/detect/next`, `fixtures/next-ts`, detection-precedence + single-apply assertions, dogfood lint, `examples/next-app` under the e2e harness.
