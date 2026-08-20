import { createManifestHandler } from "@saleor/app-sdk/handlers/next-app-router";
import { type AppExtension, type AppManifest } from "@saleor/app-sdk/types";
import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";

import { env } from "@/env";
import { withFlushOtelMetrics } from "@/lib/otel/with-flush-otel-metrics";
import { withLoggerContext } from "@/logger-context";
import { PRODUCT_TAX_CODE_POPUP_IDENTIFIER } from "@/modules/avatax/tax-code/product-tax-code-popup";

import packageJson from "../../../../package.json";
import { appWebhooks } from "../../../../webhooks";

const handler = createManifestHandler({
  async manifestFactory({ appBaseUrl, schemaVersion }) {
    const iframeBaseUrl = env.APP_IFRAME_BASE_URL ?? appBaseUrl;
    const apiBaseURL = env.APP_API_BASE_URL ?? appBaseUrl;

    const orderDetailsExtension: AppExtension = {
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

    const productDetailsExtension: AppExtension = {
      target: "WIDGET",
      options: {
        widgetTarget: {
          method: "GET",
        },
      },
      label: "AvaTax tax code",
      mount: "PRODUCT_DETAILS_WIDGETS",
      url: iframeBaseUrl + "/product-details",
      permissions: ["MANAGE_PRODUCTS"],
    };

    /*
     * Surfaces the same product-details view in the Dashboard command palette (Cmd+K).
     * Scoped to PRODUCT_DETAILS, so the Dashboard appends the current `productId` -
     * the very param the page already reads when rendered as a widget.
     */
    const productTaxCodeSearchAction: AppExtension = {
      target: "POPUP",
      mount: "SEARCH_ACTION",
      options: {
        views: ["PRODUCT_DETAILS"],
        /*
         * The palette already matches the label and the app name, so "avatax" and
         * "tax code" need no alias. These are the terms merchants use that appear
         * in neither: the vendor's company name, and the Saleor concept the popup
         * actually resolves the code from.
         */
        aliases: ["avalara", "tax class"],
      },
      label: "Show AvaTax tax code",
      /*
       * Same route as the widget - `mode=popup` is what tells it to render the
       * roomier, editable modal instead of the compact sidebar summary.
       */
      url: iframeBaseUrl + "/product-details?mode=popup",
      permissions: ["MANAGE_PRODUCTS"],
    };

    /*
     * The same modal, reachable from the product page's "..." menu - and, more to the
     * point, the extension the sidebar widget's "Edit tax code" button opens through
     * `actions.OpenPopup`. The Dashboard only resolves popups registered on the
     * current page, and the command palette is unmounted while closed, so the
     * SEARCH_ACTION above cannot serve as that target.
     */
    const productTaxCodePopup: AppExtension = {
      target: "POPUP",
      mount: "PRODUCT_DETAILS_MORE_ACTIONS",
      identifier: PRODUCT_TAX_CODE_POPUP_IDENTIFIER,
      label: "Edit AvaTax tax code",
      url: iframeBaseUrl + "/product-details?mode=popup",
      permissions: ["MANAGE_PRODUCTS"],
    };

    const extensions: AppExtension[] = [];

    const saleorMinor = schemaVersion && schemaVersion[1];

    if (saleorMinor && saleorMinor >= 22) {
      extensions.push(orderDetailsExtension, productDetailsExtension);
    }

    /*
     * SEARCH_ACTION landed in 3.23, as did `identifier` and the `openPopup` action the
     * widget button relies on - so the popup pair is gated together.
     */
    if (saleorMinor && saleorMinor >= 23) {
      extensions.push(productTaxCodeSearchAction, productTaxCodePopup);
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
      permissions: ["HANDLE_TAXES", "MANAGE_ORDERS", "MANAGE_PRODUCTS"],
      requiredSaleorVersion: ">=3.21 <4",
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
