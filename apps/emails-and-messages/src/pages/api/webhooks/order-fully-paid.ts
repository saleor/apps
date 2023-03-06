import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { saleorApp } from "../../../saleor-app";
import { logger as pinoLogger } from "../../../lib/logger";
import {
  OrderDetailsFragmentDoc,
  OrderFullyPaidWebhookPayloadFragment,
} from "../../../../generated/graphql";
import { sendEventMessages } from "../../../modules/event-handlers/send-event-messages";

const OrderFullyPaidWebhookPayload = gql`
  ${OrderDetailsFragmentDoc}

  fragment OrderFullyPaidWebhookPayload on OrderFullyPaid {
    order {
      ...OrderDetails
    }
  }
`;

const OrderFullyPaidGraphqlSubscription = gql`
  ${OrderFullyPaidWebhookPayload}
  subscription OrderFullyPaid {
    event {
      ...OrderFullyPaidWebhookPayload
    }
  }
`;

export const orderFullyPaidWebhook = new SaleorAsyncWebhook<OrderFullyPaidWebhookPayloadFragment>({
  name: "Order Fully Paid in Saleor",
  webhookPath: "api/webhooks/order-fully-paid",
  asyncEvent: "ORDER_FULLY_PAID",
  apl: saleorApp.apl,
  subscriptionQueryAst: OrderFullyPaidGraphqlSubscription,
});

const handler: NextWebhookApiHandler<OrderFullyPaidWebhookPayloadFragment> = async (
  req,
  res,
  context
) => {
  const logger = pinoLogger.child({
    webhook: orderFullyPaidWebhook.name,
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
    event: "ORDER_FULLY_PAID",
    payload: { order: payload.order },
    recipientEmail,
  });

  return res.status(200).json({ message: "The event has been handled" });
};

export default orderFullyPaidWebhook.createHandler(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
