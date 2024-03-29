import { metadataCache, wrapWithMetadataCache } from "../../../lib/app-metadata-cache";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";

import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { UntypedCalculateTaxesDocument } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { loggerContext } from "../../../logger-context";

import { OrderCalculateTaxesController } from "./order-calculate-taxes.controller";
import { ICalculateTaxesPayload } from "../calculate-taxes-payload";

const orderCalculateTaxesSyncWebhook = new SaleorSyncWebhook<ICalculateTaxesPayload>({
  name: "OrderCalculateTaxes",
  apl: saleorApp.apl,
  event: "ORDER_CALCULATE_TAXES",
  query: UntypedCalculateTaxesDocument,
  webhookPath: "/api/webhooks/v2/order-calculate-taxes",
});

const withMetadataCache = wrapWithMetadataCache(metadataCache);

const controller = new OrderCalculateTaxesController();

const handler = wrapWithLoggerContext(
  withOtel(
    withMetadataCache(
      orderCalculateTaxesSyncWebhook.createHandler(
        async (req, res, { event, payload, authData, baseUrl }) => {
          controller.execute(req, res, {
            event: event as "ORDER_CALCULATE_TAXES",
            payload,
            authData,
          });
        },
      ),
    ),
    "/api/order-calculate-taxes",
  ),
  loggerContext,
);

export const OrderCalculateTaxesWebhook = {
  registerHandler: () => orderCalculateTaxesSyncWebhook.createHandler(handler),
  getManifest: orderCalculateTaxesSyncWebhook.getWebhookManifest,
};
