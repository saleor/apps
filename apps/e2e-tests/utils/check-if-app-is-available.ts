import { expect, Page } from "@playwright/test";
import {  appName, urls } from "../configuration";

interface checkIfAppIsAvailableArgs {
  page: Page
}

export const checkIfAppIsAvailable = async ({page}: checkIfAppIsAvailableArgs) => {
// got to Apps page, assuming user is logged in
    await page.goto(urls.saleor.dashboard.apps, {timeout: 20000, waitUntil: "load"}); 

    // look for a entry with name of our app
    await expect(await page.getByText(appName).first()).toBeVisible()

    // and confirm its installed
    await expect(await page.getByText('Problem occured during installation.')).toBeHidden()
}
