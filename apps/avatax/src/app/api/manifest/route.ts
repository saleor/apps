import { createManifestHandler } from "@saleor/app-sdk/handlers/next-app-router";
import { AppExtension, AppManifest } from "@saleor/app-sdk/types";
import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";

import { env } from "@/env";
import { withFlushOtelMetrics } from "@/lib/otel/with-flush-otel-metrics";
import { withLoggerContext } from "@/logger-context";

import packageJson from "../../../../package.json";
import { appWebhooks } from "../../../../webhooks";

const handler = createManifestHandler({
  async manifestFactory({ appBaseUrl, schemaVersion }) {
    const iframeBaseUrl = env.APP_IFRAME_BASE_URL ?? appBaseUrl;
    const apiBaseURL = env.APP_API_BASE_URL ?? appBaseUrl;

    const orderDetailsExtensions: AppExtension = {
      target: "WIDGET",
      options: {
        widgetTarget: {
          method: "POST",
        },
      },
      label: "Transaction details",
      mount: "ORDER_DETAILS_WIDGETS",
      url: apiBaseURL + "/api/order-details",
      permissions: [],
    };

    const extensions: AppExtension[] = [];

    const saleorMinor = schemaVersion && schemaVersion[1];

    if (saleorMinor && saleorMinor >= 22) {
      extensions.push(orderDetailsExtensions);
    }

    const manifest: AppManifest = {
      about: "App connects with AvaTax to dynamically calculate taxes",
      appUrl: iframeBaseUrl,
      author: "Saleor Commerce",
      brand: {
        logo: {
          default: `${apiBaseURL}/logo.png`,
        },
      },
      dataPrivacyUrl: "https://saleor.io/legal/privacy/",
      homepageUrl: "https://github.com/saleor/apps",
      id: env.MANIFEST_APP_ID,
      name: "AvaTax",
      permissions: ["HANDLE_TAXES", "MANAGE_ORDERS"],
      requiredSaleorVersion: ">=3.20 <4",
      supportUrl: "https://github.com/saleor/apps/discussions",
      tokenTargetUrl: `${apiBaseURL}/api/register`,
      version: packageJson.version,
      webhooks: appWebhooks.map((w) => w.getWebhookManifest(apiBaseURL)),
      extensions,
    };

    return manifest;
  },
});

export const GET = compose(
  withLoggerContext,
  withFlushOtelMetrics,
  withSpanAttributesAppRouter,
)(handler);
