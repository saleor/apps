import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  OrderFulfilledEventSubscriptionFragment,
  UntypedOrderFulfilledSubscriptionDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { createLogger } from "../../../lib/logger";

export const config = {
  api: {
    bodyParser: false,
  },
};

type ExpectedWebhookPayload = Extract<
  OrderFulfilledEventSubscriptionFragment,
  { __typename: "OrderFulfilled" }
>;

export const orderFulfilledAsyncWebhook = new SaleorAsyncWebhook<ExpectedWebhookPayload>({
  name: "OrderFulfilled",
  apl: saleorApp.apl,
  event: "ORDER_FULFILLED",
  query: UntypedOrderFulfilledSubscriptionDocument,
  webhookPath: "/api/webhooks/order-fulfilled",
});

// commit order on order_fulfilled
export default orderFulfilledAsyncWebhook.createHandler(async (req, res, ctx) => {
  const logger = createLogger({ event: ctx.event });
  const { payload } = ctx;
  logger.info({ payload }, "Handler called with payload");

  return res.status(200);
});
