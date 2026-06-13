// @ts-check
/*
 * This is the package's public entry point, so re-exporting the supported
 * surface here is intentional — disable the no-barrel-files rule for this file.
 */
/* eslint-disable no-barrel-files/no-barrel-files */
import { EXTRAS, PACKAGE_NAME, STACKS } from './cli/stacks.mjs';
import { detectStacks } from './detect.mjs';
import { createNodeConfig } from './node.eslint.mjs';

// ──────────────────────────────────────────────────────────────────────────
// Low-level escape hatches. Only the Node base and the manifest/detect helpers
// are re-exported statically — they have no optional-peer dependencies.
//
// Framework factories (createNestConfig, createReactConfig, createVueConfig)
// are intentionally NOT re-exported here: a static re-export would force their
// optional peer plugins to resolve at import time, breaking Node-only projects.
// Import them from the subpath exports instead:
//   import { createReactConfig } from '@moc-global/eslint-config/react';
// ──────────────────────────────────────────────────────────────────────────
export { createNodeConfig } from './node.eslint.mjs';

export { EXTRAS, STACKS } from './cli/stacks.mjs';

export { detectStacks } from './detect.mjs';

/**
 * Dynamically imports a stack/extra entry module, translating a missing
 * optional-peer dependency into an actionable error instead of a raw
 * ERR_MODULE_NOT_FOUND.
 * @param {import('./cli/stacks.mjs').StackDefinition} definition - Stack/extra definition.
 * @returns {Promise<Record<string, unknown>>} The imported module namespace.
 */
async function importEntry(definition) {
  try {
    return await import(`./${definition.entry}.eslint.mjs`);
  } catch (error) {
    const cause = /** @type {Error & { code?: string }} */ (error);

    if (cause && cause.code === 'ERR_MODULE_NOT_FOUND') {
      const packages = Object.keys(definition.plugins);
      const installList = packages.length > 0 ? packages.join(' ') : '(none)';

      throw new Error(
        `[${PACKAGE_NAME}] The "${definition.label}" config requires packages that are not installed.\n\n` +
          `  Install them:   npm i -D ${installList}\n` +
          `  Or run:         npx ${PACKAGE_NAME} init\n\n` +
          `Original error: ${cause.message}`,
        { cause: error },
      );
    }

    throw error;
  }
}

/**
 * @typedef {import('./node.eslint.mjs').NodeConfigOptions} NodeConfigOptions
 */

/**
 * @typedef {NodeConfigOptions & {
 *   node?: boolean,
 *   nest?: boolean,
 *   react?: boolean,
 *   vue?: boolean,
 *   vueTs?: boolean,
 *   vitest?: boolean,
 *   jest?: boolean,
 *   zod?: boolean,
 *   i18n?: boolean,
 *   tailwind?: boolean,
 * }} MocOptions
 * Each stack/extra flag may be `true` (force on), `false` (force off), or
 * omitted (auto-detected from the project's dependencies).
 */

/**
 * The company ESLint config. Composes the Node base with any detected or
 * requested framework stacks and add-ons, in the correct order.
 *
 * Returns a Promise — ESLint supports async flat config, so
 * `export default moc()` works directly.
 * @param {MocOptions} [options] - Stack flags plus Node config options (rootDir, tsconfig, …).
 * @returns {Promise<import('eslint').Linter.Config[]>} The resolved flat config array.
 * @example
 * // eslint.config.mjs — zero config, everything auto-detected
 * import { moc } from '@moc-global/eslint-config';
 * export default moc();
 * @example
 * // Explicit stacks
 * import { moc } from '@moc-global/eslint-config';
 * export default moc({ react: true, vitest: true });
 */
export async function moc(options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const detected = detectStacks(rootDir);

  const flags = /** @type {Record<string, unknown>} */ (options);

  /**
   * Resolves whether a flag is on: explicit boolean wins, otherwise fall back
   * to auto-detection.
   * @param {string} key - Stack/extra key.
   * @param {string[]} detectedGroup - The relevant detected list.
   * @returns {boolean} Whether the stack/extra should be included.
   */
  const enabled = (key, detectedGroup) => {
    const value = flags[key];

    if (typeof value === 'boolean') {
      return value;
    }

    return detectedGroup.includes(key);
  };

  /** @type {import('eslint').Linter.Config[]} */
  const configs = [];

  // Base layer: NestJS extends the Node base; otherwise the Node base alone.
  if (enabled('nest', detected.stacks)) {
    const module_ = /** @type {{ createNestConfig: (options?: object) => import('eslint').Linter.Config[] }} */ (
      await importEntry(STACKS.nest)
    );

    configs.push(...module_.createNestConfig(options));
  } else {
    configs.push(...createNodeConfig(options));
  }

  // Framework layers on top of the Node base.
  if (enabled('react', detected.stacks)) {
    const module_ = /** @type {{ createReactConfig: () => import('eslint').Linter.Config[] }} */ (await importEntry(STACKS.react));

    configs.push(...module_.createReactConfig());
  }

  if (enabled('vue', detected.stacks)) {
    const module_ =
      /** @type {{ createVueConfig: () => import('eslint').Linter.Config[], createVueTsConfig: () => import('eslint').Linter.Config[] }} */ (
        await importEntry(STACKS.vue)
      );

    configs.push(...(options.vueTs ? module_.createVueTsConfig() : module_.createVueConfig()));
  }

  // Add-ons loaded in parallel; iteration order stays stable for determinism.
  const enabledExtras = Object.keys(EXTRAS).filter((key) => enabled(key, detected.extras));
  const extraModules = await Promise.all(enabledExtras.map((key) => importEntry(EXTRAS[key])));

  for (const module_ of extraModules) {
    const extra = /** @type {{ default: import('eslint').Linter.Config[] }} */ (module_);

    configs.push(...extra.default);
  }

  return configs;
}

export default moc;
