import { Client } from "urql";
import { RemoveAppWebhookDocument } from "../../generated/graphql";

interface RemoveAppWebhookArgs {
  client: Client;
  webhookId: string;
}

export const removeAppWebhook = async ({ client, webhookId }: RemoveAppWebhookArgs) => {
  return client
    .query(RemoveAppWebhookDocument, {
      id: webhookId,
    })
    .toPromise()
    .then((r) => {
      // TODO: handle error
      return;
    });
};
