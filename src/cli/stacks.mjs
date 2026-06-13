// @ts-check
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/**
 * The package's own manifest. We read peer version ranges from here so the
 * STACKS manifest, the installer, `doctor`, and the helpful runtime errors all
 * share a single source of truth — bumping a version in package.json updates
 * everything that consumes it.
 */
const package_ = require('../../package.json');

/** @type {Record<string, string>} */
const peers = package_.peerDependencies ?? {};

/**
 * Resolves the published peer range for a package, falling back to `latest`
 * if it is somehow missing from package.json.
 * @param {string} name - npm package name.
 * @returns {string} A semver range suitable for `npm install <name>@<range>`.
 */
function range(name) {
  return peers[name] ?? 'latest';
}

/**
 * @typedef {object} StackDefinition
 * @property {string} label - Human-readable name shown in the wizard.
 * @property {string} entry - Subpath export (e.g. 'react' → '@moc-global/eslint-config/react').
 * @property {string} factory - Named factory exported for advanced composition.
 * @property {string[]} detect - Consumer dependency names that imply this stack.
 * @property {Record<string, string>} plugins - Optional peer plugins this stack needs.
 * @property {boolean} [base] - True for the always-present Node base.
 */

/**
 * Primary project stacks. Exactly one base stack is selected per project.
 * `node` is the base; `nest` extends it; `react`/`vue` layer on top of it.
 * @type {Record<string, StackDefinition>}
 */
export const STACKS = {
  node: {
    label: 'Node.js / TypeScript',
    entry: 'node',
    factory: 'createNodeConfig',
    detect: [],
    plugins: {},
    base: true,
  },
  nest: {
    label: 'NestJS',
    entry: 'nest',
    factory: 'createNestConfig',
    detect: ['@nestjs/core', '@nestjs/common'],
    plugins: {
      '@darraghor/eslint-plugin-nestjs-typed': range('@darraghor/eslint-plugin-nestjs-typed'),
    },
  },
  react: {
    label: 'React',
    entry: 'react',
    factory: 'createReactConfig',
    detect: ['react', 'react-dom', 'next'],
    plugins: {
      'eslint-plugin-react': range('eslint-plugin-react'),
      'eslint-plugin-react-hooks': range('eslint-plugin-react-hooks'),
      'eslint-plugin-react-refresh': range('eslint-plugin-react-refresh'),
      'eslint-plugin-react-compiler': range('eslint-plugin-react-compiler'),
    },
  },
  vue: {
    label: 'Vue',
    entry: 'vue',
    factory: 'createVueConfig',
    detect: ['vue', 'nuxt'],
    plugins: {
      'eslint-plugin-vue': range('eslint-plugin-vue'),
      'vue-eslint-parser': range('vue-eslint-parser'),
    },
  },
};

/**
 * Optional add-ons that can layer onto any stack. `bundled: true` means the
 * plugin ships as a dependency of this package, so no extra install is needed.
 * @type {Record<string, StackDefinition & { bundled?: boolean }>}
 */
export const EXTRAS = {
  vitest: {
    label: 'Vitest',
    entry: 'vitest',
    factory: 'default',
    detect: ['vitest'],
    plugins: {},
    bundled: true,
  },
  jest: {
    label: 'Jest',
    entry: 'jest',
    factory: 'default',
    detect: ['jest', '@jest/globals'],
    plugins: { 'eslint-plugin-jest': range('eslint-plugin-jest') },
  },
  zod: {
    label: 'Zod',
    entry: 'zod',
    factory: 'default',
    detect: ['zod'],
    plugins: {},
    bundled: true,
  },
  i18n: {
    label: 'i18next',
    entry: 'i18n',
    factory: 'default',
    detect: ['i18next', 'react-i18next', 'vue-i18n'],
    plugins: { 'eslint-plugin-i18next': range('eslint-plugin-i18next') },
  },
  tailwind: {
    label: 'Tailwind CSS',
    entry: 'tailwind',
    factory: 'default',
    detect: ['tailwindcss'],
    plugins: { 'eslint-plugin-better-tailwindcss': range('eslint-plugin-better-tailwindcss') },
  },
};

/** The package name, exported for use in generated files and messages. */
export const PACKAGE_NAME = package_.name;

/** The eslint peer range, surfaced for the installer and doctor. */
export const ESLINT_RANGE = range('eslint');

/**
 * Collects the full set of optional peer packages required by a selection of
 * stacks/extras, keyed by package name → version range. Bundled extras
 * contribute nothing because their plugins already ship with this package.
 * @param {string[]} selection - Stack and extra keys (e.g. ['react', 'vitest']).
 * @returns {Record<string, string>} Package name → version range to install.
 */
export function requiredPlugins(selection) {
  /** @type {Record<string, string>} */
  const result = {};

  for (const key of selection) {
    const definition = STACKS[key] ?? EXTRAS[key];

    if (definition) {
      Object.assign(result, definition.plugins);
    }
  }

  return result;
}
