import { defineConfig } from 'eslint/config';

import betterTailwindcssEslint from './tailwindcss/better-tailwindcss.eslint.js';

export default defineConfig([...betterTailwindcssEslint]);
