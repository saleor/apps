import { type WebhookManifest } from "@saleor/app-sdk/types";

import { type WebhookData } from "../types";

interface WebhooksToAddArgs {
  newWebhookManifests: Array<WebhookManifest>;
  existingWebhooksPartial: Array<WebhookData>;
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
