import { type NextJsWebhookHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";
import { captureException } from "@sentry/nextjs";
import { gql } from "urql";

import { type FulfillmentApprovedWebhookPayloadFragment } from "../../../../generated/graphql";
import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";
import { SendEventMessagesUseCaseFactory } from "../../../modules/event-handlers/use-case/send-event-messages.use-case.factory";
import { saleorApp } from "../../../saleor-app";
import { handleUseCaseErrors } from "./send-event-messages-response-handler";

const FulfillmentApprovedWebhookPayload = gql`
  fragment FulfillmentApprovedWebhookPayload on FulfillmentApproved {
    fulfillment {
      id
      trackingNumber
    }
    order {
      id
      number
      userEmail
      channel {
        slug
        name
      }
    }
  }
`;

const FulfillmentApprovedGraphqlSubscription = gql`
  ${FulfillmentApprovedWebhookPayload}
  subscription FulfillmentApproved {
    event {
      ...FulfillmentApprovedWebhookPayload
    }
  }
`;

export const fulfillmentApprovedWebhook =
  new SaleorAsyncWebhook<FulfillmentApprovedWebhookPayloadFragment>({
    name: "Fulfillment Approved in Saleor",
    webhookPath: "api/webhooks/fulfillment-approved",
    event: "FULFILLMENT_APPROVED",
    apl: saleorApp.apl,
    query: FulfillmentApprovedGraphqlSubscription,
  });

const logger = createLogger(fulfillmentApprovedWebhook.webhookPath);

const useCaseFactory = new SendEventMessagesUseCaseFactory();

export const handler: NextJsWebhookHandler<FulfillmentApprovedWebhookPayloadFragment> = async (
  req,
  res,
  context,
) => {
  logger.info("Webhook received");

  const { payload, authData } = context;
  const { fulfillment, order } = payload;

  if (!order) {
    logger.error("No order in payload. Aborting.");

    return res.status(200).json({ error: "Order has not been specified in the event payload." });
  }

  const recipientEmail = order.userEmail;

  if (!recipientEmail?.length) {
    logger.error(`The order ${order.number} had no email recipient set. Aborting.`);

    return res
      .status(200)
      .json({ error: "Email recipient has not been specified in the event payload." });
  }

  const channelSlug = order.channel?.slug;

  if (!channelSlug) {
    logger.error(`The order ${order.number} had no channel set. Aborting.`);

    return res.status(200).json({ error: "Channel has not been specified in the event payload." });
  }

  loggerContext.set(ObservabilityAttributes.CHANNEL_SLUG, channelSlug);

  const useCase = useCaseFactory.createFromAuthData(authData);

  try {
    return useCase
      .sendEventMessages({
        channelSlug,
        event: "FULFILLMENT_APPROVED",
        payload: { fulfillment, order },
        recipientEmail,
        saleorApiUrl: authData.saleorApiUrl,
      })
      .then((result) =>
        result.match(
          (_r) => {
            logger.info("Successfully sent email(s)");

            return res.status(200).json({ message: "The event has been handled" });
          },
          (errors) => handleUseCaseErrors({ errors, logger, res }),
        ),
      );
  } catch (e) {
    logger.error("Unhandled error from useCase", {
      error: e,
    });

    captureException(e);

    return res.status(500).send("Failed to execute webhook");
  }
};

export default wrapWithLoggerContext(
  withSpanAttributes(fulfillmentApprovedWebhook.createHandler(handler)),
  loggerContext,
);

export const config = {
  api: {
    bodyParser: false,
  },
};
