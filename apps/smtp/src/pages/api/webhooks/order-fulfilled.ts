import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { saleorApp } from "../../../saleor-app";
import {
  OrderDetailsFragmentDoc,
  OrderFulfilledWebhookPayloadFragment,
} from "../../../../generated/graphql";
import { withOtel } from "@saleor/apps-otel";
import { captureMessage } from "@sentry/nextjs";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { loggerContext } from "../../../logger-context";

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
  query: OrderFulfilledGraphqlSubscription,
});

const handler: NextWebhookApiHandler<OrderFulfilledWebhookPayloadFragment> = async (
  req,
  res,
  context,
) => {
  console.log("empty handler + sentry ");

  captureMessage("test", { level: "debug" });

  res.status(200).end();
};

export default wrapWithLoggerContext(
  withOtel(orderFulfilledWebhook.createHandler(handler), "api/webhooks/order-fulfilled"),
  loggerContext,
);

export const config = {
  api: {
    bodyParser: false,
  },
};
