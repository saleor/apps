import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/aws-lambda";

import {
  PaymentGatewayInitializeSessionDocument,
  PaymentGatewayInitializeSessionEventFragment,
} from "@/generated/graphql";
import { saleorApp } from "@/lib/saleor-app";

export const paymentGatewayInitializeSessionWebhookDefinition =
  new SaleorSyncWebhook<PaymentGatewayInitializeSessionEventFragment>({
    apl: saleorApp.apl,
    event: "PAYMENT_GATEWAY_INITIALIZE_SESSION",
    name: "Stripe Payment Gateway Initialize",
    isActive: true,
    query: PaymentGatewayInitializeSessionDocument,
    webhookPath: "api/webhooks/saleor/payment-gateway-initialize-session",
  });
