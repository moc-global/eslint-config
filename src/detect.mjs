// @ts-check
import * as fs from 'node:fs';
import path from 'node:path';

import { EXTRAS, STACKS } from './cli/stacks.mjs';

/**
 * Reads and parses a consumer project's package.json.
 * @param {string} [rootDir] - Project root. Defaults to the current working directory.
 * @returns {import('type-fest').PackageJson} Parsed manifest, or an empty object if unreadable.
 */
export function readManifest(rootDir = process.cwd()) {
  const packagePath = path.join(rootDir, 'package.json');

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  } catch {
    return {};
  }
}

/**
 * Collects every dependency name declared in a project's manifest, across all
 * dependency fields.
 * @param {string} [rootDir] - Project root. Defaults to the current working directory.
 * @returns {Set<string>} The union of all declared dependency names.
 */
export function installedDependencies(rootDir = process.cwd()) {
  const package_ = readManifest(rootDir);

  return new Set([
    ...Object.keys(package_.dependencies ?? {}),
    ...Object.keys(package_.devDependencies ?? {}),
    ...Object.keys(package_.peerDependencies ?? {}),
    ...Object.keys(package_.optionalDependencies ?? {}),
  ]);
}

/**
 * @typedef {object} Detection
 * @property {string[]} stacks - Detected framework stack keys (e.g. ['react']).
 * @property {string[]} extras - Detected add-on keys (e.g. ['vitest', 'zod']).
 */

/**
 * Infers which stacks and extras a project uses from its declared dependencies.
 * The Node base is always implied and is not returned in `stacks`.
 * @param {string} [rootDir] - Project root. Defaults to the current working directory.
 * @returns {Detection} The detected stacks and extras.
 */
export function detectStacks(rootDir = process.cwd()) {
  const deps = installedDependencies(rootDir);
  /** @type {Detection} */
  const result = { stacks: [], extras: [] };

  for (const [key, definition] of Object.entries(STACKS)) {
    if (!definition.base && definition.detect.some((dependency) => deps.has(dependency))) {
      result.stacks.push(key);
    }
  }

  for (const [key, definition] of Object.entries(EXTRAS)) {
    if (definition.detect.some((dependency) => deps.has(dependency))) {
      result.extras.push(key);
    }
  }

  return result;
}
