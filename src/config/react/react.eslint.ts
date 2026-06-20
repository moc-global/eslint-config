import { createRequire } from 'node:module';
import path from 'node:path';

import { defineConfig } from 'eslint/config';
// eslint-plugin-react is the canonical React linting plugin and a deliberate choice for this config.
// eslint-disable-next-line depend/ban-dependencies
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

import { eslintLogger } from '../../core/logger.js';

const logger = eslintLogger('react');

/** Used only when the consumer's installed React version cannot be resolved. */
const FALLBACK_REACT_VERSION = '19.0';

/**
 * Resolves the React version from the consumer's installed `react` package so
 * `eslint-plugin-react` never runs its `'detect'` path — that detector calls the
 * `context.getFilename()` API removed in the supported ESLint range and crashes
 * rule loading.
 * @param rootDir - The consumer project root used to resolve `react`.
 * @returns The installed React version, or a recent fallback.
 */
function resolveReactVersion(rootDir: string): string {
  try {
    const requireFromConsumer = createRequire(path.join(rootDir, 'package.json'));
    const manifest = requireFromConsumer('react/package.json') as { version?: string };

    if (typeof manifest.version === 'string') {
      logger.info(`Resolved React version: ${manifest.version}`);

      return manifest.version;
    }
  } catch {
    logger.warn(`Could not resolve the installed React version; falling back to ${FALLBACK_REACT_VERSION}.`);
  }

  return FALLBACK_REACT_VERSION;
}

/**
 * Builds the React rules config (JSX runtime, hooks, fast refresh), pinning a
 * concrete React version resolved from the consumer rather than `'detect'`.
 * @param options - Optional project root for React-version resolution.
 * @param options.rootDir - The consumer project root. Defaults to `process.cwd()`.
 * @returns The composed React rules flat-config array.
 */
export function createReactRulesConfig(options: { rootDir?: string } = {}) {
  const rootDir = options.rootDir ?? process.cwd();

  return defineConfig([
    {
      name: 'react/settings',
      files: ['**/*.{js,mjs,cjs,ts,tsx}'],
      settings: {
        react: {
          version: resolveReactVersion(rootDir),
        },
      },
    },
    {
      name: 'react/rules',
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        ecmaVersion: 'latest',
        globals: globals.browser,
      },
      // Fast Refresh is intentionally NOT here: it is a bundler/HMR concern, not
      // a React-stack concern. The `vite` add-on (`@moc-global/eslint-config/vite`)
      // and the `next` stack each layer the appropriate `eslint-plugin-react-refresh`
      // preset on top. See add-nextjs-stack (framework-stack-compatibility).
      extends: [reactHooks.configs.flat['recommended-latest']],
      plugins: { react },
      rules: {
        ...react.configs.recommended.rules,
        ...react.configs['jsx-runtime'].rules,
      },
    },
  ]);
}

/**
 * @description ESLint config for React projects: JSX runtime, hooks, and fast refresh rules.
 * @author Dmytro Vakulenko
 * @see https://github.com/jsx-eslint/eslint-plugin-react
 */
export default createReactRulesConfig();
