import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the onboarding-flipbook WASM sidecar.
 *
 * The static server serves the directory containing index.html and out/
 * (the compiled WASM + wasm-bindgen JS bindings).
 *
 * In CI, wasm-bindgen outputs to ./out/ before this config is used.
 * Locally: run `npm run serve` in a separate terminal, or let Playwright's
 * webServer option start one automatically.
 */
export default defineConfig({
  // Test files
  testDir: './e2e',
  testMatch: '**/*.spec.ts',

  // Each test file runs in isolation
  fullyParallel: false,

  // CI: fail fast on first error
  forbidOnly: !!process.env.CI,

  // Retry once in CI to handle flaky WASM boot timing
  retries: process.env.CI ? 1 : 0,

  // Single worker so we don't spin up multiple WASM instances
  workers: 1,

  reporter: process.env.CI ? 'github' : 'list',

  use: {
    // Base URL — Playwright webServer below starts `npx serve .` on port 3033
    baseURL: 'http://localhost:3033',

    // Capture trace on first retry for easier debugging
    trace: 'on-first-retry',

    // Generous viewport for 3D canvas
    viewport: { width: 900, height: 640 },

    // Headless in CI
    headless: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Spin up a static file server automatically when running tests locally
  webServer: {
    command: 'npx serve . --listen 3033',
    url: 'http://localhost:3033',
    reuseExistingServer: !process.env.CI,
    timeout: 20_000,
  },
});
