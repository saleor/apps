import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { z } from "zod";
import {
  OrderCreatedEventSubscriptionFragment,
  UntypedOrderCreatedSubscriptionDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { createLogger } from "../../../lib/logger";

export const config = {
  api: {
    bodyParser: false,
  },
};

type ExpectedWebhookPayload = Extract<
  OrderCreatedEventSubscriptionFragment,
  { __typename: "OrderCreated" }
>;

export const orderCreatedAsyncWebhook = new SaleorAsyncWebhook<ExpectedWebhookPayload>({
  name: "OrderCreated",
  apl: saleorApp.apl,
  event: "ORDER_CREATED",
  query: UntypedOrderCreatedSubscriptionDocument,
  webhookPath: "/api/webhooks/order-created",
});

// create order on order_created
export default orderCreatedAsyncWebhook.createHandler(async (req, res, ctx) => {
  const logger = createLogger({ event: ctx.event });
  const { payload } = ctx;
  logger.info({ payload }, "Handler called with payload");

  return res.status(200);
});
