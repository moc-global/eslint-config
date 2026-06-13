// @ts-check
import * as fs from 'node:fs';
import { createRequire } from 'node:module';

import { detectStacks, installedDependencies } from '../detect.mjs';

import { requiredPlugins } from './stacks.mjs';
import { color, info, step, success, warn } from './ui.mjs';

/**
 * Reports whether a package can be resolved from the project root, and its
 * installed version when available. Uses Node's resolution (so it honors
 * monorepo hoisting) but reads the manifest via fs to avoid a dynamic require.
 * @param {string} rootDir - Project root.
 * @param {string} name - Package name.
 * @returns {{ resolved: boolean, version: string | null }} Resolution result.
 */
function probe(rootDir, name) {
  const require = createRequire(`${rootDir}/noop.js`);

  try {
    // Existence check: resolves the package entry, honoring monorepo hoisting.
    require.resolve(name);
  } catch {
    return { resolved: false, version: null };
  }

  // Version is best-effort: some packages don't expose ./package.json in exports.
  try {
    const manifestPath = require.resolve(`${name}/package.json`);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    return { resolved: true, version: manifest.version ?? null };
  } catch {
    return { resolved: true, version: null };
  }
}

/**
 * Checks that every plugin required by the project's detected stacks/extras is
 * actually installed and resolvable. Prints a report and returns an exit code.
 * @param {object} options - Parsed CLI options.
 * @param {string} options.rootDir - Project root.
 * @returns {number} Process exit code (0 = healthy, 1 = missing plugins).
 */
export function doctor(options) {
  const { rootDir } = options;

  step('Diagnosing ESLint config setup');

  const detected = detectStacks(rootDir);
  const selection = ['node', ...detected.stacks, ...detected.extras];

  info(`Detected stacks: ${color.cyan(detected.stacks.join(', ') || 'node only')}`);
  info(`Detected extras: ${color.cyan(detected.extras.join(', ') || 'none')}\n`);

  const deps = installedDependencies(rootDir);
  const plugins = requiredPlugins(selection);
  const missing = [];

  // eslint must always be present.
  const eslintProbe = probe(rootDir, 'eslint');

  if (eslintProbe.resolved) {
    success(`eslint ${color.dim(eslintProbe.version ?? '')}`);
  } else {
    warn('eslint is not installed');
    missing.push('eslint');
  }

  for (const name of Object.keys(plugins)) {
    const found = probe(rootDir, name);

    if (found.resolved) {
      success(`${name} ${color.dim(found.version ?? '')}`);
    } else if (deps.has(name)) {
      warn(`${name} is declared but not resolvable — try reinstalling`);
      missing.push(name);
    } else {
      warn(`${name} is missing (required by your detected stack)`);
      missing.push(name);
    }
  }

  info('');

  if (missing.length === 0) {
    success('Everything required by your stack is installed.');

    return 0;
  }

  warn(`${missing.length} package(s) missing. Install them:`);
  info(`  npm i -D ${missing.join(' ')}`);
  info(`  ${color.dim('or re-run: npx @moc-global/eslint-config init')}`);

  return 1;
}
