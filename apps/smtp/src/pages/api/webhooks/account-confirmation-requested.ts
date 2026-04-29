import { type NextJsWebhookHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";
import { captureException } from "@sentry/nextjs";
import { gql } from "urql";

import { type AccountConfirmationRequestedWebhookPayloadFragment } from "../../../../generated/graphql";
import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";
import { SendEventMessagesUseCaseFactory } from "../../../modules/event-handlers/use-case/send-event-messages.use-case.factory";
import { saleorApp } from "../../../saleor-app";
import { handleUseCaseErrors } from "./send-event-messages-response-handler";

const AccountConfirmationRequestedWebhookPayload = gql`
  fragment AccountConfirmationRequestedWebhookPayload on AccountConfirmationRequested {
    user {
      id
      email
      firstName
      lastName
    }
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

const AccountConfirmationRequestedGraphqlSubscription = gql`
  ${AccountConfirmationRequestedWebhookPayload}
  subscription AccountConfirmationRequested {
    event {
      ...AccountConfirmationRequestedWebhookPayload
    }
  }
`;

export const accountConfirmationRequestedWebhook =
  new SaleorAsyncWebhook<AccountConfirmationRequestedWebhookPayloadFragment>({
    name: "Account Confirmation Requested in Saleor",
    webhookPath: "api/webhooks/account-confirmation-requested",
    event: "ACCOUNT_CONFIRMATION_REQUESTED",
    apl: saleorApp.apl,
    query: AccountConfirmationRequestedGraphqlSubscription,
  });

const logger = createLogger(accountConfirmationRequestedWebhook.webhookPath);

const useCaseFactory = new SendEventMessagesUseCaseFactory();

export const handler: NextJsWebhookHandler<
  AccountConfirmationRequestedWebhookPayloadFragment
> = async (req, res, context) => {
  logger.info("Webhook received");

  const { payload, authData } = context;
  const { user, channel, redirectUrl, token, shop } = payload;

  const recipientEmail = user?.email;

  if (!recipientEmail?.length) {
    logger.error("No recipient email in payload. Aborting.");

    return res
      .status(200)
      .json({ error: "Email recipient has not been specified in the event payload." });
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
        event: "ACCOUNT_CONFIRMATION_REQUESTED",
        payload: { user, redirectUrl, token, channel, shop },
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
  withSpanAttributes(accountConfirmationRequestedWebhook.createHandler(handler)),
  loggerContext,
);

export const config = {
  api: {
    bodyParser: false,
  },
};
