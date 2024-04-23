import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import * as Sentry from "@sentry/nextjs";
import { captureException } from "@sentry/nextjs";
import { metadataCache, wrapWithMetadataCache } from "../../../lib/app-metadata-cache";
import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";
import { SaleorCancelledOrderEvent } from "../../../modules/saleor/order";
import {
  OrderCancelNoAvataxIdError,
  OrderCancelPayloadOrderError,
} from "../../../modules/saleor/order-cancel-error";
import { orderCancelledAsyncWebhook } from "../../../modules/webhooks/definitions/order-cancelled";
import { AppConfigExtractor } from "../../../lib/app-config-extractor";
import { AppConfigurationLogger } from "../../../lib/app-configuration-logger";

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

        const cancelledOrderFromPayload = SaleorCancelledOrderEvent.create(payload);

        if (cancelledOrderFromPayload.isErr()) {
          const error = cancelledOrderFromPayload.error;

          switch (true) {
            case error instanceof OrderCancelPayloadOrderError: {
              logger.error("Insufficient order data", { error });
              Sentry.captureException("Insufficient order data");

              return res.status(400).send("Invalid order payload");
            }
            case error instanceof OrderCancelNoAvataxIdError: {
              logger.warn("No AvaTax id found in order. Likely not an AvaTax order.", {
                error,
              });
              return res.status(200).send("Invalid order payload. Likely not an AvaTax order.");
            }
            case error instanceof SaleorCancelledOrderEvent.ParsingError: {
              logger.error("Error parsing order payload", { error });
              Sentry.captureException(error);

              return res.status(400).send("Invalid order payload");
            }
            default: {
              logger.error("Unhandled error", { error });
              Sentry.captureException(error);

              return res.status(500).send("Unhandled error");
            }
          }
        }

        const cancelledOrderInstance = cancelledOrderFromPayload.value;

        const appMetadata = cancelledOrderInstance.getPrivateMetadata() || [];

        const channelSlug = cancelledOrderInstance.getChannelSlug();

        const configExtractor = new AppConfigExtractor();

        const config = configExtractor
          .extractAppConfigFromPrivateMetadata(appMetadata)
          .map((config) => {
            try {
              new AppConfigurationLogger(logger).logConfiguration(config, channelSlug);
            } catch (e) {
              captureException(
                new AppConfigExtractor.LogConfigurationMetricError(
                  "Failed to log configuration metric",
                  {
                    cause: e,
                  },
                ),
              );
            }

            return config;
          });

        if (config.isErr()) {
          logger.warn("Failed to extract app config from metadata", { error: config.error });

          return res.status(400).send("App configuration is broken");
        }

        const AvataxWebhookServiceFactory = await import(
          "../../../modules/taxes/avatax-webhook-service-factory"
        ).then((m) => m.AvataxWebhookServiceFactory);

        const avataxWebhookServiceResult = AvataxWebhookServiceFactory.createFromConfig(
          config.value,
          channelSlug,
        );

        logger.info("Cancelling order...");

        if (avataxWebhookServiceResult.isOk()) {
          const { taxProvider, config } = avataxWebhookServiceResult.value;

          await taxProvider.cancelOrder(
            {
              avataxId: cancelledOrderInstance.getAvataxId(),
            },
            config,
          );

          logger.info("Order cancelled");

          return res.status(200).end();
        }

        if (avataxWebhookServiceResult.isErr()) {
          logger.error("Tax provider couldn't cancel the order:", avataxWebhookServiceResult.error);

          switch (avataxWebhookServiceResult.error["constructor"]) {
            case AvataxWebhookServiceFactory.BrokenConfigurationError: {
              return res.status(400).send("App is not configured properly.");
            }
            default: {
              Sentry.captureException(avataxWebhookServiceResult.error);
              logger.fatal("Unhandled error", { error: avataxWebhookServiceResult.error });

              return res.status(500).send("Unhandled error");
            }
          }

          return res.status(500).send("Unhandled error");
        }
      }),
    ),
    "/api/webhooks/order-cancelled",
  ),
  loggerContext,
);
