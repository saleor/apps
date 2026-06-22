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
          about:
            "Anonymizes customer data by scrambling order details, deleting checkouts and gift cards, and deleting the customer.",
          appUrl: iframeBaseUrl,
          author: "Saleor Commerce",
          brand: {
            logo: {
              default: `${apiBaseURL}/logo.png`,
            },
          },
          dataPrivacyUrl: "https://saleor.io/legal/privacy/",
          extensions: [
            /*
             * Adds a "GDPR removal" action to a customer's detail page. The
             * Dashboard opens this URL in a modal iframe and appends the
             * customer id as the `id` query param.
             */
            {
              label: "GDPR removal",
              mount: "CUSTOMER_DETAILS_MORE_ACTIONS",
              target: "POPUP",
              permissions: [
                "MANAGE_ORDERS",
                "MANAGE_USERS",
                "MANAGE_CHECKOUTS",
                "MANAGE_GIFT_CARD",
              ],
              url: `${iframeBaseUrl}/gdpr-removal`,
            },
          ],
          homepageUrl: "https://github.com/saleor/apps",
          id: env.MANIFEST_APP_ID,
          name: "Anonymizer",
          permissions: ["MANAGE_ORDERS", "MANAGE_USERS", "MANAGE_CHECKOUTS", "MANAGE_GIFT_CARD"],
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
