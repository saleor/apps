import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import * as Sentry from "@sentry/nextjs";
import { metadataCache, wrapWithMetadataCache } from "../../../lib/app-metadata-cache";
import { createInstrumentedGraphqlClient } from "../../../lib/create-instrumented-graphql-client";
import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";
import { OrderMetadataManager } from "../../../modules/app/order-metadata-manager";
import { SaleorOrder, SaleorOrderParser } from "../../../modules/saleor";
import { TaxBadPayloadError } from "../../../modules/taxes/tax-error";
import { orderConfirmedAsyncWebhook } from "../../../modules/webhooks/definitions/order-confirmed";
import { ActiveConnectionServiceErrors } from "../../../modules/taxes/get-active-connection-service-errors";

export const config = {
  api: {
    bodyParser: false,
  },
};

const withMetadataCache = wrapWithMetadataCache(metadataCache);

export default wrapWithLoggerContext(
  withOtel(
    withMetadataCache(
      orderConfirmedAsyncWebhook.createHandler(async (req, res, ctx) => {
        const logger = createLogger("orderConfirmedAsyncWebhook", {
          saleorApiUrl: ctx.authData.saleorApiUrl,
        });
        const { payload, authData } = ctx;
        const { saleorApiUrl, token } = authData;

        if (payload.version) {
          Sentry.setTag(ObservabilityAttributes.SALEOR_VERSION, payload.version);
          loggerContext.set(ObservabilityAttributes.SALEOR_VERSION, payload.version);
        }

        logger.info("Handler called with payload");
        const parseOrderResult = SaleorOrderParser.parse(payload);

        if (parseOrderResult.isErr()) {
          const error = parseOrderResult.error;

          // Capture error when there is problem with parsing webhook payload - it should not happen
          Sentry.captureException(error);
          logger.error("Error parsing webhook payload into Saleor order", { error });
          return res.status(500).send(error.message);
        }

        if (parseOrderResult.isOk()) {
          try {
            const saleorOrder = new SaleorOrder(parseOrderResult.value);

            if (saleorOrder.isFulfilled()) {
              /**
               * TODO Should it be 400? Maybe just 200?
               */
              logger.warn("Order is fulfilled, skipping");
              return res.status(400).send("Skipping fulfilled order to prevent duplication");
            }

            if (saleorOrder.isStrategyFlatRates()) {
              logger.info("Order has flat rates tax strategy, skipping...");
              return res.status(202).send("Order has flat rates tax strategy.");
            }

            const appMetadata = payload.recipient?.privateMetadata ?? [];

            metadataCache.setMetadata(appMetadata);

            const getActiveConnectionService = await import(
              "../../../modules/taxes/get-active-connection-service"
            ).then((m) => m.getActiveConnectionService);

            const taxProviderResult = getActiveConnectionService(
              saleorOrder.channelSlug,
              appMetadata,
            );

            logger.debug("Confirming order...");

            if (taxProviderResult.isOk()) {
              const { config, taxProvider } = taxProviderResult.value;

              try {
                const confirmedOrder = await taxProvider.confirmOrder(
                  // @ts-expect-error: OrderConfirmedSubscriptionFragment is deprecated
                  payload.order,
                  saleorOrder,
                  config,
                  ctx.authData,
                );

                logger.info("Order confirmed", { orderId: confirmedOrder.id });
                const client = createInstrumentedGraphqlClient({
                  saleorApiUrl,
                  token,
                });

                const orderMetadataManager = new OrderMetadataManager(client);

                await orderMetadataManager.updateOrderMetadataWithExternalId(
                  saleorOrder.id,
                  confirmedOrder.id,
                );
                logger.info("Updated order metadata with externalId");

                return res.status(200).end();
              } catch (error) {
                logger.debug("Error confirming order", { error });

                switch (true) {
                  case error instanceof TaxBadPayloadError: {
                    return res.status(400).send("Order data is not valid.");
                  }
                }
                Sentry.captureException(error);
                logger.error("Unhandled error executing webhook", { error });

                return res.status(500).send("Unhandled error");
              }
            }

            if (taxProviderResult.isErr()) {
              const error = taxProviderResult.error;

              logger.debug("Error confirming order", { error });

              switch (true) {
                case error instanceof ActiveConnectionServiceErrors.WrongChannelError: {
                  /**
                   * Subscription can listen on every channel or no channels.
                   * However, app works only for some of them (which are configured to be used with taxes routing).
                   * If this happens, webhook will be received, but this is no-op.
                   */
                  return res.status(202).send("Channel not configured with the app.");
                }

                case error instanceof ActiveConnectionServiceErrors.MissingMetadataError:
                case error instanceof
                  ActiveConnectionServiceErrors.ProviderNotAssignedToChannelError:
                case error instanceof ActiveConnectionServiceErrors.BrokenConfigurationError: {
                  return res.status(400).send("App is not configured properly.");
                }
                case error instanceof ActiveConnectionServiceErrors.MissingChannelSlugError: {
                  return res
                    .status(500)
                    .send("Webhook didn't contain channel slug. This should not happen.");
                }
                default: {
                  Sentry.captureException(taxProviderResult.error);
                  logger.fatal("Unhandled error", { error });

                  return res.status(500).send("Unhandled error");
                }
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
