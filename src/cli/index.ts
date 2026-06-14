#!/usr/bin/env node
import path from 'node:path';

import { PACKAGE_NAME } from '../core/manifest.js';

import { doctor } from './doctor.js';
import { init } from './init.js';
import type { CliOptions } from './options.js';
import { isExtra, isStack } from './project.js';
import { color, error as fail, info } from './ui.js';

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

interface ParseArgumentsReturn {
  command: string;
  options: CliOptions;
}

/**
 * Parses argv into a command and options object.
 * @param argv - Arguments after the node binary and script.
 * @returns Parsed result.
 */
function parseArguments(argv: string[]): ParseArgumentsReturn {
  const [command = 'help', ...rest] = argv;

  const options: CliOptions = {
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
 * @param options - Parsed options.
 * @returns Error message, or null when valid.
 */
function validate(options: CliOptions): string | null {
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
 * @returns A promise that resolves once the selected command finishes.
 */
async function main() {
  const { command, options } = parseArguments(process.argv.slice(2));

  if (['help', '--help', '-h'].includes(command)) {
    info(HELP);

    return;
  }

  const validationError = validate(options);

  if (validationError) {
    fail(validationError);
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
      fail(`Unknown command "${command}".`);
      info(HELP);
      process.exitCode = 1;
    }
  }
}

main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
