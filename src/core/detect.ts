import * as fs from 'node:fs';
import path from 'node:path';

import type { PackageJson } from 'type-fest';

import { EXTRAS, STACKS } from './manifest.js';

/**
 * Reads and parses a consumer project's package.json.
 * @param rootDir - Project root. Defaults to the current working directory.
 * @returns Parsed manifest, or an empty object if unreadable.
 */
export function readManifest(rootDir = process.cwd()): PackageJson {
  const packagePath = path.join(rootDir, 'package.json');

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return JSON.parse(fs.readFileSync(packagePath, 'utf8')) as PackageJson;
  } catch {
    return {};
  }
}

/**
 * Collects every dependency name declared in a project's manifest, across all
 * dependency fields.
 * @param rootDir - Project root. Defaults to the current working directory.
 * @returns The union of all declared dependency names.
 */
export function installedDependencies(rootDir = process.cwd()): Set<string> {
  const packageJson = readManifest(rootDir);

  return new Set([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {}),
    ...Object.keys(packageJson.optionalDependencies ?? {}),
  ]);
}

/** The stacks and add-ons inferred from a project's dependencies. */
export interface Detection {
  /** Detected framework stack keys (e.g. ['react']). */
  stacks: string[];
  /** Detected add-on keys (e.g. ['vitest', 'zod']). */
  extras: string[];
}

/**
 * Infers which stacks and extras a project uses from its declared dependencies.
 * The Node base is always implied and is not returned in `stacks`.
 * @param rootDir - Project root. Defaults to the current working directory.
 * @returns The detected stacks and extras.
 */
export function detectStacks(rootDir = process.cwd()): Detection {
  const deps = installedDependencies(rootDir);
  const result: Detection = { stacks: [], extras: [] };

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

  // A Next.js project depends on `react` + `react-dom` + `next`, so both stacks
  // match and are reported honestly here. The `next`-supersedes-`react`
  // precedence is applied at composition time (`mocg()` applies the React layer
  // exactly once via the Next stack) and at display time (the installer prefers
  // `next`). Detection is intentionally NOT lossy: dropping `react` here would
  // leave `mocg({ next: false })` on a Next project with no React fallback.
  // See add-nextjs-stack (nextjs-stack).
  return result;
}
