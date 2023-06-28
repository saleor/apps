import { Page, test, expect } from "@playwright/test";
import { logInIntoDashboard } from "../../operations/log-in-to-dashboard";
import { openTheApp } from "../../operations/open-app";

test.describe("Klaviyo Configuration", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    if (page) {
      return;
    }

    console.log("beforeAll run");

    page = await browser.newPage();

    await logInIntoDashboard({ page });
  });

  // Test assumes app is installed
  test("App can be configured @stable @critical", async () => {
    await openTheApp({ page, appName: "Klaviyo" });

    // todo make more strict selector
    const iframeLocator = page.frameLocator("iframe");

    await expect(iframeLocator.getByLabel("CUSTOMER_CREATED_METRIC")).toBeVisible();
    await expect(iframeLocator.getByLabel("FULFILLMENT_CREATED_METRIC")).toBeVisible();
    await expect(iframeLocator.getByLabel("ORDER_CREATED_METRIC")).toBeVisible();
    await expect(iframeLocator.getByLabel("ORDER_FULLY_PAID_METRIC")).toBeVisible();
    await expect(iframeLocator.getByLabel("PUBLIC_TOKEN")).toBeVisible();
  });
});
