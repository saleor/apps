import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

import { defineConfig, devices } from "@playwright/test";
import { env } from "e2e/env";

const envPath = ".env.test";

if (existsSync(envPath)) {
  // eslint-disable-next-line no-console
  console.log(`Loading environment variables from ${envPath}`);
  loadEnvFile(envPath);
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!env.CI,
  retries: env.CI ? 2 : 0,
  workers: env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    baseURL: env.E2E_BASE_URL,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
