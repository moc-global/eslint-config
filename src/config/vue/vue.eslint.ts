import { defineConfig } from 'eslint/config';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

/**
 * @description Base ESLint config for Vue 3 SFCs: vue3-recommended preset with browser globals.
 * @author Dmytro Vakulenko
 * @see https://eslint.vuejs.org/
 */
export default defineConfig([
  // eslint-plugin-vue v10 targets Vue 3 by default; 'flat/recommended' is the Vue 3 preset.
  ...pluginVue.configs['flat/recommended'],
  {
    name: 'vue/globals',
    files: ['**/*.vue'],
    languageOptions: {
      globals: globals.browser,
    },
  },
]);
