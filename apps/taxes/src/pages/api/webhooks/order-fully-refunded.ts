import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import {
  OrderFullyRefundedEventSubscriptionFragment,
  UntypedOrderFullyRefundedSubscriptionDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { createLogger } from "../../../lib/logger";
import { WebhookResponse } from "../../../modules/app/webhook-response";
import { getActiveConnectionService } from "../../../modules/taxes/get-active-connection-service";

export const config = {
  api: {
    bodyParser: false,
  },
};

export type OrderFullyRefundedPayload = Extract<
  OrderFullyRefundedEventSubscriptionFragment,
  { __typename: "OrderFullyRefunded" }
>;

export const orderFullyRefundedAsyncWebhook = new SaleorAsyncWebhook<OrderFullyRefundedPayload>({
  name: "OrderRefunded",
  apl: saleorApp.apl,
  event: "ORDER_FULLY_REFUNDED",
  query: UntypedOrderFullyRefundedSubscriptionDocument,
  webhookPath: "/api/webhooks/order-fully-refunded",
});

export default orderFullyRefundedAsyncWebhook.createHandler(async (req, res, ctx) => {
  const logger = createLogger({ event: ctx.event });
  const { payload } = ctx;
  const webhookResponse = new WebhookResponse(res);

  logger.debug("Handler called with payload");

  try {
    const order = payload.order;

    if (!order) {
      throw new Error("Insufficient order data");
    }

    const appMetadata = payload.recipient?.privateMetadata ?? [];
    const channelSlug = order.channel.slug;
    const taxProvider = getActiveConnectionService(channelSlug, appMetadata, ctx.authData);

    logger.info("Refunding order...");

    const refundedOrder = await taxProvider.refundTransaction(payload);

    logger.info({ refundedOrder }, "Order refunded");

    return webhookResponse.success();
  } catch (error) {
    return webhookResponse.error(error);
  }
});
