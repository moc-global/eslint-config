import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

import { moc } from '../src/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixtureDirectory = path.resolve(here, '../fixtures/next-ts');

/**
 * Composes the Next stack and lints a fixture file, returning the messages.
 * @param {string} relativeFile - Path under fixtures/next-ts.
 * @returns {Promise<import('eslint').Linter.LintMessage[]>} ESLint messages.
 */
async function lintNextFile(relativeFile) {
  const config = await moc({ next: true, rootDir: fixtureDirectory });
  const eslint = new ESLint({ cwd: fixtureDirectory, overrideConfigFile: true, baseConfig: config });
  const [result] = await eslint.lintFiles([path.join(fixtureDirectory, relativeFile)]);

  return result;
}

// Dogfoods the Next stack end-to-end: composes moc({ next: true }) and runs
// ESLint over real App Router and Pages Router source. Catches load/rule-time
// crashes and verifies the Next-specific relaxations (Fast Refresh export names,
// route-handler JSDoc) actually take effect.
describe('Next stack (dogfood)', () => {
  it('composes the Next config (React + Next) with the Next block present', async () => {
    const config = await moc({ next: true, rootDir: fixtureDirectory });

    expect(Array.isArray(config)).toBe(true);
    // The Next stack's own block must be present — otherwise the stack never
    // loaded and the lints below would be vacuous.
    expect(config.some((entry) => entry.name === 'next/core-web-vitals')).toBe(true);
  });

  it('lints an App Router page without crashing and does not flag the `metadata` export', async () => {
    const result = await lintNextFile('app/page.tsx');

    expect(result.fatalErrorCount).toBe(0);

    const refreshErrors = result.messages.filter((message) => message.ruleId === 'react-refresh/only-export-components');

    expect(refreshErrors).toEqual([]);
  });

  it('does not flag the Pages Router `getServerSideProps` export', async () => {
    const result = await lintNextFile('pages/ssr.tsx');

    expect(result.fatalErrorCount).toBe(0);

    const refreshErrors = result.messages.filter((message) => message.ruleId === 'react-refresh/only-export-components');

    expect(refreshErrors).toEqual([]);
  });

  it('does not require JSDoc on a Route Handler', async () => {
    const result = await lintNextFile('app/users/route.ts');

    expect(result.fatalErrorCount).toBe(0);

    const jsdocErrors = result.messages.filter((message) => message.ruleId === 'jsdoc/require-jsdoc');

    expect(jsdocErrors).toEqual([]);
  });

  it('lints a client component without crashing', async () => {
    const result = await lintNextFile('app/counter.tsx');

    expect(result.fatalErrorCount).toBe(0);
  });
});
