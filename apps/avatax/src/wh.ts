import { SaleorSyncWebhook } from "../app-sdk-handlers/next/saleor-webhooks/saleor-sync-webhook";
import { CalculateTaxesPayload } from "@/modules/webhooks/payloads/calculate-taxes-payload";
import { saleorApp } from "../saleor-app";
import { UntypedCalculateTaxesDocument } from "../generated/graphql";

export const checkoutCalculateTaxesSyncWebhook2 = new SaleorSyncWebhook<CalculateTaxesPayload>({
  name: "CheckoutCalculateTaxes2",
  apl: saleorApp.apl,
  event: "CHECKOUT_CALCULATE_TAXES",
  query: UntypedCalculateTaxesDocument,
  webhookPath: "/webhooks/checkout-calculate-taxes-2",
});
