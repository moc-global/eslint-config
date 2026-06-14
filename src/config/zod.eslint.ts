import { defineConfig } from 'eslint/config';

import importZodEslint from './zod/import-zod.eslint.js';
import zodXEslint from './zod/zod.eslint.js';

export default defineConfig([...importZodEslint, ...zodXEslint]);
