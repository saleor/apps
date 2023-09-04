import { Client } from "urql";
import { removeAppWebhook } from "./operations/remove-app-webhook";
import { WebhookManifest } from "@saleor/app-sdk/types";
import { createAppWebhook } from "./operations/create-app-webhook";
import { WebhookEventTypeAsyncEnum, WebhookEventTypeSyncEnum } from "../generated/graphql";
import { createLogger } from "@saleor/apps-shared";

const logger = createLogger({ name: "recreateWebhooks" });

interface recreateWebhooksArgs {
  client: Client;
  existingWebhookIds: Array<string>;
  webhookManifests: Array<WebhookManifest>;
}

// Removes all existing webhooks and create new ones based on given manifests.
export const recreateWebhooks = async ({
  client,
  existingWebhookIds,
  webhookManifests,
}: recreateWebhooksArgs) => {
  logger.debug("Creating new webhooks");
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

  logger.debug("Removing existing webhooks");
  await Promise.all(existingWebhookIds.map((webhookId) => removeAppWebhook({ client, webhookId })));
};
