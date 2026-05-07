import { type NextJsWebhookHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";
import { captureException } from "@sentry/nextjs";
import { gql } from "urql";

import { type AccountEmailChangedWebhookPayloadFragment } from "../../../../generated/graphql";
import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";
import { SendEventMessagesUseCaseFactory } from "../../../modules/event-handlers/use-case/send-event-messages.use-case.factory";
import { saleorApp } from "../../../saleor-app";
import { handleUseCaseErrors } from "./send-event-messages-response-handler";

const AccountEmailChangedWebhookPayload = gql`
  fragment AccountEmailChangedWebhookPayload on AccountEmailChanged {
    user {
      id
      email
      firstName
      lastName
    }
    newEmail
    redirectUrl
    token
    channel {
      slug
    }
    shop {
      name
      domain {
        host
      }
    }
  }
`;

const AccountEmailChangedGraphqlSubscription = gql`
  ${AccountEmailChangedWebhookPayload}
  subscription AccountEmailChanged {
    event {
      ...AccountEmailChangedWebhookPayload
    }
  }
`;

export const accountEmailChangedWebhook =
  new SaleorAsyncWebhook<AccountEmailChangedWebhookPayloadFragment>({
    name: "Account Email Changed in Saleor",
    webhookPath: "api/webhooks/account-email-changed",
    event: "ACCOUNT_EMAIL_CHANGED",
    apl: saleorApp.apl,
    query: AccountEmailChangedGraphqlSubscription,
  });

const logger = createLogger(accountEmailChangedWebhook.webhookPath);

const useCaseFactory = new SendEventMessagesUseCaseFactory();

export const handler: NextJsWebhookHandler<AccountEmailChangedWebhookPayloadFragment> = async (
  req,
  res,
  context,
) => {
  logger.info("Webhook received");

  const { payload, authData } = context;
  const { user, channel, redirectUrl, token, shop, newEmail } = payload;

  // Recipient is the NEW email address (confirming the switch took effect).
  const recipientEmail = newEmail;

  if (!recipientEmail?.length) {
    logger.error("No newEmail in payload. Aborting.");

    return res
      .status(200)
      .json({ error: "Email recipient (newEmail) has not been specified in the event payload." });
  }

  const channelSlug = channel?.slug;

  if (!channelSlug) {
    logger.error("No channel in payload. Aborting.");

    return res.status(200).json({ error: "Channel has not been specified in the event payload." });
  }

  loggerContext.set(ObservabilityAttributes.CHANNEL_SLUG, channelSlug);

  const useCase = useCaseFactory.createFromAuthData(authData);

  try {
    return useCase
      .sendEventMessages({
        channelSlug,
        event: "ACCOUNT_EMAIL_CHANGED",
        payload: { user, newEmail, redirectUrl, token, channel, shop },
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
  withSpanAttributes(accountEmailChangedWebhook.createHandler(handler)),
  loggerContext,
);

export const config = {
  api: {
    bodyParser: false,
  },
};
