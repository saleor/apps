import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { logger as pinoLogger } from "../../../lib/logger";
import { CustomerDataFragment } from "../../../../generated/graphql";
import { createClient } from "../../../lib/create-graphq-client";
import { MailchimpConfigSettingsManager } from "../../../modules/mailchimp/mailchimp-config-settings-manager";
import { MailchimpClientOAuth } from "../../../modules/mailchimp/mailchimp-client";
import { metadataToMailchimpTags } from "../../../modules/saleor-customers-sync/metadata-to-mailchimp-tags";

export const customerMetadataUpdatedWebhook = new SaleorAsyncWebhook<CustomerDataFragment>({
  name: "Customer Metadata updated in Saleor",
  webhookPath: "api/webhooks/customer-metadata-updated",
  asyncEvent: "CUSTOMER_METADATA_UPDATED",
  apl: saleorApp.apl,
  query: Subscription,
});

const handler: NextWebhookApiHandler<CustomerDataFragment> = async (req, res, context) => {
  const logger = pinoLogger.child({
    webhook: customerMetadataUpdatedWebhook.name,
  });

  logger.debug("Webhook received");

  const { payload, authData } = context;

  const { user } = payload;

  if (!user) {
    logger.error("Invalid payload from webhook");

    return res.status(200).end();
  }

  const client = createClient(authData.saleorApiUrl, async () =>
    Promise.resolve({ token: authData.token })
  );

  const settingsManager = new MailchimpConfigSettingsManager(client);

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

export default customerMetadataUpdatedWebhook.createHandler(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
