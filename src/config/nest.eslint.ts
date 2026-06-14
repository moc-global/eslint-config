import { defineConfig } from 'eslint/config';

import nestEslint from './nest/nest.eslint.js';
import nestNoProcessEnvironmentEslint from './nest/nest-no-process-env.eslint.js';
import { createNodeConfig } from './node.eslint.js';

/**
 */

/**
 * Creates the NestJS ESLint configuration: Node base + NestJS-specific rules.
 * @param [options] - Optional Node config overrides (rootDir, tsconfig, scriptstsconfig, gitignore).
 * @returns The composed Node base + NestJS flat-config array.
 * @example
 * import { createNestConfig } from './.eslint/nest.eslint.mjs';
 * export default createNestConfig({ tsconfig: 'tsconfig.main.json' });
 */
export function createNestConfig(options = {}) {
  return defineConfig([...createNodeConfig(options), ...nestEslint, ...nestNoProcessEnvironmentEslint]);
}

export default createNestConfig();
