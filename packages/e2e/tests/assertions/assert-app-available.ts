import { expect, Page } from "@playwright/test";
import { routing } from "../../setup/routing";
import { configuration } from "../../setup/configuration";

interface checkIfAppIsAvailableArgs {
  page: Page;
  appName: string;
}

export const assertAppAvailable = async ({ page, appName }: checkIfAppIsAvailableArgs) => {
  await page.goto(routing.saleor.dashboard.apps, { timeout: 20000, waitUntil: "load" });

  // todo need data-testid. this element is not unique
  const appEntry = await page.getByText(appName).first();

  await expect(appEntry).toBeVisible();

  await expect(await page.getByText("Problem occured during installation.")).toBeHidden();
};
