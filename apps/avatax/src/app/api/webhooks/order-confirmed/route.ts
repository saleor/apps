import { SpanKind, SpanStatusCode } from "@opentelemetry/api";
import { AuthData } from "@saleor/app-sdk/APL";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { captureException, setTag } from "@sentry/nextjs";
import { after } from "next/server";

import { AppConfigExtractor } from "@/lib/app-config-extractor";
import { AppConfigurationLogger } from "@/lib/app-configuration-logger";
import { metadataCache, wrapWithMetadataCache } from "@/lib/app-metadata-cache";
import { createInstrumentedGraphqlClient } from "@/lib/create-instrumented-graphql-client";
import { SubscriptionPayloadErrorChecker } from "@/lib/error-utils";
import { appExternalTracer } from "@/lib/otel/tracing";
import { withFlushOtelMetrics } from "@/lib/otel/with-flush-otel-metrics";
import { createLogger } from "@/logger";
import { loggerContext, withLoggerContext } from "@/logger-context";
import { OrderMetadataManager } from "@/modules/app/order-metadata-manager";
import { AvataxConfig } from "@/modules/avatax/avatax-connection-schema";
import { PriceReductionDiscountsStrategy } from "@/modules/avatax/discounts";
import { createAvaTaxOrderConfirmedAdapterFromAvaTaxConfig } from "@/modules/avatax/order-confirmed/avatax-order-confirmed-adapter-factory";
import { LogWriterFactory } from "@/modules/client-logs/log-writer-factory";
import { OrderConfirmedLogRequest } from "@/modules/client-logs/order-confirmed-log-request";
import { SaleorOrderConfirmedEvent } from "@/modules/saleor";
import { OrderNoteReporter } from "@/modules/saleor/order-note-reporter";
import {
  AvataxEntityNotFoundError,
  AvataxGetTaxSystemError,
  AvataxGetTaxWrongUserInputError,
  AvataxStringLengthError,
  TaxBadPayloadError,
} from "@/modules/taxes/tax-error";
import { orderConfirmedAsyncWebhook } from "@/modules/webhooks/definitions/order-confirmed";

const logger = createLogger("orderConfirmedAsyncWebhook");

const withMetadataCache = wrapWithMetadataCache(metadataCache);
const subscriptionErrorChecker = new SubscriptionPayloadErrorChecker(logger, captureException);
const discountsStrategy = new PriceReductionDiscountsStrategy();

const logsWriterFactory = new LogWriterFactory();

/**
 * In the future this should be part of the use-case
 */
async function confirmOrder({
  confirmedOrderEvent,
  avataxConfig,
  authData,
  discountsStrategy,
}: {
  confirmedOrderEvent: SaleorOrderConfirmedEvent;
  avataxConfig: AvataxConfig;
  authData: AuthData;
  discountsStrategy: PriceReductionDiscountsStrategy;
}) {
  const avataxOrderConfirmedAdapter =
    createAvaTaxOrderConfirmedAdapterFromAvaTaxConfig(avataxConfig);

  const response = await avataxOrderConfirmedAdapter.send({
    payload: { confirmedOrderEvent },
    config: avataxConfig,
    authData,
    discountsStrategy,
  });

  return response;
}

