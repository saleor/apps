import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  // The simulated service shares attempt state and a fixed port across scenarios.
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  outputDir: "./test-results",
  reporter: process.env.CI
    ? [["github"], ["list"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4318",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm build && pnpm start --hostname 127.0.0.1 --port 4318",
    url: "http://127.0.0.1:4318",
    reuseExistingServer: false,
    timeout: 300_000,
    env: {
      NEXT_PUBLIC_INITIAL_CHANNEL_SLUG: "default-channel",
      SALEOR_APP_ID: "browser-terminal-app",
      TERMINAL_APP_URL: "http://localhost:4319",
      INTEGRATION_JWT_ISSUER: "terminal-browser-poc",
      INTEGRATION_JWT_SHARED_SECRET: "terminal-browser-poc-secret-for-local-tests-only",
    },
  },
});
