import { Client } from "urql";
import { modifyAppWebhook } from "./operations/modify-app-webhook";

interface disableWebhookArgs {
  client: Client;
  webhookId: string;
}

export const disableWebhook = async ({ client, webhookId }: disableWebhookArgs) => {
  const response = await modifyAppWebhook({
    client,
    webhookId,
    input: {
      isActive: false,
    },
  });
};
