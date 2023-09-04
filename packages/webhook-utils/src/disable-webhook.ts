import { Client } from "urql";
import { modifyAppWebhook } from "./operations/modify-app-webhook";

interface DisableWebhookArgs {
  client: Client;
  webhookId: string;
}

export const disableWebhook = async ({ client, webhookId }: DisableWebhookArgs) => {
  const response = await modifyAppWebhook({
    client,
    webhookId,
    input: {
      isActive: false,
    },
  });
};
