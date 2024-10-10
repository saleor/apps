import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";

import { CalculateTaxesSubscription } from "../../../../graphql/subscriptions/CalculateTaxes";
import { saleorApp } from "../../../../saleor-app";
import { CalculateTaxesPayload } from "../payloads/calculate-taxes-payload";

export const checkoutCalculateTaxesSyncWebhook = new SaleorSyncWebhook<CalculateTaxesPayload>({
  name: "CheckoutCalculateTaxes",
  apl: saleorApp.apl,
  event: "CHECKOUT_CALCULATE_TAXES",
  query: CalculateTaxesSubscription,
  webhookPath: "/api/webhooks/checkout-calculate-taxes",
});
