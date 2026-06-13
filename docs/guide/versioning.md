# Versioning & upgrades

## The policy

This package follows semver, with one team-specific convention about what counts as "breaking":

| Change | Version bump |
|---|---|
| Adding a new rule, or making an existing rule stricter | **minor** |
| Upgrading a bundled plugin (patch/minor) | **minor** |
| Bug fix in the config or CLI | **patch** |
| Removing a stack, renaming a flag, dropping a Node version, or a bundled-plugin **major** upgrade with broad rule changes | **major** |

The important consequence: **a new rule is a minor bump, not a major one.** Projects pin with a caret (`^1`) and upgrade deliberately. When an upgrade surfaces new lint errors, that is **intended** — the new rule found a real issue. It is not a regression.

```json
{
  "devDependencies": {
    "@moc-global/eslint-config": "^1.0.0"
  }
}
```

## Upgrading a project

```bash
npm update @moc-global/eslint-config
npm run lint
```

If new violations appear:

- **A few?** Fix them, or autofix with `npm run lint:fix`.
- **A lot?** Baseline them and ratchet down — exactly the [legacy-adoption flow](/guide/existing-projects). New standards land green; you clean up over time.

## Node support

The floor is **Node 22**. We do not hold plugin versions back to support older runtimes — if a project is on an older Node, upgrade Node. This keeps the config on current, maintained plugin majors.

## How releases stay honest

Every change is validated against fixture projects (Node, React, Vue, Nest) by running the real ESLint binary and snapshotting which rules fire, plus `--print-config` snapshots of the resolved config. A diff in those snapshots is what tells us whether a release is a patch, a minor, or a breaking change — the policy above is enforced by tests, not by memory. See [Contributing](/guide/contributing).
