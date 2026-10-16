import { defineConfig } from 'vitest/config';

// Root-level suites only. Each package runs its own `bun test` through
// `turbo run test`; `bun run test` runs that first and then this config,
// the same split MathTS uses.
export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['tests/**/*.test.ts'],
    // Vitest's default `forks` pool cannot start under Bun on Windows.
    ...(process.versions.bun && process.platform === 'win32' ? { pool: 'threads' as const } : {}),
  },
});
