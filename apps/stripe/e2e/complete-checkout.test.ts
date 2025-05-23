import { expect, test } from "@playwright/test";

import {
  CheckoutCompleteDocument,
  CheckoutCreateDocument,
  CheckoutDeliveryMethodUpdateDocument,
} from "./generated/graphql";
import { callSaleorGraphqlApi } from "./helpers";

const apiUrl = "https://ext-team-latest-e2e.staging.saleor.cloud/graphql/";

test("Complete checkout with charge", async ({ request, page }) => {
  const createCheckoutResponse = await callSaleorGraphqlApi(request, CheckoutCreateDocument, {
    channelSlug: "pln-charge",
    variantId: "UHJvZHVjdFZhcmlhbnQ6MzQ2",
    email: "e2e-test@saleor.io",
  });

  const checkoutId = createCheckoutResponse.data.checkoutCreate?.checkout?.id;

  expect(checkoutId).toBeDefined();

  const deliveryMethodId =
    createCheckoutResponse.data.checkoutCreate?.checkout?.shippingMethods[0].id;

  expect(deliveryMethodId).toBeDefined();

  await callSaleorGraphqlApi(request, CheckoutDeliveryMethodUpdateDocument, {
    checkoutId: checkoutId!,
    deliveryMethodId: deliveryMethodId!,
  });

  const encodedGraphqlUrl = encodeURIComponent(apiUrl);
  const gateway = "stripe";
  const appId = "saleor.app.payment.stripe-v2";

  const path = `/env/${encodedGraphqlUrl}/checkout/${checkoutId}/payment-gateway/${gateway}/${appId}`;

  await page.goto(path);

  const cardNumberInput = page
    .frameLocator('[title="Secure payment input frame"]')
    .locator('input[name="number"]');

  await cardNumberInput.click();
  await cardNumberInput.fill("4242424242424242");

  const cardExpiryInput = page
    .frameLocator('[title="Secure payment input frame"]')
    .locator('input[name="expiry"]');

  await cardExpiryInput.click();
  await cardExpiryInput.fill("01/50");

  const cardCvcInput = page
    .frameLocator('[title="Secure payment input frame"]')
    .locator('input[name="cvc"]');

  await cardCvcInput.click();
  await cardCvcInput.fill("123");

  await page.getByTestId("button-pay").click();

  await page.getByTestId("button-force-process-session").click();

  await page.waitForTimeout(1_000);

  const checkoutComplete = await callSaleorGraphqlApi(request, CheckoutCompleteDocument, {
    checkoutId: checkoutId!,
  });

  expect(checkoutComplete.data.checkoutComplete?.order?.id).toBeDefined();
  expect(checkoutComplete.data.checkoutComplete?.order?.status).toBe("UNFULFILLED");
  expect(checkoutComplete.data.checkoutComplete?.order?.chargeStatus).toBe("FULL");
  expect(checkoutComplete.data.checkoutComplete?.order?.paymentStatus).toBe("FULLY_CHARGED");
  expect(checkoutComplete.data.checkoutComplete?.order?.authorizeStatus).toBe("FULL");
});
