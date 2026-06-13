# Why this config

Every team accumulates lint configuration: a `.eslintrc` here, a copied `eslint.config.mjs` there, each project pinning slightly different plugin versions and toggling slightly different rules. Over time they drift. A rule that errors in one repo warns in another; an autofix that's safe in one codebase rewrites code unexpectedly in the next. Onboarding a new project means copy-pasting the "current best" config from whichever repo looks freshest.

`@moc-global/eslint-config` exists to end that drift. It is a single, versioned package that encodes one opinionated standard for how our TypeScript and JavaScript should look and behave.

## What you get

- **One standard, many stacks.** The same Node/TypeScript baseline underpins every project. NestJS, React, and Vue layer their framework-specific rules on top without forking the baseline.
- **Central governance.** When we upgrade a plugin or tune a rule, we do it once here. Every project picks up the tested combination on its next `npm update` — not whenever someone remembers to sync.
- **Strictness that pays for itself.** Type-aware linting, security rules, import hygiene, naming conventions, Prettier integration, and dead-code detection are all on by default. The config is deliberately demanding; that is the point of a shared standard.
- **A real installer.** Adopting the config is `npx @moc-global/eslint-config init`. It detects your framework, installs the right plugins for your package manager, writes the config file, and adds lint scripts.

## What it is not

- It is **not** a lowest-common-denominator config. It errs toward strict. Projects that need to relax a rule do so locally, deliberately, and visibly.
- It is **not** a per-project fork. The escape hatches (explicit flags, the underlying factories) exist so you rarely need to copy anything out of the package.

## Design principles

| Principle | What it means in practice |
|---|---|
| **Bundled core, optional frameworks** | Core plugins are dependencies of this package, so their versions are locked centrally. Framework plugins (React/Vue/Nest) are optional peers, installed only when you need them. |
| **Buildless** | The package ships plain `.mjs`. No compile step, so it installs cleanly from a git URL or a tarball and there is nothing to get out of sync. |
| **Auto-detecting** | `moc()` reads your `package.json` and enables the stacks it finds. You can always override with explicit flags. |
| **Adoptable** | Existing projects baseline their violations with ESLint bulk suppressions and fix them over time, instead of facing a wall of errors on day one. |

Continue to [Getting started](/guide/getting-started).
