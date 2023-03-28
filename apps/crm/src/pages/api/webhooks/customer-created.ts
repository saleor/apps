import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { saleorApp } from "../../../saleor-app";
import { logger as pinoLogger } from "../../../lib/logger";
import { CustomerDataFragment } from "../../../../generated/graphql";
import { createClient } from "../../../lib/create-graphq-client";
import { MailchimpConfigSettingsManager } from "../../../modules/mailchimp/mailchimp-config-settings-manager";
import { MailchimpClientOAuth } from "../../../modules/mailchimp/mailchimp-client";

const CustomerCreatedWebhookPayload = gql`
  fragment CustomerData on CustomerCreated {
    user {
      email
      firstName
      lastName
    }
  }
`;

const CustomerCreatedGraphqlSubscription = gql`
  ${CustomerCreatedWebhookPayload}

  subscription CustomerCreated {
    event {
      ... on CustomerCreated {
        ...CustomerData
      }
    }
  }
`;

export const customerCreatedWebhook = new SaleorAsyncWebhook<CustomerDataFragment>({
  name: "Customer Created in Saleor",
  webhookPath: "api/webhooks/customer-created",
  asyncEvent: "CUSTOMER_CREATED",
  apl: saleorApp.apl,
  query: CustomerCreatedGraphqlSubscription,
});

const handler: NextWebhookApiHandler<CustomerDataFragment> = async (req, res, context) => {
  const logger = pinoLogger.child({
    webhook: customerCreatedWebhook.name,
  });

  logger.debug("Webhook received");

  const { payload, authData } = context;

  const { user } = payload;

  if (!user) {
    logger.error("Invalid payload from webhook");

    return res.status(200).end();
  }

  /**
   * 1 check if configured
   * 2 send to mailchimp
   */
  const client = createClient(authData.saleorApiUrl, async () =>
    Promise.resolve({ token: authData.token })
  );

  const settingsManager = new MailchimpConfigSettingsManager(client);

  const config = await settingsManager.getConfig();

  if (config?.customerCreateEvent?.enabled) {
    const mailchimpClient = new MailchimpClientOAuth(config.dc, config.token);

    await mailchimpClient.addContact(config.customerCreateEvent.listId, user.email);
  }

  return res.status(200).json({ message: "The event has been handled" });
};

export default customerCreatedWebhook.createHandler(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
