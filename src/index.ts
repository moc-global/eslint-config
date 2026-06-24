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
//   import { createReactConfig } from 'eslint-config-mocg/react';
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
  next: () => import('./config/next.eslint.js'),
  vue: () => import('./config/vue.eslint.js'),
  vite: () => import('./config/vite.eslint.js'),
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
export interface MocgOptions extends NodeConfigOptions {
  node?: boolean;
  nest?: boolean;
  react?: boolean;
  next?: boolean;
  vue?: boolean;
  vueTs?: boolean;
  vite?: boolean;
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
 * `export default mocg()` works directly.
 * @param options - Stack flags plus Node config options (rootDir, tsconfig, …).
 * @returns The resolved flat config array.
 * @example
 * // eslint.config.mjs — zero config, everything auto-detected
 * import { mocg } from 'eslint-config-mocg';
 * export default mocg();
 * @example
 * // Explicit stacks
 * import { mocg } from 'eslint-config-mocg';
 * export default mocg({ react: true, vitest: true });
 */
export async function mocg(options: MocgOptions = {}): Promise<Linter.Config[]> {
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

  // Framework layer on top of the Node base. Next supersedes React: a Next
  // project's React layer is composed *inside* the Next stack
  // (`createNextConfig` reuses `createReactConfig`), so we apply the React layer
  // exactly once — never both the Next stack and a standalone React stack. When
  // `next` is force-disabled, React remains the fallback (a Next project is
  // still a React project).
  const isNextEnabled = enabled('next', detected.stacks);

  if (isNextEnabled) {
    const entryModule = (await importEntry(STACKS.next)) as unknown as {
      createNextConfig: (options?: { rootDir?: string }) => Linter.Config[];
    };

    configs.push(...entryModule.createNextConfig(options));
  } else if (enabled('react', detected.stacks)) {
    const entryModule = (await importEntry(STACKS.react)) as unknown as {
      createReactConfig: (options?: { rootDir?: string }) => Linter.Config[];
    };

    configs.push(...entryModule.createReactConfig(options));
  }

  // `vueTs: true` implies the Vue stack: a consumer asking for type-aware SFC
  // linting clearly wants Vue, so enable it even if `vue` was not detected — but
  // never override an explicit `vue: false`. Without this, `mocg({ vueTs: true })`
  // on a project where `vue` isn't detected silently produced no Vue config.
  if (enabled('vue', detected.stacks) || (options.vueTs === true && options.vue !== false)) {
    const entryModule = (await importEntry(STACKS.vue)) as unknown as {
      createVueConfig: () => Linter.Config[];
      createVueTsConfig: () => Linter.Config[];
    };

    configs.push(...(options.vueTs ? entryModule.createVueTsConfig() : entryModule.createVueConfig()));
  }

  // Add-ons loaded in parallel; iteration order stays stable for determinism.
  const enabledExtras = Object.keys(EXTRAS).filter((key) => {
    // The Next stack already supplies React Fast Refresh with Next's export
    // conventions, so the `vite` add-on must NOT also register
    // `eslint-plugin-react-refresh` — ESLint errors on a duplicate plugin, and
    // the vite preset would otherwise clobber Next's `allowExportNames`. Next
    // owns Fast Refresh when it is active.
    if (key === 'vite' && isNextEnabled) {
      return false;
    }

    return enabled(key, detected.extras);
  });

  const extraModules = await Promise.all(enabledExtras.map((key) => importEntry(EXTRAS[key])));

  for (const entryModule of extraModules) {
    const extra = entryModule as unknown as { default: Linter.Config[] };

    configs.push(...extra.default);
  }

  return configs;
}

export default mocg;
