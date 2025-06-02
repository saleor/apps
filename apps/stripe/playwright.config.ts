import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

import { defineConfig, devices } from "@playwright/test";

const envPath = ".env.test";

if (existsSync(envPath)) {
  // eslint-disable-next-line no-console
  console.log(`Loading environment variables from ${envPath}`);
  loadEnvFile(envPath);
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
