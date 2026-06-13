---
layout: home

hero:
  name: "@moc-global/eslint-config"
  text: "One ESLint config for every project"
  tagline: A strict, batteries-included flat config for Node.js, NestJS, React, and Vue — installed with one command, governed in one place.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Why use it?
      link: /guide/why
    - theme: alt
      text: Rules & plugins
      link: /reference/plugins

features:
  - icon: 📦
    title: One package, every stack
    details: Core plugins ship bundled and version-locked. Framework plugins (React, Vue, NestJS) load on demand. Pick your stack, get a tuned config.
  - icon: ⚡
    title: One-command install
    details: "npx @moc-global/eslint-config init detects your framework and package manager, installs what you need, and writes the config file."
  - icon: 🔒
    title: Governed centrally
    details: Bump a plugin and tune a rule once. Every project gets the tested combination on its next update — no per-project drift.
  - icon: 🧩
    title: Auto-detecting
    details: "moc() reads your dependencies and enables the right stacks automatically. Zero config for most projects; explicit flags when you want them."
  - icon: 🪜
    title: Adopts into legacy code
    details: Baseline existing violations with ESLint's bulk suppressions so CI is green on day one, then ratchet down at your own pace.
  - icon: 🧪
    title: Tested & type-aware
    details: Type-aware TypeScript linting out of the box, validated against real fixture projects on every change.
---

## At a glance

```bash
# In any project:
npx @moc-global/eslint-config init
```

```js
// eslint.config.mjs — the whole file
import { moc } from '@moc-global/eslint-config';

export default moc();
```

That's it. `moc()` detects your stack and composes the right rules. See [Getting started](/guide/getting-started) for manual setup, presets, and CI usage.
