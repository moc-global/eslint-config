import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

import { mocg } from '../src/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(here, '../fixtures');

// Dogfoods the NestJS and Vue stacks the way react-stack.test.mjs dogfoods React:
// compose the stack via mocg() and run ESLint over a real fixture. This catches
// load/rule-time crashes and spurious convention errors that the repo's Node-only
// fixtures could never surface. `requiresBlock` is a config block the stack
// contributes — asserting it is present proves the stack actually loaded (and
// guards against the test silently degrading to a Node-only, no-op lint).
const STACKS = [
  { name: 'NestJS', options: { nest: true }, dir: 'nest-ts', file: 'src/cat.controller.ts', requiresBlock: 'nestjs/overrides' },
  { name: 'Vue', options: { vueTs: true }, dir: 'vue-ts', file: 'src/AppCounter.vue', requiresBlock: 'vue/overrides' },
];

describe('Framework stacks are dogfooded', () => {
  for (const stack of STACKS) {
    const stackDirectory = path.join(fixturesRoot, stack.dir);

    it(`composes and lints the ${stack.name} stack without crashing`, async () => {
      const config = await mocg({ ...stack.options, rootDir: stackDirectory });

      // The stack's own config block must be present — otherwise the stack
      // never loaded and the lint below would be a vacuous no-op.
      expect(config.some((entry) => entry.name === stack.requiresBlock)).toBe(true);

      const eslint = new ESLint({ cwd: stackDirectory, overrideConfigFile: true, baseConfig: config });
      // Throws if a rule crashes on load (the bug this guards against).
      const results = await eslint.lintFiles([path.join(stackDirectory, stack.file)]);

      expect(results).toHaveLength(1);
      expect(results[0].fatalErrorCount).toBe(0);
    });
  }

  it('does not flag lowercase directories for a Vue SFC', async () => {
    const stackDirectory = path.join(fixturesRoot, 'vue-ts');
    const config = await mocg({ vueTs: true, rootDir: stackDirectory });

    expect(config.some((entry) => entry.name === 'vue/overrides')).toBe(true);

    const eslint = new ESLint({ cwd: stackDirectory, overrideConfigFile: true, baseConfig: config });
    const [result] = await eslint.lintFiles([path.join(stackDirectory, 'src/AppCounter.vue')]);

    const directoryCasingErrors = result.messages.filter(
      (message) => message.ruleId === 'unicorn/filename-case' && message.message.includes('Directory name'),
    );

    expect(directoryCasingErrors).toEqual([]);
  });
});
