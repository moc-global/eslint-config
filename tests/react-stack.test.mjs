import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

import { moc } from '../src/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixtureDirectory = path.resolve(here, '../fixtures/react-ts');

// Dogfoods the React stack end-to-end: composes moc({ react: true }) and runs
// ESLint over a real .tsx file. This catches load/rule-time crashes that the
// repo's Node-only fixtures could never surface — notably the React-version
// detector calling the removed `context.getFilename()` API.
describe('React stack (dogfood)', () => {
  it('composes a React config array', async () => {
    const config = await moc({ react: true, rootDir: fixtureDirectory });

    expect(Array.isArray(config)).toBe(true);
    expect(config.length).toBeGreaterThan(0);
  });

  it('lints a .tsx file without crashing ESLint', async () => {
    const config = await moc({ react: true, rootDir: fixtureDirectory });
    const eslint = new ESLint({ cwd: fixtureDirectory, overrideConfigFile: true, baseConfig: config });

    // Throws if a rule crashes on load (the bug this guards against).
    const results = await eslint.lintFiles([path.join(fixtureDirectory, 'Counter.tsx')]);

    expect(results).toHaveLength(1);
    expect(results[0].fatalErrorCount).toBe(0);
  });

  it('pins a concrete react version (never "detect")', async () => {
    const config = await moc({ react: true, rootDir: fixtureDirectory });
    const settingsBlock = config.find((entry) => entry.settings?.react?.version !== undefined);

    expect(settingsBlock).toBeDefined();
    expect(settingsBlock.settings.react.version).not.toBe('detect');
  });
});
