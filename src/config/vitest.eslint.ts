import { defineConfig } from 'eslint/config';

import vitestEslint from './vitest/vitest.eslint.js';

export default defineConfig([...vitestEslint]);
