import { Page, expect } from "@playwright/test";
import { routing } from "../../setup/routing";

interface InstallTheAppArgs {
  page: Page;
  appName: string;
}

export const openTheApp = async ({ page, appName }: InstallTheAppArgs) => {
  // got to Apps page, assuming user is logged in
  await page.goto(routing.saleor.dashboard.apps, {
    waitUntil: "load",
  });

  console.log("Navigated to", page.url());

  // todo it must be test-id because we also have same name in appstore list
  await page.getByText(appName).first().click();

  await expect(page.url()).toMatch(new RegExp("https:\\/\\/.*\\/dashboard\\/apps\\/.*\\/app"));
};
