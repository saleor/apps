import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import * as Sentry from "@sentry/nextjs";
import { captureException } from "@sentry/nextjs";

import { AvataxOrderCancelledAdapter } from "@/modules/avatax/order-cancelled/avatax-order-cancelled-adapter";
import { ClientLogStoreRequest } from "@/modules/client-logs/client-log";
import { LogWriterFactory } from "@/modules/client-logs/log-writer-factory";

import { AppConfigExtractor } from "../../../lib/app-config-extractor";
import { AppConfigurationLogger } from "../../../lib/app-configuration-logger";
import { metadataCache, wrapWithMetadataCache } from "../../../lib/app-metadata-cache";
import { SubscriptionPayloadErrorChecker } from "../../../lib/error-utils";
import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";
import { SaleorCancelledOrderEvent } from "../../../modules/saleor";
import {
  OrderCancelNoAvataxIdError,
  OrderCancelPayloadOrderError,
} from "../../../modules/saleor/order-cancelled/errors";
import { orderCancelledAsyncWebhook } from "../../../modules/webhooks/definitions/order-cancelled";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger("orderCancelledAsyncWebhook");
const withMetadataCache = wrapWithMetadataCache(metadataCache);
const subscriptionErrorChecker = new SubscriptionPayloadErrorChecker(logger, captureException);

const logsWriterFactory = new LogWriterFactory();

export default wrapWithLoggerContext(
  withOtel(
    withMetadataCache(
      orderCancelledAsyncWebhook.createHandler(async (req, res, ctx) => {
        const { payload } = ctx;
        const logWriter = logsWriterFactory.createWriter(ctx.authData);

        metadataCache.setMetadata(payload.recipient?.privateMetadata ?? []);

        subscriptionErrorChecker.checkPayload(payload);

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

              ClientLogStoreRequest.create({
                level: "error",
                message: "Failed to void order. Missing order data.",
                checkoutOrOrderId: payload.order?.id,
                channelId: payload.order?.channel.slug,
                checkoutOrOrder: "order",
              })
                .mapErr(captureException)
                .map(logWriter.writeLog);

              return res
                .status(400)
                .json({ message: `Invalid order payload for order: ${payload.order?.id}` });
            }
            case error instanceof OrderCancelNoAvataxIdError: {
              logger.warn("No AvaTax id found in order. Likely not an AvaTax order.", {
                error,
              });

              ClientLogStoreRequest.create({
                level: "error",
                message: "Failed to void order. Missing avataxId field in order metadata",
                checkoutOrOrderId: payload.order?.id,
                channelId: payload.order?.channel.slug,
                checkoutOrOrder: "order",
              })
                .mapErr(captureException)
                .map(logWriter.writeLog);

              return res
                .status(200)
                .json({ message: "Invalid order payload. Likely not an AvaTax order." });
            }
            case error instanceof SaleorCancelledOrderEvent.ParsingError: {
              logger.error("Error parsing order payload", { error });
              Sentry.captureException(error);

              ClientLogStoreRequest.create({
                level: "error",
                message: "Failed to void order. Failed to parse payload",
                checkoutOrOrderId: payload.order?.id,
                checkoutOrOrder: "order",
                channelId: payload.order?.channel.slug,
              })
                .mapErr(captureException)
                .map(logWriter.writeLog);

              return res
                .status(400)
                .json({ message: `Invalid order payload for order: ${payload.order?.id}` });
            }
            default: {
              logger.error("Unhandled error", { error });
              Sentry.captureException(error);

              ClientLogStoreRequest.create({
                level: "error",
                message: "Failed to void order. Unknown error",
                checkoutOrOrderId: payload.order?.id,
                checkoutOrOrder: "order",
                channelId: payload.order?.channel.slug,
              })
                .mapErr(captureException)
                .map(logWriter.writeLog);

              return res
                .status(500)
                .json({ message: `Unhandled error for order: ${payload.order?.id}` });
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

          ClientLogStoreRequest.create({
            level: "error",
            message: "Failed to void order. Broken configuration.",
            checkoutOrOrderId: payload.order?.id,
            channelId: payload.order?.channel.slug,
            checkoutOrOrder: "order",
          })
            .mapErr(captureException)
            .map(logWriter.writeLog);

          return res
            .status(400)
            .json({ message: `App configuration is broken for order: ${payload.order?.id}` });
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
          const { taxProvider } = avataxWebhookServiceResult.value;
          const providerConfig = config.value.getConfigForChannelSlug(channelSlug);

          if (providerConfig.isErr()) {
            ClientLogStoreRequest.create({
              level: "error",
              message: "Failed to void order. Broken configuration.",
              checkoutOrOrderId: payload.order?.id,
              channelId: payload.order?.channel.slug,
              checkoutOrOrder: "order",
            })
              .mapErr(captureException)
              .map(logWriter.writeLog);

            return res
              .status(400)
              .json({ message: `App is not configured properly for order: ${payload.order?.id}` });
          }

          try {
            await taxProvider.cancelOrder(
              {
                avataxId: cancelledOrderInstance.getAvataxId(),
              },
              providerConfig.value.avataxConfig.config,
            );
          } catch (e) {
            // TODO Test once it becomes testable
            if (e instanceof AvataxOrderCancelledAdapter.DocumentNotFoundError) {
              logger.warn("Document was not found in AvaTax. Responding 400", {
                error: e,
              });

              return res.status(400).send({
                message: "AvaTax responded with DocumentNotFound. Please consult AvaTax docs",
              });
            }

            ClientLogStoreRequest.create({
              level: "error",
              message: "Failed to void order. AvaTax returned error.",
              checkoutOrOrder: "order",
              checkoutOrOrderId: payload.order?.id,
              channelId: payload.order?.channel.slug,
            })
              .mapErr(captureException)
              .map(logWriter.writeLog);
          }

          ClientLogStoreRequest.create({
            level: "info",
            message: "Order voided in AvaTax",
            checkoutOrOrder: "order",
            checkoutOrOrderId: payload.order?.id,
            channelId: payload.order?.channel.slug,
          })
            .mapErr(captureException)
            .map(logWriter.writeLog);

          logger.info("Order cancelled");

          return res.status(200).end();
        }

        if (avataxWebhookServiceResult.isErr()) {
          logger.error("Tax provider couldn't cancel the order:", avataxWebhookServiceResult.error);

          switch (avataxWebhookServiceResult.error["constructor"]) {
            case AvataxWebhookServiceFactory.BrokenConfigurationError: {
              ClientLogStoreRequest.create({
                level: "error",
                message: "Failed to void order. Broken configuration.",
                checkoutOrOrderId: payload.order?.id,
                checkoutOrOrder: "order",
                channelId: payload.order?.channel.slug,
              })
                .mapErr(captureException)
                .map(logWriter.writeLog);

              return res.status(400).json({ message: "App is not configured properly." });
            }
            default: {
              Sentry.captureException(avataxWebhookServiceResult.error);
              logger.fatal("Unhandled error", { error: avataxWebhookServiceResult.error });

              ClientLogStoreRequest.create({
                level: "error",
                message: "Failed to void order. Unhandled error",
                checkoutOrOrderId: payload.order?.id,
                checkoutOrOrder: "order",
                channelId: payload.order?.channel.slug,
              })
                .mapErr(captureException)
                .map(logWriter.writeLog);

              return res.status(500).json({ message: "Unhandled error" });
            }
          }
        }
      }),
    ),
    "/api/webhooks/order-cancelled",
  ),
  loggerContext,
);
