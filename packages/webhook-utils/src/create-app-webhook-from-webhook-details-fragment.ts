import { Client } from "urql";
import { WebhookDetailsFragmentFragment } from "../generated/graphql";
import { createAppWebhook } from "./operations/create-app-webhook";

interface CreateAppWebhookArgs {
  client: Client;
  webhookDetails: WebhookDetailsFragmentFragment;
}

export const createAppWebhookFromWebhookDetailsFragment = async ({
  client,
  webhookDetails,
}: CreateAppWebhookArgs) => {
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
