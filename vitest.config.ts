import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.mjs'],
    // ESLint runs (type-aware linting) can take a moment to warm up.
    testTimeout: 30_000,
    hookTimeout: 30_000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // Declarative rule modules (config/) and pure helpers are validated via
      // composition/integration, not line coverage.
      exclude: ['src/config/**', 'src/core/logger.ts', 'src/core/tsconfig-utils.ts', 'src/types/**'],
    },
  },
});
