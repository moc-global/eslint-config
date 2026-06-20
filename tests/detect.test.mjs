import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { detectStacks, installedDependencies, readManifest } from '../src/core/detect.js';

/**
 * Resolves a detection fixture directory to an absolute path.
 * @param {string} name - Fixture folder name under fixtures/detect.
 * @returns {string} Absolute path.
 */
function fixture(name) {
  return fileURLToPath(new URL(`../fixtures/detect/${name}`, import.meta.url));
}

describe('readManifest', () => {
  it('reads a project manifest', () => {
    expect(readManifest(fixture('react')).name).toBe('fixture-detect-react');
  });

  it('returns an empty object for a missing manifest', () => {
    expect(readManifest('/nonexistent/path/xyz')).toEqual({});
  });
});

describe('installedDependencies', () => {
  it('unions dependencies and devDependencies', () => {
    const deps = installedDependencies(fixture('react'));

    expect(deps.has('react')).toBe(true);
    expect(deps.has('vitest')).toBe(true);
  });
});

describe('detectStacks', () => {
  it('detects react and vitest', () => {
    const result = detectStacks(fixture('react'));

    expect(result.stacks).toContain('react');
    expect(result.extras).toContain('vitest');
  });

  it('detects vue', () => {
    expect(detectStacks(fixture('vue')).stacks).toContain('vue');
  });

  it('detects both next and react for a Next project (precedence applied in composition)', () => {
    const result = detectStacks(fixture('next'));

    expect(result.stacks).toContain('next');
    // Detection is intentionally NOT lossy: both are reported. `moc()` applies
    // the React layer exactly once via the Next stack, and falls back to React
    // when `next` is disabled — so React must remain detectable here.
    expect(result.stacks).toContain('react');
  });

  it('still detects bare react when next is absent', () => {
    const result = detectStacks(fixture('react'));

    expect(result.stacks).toContain('react');
    expect(result.stacks).not.toContain('next');
  });

  it('detects the vite add-on alongside react', () => {
    const result = detectStacks(fixture('vite'));

    expect(result.stacks).toContain('react');
    expect(result.extras).toContain('vite');
  });

  it('detects nest and jest', () => {
    const result = detectStacks(fixture('nest'));

    expect(result.stacks).toContain('nest');
    expect(result.extras).toContain('jest');
  });

  it('never returns the node base as a detected stack', () => {
    expect(detectStacks(fixture('react')).stacks).not.toContain('node');
  });

  it('detects nothing for a bare project', () => {
    const result = detectStacks(fixture('bare'));

    expect(result.stacks).toEqual([]);
    expect(result.extras).toEqual([]);
  });
});
