import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";

import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { createGraphQLClient } from "@saleor/apps-shared";
import {
  CustomerUpdatedDocument,
  CustomerUpdatedPayloadFragment,
} from "../../../../generated/graphql";
import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";
import { MailchimpClientOAuth } from "../../../modules/mailchimp/mailchimp-client";
import { MailchimpConfigSettingsManager } from "../../../modules/mailchimp/mailchimp-config-settings-manager";
import { metadataToMailchimpTags } from "../../../modules/saleor-customers-sync/metadata-to-mailchimp-tags";

export const customerMetadataUpdatedWebhook =
  new SaleorAsyncWebhook<CustomerUpdatedPayloadFragment>({
    name: "Customer updated in Saleor",
    webhookPath: "api/webhooks/customer-updated",
    asyncEvent: "CUSTOMER_UPDATED",
    apl: saleorApp.apl,
    query: CustomerUpdatedDocument,
  });

const logger = createLogger("CustomerUpdatedAsyncWebhook");

const handler: NextWebhookApiHandler<CustomerUpdatedPayloadFragment> = async (
  req,
  res,
  context,
) => {
  logger.debug("Webhook received");

  const { payload, authData } = context;

  const { user } = payload;

  if (!user) {
    logger.error("Invalid payload from webhook - missing user");

    return res.status(200).end();
  }

  const client = createGraphQLClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });

  const settingsManager = new MailchimpConfigSettingsManager(client, authData.appId);

  const config = await settingsManager.getConfig();

  logger.info("webhook config", { config });

  if (config?.customerCreateEvent?.enabled) {
    const mailchimpClient = new MailchimpClientOAuth(config.dc, config.token);

    const tags = metadataToMailchimpTags(user);

    try {
      await mailchimpClient.addContact(config.customerCreateEvent.listId, user.email, {
        lastName: user.lastName,
        firstName: user.firstName,
        extraTags: tags,
      });
    } catch (e) {
      logger.error("Error during adding contact", { error: e });

      return res.status(500).end("Error saving customer in Mailchimp");
    }
  }

  return res.status(200).json({ message: "The event has been handled" });
};

export default wrapWithLoggerContext(
  customerMetadataUpdatedWebhook.createHandler(handler),
  loggerContext,
);

export const config = {
  api: {
    bodyParser: false,
  },
};
