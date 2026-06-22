import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";

import {
  PaymentGatewayInitializeSessionDocument,
  type PaymentGatewayInitializeSessionEventFragment,
} from "@/generated/graphql";
import { loggerContext } from "@/logger-context";
import { saleorApp } from "@/saleor-app";

export const paymentGatewayInitializeSessionWebhook =
  new SaleorSyncWebhook<PaymentGatewayInitializeSessionEventFragment>({
    name: "Payment Gateway Initialize Session",
    webhookPath: "api/webhooks/payment-gateway-initialize-session",
    event: "PAYMENT_GATEWAY_INITIALIZE_SESSION",
    apl: saleorApp.apl,
    query: PaymentGatewayInitializeSessionDocument,
  });

export default wrapWithLoggerContext(
  withSpanAttributes(
    paymentGatewayInitializeSessionWebhook.createHandler((_req, res, _ctx) => {
      return res.status(200).json({
        data: {
          ok: true,
        },
      });
    }),
  ),
  loggerContext,
);

/**
 * Disable body parser for this endpoint, so signature can be verified
 */
export const config = {
  api: {
    bodyParser: false,
  },
};
