import { defineConfig } from 'eslint/config';

/**
 * @description Next.js-specific relaxations layered on top of the React overrides.
 * App Router introduces Route Handlers (`route.ts`) and `middleware.ts` whose
 * exported functions (`GET`, `POST`, `middleware`, …) follow the same
 * documented-by-types, no-JSDoc convention as React components. The React
 * overrides already exempt components (`.jsx`/`.tsx`) from `jsdoc/require-jsdoc`;
 * extend that exemption to these Next `.ts`/`.js` entry files.
 * See add-nextjs-stack (rule-policy-coherence).
 * @author Dmytro Vakulenko
 */
export default defineConfig([
  {
    name: 'next/route-handler-docs',
    files: ['**/route.{ts,js}', '**/middleware.{ts,js}'],
    rules: {
      'jsdoc/require-jsdoc': 'off',
    },
  },
]);
