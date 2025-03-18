import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";

import { UntypedCalculateTaxesDocument } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { CalculateTaxesPayload } from "../payloads/calculate-taxes-payload";

export const checkoutCalculateTaxesSyncWebhook = new SaleorSyncWebhook<CalculateTaxesPayload>({
  name: "CheckoutCalculateTaxes",
  apl: saleorApp.apl,
  event: "CHECKOUT_CALCULATE_TAXES",
  query: UntypedCalculateTaxesDocument,
  webhookPath: "/api/webhooks/checkout-calculate-taxes",
});

export const checkoutCalculateTaxesSyncWebhookReponse =
  buildSyncWebhookResponsePayload<"CHECKOUT_CALCULATE_TAXES">;
