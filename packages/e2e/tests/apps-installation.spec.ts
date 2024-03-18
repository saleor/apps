import { Page, test } from "@playwright/test";
import { AppManifest } from "@saleor/app-sdk/types";
import { assertAppAvailable } from "./assertions/assert-app-available";
import { installTheApp } from "./operations/install-app";
import { logInIntoDashboard } from "./operations/log-in-to-dashboard";

/**
 * Hardcoded list of every app deployed on staging and production.
 * TODO: Eventually this should be the entry point and the list should be provided via env
 */
const apps: string[] = [
  "taxes",
  "crm",
  "cms",
  "emails-and-messages",
  "product-feed",
  "search",
  "klaviyo",
  "slack",
  "invoices",
  "data-importer",
].reduce<Array<string>>((urls, appSegment) => {
  urls.push(`https://${appSegment}.saleor.app`);
  urls.push(`https://${appSegment}.staging.saleor.app`);

  return urls;
}, []);
/*
 *
 * test.describe.configure({
 *   mode: "parallel",
 * });
 */

/**
 * TODO Enable parallel mode. It cant work with beforeAll.
 */
test.describe("Apps Installation", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    if (page) {
      return;
    }

    console.log("beforeAll run");

    page = await browser.newPage();

    await logInIntoDashboard({ page });
  });

  for (const appUrl of apps) {
    test(`App: "${appUrl}" can be installed in the dashboard`, async () => {
      const appManifestUrl = appUrl + "/api/manifest";

      await installTheApp({ page, appManifest: appManifestUrl }); // todo extract to helper

      const appManifest = (await fetch(appManifestUrl).then((r) => r.json())) as AppManifest;
      const appName = appManifest.name;

      await assertAppAvailable({ page, appName });
    });
  }
});
