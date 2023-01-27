import { Page, expect } from "@playwright/test";
import { dashboardUserEmail, dashboardUserPassword, urls } from "../configuration";

interface LogInIntoDashboardArgs {
  page: Page
}

export const logInIntoDashboard = async ({page}: LogInIntoDashboardArgs) => {
  await page.goto(urls.saleor.dashboard.homepage, {timeout: 20000, waitUntil: "load"}); 
  await page.locator('[data-test-id="email"]').click();
  await page.locator('[data-test-id="email"]').fill(dashboardUserEmail);
  await page.locator('[data-test-id="email"]').press('Tab');
  await page.locator('[data-test-id="password"]').fill(dashboardUserPassword);
  await page.locator('[data-test-id="submit"]').click();  

  await expect(page.locator('[data-test-id="welcome-header"]')).toBeVisible()
}

export default logInIntoDashboard
