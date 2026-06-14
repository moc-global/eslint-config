/* eslint-disable security/detect-non-literal-fs-filename */
import * as fs from 'node:fs';

import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

import { eslintLogger } from '../../core/logger.js';
import { resolveTsconfigPath } from '../../core/tsconfig-utils.js';

const logger = eslintLogger('typescript-project');

/**
 * Builds the TypeScript parser config, resolving tsconfig automatically or from options.
 * @param options - Optional project root and tsconfig paths for the source and scripts directories.
 * @param options.rootDir - Project root for tsconfig resolution.
 * @param options.tsconfig - Explicit tsconfig filename for source files.
 * @param options.scriptstsconfig - Explicit tsconfig filename for the scripts directory.
 * @returns The TypeScript parser config array for source and scripts files.
 */
export function createProjectConfig(options: { rootDir?: string; tsconfig?: string; scriptstsconfig?: string } = {}) {
  const rootDir = options.rootDir ?? process.cwd();
  const tsconfigPath = resolveTsconfigPath(options);

  if (!fs.existsSync(tsconfigPath)) {
    logger.warn(`tsconfig not found at ${tsconfigPath}. Falling back to projectService.`);
  }

  const scriptsTsconfigPath = options.scriptstsconfig
    ? resolveTsconfigPath({ rootDir, tsconfig: options.scriptstsconfig })
    : resolveTsconfigPath({ rootDir, tsconfig: 'tsconfig.scripts.json' });

  // Same scripts block either way; only the parser project source differs.
  const scriptsConfig = {
    files: ['scripts/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: fs.existsSync(scriptsTsconfigPath)
        ? { project: scriptsTsconfigPath, tsconfigRootDir: rootDir }
        : { projectService: true, tsconfigRootDir: rootDir },
    },
  };

  return defineConfig(
    {
      files: ['**/*.{ts,tsx,mts,cts}'],
      ignores: ['scripts/**'],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
          projectService: true,
          tsconfigRootDir: rootDir,
        },
      },
    },
    scriptsConfig,
  );
}

/**
 * @description ESLint config for TypeScript parser using projectService for type-aware linting.
 * @author Dmytro Vakulenko
 * @see https://typescript-eslint.io/linting/typed-linting/
 */
export default createProjectConfig();
