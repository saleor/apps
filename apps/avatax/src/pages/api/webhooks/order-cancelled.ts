import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";
import { WebhookResponse } from "../../../modules/app/webhook-response";
import { getActiveConnectionService } from "../../../modules/taxes/get-active-connection-service";
import { orderCancelledAsyncWebhook } from "../../../modules/webhooks/definitions/order-cancelled";
import { metadataCache, wrapWithMetadataCache } from "../../../lib/app-metadata-cache";
import { captureException, setTag } from "@sentry/nextjs";

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
        const webhookResponse = new WebhookResponse(res);

        if (payload.version) {
          setTag(ObservabilityAttributes.SALEOR_VERSION, payload.version);
          loggerContext.set(ObservabilityAttributes.SALEOR_VERSION, payload.version);
        }

        logger.info("Handler called with payload");

        if (!payload.order) {
          const error = new Error("Insufficient order data");

          logger.error("Insufficient order data", { error });

          return webhookResponse.error(error);
        }

        try {
          const appMetadata = payload.recipient?.privateMetadata ?? [];

          metadataCache.setMetadata(appMetadata);

          const channelSlug = payload.order.channel.slug;
          const taxProviderResult = getActiveConnectionService(
            channelSlug,
            appMetadata,
            ctx.authData,
          );

          logger.info("Cancelling order...");

          if (taxProviderResult.isOk()) {
            await taxProviderResult.value.cancelOrder(payload);

            logger.info("Order cancelled");

            return webhookResponse.success();
          }

          if (taxProviderResult.isErr()) {
            captureException(taxProviderResult.error);
            // TODO: Map errors
            return webhookResponse.error(taxProviderResult.error);
          }
        } catch (error) {
          captureException(error);
          return webhookResponse.error(error);
        }
      }),
    ),
    "/api/webhooks/order-cancelled",
  ),
  loggerContext,
);
