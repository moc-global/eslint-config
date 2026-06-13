// @ts-check
import * as fs from 'node:fs';
import path from 'node:path';

import { EXTRAS, PACKAGE_NAME, STACKS } from './stacks.mjs';

/**
 * @typedef {'npm' | 'yarn' | 'pnpm' | 'bun'} PackageManager
 */

/** Lockfile → package manager mapping, checked in order. */
const LOCKFILES = [
  ['pnpm-lock.yaml', 'pnpm'],
  ['yarn.lock', 'yarn'],
  ['bun.lockb', 'bun'],
  ['bun.lock', 'bun'],
  ['package-lock.json', 'npm'],
];

/**
 * Detects the package manager from a lockfile, then from the `packageManager`
 * field, falling back to npm.
 * @param {string} rootDir - Project root.
 * @returns {PackageManager} The detected package manager.
 */
export function detectPackageManager(rootDir) {
  for (const [lockfile, manager] of LOCKFILES) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (fs.existsSync(path.join(rootDir, lockfile))) {
      return /** @type {PackageManager} */ (manager);
    }
  }

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const package_ = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));

    if (typeof package_.packageManager === 'string') {
      const name = package_.packageManager.split('@', 1)[0];

      if (['npm', 'yarn', 'pnpm', 'bun'].includes(name)) {
        return /** @type {PackageManager} */ (name);
      }
    }
  } catch {
    // ignore — fall through to default
  }

  return 'npm';
}

/**
 * Builds the dev-dependency install command for a given package manager.
 * @param {PackageManager} manager - Package manager.
 * @param {string[]} packages - Packages (optionally version-suffixed) to install.
 * @returns {{ command: string, args: string[] }} The command and its arguments.
 */
export function installCommand(manager, packages) {
  switch (manager) {
    case 'yarn': {
      return { command: 'yarn', args: ['add', '--dev', ...packages] };
    }

    case 'pnpm': {
      return { command: 'pnpm', args: ['add', '--save-dev', ...packages] };
    }

    case 'bun': {
      return { command: 'bun', args: ['add', '--dev', ...packages] };
    }

    default: {
      return { command: 'npm', args: ['install', '--save-dev', ...packages] };
    }
  }
}

/**
 * Generates the contents of an `eslint.config.mjs` for the given selection.
 * Emits explicit flags so the file is self-documenting.
 * @param {{ base: string, extras: string[], vueTs?: boolean }} selection - Chosen stacks/extras.
 * @returns {string} The file contents.
 */
export function generateConfigFile(selection) {
  /** @type {string[]} */
  const flags = [];

  if (selection.base && selection.base !== 'node') {
    flags.push(`  ${selection.base}: true,`);
  }

  if (selection.base === 'vue' && selection.vueTs) {
    flags.push('  vueTs: true,');
  }

  for (const extra of selection.extras) {
    flags.push(`  ${extra}: true,`);
  }

  const body = flags.length > 0 ? `moc({\n${flags.join('\n')}\n})` : 'moc()';

  return `import { moc } from '${PACKAGE_NAME}';\n\nexport default ${body};\n`;
}

/**
 * Adds `lint` / `lint:fix` scripts to a project's package.json if absent.
 * @param {string} rootDir - Project root.
 * @returns {string[]} The names of scripts that were added.
 */
export function patchPackageScripts(rootDir) {
  const packagePath = path.join(rootDir, 'package.json');
  const added = [];

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const package_ = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    package_.scripts = package_.scripts ?? {};

    if (!package_.scripts.lint) {
      package_.scripts.lint = 'eslint';
      added.push('lint');
    }

    if (!package_.scripts['lint:fix']) {
      package_.scripts['lint:fix'] = 'eslint --fix';
      added.push('lint:fix');
    }

    if (added.length > 0) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.writeFileSync(packagePath, `${JSON.stringify(package_, null, 2)}\n`);
    }
  } catch {
    // ignore — package.json may not exist or be malformed
  }

  return added;
}

/**
 * Resolves the on-disk path for an eslint flat config, returning the first
 * existing variant or the default `eslint.config.mjs`.
 * @param {string} rootDir - Project root.
 * @returns {{ path: string, exists: boolean }} Target config path and whether it exists.
 */
export function resolveConfigPath(rootDir) {
  const variants = ['eslint.config.mjs', 'eslint.config.js', 'eslint.config.cjs', 'eslint.config.ts'];

  for (const variant of variants) {
    const full = path.join(rootDir, variant);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (fs.existsSync(full)) {
      return { path: full, exists: true };
    }
  }

  return { path: path.join(rootDir, 'eslint.config.mjs'), exists: false };
}

/**
 * Validates a base stack key.
 * @param {string} key - Candidate stack key.
 * @returns {boolean} Whether the key is a known base stack.
 */
export function isStack(key) {
  return Object.hasOwn(STACKS, key);
}

/**
 * Validates an extra key.
 * @param {string} key - Candidate extra key.
 * @returns {boolean} Whether the key is a known extra.
 */
export function isExtra(key) {
  return Object.hasOwn(EXTRAS, key);
}
