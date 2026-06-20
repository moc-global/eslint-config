// @next/eslint-plugin-next is the official Next.js linting plugin and a
// deliberate choice for this config (used directly, not via eslint-config-next,
// which would re-bundle and duplicate react/react-hooks/typescript-eslint).

import nextPlugin from '@next/eslint-plugin-next';
import { defineConfig, globalIgnores } from 'eslint/config';

/**
 * @description Next.js core rules: the official `@next/eslint-plugin-next`
 * `core-web-vitals` config (already a superset of `recommended` — it adds the
 * Core Web Vitals warn→error upgrades for `no-html-link-for-pages` and
 * `no-sync-scripts`), plus ignores for Next build artifacts and generated files.
 * Next 16 removed `next lint`, so this config — run by the ESLint CLI — owns
 * those ignores itself.
 * @author Dmytro Vakulenko
 * @see https://nextjs.org/docs/app/api-reference/config/eslint
 */
export default defineConfig([
  globalIgnores(['.next/**', 'out/**', 'next-env.d.ts']),
  {
    name: 'next/core-web-vitals',
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'],
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
]);
