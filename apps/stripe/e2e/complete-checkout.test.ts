import { expect, test } from "@playwright/test";

import { SaleorApi } from "./api/saleor-api";
import { env } from "./env";
import { StripeCheckoutFormPage } from "./pages/stripe-checkout-form-page";
import { SummaryPage } from "./pages/summary-page";

test("Complete checkout with transactionFlowStrategy: charge", async ({ request, page }) => {
  const saleorApi = new SaleorApi(request);
  const stripeCheckoutFormPage = new StripeCheckoutFormPage(page);
  const summaryPage = new SummaryPage(page);

  const checkoutId = await saleorApi.createCheckout({
    channelSlug: env.E2E_CHARGE_CHANNEL_SLUG,
  });

  await stripeCheckoutFormPage.goto({ checkoutId });
  await stripeCheckoutFormPage.fillPaymentInformation();
  await stripeCheckoutFormPage.pay();

  await summaryPage.processSession();
  await expect(summaryPage.successToast).toBeVisible();

  const order = await saleorApi.completeCheckout({
    checkoutId,
  });

  expect(order.id, "order.id").toBeDefined();
  expect(order.status, "order.status").toBe("UNFULFILLED");
  expect(order.chargeStatus, "order.chargeStatus").toBe("FULL");
  expect(order.paymentStatus, "order.paymentStatus").toBe("FULLY_CHARGED");
  expect(order.authorizeStatus, "order.authorizeStatus").toBe("FULL");
});

// baseUrl is set here so t3-oss/env-nextjs can be used in the test
test.use({ baseURL: env.E2E_BASE_URL });

test("Complete checkout with transactionFlowStrategy: authorize", async ({ request, page }) => {
  const saleorApi = new SaleorApi(request);
  const stripeCheckoutFormPage = new StripeCheckoutFormPage(page);
  const summaryPage = new SummaryPage(page);

  const checkoutId = await saleorApi.createCheckout({
    channelSlug: env.E2E_AUTHORIZATION_CHANNEL_SLUG,
  });

  await stripeCheckoutFormPage.goto({ checkoutId });
  await stripeCheckoutFormPage.fillPaymentInformation();
  await stripeCheckoutFormPage.pay();

  await summaryPage.processSession();
  await expect(summaryPage.successToast).toBeVisible();

  const order = await saleorApi.completeCheckout({
    checkoutId,
  });

  expect(order.id, "order.id").toBeDefined();
  expect(order.status, "order.status").toBe("UNFULFILLED");
  expect(order.chargeStatus, "order.chargeStatus").toBe("NONE");
  expect(order.paymentStatus, "order.paymentStatus").toBe("NOT_CHARGED");
  expect(order.authorizeStatus, "order.authorizeStatus").toBe("FULL");
});
