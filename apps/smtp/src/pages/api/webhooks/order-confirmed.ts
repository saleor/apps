import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import { gql } from "urql";
import {
  OrderConfirmedWebhookPayloadFragment,
  OrderDetailsFragmentDoc,
} from "../../../../generated/graphql";
import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";
import { saleorApp } from "../../../saleor-app";

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
  query: OrderConfirmedGraphqlSubscription,
});

const handler: NextWebhookApiHandler<OrderConfirmedWebhookPayloadFragment> = async (
  req,
  res,
  context,
) => {
  const logger = createLogger(orderConfirmedWebhook.webhookPath);

  logger.info("Webhook received - for order confirmed event");

  return res.status(200).json({ message: "The event has been handled" });
};

export default wrapWithLoggerContext(
  withOtel(orderConfirmedWebhook.createHandler(handler), "api/webhooks/order-confirmed"),
  loggerContext,
);

export const config = {
  api: {
    bodyParser: false,
  },
};
