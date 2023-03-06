import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { saleorApp } from "../../../saleor-app";
import { logger as pinoLogger } from "../../../lib/logger";
import {
  OrderDetailsFragmentDoc,
  OrderFulfilledWebhookPayloadFragment,
} from "../../../../generated/graphql";
import { sendEventMessages } from "../../../modules/event-handlers/send-event-messages";

const OrderFulfilledWebhookPayload = gql`
  ${OrderDetailsFragmentDoc}

  fragment OrderFulfilledWebhookPayload on OrderFulfilled {
    order {
      ...OrderDetails
    }
  }
`;

const OrderFulfilledGraphqlSubscription = gql`
  ${OrderFulfilledWebhookPayload}
  subscription OrderFulfilled {
    event {
      ...OrderFulfilledWebhookPayload
    }
  }
`;

export const orderFulfilledWebhook = new SaleorAsyncWebhook<OrderFulfilledWebhookPayloadFragment>({
  name: "Order Fulfilled in Saleor",
  webhookPath: "api/webhooks/order-fulfilled",
  asyncEvent: "ORDER_FULFILLED",
  apl: saleorApp.apl,
  subscriptionQueryAst: OrderFulfilledGraphqlSubscription,
});

const handler: NextWebhookApiHandler<OrderFulfilledWebhookPayloadFragment> = async (
  req,
  res,
  context
) => {
  const logger = pinoLogger.child({
    webhook: orderFulfilledWebhook.name,
  });

  logger.debug("Webhook received");

  const { payload, authData } = context;
  const { order } = payload;

  if (!order) {
    logger.error("No order data payload");
    return res.status(200).end();
  }

  const recipientEmail = order.userEmail || order.user?.email;
  if (!recipientEmail?.length) {
    logger.error(`The order ${order.number} had no email recipient set. Aborting.`);
    return res
      .status(200)
      .json({ error: "Email recipient has not been specified in the event payload." });
  }

  const channel = order.channel.slug;

  await sendEventMessages({
    authData,
    channel,
    event: "ORDER_FULFILLED",
    payload: { order: payload.order },
    recipientEmail,
  });

  return res.status(200).json({ message: "The event has been handled" });
};

export default orderFulfilledWebhook.createHandler(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
