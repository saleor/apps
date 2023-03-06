import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { saleorApp } from "../../../saleor-app";
import { logger as pinoLogger } from "../../../lib/logger";
import {
  OrderConfirmedWebhookPayloadFragment,
  OrderDetailsFragmentDoc,
} from "../../../../generated/graphql";
import { sendEventMessages } from "../../../modules/event-handlers/send-event-messages";

const OrderConfirmedWebhookPayload = gql`
  ${OrderDetailsFragmentDoc}

  fragment OrderConfirmedWebhookPayload on OrderConfirmed {
    order {
      ...OrderDetails
    }
  }
`;

const OrderConfirmedGraphqlSubscription = gql`
  ${OrderConfirmedWebhookPayload}
  subscription OrderConfirmed {
    event {
      ...OrderConfirmedWebhookPayload
    }
  }
`;

export const orderConfirmedWebhook = new SaleorAsyncWebhook<OrderConfirmedWebhookPayloadFragment>({
  name: "Order Confirmed in Saleor",
  webhookPath: "api/webhooks/order-confirmed",
  asyncEvent: "ORDER_CONFIRMED",
  apl: saleorApp.apl,
  subscriptionQueryAst: OrderConfirmedGraphqlSubscription,
});

const handler: NextWebhookApiHandler<OrderConfirmedWebhookPayloadFragment> = async (
  req,
  res,
  context
) => {
  const logger = pinoLogger.child({
    webhook: orderConfirmedWebhook.name,
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
    event: "ORDER_CONFIRMED",
    payload: { order: payload.order },
    recipientEmail,
  });

  return res.status(200).json({ message: "The event has been handled" });
};

export default orderConfirmedWebhook.createHandler(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
