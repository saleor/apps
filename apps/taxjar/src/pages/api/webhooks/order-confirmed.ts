import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  OrderConfirmedEventSubscriptionFragment,
  OrderStatus,
  UntypedOrderConfirmedSubscriptionDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { getActiveConnectionService } from "../../../modules/taxes/get-active-connection-service";
import { WebhookResponse } from "../../../modules/app/webhook-response";
import { withOtel } from "@saleor/apps-otel";
import { createLogger } from "../../../logger";
import { createInstrumentedGraphqlClient } from "../../../lib/create-instrumented-graphql-client";

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

export default withOtel(
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
      const taxProvider = getActiveConnectionService(channelSlug, appMetadata, ctx.authData);

      // todo: figure out what fields are needed and add validation
      if (!payload.order) {
        return webhookResponse.error(new Error("Insufficient order data"));
      }

      if (payload.order.status === OrderStatus.Fulfilled) {
        return webhookResponse.error(new Error("Skipping fulfilled order to prevent duplication"));
      }

      logger.info("Confirming order...");

      const confirmedOrder = await taxProvider.confirmOrder(payload.order);

      logger.info("Order confirmed", { confirmedOrder });
      const client = createInstrumentedGraphqlClient({
        saleorApiUrl,
        token,
      });

      logger.info("Updated order metadata with externalId");

      return webhookResponse.success();
    } catch (error) {
      logger.error("Error executing webhook", { error });
      return webhookResponse.error(error);
    }
  }),
  "/api/webhooks/order-confirmed",
);
