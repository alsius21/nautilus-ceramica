import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const host = process.env.E2E_HOST ?? '127.0.0.1';
const port = Number(process.env.E2E_PORT ?? 4173);
const basePath = '/nautilus-ceramica';
const externalBaseUrl = process.env.E2E_BASE_URL?.replace(/\/$/, '');
const origin = externalBaseUrl ?? `http://${host}:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL: origin,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
      },
    },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: externalBaseUrl
    ? undefined
    : {
        command: `pnpm preview --host ${host} --port ${port} --strictPort`,
        cwd: path.resolve(import.meta.dirname),
        url: `${origin}${basePath}/`,
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
      },
});
