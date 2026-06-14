import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';

/**
 * @description TypeScript parser chaining for Vue SFCs: vue-eslint-parser wraps `@typescript-eslint/parser`
 * for type-aware linting inside `<script lang="ts">` blocks.
 * Requires .vue files to be included in your tsconfig.json.
 * @author Dmytro Vakulenko
 * @see https://typescript-eslint.io/packages/parser/#parseroptionsparser
 */
export default defineConfig([
  {
    name: 'vue-ts/parser',
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        projectService: true,
      },
    },
  },
]);
