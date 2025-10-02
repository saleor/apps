import { createManifestHandler } from "@saleor/app-sdk/handlers/next-app-router";
import { AppManifest } from "@saleor/app-sdk/types";
import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";

import { env } from "@/lib/env";
import { withLoggerContext } from "@/lib/logger-context";
import packageJson from "@/package.json";

import { paymentGatewayInitializeSessionWebhookDefinition } from "../webhooks/saleor/payment-gateway-initialize-session/webhook-definition";
import { transactionCancelationRequestedWebhookDefinition } from "../webhooks/saleor/transaction-cancelation-requested/webhook-definition";
import { transactionChargeRequestedWebhookDefinition } from "../webhooks/saleor/transaction-charge-requested/webhook-definition";
import { transactionInitializeSessionWebhookDefinition } from "../webhooks/saleor/transaction-initialize-session/webhook-definition";
import { transactionProcessSessionWebhookDefinition } from "../webhooks/saleor/transaction-process-session/webhook-definition";
import { transactionRefundRequestedWebhookDefinition } from "../webhooks/saleor/transaction-refund-requested/webhook-definition";

const handler = createManifestHandler({
  async manifestFactory({ appBaseUrl }) {
    const iframeBaseUrl = env.APP_IFRAME_BASE_URL ?? appBaseUrl;
    const apiBaseUrl = env.APP_API_BASE_URL ?? appBaseUrl;

    const manifest: AppManifest = {
      about:
        "App that allows merchants using the Saleor e-commerce platform to accept online payments from customers using PayPal as their payment processor.",
      appUrl: iframeBaseUrl,
      author: "Saleor Commerce",
      brand: {
        logo: {
          default: `${apiBaseUrl}/logo.png`,
        },
      },
      dataPrivacyUrl: "https://saleor.io/legal/privacy/",
      extensions: [],
      homepageUrl: "https://github.com/saleor/apps",
      id: env.MANIFEST_APP_ID,
      /**
       * Can set custom name, e.g. in Development to recognize the app
       */
      name: env.APP_NAME,
      permissions: ["HANDLE_PAYMENTS"],
      requiredSaleorVersion: ">=3.21 <4",
      supportUrl: "https://saleor.io/discord",
      tokenTargetUrl: `${apiBaseUrl}/api/register`,
      version: packageJson.version,
      webhooks: [
        paymentGatewayInitializeSessionWebhookDefinition.getWebhookManifest(apiBaseUrl),
        transactionInitializeSessionWebhookDefinition.getWebhookManifest(apiBaseUrl),
        transactionProcessSessionWebhookDefinition.getWebhookManifest(apiBaseUrl),
        transactionChargeRequestedWebhookDefinition.getWebhookManifest(apiBaseUrl),
        transactionCancelationRequestedWebhookDefinition.getWebhookManifest(apiBaseUrl),
        transactionRefundRequestedWebhookDefinition.getWebhookManifest(apiBaseUrl),
      ],
    };

    return manifest;
  },
});

export const GET = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);
