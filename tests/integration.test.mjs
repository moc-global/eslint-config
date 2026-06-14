import { fileURLToPath } from 'node:url';

import { ESLint } from 'eslint';
import { beforeAll, describe, expect, it } from 'vitest';

import { moc } from '../src/index.js';

const fixtureDirectory = fileURLToPath(new URL('../fixtures/node-ts', import.meta.url));

/**
 * Lints a file inside the node-ts fixture with the composed Node config.
 * @param {string} file - Path relative to the fixture root.
 * @returns {Promise<import('eslint').ESLint.LintResult[]>} Lint results.
 */
async function lintFixture(file) {
  const overrideConfig = await moc({ rootDir: fixtureDirectory, tsconfig: 'tsconfig.json' });
  const eslint = new ESLint({ cwd: fixtureDirectory, overrideConfigFile: true, overrideConfig });

  return eslint.lintFiles([file]);
}

describe('node-ts integration lint', () => {
  /** @type {string[]} */
  let badRuleIds = [];
  /** @type {import('eslint').ESLint.LintResult} */
  let badResult;

  beforeAll(async () => {
    const results = await lintFixture('src/bad.ts');

    [badResult] = results;
    badRuleIds = badResult.messages.map((message) => message.ruleId).filter(Boolean);
  });

  it('reports violations in the deliberately-bad file', () => {
    expect(badResult.errorCount).toBeGreaterThan(0);
  });

  it('flags `var` usage', () => {
    expect(badRuleIds).toContain('no-var');
  });

  it('flags loose equality (== null)', () => {
    expect(badRuleIds).toContain('eqeqeq');
  });

  it('flags the unused import', () => {
    const unusedRule = badRuleIds.some((id) => id.includes('no-unused'));

    expect(unusedRule).toBe(true);
  });

  it('passes the clean file with zero errors', async () => {
    const results = await lintFixture('src/good.ts');

    expect(results[0].errorCount).toBe(0);
  });
});
