import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  OrderFulfilledEventSubscriptionFragment,
  UntypedOrderFulfilledSubscriptionDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { createLogger } from "../../../lib/logger";
import { getActiveTaxProvider } from "../../../modules/taxes/active-tax-provider";
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

  logger.info({ payload }, "Handler called with payload");

  try {
    const appMetadata = payload.recipient?.privateMetadata ?? [];
    const channelSlug = payload.order?.channel.slug;
    const activeTaxProvider = getActiveTaxProvider(channelSlug, appMetadata);

    if (!activeTaxProvider.ok) {
      logger.info("Returning no data");
      return webhookResponse.failureNoRetry(activeTaxProvider.error);
    }

    logger.info({ activeTaxProvider }, "Fetched activeTaxProvider");
    const taxProvider = activeTaxProvider.data;

    // todo: figure out what fields are needed and add validation
    if (!payload.order) {
      return webhookResponse.failureNoRetry("Insufficient order data");
    }
    const fulfilledOrder = await taxProvider.fulfillOrder(payload.order);

    logger.info({ fulfilledOrder }, "Order fulfilled");

    return webhookResponse.success();
  } catch (error) {
    return webhookResponse.failureRetry("Error while fulfilling tax provider order");
  }
});
