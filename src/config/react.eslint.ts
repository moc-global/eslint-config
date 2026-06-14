import { defineConfig } from 'eslint/config';

import reactEslint from './react/react.eslint.js';
import reactOverridesEslint from './react/react-overrides.eslint.js';

/**
 */

/**
 * Creates the React ESLint configuration.
 * Combine with createNodeConfig() or createNestConfig() for full coverage:
 * @example
 * import { createNodeConfig } from './.eslint/node.eslint.mjs';
 * import { createReactConfig } from './.eslint/react.eslint.mjs';
 * export default defineConfig([...createNodeConfig(), ...createReactConfig()]);
 * @returns The composed React flat-config array (base React rules + overrides).
 */
export function createReactConfig() {
  return defineConfig([...reactEslint, ...reactOverridesEslint]);
}

export default createReactConfig();
