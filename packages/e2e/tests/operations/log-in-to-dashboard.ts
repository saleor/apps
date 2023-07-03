import { Page, expect } from "@playwright/test";
import { configuration } from "../../setup/configuration";
import { routing } from "../../setup/routing";

interface LogInIntoDashboardArgs {
  page: Page;
}

export const logInIntoDashboard = async ({ page }: LogInIntoDashboardArgs) => {
  console.log("Will redirect to", routing.saleor.dashboard.homepage);

  await page.goto(routing.saleor.dashboard.homepage, { timeout: 20000, waitUntil: "load" });

  const url = page.url();

  await page.locator('[data-test-id="email"]').click();
  await page.locator('[data-test-id="email"]').fill(configuration.dashboardUserEmail);
  await page.locator('[data-test-id="email"]').press("Tab");
  await page.locator('[data-test-id="password"]').fill(configuration.dashboardUserPassword);
  await page.locator('[data-test-id="submit"]').click();

  await expect(page.locator('[data-test-id="welcome-header"]')).toBeVisible();

  console.log("Logged in");
};
