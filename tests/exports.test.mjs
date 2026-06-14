import { describe, expect, it } from 'vitest';

// Smoke test: every public subpath module loads and exposes its documented
// surface. Mirrors the `exports` map in package.json (source paths here; the
// built `dist` resolution is covered by the packaging test).
const SUBPATHS = [
  { path: '../src/index.js', named: ['moc', 'createNodeConfig', 'detectStacks', 'STACKS', 'EXTRAS'] },
  { path: '../src/config/node.eslint.js', named: ['createNodeConfig'], default: true },
  { path: '../src/config/react.eslint.js', named: ['createReactConfig'] },
  { path: '../src/config/vue.eslint.js', named: ['createVueConfig', 'createVueTsConfig'] },
  { path: '../src/config/nest.eslint.js', named: ['createNestConfig'] },
  { path: '../src/config/vitest.eslint.js', default: true },
  { path: '../src/config/jest.eslint.js', default: true },
  { path: '../src/config/zod.eslint.js', default: true },
  { path: '../src/config/i18n.eslint.js', default: true },
  { path: '../src/config/tailwind.eslint.js', default: true },
  { path: '../src/core/manifest.js', named: ['STACKS', 'EXTRAS', 'PACKAGE_NAME', 'requiredPlugins'] },
];

describe('public exports', () => {
  it.each(SUBPATHS)('resolves and exposes its surface: $path', async (entry) => {
    const module_ = await import(entry.path);
    const expected = [...(entry.named ?? []), ...(entry.default ? ['default'] : [])];

    for (const name of expected) {
      expect(module_[name], `${entry.path} should export ${name}`).toBeDefined();
    }
  });
});
