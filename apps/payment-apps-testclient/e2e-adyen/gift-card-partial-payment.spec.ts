import { expect, test } from "@playwright/test";

import {
  completeCheckout,
  openAdyenDropin,
  payWithCreditCard,
  SALEOR_WEBHOOK_TIMEOUT,
  selectPaymentMethod,
} from "./checkout";
import { adyenE2eEnv } from "./env";

test("givex gift cards can be used for partial payments with credit card", async ({ page }) => {
  await openAdyenDropin(page, adyenE2eEnv.chargeChannelSlug);

  const givex = await selectPaymentMethod(page, "Givex");
  // Adyen renders the card number and the PIN in separate iframes.
  const fields = givex.frameLocator("iframe");

  await fields.nth(0).getByPlaceholder("1234 5678 9012 3456").fill("6036280000000000000");
  await fields.nth(1).getByPlaceholder("123").fill("1234");
  await givex.getByRole("button", { name: "Redeem" }).click();

  await expect(page.getByText(/Select another payment method to pay the remaining/)).toBeVisible({
    timeout: SALEOR_WEBHOOK_TIMEOUT / 2,
  });

  await payWithCreditCard({ page, number: "5577 0000 5577 0004", expiry: "03/30", cvc: "737" });

  await completeCheckout(page);
});
