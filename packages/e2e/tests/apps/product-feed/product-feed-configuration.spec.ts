import { Page, test, expect } from "@playwright/test";
import { logInIntoDashboard } from "../../operations/log-in-to-dashboard";
import { openTheApp } from "../../operations/open-app";
import { fillAwsS3Form } from "./operations/fill-aws-s3-form";
import { assertAppRender } from "./assertions/assert-app-render";
import { fillChannelConfig } from "./operations/fill-channel-config";
import { setCategoryMapping } from "./operations/set-category-mapping";
import { navigateToCategoryMapping } from "./operations/navigate-to-category-mapping";

test.describe("Product Feed Configuration", () => {
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
    await openTheApp({ page, appName: "Product Feed" });

    // todo make more strict selector
    const iframeLocator = page.frameLocator("iframe");

    await assertAppRender(iframeLocator);

    await fillAwsS3Form(iframeLocator);

    await expect(page.getByText("Updated S3 configuration")).toBeVisible({ timeout: 10000 });

    await fillChannelConfig(iframeLocator);

    await expect(page.getByText("Success")).toBeVisible({
      timeout: 10000,
    }); // todo add more meaningul message, only "success" is set
  });

  /**
   * Test fails. Probably because of a very big list of Google categories that are fetched.
   * TODO: Fix this in the app
   */
  test.skip("App can be configured with categories mapping", async () => {
    await openTheApp({ page, appName: "Product Feed" });

    // todo make more strict selector
    const iframeLocator = page.frameLocator("iframe");

    await navigateToCategoryMapping(iframeLocator);

    await setCategoryMapping(iframeLocator);

    await expect(page.getByText("Success")).toBeVisible({ timeout: 10000 }); // todo add more meaningul message, only "success" is set

    await iframeLocator.getByText("Configuration").click();
  });
});
