import { Client } from "urql";
import { createAppWebhook } from "./operations/create-app-webhook";
import { WebhookData } from "./types";

interface CreateAppWebhookFromWebhookDetailsFragmentArgs {
  client: Client;
  webhookDetails: WebhookData;
}

export const createAppWebhookFromWebhookDetailsFragment = async ({
  client,
  webhookDetails,
}: CreateAppWebhookFromWebhookDetailsFragmentArgs) => {
  return createAppWebhook({
    client,
    input: {
      ...webhookDetails,
    },
  });
};
