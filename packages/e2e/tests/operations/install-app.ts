import { Page } from "@playwright/test";
import { routing } from "../../setup/routing";

interface InstallTheAppArgs {
  page: Page;
  appManifest: string;
}

export const installTheApp = async ({ page, appManifest }: InstallTheAppArgs) => {
  // got to Apps page, assuming user is logged in
  await page.goto(routing.saleor.dashboard.appInstallPage(appManifest), {
    timeout: 20000,
    waitUntil: "load",
  });

  console.log("Navigated to", page.url());

  await page.getByRole("button", { name: "Install App" }).click();

  // wait for the toast
  await page.getByText("App installed").isVisible();
};
