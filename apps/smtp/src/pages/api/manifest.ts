import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";

import packageJson from "../../../package.json";
import { giftCardSentWebhook } from "./webhooks/gift-card-sent";
import { invoiceSentWebhook } from "./webhooks/invoice-sent";
import { notifyWebhook } from "./webhooks/notify";
import { orderCancelledWebhook } from "./webhooks/order-cancelled";
import { orderConfirmedWebhook } from "./webhooks/order-confirmed";
import { orderFulfilledWebhook } from "./webhooks/order-fulfilled";
import { orderFullyPaidWebhook } from "./webhooks/order-fully-paid";
import { orderRefundedWebhook } from "./webhooks/order-refunded";

export default withSpanAttributes(
  createManifestHandler({
    async manifestFactory({ appBaseUrl }) {
      const iframeBaseUrl = process.env.APP_IFRAME_BASE_URL ?? appBaseUrl;
      const apiBaseURL = process.env.APP_API_BASE_URL ?? appBaseUrl;

      const manifest: AppManifest = {
        about:
          "SMTP App is a Saleor integration that allows you to send emails using your own SMTP server.",
        appUrl: iframeBaseUrl,
        author: "Saleor Commerce",
        brand: {
          logo: {
            default: `${apiBaseURL}/logo.png`,
          },
        },
        dataPrivacyUrl: "https://saleor.io/legal/privacy/",
        extensions: [
          /**
           * Optionally, extend Dashboard with custom UIs
           * https://docs.saleor.io/developer/extending/apps/extending-dashboard-with-apps
           */
        ],
        homepageUrl: "https://github.com/saleor/apps",
        id: "saleor.app.smtp",
        name: "SMTP",
        permissions: ["MANAGE_ORDERS", "MANAGE_USERS", "MANAGE_GIFT_CARD"],
        requiredSaleorVersion: ">=3.20 <4",
        supportUrl: "https://github.com/saleor/apps/discussions",
        tokenTargetUrl: `${apiBaseURL}/api/register`,
        version: packageJson.version,
        webhooks: [
          giftCardSentWebhook,
          invoiceSentWebhook,
          orderCancelledWebhook,
          orderConfirmedWebhook,
          orderFulfilledWebhook,
          orderFullyPaidWebhook,
          orderRefundedWebhook,
          /**
           * Legacy webhook with e.g. customer-related events. Should be replaced with modern webhooks.
           */
          notifyWebhook,
        ].map((w) => w.getWebhookManifest(apiBaseURL)),
      };

      return manifest;
    },
  }),
);
