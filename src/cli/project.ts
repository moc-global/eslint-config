import * as fs from 'node:fs';
import path from 'node:path';

import { EXTRAS, PACKAGE_NAME, STACKS } from '../core/manifest.js';

/** A supported package manager. */
export type PackageManager = 'bun' | 'npm' | 'pnpm' | 'yarn';

/** Lockfile → package manager mapping, checked in order. */
const LOCKFILES: [string, PackageManager][] = [
  ['pnpm-lock.yaml', 'pnpm'],
  ['yarn.lock', 'yarn'],
  ['bun.lockb', 'bun'],
  ['bun.lock', 'bun'],
  ['package-lock.json', 'npm'],
];

/**
 * Detects the package manager from a lockfile, then from the `packageManager`
 * field, falling back to npm.
 * @param rootDir - Project root.
 * @returns The detected package manager.
 */
export function detectPackageManager(rootDir: string): PackageManager {
  for (const [lockfile, manager] of LOCKFILES) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (fs.existsSync(path.join(rootDir, lockfile))) {
      return manager;
    }
  }

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')) as { packageManager?: string };

    if (typeof packageJson.packageManager === 'string') {
      const name = packageJson.packageManager.split('@', 1)[0];

      if (['npm', 'yarn', 'pnpm', 'bun'].includes(name)) {
        return name as PackageManager;
      }
    }
  } catch {
    // ignore — fall through to default
  }

  return 'npm';
}

export interface InstallCommandReturn {
  command: string;
  args: string[];
}

/**
 * Builds the dev-dependency install command for a given package manager.
 * @param manager - Package manager.
 * @param packages - Packages (optionally version-suffixed) to install.
 * @returns The command and its arguments.
 */
export function installCommand(manager: PackageManager, packages: string[]): InstallCommandReturn {
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

export interface GenerateConfigFileSelection {
  base: string;
  extras: string[];
  vueTs?: boolean;
}

/**
 * Generates the contents of an `eslint.config.mjs` for the given selection.
 * Emits explicit flags so the file is self-documenting.
 * @param selection - Chosen stacks/extras.
 * @param selection.base - The chosen base stack key.
 * @param selection.extras - The chosen add-on keys.
 * @param selection.vueTs - Whether to use the Vue TypeScript parser chain.
 * @returns The file contents.
 */
export function generateConfigFile(selection: GenerateConfigFileSelection): string {
  const flags: string[] = [];

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
 * @param rootDir - Project root.
 * @returns The names of scripts that were added.
 */
export function patchPackageScripts(rootDir: string): string[] {
  const packagePath = path.join(rootDir, 'package.json');
  const added: string[] = [];

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8')) as { scripts?: Record<string, string> };

    packageJson.scripts = packageJson.scripts ?? {};

    if (!packageJson.scripts.lint) {
      packageJson.scripts.lint = 'eslint';
      added.push('lint');
    }

    if (!packageJson.scripts['lint:fix']) {
      packageJson.scripts['lint:fix'] = 'eslint --fix';
      added.push('lint:fix');
    }

    if (added.length > 0) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
    }
  } catch {
    // ignore — package.json may not exist or be malformed
  }

  return added;
}

export interface ResolveConfigPathReturn {
  path: string;
  exists: boolean;
}

/**
 * Resolves the on-disk path for an eslint flat config, returning the first
 * existing variant or the default `eslint.config.mjs`.
 * @param rootDir - Project root.
 * @returns Target config path and whether it exists.
 */
export function resolveConfigPath(rootDir: string): ResolveConfigPathReturn {
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
 * @param key - Candidate stack key.
 * @returns Whether the key is a known base stack.
 */
export function isStack(key: string): boolean {
  return Object.hasOwn(STACKS, key);
}

/**
 * Validates an extra key.
 * @param key - Candidate extra key.
 * @returns Whether the key is a known extra.
 */
export function isExtra(key: string): boolean {
  return Object.hasOwn(EXTRAS, key);
}
