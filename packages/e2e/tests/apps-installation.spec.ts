import { test, expect } from "@playwright/test";
import { logInIntoDashboard } from "../operations/log-in-to-dashboard";
import { installTheApp } from "../operations/install-app";
import { appUrls, routing } from "../setup/routing";
import { AppManifest } from "@saleor/app-sdk/types";
import { checkIfAppIsAvailable } from "../assertions/assert-app-available";

// target every app including staging. This should be config from the outside
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
].reduce((urls, appSegment) => {
  urls.push(`https://${appSegment}.saleor.app`);
  urls.push(`https://${appSegment}.staging.saleor.app`);

  return urls;
}, []);

test.describe("Apps Installation", () => {
  test.beforeAll(({ page }) => {
    logInIntoDashboard({ page });
  });

  apps.forEach((appUrl) => {
    test(`App: "${appUrl}" can be installed in the dashboard`, async ({ page }) => {
      const appManifestUrl = appUrl + "/api/manifest";

      installTheApp({ page, appManifest: appManifestUrl }); // todo extract to helper

      const appManifest = (await fetch(appManifestUrl).then((r) => r.json())) as AppManifest;
      const appName = appManifest.name;

      await checkIfAppIsAvailable({ page, appName });
    });
  });
});
