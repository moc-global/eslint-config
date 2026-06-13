#!/usr/bin/env node
// @ts-check
import path from 'node:path';

import { doctor } from './doctor.mjs';
import { init } from './init.mjs';
import { isExtra, isStack } from './project.mjs';
import { PACKAGE_NAME } from './stacks.mjs';
import { color, error, info } from './ui.mjs';

const HELP = `
${color.bold(PACKAGE_NAME)} — shared ESLint config + installer

${color.bold('Usage')}
  npx ${PACKAGE_NAME} <command> [options]

${color.bold('Commands')}
  init            Interactive setup: install plugins, write eslint.config.mjs, add scripts
  doctor          Check that every plugin your detected stack needs is installed
  help            Show this help

${color.bold('init options')}
  --preset <s>    Base stack: node | nest | react | vue (skips the stack prompt)
  --extras <a,b>  Comma-separated add-ons: vitest, jest, zod, i18n, tailwind
  --vue-ts        For a Vue project, use the TypeScript parser chain for SFCs
  -y, --yes       Non-interactive; use detection (and --preset/--extras if given)
  --no-install    Write config and scripts only; don't install packages
  --dry-run       Print what would happen without writing or installing
  --cwd <dir>     Operate in <dir> instead of the current directory

${color.bold('Examples')}
  npx ${PACKAGE_NAME} init
  npx ${PACKAGE_NAME} init --preset react --extras vitest,zod --yes
  npx ${PACKAGE_NAME} doctor
`;

/**
 * @typedef {object} CliOptions
 * @property {string} rootDir - Directory to operate in.
 * @property {boolean} yes - Skip prompts; use detection/preset.
 * @property {boolean} install - Whether to run the install step.
 * @property {boolean} dryRun - Print actions without writing/installing.
 * @property {string} [preset] - Forced base stack.
 * @property {string[]} [extras] - Forced extras.
 * @property {boolean} [vueTs] - Force the Vue TypeScript parser chain.
 */

/**
 * Parses argv into a command and options object.
 * @param {string[]} argv - Arguments after the node binary and script.
 * @returns {{ command: string, options: CliOptions }} Parsed result.
 */
function parseArguments(argv) {
  const [command = 'help', ...rest] = argv;

  /** @type {CliOptions} */
  const options = {
    rootDir: process.cwd(),
    yes: false,
    install: true,
    dryRun: false,
  };

  for (let index = 0; index < rest.length; index += 1) {
    const argument = rest[index];

    switch (argument) {
      case '-y':
      case '--yes': {
        options.yes = true;
        break;
      }

      case '--no-install': {
        options.install = false;
        break;
      }

      case '--vue-ts': {
        options.vueTs = true;
        break;
      }

      case '--dry-run': {
        options.dryRun = true;
        break;
      }

      case '--preset': {
        index += 1;
        options.preset = rest[index];
        break;
      }

      case '--extras': {
        index += 1;

        options.extras = (rest[index] ?? '')
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean);

        break;
      }

      case '--cwd': {
        index += 1;
        // Normalize to an absolute path: downstream consumers (createRequire) require it.
        options.rootDir = rest[index] ? path.resolve(rest[index]) : process.cwd();
        break;
      }

      default: {
        // ignore unknown flags
        break;
      }
    }
  }

  return { command, options };
}

/**
 * Validates parsed options, returning an error message or null.
 * @param {CliOptions} options - Parsed options.
 * @returns {string | null} Error message, or null when valid.
 */
function validate(options) {
  if (options.preset && !isStack(options.preset)) {
    return `Unknown --preset "${options.preset}". Valid: node, nest, react, vue.`;
  }

  if (options.extras) {
    const bad = options.extras.filter((value) => !isExtra(value));

    if (bad.length > 0) {
      return `Unknown --extras: ${bad.join(', ')}. Valid: vitest, jest, zod, i18n, tailwind.`;
    }
  }

  return null;
}

/**
 * CLI entry point.
 * @returns {Promise<void>}
 */
async function main() {
  const { command, options } = parseArguments(process.argv.slice(2));

  if (['help', '--help', '-h'].includes(command)) {
    info(HELP);

    return;
  }

  const validationError = validate(options);

  if (validationError) {
    error(validationError);
    process.exitCode = 1;

    return;
  }

  switch (command) {
    case 'init': {
      process.exitCode = await init(options);

      return;
    }

    case 'doctor': {
      process.exitCode = doctor(options);

      return;
    }

    default: {
      error(`Unknown command "${command}".`);
      info(HELP);
      process.exitCode = 1;
    }
  }
}

main().catch((error_) => {
  error(error_?.message ?? String(error_));
  process.exitCode = 1;
});
