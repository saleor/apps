import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import * as Sentry from "@sentry/nextjs";
import { captureException } from "@sentry/nextjs";
import { waitUntil } from "@vercel/functions";
import { AppConfigExtractor } from "../../../lib/app-config-extractor";
import { AppConfigurationLogger } from "../../../lib/app-configuration-logger";
import { metadataCache, wrapWithMetadataCache } from "../../../lib/app-metadata-cache";
import { createInstrumentedGraphqlClient } from "../../../lib/create-instrumented-graphql-client";
import { SubscriptionPayloadErrorChecker } from "../../../lib/error-utils";
import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";
import { OrderMetadataManager } from "../../../modules/app/order-metadata-manager";
import {
  AvataxTransactionCreateFailedBadPayload,
  AvataxTransactionCreateFailedUnhandledError,
  AvataxTransactionCreatedLog,
  SaleorOrderConfirmedLog,
} from "../../../modules/public-log-drain/public-events";
import { PublicLogDrainService } from "../../../modules/public-log-drain/public-log-drain.service";
import { LogDrainJsonTransporter } from "../../../modules/public-log-drain/transporters/public-log-drain-json-transporter";
import { LogDrainOtelTransporter } from "../../../modules/public-log-drain/transporters/public-log-drain-otel-transporter";
import { SaleorOrderConfirmedEvent } from "../../../modules/saleor";
import { TaxBadPayloadError } from "../../../modules/taxes/tax-error";
import { orderConfirmedAsyncWebhook } from "../../../modules/webhooks/definitions/order-confirmed";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger("orderConfirmedAsyncWebhook");

const withMetadataCache = wrapWithMetadataCache(metadataCache);
const subscriptionErrorChecker = new SubscriptionPayloadErrorChecker(logger, captureException);

const otelLogDrainTransporter = new LogDrainOtelTransporter();
const jsonLogDrainTransporter = new LogDrainJsonTransporter();

const publicLoggerOtel = new PublicLogDrainService([]);

export default wrapWithLoggerContext(
  withOtel(
    withMetadataCache(
      orderConfirmedAsyncWebhook.createHandler(async (req, res, ctx) => {
        const { payload, authData } = ctx;

        subscriptionErrorChecker.checkPayload(payload);

        const { saleorApiUrl, token } = authData;

        if (payload.version) {
          Sentry.setTag(ObservabilityAttributes.SALEOR_VERSION, payload.version);
          loggerContext.set(ObservabilityAttributes.SALEOR_VERSION, payload.version);
        }

        logger.info("Handler called with payload");
        const confirmedOrderFromPayload = SaleorOrderConfirmedEvent.createFromGraphQL(payload);

        if (confirmedOrderFromPayload.isErr()) {
          const error = confirmedOrderFromPayload.error;

          // Capture error when there is problem with parsing webhook payload - it should not happen
          Sentry.captureException(error);
          logger.error("Error parsing webhook payload into Saleor order", { error });
          return res.status(500).send(error.message);
        }

        if (confirmedOrderFromPayload.isOk()) {
          try {
            const confirmedOrderEvent = confirmedOrderFromPayload.value;

            if (confirmedOrderEvent.isFulfilled()) {
              /**
               * TODO Should it be 400? Maybe just 200?
               */
              logger.warn("Order is fulfilled, skipping");
              return res.status(400).send("Skipping fulfilled order to prevent duplication");
            }

            if (confirmedOrderEvent.isStrategyFlatRates()) {
              logger.info("Order has flat rates tax strategy, skipping...");
              return res.status(202).send("Order has flat rates tax strategy.");
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
              logger.warn("Failed to extract app config from metadata", { error: config.error });

              return res.status(400).send("App configuration is broken");
            }

            metadataCache.setMetadata(appMetadata);

            const AvataxWebhookServiceFactory = await import(
              "../../../modules/taxes/avatax-webhook-service-factory"
            ).then((m) => m.AvataxWebhookServiceFactory);

            const webhookServiceResult = AvataxWebhookServiceFactory.createFromConfig(
              config.value,
              confirmedOrderEvent.getChannelSlug(),
            );

            logger.debug("Confirming order...");

            if (webhookServiceResult.isOk()) {
              const { taxProvider } = webhookServiceResult.value;
              const providerConfig = config.value.getConfigForChannelSlug(
                confirmedOrderEvent.getChannelSlug(),
              );

              if (providerConfig.isErr()) {
                return res.status(400).send("App is not configured properly.");
              }

              if (providerConfig.value.avataxConfig.config.logsSettings?.otel.enabled) {
                let headers: Record<string, string>;

                try {
                  headers = JSON.parse(
                    providerConfig.value.avataxConfig.config.logsSettings.otel.headers ?? "",
                  );
                } catch {
                  headers = {};
                }
                const url = providerConfig.value.avataxConfig.config.logsSettings.otel.url ?? "";

                otelLogDrainTransporter.setSettings({
                  headers,
                  url,
                });

                publicLoggerOtel.addTransporter(otelLogDrainTransporter);
              }

              if (providerConfig.value.avataxConfig.config.logsSettings?.json.enabled) {
                let headers: Record<string, string>;

                try {
                  headers = JSON.parse(
                    providerConfig.value.avataxConfig.config.logsSettings.json.headers ?? "",
                  );
                } catch {
                  headers = {};
                }
                const url = providerConfig.value.avataxConfig.config.logsSettings.json.url ?? "";

                jsonLogDrainTransporter.setSettings({
                  endpoint: url,
                  headers,
                });
                publicLoggerOtel.addTransporter(jsonLogDrainTransporter);
              }

              try {
                const confirmedOrder = await taxProvider.confirmOrder(
                  // @ts-expect-error: OrderConfirmedSubscriptionFragment is deprecated
                  payload.order,
                  confirmedOrderEvent,
                  providerConfig.value.avataxConfig.config,
                  ctx.authData,
                );

                logger.info("Order confirmed", { orderId: confirmedOrder.id });
                waitUntil(
                  publicLoggerOtel.emitLog(
                    new AvataxTransactionCreatedLog({
                      orderId: confirmedOrderEvent.getOrderId(),
                      avataxTransactionId: confirmedOrder.id,
                      saleorApiUrl,
                    }),
                  ),
                );

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
                waitUntil(
                  publicLoggerOtel.emitLog(
                    new SaleorOrderConfirmedLog({
                      orderId: confirmedOrderEvent.getOrderId(),
                      saleorApiUrl,
                    }),
                  ),
                );

                return res.status(200).end();
              } catch (error) {
                logger.debug("Error confirming order", { error });

                switch (true) {
                  case error instanceof TaxBadPayloadError: {
                    waitUntil(
                      publicLoggerOtel.emitLog(
                        new AvataxTransactionCreateFailedBadPayload({
                          orderId: confirmedOrderEvent.getOrderId(),
                          saleorApiUrl,
                        }),
                      ),
                    );
                    return res.status(400).send("Order data is not valid.");
                  }
                }
                Sentry.captureException(error);
                logger.error("Unhandled error executing webhook", { error });

                waitUntil(
                  publicLoggerOtel.emitLog(
                    new AvataxTransactionCreateFailedUnhandledError({
                      orderId: confirmedOrderEvent.getOrderId(),
                      saleorApiUrl,
                    }),
                  ),
                );

                return res.status(500).send("Unhandled error");
              }
            }
          } catch (error) {
            Sentry.captureException(error);
            logger.error("Unhandled error executing webhook", { error });

            return res.status(500).send("Unhandled error");
          }
        }
      }),
    ),
    "/api/webhooks/order-confirmed",
  ),
  loggerContext,
);
