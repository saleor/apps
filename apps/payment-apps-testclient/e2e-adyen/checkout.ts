import { expect, type Page } from "@playwright/test";

import { adyenE2eEnv } from "./env";

// Max timeout for Saleor sync webhooks
export const SALEOR_WEBHOOK_TIMEOUT = 20_000;

// Each toast title is also announced in a live region, so match the visible title only.
const toast = (page: Page, title: string) =>
  page.getByTestId("toast-title").filter({ hasText: title });

const wait = (time = 1000) => new Promise((resolve) => setTimeout(resolve, time));

/*
 * Creates a checkout for the channel's first product, saves the default addresses and a
 * delivery method, and opens the Adyen drop-in.
 */
export async function openAdyenDropin(page: Page, channelSlug: string) {
  await page.goto("/");
  await page.getByLabel("Environment URL (ending with /graphql/)").fill(adyenE2eEnv.saleorApiUrl);
  await page.getByLabel("Channel slug").fill(channelSlug);
  await page.getByRole("button", { name: "Fetch products" }).click();
  await page.getByRole("button", { name: "Create checkout" }).click();
  await expect(page.getByText("Billing Information")).toBeVisible({
    timeout: SALEOR_WEBHOOK_TIMEOUT,
  });

  await page.getByRole("button", { name: "Save billing address" }).click();
  await expect(toast(page, "Successfully updated billing address")).toBeVisible();
  await page.getByRole("button", { name: "Save shipping address" }).click();
  await expect(toast(page, "Successfully updated shipping address")).toBeVisible();

  /*
   * The staging products need shipping, and the delivery method form renders only once the
   * page is reloaded with the shipping address saved.
   */
  await page.reload();
  const deliveryMethod = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "Delivery Method Information" }) });

  await deliveryMethod.getByRole("combobox").click();
  await page.getByRole("option").first().click();
  await deliveryMethod.getByRole("button", { name: "Submit" }).click();
  // Saving the delivery method redirects to the gateway selection instead of showing a toast.
  await page.waitForURL(/\/payment-gateway$/);

  await page.goto(`${page.url()}/${encodeURIComponent(adyenE2eEnv.appId)}`);
}

// The drop-in lists each payment method as an item holding its radio and, once selected, its form.
export const selectPaymentMethod = async (page: Page, name: string) => {
  await page.getByRole("radio", { name }).click();

  return page.getByRole("listitem").filter({ has: page.getByRole("radio", { name }) });
};

export async function payWithCreditCard({
  page,
  number,
  expiry,
  cvc,
}: {
  page: Page;
  number: string;
  expiry: string;
  cvc: string;
}) {
  const card = await selectPaymentMethod(page, "Credit Card");
  // Adyen renders each field in its own iframe: card number, expiry date, security code.
  const fields = card.frameLocator("iframe");

  await fields.nth(0).getByRole("textbox", { name: "Card number" }).fill(number);
  await fields.nth(1).getByRole("textbox", { name: "Expiry date" }).fill(expiry);
  await fields.nth(2).getByRole("textbox", { name: "Security code" }).fill(cvc);

  // Sometimes the drop-in needs a moment to validate the form
  await wait();

  await card.getByRole("button", { name: /Pay/ }).click();
}

export async function handle3DSecureIframe(page: Page) {
  const challenge = page.frameLocator('iframe[name="threeDSIframe"]');

  await challenge.getByPlaceholder("enter the word 'password'").fill("password");
  await challenge.getByRole("button", { name: "OK" }).click();
}

/*
 * The drop-in redirects to the summary only after the Adyen app reports a successful
 * transaction, and Saleor completes the checkout only when payments cover its total.
 */
export async function completeCheckout(page: Page) {
  await page.waitForURL(/\/summary$/, { timeout: SALEOR_WEBHOOK_TIMEOUT * 2 });
  await page.getByRole("button", { name: "Complete checkout" }).click();
  await expect(toast(page, "Successfully completed checkout")).toBeVisible({
    timeout: SALEOR_WEBHOOK_TIMEOUT,
  });
}
