import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as readline from 'node:readline/promises';

import { detectStacks, installedDependencies } from '../core/detect.js';
import { EXTRAS, PACKAGE_NAME, requiredPlugins, STACKS } from '../core/manifest.js';

import type { CliOptions } from './options.js';
import {
  detectPackageManager,
  generateConfigFile,
  installCommand,
  isExtra,
  type PackageManager,
  patchPackageScripts,
  resolveConfigPath,
} from './project.js';
import { color, info, step, success, warn } from './ui.js';

/** Base stacks, in the order presented to the user. */
const BASE_ORDER = ['node', 'nest', 'react', 'next', 'vue'];

/**
 * Prompts the user to choose a single base stack, pre-selecting the detected one.
 * @param rl - Active readline interface.
 * @param detectedBase - The auto-detected base key.
 * @returns The chosen base stack key.
 */
async function askBase(rl: readline.Interface, detectedBase: string): Promise<string> {
  info(`\n${color.bold('Which stack is this project?')}`);

  BASE_ORDER.forEach((key, index) => {
    const marker = key === detectedBase ? color.green(' (detected)') : '';

    info(`  ${String(index + 1)}) ${STACKS[key].label}${marker}`);
  });

  const defaultIndex = BASE_ORDER.indexOf(detectedBase) + 1;
  const prompt = color.dim(`Choose [1-${String(BASE_ORDER.length)}], default ${String(defaultIndex)}: `);
  const response = await rl.question(prompt);
  const answer = response.trim();

  if (!answer) {
    return detectedBase;
  }

  const index = Number.parseInt(answer, 10) - 1;

  return BASE_ORDER[index] ?? detectedBase;
}

/**
 * Prompts the user to toggle extras, pre-selecting detected ones.
 * @param rl - Active readline interface.
 * @param detectedExtras - Auto-detected extra keys.
 * @returns The chosen extra keys.
 */
async function askExtras(rl: readline.Interface, detectedExtras: string[]): Promise<string[]> {
  const keys = Object.keys(EXTRAS);

  info(`\n${color.bold('Add-ons')} ${color.dim('(comma-separated, Enter to accept detected):')}`);

  keys.forEach((key) => {
    const marker = detectedExtras.includes(key) ? color.green(' (detected)') : '';

    info(`  • ${key} — ${EXTRAS[key].label}${marker}`);
  });

  const prompt = color.dim(`Extras [${detectedExtras.join(',') || 'none'}]: `);
  const response = await rl.question(prompt);
  const answer = response.trim();

  if (!answer) {
    return detectedExtras;
  }

  return answer
    .split(',')
    .map((value) => value.trim())
    .filter((value) => isExtra(value));
}

/**
 * Runs the install command for the resolved package set.
 * @param manager - Package manager.
 * @param packages - Packages to install.
 * @param dryRun - When true, only print the command.
 * @returns Whether the install succeeded (always true for dry runs).
 */
function runInstall(manager: PackageManager, packages: string[], dryRun: boolean): boolean {
  const { command, args } = installCommand(manager, packages);

  info(`  ${color.dim('$')} ${command} ${args.join(' ')}`);

  if (dryRun) {
    return true;
  }

  const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });

  return result.status === 0;
}

/**
 * Runs the interactive (or flag-driven) installer.
 * @param options - Parsed CLI options.
 * @returns Process exit code.
 */
export async function init(options: CliOptions): Promise<number> {
  const { rootDir, yes, preset, install, dryRun } = options;

  step(`Setting up ${PACKAGE_NAME}`);

  const manager = detectPackageManager(rootDir);
  const detected = detectStacks(rootDir);

  // Detection reports both `react` and `next` for a Next project; apply the
  // `next`-supersedes-`react` precedence here so the wizard pre-selects Next.
  const detectedBase = preset ?? (detected.stacks.includes('next') ? 'next' : detected.stacks.find((key) => key !== 'node')) ?? 'node';

  info(`Package manager: ${color.cyan(manager)}`);
  info(`Detected base:   ${color.cyan(STACKS[detectedBase].label)}`);
  info(`Detected extras: ${color.cyan(detected.extras.join(', ') || 'none')}`);

  let base = detectedBase;
  let extras = options.extras ?? detected.extras;

  if (!yes) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    try {
      base = preset ?? (await askBase(rl, detectedBase));
      extras = options.extras ?? (await askExtras(rl, detected.extras));
    } finally {
      rl.close();
    }
  }

  const selection = [base, ...extras];
  const plugins = requiredPlugins(selection);
  const packages = [PACKAGE_NAME, ...Object.keys(plugins).map((name) => `${name}@${plugins[name]}`)];

  step('Installing packages');

  if (install) {
    if (!runInstall(manager, packages, dryRun)) {
      warn('Install command failed. Fix the error above and re-run, or use --no-install and install manually.');

      return 1;
    }
  } else {
    info(`  ${color.dim('(skipped — install manually):')}`);
    info(`  ${packages.join(' ')}`);
  }

  step('Writing eslint.config.mjs');

  const target = resolveConfigPath(rootDir);
  // For a Vue project, opt into the TS parser chain when forced, or when TypeScript is present.
  const isVueTs = base === 'vue' && (options.vueTs ?? installedDependencies(rootDir).has('typescript'));
  const contents = generateConfigFile({ base, extras, vueTs: isVueTs });

  if (target.exists) {
    warn(`${target.path} already exists — not overwriting. New config would be:`);
    info(contents.replaceAll(/^/gm, ' '.repeat(4)));
  } else if (dryRun) {
    info(`  ${color.dim('(dry run) would write:')}`);
    info(contents.replaceAll(/^/gm, ' '.repeat(4)));
  } else {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(target.path, contents);
    success(`Wrote ${target.path}`);
  }

  if (!dryRun) {
    const added = patchPackageScripts(rootDir);

    if (added.length > 0) {
      success(`Added package.json scripts: ${added.join(', ')}`);
    }
  }

  step('Done');

  const lintCommand = manager === 'npm' ? 'npm run lint' : `${manager} lint`;

  info(`Run ${color.cyan(lintCommand)} to lint your project.`);
  info(`For an existing codebase with violations, see the legacy-adoption guide:`);
  info(`  ${color.dim('npx eslint --suppress-all   # baseline existing issues, fail only on new ones')}`);

  return 0;
}
