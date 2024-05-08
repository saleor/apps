import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { saleorApp } from "../../../saleor-app";
import {
  OrderDetailsFragmentDoc,
  OrderFullyPaidWebhookPayloadFragment,
} from "../../../../generated/graphql";
import { sendEventMessages } from "../../../modules/event-handlers/send-event-messages";
import { withOtel } from "@saleor/apps-otel";
import { createLogger } from "../../../logger";
import { createInstrumentedGraphqlClient } from "../../../lib/create-instrumented-graphql-client";

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

const logger = createLogger(orderFullyPaidWebhook.webhookPath);

const handler: NextWebhookApiHandler<OrderFullyPaidWebhookPayloadFragment> = async (
  req,
  res,
  context,
) => {
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
  const client = createInstrumentedGraphqlClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });

  await sendEventMessages({
    authData,
    channel,
    client,
    event: "ORDER_FULLY_PAID",
    payload: { order: payload.order },
    recipientEmail,
  });

  return res.status(200).json({ message: "The event has been handled" });
};

export default withOtel(
  orderFullyPaidWebhook.createHandler(handler),
  "api/webhooks/order-fully-paid",
);

export const config = {
  api: {
    bodyParser: false,
  },
};
