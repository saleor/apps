import { SpanKind, SpanStatusCode } from "@opentelemetry/api";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared";
import * as Sentry from "@sentry/nextjs";

import { AppConfigExtractor } from "@/lib/app-config-extractor";
import { AppConfigurationLogger } from "@/lib/app-configuration-logger";
import { appInternalTracer } from "@/lib/app-internal-tracer";
import { metadataCache, wrapWithMetadataCache } from "@/lib/app-metadata-cache";
import { SubscriptionPayloadErrorChecker } from "@/lib/error-utils";
import { createLogger } from "@/logger";
import { loggerContext, withLoggerContext } from "@/logger-context";
import { AvataxOrderCancelledAdapter } from "@/modules/avatax/order-cancelled/avatax-order-cancelled-adapter";
import { createAvaTaxOrderCancelledAdapterFromConfig } from "@/modules/avatax/order-cancelled/avatax-order-cancelled-adapter-factory";
import { LogWriterFactory } from "@/modules/client-logs/log-writer-factory";
import { OrderCancelledLogRequest } from "@/modules/client-logs/order-cancelled-log-request";
import { SaleorCancelledOrderEvent } from "@/modules/saleor";
import {
  OrderCancelNoAvataxIdError,
  OrderCancelPayloadOrderError,
} from "@/modules/saleor/order-cancelled/errors";
import { AvataxTransactionAlreadyCancelledError } from "@/modules/taxes/tax-error";
import { orderCancelledAsyncWebhook } from "@/modules/webhooks/definitions/order-cancelled";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger("orderCancelledAsyncWebhook");
const withMetadataCache = wrapWithMetadataCache(metadataCache);
const subscriptionErrorChecker = new SubscriptionPayloadErrorChecker(
  logger,
  Sentry.captureException,
);

const logsWriterFactory = new LogWriterFactory();

