import { SpanKind, SpanStatusCode } from "@opentelemetry/api";
import { AuthData } from "@saleor/app-sdk/APL";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared";
import * as Sentry from "@sentry/nextjs";
import { captureException } from "@sentry/nextjs";

import { AppConfigExtractor } from "@/lib/app-config-extractor";
import { AppConfigurationLogger } from "@/lib/app-configuration-logger";
import { appInternalTracer } from "@/lib/app-internal-tracer";
import { metadataCache, wrapWithMetadataCache } from "@/lib/app-metadata-cache";
import { createInstrumentedGraphqlClient } from "@/lib/create-instrumented-graphql-client";
import { SubscriptionPayloadErrorChecker } from "@/lib/error-utils";
import { createLogger } from "@/logger";
import { loggerContext, withLoggerContext } from "@/logger-context";
import { OrderMetadataManager } from "@/modules/app/order-metadata-manager";
import { AvataxConfig } from "@/modules/avatax/avatax-connection-schema";
import { PriceReductionDiscountsStrategy } from "@/modules/avatax/discounts";
import { createAvaTaxOrderConfirmedAdapterFromAvaTaxConfig } from "@/modules/avatax/order-confirmed/avatax-order-confirmed-adapter-factory";
import { ClientLogStoreRequest } from "@/modules/client-logs/client-log";
import { LogWriterFactory } from "@/modules/client-logs/log-writer-factory";
import { SaleorOrderConfirmedEvent } from "@/modules/saleor";
import {
  AvataxEntityNotFoundError,
  AvataxStringLengthError,
  TaxBadPayloadError,
} from "@/modules/taxes/tax-error";
import { orderConfirmedAsyncWebhook } from "@/modules/webhooks/definitions/order-confirmed";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger("orderConfirmedAsyncWebhook");

const withMetadataCache = wrapWithMetadataCache(metadataCache);
const subscriptionErrorChecker = new SubscriptionPayloadErrorChecker(logger, captureException);
const discountStrategy = new PriceReductionDiscountsStrategy();

const logsWriterFactory = new LogWriterFactory();

/**
 * In the future this should be part of the use-case
 */
async function confirmOrder(
  confirmedOrderEvent: SaleorOrderConfirmedEvent,
  avataxConfig: AvataxConfig,
  authData: AuthData,
  discountStrategy: PriceReductionDiscountsStrategy,
) {
  const avataxOrderConfirmedAdapter =
    createAvaTaxOrderConfirmedAdapterFromAvaTaxConfig(avataxConfig);

  const response = await avataxOrderConfirmedAdapter.send(
    { confirmedOrderEvent },
    avataxConfig,
    authData,
    discountStrategy,
  );

  return response;
}

