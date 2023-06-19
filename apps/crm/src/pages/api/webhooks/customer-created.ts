import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import {
  CustomerCreatedDocument,
  CustomerCreatedPayloadFragment,
} from "../../../../generated/graphql";
import { MailchimpConfigSettingsManager } from "../../../modules/mailchimp/mailchimp-config-settings-manager";
import { MailchimpClientOAuth } from "../../../modules/mailchimp/mailchimp-client";
import { metadataToMailchimpTags } from "../../../modules/saleor-customers-sync/metadata-to-mailchimp-tags";
import { createGraphQLClient, createLogger } from "@saleor/apps-shared";

export const customerCreatedWebhook = new SaleorAsyncWebhook<CustomerCreatedPayloadFragment>({
  name: "Customer Created in Saleor",
  webhookPath: "api/webhooks/customer-created",
  asyncEvent: "CUSTOMER_CREATED",
  apl: saleorApp.apl,
  query: CustomerCreatedDocument,
});

// todo - fetch metadata with event
export const customerCreatedHandler: NextWebhookApiHandler<CustomerCreatedPayloadFragment> = async (
  req,
  res,
  context
) => {
  const logger = createLogger({
    webhook: customerCreatedWebhook.name,
  });

  logger.debug("Webhook received");

  const { payload, authData } = context;

  const { user } = payload;

  if (!user) {
    logger.error("Invalid payload from webhook");

    return res.status(200).end();
  }

  const client = createGraphQLClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });

  const settingsManager = new MailchimpConfigSettingsManager(client, authData.appId);

  const config = await settingsManager.getConfig();

  if (config?.customerCreateEvent?.enabled) {
    const mailchimpClient = new MailchimpClientOAuth(config.dc, config.token);

    const tags = metadataToMailchimpTags(user);

    await mailchimpClient.addContact(config.customerCreateEvent.listId, user.email, {
      lastName: user.lastName,
      firstName: user.firstName,
      extraTags: tags,
    });
  }

  return res.status(200).json({ message: "The event has been handled" });
};

export default customerCreatedWebhook.createHandler(customerCreatedHandler);

export const config = {
  api: {
    bodyParser: false,
  },
};
