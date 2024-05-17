import { OrderDetailsFragmentDoc } from "./../../../../generated/graphql";
import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { saleorApp } from "../../../saleor-app";
import { OrderCreatedWebhookPayloadFragment } from "../../../../generated/graphql";
import { withOtel } from "@saleor/apps-otel";
import { createLogger } from "../../../logger";
import { SendEventMessagesUseCaseFactory } from "../../../modules/event-handlers/use-case/send-event-messages.use-case.factory";
import { SendEventMessagesUseCase } from "../../../modules/event-handlers/use-case/send-event-messages.use-case";
import { captureException } from "@sentry/nextjs";

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

const useCaseFactory = new SendEventMessagesUseCaseFactory();

const handler: NextWebhookApiHandler<OrderCreatedWebhookPayloadFragment> = async (
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

  const useCase = useCaseFactory.createFromAuthData(authData);

  return useCase
    .sendEventMessages({
      channelSlug: channel,
      event: "ORDER_CREATED",
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
          switch (err[0].constructor) {
            case SendEventMessagesUseCase.ServerError: {
              logger.error("Failed to send email(s) [server error]", { error: err });

              return res.status(500).json({ message: "Failed to send email" });
            }
            case SendEventMessagesUseCase.ClientError: {
              logger.info("Failed to send email(s) [client error]", { error: err });

              return res.status(400).json({ message: "Failed to send email" });
            }
            case SendEventMessagesUseCase.NoOpError: {
              logger.error("Sending emails aborted [no op]", { error: err });

              return res.status(200).json({ message: "The event has been handled [no op]" });
            }
            default: {
              logger.error("Failed to send email(s) [server error]", { error: err });
              captureException(new Error("Unhandled useCase error", { cause: err }));

              return res.status(500).json({ message: "Failed to send email [unhandled]" });
            }
          }
        },
      ),
    );
};

export default withOtel(orderCreatedWebhook.createHandler(handler), "api/webhooks/order-created");

export const config = {
  api: {
    bodyParser: false,
  },
};
