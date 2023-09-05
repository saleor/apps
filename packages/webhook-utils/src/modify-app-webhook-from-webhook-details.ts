import { Client } from "urql";
import { WebhookDetailsFragment } from "../generated/graphql";
import { modifyAppWebhook } from "./operations/modify-app-webhook";

interface ModifyAppWebhookFromWebhookDetailsArgs {
  client: Client;
  webhookDetails: WebhookDetailsFragment;
}

export const modifyAppWebhookFromWebhookDetails = async ({
  client,
  webhookDetails,
}: ModifyAppWebhookFromWebhookDetailsArgs) => {
  return modifyAppWebhook({
    client,
    webhookId: webhookDetails.id,
    input: {
      asyncEvents: webhookDetails.asyncEvents.map((event) => event.eventType),
      syncEvents: webhookDetails.syncEvents.map((event) => event.eventType),
      isActive: webhookDetails.isActive,
      name: webhookDetails.name,
      targetUrl: webhookDetails.targetUrl,
      query: webhookDetails.subscriptionQuery,
    },
  });
};
