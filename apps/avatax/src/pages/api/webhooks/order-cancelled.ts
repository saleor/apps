import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import * as Sentry from "@sentry/nextjs";
import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";
import { orderCancelledAsyncWebhook } from "../../../modules/webhooks/definitions/order-cancelled";
import { metadataCache, wrapWithMetadataCache } from "../../../lib/app-metadata-cache";
import {
  OrderCancelNoAvataxIdError,
  OrderCancelPayloadOrderError,
} from "../../../modules/saleor/order-cancel-error";
import { SaleorCancelledOrder } from "../../../modules/saleor";

export const config = {
  api: {
    bodyParser: false,
  },
};

const withMetadataCache = wrapWithMetadataCache(metadataCache);

export default wrapWithLoggerContext(
  withOtel(
    withMetadataCache(
      orderCancelledAsyncWebhook.createHandler(async (req, res, ctx) => {
        const logger = createLogger("orderCancelledAsyncWebhook", {
          saleorApiUrl: ctx.authData.saleorApiUrl,
        });
        const { payload } = ctx;

        if (payload.version) {
          Sentry.setTag(ObservabilityAttributes.SALEOR_VERSION, payload.version);
          loggerContext.set(ObservabilityAttributes.SALEOR_VERSION, payload.version);
        }

        logger.info("Handler called with payload");

        try {
          const cancelledOrder = new SaleorCancelledOrder(payload);

          const appMetadata = cancelledOrder.privateMetadata ?? [];

          const channelSlug = cancelledOrder.channelSlug;

          const getActiveConnectionService = await import(
            "../../../modules/taxes/get-active-connection-service"
          ).then((m) => m.getActiveConnectionService);

          const taxProviderResult = getActiveConnectionService(
            channelSlug,
            appMetadata,
            ctx.authData,
          );

          logger.info("Cancelling order...");

          if (taxProviderResult.isOk()) {
            await taxProviderResult.value.cancelOrder(cancelledOrder.avataxId);

            logger.info("Order cancelled");

            return res.status(200).end();
          }

          if (taxProviderResult.isErr()) {
            logger.error("Tax provider couldn't cancel the order:", taxProviderResult.error);

            Sentry.captureException(taxProviderResult.error);
            // TODO: Map errors
            return res.status(500).send("Unhandled error");
          }
        } catch (error: unknown) {
          switch (true) {
            case error instanceof OrderCancelPayloadOrderError: {
              logger.error("Insufficient order data", { error });
              Sentry.captureException("Insufficient order data");

              return res.status(400).send("Invalid order payload");
            }
            case error instanceof OrderCancelNoAvataxIdError: {
              logger.warn("No AvaTax id found in order. Likely not an AvaTax order.", { error });
              return res.status(200).send("Invalid order payload. Likely not an AvaTax order.");
            }
            default: {
              logger.error("Unhandled error", { error });
              Sentry.captureException(error);

              return res.status(500).send("Unhandled error");
            }
          }
        }
      }),
    ),
    "/api/webhooks/order-cancelled",
  ),
  loggerContext,
);
