import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { saleorApp } from "../../../saleor-app";
import { GiftCardSentWebhookPayloadFragment } from "../../../../generated/graphql";
import { withOtel } from "@saleor/apps-otel";
import { createLogger } from "../../../logger";
import { SendEventMessagesUseCaseFactory } from "../../../modules/event-handlers/use-case/send-event-messages.use-case.factory";
import { SendEventMessagesUseCase } from "../../../modules/event-handlers/use-case/send-event-messages.use-case";
import { captureException } from "@sentry/nextjs";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { loggerContext } from "../../../logger-context";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";

const GiftCardSentWebhookPayload = gql`
  fragment GiftCardSentWebhookPayload on GiftCardSent {
    giftCard {
      id
      code
      displayCode
      last4CodeChars
      created
      usedByEmail
      isActive
      metadata {
        key
        value
      }
      privateMetadata {
        key
        value
      }
      initialBalance {
        currency
        amount
      }
      currentBalance {
        currency
        amount
      }
      tags {
        id
        name
      }
      expiryDate
      lastUsedOn
      usedBy {
        firstName
        lastName
        email
      }
    }
    sentToEmail
    channel
  }
`;

const GiftCardSentGraphqlSubscription = gql`
  ${GiftCardSentWebhookPayload}
  subscription GiftCardSent {
    event {
      ...GiftCardSentWebhookPayload
    }
  }
`;

export const giftCardSentWebhook = new SaleorAsyncWebhook<GiftCardSentWebhookPayloadFragment>({
  name: "Gift card sent in Saleor",
  webhookPath: "api/webhooks/gift-card-sent",
  asyncEvent: "GIFT_CARD_SENT",
  apl: saleorApp.apl,
  query: GiftCardSentGraphqlSubscription,
});

const logger = createLogger(giftCardSentWebhook.webhookPath);

const useCaseFactory = new SendEventMessagesUseCaseFactory();

const handler: NextWebhookApiHandler<GiftCardSentWebhookPayloadFragment> = async (
  req,
  res,
  context,
) => {
  logger.info("Webhook received");

  const { payload, authData } = context;
  const { giftCard } = payload;

  if (!giftCard) {
    logger.error("No gift card data payload");

    return res.status(200).end();
  }

  const recipientEmail = payload.sentToEmail;

  if (!recipientEmail?.length) {
    logger.error(`The gift card had no email recipient set. Aborting.`, {
      giftCardId: giftCard.id,
    });

    return res
      .status(200)
      .json({ error: "Email recipient has not been specified in the event payload." });
  }

  const channel = payload.channel;

  if (!channel) {
    logger.error("No channel specified in payload", { channel });

    return res.status(200).end();
  }

  loggerContext.set(ObservabilityAttributes.CHANNEL_SLUG, channel);

  const useCase = useCaseFactory.createFromAuthData(authData);

  try {
    return useCase
      .sendEventMessages({
        channelSlug: channel,
        event: "GIFT_CARD_SENT",
        payload,
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
  withOtel(giftCardSentWebhook.createHandler(handler), "/api/webhooks/gift-card-sent"),
  loggerContext,
);

export const config = {
  api: {
    bodyParser: false,
  },
};
