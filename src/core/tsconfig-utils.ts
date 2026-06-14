/* eslint-disable security/detect-non-literal-fs-filename */
import * as fs from 'node:fs';
import path from 'node:path';

import json5 from 'json5';
import type { TsConfigJson } from 'type-fest';

import { eslintLogger } from './logger.js';

const logger = eslintLogger('tsconfig-utils');

/** Options for resolving a tsconfig file path. */
interface ResolveTsconfigOptions {
  rootDir?: string;
  tsconfig?: string;
}

/** Ordered list of tsconfig filenames to try during auto-discovery. */
const TSCONFIG_CANDIDATES = ['tsconfig.json', 'tsconfig.base.json', 'tsconfig.main.json', 'tsconfig.app.json'];

/**
 * Resolves the path to a tsconfig file.
 * If `tsconfig` is provided in options, resolves it relative to `rootDir`.
 * Otherwise, walks `TSCONFIG_CANDIDATES` in order and returns the first that exists.
 * Falls back to `tsconfig.json` if none are found.
 * @param options - Optional project root and explicit tsconfig filename to resolve.
 * @returns Absolute path to the tsconfig file.
 */
export function resolveTsconfigPath(options: ResolveTsconfigOptions = {}): string {
  const rootDir = options.rootDir ?? process.cwd();

  if (options.tsconfig) {
    return path.resolve(rootDir, options.tsconfig);
  }

  for (const candidate of TSCONFIG_CANDIDATES) {
    const fullPath = path.resolve(rootDir, candidate);

    if (fs.existsSync(fullPath)) {
      logger.info(`Auto-discovered tsconfig at: ${fullPath}`);

      return fullPath;
    }
  }

  return path.resolve(rootDir, 'tsconfig.json');
}

/**
 * Parses a tsconfig file and returns its contents as a typed object.
 * @param tsconfigPath - Path to the tsconfig file
 * @returns Parsed tsconfig object, or undefined if parsing fails
 */
export function parseTsconfig(tsconfigPath: string): TsConfigJson | undefined {
  try {
    const fileContent = fs.readFileSync(tsconfigPath, 'utf8');

    return json5.parse(fileContent);
  } catch (error) {
    logger.warn(`Warning: Failed to parse ${tsconfigPath}:`, error instanceof Error ? error.message : error);
    throw error;
  }
}

/**
 * Resolves tsconfig paths from a tsconfig file and its references.
 * @param tsconfigPath - Path to the tsconfig file
 * @param visited - Set of already visited files to prevent circular references
 * @returns An object where each key is a path alias and the value is an array of paths.
 */
export function resolveTsconfigPaths(tsconfigPath: string, visited = new Set<string>()): Record<string, string[]> {
  if (visited.has(tsconfigPath)) {
    return {};
  }

  visited.add(tsconfigPath);

  let mergedPaths: Record<string, string[]> = {};

  try {
    const tsconfigContent = parseTsconfig(tsconfigPath);

    if (!tsconfigContent) {
      return mergedPaths;
    }

    if (tsconfigContent.compilerOptions?.paths && typeof tsconfigContent.compilerOptions.paths === 'object') {
      mergedPaths = {
        ...mergedPaths,
        ...tsconfigContent.compilerOptions.paths,
      };
    }

    if (Array.isArray(tsconfigContent.references)) {
      const tsconfigDirectory = path.dirname(tsconfigPath);

      for (const reference of tsconfigContent.references) {
        const referencePath = path.resolve(tsconfigDirectory, reference.path);
        const referencesPaths = resolveTsconfigPaths(referencePath, visited);

        mergedPaths = { ...mergedPaths, ...referencesPaths };
      }
    }
  } catch {
    logger.warn(`Warning: Failed to resolve paths from ${tsconfigPath}`);
  }

  return mergedPaths;
}
