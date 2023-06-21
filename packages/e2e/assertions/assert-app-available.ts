import { expect, Page } from "@playwright/test";
import { routing } from "../setup/routing";
import { configuration } from "../setup/configuration";

interface checkIfAppIsAvailableArgs {
  page: Page;
  appName: string;
}

export const checkIfAppIsAvailable = async ({ page, appName }: checkIfAppIsAvailableArgs) => {
  // got to Apps page, assuming user is logged in
  await page.goto(routing.saleor.dashboard.apps, { timeout: 20000, waitUntil: "load" });

  // look for a entry with name of our app
  await expect(await page.getByText(appName).first()).toBeVisible();

  // and confirm its installed
  await expect(await page.getByText("Problem occured during installation.")).toBeHidden();
};
