# typescript-app-example

A small Node.js + TypeScript service that consumes
[`@moc-global/eslint-config`](../../README.md) to demonstrate a real-world setup:
path aliases, layered architecture (domain / repositories / services), and
type-aware linting.

## Layout

```
src/
  config/        environment loading
  domain/        pure domain types and rules
  errors/        typed application errors
  repositories/  in-memory persistence
  services/      business logic
  index.ts       composition root + demo run
```

## Usage

```bash
npm install
npm run lint
npm run typecheck
```

The ESLint setup is the whole point — see `eslint.config.mjs`:

```js
import { moc } from '@moc-global/eslint-config';

export default moc(); // auto-detects the stack and reads tsconfig path aliases
```
