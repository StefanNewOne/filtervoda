import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/__tests__/**/*.test.ts', 'prisma/**/__tests__/**/*.test.ts'],
    environment: 'node',
    // Integration tests share one Docker Postgres — run files serially so their per-suite
    // table resets (outboxJob/lead/...) don't collide across parallel workers.
    fileParallelism: false,
    // bcrypt (cost 12) makes auth integration tests slow (5 sequential compares); the default
    // 5s timeout flakes under container load. Unit tests finish well within this.
    testTimeout: 20000,
    setupFiles: ['./vitest.setup.ts'],
    // Integration tests use a real Docker Postgres (no DB mocks — CLAUDE.md Category 6).
    // Set DATABASE_URL to the test database before running the integration suite.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: { lines: 70, functions: 70, branches: 60, statements: 70 },
    },
  },
});
