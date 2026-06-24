import { defineConfig } from 'eslint/config';
import reactRefresh from 'eslint-plugin-react-refresh';

/**
 * @description Vite React Fast Refresh rules. Applies `eslint-plugin-react-refresh`'s
 * `vite` preset (`react-refresh/only-export-components` with `allowConstantExport`),
 * scoped to React source. This is deliberately separate from the React stack:
 * Fast Refresh is a bundler/HMR concern, so the pristine React config does not
 * bake it in. `mocg()` enables this automatically when the project depends on
 * `vite`; it is also importable directly via `eslint-config-mocg/vite`.
 * @author Dmytro Vakulenko
 * @see https://github.com/ArnaudBarre/eslint-plugin-react-refresh
 */
export default defineConfig([
  {
    name: 'vite/react-refresh',
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [reactRefresh.configs.vite],
  },
]);
