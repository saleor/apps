import { createManifestHandler } from "@saleor/app-sdk/handlers/next-app-router";
import { AppManifest } from "@saleor/app-sdk/types";
import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";

import { paymentGatewayInitializeSessionWebhookDefinition } from "@/app/api/saleor/gateway-initialize/webhook-definition";
import { env } from "@/lib/env";
import { withLoggerContext } from "@/lib/logger-context";
import packageJson from "@/package.json";

const handler = createManifestHandler({
  async manifestFactory({ appBaseUrl }) {
    const iframeBaseUrl = env.APP_IFRAME_BASE_URL ?? appBaseUrl;
    const apiBaseURL = env.APP_API_BASE_URL ?? appBaseUrl;

    const manifest: AppManifest = {
      about:
        "App that allows merchants using the Saleor e-commerce platform to accept online payments from customers using Stripe as their payment processor.",
      appUrl: iframeBaseUrl,
      author: "Saleor Commerce",
      brand: {
        logo: {
          default: `${apiBaseURL}/logo.png`,
        },
      },
      dataPrivacyUrl: "https://saleor.io/legal/privacy/",
      extensions: [],
      homepageUrl: "https://github.com/saleor/apps",
      id: env.MANIFEST_APP_ID,
      name: "Stripe",
      permissions: ["HANDLE_PAYMENTS"],
      requiredSaleorVersion: ">=3.20 <4",
      supportUrl: "https://saleor.io/discord",
      tokenTargetUrl: `${apiBaseURL}/api/register`,
      version: packageJson.version,
      webhooks: [paymentGatewayInitializeSessionWebhookDefinition.getWebhookManifest(appBaseUrl)],
    };

    return manifest;
  },
});

export const GET = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);
