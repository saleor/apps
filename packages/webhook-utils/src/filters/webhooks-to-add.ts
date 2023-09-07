import { WebhookManifest } from "@saleor/app-sdk/types";

interface WebhooksToAddArgs {
  newWebhookManifests: Array<WebhookManifest>;
  existingWebhooksPartial: Array<{ id: string; name: string }>;
}

export const webhooksToAdd = ({
  newWebhookManifests,
  existingWebhooksPartial,
}: WebhooksToAddArgs) => {
  return newWebhookManifests.filter(
    (newWebhookManifest) =>
      !existingWebhooksPartial.find(
        (existingWebhook) => newWebhookManifest.name === existingWebhook.name,
      ),
  );
};