const handler = orderConfirmedAsyncWebhook.createHandler(async (_req, ctx) => {
  return appExternalTracer.startActiveSpan(
    "executing orderConfirmed handler",
    {
      kind: SpanKind.SERVER,
    },
    async (span) => {
      const { payload, authData } = ctx;

      const logWriter = logsWriterFactory.createWriter(ctx.authData);

      subscriptionErrorChecker.checkPayload(payload);

      const { saleorApiUrl, token } = authData;

      if (payload.version) {
        setTag(ObservabilityAttributes.SALEOR_VERSION, payload.version);
        loggerContext.set(ObservabilityAttributes.SALEOR_VERSION, payload.version);
      }

      logger.info("Handler called with payload");
      const confirmedOrderFromPayload = SaleorOrderConfirmedEvent.createFromGraphQL(payload);

      if (confirmedOrderFromPayload.isErr()) {
        const error = confirmedOrderFromPayload.error;

        // Capture error when there is problem with parsing webhook payload - it should not happen
        captureException(error);
        logger.error("Error parsing webhook payload into Saleor order", { error });

        OrderConfirmedLogRequest.createErrorLog({
          sourceId: payload.order?.id,
          channelId: payload.order?.channel.id,
          errorReason: "Error parsing Saleor event payload",
        })
          .mapErr(captureException)
          .map(logWriter.writeLog);

        span.recordException(error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "Failed to commit transaction in AvaTax: error parsing Saleor event payload",
        });

        return Response.json({ message: error.message }, { status: 500 });
      }

      loggerContext.set(
        ObservabilityAttributes.ORDER_ID,
        confirmedOrderFromPayload.value.getOrderId(),
      );
      try {
        const confirmedOrderEvent = confirmedOrderFromPayload.value;

        if (confirmedOrderEvent.isFulfilled()) {
          /**
           * TODO Should it be 400? Maybe just 200?
           */
          logger.warn("Order is fulfilled, skipping");

          OrderConfirmedLogRequest.createErrorLog({
            sourceId: payload.order?.id,
            channelId: payload.order?.channel.id,
            errorReason: "Order already fulfilled",
          })
            .mapErr(captureException)
            .map(logWriter.writeLog);

          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "Failed to commit transaction in AvaTax: order already fulfilled",
          });

          return Response.json(
            {
              message: `Skipping fulfilled order to prevent duplication for order: ${payload.order?.id}`,
            },
            { status: 202 },
          );
        }

        if (confirmedOrderEvent.isStrategyFlatRates()) {
          logger.info("Order has flat rates tax strategy, skipping...");

          OrderConfirmedLogRequest.createErrorLog({
            sourceId: payload.order?.id,
            channelId: payload.order?.channel.id,
            errorReason: "Order has flat tax rates strategy",
          })
            .mapErr(captureException)
            .map(logWriter.writeLog);

          span.setStatus({
            code: SpanStatusCode.OK,
            message: "Failed to commit transaction in AvaTax: order has flat tax rates strategy",
          });

          return Response.json(
            {
              message: `Order ${payload.order?.id} has flat rates tax strategy.`,
            },
            { status: 202 },
          );
        }

        const appMetadata = payload.recipient?.privateMetadata ?? [];

        const configExtractor = new AppConfigExtractor();

        const config = configExtractor
          .extractAppConfigFromPrivateMetadata(appMetadata)
          .map((config) => {
            try {
              new AppConfigurationLogger(logger).logConfiguration(
                config,
                confirmedOrderEvent.getChannelSlug(),
              );
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
          OrderConfirmedLogRequest.createErrorLog({
            sourceId: payload.order?.id,
            channelId: payload.order?.channel.id,
            errorReason: "Cannot get app configuration",
          })
            .mapErr(captureException)
            .map(logWriter.writeLog);

          logger.warn("Failed to extract app config from metadata", { error: config.error });

          span.recordException(config.error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "Failed to commit AvaTax transaction: invalid configuration",
          });

          return Response.json(
            {
              message: `App configuration is broken for order: ${payload.order?.id}`,
            },
            { status: 400 },
          );
        }

        metadataCache.setMetadata(appMetadata);

        logger.debug("Confirming order...");

        const providerConfig = config.value.getConfigForChannelSlug(
          confirmedOrderEvent.getChannelSlug(),
        );

        if (providerConfig.isErr()) {
          OrderConfirmedLogRequest.createErrorLog({
            sourceId: payload.order?.id,
            channelId: payload.order?.channel.id,
            errorReason: "Invalid app configuration",
          })
            .mapErr(captureException)
            .map(logWriter.writeLog);

          span.recordException(providerConfig.error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "Failed to commit AvaTax transaction: invalid configuration",
          });

          return Response.json(
            {
              message: `App is not configured properly for order: ${payload.order?.id}`,
            },
            { status: 400 },
          );
        }

        try {
          const confirmedOrder = await confirmOrder({
            confirmedOrderEvent,
            avataxConfig: providerConfig.value.avataxConfig.config,
            authData: ctx.authData,
            discountsStrategy,
          });

          logger.info("Order confirmed", { orderId: confirmedOrder.id });

          const client = createInstrumentedGraphqlClient({
            saleorApiUrl,
            token,
          });

          const orderMetadataManager = new OrderMetadataManager(client);

          await orderMetadataManager.updateOrderMetadataWithExternalId(
            confirmedOrderEvent.getOrderId(),
            confirmedOrder.id,
          );
          logger.info("Updated order metadata with externalId");

          span.setStatus({
            code: SpanStatusCode.OK,
            message: "AvaTax transaction committed successfully",
          });

          after(async () => {
            // We ignore promise because it's not critical and can fail
            OrderConfirmedLogRequest.createSuccessLog({
              sourceId: payload.order?.id,
              channelId: payload.order?.channel.id,
              avataxId: confirmedOrder.id,
            })
              .mapErr(captureException)
              .map(logWriter.writeLog);

            const noteReporter = new OrderNoteReporter(client);

            if (!payload.order?.id) {
              return;
            }

            await noteReporter.reportOrderNote(
              payload.order.id,
              "Transaction confirmed in AvaTax: " + confirmedOrder.id,
            );
          });

          return Response.json({ message: "Success" }, { status: 200 });
        } catch (error) {
          logger.debug("Error confirming order in AvaTax", { error: error });
          span.recordException(error as Error); // todo: remove casting when error handling is refactored

          switch (true) {
            case error instanceof TaxBadPayloadError: {
              OrderConfirmedLogRequest.createErrorLog({
                sourceId: payload.order?.id,
                channelId: payload.order?.channel.id,
                errorReason: "Invalid webhook payload",
              })
                .mapErr(captureException)
                .map(logWriter.writeLog);

              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: "Failed to commit AvaTax transaction: invalid webhook payload",
              });

              return Response.json(
                {
                  message: `Order: ${payload.order?.id} data is not valid`,
                },
                { status: 400 },
              );
            }

            case error instanceof AvataxStringLengthError: {
              OrderConfirmedLogRequest.createErrorLog({
                sourceId: payload.order?.id,
                channelId: payload.order?.channel.id,
                errorReason: "Invalid address",
              })
                .mapErr(captureException)
                .map(logWriter.writeLog);

              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: "Failed to commit AvaTax transaction: error from AvaTax API",
              });

              return Response.json(
                {
                  message: `AvaTax service returned validation error: ${error?.description}`,
                },
                { status: 400 },
              );
            }

            case error instanceof AvataxEntityNotFoundError: {
              OrderConfirmedLogRequest.createErrorLog({
                sourceId: payload.order?.id,
                channelId: payload.order?.channel.id,
                errorReason: "Entity not found",
              })
                .mapErr(captureException)
                .map(logWriter.writeLog);

              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: "Failed to commit AvaTax transaction: error from AvaTax API",
              });

              return Response.json(
                {
                  message: `AvaTax service returned validation error: ${error?.description}`,
                },
                { status: 400 },
              );
            }

            case error instanceof AvataxGetTaxWrongUserInputError: {
              OrderConfirmedLogRequest.createErrorLog({
                sourceId: payload.order?.id,
                channelId: payload.order?.channel.id,
                errorReason: `Failed to commit AvaTax transaction due to user input error (${error.faultSubCode}): ${error.description}`,
              })
                .mapErr(captureException)
                .map(logWriter.writeLog);

              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: "Failed to commit AvaTax transaction: user input error",
              });

              return Response.json(
                {
                  message: `AvaTax service returned user input error (${error.faultSubCode}): ${error.description}`,
                },
                { status: 400 },
              );
            }

            case error instanceof AvataxGetTaxSystemError: {
              OrderConfirmedLogRequest.createErrorLog({
                sourceId: payload.order?.id,
                channelId: payload.order?.channel.id,
                errorReason: `Failed to commit AvaTax transaction due to system error (${error.faultSubCode}): ${error.description}`,
              })
                .mapErr(captureException)
                .map(logWriter.writeLog);

              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: "Failed to commit AvaTax transaction: system error",
              });

              // System errors should be reported to Sentry and return HTTP 500
              captureException(error);

              return Response.json(
                {
                  message: `AvaTax service returned system error (${error.faultSubCode}): ${error.description}`,
                },
                { status: 500 },
              );
            }
          }
          captureException(error);
          logger.error("Unhandled error executing webhook", { error: error });

          OrderConfirmedLogRequest.createErrorLog({
            sourceId: payload.order?.id,
            channelId: payload.order?.channel.id,
            errorReason: "Unhandled error",
          })
            .mapErr(captureException)
            .map(logWriter.writeLog);

          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "Failed to commit AvaTax transaction: unhandled error",
          });

          return Response.json({ message: "Unhandled error" }, { status: 500 });
        }
      } catch (error) {
        span.recordException(error as Error);
        captureException(error);
        logger.error("Unhandled error executing webhook", { error: error });

        OrderConfirmedLogRequest.createErrorLog({
          sourceId: payload.order?.id,
          channelId: payload.order?.channel.id,
          errorReason: "Unhandled error",
        })
          .mapErr(captureException)
          .map(logWriter.writeLog);

        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "Failed to commit AvaTax transaction: unhandled error",
        });

        return Response.json({ message: "Unhandled error" }, { status: 500 });
      }
    },
  );
});

export const POST = compose(
  withLoggerContext,
  withFlushOtelMetrics,
  withMetadataCache,
  withSpanAttributesAppRouter,
)(handler);
