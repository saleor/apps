import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { type AppManifest } from "@saleor/app-sdk/types";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";

import pkg from "../../../package.json";
import { env } from "../../env";
import { loggerContext } from "../../logger-context";

const handler = wrapWithLoggerContext(
  withSpanAttributes(
    createManifestHandler({
      async manifestFactory({ appBaseUrl }): Promise<AppManifest> {
        const iframeBaseUrl = env.APP_IFRAME_BASE_URL ?? appBaseUrl;
        const apiBaseURL = env.APP_API_BASE_URL ?? appBaseUrl;

        return {
          about: "Anonymizes customer data by scrambling order details and deleting the customer.",
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
          name: "Anonymizer",
          permissions: ["MANAGE_ORDERS", "MANAGE_USERS"],
          requiredSaleorVersion: ">=3.22 <4",
          supportUrl: "https://github.com/saleor/apps/discussions",
          tokenTargetUrl: `${apiBaseURL}/api/register`,
          version: pkg.version,
          webhooks: [],
        };
      },
    }),
  ),
  loggerContext,
);

export default handler;
