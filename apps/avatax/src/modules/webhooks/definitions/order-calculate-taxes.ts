import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";

import { UntypedCalculateTaxesDocument } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { CalculateTaxesPayload } from "../payloads/calculate-taxes-payload";

export const orderCalculateTaxesSyncWebhook = new SaleorSyncWebhook<CalculateTaxesPayload>({
  name: "OrderCalculateTaxes",
  apl: saleorApp.apl,
  event: "ORDER_CALCULATE_TAXES",
  query: UntypedCalculateTaxesDocument,
  webhookPath: "/api/webhooks/order-calculate-taxes",
});

export const orderCalculateTaxesSyncWebhookReponse =
  buildSyncWebhookResponsePayload<"ORDER_CALCULATE_TAXES">;
