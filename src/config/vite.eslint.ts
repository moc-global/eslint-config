import { defineConfig } from 'eslint/config';

import viteReactRefreshEslint from './react-refresh/vite.eslint.js';

/**
 * @description Vite add-on: React Fast Refresh linting for Vite projects.
 * Auto-enabled by `mocg()` when the project depends on `vite`. Combine with the
 * React or Next stack — it only layers the Fast Refresh rule on top.
 * @example
 * import { createReactConfig } from 'eslint-config-mocg/react';
 * import vite from 'eslint-config-mocg/vite';
 * export default defineConfig([...createReactConfig(), ...vite]);
 * @returns The Vite Fast Refresh flat-config array.
 */
export default defineConfig([...viteReactRefreshEslint]);
