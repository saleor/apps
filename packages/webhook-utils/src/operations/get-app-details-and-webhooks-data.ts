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
      const app = r.data?.app;

      if (!app) {
        throw new Error(
          "Could not get the app details. Access token could be invalid or app is disabled.",
        );
      }
      return app;
    });
};
