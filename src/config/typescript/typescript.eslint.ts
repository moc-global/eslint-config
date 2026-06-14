import namingEslint from './naming.eslint.js';
import overridesEslint from './overrides.eslint.js';
import overridesTestEslint from './overrides-test.eslint.js';
import { createProjectConfig } from './project.eslint.js';
import tseslintRulesEslint from './tseslint-rules.eslint.js';

/**
 * Aggregated TypeScript-specific ESLint configs. All rules here
 * only apply to TypeScript files (*.ts, *.tsx, *.mts, *.cts).
 * Remove this import from node.eslint.ts to switch to a JavaScript-only configuration.
 * @param options - Optional project root and tsconfig paths forwarded to the TypeScript parser config.
 * @param options.rootDir - Project root for tsconfig resolution.
 * @param options.tsconfig - Explicit tsconfig filename for source files.
 * @param options.scriptstsconfig - Explicit tsconfig filename for the scripts directory.
 * @returns The aggregated TypeScript-only flat-config array (rules, naming, overrides, parser).
 * @author Dmytro Vakulenko
 */
export function createTypescriptConfig(options: { rootDir?: string; tsconfig?: string; scriptstsconfig?: string } = {}) {
  return [...tseslintRulesEslint, ...namingEslint, ...overridesEslint, ...overridesTestEslint, ...createProjectConfig(options)];
}

export default createTypescriptConfig();
