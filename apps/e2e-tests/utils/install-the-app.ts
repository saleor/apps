import { Page } from "@playwright/test";
import {  urls } from "../configuration";

interface InstallTheAppArgs {
  page: Page
}

export const installTheApp = async ({page}: InstallTheAppArgs) => {
// got to Apps page, assuming user is logged in
    await page.goto(urls.saleor.dashboard.apps, {timeout: 20000, waitUntil: "load"}); 

// Install the app via the manifest URL
  await page.locator('[data-test-id="add-app-from-manifest"]').click();
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').fill(urls.app.manifest);
  await page.locator('[data-test-id="install-app-from-manifest"]').click();
  await page.getByRole('button', { name: 'Install App' }).click();

  // wait for the toast
  await page.getByText('App installed').isVisible();

}
