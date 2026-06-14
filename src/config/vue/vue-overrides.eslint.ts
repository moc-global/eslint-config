import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';

/**
 * @description Overrides for Vue SFCs: enforces PascalCase filenames per the Vue 3 official style guide (priority A).
 * @author Dmytro Vakulenko
 * @see https://vuejs.org/style-guide/rules-strongly-recommended#single-file-component-filename-casing
 */
export default defineConfig([
  {
    // eslint-plugin-vue's `flat/recommended` re-enables template formatting rules
    // (max-attributes-per-line, html-closing-bracket-newline, html-indent, …)
    // *after* the Node base applied eslint-config-prettier, so they fight
    // `prettier/prettier` over `.vue` formatting and `--fix` cannot converge.
    // Re-apply the prettier opt-outs here (last in the Vue chain) so Prettier
    // solely owns SFC formatting. See fix-vue-stack-defects.
    name: 'vue/prettier-compat',
    files: ['**/*.vue'],
    rules: eslintConfigPrettier.rules,
  },
  {
    name: 'vue/overrides',
    files: ['**/*.vue'],
    rules: {
      // PascalCase applies to the SFC *filename* only. unicorn v65 checks
      // directory names too by default, which would reject a conventional
      // lowercase `src/components/Foo.vue` ("Rename `src` to `Src`"). See
      // fix-vue-stack-defects (framework-stack-compatibility).
      'unicorn/filename-case': ['error', { case: 'pascalCase', checkDirectories: false }],
      // `n/no-missing-import` resolves tsconfig path aliases for `.ts`/`.tsx`
      // but not for `.vue`, so aliased SFC imports (`@/types/task`) are falsely
      // flagged. Real missing imports are still caught by `vue-tsc` and the
      // bundler. Mirrors the test-file treatment in the repo's own config.
      'n/no-missing-import': 'off',
    },
  },
]);
