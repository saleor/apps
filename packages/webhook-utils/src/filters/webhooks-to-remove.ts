import { WebhookManifest } from "@saleor/app-sdk/types";

interface WebhooksToRemoveArgs {
  newWebhookManifests: Array<WebhookManifest>;
  existingWebhooksPartial: Array<{ id: string; name: string }>;
}

/*
 * Returns partials of the existing webhooks which are not specified in the manifests.
 * The comparison is based on webhook names.
 */
export const webhooksToRemove = ({
  newWebhookManifests,
  existingWebhooksPartial,
}: WebhooksToRemoveArgs) => {
  return existingWebhooksPartial.filter(
    (existingWebhook) =>
      !newWebhookManifests.find((webhookManifest) => webhookManifest.name === existingWebhook.name),
  );
};
