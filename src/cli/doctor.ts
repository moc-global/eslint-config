import * as fs from 'node:fs';
import { createRequire } from 'node:module';

import { detectStacks, installedDependencies } from '../core/detect.js';
import { PACKAGE_NAME, requiredPlugins } from '../core/manifest.js';

import type { CliOptions } from './options.js';
import { color, info, step, success, warn } from './ui.js';

interface ProbeReturn {
  resolved: boolean;
  version: string | null;
}

/**
 * Reports whether a package can be resolved from the project root, and its
 * installed version when available. Uses Node's resolution (so it honors
 * monorepo hoisting) but reads the manifest via fs to avoid a dynamic require.
 * @param rootDir - Project root.
 * @param name - Package name.
 * @returns Resolution result.
 */
function probe(rootDir: string, name: string): ProbeReturn {
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
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as { version?: string };

    return { resolved: true, version: manifest.version ?? null };
  } catch {
    return { resolved: true, version: null };
  }
}

/**
 * Checks that every plugin required by the project's detected stacks/extras is
 * actually installed and resolvable. Prints a report and returns an exit code.
 * @param options - Parsed CLI options.
 * @returns Process exit code (0 = healthy, 1 = missing plugins).
 */
export function doctor(options: CliOptions): number {
  const { rootDir } = options;

  step('Diagnosing ESLint config setup');

  const detected = detectStacks(rootDir);
  const selection = ['node', ...detected.stacks, ...detected.extras];

  info(`Detected stacks: ${color.cyan(detected.stacks.join(', ') || 'node only')}`);
  info(`Detected extras: ${color.cyan(detected.extras.join(', ') || 'none')}\n`);

  const deps = installedDependencies(rootDir);
  const plugins = requiredPlugins(selection);
  const missing: string[] = [];

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

  warn(`${String(missing.length)} package(s) missing. Install them:`);
  info(`  npm i -D ${missing.join(' ')}`);
  const reRun = color.dim(`or re-run: npx ${PACKAGE_NAME} init`);

  info(`  ${reRun}`);

  return 1;
}
