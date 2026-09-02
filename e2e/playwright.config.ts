import { defineConfig, devices } from '@playwright/test';

/**
 * E2E against the local stack (docker compose up). Mobile 390×844 is the primary viewport
 * (CLAUDE.md Category 6) plus desktop. BASE_URL overrides for staging runs.
 */
const baseURL = process.env.BASE_URL ?? 'http://localhost';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: 'html',
  use: { baseURL, trace: 'on-first-retry' },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
});
