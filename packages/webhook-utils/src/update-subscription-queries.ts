import { Client } from "urql";
import { modifyAppWebhook } from "./operations/modify-app-webhook";

interface updateSubscriptionQueriesArgs {
  client: Client;
  webhookNamesAndQueries: Array<{ name: string; query: string }>;
  existingWebhookIdAndNames: Array<{ id: string; name: string }>;
}

export const updateSubscriptionQueries = async ({
  client,
  webhookNamesAndQueries,
  existingWebhookIdAndNames,
}: updateSubscriptionQueriesArgs) => {
  await Promise.all(
    webhookNamesAndQueries.map((updatedWebhook) => {
      const existingWebhook = existingWebhookIdAndNames.find(
        (webhook) => webhook.name === updatedWebhook.name,
      );

      if (!existingWebhook) {
        // Theres no webhook with this name, so we cant start an update
        return Promise.resolve();
      }

      return modifyAppWebhook({
        client,
        webhookId: existingWebhook.id,
        input: {
          query: updatedWebhook.query,
        },
      });
    }),
  );
};
