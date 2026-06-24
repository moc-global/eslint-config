# vue-app-example

A small Vue 3 + TypeScript task board that consumes
[`eslint-config-mocg`](../../README.md): `<script setup lang="ts">`
single-file components, composables, a `@/*` path alias, and **type-aware**
linting of `.vue` files.

## Layout

```
src/
  components/    presentational SFCs (PascalCase filenames, per the Vue style guide)
  composables/   reusable reactive state
  lib/           framework-agnostic helpers
  types/         shared domain types
  App.vue        root component
  main.ts        browser entry point
```

## Usage

```bash
npm install
npm run lint
npm run typecheck   # vue-tsc
```

The Vue stack needs the `vueTs` flag for type-aware SFC linting — see
`eslint.config.mjs`:

```js
import { mocg } from 'eslint-config-mocg';

export default mocg({ vueTs: true }); // type-aware <script lang="ts"> linting
```
