import { Page } from "@playwright/test";
import { routing } from "../setup/routing";

interface InstallTheAppArgs {
  page: Page;
  appManifest: string;
}

export const installTheApp = async ({ page, appManifest }: InstallTheAppArgs) => {
  // got to Apps page, assuming user is logged in
  await page.goto(routing.saleor.dashboard.apps, { timeout: 20000, waitUntil: "load" });

  // Install the app via the manifest URL
  await page.locator('[data-test-id="add-app-from-manifest"]').click();
  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill(appManifest);
  await page.locator('[data-test-id="install-app-from-manifest"]').click();
  await page.getByRole("button", { name: "Install App" }).click();

  // wait for the toast
  await page.getByText("App installed").isVisible();
};
