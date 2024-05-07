import { type Client } from "urql";
import { modifyAppWebhook } from "./operations/modify-app-webhook";
import { type WebhookData } from "./types";

interface ModifyAppWebhookFromWebhookDetailsArgs {
  client: Client;
  webhookDetails: WebhookData;
}

export const modifyAppWebhookFromWebhookDetails = async ({
  client,
  webhookDetails,
}: ModifyAppWebhookFromWebhookDetailsArgs) => {
  return modifyAppWebhook({
    client,
    webhookId: webhookDetails.id,
    input: {
      asyncEvents: webhookDetails.asyncEventsTypes,
      syncEvents: webhookDetails.syncEventsTypes,
      isActive: webhookDetails.isActive,
      name: webhookDetails.name,
      targetUrl: webhookDetails.targetUrl,
      query: webhookDetails.query,
    },
  });
};
