import { NextJsWebhookHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";
import { captureException } from "@sentry/nextjs";
import { gql } from "urql";

import {
  OrderDetailsFragmentDoc,
  OrderFullyPaidWebhookPayloadFragment,
} from "../../../../generated/graphql";
import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";
import { SendEventMessagesUseCase } from "../../../modules/event-handlers/use-case/send-event-messages.use-case";
import { SendEventMessagesUseCaseFactory } from "../../../modules/event-handlers/use-case/send-event-messages.use-case.factory";
import { saleorApp } from "../../../saleor-app";

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
  event: "ORDER_FULLY_PAID",
  apl: saleorApp.apl,
  query: OrderFullyPaidGraphqlSubscription,
});

const logger = createLogger(orderFullyPaidWebhook.webhookPath);

const useCaseFactory = new SendEventMessagesUseCaseFactory();

const handler: NextJsWebhookHandler<OrderFullyPaidWebhookPayloadFragment> = async (
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

  try {
    return useCase
      .sendEventMessages({
        channelSlug: channel,
        event: "ORDER_FULLY_PAID",
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
      );
  } catch (e) {
    logger.error("Unhandled error from useCase", {
      error: e,
    });

    captureException(e);

    return res.status(500).json({ message: "Failed to execute webhook" });
  }
};

export default wrapWithLoggerContext(
  withSpanAttributes(orderFullyPaidWebhook.createHandler(handler)),
  loggerContext,
);

export const config = {
  api: {
    bodyParser: false,
  },
};
