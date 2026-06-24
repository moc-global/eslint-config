# nest-app-example

A small NestJS + TypeScript service that consumes
[`eslint-config-mocg`](../../README.md): decorators, dependency
injection, class-validator DTOs, a `@/*` path alias, and centralized
configuration — all under type-aware linting.

## Layout

```
src/
  config/        environment-backed configuration (the only place process.env is read)
  common/        cross-cutting providers (logging interceptor)
  tasks/         tasks feature module (controller, service, DTOs, entity)
  users/         users feature module (controller, service, DTOs, entity)
  health/        liveness controller
  app.module.ts  root module
  main.ts        bootstrap
```

## Usage

```bash
npm install
npm run lint
npm run typecheck
```

The NestJS stack replaces the Node base internally and layers on
`@darraghor/eslint-plugin-nestjs-typed`. See `eslint.config.mjs`:

```js
import { mocg } from 'eslint-config-mocg';

export default mocg(); // detects NestJS from @nestjs/core; reads the @/* alias
```
