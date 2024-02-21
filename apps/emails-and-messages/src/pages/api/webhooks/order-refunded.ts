import { OrderDetailsFragmentDoc } from "../../../../generated/graphql";
import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { saleorApp } from "../../../saleor-app";
import { OrderRefundedWebhookPayloadFragment } from "../../../../generated/graphql";
import { sendEventMessages } from "../../../modules/event-handlers/send-event-messages";
import { withOtel } from "@saleor/apps-otel";
import { createLogger } from "../../../logger";
import { createInstrumentedGraphqlClient } from "../../../lib/create-instrumented-graphql-client";

const OrderRefundedWebhookPayload = gql`
  ${OrderDetailsFragmentDoc}
  fragment OrderRefundedWebhookPayload on OrderRefunded {
    order {
      ...OrderDetails
    }
  }
`;

const OrderRefundedGraphqlSubscription = gql`
  ${OrderRefundedWebhookPayload}
  subscription OrderRefunded {
    event {
      ...OrderRefundedWebhookPayload
    }
  }
`;

export const orderRefundedWebhook = new SaleorAsyncWebhook<OrderRefundedWebhookPayloadFragment>({
  name: "Order Refunded in Saleor",
  webhookPath: "api/webhooks/order-refunded",
  asyncEvent: "ORDER_REFUNDED",
  apl: saleorApp.apl,
  subscriptionQueryAst: OrderRefundedGraphqlSubscription,
});

const logger = createLogger(orderRefundedWebhook.webhookPath);

const handler: NextWebhookApiHandler<OrderRefundedWebhookPayloadFragment> = async (
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
    event: "ORDER_REFUNDED",
    payload: { order: payload.order },
    recipientEmail,
  });

  return res.status(200).json({ message: "The event has been handled" });
};

export default withOtel(orderRefundedWebhook.createHandler(handler), "api/webhooks/order-refunded");

export const config = {
  api: {
    bodyParser: false,
  },
};
