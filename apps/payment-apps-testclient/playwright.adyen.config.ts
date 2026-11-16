import { defineConfig, devices } from "@playwright/test";

import { adyenE2eEnv } from "./e2e-adyen/env";

/*
 * Pays through the real Adyen app installed on a staging Saleor environment, unlike
 * playwright.config.ts, which simulates Saleor. Adyen's test environment times out often,
 * hence the retries.
 */
export default defineConfig({
  testDir: "./e2e-adyen",
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  forbidOnly: Boolean(process.env.CI),
  retries: 3,
  // Saleor sync webhooks take up to 20s, and one payment can trigger several.
  timeout: 60_000,
  outputDir: "./test-results",
  reporter: process.env.CI
    ? [["github"], ["list"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    // The Adyen client key must allow this origin, and the old storefront e2e used it too.
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: process.env.CI ? "retain-on-failure" : "off",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm build && pnpm start --port 3001",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: {
      NEXT_PUBLIC_INITIAL_ENV_URL: adyenE2eEnv.saleorApiUrl,
      NEXT_PUBLIC_INITIAL_CHANNEL_SLUG: adyenE2eEnv.chargeChannelSlug,
      // The staging channels are PLN, so the checkout needs a Polish address.
      NEXT_PUBLIC_INITIAL_CHECKOUT_COUNTRY_CODE: "PL",
    },
  },
});
