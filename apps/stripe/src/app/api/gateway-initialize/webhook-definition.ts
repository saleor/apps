import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";

import { PaymentGatewayInitializeSessionDocument } from "@/generated/graphql";
import { saleorApp } from "@/lib/saleor-app";

export const paymentGatewayInitializeSessionWebhookDefinition = new SaleorSyncWebhook({
  apl: saleorApp.apl,
  event: "PAYMENT_GATEWAY_INITIALIZE_SESSION",
  name: "Stripe Payment Gateway Initialize",
  isActive: false,
  query: PaymentGatewayInitializeSessionDocument,
  webhookPath: "api/gateway-initialize",
});
