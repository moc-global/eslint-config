import { defineConfig } from 'eslint/config';
import sonarjs from 'eslint-plugin-sonarjs';

/**
 * @description ESLint config for SonarJS code quality and security rules.
 * @author Dmytro Vakulenko
 * @see https://github.com/SonarSource/eslint-plugin-sonarjs
 */
export default defineConfig([
  {
    name: 'sonar-recommended',
    ...sonarjs.configs.recommended,
  },
  {
    name: 'sonar-custom',
    rules: {
      // Single owner per concern (see fix-consumer-stack-defects):
      //  - super-linear regexes are owned by `regexp/no-super-linear-backtracking`
      //  - deprecated-symbol usage is owned by `@typescript-eslint/no-deprecated`
      // Disable the SonarJS duplicates so one issue isn't reported twice.
      'sonarjs/deprecation': 'off',
      'sonarjs/slow-regex': 'off',
      'sonarjs/function-return-type': 'warn',
      'sonarjs/no-commented-code': 'off',
      'sonarjs/no-selector-parameter': 'off',
      'sonarjs/redundant-type-aliases': 'off',
      'sonarjs/todo-tag': 'warn',
    },
  },
]);
