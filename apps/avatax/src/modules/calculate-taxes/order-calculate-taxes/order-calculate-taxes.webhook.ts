import { metadataCache, wrapWithMetadataCache } from "../../../lib/app-metadata-cache";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";

import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { UntypedCalculateTaxesDocument } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { loggerContext } from "../../../logger-context";

import { OrderCalculateTaxesController } from "./order-calculate-taxes.controller";
import { ICalculateTaxesPayload } from "../calculate-taxes-payload";
import { OrderCalculateTaxesUseCase } from "./order-calculate-taxes.use-case";
import { MetadataDecryptor } from "../metadata-decryptor";

/**
 * Manifest for this webhook
 */
const orderCalculateTaxesSyncWebhook = new SaleorSyncWebhook<ICalculateTaxesPayload>({
  name: "OrderCalculateTaxes",
  apl: saleorApp.apl,
  event: "ORDER_CALCULATE_TAXES",
  query: UntypedCalculateTaxesDocument,
  webhookPath: "/api/webhooks/v2/order-calculate-taxes",
});

/**
 * Create root dependencies
 */
const useCase = new OrderCalculateTaxesUseCase();
const metadataDecryptor = new MetadataDecryptor(process.env.SECRET_KEY as string);
const controller = new OrderCalculateTaxesController(useCase, metadataCache, metadataDecryptor);

const withMetadataCache = wrapWithMetadataCache(metadataCache);

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

/**
 * Root "infra" layer that registers webhooks handlers - framework specific.
 */
export const OrderCalculateTaxesWebhook = {
  registerHandler: () => orderCalculateTaxesSyncWebhook.createHandler(handler),
  getManifest: orderCalculateTaxesSyncWebhook.getWebhookManifest,
};
