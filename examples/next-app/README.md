# Next.js example

A minimal Next.js + TypeScript project that consumes `eslint-config-mocg`
via zero-config `mocg()`. It exists to verify that the **Next stack** installs and
lints cleanly in a real consumer (peer resolution, version detection, the
official `@next/eslint-plugin-next` rules, and Next-aware Fast Refresh).

The Next stack is **React + Next**: `mocg()` auto-detects `next` in the
dependencies and applies the React layer plus the official Next plugin's Core
Web Vitals rules — it supersedes the standalone React stack, so the React layer
is applied exactly once.

## What it exercises

- **App Router** — `app/layout.tsx` (`metadata` + `viewport` exports),
  `app/page.tsx` (internal nav via `next/link`), `app/components/Counter.tsx`
  (`'use client'` + hooks), and `app/api/health/route.ts` (a Route Handler with
  no JSDoc).
- **Pages Router** — `pages/legacy-ssr.tsx` (`getServerSideProps`).

Both routers export non-component values that the Next stack allows, so
`react-refresh/only-export-components` does not flag them.

## Run it

```bash
npm install
npm run lint
npm run typecheck
```

## Config

```js
// eslint.config.mjs
import { mocg } from 'eslint-config-mocg';

export default mocg();
```
