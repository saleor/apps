import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import * as Sentry from "@sentry/nextjs";
import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";
import { getActiveConnectionService } from "../../../modules/taxes/get-active-connection-service";
import { orderCancelledAsyncWebhook } from "../../../modules/webhooks/definitions/order-cancelled";
import { metadataCache, wrapWithMetadataCache } from "../../../lib/app-metadata-cache";
import { getAppConfig } from "../../../modules/app/get-app-config";

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

        if (!payload.order) {
          const error = new Error("Insufficient order data");

          logger.error("Insufficient order data", { error });
          Sentry.captureException("Insufficient order data");

          return res.status(400).send("Invalid order payload");
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

          /**
           * TODO Make it DRY
           */
          const config = getAppConfig(appMetadata);
          const channelConfig = config.channels.find(
            (channel) => channel.config.slug === channelSlug,
          );

          if (!channelConfig) {
            throw new Error("invalid config");
          }

          const providerConnection = config.providerConnections.find(
            (connection) => connection.id === channelConfig.config.providerConnectionId,
          );

          if (!providerConnection) {
            throw new Error("invalid config");
          }

          logger.info("Cancelling order...");

          if (taxProviderResult.isOk()) {
            await taxProviderResult.value.cancelOrder(payload, providerConnection.config);

            logger.info("Order cancelled");

            return res.status(200).end();
          }

          if (taxProviderResult.isErr()) {
            Sentry.captureException(taxProviderResult.error);
            // TODO: Map errors
            return res.status(500).send("Unhandled error");
          }
        } catch (error) {
          Sentry.captureException(error);

          return res.status(500).send("Unhandled error");
        }
      }),
    ),
    "/api/webhooks/order-cancelled",
  ),
  loggerContext,
);