const handler = orderConfirmedAsyncWebhook.createHandler(async (req, res, ctx) => {
  return appInternalTracer.startActiveSpan(
    "executing orderConfirmed handler",
    {
      kind: SpanKind.SERVER,
    },
    async (span) => {
      const { payload, authData } = ctx;

      span.setAttribute(ObservabilityAttributes.SALEOR_API_URL, authData.saleorApiUrl);

      const logWriter = logsWriterFactory.createWriter(ctx.authData);

      subscriptionErrorChecker.checkPayload(payload);

      const { saleorApiUrl, token } = authData;

      if (payload.version) {
        Sentry.setTag(ObservabilityAttributes.SALEOR_VERSION, payload.version);
        loggerContext.set(ObservabilityAttributes.SALEOR_VERSION, payload.version);
        span.setAttribute(ObservabilityAttributes.SALEOR_VERSION, payload.version);
      }

      logger.info("Handler called with payload");
      const confirmedOrderFromPayload = SaleorOrderConfirmedEvent.createFromGraphQL(payload);

      if (confirmedOrderFromPayload.isErr()) {
        const error = confirmedOrderFromPayload.error;

        // Capture error when there is problem with parsing webhook payload - it should not happen
        Sentry.captureException(error);
        logger.error("Error parsing webhook payload into Saleor order", { error });

        ClientLogStoreRequest.create({
          level: "error",
          message: "Failed to commit order. Unhandled error.",
          checkoutOrOrderId: payload.order?.id,
          checkoutOrOrder: "order",
          channelId: payload.order?.channel.slug,
        })
          .mapErr(captureException)
          .map(logWriter.writeLog);

        span.recordException(error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "Failed to commit transaction for order. Unhandled error.",
        });
        span.end();

        return res.status(500).json({ message: error.message });
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

          ClientLogStoreRequest.create({
            level: "info",
            message: "Skip commiting - order already fulfilled",
            checkoutOrOrderId: payload.order?.id,
            checkoutOrOrder: "order",
            channelId: payload.order?.channel.slug,
          })
            .mapErr(captureException)
            .map(logWriter.writeLog);

          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "Skip commiting transaction - order already fulfilled",
          });
          span.end();

          return res.status(400).json({
            message: `Skipping fulfilled order to prevent duplication for order: ${payload.order?.id}`,
          });
        }

        if (confirmedOrderEvent.isStrategyFlatRates()) {
          logger.info("Order has flat rates tax strategy, skipping...");

          ClientLogStoreRequest.create({
            level: "info",
            message: "Skip commiting - order has flat tax rates strategy",
            checkoutOrOrderId: payload.order?.id,
            checkoutOrOrder: "order",
            channelId: payload.order?.channel.slug,
          })
            .mapErr(captureException)
            .map(logWriter.writeLog);

          span.setStatus({
            code: SpanStatusCode.OK,
            message: "Order has flat rates tax strategy - skipping commiting transaction",
          });
          span.end();

          return res
            .status(202)
            .json({ message: `Order ${payload.order?.id} has flat rates tax strategy.` });
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
          ClientLogStoreRequest.create({
            level: "error",
            message: "Failed to commit order. Configuration error.",
            checkoutOrOrderId: payload.order?.id,
            checkoutOrOrder: "order",
            channelId: payload.order?.channel.slug,
          })
            .mapErr(captureException)
            .map(logWriter.writeLog);

          logger.warn("Failed to extract app config from metadata", { error: config.error });

          span.recordException(config.error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "App configuration is broken",
          });
          span.end();

          return res
            .status(400)
            .json({ message: `App configuration is broken for order: ${payload.order?.id}` });
        }

        metadataCache.setMetadata(appMetadata);

        logger.debug("Confirming order...");

        const providerConfig = config.value.getConfigForChannelSlug(
          confirmedOrderEvent.getChannelSlug(),
        );

        if (providerConfig.isErr()) {
          ClientLogStoreRequest.create({
            level: "error",
            message: "Failed to commit order. Configuration error.",
            checkoutOrOrderId: payload.order?.id,
            checkoutOrOrder: "order",
            channelId: payload.order?.channel.slug,
          })
            .mapErr(captureException)
            .map(logWriter.writeLog);

          span.recordException(providerConfig.error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "Failed to commit transaction due to invalid configuration",
          });
          span.end();

          return res.status(400).json({
            message: `App is not configured properly for order: ${payload.order?.id}`,
          });
        }

        try {
          const confirmedOrder = await confirmOrder(
            confirmedOrderEvent,
            providerConfig.value.avataxConfig.config,
            ctx.authData,
            discountStrategy,
          );

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

          ClientLogStoreRequest.create({
            level: "info",
            message: "Order committed successfully",
            checkoutOrOrderId: payload.order?.id,
            checkoutOrOrder: "order",
            channelId: payload.order?.channel.slug,
            attributes: {
              confirmedOrderId: confirmedOrder.id,
            },
          })
            .mapErr(captureException)
            .map(logWriter.writeLog);

          span.setStatus({
            code: SpanStatusCode.OK,
            message: "Transaction committed successfully",
          });
          span.end();

          return res.status(200).end();
        } catch (error) {
          logger.debug("Error confirming order", { error: error });
          span.recordException(error as Error); // todo: remove casting when error handling is refactored

          switch (true) {
            case error instanceof TaxBadPayloadError: {
              ClientLogStoreRequest.create({
                level: "error",
                message: "Failed to commit order. Webhook payload invalid",
                checkoutOrOrderId: payload.order?.id,
                checkoutOrOrder: "order",
                channelId: payload.order?.channel.slug,
              })
                .mapErr(captureException)
                .map(logWriter.writeLog);

              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: "Failed to commit transaction due to invalid payload",
              });
              span.end();

              return res
                .status(400)
                .json({ message: `Order: ${payload.order?.id} data is not valid` });
            }
            case error instanceof AvataxStringLengthError: {
              ClientLogStoreRequest.create({
                level: "error",
                message: `Failed to commit order: ${error?.description} `,
                checkoutOrOrderId: payload.order?.id,
                checkoutOrOrder: "order",
                channelId: payload.order?.channel.slug,
              })
                .mapErr(captureException)
                .map(logWriter.writeLog);

              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: "Failed to commit transaction due to invalid payload",
              });
              span.end();

              return res.status(400).json({
                message: `AvaTax service returned validation error: ${error?.description}`,
              });
            }
            case error instanceof AvataxEntityNotFoundError: {
              ClientLogStoreRequest.create({
                level: "error",
                message: `Failed to commit order: ${error?.description} `,
                checkoutOrOrderId: payload.order?.id,
                checkoutOrOrder: "order",
                channelId: payload.order?.channel.slug,
              })
                .mapErr(captureException)
                .map(logWriter.writeLog);

              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: "Failed to commit transaction due to AvaTax entity not found",
              });
              span.end();

              return res.status(400).json({
                message: `AvaTax service returned validation error: ${error?.description}`,
              });
            }
          }
          Sentry.captureException(error);
          logger.error("Unhandled error executing webhook", { error: error });

          ClientLogStoreRequest.create({
            level: "error",
            message: `Failed to commit order: Unhandled error `,
            checkoutOrOrderId: payload.order?.id,
            checkoutOrOrder: "order",
            channelId: payload.order?.channel.slug,
          })
            .mapErr(captureException)
            .map(logWriter.writeLog);

          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "Failed to commit transaction. (Unhandled error)",
          });
          span.end();

          return res.status(500).json({ message: "Unhandled error" });
        }
      } catch (error) {
        span.recordException(error as Error);
        Sentry.captureException(error);
        logger.error("Unhandled error executing webhook", { error: error });

        ClientLogStoreRequest.create({
          level: "error",
          message: `Failed to commit order: Unhandled error `,
          checkoutOrOrderId: payload.order?.id,
          checkoutOrOrder: "order",
          channelId: payload.order?.channel.slug,
        })
          .mapErr(captureException)
          .map(logWriter.writeLog);

        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "Failed to commit transaction. (Unhandled error)",
        });
        span.end();

        return res.status(500).json({ message: "Unhandled error" });
      }
    },
  );
});

export default compose(withLoggerContext, withMetadataCache, withSpanAttributes)(handler);
