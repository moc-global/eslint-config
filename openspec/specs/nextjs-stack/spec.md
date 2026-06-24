# nextjs-stack Specification

## Purpose
Provide a first-class Next.js stack, composed as React plus the official
`@next/eslint-plugin-next` rules, so a Next.js project lints cleanly out of the box
via `mocg()`: the plugin's Core Web Vitals rule set, Next-aware Fast Refresh export
conventions for both the App and Pages Routers, relaxed documentation rules for
Route Handlers and middleware, and ignored Next build artifacts. The stack is
detected as superseding React (the React layer is applied exactly once, with React
as the fallback when Next is disabled) and is exercised by the repository's own
checks and a runnable example consumer.
## Requirements
### Requirement: Next.js stack is composed as React plus Next rules

`mocg()` SHALL provide a Next.js framework stack whose configuration is the React
configuration plus Next-specific rules. The Next stack SHALL reuse
`createReactConfig()` so that React, JSX-runtime, and React-hooks linting apply to
Next source, and SHALL layer the official `@next/eslint-plugin-next` rules on top.
The exported `createNextConfig()` factory SHALL itself include the React layer, so
importing `eslint-config-mocg/next` alone yields full React + Next coverage.

#### Scenario: Next stack includes React linting

- **WHEN** `mocg({ next: true })` composes the configuration
- **THEN** the React rules (JSX runtime, hooks) are present and the `@next/next` plugin is registered

#### Scenario: createNextConfig is self-contained

- **WHEN** a consumer imports `createNextConfig` from `eslint-config-mocg/next` and uses it without separately adding the React config
- **THEN** the resulting config lints `.tsx` React/Next source with both React and Next rules

### Requirement: Next rules come from the official plugin, not the meta-config

The Next stack SHALL load `@next/eslint-plugin-next` directly and SHALL NOT consume
`eslint-config-next`, because the meta-config re-bundles its own
`eslint-plugin-react`, `eslint-plugin-react-hooks`, and `typescript-eslint` that
would duplicate-register against this package's own plugins and conflict with its
tuning. The stack SHALL apply the plugin's `core-web-vitals` configuration, which
already contains every `recommended` rule plus the Core Web Vitals warn→error
upgrades.

#### Scenario: Core Web Vitals rules are active

- **WHEN** Next source uses an `<a>` tag to navigate between internal pages or a synchronous `<script>`
- **THEN** `@next/next/no-html-link-for-pages` and `@next/next/no-sync-scripts` report as errors

#### Scenario: No duplicate React plugin registration

- **WHEN** the Next stack is composed
- **THEN** ESLint loads without a duplicate-plugin error and `eslint-config-next` is not a dependency of the resolved config

### Requirement: Next-aware Fast Refresh export conventions

When the Next stack is active, `react-refresh/only-export-components` SHALL allow
the non-component exports that Next legitimately requires, covering both the App
Router (e.g. `metadata`, `generateMetadata`, `generateStaticParams`, `dynamic`,
`revalidate`, `viewport`) and the Pages Router (`getStaticProps`,
`getServerSideProps`, `getStaticPaths`, `getInitialProps`, `config`,
`reportWebVitals`).

#### Scenario: App Router metadata export is not flagged

- **WHEN** an App Router `page.tsx` exports a `metadata` object alongside the default page component
- **THEN** `react-refresh/only-export-components` does not report the `metadata` export

#### Scenario: Pages Router data-fetching export is not flagged

- **WHEN** a Pages Router page exports `getServerSideProps` alongside the default component
- **THEN** `react-refresh/only-export-components` does not report the `getServerSideProps` export

### Requirement: Next build artifacts are ignored

The Next stack SHALL ignore Next.js build artifacts and generated files so they are
never linted: `.next/`, `out/`, and `next-env.d.ts`. (Next.js 16 removed
`next lint`, so the config — consumed by the ESLint CLI — owns these ignores
itself.)

#### Scenario: Generated next-env.d.ts is not linted

- **WHEN** `eslint .` runs in a Next project containing `next-env.d.ts` and a `.next/` directory
- **THEN** neither `next-env.d.ts` nor any file under `.next/` is linted

### Requirement: Next supersedes React and is applied exactly once

A project that depends on `next` SHALL resolve to the Next stack: `mocg()` and the
installer SHALL prefer `next` over the standalone `react` stack, and the React
layer SHALL be applied exactly once (composed inside the Next stack) — never twice
and never zero times. Detection SHALL remain non-lossy (it MAY report both `react`
and `next`); the precedence is applied at composition and display time. When `next`
is explicitly disabled, the configuration SHALL fall back to the React stack (a
Next.js project is still a React project) rather than collapsing to a Node-only lint.

#### Scenario: Next project resolves to the Next stack

- **WHEN** `mocg()` composes a project with `next`, `react`, and `react-dom` in its dependencies
- **THEN** the Next stack is applied (the `@next/next` plugin is registered) and no standalone React stack is layered on top of it

#### Scenario: React layer is applied exactly once under Next

- **WHEN** `mocg()` composes a Next project
- **THEN** the React rule blocks appear exactly once in the resolved config (the Next stack does not stack a second React layer on top of an independent React stack)

#### Scenario: Disabling Next falls back to React

- **WHEN** `mocg({ next: false })` is composed for a project that depends on `next`
- **THEN** the Next stack is not applied, and the React stack is applied instead (the React rule blocks are present), not a Node-only configuration

#### Scenario: Fast Refresh is registered once when Vite is also present

- **WHEN** the Next stack is active and the `vite` add-on would otherwise apply (e.g. the project also depends on `vite`)
- **THEN** `eslint-plugin-react-refresh` is registered exactly once (by the Next stack) so ESLint does not error on a duplicate plugin, and Next's `allowExportNames` are not overridden

### Requirement: The Next stack is exercised by the repository's own checks

The repository's automated checks SHALL compose the Next stack via `mocg()` and lint
real Next.js source (App Router and Pages Router) so that a Next stack which crashes
ESLint at load or rule time, or emits spurious convention errors, fails the suite
rather than shipping. A consumer-facing example SHALL install the packaged config
and lint clean under the examples verification harness.

#### Scenario: Next stack is linted in CI

- **WHEN** the test suite runs
- **THEN** it composes the Next stack via `mocg({ next: true })` and runs ESLint over Next `.tsx` source, failing if ESLint crashes

#### Scenario: Next example lints clean against the packaged config

- **WHEN** the examples verification harness installs the packed tarball into `examples/next-app` and runs its `lint` and `typecheck` scripts
- **THEN** both complete with zero errors

