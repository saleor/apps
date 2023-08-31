import { Client } from "urql";
import { GetAppDetailsAndWebhooksDataDocument } from "../../generated/graphql";

interface GetAppWebhooksArgs {
  client: Client;
}

export const getAppDetailsAndWebhooksData = async ({ client }: GetAppWebhooksArgs) => {
  return client
    .query(GetAppDetailsAndWebhooksDataDocument, {})
    .toPromise()
    .then((r) => {
      // TODO: handle error
      return r.data?.app;
    });
};
