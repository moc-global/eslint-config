import { defineConfig } from 'eslint/config';
import pluginSecurity from 'eslint-plugin-security';

/**
 * @description ESLint config for Node.js security rules via eslint-plugin-security.
 * @author Dmytro Vakulenko
 * @see https://github.com/nodesecurity/eslint-plugin-security
 */
export default defineConfig([
  {
    name: 'security',
    ...pluginSecurity.configs.recommended,
  },
  {
    name: 'security-custom',
    rules: {
      // `detect-object-injection` is a warning-level, heuristic rule that fires
      // on safe, type-checked patterns (indexing a `Record<Union, T>` with a key
      // of that union, `process.env[name]`, `obj[level]`). With TypeScript the
      // signal-to-noise is poor, so it is disabled. See fix-consumer-stack-defects.
      'security/detect-object-injection': 'off',
    },
  },
]);
