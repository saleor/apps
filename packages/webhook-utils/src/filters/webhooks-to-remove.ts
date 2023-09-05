import { WebhookManifest } from "@saleor/app-sdk/types";

type WebhookPartial = { id: string; name: string };

interface WebhooksToRemoveArgs<T extends WebhookPartial> {
  newWebhookManifests: Array<WebhookManifest>;
  existingWebhooksPartial: Array<T>;
}

/*
 * Returns partials of the existing webhooks which are not specified in the manifests.
 * The comparison is based on webhook names.
 */
export const webhooksToRemove = <T extends WebhookPartial>({
  newWebhookManifests,
  existingWebhooksPartial,
}: WebhooksToRemoveArgs<T>) => {
  return existingWebhooksPartial.filter(
    (existingWebhook) =>
      !newWebhookManifests.find((webhookManifest) => webhookManifest.name === existingWebhook.name),
  );
};
