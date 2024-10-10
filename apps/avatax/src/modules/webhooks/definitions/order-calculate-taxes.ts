import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";

import { CalculateTaxesSubscription } from "../../../../graphql/subscriptions/CalculateTaxes";
import { saleorApp } from "../../../../saleor-app";
import { CalculateTaxesPayload } from "../payloads/calculate-taxes-payload";

export const orderCalculateTaxesSyncWebhook = new SaleorSyncWebhook<CalculateTaxesPayload>({
  name: "OrderCalculateTaxes",
  apl: saleorApp.apl,
  event: "ORDER_CALCULATE_TAXES",
  query: CalculateTaxesSubscription,
  webhookPath: "/api/webhooks/order-calculate-taxes",
});
