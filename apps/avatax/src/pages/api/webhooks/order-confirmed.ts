import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  OrderConfirmedEventSubscriptionFragment,
  OrderStatus,
  UntypedOrderConfirmedSubscriptionDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import {
  ActiveConnectionServiceErrors,
  getActiveConnectionService,
} from "../../../modules/taxes/get-active-connection-service";
import { WebhookResponse } from "../../../modules/app/webhook-response";
import { OrderMetadataManager } from "../../../modules/app/order-metadata-manager";
import { withOtel } from "@saleor/apps-otel";
import { createLogger } from "../../../logger";
import { createInstrumentedGraphqlClient } from "../../../lib/create-instrumented-graphql-client";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { loggerContext } from "../../../logger-context";

export const config = {
  api: {
    bodyParser: false,
  },
};

type OrderConfirmedPayload = Extract<
  OrderConfirmedEventSubscriptionFragment,
  { __typename: "OrderConfirmed" }
>;

export const orderConfirmedAsyncWebhook = new SaleorAsyncWebhook<OrderConfirmedPayload>({
  name: "OrderConfirmed",
  apl: saleorApp.apl,
  event: "ORDER_CONFIRMED",
  query: UntypedOrderConfirmedSubscriptionDocument,
  webhookPath: "/api/webhooks/order-confirmed",
});

export default wrapWithLoggerContext(
  withOtel(
    orderConfirmedAsyncWebhook.createHandler(async (req, res, ctx) => {
      const logger = createLogger("orderConfirmedAsyncWebhook", {
        saleorApiUrl: ctx.authData.saleorApiUrl,
      });
      const { payload, authData } = ctx;
      const { saleorApiUrl, token } = authData;
      const webhookResponse = new WebhookResponse(res);

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
          return webhookResponse.error(new Error("Insufficient order data"));
        }

        if (payload.order.status === OrderStatus.Fulfilled) {
          return webhookResponse.error(
            new Error("Skipping fulfilled order to prevent duplication"),
          );
        }

        logger.info("Confirming order...");

        if (taxProviderResult.isOk()) {
          const confirmedOrder = await taxProviderResult.value.confirmOrder(payload.order);

          logger.info("Order confirmed", { confirmedOrder });
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
        }

        if (taxProviderResult.isErr()) {
          const error = taxProviderResult.error;

          logger.debug("Error confirming order", { error });

          /**
           * Subscription can listen on every channel or no channels.
           * However, app works only for some of them (which are configured to be used with taxes routing).
           * If this happens, webhook will be received, but this is no-op.
           */
          if (error instanceof ActiveConnectionServiceErrors.WrongChannelError) {
            return res.status(202).send("Channel not configured with the app.");
          }

          /**
           * TODO: Proceed with mapping rest of errors
           */
          return webhookResponse.error(taxProviderResult.error);
        }
      } catch (error) {
        logger.error("Error executing webhook", { error });
        return webhookResponse.error(error);
      }
    }),
    "/api/webhooks/order-confirmed",
  ),
  loggerContext,
);
