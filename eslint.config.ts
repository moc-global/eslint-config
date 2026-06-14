import type { ESLint, Linter } from 'eslint';
import boundaries from 'eslint-plugin-boundaries';

import { moc } from './src/index.js';

// Dogfood: this package lints its own TypeScript source with its own config.
// ESLint's jiti loader imports the .ts source directly — no build-before-lint.
// Type-aware linting is driven by tsconfig.json.
const config = await moc({ tsconfig: 'tsconfig.json' });

const repoConfig: Linter.Config[] = [
  {
    name: 'repo/ignores',
    // dist is generated; fixtures hold deliberately-bad code; docs is VitePress; coverage is generated.
    ignores: ['dist/**', 'fixtures/**', 'docs/**', 'coverage/**'],
  },
  // Enforce the package's own layering with eslint-plugin-boundaries:
  //   config ✗→ cli, cli ✗→ config, core is a leaf (✗→ cli, config).
  {
    name: 'repo/boundaries/settings',
    settings: {
      // boundaries must resolve `.js` specifiers to their `.ts` sources to
      // classify cross-layer imports — the TypeScript resolver handles that.
      'import/resolver': { typescript: { project: 'tsconfig.json' } },
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        { type: 'orchestrator', mode: 'file', pattern: 'src/index.ts' },
        { type: 'cli', pattern: 'src/cli/**' },
        { type: 'core', pattern: 'src/core/**' },
        { type: 'config', pattern: 'src/config/**' },
      ],
    },
  },
  {
    name: 'repo/boundaries/rules',
    files: ['src/**/*.ts'],
    plugins: { boundaries: boundaries as unknown as ESLint.Plugin },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'allow',
          rules: [
            { from: ['config'], disallow: ['cli'], message: 'The config layer must not import the CLI.' },
            { from: ['cli'], disallow: ['config'], message: 'The CLI must not import rule modules from config.' },
            { from: ['core'], disallow: ['cli', 'config'], message: 'The core layer must stay a leaf (no cli/config imports).' },
          ],
        },
      ],
    },
  },
];

// Test files import `../src/*.js` specifiers that resolve to `.ts` via the
// vitest/tsc resolver, not Node's — so the Node-resolution check is moot here.
// Placed last so it wins over the base config's `n/no-missing-import`.
const testsOverride: Linter.Config = {
  name: 'repo/tests',
  files: ['tests/**'],
  rules: { 'n/no-missing-import': 'off' },
};

// The CLI source carries the `#!/usr/bin/env node` shebang so `tsc` emits it to
// the built bin (`dist/cli/index.js`). `n/hashbang` can't see that src→dist
// mapping (bin points at dist), so it would strip the shebang — keep it off here.
const cliShebangOverride: Linter.Config = {
  name: 'repo/cli-shebang',
  files: ['src/cli/index.ts'],
  rules: { 'n/hashbang': 'off' },
};

export default [...repoConfig, ...config, testsOverride, cliShebangOverride];
