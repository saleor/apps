import { Client } from "urql";
import { ModifyAppWebhookDocument, WebhookUpdateInput } from "../../generated/graphql";

interface ModifyAppWebhookArgs {
  client: Client;
  webhookId: string;
  input: WebhookUpdateInput;
}

export const modifyAppWebhook = async ({ client, webhookId, input }: ModifyAppWebhookArgs) => {
  return client
    .mutation(ModifyAppWebhookDocument, {
      id: webhookId,
      input,
    })
    .toPromise()
    .then((r) => {
      if (r.error) {
        throw new Error(`Webhook creation failed. The API returned an error: ${r.error.message}`);
      }

      const webhook = r.data?.webhookUpdate?.webhook;

      if (!webhook) {
        throw new Error("Webhook modify response is empty. The API returned no additional error.");
      }
      return webhook;
    });
};
