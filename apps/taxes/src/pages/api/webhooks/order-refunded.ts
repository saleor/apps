import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  OrderRefundedEventSubscriptionFragment,
  UntypedOrderRefundedSubscriptionDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { createLogger } from "../../../lib/logger";
import { getActiveConnectionService } from "../../../modules/taxes/get-active-connection-service";
import { WebhookResponse } from "../../../modules/app/webhook-response";

export const config = {
  api: {
    bodyParser: false,
  },
};

export type OrderRefundedPayload = Extract<
  OrderRefundedEventSubscriptionFragment,
  { __typename: "OrderRefunded" }
>;

export const orderRefundedAsyncWebhook = new SaleorAsyncWebhook<OrderRefundedPayload>({
  name: "OrderRefunded",
  apl: saleorApp.apl,
  event: "ORDER_REFUNDED",
  query: UntypedOrderRefundedSubscriptionDocument,
  webhookPath: "/api/webhooks/order-refunded",
});

export default orderRefundedAsyncWebhook.createHandler(async (req, res, ctx) => {
  const logger = createLogger({ event: ctx.event });
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

    logger.info("Refunding order...");

    await taxProvider.refundOrder(payload);

    logger.info("Order refunded");

    return webhookResponse.success();
  } catch (error) {
    return webhookResponse.error(error);
  }
});
