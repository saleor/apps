import { Client } from "urql";
import { getAppDetailsAndWebhooksData } from "./operations/get-app-details-and-webhooks-data";
import { removeAppWebhook } from "./operations/remove-app-webhook";
import { WebhookManifest } from "@saleor/app-sdk/types";
import { createAppWebhook } from "./operations/create-app-webhook";
import { WebhookEventTypeAsyncEnum, WebhookEventTypeSyncEnum } from "../generated/graphql";

interface recreateWebhooksArgs {
  client: Client;
  existingWebhookIds: Array<string>;
  webhookManifests: Array<WebhookManifest>;
}

// Removes all existing webhooks and create new ones based on given manifests
export const recreateWebhooks = async ({
  client,
  existingWebhookIds,
  webhookManifests,
}: recreateWebhooksArgs) => {
  // Remove all existing webhooks
  await Promise.all(existingWebhookIds.map((webhookId) => removeAppWebhook({ client, webhookId })));

  await Promise.all(
    webhookManifests.map((webhookManifest) =>
      createAppWebhook({
        client,
        input: {
          asyncEvents: webhookManifest.asyncEvents as WebhookEventTypeAsyncEnum[],
          syncEvents: webhookManifest.syncEvents as WebhookEventTypeSyncEnum[],
          isActive: webhookManifest.isActive,
          name: webhookManifest.name,
          targetUrl: webhookManifest.targetUrl,
          query: webhookManifest.query,
        },
      }),
    ),
  );
};
