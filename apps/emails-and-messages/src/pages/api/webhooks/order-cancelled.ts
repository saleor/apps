import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { saleorApp } from "../../../saleor-app";
import { logger as pinoLogger } from "../../../lib/logger";
import {
  OrderCancelledWebhookPayloadFragment,
  OrderDetailsFragmentDoc,
} from "../../../../generated/graphql";
import { sendEventMessages } from "../../../modules/event-handlers/send-event-messages";
import { createClient } from "../../../lib/create-graphql-client";

const OrderCancelledWebhookPayload = gql`
  ${OrderDetailsFragmentDoc}
  fragment OrderCancelledWebhookPayload on OrderCancelled {
    order {
      ...OrderDetails
    }
  }
`;

const OrderCancelledGraphqlSubscription = gql`
  ${OrderCancelledWebhookPayload}
  subscription OrderCancelled {
    event {
      ...OrderCancelledWebhookPayload
    }
  }
`;

export const orderCancelledWebhook = new SaleorAsyncWebhook<OrderCancelledWebhookPayloadFragment>({
  name: "Order Cancelled in Saleor",
  webhookPath: "api/webhooks/order-cancelled",
  asyncEvent: "ORDER_CANCELLED",
  apl: saleorApp.apl,
  subscriptionQueryAst: OrderCancelledGraphqlSubscription,
});

const handler: NextWebhookApiHandler<OrderCancelledWebhookPayloadFragment> = async (
  req,
  res,
  context
) => {
  const logger = pinoLogger.child({
    webhook: orderCancelledWebhook.name,
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
  const client = createClient(authData.saleorApiUrl, async () =>
    Promise.resolve({ token: authData.token })
  );

  await sendEventMessages({
    authData,
    channel,
    client,
    event: "ORDER_CANCELLED",
    payload: { order: payload.order },
    recipientEmail,
  });

  return res.status(200).json({ message: "The event has been handled" });
};

export default orderCancelledWebhook.createHandler(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
