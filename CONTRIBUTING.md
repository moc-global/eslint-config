# Contributing

Thanks for improving `eslint-config-mocg`! The full guide — repository
layout, dev workflow, how to add a rule / stack / add-on, the testing strategy,
and the versioning policy — lives in the docs:
**[docs/guide/contributing.md](./docs/guide/contributing.md)** (or run `npm run docs:dev`).

## TL;DR

```bash
npm install              # installs deps + the husky pre-push hook; builds dist/
npm run lint
npm run typecheck
npm run test:run         # vitest, incl. the React/Nest/Vue dogfood tests
npm run verify:examples  # installs the packed config into examples/* and lints each
```

A husky **pre-push** hook runs the full suite locally before every push
(`lint`, `typecheck`, `test:run`, `pack:check`, `verify:examples`). Use
`git push --no-verify` to skip it for a one-off push. GitHub Actions CI is
present but disabled (`.github/workflows/ci.yml`).

## Conventions

- **[Conventional Commits](https://www.conventionalcommits.org/)** for messages.
- **[SemVer](https://semver.org/)** — see the [versioning policy](./docs/guide/versioning.md).
  A new error-level rule is a **minor**; removing or loosening a rule in a way
  that changes results is a **major**.
- When you change rule behavior, update a fixture/test, the
  [rules reference](./docs/reference/plugins.md), and the [CHANGELOG](./CHANGELOG.md).

## Releasing

Releases are cut from `main`:

```bash
npm version <patch|minor|major>   # bumps package.json + tags
npm publish                       # prepublishOnly cleans + rebuilds dist/
git push --follow-tags
```

`files` is `["dist"]`, so only the compiled output (with `.d.ts`) is published —
`npm run pack:check` verifies the tarball contents.
