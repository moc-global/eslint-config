import * as fs from 'node:fs';

import pluginJs from '@eslint/js';
import type { Linter } from 'eslint';
import { defineConfig, includeIgnoreFile } from 'eslint/config';

import { eslintLogger } from '../core/logger.js';

import lintlordEslint from './lintlord/lintlord.eslint.js';
import bestPracticesEslint from './node/best-practices.eslint.js';
import customStyleEslint from './node/custom-style.eslint.js';
import dependEslint from './node/depend.eslint.js';
import eslintRulesEslint from './node/eslint-rules.eslint.js';
import { createImportAliasConfig } from './node/import-alias.eslint.js';
import importXEslint from './node/import-x.eslint.js';
import jsdocEslint from './node/jsdoc.eslint.js';
import nConfig from './node/n.eslint.js';
import noBarrelFilesEslint from './node/no-barrel-files.eslint.js';
import noSecretsEslint from './node/no-secrets.eslint.js';
import { createOrderedImportsConfig } from './node/ordered-imports.eslint.js';
import perfectionistEslint from './node/perfectionist.eslint.js';
import prettierEslint from './node/prettier.eslint.js';
import promiseEslint from './node/promise.eslint.js';
import regexpEslint from './node/regexp.eslint.js';
import scriptsEslint from './node/scripts.eslint.js';
import securityEslint from './node/security.eslint.js';
import sonarEslint from './node/sonar.eslint.js';
import stylisticEslint from './node/stylistic.eslint.js';
import unicornEslint from './node/unicorn.eslint.js';
import unusedImportsEslint from './node/unused-imports.eslint.js';
import { createTypescriptConfig } from './typescript/typescript.eslint.js';

const logger = eslintLogger('node');

/** Options controlling tsconfig/gitignore resolution for the Node base. */
export interface NodeConfigOptions {
  /** Project root for resolving tsconfig. Defaults to process.cwd(). */
  rootDir?: string;
  /**
   * Explicit tsconfig filename (e.g. 'tsconfig.main.json'). When omitted,
   * auto-discovers from: tsconfig.json → tsconfig.base.json → tsconfig.main.json → tsconfig.app.json
   */
  tsconfig?: string;
  /** Explicit tsconfig for the scripts/ directory. */
  scriptstsconfig?: string;
  /** Explicit path to .gitignore. Defaults to `<rootDir>/.gitignore`. */
  gitignore?: string;
}

/**
 * Creates the Node.js ESLint configuration.
 * Supports auto-discovery of tsconfig or an explicit path via options.
 * @param options - Optional config overrides (rootDir, tsconfig, scriptstsconfig, gitignore).
 * @returns The composed Node.js flat-config array.
 * @example
 * // Auto-discovery (uses tsconfig.json by default)
 * import { createNodeConfig } from 'eslint-config-mocg/node';
 * @example
 * // Explicit tsconfig
 * import { createNodeConfig } from 'eslint-config-mocg/node';
 * export default createNodeConfig({ tsconfig: 'tsconfig.main.json' });
 */
export function createNodeConfig(options: NodeConfigOptions = {}): Linter.Config[] {
  const rootDir = options.rootDir ?? process.cwd();
  const gitignorePath = options.gitignore ?? `${rootDir}/.gitignore`;
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const hasGitignore = fs.existsSync(gitignorePath);

  logger.info('Root directory:', rootDir);
  logger.info(hasGitignore ? `Using .gitignore at: ${gitignorePath}` : `No .gitignore found at ${gitignorePath}; skipping.`);

  return defineConfig([
    // ──────────────────────────────────────────────
    // Ignores — composed array typed as Linter.Config[] (the flat-config types
    // are stricter than the runtime accepts for spread plugin/rule objects).
    // ──────────────────────────────────────────────
    {
      name: 'ignore/node-modules',
      ignores: ['node_modules'],
    },
    // Honor the consumer's .gitignore when present; tolerate its absence.
    ...(hasGitignore ? [includeIgnoreFile(gitignorePath)] : []),

    // ──────────────────────────────────────────────
    // Shared: JavaScript + TypeScript
    // ──────────────────────────────────────────────
    pluginJs.configs.recommended,
    ...bestPracticesEslint,
    ...importXEslint,
    ...jsdocEslint,
    ...stylisticEslint,
    ...nConfig,
    ...sonarEslint,
    ...prettierEslint,
    ...createOrderedImportsConfig(options),
    ...createImportAliasConfig(options),
    ...unusedImportsEslint,
    ...noSecretsEslint,
    ...securityEslint,
    ...perfectionistEslint,
    ...unicornEslint,
    ...noBarrelFilesEslint,
    ...promiseEslint,
    ...regexpEslint,
    ...dependEslint,
    ...lintlordEslint,
    ...customStyleEslint,
    {
      name: 'javascript-language-options',
      files: ['**/*.{js,jsx,cjs,mjs}'],
      languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },

    // ──────────────────────────────────────────────
    // TypeScript-specific
    // Remove the spread below and its import to use JavaScript only.
    // ──────────────────────────────────────────────
    ...createTypescriptConfig(options),

    // Per-file overrides — must be last so they win over all plugin rules above
    ...scriptsEslint,
    ...eslintRulesEslint,
  ] as Linter.Config[]);
}

export default createNodeConfig();
