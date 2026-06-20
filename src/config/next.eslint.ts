import { defineConfig } from 'eslint/config';

import nextEslint from './next/next.eslint.js';
import nextOverridesEslint from './next/next-overrides.eslint.js';
import nextRefreshEslint from './next/next-refresh.eslint.js';
import { createReactConfig } from './react.eslint.js';

/**
 * Creates the Next.js ESLint configuration: **next = react + next**. Composes the
 * React config and layers the official Next plugin's Core Web Vitals rules,
 * Next-aware Fast Refresh export conventions, Next route-handler relaxations, and
 * Next build-artifact ignores. Because the React layer is composed internally,
 * importing `@moc-global/eslint-config/next` alone yields full React + Next
 * coverage. Via `moc()` the React layer is applied exactly once (the Next stack
 * supersedes the standalone React stack), sitting on the Node base.
 * @param options - Optional project root used to resolve the installed React version.
 * @param options.rootDir - The consumer project root. Defaults to `process.cwd()`.
 * @example
 * // eslint.config.mjs — zero config, Next auto-detected
 * import { moc } from '@moc-global/eslint-config';
 * export default moc();
 * @example
 * // Advanced: compose the Next config directly
 * import { createNodeConfig } from '@moc-global/eslint-config/node';
 * import { createNextConfig } from '@moc-global/eslint-config/next';
 * export default defineConfig([...createNodeConfig(), ...createNextConfig()]);
 * @returns The composed Next flat-config array (React + Next rules + overrides).
 */
export function createNextConfig(options: { rootDir?: string } = {}) {
  return defineConfig([...createReactConfig(options), ...nextEslint, ...nextRefreshEslint, ...nextOverridesEslint]);
}

export default createNextConfig();
