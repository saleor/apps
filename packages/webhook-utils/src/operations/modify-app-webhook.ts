import { Client } from "urql";
import { ModifyAppWebhookDocument, WebhookUpdateInput } from "../../generated/graphql";

interface ModifyAppWebhookArgs {
  client: Client;
  webhookId: string;
  input: WebhookUpdateInput;
}

export const modifyAppWebhook = async ({ client, webhookId, input }: ModifyAppWebhookArgs) => {
  return client
    .query(ModifyAppWebhookDocument, {
      id: webhookId,
      input,
    })
    .toPromise()
    .then((r) => {
      // TODO: handle error
      return r.data?.webhookUpdate?.webhook;
    });
};
