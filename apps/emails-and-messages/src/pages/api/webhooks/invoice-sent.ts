import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { saleorApp } from "../../../saleor-app";
import { logger as pinoLogger } from "../../../lib/logger";
import {
  InvoiceSentWebhookPayloadFragment,
  OrderDetailsFragmentDoc,
} from "../../../../generated/graphql";
import { sendEventMessages } from "../../../modules/event-handlers/send-event-messages";

const InvoiceSentWebhookPayload = gql`
  ${OrderDetailsFragmentDoc}
  fragment InvoiceSentWebhookPayload on InvoiceSent {
    invoice {
      id
      message
      externalUrl
      url
      order {
        id
      }
    }
    order {
      ...OrderDetails
    }
  }
`;

const InvoiceSentGraphqlSubscription = gql`
  ${InvoiceSentWebhookPayload}
  subscription InvoiceSent {
    event {
      ...InvoiceSentWebhookPayload
    }
  }
`;

export const invoiceSentWebhook = new SaleorAsyncWebhook<InvoiceSentWebhookPayloadFragment>({
  name: "Invoice sent in Saleor",
  webhookPath: "api/webhooks/invoice-sent",
  asyncEvent: "INVOICE_SENT",
  apl: saleorApp.apl,
  subscriptionQueryAst: InvoiceSentGraphqlSubscription,
});

const handler: NextWebhookApiHandler<InvoiceSentWebhookPayloadFragment> = async (
  req,
  res,
  context
) => {
  const logger = pinoLogger.child({
    webhook: invoiceSentWebhook.name,
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
    event: "INVOICE_SENT",
    payload: { order: payload.order },
    recipientEmail,
  });

  return res.status(200).json({ message: "The event has been handled" });
};

export default invoiceSentWebhook.createHandler(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
