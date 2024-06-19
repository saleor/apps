import { OrderDetailsFragmentDoc } from "./../../../../generated/graphql";
import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { saleorApp } from "../../../saleor-app";
import { OrderCreatedWebhookPayloadFragment } from "../../../../generated/graphql";
import { withOtel } from "@saleor/apps-otel";
import { createLogger } from "../../../logger";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { loggerContext } from "../../../logger-context";

const OrderCreatedWebhookPayload = gql`
  ${OrderDetailsFragmentDoc}
  fragment OrderCreatedWebhookPayload on OrderCreated {
    order {
      ...OrderDetails
    }
  }
`;

const OrderCreatedGraphqlSubscription = gql`
  ${OrderCreatedWebhookPayload}
  subscription OrderCreated {
    event {
      ...OrderCreatedWebhookPayload
    }
  }
`;

export const orderCreatedWebhook = new SaleorAsyncWebhook<OrderCreatedWebhookPayloadFragment>({
  name: "Order Created in Saleor",
  webhookPath: "api/webhooks/order-created",
  asyncEvent: "ORDER_CREATED",
  apl: saleorApp.apl,
  query: OrderCreatedGraphqlSubscription,
});

const logger = createLogger(orderCreatedWebhook.webhookPath);

const handler: NextWebhookApiHandler<OrderCreatedWebhookPayloadFragment> = async (
  req,
  res,
  context,
) => {
  console.log("empty handler - logger.info");
  logger.info("Webhook received");

  return res.status(200).end();
};

export default wrapWithLoggerContext(
  withOtel(orderCreatedWebhook.createHandler(handler), "api/webhooks/order-created"),
  loggerContext,
);

export const config = {
  api: {
    bodyParser: false,
  },
};
