import { Client } from "urql";
import { CreateAppWebhookDocument, WebhookCreateInput } from "../../generated/graphql";

interface CreateAppWebhookArgs {
  client: Client;
  input: WebhookCreateInput;
}

export const createAppWebhook = async ({ client, input }: CreateAppWebhookArgs) => {
  return client
    .mutation(CreateAppWebhookDocument, {
      input,
    })
    .toPromise()
    .then((r) => {
      if (r.error) {
        throw new Error(`Webhook creation failed. The API returned an error: ${r.error.message}`);
      }
      const webhook = r.data?.webhookCreate?.webhook;

      if (!webhook) {
        throw new Error(
          "Webhook creation response is empty. The API returned no additional error.",
        );
      }
      return webhook;
    });
};
