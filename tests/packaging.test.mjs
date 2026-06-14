import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { beforeAll, describe, expect, it } from 'vitest';

const rootDir = fileURLToPath(new URL('..', import.meta.url));

/**
 * Runs `npm pack --dry-run --json` and returns the list of packed file paths.
 * @returns {string[]} Packed file paths relative to the package root.
 */
function packedFiles() {
  // Intentionally invokes the project's package manager to inspect the tarball.
  // eslint-disable-next-line sonarjs/no-os-command-from-path
  const output = execFileSync('npm', ['pack', '--dry-run', '--json'], { cwd: rootDir, encoding: 'utf8' });
  const parsed = JSON.parse(output);

  return parsed[0].files.map((file) => file.path);
}

describe('packaging', () => {
  beforeAll(() => {
    // The published surface is the build output; ensure it exists before packing.
    // eslint-disable-next-line sonarjs/no-os-command-from-path
    execFileSync('npm', ['run', 'build'], { cwd: rootDir, stdio: 'ignore' });
  }, 60_000);

  it('ships the built dist with declarations and excludes sources', () => {
    const files = packedFiles();

    expect(files).toContain('package.json');
    expect(files).toContain('dist/cli/index.js');
    expect(files.some((file) => file.startsWith('dist/'))).toBe(true);
    expect(files.some((file) => file.endsWith('.d.ts'))).toBe(true);

    for (const excluded of ['src/', 'tests/', 'fixtures/', 'docs/']) {
      const shipped = files.some((file) => file.startsWith(excluded));

      expect(shipped, `should not ship ${excluded}`).toBe(false);
    }
  }, 60_000);
});
