import { Client } from "urql";
import { CreateAppWebhookDocument, WebhookCreateInput } from "../../generated/graphql";

interface CreateAppWebhookArgs {
  client: Client;
  input: WebhookCreateInput;
}

export const createAppWebhook = async ({ client, input }: CreateAppWebhookArgs) => {
  return client
    .query(CreateAppWebhookDocument, {
      input,
    })
    .toPromise()
    .then((r) => {
      // TODO: handle error
      return r.data?.webhookCreate;
    });
};
