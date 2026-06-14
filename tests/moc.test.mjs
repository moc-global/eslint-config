import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { moc } from '../src/index.js';

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

describe('moc()', () => {
  it('returns a non-empty flat-config array for the node base', async () => {
    const config = await moc({ rootDir: bareDirectory });

    expect(Array.isArray(config)).toBe(true);
    expect(config.length).toBeGreaterThan(0);
  });

  it('does not register React/Vue plugins for a bare project', async () => {
    const keys = pluginKeys(await moc({ rootDir: bareDirectory }));

    expect(keys.has('vue')).toBe(false);
    expect([...keys].some((key) => key.startsWith('react'))).toBe(false);
  });

  it('registers React plugins when react is forced on', async () => {
    const keys = pluginKeys(await moc({ rootDir: bareDirectory, react: true }));

    expect(keys.has('react')).toBe(true);
  });

  it('registers the Vue plugin when vue is forced on', async () => {
    const keys = pluginKeys(await moc({ rootDir: bareDirectory, vue: true }));

    expect([...keys].some((key) => key === 'vue' || key.startsWith('vue'))).toBe(true);
  });

  it('lets an explicit false override auto-detection', async () => {
    const reactDirectory = fileURLToPath(new URL('../fixtures/detect/react', import.meta.url));
    const keys = pluginKeys(await moc({ rootDir: reactDirectory, react: false }));

    expect(keys.has('react')).toBe(false);
  });
});
