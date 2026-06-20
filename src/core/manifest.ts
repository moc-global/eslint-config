import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/** The shape of this package's own manifest fields that the registry reads. */
interface PackageManifest {
  name: string;
  peerDependencies?: Record<string, string>;
}

/**
 * The package's own manifest. We read peer version ranges from here so the
 * STACKS manifest, the installer, `doctor`, and the helpful runtime errors all
 * share a single source of truth — bumping a version in package.json updates
 * everything that consumes it.
 */
const packageJson = require('../../package.json') as PackageManifest;

const peers: Record<string, string> = packageJson.peerDependencies ?? {};

/**
 * Resolves the published peer range for a package, falling back to `latest`
 * if it is somehow missing from package.json.
 * @param name - npm package name.
 * @returns A semver range suitable for `npm install <name>@<range>`.
 */
function range(name: string): string {
  return peers[name] ?? 'latest';
}

/** A primary project stack the wizard can install and compose. */
export interface StackDefinition {
  /** Human-readable name shown in the wizard. */
  label: string;
  /** Subpath export (e.g. 'react' → '@moc-global/eslint-config/react'). */
  entry: string;
  /** Named factory exported for advanced composition. */
  factory: string;
  /** Consumer dependency names that imply this stack. */
  detect: string[];
  /** Optional peer plugins this stack needs. */
  plugins: Record<string, string>;
  /** True for the always-present Node base. */
  base?: boolean;
}

/** An optional add-on; `bundled` extras ship their plugin with this package. */
export interface ExtraDefinition extends StackDefinition {
  bundled?: boolean;
}

/**
 * Primary project stacks. Exactly one base stack is selected per project.
 * `node` is the base; `nest` extends it; `react`/`vue` layer on top of it.
 */
export const STACKS: Record<string, StackDefinition> = {
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
    // `next` is intentionally absent: a Next.js project resolves to the `next`
    // stack (which supersedes `react` in detection), not the bare React stack.
    detect: ['react', 'react-dom'],
    plugins: {
      'eslint-plugin-react': range('eslint-plugin-react'),
      'eslint-plugin-react-hooks': range('eslint-plugin-react-hooks'),
      // `eslint-plugin-react-refresh` is intentionally absent here: the pristine
      // React stack does not load Fast Refresh (a bundler/HMR concern). The
      // `vite` add-on supplies `reactRefresh.configs.vite`; the `next` stack
      // supplies `reactRefresh.configs.next`. Keeping it out of the React stack
      // keeps required peers matched to what the stack actually loads.
      // See add-nextjs-stack (framework-stack-compatibility).
      //
      // `eslint-plugin-react-compiler` is intentionally absent here: `moc()`
      // never loads it (it is opt-in via the `/react-compiler` export), so it is
      // only an *optional* peer, not part of the auto-installed React stack.
      // Auto-installing it pulled react-compiler@rc, which pins
      // zod-validation-error@3.5.4 (no `./v4` export) and crashed ESLint when
      // eslint-plugin-react-hooks requires `zod-validation-error/v4`.
      // See fix-consumer-stack-defects (framework-stack-compatibility).
    },
  },
  next: {
    label: 'Next.js',
    entry: 'next',
    factory: 'createNextConfig',
    detect: ['next'],
    plugins: {
      // Next composes the React layer (`createNextConfig` reuses
      // `createReactConfig`), so it needs the React peers too.
      'eslint-plugin-react': range('eslint-plugin-react'),
      'eslint-plugin-react-hooks': range('eslint-plugin-react-hooks'),
      // Fast Refresh with Next's export conventions (`reactRefresh.configs.next`).
      'eslint-plugin-react-refresh': range('eslint-plugin-react-refresh'),
      '@next/eslint-plugin-next': range('@next/eslint-plugin-next'),
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
 */
export const EXTRAS: Record<string, ExtraDefinition> = {
  vite: {
    label: 'Vite (React Fast Refresh)',
    entry: 'vite',
    factory: 'default',
    detect: ['vite'],
    // Not bundled: `eslint-plugin-react-refresh` is an (optional) peer, supplied
    // here so a `moc()` Vite + React project keeps Fast Refresh linting after it
    // moved out of the pristine React stack.
    plugins: { 'eslint-plugin-react-refresh': range('eslint-plugin-react-refresh') },
  },
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
export const PACKAGE_NAME: string = packageJson.name;

/** The eslint peer range, surfaced for the installer and doctor. */
export const ESLINT_RANGE = range('eslint');

/**
 * Collects the full set of optional peer packages required by a selection of
 * stacks/extras, keyed by package name → version range. Bundled extras
 * contribute nothing because their plugins already ship with this package.
 * @param selection - Stack and extra keys (e.g. ['react', 'vitest']).
 * @returns Package name → version range to install.
 */
export function requiredPlugins(selection: string[]): Record<string, string> {
  const result: Record<string, string> = {};

  for (const key of selection) {
    const definition = STACKS[key] ?? EXTRAS[key];

    // selection may contain an unknown key at runtime; the record types can't prove that.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (definition) {
      Object.assign(result, definition.plugins);
    }
  }

  return result;
}
