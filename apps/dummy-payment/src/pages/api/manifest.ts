import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { paymentGatewayInitializeSessionWebhook } from "./webhooks/payment-gateway-initialize-session";
import { transactionInitializeSessionWebhook } from "./webhooks/transaction-initialize-session";
import { transactionProcessSessionWebhook } from "./webhooks/transaction-process-session";
import { transactionRefundRequestedWebhook } from "./webhooks/transaction-refund-requested";
import { transactionChargeRequestedWebhook } from "./webhooks/transaction-charge-requested";
import { transactionCancelationRequestedWebhook } from "./webhooks/transaction-cancel-requested";
import { wrapWithLoggerContext } from "@/lib/logger/logger-context";
import { withOtel } from "@/lib/otel/otel-wrapper";
import { loggerContext } from "@/logger-context";

/**
 * App SDK helps with the valid Saleor App Manifest creation. Read more:
 * https://github.com/saleor/saleor-app-sdk/blob/main/docs/api-handlers.md#manifest-handler-factory
 */
export default wrapWithLoggerContext(
  withOtel(
    createManifestHandler({
      async manifestFactory({ appBaseUrl, request }) {
        /**
         * Allow to overwrite default app base url, to enable Docker support.
         *
         * See docs: https://docs.saleor.io/docs/3.x/developer/extending/apps/local-app-development
         */
        const iframeBaseUrl = process.env.APP_IFRAME_BASE_URL ?? appBaseUrl;
        const apiBaseURL = process.env.APP_API_BASE_URL ?? appBaseUrl;

        const manifest: AppManifest = {
          name: "Dummy Payment App",
          tokenTargetUrl: `${apiBaseURL}/api/register`,
          appUrl: iframeBaseUrl,
          /**
           * Set permissions for app if needed
           * https://docs.saleor.io/docs/3.x/developer/permissions
           */
          permissions: [
            /**
             * Add permission to allow "ORDER_CREATED" webhook registration.
             *
             * This can be removed
             */
            "MANAGE_CHECKOUTS",
            "HANDLE_PAYMENTS",
            "MANAGE_ORDERS",
          ],
          id: "saleor.io.dummy-payment-app",
          version: packageJson.version,
          /**
           * Configure webhooks here. They will be created in Saleor during installation
           * Read more
           * https://docs.saleor.io/docs/3.x/developer/api-reference/webhooks/objects/webhook
           *
           * Easiest way to create webhook is to use app-sdk
           * https://github.com/saleor/saleor-app-sdk/blob/main/docs/saleor-webhook.md
           */
          webhooks: [
            paymentGatewayInitializeSessionWebhook.getWebhookManifest(apiBaseURL),
            transactionInitializeSessionWebhook.getWebhookManifest(apiBaseURL),
            transactionProcessSessionWebhook.getWebhookManifest(apiBaseURL),
            transactionRefundRequestedWebhook.getWebhookManifest(apiBaseURL),
            transactionChargeRequestedWebhook.getWebhookManifest(apiBaseURL),
            transactionCancelationRequestedWebhook.getWebhookManifest(apiBaseURL),
          ],
          /**
           * Optionally, extend Dashboard with custom UIs
           * https://docs.saleor.io/docs/3.x/developer/extending/apps/extending-dashboard-with-apps
           */
          extensions: [],
          author: "Saleor Commerce",
          brand: {
            logo: {
              default: `${apiBaseURL}/logo.png`,
            },
          },
        };

        return manifest;
      },
    }),
    "/api/manifest"
  ),
  loggerContext
);
