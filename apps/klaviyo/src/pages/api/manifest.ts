import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";
import { withOtel } from "@saleor/apps-otel";

import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import pkg from "../../../package.json";
import { createLogger } from "../../logger";
import { loggerContext } from "../../logger-context";
import { customerCreatedWebhook } from "./webhooks/customer-created";
import { fulfillmentCreatedWebhook } from "./webhooks/fulfillment-created";
import { orderCreatedWebhook } from "./webhooks/order-created";
import { orderFullyPaidWebhook } from "./webhooks/order-fully-paid";

const logger = createLogger("klaviyo");

const handler = wrapWithLoggerContext(
  withOtel(
    createManifestHandler({
      async manifestFactory({ appBaseUrl }): Promise<AppManifest> {
        const iframeBaseUrl = process.env.APP_IFRAME_BASE_URL ?? appBaseUrl;
        const apiBaseURL = process.env.APP_API_BASE_URL ?? appBaseUrl;

        logger.info("Generating manifest", {
          iframeBaseUrl,
          apiBaseURL,
          appBaseUrl,
          metadata: {
            "otel.library.version": "0.0.1",
          },
          nested: {
            metadata: {
              "otel.library.version": "0.0.1",
            },
          },
        });

        return {
          about: "Klaviyo integration allows sending Klaviyo notifications on Saleor events.",
          appUrl: iframeBaseUrl,
          author: "Saleor Commerce",
          brand: {
            logo: {
              default: `${apiBaseURL}/logo.png`,
            },
          },
          dataPrivacyUrl: "https://saleor.io/legal/privacy/",
          homepageUrl: "https://github.com/saleor/apps",
          id: "saleor.app.klaviyo",
          name: "Klaviyo",
          permissions: ["MANAGE_USERS", "MANAGE_ORDERS"],
          supportUrl: "https://github.com/saleor/apps/discussions",
          tokenTargetUrl: `${apiBaseURL}/api/register`,
          version: pkg.version,
          webhooks: [
            customerCreatedWebhook.getWebhookManifest(appBaseUrl),
            fulfillmentCreatedWebhook.getWebhookManifest(appBaseUrl),
            orderCreatedWebhook.getWebhookManifest(appBaseUrl),
            orderFullyPaidWebhook.getWebhookManifest(appBaseUrl),
          ],
        };
      },
    }),
    "/api/manifest",
  ),
  loggerContext,
);

export default handler;
