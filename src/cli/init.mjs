// @ts-check
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as readline from 'node:readline/promises';

import { detectStacks, installedDependencies } from '../detect.mjs';

import { detectPackageManager, generateConfigFile, installCommand, isExtra, patchPackageScripts, resolveConfigPath } from './project.mjs';
import { EXTRAS, PACKAGE_NAME, requiredPlugins, STACKS } from './stacks.mjs';
import { color, info, step, success, warn } from './ui.mjs';

/** Base stacks, in the order presented to the user. */
const BASE_ORDER = ['node', 'nest', 'react', 'vue'];

/**
 * Prompts the user to choose a single base stack, pre-selecting the detected one.
 * @param {readline.Interface} rl - Active readline interface.
 * @param {string} detectedBase - The auto-detected base key.
 * @returns {Promise<string>} The chosen base stack key.
 */
async function askBase(rl, detectedBase) {
  info(`\n${color.bold('Which stack is this project?')}`);

  BASE_ORDER.forEach((key, index) => {
    const marker = key === detectedBase ? color.green(' (detected)') : '';

    info(`  ${index + 1}) ${STACKS[key].label}${marker}`);
  });

  const defaultIndex = BASE_ORDER.indexOf(detectedBase) + 1;
  const prompt = color.dim(`Choose [1-${BASE_ORDER.length}], default ${defaultIndex}: `);
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
 * @param {readline.Interface} rl - Active readline interface.
 * @param {string[]} detectedExtras - Auto-detected extra keys.
 * @returns {Promise<string[]>} The chosen extra keys.
 */
async function askExtras(rl, detectedExtras) {
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
 * @param {import('./project.mjs').PackageManager} manager - Package manager.
 * @param {string[]} packages - Packages to install.
 * @param {boolean} dryRun - When true, only print the command.
 * @returns {boolean} Whether the install succeeded (always true for dry runs).
 */
function runInstall(manager, packages, dryRun) {
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
 * @param {object} options - Parsed CLI options.
 * @param {string} options.rootDir - Project root.
 * @param {boolean} options.yes - Skip prompts; use detection/preset.
 * @param {string} [options.preset] - Forced base stack.
 * @param {string[]} [options.extras] - Forced extras.
 * @param {boolean} [options.vueTs] - Force the Vue TypeScript parser chain.
 * @param {boolean} options.install - Whether to run the install step.
 * @param {boolean} options.dryRun - Print actions without writing/installing.
 * @returns {Promise<number>} Process exit code.
 */
export async function init(options) {
  const { rootDir, yes, preset, install, dryRun } = options;

  step(`Setting up ${PACKAGE_NAME}`);

  const manager = detectPackageManager(rootDir);
  const detected = detectStacks(rootDir);
  const detectedBase = preset ?? detected.stacks.find((key) => key !== 'node') ?? 'node';

  info(`Package manager: ${color.cyan(manager)}`);
  info(`Detected base:   ${color.cyan(STACKS[detectedBase]?.label ?? detectedBase)}`);
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
  const vueTs = base === 'vue' && (options.vueTs ?? installedDependencies(rootDir).has('typescript'));
  const contents = generateConfigFile({ base, extras, vueTs });

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
