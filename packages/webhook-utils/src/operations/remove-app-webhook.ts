import { Client } from "urql";
import { RemoveAppWebhookDocument } from "../../generated/graphql";

interface RemoveAppWebhookArgs {
  client: Client;
  webhookId: string;
}

export const removeAppWebhook = async ({ client, webhookId }: RemoveAppWebhookArgs) => {
  return client
    .mutation(RemoveAppWebhookDocument, {
      id: webhookId,
    })
    .toPromise()
    .then((r) => {
      if (r.error) {
        throw new Error(`Webhook creation failed. The API returned an error: ${r.error.message}`);
      }

      return;
    });
};
