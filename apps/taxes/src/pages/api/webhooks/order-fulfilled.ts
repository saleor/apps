import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  OrderFulfilledEventSubscriptionFragment,
  UntypedOrderFulfilledSubscriptionDocument,
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

type OrderFulfilledPayload = Extract<
  OrderFulfilledEventSubscriptionFragment,
  { __typename: "OrderFulfilled" }
>;

export const orderFulfilledAsyncWebhook = new SaleorAsyncWebhook<OrderFulfilledPayload>({
  name: "OrderFulfilled",
  apl: saleorApp.apl,
  event: "ORDER_FULFILLED",
  query: UntypedOrderFulfilledSubscriptionDocument,
  webhookPath: "/api/webhooks/order-fulfilled",
});

export default orderFulfilledAsyncWebhook.createHandler(async (req, res, ctx) => {
  const logger = createLogger({ event: ctx.event });
  const { payload } = ctx;
  const webhookResponse = new WebhookResponse(res);

  logger.info("Handler called with payload");

  try {
    const appMetadata = payload.recipient?.privateMetadata ?? [];
    const channelSlug = payload.order?.channel.slug;
    const taxProvider = getActiveConnectionService(channelSlug, appMetadata, ctx.authData);

    logger.info("Fetched taxProvider");

    // todo: figure out what fields are needed and add validation
    if (!payload.order) {
      return webhookResponse.error(new Error("Insufficient order data"));
    }
    await taxProvider.fulfillOrder(payload.order);

    logger.info("Order fulfilled");

    return webhookResponse.success();
  } catch (error) {
    return webhookResponse.error(new Error("Error while fulfilling tax provider order"));
  }
});
