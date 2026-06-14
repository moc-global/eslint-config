import { defineConfig } from 'eslint/config';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

/**
 * @description ESLint config for best practices and code quality using eslint-plugin-unicorn.
 * @author Dmytro Vakulenko
 * @see https://github.com/sindresorhus/eslint-plugin-unicorn
 */
export default defineConfig([
  eslintPluginUnicorn.configs.recommended,
  {
    name: 'unicorn/custom',
    rules: {
      'unicorn/no-useless-switch-case': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/prevent-abbreviations': [
        'error',
        {
          checkFilenames: false,
          allowList: {
            e2e: true,
            'e2e-spec': true,
            spec: true,
            param: true,
            Param: true,
            rootDir: true,
            RootDir: true,
            // `Props`/`props` is the universal React convention for a
            // component's props type (`ButtonProps`); do not expand it to
            // `Properties`. See fix-consumer-stack-defects (rule-policy-coherence).
            props: true,
            Props: true,
          },
        },
      ],
    },
  },
]);
