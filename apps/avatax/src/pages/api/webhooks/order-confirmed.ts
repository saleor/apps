import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import * as Sentry from "@sentry/nextjs";
import { OrderStatus } from "../../../../generated/graphql";
import { createInstrumentedGraphqlClient } from "../../../lib/create-instrumented-graphql-client";
import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";
import { OrderMetadataManager } from "../../../modules/app/order-metadata-manager";
import { WebhookResponse } from "../../../modules/app/webhook-response";
import {
  ActiveConnectionServiceErrors,
  getActiveConnectionService,
} from "../../../modules/taxes/get-active-connection-service";
import { orderConfirmedAsyncWebhook } from "../../../modules/webhooks/definitions/order-confirmed";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default wrapWithLoggerContext(
  withOtel(
    orderConfirmedAsyncWebhook.createHandler(async (req, res, ctx) => {
      const logger = createLogger("orderConfirmedAsyncWebhook", {
        saleorApiUrl: ctx.authData.saleorApiUrl,
      });
      const { payload, authData } = ctx;
      const { saleorApiUrl, token } = authData;
      const webhookResponse = new WebhookResponse(res);

      if (payload.version) {
        Sentry.setTag(ObservabilityAttributes.SALEOR_VERSION, payload.version);
        loggerContext.set(ObservabilityAttributes.SALEOR_VERSION, payload.version);
      }

      logger.info("Handler called with payload");

      try {
        const appMetadata = payload.recipient?.privateMetadata ?? [];
        const channelSlug = payload.order?.channel.slug;
        const taxProviderResult = getActiveConnectionService(
          channelSlug,
          appMetadata,
          ctx.authData,
        );

        // todo: figure out what fields are needed and add validation
        if (!payload.order) {
          const error = new Error("Insufficient order data");

          Sentry.captureException(error);
          return webhookResponse.error(error);
        }

        if (payload.order.status === OrderStatus.Fulfilled) {
          return webhookResponse.error(
            new Error("Skipping fulfilled order to prevent duplication"),
          );
        }

        logger.debug("Confirming order...");

        if (taxProviderResult.isOk()) {
          try {
            const confirmedOrder = await taxProviderResult.value.confirmOrder(payload.order);

            logger.info("Order confirmed", { orderId: confirmedOrder.id });
            const client = createInstrumentedGraphqlClient({
              saleorApiUrl,
              token,
            });

            const orderMetadataManager = new OrderMetadataManager(client);

            await orderMetadataManager.updateOrderMetadataWithExternalId(
              payload.order.id,
              confirmedOrder.id,
            );
            logger.info("Updated order metadata with externalId");

            return webhookResponse.success();
          } catch (error) {
            logger.debug("Error confirming order", { error });

            switch (true) {
              case error instanceof TaxBadPayloadError: {
                // @ts-ignore - Vercel uses old version of Typescript
                return res.status(400).send("Order data is not valid.");
              }
            }

            logger.error("Unhandled error executing webhook", { error });
            return webhookResponse.error(error);
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
            case error instanceof ActiveConnectionServiceErrors.ProviderNotAssignedToChannelError:
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
        return webhookResponse.error(error);
      }
    }),
    "/api/webhooks/order-confirmed",
  ),
  loggerContext,
);
