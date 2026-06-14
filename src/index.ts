/*
 * This is the package's public entry point, so re-exporting the supported
 * surface here is intentional — disable the no-barrel-files rule for this file.
 */
/* eslint-disable no-barrel-files/no-barrel-files */
import type { Linter } from 'eslint';

import { createNodeConfig, type NodeConfigOptions } from './config/node.eslint.js';
import { detectStacks } from './core/detect.js';
import { EXTRAS, PACKAGE_NAME, type StackDefinition, STACKS } from './core/manifest.js';

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
export { createNodeConfig } from './config/node.eslint.js';

export { EXTRAS, STACKS } from './core/manifest.js';

export { detectStacks } from './core/detect.js';

/**
 * Static map of entry key → lazy importer. A templated `import()` path cannot
 * be statically analyzed by bundlers/test runners, so each lazy entry module is
 * registered explicitly here; this also keeps the import targets type-checked.
 */
const ENTRY_IMPORTERS: Record<string, () => Promise<unknown>> = {
  nest: () => import('./config/nest.eslint.js'),
  react: () => import('./config/react.eslint.js'),
  vue: () => import('./config/vue.eslint.js'),
  vitest: () => import('./config/vitest.eslint.js'),
  jest: () => import('./config/jest.eslint.js'),
  zod: () => import('./config/zod.eslint.js'),
  i18n: () => import('./config/i18n.eslint.js'),
  tailwind: () => import('./config/tailwind.eslint.js'),
};

/**
 * Dynamically imports a stack/extra entry module, translating a missing
 * optional-peer dependency into an actionable error instead of a raw
 * ERR_MODULE_NOT_FOUND.
 * @param definition - Stack/extra definition.
 * @returns The imported module namespace.
 */
async function importEntry(definition: StackDefinition): Promise<Record<string, unknown>> {
  const importer = ENTRY_IMPORTERS[definition.entry];

  // Defensive: guards against an entry key with no registered importer.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!importer) {
    throw new Error(`[${PACKAGE_NAME}] No entry module is registered for "${definition.entry}".`);
  }

  try {
    return (await importer()) as Record<string, unknown>;
  } catch (error) {
    const code = error instanceof Error ? (error as { code?: string }).code : undefined;

    if (code === 'ERR_MODULE_NOT_FOUND') {
      const packages = Object.keys(definition.plugins);
      const installList = packages.length > 0 ? packages.join(' ') : '(none)';
      const original = error instanceof Error ? error.message : String(error);

      throw new Error(
        `[${PACKAGE_NAME}] The "${definition.label}" config requires packages that are not installed.\n\n` +
          `  Install them:   npm i -D ${installList}\n` +
          `  Or run:         npx ${PACKAGE_NAME} init\n\n` +
          `Original error: ${original}`,
        { cause: error },
      );
    }

    throw error;
  }
}

/**
 * Stack flags plus the Node config options. Each stack/extra flag may be `true`
 * (force on), `false` (force off), or omitted (auto-detected from the project's
 * dependencies).
 */
export interface MocOptions extends NodeConfigOptions {
  node?: boolean;
  nest?: boolean;
  react?: boolean;
  vue?: boolean;
  vueTs?: boolean;
  vitest?: boolean;
  jest?: boolean;
  zod?: boolean;
  i18n?: boolean;
  tailwind?: boolean;
}

/**
 * The company ESLint config. Composes the Node base with any detected or
 * requested framework stacks and add-ons, in the correct order.
 *
 * Returns a Promise — ESLint supports async flat config, so
 * `export default moc()` works directly.
 * @param options - Stack flags plus Node config options (rootDir, tsconfig, …).
 * @returns The resolved flat config array.
 * @example
 * // eslint.config.mjs — zero config, everything auto-detected
 * import { moc } from '@moc-global/eslint-config';
 * export default moc();
 * @example
 * // Explicit stacks
 * import { moc } from '@moc-global/eslint-config';
 * export default moc({ react: true, vitest: true });
 */
export async function moc(options: MocOptions = {}): Promise<Linter.Config[]> {
  const rootDir = options.rootDir ?? process.cwd();
  const detected = detectStacks(rootDir);

  const flags = options as Record<string, unknown>;

  /**
   * Resolves whether a flag is on: explicit boolean wins, otherwise fall back
   * to auto-detection.
   * @param key - Stack/extra key.
   * @param detectedGroup - The relevant detected list.
   * @returns Whether the stack/extra should be included.
   */
  const enabled = (key: string, detectedGroup: string[]): boolean => {
    const value = flags[key];

    if (typeof value === 'boolean') {
      return value;
    }

    return detectedGroup.includes(key);
  };

  const configs: Linter.Config[] = [];

  // Base layer: NestJS extends the Node base; otherwise the Node base alone.
  if (enabled('nest', detected.stacks)) {
    const entryModule = (await importEntry(STACKS.nest)) as unknown as {
      createNestConfig: (options?: object) => Linter.Config[];
    };

    configs.push(...entryModule.createNestConfig(options));
  } else {
    configs.push(...createNodeConfig(options));
  }

  // Framework layers on top of the Node base.
  if (enabled('react', detected.stacks)) {
    const entryModule = (await importEntry(STACKS.react)) as unknown as {
      createReactConfig: (options?: { rootDir?: string }) => Linter.Config[];
    };

    configs.push(...entryModule.createReactConfig(options));
  }

  // `vueTs: true` implies the Vue stack: a consumer asking for type-aware SFC
  // linting clearly wants Vue, so enable it even if `vue` was not detected — but
  // never override an explicit `vue: false`. Without this, `moc({ vueTs: true })`
  // on a project where `vue` isn't detected silently produced no Vue config.
  if (enabled('vue', detected.stacks) || (options.vueTs === true && options.vue !== false)) {
    const entryModule = (await importEntry(STACKS.vue)) as unknown as {
      createVueConfig: () => Linter.Config[];
      createVueTsConfig: () => Linter.Config[];
    };

    configs.push(...(options.vueTs ? entryModule.createVueTsConfig() : entryModule.createVueConfig()));
  }

  // Add-ons loaded in parallel; iteration order stays stable for determinism.
  const enabledExtras = Object.keys(EXTRAS).filter((key) => enabled(key, detected.extras));
  const extraModules = await Promise.all(enabledExtras.map((key) => importEntry(EXTRAS[key])));

  for (const entryModule of extraModules) {
    const extra = entryModule as unknown as { default: Linter.Config[] };

    configs.push(...extra.default);
  }

  return configs;
}

export default moc;
