import { type NextJsWebhookHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";
import { captureException } from "@sentry/nextjs";
import { gql } from "urql";

import { type CustomerDeletedWebhookPayloadFragment } from "../../../../generated/graphql";
import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";
import { SendEventMessagesUseCaseFactory } from "../../../modules/event-handlers/use-case/send-event-messages.use-case.factory";
import { saleorApp } from "../../../saleor-app";
import { handleUseCaseErrors } from "./send-event-messages-response-handler";

const CustomerDeletedWebhookPayload = gql`
  fragment CustomerDeletedWebhookPayload on CustomerDeleted {
    user {
      id
      email
      firstName
      lastName
    }
  }
`;

const CustomerDeletedGraphqlSubscription = gql`
  ${CustomerDeletedWebhookPayload}
  subscription CustomerDeleted {
    event {
      ...CustomerDeletedWebhookPayload
    }
  }
`;

export const customerDeletedWebhook = new SaleorAsyncWebhook<CustomerDeletedWebhookPayloadFragment>(
  {
    name: "Customer Deleted in Saleor",
    webhookPath: "api/webhooks/customer-deleted",
    event: "CUSTOMER_DELETED",
    apl: saleorApp.apl,
    query: CustomerDeletedGraphqlSubscription,
  },
);

const logger = createLogger(customerDeletedWebhook.webhookPath);

const useCaseFactory = new SendEventMessagesUseCaseFactory();

export const handler: NextJsWebhookHandler<CustomerDeletedWebhookPayloadFragment> = async (
  req,
  res,
  context,
) => {
  logger.info("Webhook received");

  const { payload, authData } = context;
  const { user } = payload;

  const recipientEmail = user?.email;

  if (!recipientEmail?.length) {
    logger.error("No recipient email in payload. Aborting.");

    return res
      .status(200)
      .json({ error: "Email recipient has not been specified in the event payload." });
  }

  const useCase = useCaseFactory.createFromAuthData(authData);

  try {
    return useCase
      .sendEventMessages({
        /*
         * CustomerDeleted has no channel in the subscription payload — pass empty
         * string so configurations are not filtered by channel.
         */
        channelSlug: "",
        event: "CUSTOMER_DELETED",
        payload: { user },
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
  withSpanAttributes(customerDeletedWebhook.createHandler(handler)),
  loggerContext,
);

export const config = {
  api: {
    bodyParser: false,
  },
};
