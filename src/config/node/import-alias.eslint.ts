import importAlias from '@dword-design/eslint-plugin-import-alias';
import { defineConfig } from 'eslint/config';

import { eslintLogger } from '../../core/logger.js';
import { parseTsconfig, resolveTsconfigPath, resolveTsconfigPaths } from '../../core/tsconfig-utils.js';

const logger = eslintLogger('import-alias');

/**
 * Builds the import-alias ESLint config, deriving aliases from tsconfig paths + baseUrl.
 * @param options - Optional project root and tsconfig path used to derive aliases.
 * @param options.rootDir - Project root for tsconfig resolution.
 * @param options.tsconfig - Explicit tsconfig filename to read path aliases from.
 * @returns The import-alias flat-config array, or an empty array when no aliases are resolved.
 */
export function createImportAliasConfig(options: { rootDir?: string; tsconfig?: string } = {}) {
  const tsconfigPath = resolveTsconfigPath(options);

  let aliases = {};

  try {
    const tsconfigContent = parseTsconfig(tsconfigPath);
    // `baseUrl` is deprecated in TS 6 but still read here for legacy path-alias resolution.
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const baseUrl = tsconfigContent?.compilerOptions?.baseUrl ?? '';
    const paths = resolveTsconfigPaths(tsconfigPath);

    aliases = Object.fromEntries(
      Object.entries(paths).map(([key, valueArray]) => {
        const aliasKey = key.replace('/*', '');
        let aliasValue = valueArray[0].replace('/*', '');

        if (!aliasValue.startsWith('.') && !aliasValue.startsWith('/')) {
          aliasValue = `${baseUrl.replace(/\/$/, '')}/${aliasValue}`;

          if (!aliasValue.startsWith('./') && !aliasValue.startsWith('/')) {
            aliasValue = `./${aliasValue}`;
          }
        }

        return [aliasKey, aliasValue];
      }),
    );

    logger.info('Resolved import aliases from tsconfig paths:', aliases);
  } catch {
    logger.warn('Failed to resolve import aliases — import-alias rules will be skipped.');
  }

  if (Object.keys(aliases).length === 0) {
    return [];
  }

  return defineConfig([
    importAlias.configs.recommended,
    {
      name: 'import-alias',
      rules: {
        '@dword-design/import-alias/prefer-alias': ['error', { alias: aliases }],
      },
    },
  ]);
}

/**
 * ESLint config for import alias linting using `@dword-design/eslint-plugin-import-alias`.
 * Aliases are built dynamically from tsconfig.json using baseUrl.
 * @author Dmytro Vakulenko
 * @see https://github.com/dword-design/eslint-plugin-import-alias
 */
export default createImportAliasConfig();
