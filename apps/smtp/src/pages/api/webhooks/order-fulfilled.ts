import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { saleorApp } from "../../../saleor-app";
import {
  OrderDetailsFragmentDoc,
  OrderFulfilledWebhookPayloadFragment,
} from "../../../../generated/graphql";
import { withOtel } from "@saleor/apps-otel";
import { createLogger } from "../../../logger";
import { SendEventMessagesUseCaseFactory } from "../../../modules/event-handlers/use-case/send-event-messages.use-case.factory";
import { SendEventMessagesUseCase } from "../../../modules/event-handlers/use-case/send-event-messages.use-case";
import { captureException } from "@sentry/nextjs";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { loggerContext } from "../../../logger-context";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";

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

const logger = createLogger(orderFulfilledWebhook.webhookPath);

const useCaseFactory = new SendEventMessagesUseCaseFactory();

const handler: NextWebhookApiHandler<OrderFulfilledWebhookPayloadFragment> = async (
  req,
  res,
  context,
) => {
  logger.info("Webhook received");

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

  loggerContext.set(ObservabilityAttributes.CHANNEL_SLUG, channel);

  const useCase = useCaseFactory.createFromAuthData(authData);

  return useCase
    .sendEventMessages({
      channelSlug: channel,
      event: "ORDER_FULFILLED",
      payload: { order: payload.order },
      recipientEmail,
    })
    .then((result) =>
      result.match(
        (r) => {
          logger.info("Successfully sent email(s)");

          return res.status(200).json({ message: "The event has been handled" });
        },
        (err) => {
          const errorInstance = err[0];

          if (errorInstance instanceof SendEventMessagesUseCase.ServerError) {
            logger.error("Failed to send email(s) [server error]", { error: err });

            return res.status(500).json({ message: "Failed to send email" });
          } else if (errorInstance instanceof SendEventMessagesUseCase.ClientError) {
            logger.info("Failed to send email(s) [client error]", { error: err });

            return res.status(400).json({ message: "Failed to send email" });
          } else if (errorInstance instanceof SendEventMessagesUseCase.NoOpError) {
            logger.info("Sending emails aborted [no op]", { error: err });

            return res.status(200).json({ message: "The event has been handled [no op]" });
          }

          logger.error("Failed to send email(s) [unhandled error]", { error: err });
          captureException(new Error("Unhandled useCase error", { cause: err }));

          return res.status(500).json({ message: "Failed to send email [unhandled]" });
        },
      ),
    )
    .catch((e) => {
      console.log("error in use case fulfilled");

      return res.status(500).send("error");
    });
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
