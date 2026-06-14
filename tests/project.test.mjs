import { describe, expect, it } from 'vitest';

import { generateConfigFile, installCommand, isExtra, isStack } from '../src/cli/project.js';

describe('installCommand', () => {
  it('builds npm install command', () => {
    expect(installCommand('npm', ['a', 'b'])).toEqual({ command: 'npm', args: ['install', '--save-dev', 'a', 'b'] });
  });

  it('builds pnpm/yarn/bun commands', () => {
    expect(installCommand('pnpm', ['a']).args[0]).toBe('add');
    expect(installCommand('yarn', ['a']).command).toBe('yarn');
    expect(installCommand('bun', ['a']).command).toBe('bun');
  });
});

describe('generateConfigFile', () => {
  it('emits a bare moc() call for the node base with no extras', () => {
    const file = generateConfigFile({ base: 'node', extras: [] });

    expect(file).toContain("import { moc } from '@moc-global/eslint-config'");
    expect(file).toContain('export default moc();');
  });

  it('emits explicit flags for a framework base and extras', () => {
    const file = generateConfigFile({ base: 'react', extras: ['vitest', 'zod'] });

    expect(file).toContain('react: true,');
    expect(file).toContain('vitest: true,');
    expect(file).toContain('zod: true,');
  });

  it('emits vueTs only when requested', () => {
    expect(generateConfigFile({ base: 'vue', extras: [], vueTs: true })).toContain('vueTs: true,');
    expect(generateConfigFile({ base: 'vue', extras: [] })).not.toContain('vueTs: true,');
  });
});

describe('isStack / isExtra', () => {
  it('validates known keys', () => {
    expect(isStack('react')).toBe(true);
    expect(isStack('nope')).toBe(false);
    expect(isExtra('vitest')).toBe(true);
    expect(isExtra('react')).toBe(false);
  });
});
