import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import { captureException } from "@sentry/nextjs";
import { gql } from "urql";
import { OrderCreatedWebhookPayloadFragment } from "../../../../generated/graphql";
import { loggerContext } from "../../../logger-context";
import { SendEventMessagesUseCase } from "../../../modules/event-handlers/use-case/send-event-messages.use-case";
import { SendEventMessagesUseCaseFactory } from "../../../modules/event-handlers/use-case/send-event-messages.use-case.factory";
import { saleorApp } from "../../../saleor-app";
import { OrderDetailsFragmentDoc } from "./../../../../generated/graphql";

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

const useCaseFactory = new SendEventMessagesUseCaseFactory();

const handler: NextWebhookApiHandler<OrderCreatedWebhookPayloadFragment> = async (
  req,
  res,
  context,
) => {
  const { payload, authData } = context;
  const { order } = payload;

  if (!order) {
    return res.status(200).end();
  }

  const recipientEmail = order.userEmail || order.user?.email;

  if (!recipientEmail?.length) {
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
      event: "ORDER_CREATED",
      payload: { order: payload.order },
      recipientEmail,
    })
    .then((result) =>
      result.match(
        (r) => {
          return res.status(200).json({ message: "The event has been handled" });
        },
        (err) => {
          const errorInstance = err[0];

          if (errorInstance instanceof SendEventMessagesUseCase.ServerError) {
            return res.status(500).json({ message: "Failed to send email" });
          } else if (errorInstance instanceof SendEventMessagesUseCase.ClientError) {
            return res.status(400).json({ message: "Failed to send email" });
          } else if (errorInstance instanceof SendEventMessagesUseCase.NoOpError) {
            return res.status(200).json({ message: "The event has been handled [no op]" });
          }

          captureException(new Error("Unhandled useCase error", { cause: err }));

          return res.status(500).json({ message: "Failed to send email [unhandled]" });
        },
      ),
    );
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
