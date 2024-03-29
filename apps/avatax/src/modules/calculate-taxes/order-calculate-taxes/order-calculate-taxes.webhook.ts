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
export const orderCalculateTaxesSyncWebhook = new SaleorSyncWebhook<ICalculateTaxesPayload>({
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

// TODO: Inject constructor via DI
const handler = wrapWithLoggerContext(
  withOtel(
    withMetadataCache(
      orderCalculateTaxesSyncWebhook.createHandler(
        async (req, res, { event, payload, authData, baseUrl }) => {
          console.log("call handler");

          try {
            await controller.execute(req, res, {
              event: event as "ORDER_CALCULATE_TAXES",
              payload,
              authData,
            });
          } catch (e) {
            // handle unhandled error root level
            console.log("ERROR");
            console.error(e);

            return res.status(500).send("Unhandled error");
          }
        },
      ),
    ),
    "/api/order-calculate-taxes",
  ),
  loggerContext,
);

export const nextHandler = orderCalculateTaxesSyncWebhook.createHandler(handler);
