import { WebhookManifest } from "@saleor/app-sdk/types";

interface GetWebhookIdsAndQueriesToUpdateArgs {
  newWebhookManifests: Array<WebhookManifest>;
  existingWebhooksPartial: Array<{ id: string; name: string }>;
}

type IdAndQuery = { webhookId: string; newQuery: string };

export const getWebhookIdsAndQueriesToUpdate = ({
  newWebhookManifests,
  existingWebhooksPartial,
}: GetWebhookIdsAndQueriesToUpdateArgs): Array<IdAndQuery> => {
  return newWebhookManifests
    .map((newWebhook) => {
      const existingWebhook = existingWebhooksPartial.find(
        (webhook) => webhook.name === newWebhook.name,
      );

      if (!existingWebhook) {
        // Theres no webhook with this name, so we cant start an update
        return undefined;
      }

      if (!newWebhook.query) {
        return undefined;
      }

      return {
        webhookId: existingWebhook.id,
        newQuery: newWebhook.query,
      };
    })
    .filter((data): data is IdAndQuery => data !== undefined);
};
