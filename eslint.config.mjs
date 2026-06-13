import { moc } from './src/index.mjs';

// Dogfood: this package lints itself with its own config.
// Type-aware linting is driven by tsconfig.json.
const config = await moc({ tsconfig: 'tsconfig.json' });

export default [
  {
    name: 'repo/ignores',
    // Fixtures contain deliberately-bad code for tests; docs is VitePress tooling/content; coverage is generated.
    ignores: ['fixtures/**', 'docs/**', 'coverage/**'],
  },
  ...config,
];
