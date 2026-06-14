import { defineConfig } from 'eslint/config';
import namingConfig from 'eslint-config-naming';
import tseslint from 'typescript-eslint';

/**
 * @description Naming convention rules via eslint-config-naming, scoped to TypeScript files.
 * @author Dmytro Vakulenko
 * @see https://github.com/DrSmile444/eslint-config-naming
 */
export default defineConfig({
  files: ['**/*.{ts,tsx,mts,cts}'],
  plugins: { '@typescript-eslint': tseslint.plugin },
  extends: [namingConfig],
});
