import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  OrderCancelledEventSubscriptionFragment,
  UntypedOrderCancelledSubscriptionDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { getActiveConnectionService } from "../../../modules/taxes/get-active-connection-service";
import { WebhookResponse } from "../../../modules/app/webhook-response";
import { withOtel } from "@saleor/apps-otel";
import { createLogger } from "../../../logger";
export const config = {
  api: {
    bodyParser: false,
  },
};

export type OrderCancelledPayload = Extract<
  OrderCancelledEventSubscriptionFragment,
  { __typename: "OrderCancelled" }
>;

export const orderCancelledAsyncWebhook = new SaleorAsyncWebhook<OrderCancelledPayload>({
  name: "OrderCancelled",
  apl: saleorApp.apl,
  event: "ORDER_CANCELLED",
  query: UntypedOrderCancelledSubscriptionDocument,
  webhookPath: "/api/webhooks/order-cancelled",
});

export default withOtel(
  orderCancelledAsyncWebhook.createHandler(async (req, res, ctx) => {
    const logger = createLogger("orderCancelledAsyncWebhook", {
      saleorApiUrl: ctx.authData.saleorApiUrl,
    });
    const { payload } = ctx;
    const webhookResponse = new WebhookResponse(res);

    logger.info("Handler called with payload");

    if (!payload.order) {
      return webhookResponse.error(new Error("Insufficient order data"));
    }

    try {
      const appMetadata = payload.recipient?.privateMetadata ?? [];
      const channelSlug = payload.order.channel.slug;
      const taxProvider = getActiveConnectionService(channelSlug, appMetadata, ctx.authData);

      logger.info("Cancelling order...");

      await taxProvider.cancelOrder(payload);

      logger.info("Order cancelled");

      return webhookResponse.success();
    } catch (error) {
      return webhookResponse.error(error);
    }
  }),
  "/api/webhooks/order-cancelled",
);
