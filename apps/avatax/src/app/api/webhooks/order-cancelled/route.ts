import { SpanKind, SpanStatusCode } from "@opentelemetry/api";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";
import { captureException, setTag } from "@sentry/nextjs";
import { after } from "next/server";

import { AppConfigExtractor } from "@/lib/app-config-extractor";
import { AppConfigurationLogger } from "@/lib/app-configuration-logger";
import { metadataCache, wrapWithMetadataCache } from "@/lib/app-metadata-cache";
import { SubscriptionPayloadErrorChecker } from "@/lib/error-utils";
import { appExternalTracer } from "@/lib/otel/tracing";
import { withFlushOtelMetrics } from "@/lib/otel/with-flush-otel-metrics";
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
import { OrderNoteReporter } from "@/modules/saleor/order-note-reporter";
import { AvataxTransactionAlreadyCancelledError } from "@/modules/taxes/tax-error";
import { orderCancelledAsyncWebhook } from "@/modules/webhooks/definitions/order-cancelled";

const logger = createLogger("orderCancelledAsyncWebhook");
const withMetadataCache = wrapWithMetadataCache(metadataCache);
const subscriptionErrorChecker = new SubscriptionPayloadErrorChecker(logger, captureException);

const logsWriterFactory = new LogWriterFactory();

