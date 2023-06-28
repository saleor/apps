import { Page, test, expect } from "@playwright/test";
import { logInIntoDashboard } from "../../operations/log-in-to-dashboard";
import { openTheApp } from "../../operations/open-app";
import { assertAppRender } from "./assertions/assert-app-render";

// Test assumes app is installed
test.describe("Taxes Configuration", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    if (page) {
      return;
    }

    page = await browser.newPage();

    await logInIntoDashboard({ page });
  });

  test("App renders config screen @stable @critical", async () => {
    await openTheApp({ page, appName: "Taxes" });

    // todo make more strict selector
    const iframeLocator = page.frameLocator("iframe");

    await assertAppRender(iframeLocator);
  });

  test("App can configure new Taxjar provider @taxjar", async () => {
    await openTheApp({ page, appName: "Taxes" });

    // todo make more strict selector
    const iframeLocator = page.frameLocator("iframe");

    await iframeLocator
      .getByRole("button", {
        name: new RegExp(/Add new|Add first provider/),
      })
      .click();

    await iframeLocator.getByRole("button", { name: "Choose" }).first().click(); // todo - test id

    await iframeLocator.getByLabel("Configuration name").fill("Test Taxjar provider");
    await iframeLocator.getByLabel("API key").fill("TEST");
    await iframeLocator.getByLabel("Street").fill("Street");
    await iframeLocator.getByLabel("City").fill("City");
    await iframeLocator.getByLabel("State").fill("State");
    await iframeLocator.getByRole("combobox", { name: "Country *" }).click();
    await iframeLocator.getByText("Albania").click();
    await iframeLocator.getByLabel("Zip").fill("Zip");

    await iframeLocator.getByRole("button", { name: "Save" }).first().click(); // todo - test id
  });

  // todo
  test.skip("App can configure new Avalara provider @avalara", async () => {});
});
