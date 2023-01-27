import { expect, test } from '@playwright/test';
import { appName, urls } from '../configuration';
import { checkIfAppIsAvailable } from '../utils/check-if-app-is-available';
import { installTheApp } from '../utils/install-the-app';
import { logInIntoDashboard } from '../utils/log-in-into-dashboard';
import { randomString } from '../utils/random-string';

test("The app can be installed", async ({page}) => {
  // TODO: add function to completely remove all the installed apps in the test env
  // alternative: make locators tighter to restrict it only to the tested app
  await logInIntoDashboard({page})
  await installTheApp({page})
  await checkIfAppIsAvailable({page})
})

test("Smoke test of the configuration", async ({page}) => {
  await logInIntoDashboard({page})

  // open app configuration view
  await page.goto(urls.saleor.dashboard.apps, {timeout: 20000, waitUntil: "load"}); 
  await page.getByText(appName).first().click()

  // generate unique marker to ensure values are updated during this test run
  const marker = randomString()

  // fill the configuration fields
  await page.frameLocator('iframe').locator('input[name="secretKey"]').click();
  await page.frameLocator('iframe').locator('input[name="secretKey"]').fill('secret-key-'+marker);
  await page.frameLocator('iframe').locator('input[name="searchKey"]').click();
  await page.frameLocator('iframe').locator('input[name="searchKey"]').fill('search-key-'+marker);
  await page.frameLocator('iframe').locator('input[name="appId"]').click();
  await page.frameLocator('iframe').locator('input[name="appId"]').fill('app-id-'+marker);
  await page.frameLocator('iframe').locator('input[name="indexNamePrefix"]').click();
  await page.frameLocator('iframe').locator('input[name="indexNamePrefix"]').fill('prefix-'+marker);

  // submit and wait for the confirmation toast
  await page.mouse.wheel(0, 20);  // TODO: investigate how to automatically scroll
  await page.frameLocator('iframe').getByRole('button', { name: 'Save' }).click();
  await page.getByText('Configuration saved!').isVisible();

  // check if the data persists
  await page.goto(urls.saleor.dashboard.apps, {timeout: 20000, waitUntil: "load"}); 
  await page.getByText(appName).first().click()

  // check if the form data loaded
  await page.frameLocator('iframe').getByRole('button', { name: 'Save' }).isEnabled();
  
  // check field values
  await expect(await page.frameLocator('iframe').locator('input[name="secretKey"]').inputValue()).toBe("secret-key-"+marker);
  await expect(await page.frameLocator('iframe').locator('input[name="searchKey"]').inputValue()).toBe("search-key-"+marker);
  await expect(await page.frameLocator('iframe').locator('input[name="appId"]').inputValue()).toBe("app-id-"+marker);
  await expect(await page.frameLocator('iframe').locator('input[name="indexNamePrefix"]').inputValue()).toBe("prefix-"+marker);
})
