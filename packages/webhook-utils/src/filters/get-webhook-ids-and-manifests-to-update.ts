import { WebhookManifest } from "@saleor/app-sdk/types";
import { WebhookData } from "../types";

interface GetWebhookIdsAndQueriesToUpdateArgs<T extends WebhookData> {
  newWebhookManifests: Array<WebhookManifest>;
  existingWebhooksPartial: Array<T>;
}

type ReturnType = { webhookId: string; webhookManifest: WebhookManifest };

// Couples the webhook id with the manifest to update
export const getWebhookIdsAndManifestsToUpdate = <T extends WebhookData>({
  newWebhookManifests,
  existingWebhooksPartial,
}: GetWebhookIdsAndQueriesToUpdateArgs<T>): Array<ReturnType> => {
  return newWebhookManifests
    .map((webhookManifest) => {
      const existingWebhook = existingWebhooksPartial.find(
        (webhook) => webhook.name === webhookManifest.name,
      );

      if (!existingWebhook) {
        // Theres no webhook with this name, so we cant start an update
        return undefined;
      }

      if (!webhookManifest.query) {
        return undefined;
      }

      return {
        webhookId: existingWebhook.id,
        webhookManifest,
      };
    })
    .filter((data): data is ReturnType => data !== undefined); // Filter out undefined values and narrow down the type
};
