import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/__tests__/**/*.test.ts'],
    environment: 'node',
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
