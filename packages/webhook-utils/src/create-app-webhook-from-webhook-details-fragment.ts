import { Client } from "urql";
import { WebhookDetailsFragment } from "../generated/graphql";
import { createAppWebhook } from "./operations/create-app-webhook";

interface CreateAppWebhookFromWebhookDetailsFragmentArgs {
  client: Client;
  webhookDetails: WebhookDetailsFragment;
}

export const createAppWebhookFromWebhookDetailsFragment = async ({
  client,
  webhookDetails,
}: CreateAppWebhookFromWebhookDetailsFragmentArgs) => {
  return createAppWebhook({
    client,
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
