import { Client } from "urql";
import { modifyAppWebhook } from "./operations/modify-app-webhook";

interface enableWebhookArgs {
  client: Client;
  webhookId: string;
}

export const enableWebhook = async ({ client, webhookId }: enableWebhookArgs) => {
  await modifyAppWebhook({
    client,
    webhookId,
    input: {
      isActive: true,
    },
  });
};
