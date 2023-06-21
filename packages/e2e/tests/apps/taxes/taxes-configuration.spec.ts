import { Page, test, expect } from "@playwright/test";
import { logInIntoDashboard } from "../../../operations/log-in-to-dashboard";
import { openTheApp } from "../../../operations/open-app";
import { assertAppRender } from "../../../apps/taxes/assertions/assert-app-render";

test.describe("Taxes", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    if (page) {
      return;
    }

    page = await browser.newPage();

    await logInIntoDashboard({ page });
  });

  // Test assumes app is installed
  test("App can be configured @stable @critical", async () => {
    await openTheApp({ page, appName: "Taxes" });

    // todo make more strict selector
    const iframeLocator = page.frameLocator("iframe");

    await assertAppRender(iframeLocator);
  });
});
