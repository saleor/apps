import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";

import { PaymentGatewayInitializeSessionDocument } from "@/generated/graphql";
import { saleorApp } from "@/lib/saleor-app";

export const paymentGatewayInitializeSessionWebhookDefinition = new SaleorSyncWebhook({
  apl: saleorApp.apl,
  event: "PAYMENT_GATEWAY_INITIALIZE_SESSION",
  // todo will Stripe Checkout be the same? Maybe it can be the same webhook for initialize?
  name: "Payment Intent Gateway Initialize",
  isActive: false,
  query: PaymentGatewayInitializeSessionDocument,
  webhookPath: "api/pi/gateway-initialize",
});
