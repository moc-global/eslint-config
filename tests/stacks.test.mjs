import { createRequire } from 'node:module';

import { describe, expect, it } from 'vitest';

import { EXTRAS, PACKAGE_NAME, requiredPlugins, STACKS } from '../src/core/manifest.js';

const require = createRequire(import.meta.url);
const package_ = require('../package.json');

describe('STACKS manifest', () => {
  it('exposes node as the base stack and the framework stacks', () => {
    expect(STACKS.node.base).toBe(true);
    expect(Object.keys(STACKS)).toEqual(expect.arrayContaining(['node', 'nest', 'react', 'next', 'vue']));
  });

  it('derives the package name from package.json', () => {
    expect(PACKAGE_NAME).toBe(package_.name);
    expect(PACKAGE_NAME).toBe('@moc-global/eslint-config');
  });

  it('sources every plugin version range from package.json peerDependencies (single source of truth)', () => {
    const peers = package_.peerDependencies;
    const allDefs = [...Object.values(STACKS), ...Object.values(EXTRAS)];

    for (const definition of allDefs) {
      for (const [name, range] of Object.entries(definition.plugins)) {
        expect(peers[name], `${name} should be declared as a peer dependency`).toBeDefined();
        expect(range, `${name} range should match the declared peer range`).toBe(peers[name]);
      }
    }
  });

  it('marks bundled extras as bundled and ships their plugins as dependencies', () => {
    expect(EXTRAS.vitest.bundled).toBe(true);
    expect(EXTRAS.zod.bundled).toBe(true);
    // Bundled extras require no extra install.
    expect(requiredPlugins(['vitest', 'zod'])).toEqual({});
  });
});

describe('requiredPlugins', () => {
  it('returns the pristine react plugin set for a react selection (no Fast Refresh)', () => {
    const plugins = requiredPlugins(['react']);

    expect(Object.keys(plugins)).toEqual(expect.arrayContaining(['eslint-plugin-react', 'eslint-plugin-react-hooks']));

    // Fast Refresh moved out of the pristine React stack: it is a bundler concern
    // supplied by the `vite` add-on / `next` stack, so it is not a React peer.
    expect(plugins).not.toHaveProperty('eslint-plugin-react-refresh');
  });

  it('returns react peers + react-refresh + the Next plugin for a next selection', () => {
    const plugins = requiredPlugins(['next']);

    expect(Object.keys(plugins)).toEqual(
      expect.arrayContaining([
        'eslint-plugin-react',
        'eslint-plugin-react-hooks',
        'eslint-plugin-react-refresh',
        '@next/eslint-plugin-next',
      ]),
    );
  });

  it('requires eslint-plugin-react-refresh for the vite add-on', () => {
    expect(requiredPlugins(['vite'])).toHaveProperty('eslint-plugin-react-refresh');
  });

  it('does NOT require eslint-plugin-react-compiler (it is opt-in, never loaded by moc())', () => {
    // Auto-installing react-compiler pinned zod-validation-error@3.5.4 (no ./v4
    // export) and crashed ESLint for React consumers. It is an optional peer,
    // available via the `/react-compiler` opt-in export only.
    expect(requiredPlugins(['react'])).not.toHaveProperty('eslint-plugin-react-compiler');
  });

  it('merges plugins across multiple selections and ignores unknown keys', () => {
    const plugins = requiredPlugins(['nest', 'jest', 'does-not-exist']);

    expect(plugins).toHaveProperty('@darraghor/eslint-plugin-nestjs-typed');
    expect(plugins).toHaveProperty('eslint-plugin-jest');
  });

  it('returns nothing for the node base alone', () => {
    expect(requiredPlugins(['node'])).toEqual({});
  });
});
