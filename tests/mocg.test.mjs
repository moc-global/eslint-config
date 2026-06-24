import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { mocg } from '../src/index.js';

const bareDirectory = fileURLToPath(new URL('../fixtures/detect/bare', import.meta.url));

/**
 * Collects every plugin namespace registered across a flat-config array.
 * @param {import('eslint').Linter.Config[]} config - Flat config array.
 * @returns {Set<string>} The set of registered plugin keys.
 */
function pluginKeys(config) {
  const keys = new Set();

  for (const block of config) {
    if (block && block.plugins) {
      for (const key of Object.keys(block.plugins)) {
        keys.add(key);
      }
    }
  }

  return keys;
}

describe('mocg()', () => {
  it('returns a non-empty flat-config array for the node base', async () => {
    const config = await mocg({ rootDir: bareDirectory });

    expect(Array.isArray(config)).toBe(true);
    expect(config.length).toBeGreaterThan(0);
  });

  it('does not register React/Vue plugins for a bare project', async () => {
    const keys = pluginKeys(await mocg({ rootDir: bareDirectory }));

    expect(keys.has('vue')).toBe(false);
    expect([...keys].some((key) => key.startsWith('react'))).toBe(false);
  });

  it('registers React plugins when react is forced on', async () => {
    const keys = pluginKeys(await mocg({ rootDir: bareDirectory, react: true }));

    expect(keys.has('react')).toBe(true);
  });

  it('registers the Vue plugin when vue is forced on', async () => {
    const keys = pluginKeys(await mocg({ rootDir: bareDirectory, vue: true }));

    expect([...keys].some((key) => key === 'vue' || key.startsWith('vue'))).toBe(true);
  });

  it('lets an explicit false override auto-detection', async () => {
    const reactDirectory = fileURLToPath(new URL('../fixtures/detect/react', import.meta.url));
    const keys = pluginKeys(await mocg({ rootDir: reactDirectory, react: false }));

    expect(keys.has('react')).toBe(false);
  });

  it('does not register Fast Refresh for a pristine React stack', async () => {
    const keys = pluginKeys(await mocg({ rootDir: bareDirectory, react: true }));

    // Fast Refresh is a bundler concern; the pristine React stack does not load it.
    expect(keys.has('react-refresh')).toBe(false);
  });

  it('composes Next as React + Next, applying the React layer exactly once', async () => {
    const config = await mocg({ rootDir: bareDirectory, next: true });
    const keys = pluginKeys(config);

    expect(keys.has('@next/next')).toBe(true);
    expect(keys.has('react')).toBe(true);
    // React applied exactly once — not the Next stack plus a standalone React
    // stack. A Set would hide duplication, so count the named React rule block.
    const reactRuleBlocks = config.filter((block) => block && block.name === 'react/rules');

    expect(reactRuleBlocks).toHaveLength(1);
  });

  it('auto-detects Next and supersedes React (no double React layer)', async () => {
    const nextDirectory = fileURLToPath(new URL('../fixtures/detect/next', import.meta.url));
    const config = await mocg({ rootDir: nextDirectory });

    expect(pluginKeys(config).has('@next/next')).toBe(true);
    expect(config.filter((block) => block && block.name === 'react/rules')).toHaveLength(1);
  });

  it('falls back to React when next: false opts out of an auto-detected Next project', async () => {
    const nextDirectory = fileURLToPath(new URL('../fixtures/detect/next', import.meta.url));
    const config = await mocg({ rootDir: nextDirectory, next: false });
    const keys = pluginKeys(config);

    // Next is disabled, but a Next project is still a React project — React must
    // remain, not collapse to a node-only lint.
    expect(keys.has('@next/next')).toBe(false);
    expect(keys.has('react')).toBe(true);
    expect(config.filter((block) => block && block.name === 'react/rules')).toHaveLength(1);
  });

  it('enables the Vite Fast Refresh add-on for a Vite project', async () => {
    const viteDirectory = fileURLToPath(new URL('../fixtures/detect/vite', import.meta.url));
    const config = await mocg({ rootDir: viteDirectory });

    expect(config.some((block) => block && block.name === 'vite/react-refresh')).toBe(true);
  });

  it('gates the Vite add-on off when the Next stack is active (no duplicate react-refresh)', async () => {
    const nextDirectory = fileURLToPath(new URL('../fixtures/detect/next', import.meta.url));
    // Force the vite add-on on a Next project: Next owns Fast Refresh, so the
    // vite block must be suppressed to avoid registering react-refresh twice
    // (which crashes ESLint) and clobbering Next's allowExportNames.
    const config = await mocg({ rootDir: nextDirectory, vite: true });

    expect(config.some((block) => block && block.name === 'vite/react-refresh')).toBe(false);
    expect(config.filter((block) => block && block.name === 'next/react-refresh')).toHaveLength(1);
  });
});
