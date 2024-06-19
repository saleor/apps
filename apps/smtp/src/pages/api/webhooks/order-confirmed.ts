import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { saleorApp } from "../../../saleor-app";
import {
  OrderConfirmedWebhookPayloadFragment,
  OrderDetailsFragmentDoc,
} from "../../../../generated/graphql";
import { withOtel } from "@saleor/apps-otel";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { loggerContext } from "../../../logger-context";

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
  console.log("empty handler - nothing else than log");

  res.status(200).end();
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