const handler = orderCancelledAsyncWebhook.createHandler(async (_req, ctx) => {
  return appExternalTracer.startActiveSpan(
    "executing orderCancelled webhook handler",
    {
      kind: SpanKind.SERVER,
    },
    async (span) => {
      const { payload } = ctx;

      const logWriter = logsWriterFactory.createWriter(ctx.authData);
      const client = createGraphQLClient({
        saleorApiUrl: ctx.authData.saleorApiUrl,
        token: ctx.authData.token,
      });

      metadataCache.setMetadata(payload.recipient?.privateMetadata ?? []);

      subscriptionErrorChecker.checkPayload(payload);

      if (payload.version) {
        setTag(ObservabilityAttributes.SALEOR_VERSION, payload.version);
        loggerContext.set(ObservabilityAttributes.SALEOR_VERSION, payload.version);
      }

      logger.info("Handler called with payload");

      const cancelledOrderFromPayload = SaleorCancelledOrderEvent.create(payload);

      if (cancelledOrderFromPayload.isErr()) {
        const error = cancelledOrderFromPayload.error;

        span.recordException(error);
        switch (true) {
          case error instanceof OrderCancelPayloadOrderError: {
            logger.error("Insufficient order data", { error });
            captureException("Insufficient order data");

            OrderCancelledLogRequest.createErrorLog({
              sourceId: payload.order?.id,
              channelId: payload.order?.channel.id,
              errorReason: "Missing order data from Saleor",
            })
              .mapErr(captureException)
              .map(logWriter.writeLog);

            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: "Failed to void AvaTax transaction: missing order data from Saleor",
            });

            return Response.json(
              { message: `Invalid order payload for order: ${payload.order?.id}` },
              { status: 202 },
            );
          }

          case error instanceof OrderCancelNoAvataxIdError: {
            logger.warn("No AvaTax id found in order. Likely not an AvaTax order.", {
              error,
            });

            OrderCancelledLogRequest.createErrorLog({
              sourceId: payload.order?.id,
              channelId: payload.order?.channel.id,
              errorReason: "Missing 'avataxId' field in order metadata",
            })
              .mapErr(captureException)
              .map(logWriter.writeLog);

            span.setStatus({
              code: SpanStatusCode.OK,
              message:
                "Failed to void AvaTax transaction: missing avataxId field in order metadata",
            });

            return Response.json(
              { message: "Invalid order payload. Likely not an AvaTax order." },
              { status: 200 },
            );
          }

          case error instanceof SaleorCancelledOrderEvent.ParsingError: {
            logger.error("Error parsing order payload", { error });
            captureException(error);

            OrderCancelledLogRequest.createErrorLog({
              sourceId: payload.order?.id,
              channelId: payload.order?.channel.id,
              errorReason: "Error parsing Saleor event payload",
            })
              .mapErr(captureException)
              .map(logWriter.writeLog);

            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: "Failed to void AvaTax transaction: error parsing Saleor event payload",
            });

            return Response.json(
              { message: `Invalid order payload for order: ${payload.order?.id}` },
              { status: 202 },
            );
          }

          default: {
            logger.error("Unhandled error", { error });
            captureException(error);

            OrderCancelledLogRequest.createErrorLog({
              sourceId: payload.order?.id,
              channelId: payload.order?.channel.id,
              errorReason: "Unhandled error",
              avataxId: payload.order?.avataxId,
            })
              .mapErr(captureException)
              .map(logWriter.writeLog);

            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: "Failed to void AvaTax transaction: unhandled error",
            });

            return Response.json(
              { message: `Unhandled error for order: ${payload.order?.id}` },
              { status: 500 },
            );
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

        OrderCancelledLogRequest.createErrorLog({
          sourceId: payload.order?.id,
          channelId: payload.order?.channel.id,
          errorReason: "Cannot get app configuration",
          avataxId: payload.order?.avataxId,
        })
          .mapErr(captureException)
          .map(logWriter.writeLog);

        span.recordException(config.error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "Failed to void AvaTax transaction: invalid configuration",
        });

        return Response.json(
          { message: `App configuration is broken for order: ${payload.order?.id}` },
          { status: 400 },
        );
      }

      logger.info("Cancelling order...");

      const providerConfig = config.value.getConfigForChannelSlug(channelSlug);

      if (providerConfig.isErr()) {
        OrderCancelledLogRequest.createErrorLog({
          sourceId: payload.order?.id,
          channelId: payload.order?.channel.id,
          errorReason: "Invalid app configuration",
          avataxId: payload.order?.avataxId,
        })
          .mapErr(captureException)
          .map(logWriter.writeLog);

        span.recordException(providerConfig.error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "Failed to void AvaTax transaction: invalid configuration",
        });

        return Response.json(
          { message: `App is not configured properly for order: ${payload.order?.id}` },
          { status: 400 },
        );
      }

      const avaTaxOrderCancelledAdapter = createAvaTaxOrderCancelledAdapterFromConfig(
        providerConfig.value.avataxConfig.config,
      );

      try {
        await avaTaxOrderCancelledAdapter.send({
          payload: { avataxId: cancelledOrderInstance.getAvataxId() },
          config: providerConfig.value.avataxConfig.config,
        });

        after(() => {
          if (!payload.order?.id) {
            return;
          }

          new OrderNoteReporter(client).reportOrderNote(
            payload.order.id,
            "Order cancelled in AvaTax",
          );
        });
      } catch (e) {
        span.recordException(e as Error); // todo: remove casting when error handling is refactored

        // TODO Test once it becomes testable
        if (e instanceof AvataxOrderCancelledAdapter.DocumentNotFoundError) {
          logger.warn("Document was not found in AvaTax. Responding 202 and error", {
            error: e,
          });

          OrderCancelledLogRequest.createErrorLog({
            sourceId: payload.order?.id,
            channelId: payload.order?.channel.id,
            errorReason: "AvaTax transaction was not found in AvaTax",
            avataxId: payload.order?.avataxId,
          })
            .mapErr(captureException)
            .map(logWriter.writeLog);

          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "AvaTax transaction was not found in AvaTax",
          });

          return Response.json(
            { message: "AvaTax responded with DocumentNotFound. Please consult AvaTax docs" },
            { status: 202 },
          );
        }

        if (e instanceof AvataxTransactionAlreadyCancelledError) {
          logger.warn("Transaction was already cancelled in AvaTax. Responding 200", {
            error: e,
          });

          OrderCancelledLogRequest.createErrorLog({
            sourceId: payload.order?.id,
            channelId: payload.order?.channel.id,
            errorReason: "AvaTax transaction was already cancelled in AvaTax",
            avataxId: payload.order?.avataxId,
          })
            .mapErr(captureException)
            .map(logWriter.writeLog);

          span.setStatus({
            code: SpanStatusCode.OK,
            message: "AvaTax transaction was already cancelled in AvaTax",
          });

          return Response.json(
            { message: "Order was already cancelled in AvaTax" },
            { status: 200 },
          );
        }

        OrderCancelledLogRequest.createErrorLog({
          sourceId: payload.order?.id,
          channelId: payload.order?.channel.id,
          errorReason: "AvaTax API returned an unhandled error",
          avataxId: payload.order?.avataxId,
        })
          .mapErr(captureException)
          .map(logWriter.writeLog);

        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "Failed to void AvaTax transaction: unhandled error",
        });

        return Response.json(
          { message: "Failed to void AvaTax transaction. (Unhandled error)" },
          { status: 500 },
        );
      }

      OrderCancelledLogRequest.createSuccessLog({
        sourceId: payload.order?.id,
        channelId: payload.order?.channel.id,
        avataxId: payload.order?.avataxId,
      })
        .mapErr(captureException)
        .map(logWriter.writeLog);

      logger.info("AvaTax transaction voided successfully");

      span.setStatus({
        code: SpanStatusCode.OK,
        message: "Succesfully voided order in AvaTax",
      });

      return Response.json({ message: "Success" }, { status: 200 });
    },
  );
});

export const POST = compose(
  withLoggerContext,
  withFlushOtelMetrics,
  withMetadataCache,
  withSpanAttributesAppRouter,
)(handler);
