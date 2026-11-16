import { test } from "@playwright/test";

import {
  completeCheckout,
  handle3DSecureIframe,
  openAdyenDropin,
  payWithCreditCard,
} from "./checkout";
import { adyenE2eEnv } from "./env";

const flows = [
  { name: "Authorization", channelSlug: adyenE2eEnv.authorizationChannelSlug },
  { name: "Charge", channelSlug: adyenE2eEnv.chargeChannelSlug },
];

for (const { name, channelSlug } of flows) {
  test.describe(`${name} flow credit card payments`, () => {
    test.beforeEach(async ({ page }) => {
      await openAdyenDropin(page, channelSlug);
    });

    test("card with no 3ds has successful payment", async ({ page }) => {
      await payWithCreditCard({ page, number: "5577 0000 5577 0004", expiry: "03/30", cvc: "737" });

      await completeCheckout(page);
    });

    test("card with 3ds has successful payment", async ({ page }) => {
      test.slow();

      await payWithCreditCard({ page, number: "4917 6100 0000 0000", expiry: "03/30", cvc: "737" });
      await handle3DSecureIframe(page);

      await completeCheckout(page);
    });
  });
}
