# react-app-example

A small React + TypeScript task board that consumes
[`eslint-config-mocg`](../../README.md) to demonstrate a real-world
front-end setup: the `@/*` path alias, components, hooks, and the React JSX
runtime under type-aware linting.

## Layout

```
src/
  components/   presentational + container components
  hooks/        reusable stateful hooks
  lib/          framework-agnostic helpers
  types/        shared domain types
  App.tsx       composition root
  main.tsx      browser entry point
```

## Usage

```bash
npm install
npm run lint
npm run typecheck
```

The ESLint setup is the whole point — see `eslint.config.mjs`:

```js
import { mocg } from 'eslint-config-mocg';

export default mocg(); // detects React from dependencies; reads the @/* alias
```