const handler = orderCancelledAsyncWebhook.createHandler(async (req, res, ctx) => {
  return appInternalTracer.startActiveSpan(
    "executing orderCancelled webhook handler",
    {
      kind: SpanKind.SERVER,
    },
    async (span) => {
      const { payload, authData } = ctx;

      span.setAttribute(ObservabilityAttributes.SALEOR_API_URL, authData.saleorApiUrl);

      const logWriter = logsWriterFactory.createWriter(ctx.authData);

      metadataCache.setMetadata(payload.recipient?.privateMetadata ?? []);

      subscriptionErrorChecker.checkPayload(payload);

      if (payload.version) {
        Sentry.setTag(ObservabilityAttributes.SALEOR_VERSION, payload.version);
        loggerContext.set(ObservabilityAttributes.SALEOR_VERSION, payload.version);
        span.setAttribute(ObservabilityAttributes.SALEOR_VERSION, payload.version);
      }

      logger.info("Handler called with payload");

      const cancelledOrderFromPayload = SaleorCancelledOrderEvent.create(payload);

      if (cancelledOrderFromPayload.isErr()) {
        const error = cancelledOrderFromPayload.error;

        span.recordException(error);
        switch (true) {
          case error instanceof OrderCancelPayloadOrderError: {
            logger.error("Insufficient order data", { error });
            Sentry.captureException("Insufficient order data");

            OrderCancelledLogRequest.createErrorLog({
              sourceId: payload.order?.id,
              channelSlug: payload.order?.channel.slug,
              errorReason: "Missing order data from Saleor",
            })
              .mapErr(Sentry.captureException)
              .map(logWriter.writeLog);

            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: "Failed to void AvaTax transaction: missing order data from Saleor",
            });
            span.end();

            return res
              .status(400)
              .json({ message: `Invalid order payload for order: ${payload.order?.id}` });
          }
          case error instanceof OrderCancelNoAvataxIdError: {
            logger.warn("No AvaTax id found in order. Likely not an AvaTax order.", {
              error,
            });

            OrderCancelledLogRequest.createErrorLog({
              sourceId: payload.order?.id,
              channelSlug: payload.order?.channel.slug,
              errorReason: "Missing 'avataxId' field in order metadata",
            })
              .mapErr(Sentry.captureException)
              .map(logWriter.writeLog);

            span.setStatus({
              code: SpanStatusCode.OK,
              message:
                "Failed to void AvaTax transaction: missing avataxId field in order metadata",
            });
            span.end();

            return res
              .status(200)
              .json({ message: "Invalid order payload. Likely not an AvaTax order." });
          }
          case error instanceof SaleorCancelledOrderEvent.ParsingError: {
            logger.error("Error parsing order payload", { error });
            Sentry.captureException(error);

            OrderCancelledLogRequest.createErrorLog({
              sourceId: payload.order?.id,
              channelSlug: payload.order?.channel.slug,
              errorReason: "Error parsing Saleor event payload",
            })
              .mapErr(Sentry.captureException)
              .map(logWriter.writeLog);

            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: "Failed to void AvaTax transaction: error parsing Saleor event payload",
            });
            span.end();

            return res
              .status(400)
              .json({ message: `Invalid order payload for order: ${payload.order?.id}` });
          }
          default: {
            logger.error("Unhandled error", { error });
            Sentry.captureException(error);

            OrderCancelledLogRequest.createErrorLog({
              sourceId: payload.order?.id,
              channelSlug: payload.order?.channel.slug,
              errorReason: "Unhandled error",
              avataxId: payload.order?.avataxId,
            })
              .mapErr(Sentry.captureException)
              .map(logWriter.writeLog);

            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: "Failed to void AvaTax transaction: unhandled error",
            });
            span.end();

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
            Sentry.captureException(
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

        OrderCancelledLogRequest.createErrorLog({
          sourceId: payload.order?.id,
          channelSlug: payload.order?.channel.slug,
          errorReason: "Cannot get app configuration",
          avataxId: payload.order?.avataxId,
        })
          .mapErr(Sentry.captureException)
          .map(logWriter.writeLog);

        span.recordException(config.error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "Failed to void AvaTax transaction: invalid configuration",
        });
        span.end();

        return res
          .status(400)
          .json({ message: `App configuration is broken for order: ${payload.order?.id}` });
      }

      logger.info("Cancelling order...");

      const providerConfig = config.value.getConfigForChannelSlug(channelSlug);

      if (providerConfig.isErr()) {
        OrderCancelledLogRequest.createErrorLog({
          sourceId: payload.order?.id,
          channelSlug: payload.order?.channel.slug,
          errorReason: "Invalid app configuration",
          avataxId: payload.order?.avataxId,
        })
          .mapErr(Sentry.captureException)
          .map(logWriter.writeLog);

        span.recordException(providerConfig.error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "Failed to void AvaTax transaction: invalid configuration",
        });
        span.end();

        return res
          .status(400)
          .json({ message: `App is not configured properly for order: ${payload.order?.id}` });
      }

      const avaTaxOrderCancelledAdapter = createAvaTaxOrderCancelledAdapterFromConfig(
        providerConfig.value.avataxConfig.config,
      );

      try {
        await avaTaxOrderCancelledAdapter.send(
          {
            avataxId: cancelledOrderInstance.getAvataxId(),
          },
          providerConfig.value.avataxConfig.config,
        );
      } catch (e) {
        span.recordException(e as Error); // todo: remove casting when error handling is refactored

        // TODO Test once it becomes testable
        if (e instanceof AvataxOrderCancelledAdapter.DocumentNotFoundError) {
          logger.warn("Document was not found in AvaTax. Responding 400", {
            error: e,
          });

          OrderCancelledLogRequest.createErrorLog({
            sourceId: payload.order?.id,
            channelSlug: payload.order?.channel.slug,
            errorReason: "AvaTax transaction was not found in AvaTax",
            avataxId: payload.order?.avataxId,
          })
            .mapErr(Sentry.captureException)
            .map(logWriter.writeLog);

          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "AvaTax transaction was not found in AvaTax",
          });
          span.end();

          return res.status(400).send({
            message: "AvaTax responded with DocumentNotFound. Please consult AvaTax docs",
          });
        }

        if (e instanceof AvataxTransactionAlreadyCancelledError) {
          logger.warn("Transaction was already cancelled in AvaTax. Responding 200", {
            error: e,
          });

          OrderCancelledLogRequest.createErrorLog({
            sourceId: payload.order?.id,
            channelSlug: payload.order?.channel.slug,
            errorReason: "AvaTax transaction was already cancelled in AvaTax",
            avataxId: payload.order?.avataxId,
          })
            .mapErr(Sentry.captureException)
            .map(logWriter.writeLog);

          span.setStatus({
            code: SpanStatusCode.OK,
            message: "AvaTax transaction was already cancelled in AvaTax",
          });
          span.end();

          return res.status(200).send({
            message: "Order was already cancelled in AvaTax",
          });
        }

        OrderCancelledLogRequest.createErrorLog({
          sourceId: payload.order?.id,
          channelSlug: payload.order?.channel.slug,
          errorReason: "AvaTax API returned an unhandled error",
          avataxId: payload.order?.avataxId,
        })
          .mapErr(Sentry.captureException)
          .map(logWriter.writeLog);

        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "Failed to void AvaTax transaction: unhandled error",
        });

        return res.status(500).send({
          message: "Failed to void AvaTax transaction. (Unhandled error)",
        });
      }

      OrderCancelledLogRequest.createSuccessLog({
        sourceId: payload.order?.id,
        channelSlug: payload.order?.channel.slug,
        avataxId: payload.order?.avataxId,
      })
        .mapErr(Sentry.captureException)
        .map(logWriter.writeLog);

      logger.info("AvaTax transaction voided successfully");

      span.setStatus({
        code: SpanStatusCode.OK,
        message: "Succesfully voided order in AvaTax",
      });
      span.end();

      return res.status(200).end();
    },
  );
});

export default compose(withLoggerContext, withMetadataCache, withSpanAttributes)(handler);
