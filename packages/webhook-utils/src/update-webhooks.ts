import { WebhookManifest } from "@saleor/app-sdk/types";
import { Client } from "urql";
import { webhooksToRemove } from "./filters/webhooks-to-remove";
import { getWebhookIdsAndQueriesToUpdate } from "./filters/get-webhook-ids-and-queries-to-update";
import { webhooksToAdd } from "./filters/webhooks-to-add";
import { createLogger } from "@saleor/apps-shared";
import { removeAppWebhook } from "./operations/remove-app-webhook";
import { createAppWebhook } from "./operations/create-app-webhook";
import {
  WebhookDetailsFragmentFragment,
  WebhookEventTypeAsyncEnum,
  WebhookEventTypeSyncEnum,
} from "../generated/graphql";
import { modifyAppWebhook } from "./operations/modify-app-webhook";

const logger = createLogger({ name: "updateWebhooks" });

interface UpdateWebhooksArgs {
  client: Client;
  webhookManifests: Array<WebhookManifest>;
  existingWebhooksData: Array<WebhookDetailsFragmentFragment>;
}

/*
 * Based on given list of existing and new webhooks:
 * - remove the ones which are not in the new list
 * - create the ones which are not in the existing list
 * - update queries the ones which are in both lists
 */
export const updateWebhooks = async ({
  client,
  webhookManifests,
  existingWebhooksData,
}: UpdateWebhooksArgs) => {
  const addedWebhooks = [];
  const modifiedWebhooks = [];
  const removedWebhooks = [];

  try {
    logger.debug("Preparing list of changes to be executed");

    // Based on names, find the ones which should be added
    const webhookManifestsToBeAdded = webhooksToAdd({
      existingWebhooksPartial: existingWebhooksData,
      newWebhookManifests: webhookManifests,
    });

    // Based on names, find the ones which should be updated
    const webhookIdsAndQueriesToBeUpdated = getWebhookIdsAndQueriesToUpdate({
      existingWebhooksPartial: existingWebhooksData,
      newWebhookManifests: webhookManifests,
    });

    // Based on names, find the ones which should be removed
    const webhookIdsToBeRemoved = webhooksToRemove({
      existingWebhooksPartial: existingWebhooksData,
      newWebhookManifests: webhookManifests,
    }).map((webhook) => webhook.id);

    logger.info(
      `Scheduled changes: ${webhookIdsAndQueriesToBeUpdated} to be updated, ${webhookManifestsToBeAdded.length} to be added, ${webhookIdsToBeRemoved.length} to be removed`,
    );

    for (const webhookManifest of webhookManifestsToBeAdded) {
      logger.debug(`Adding webhook ${webhookManifest.name}`);
      const response = await createAppWebhook({
        client,
        input: {
          asyncEvents: webhookManifest.asyncEvents as WebhookEventTypeAsyncEnum[],
          syncEvents: webhookManifest.syncEvents as WebhookEventTypeSyncEnum[],
          isActive: webhookManifest.isActive,
          name: webhookManifest.name,
          targetUrl: webhookManifest.targetUrl,
          query: webhookManifest.query,
        },
      });

      logger.debug("Webhook added");
      addedWebhooks.push(response);
    }

    if (webhookIdsAndQueriesToBeUpdated.length) {
      for (const updateData of webhookIdsAndQueriesToBeUpdated) {
        const { webhookId, newQuery } = updateData;

        const webhook = webhookManifests.find((webhook) => webhook.id === webhookId);

        logger.debug(`Adding webhook ${webhookManifest.name}`);
        const response = await modifyAppWebhook({
          client,
          webhookId,
          input: {
            asyncEvents: webhookManifest.asyncEvents as WebhookEventTypeAsyncEnum[],
            syncEvents: webhookManifest.syncEvents as WebhookEventTypeSyncEnum[],
            isActive: webhookManifest.isActive,
            name: webhookManifest.name,
            targetUrl: webhookManifest.targetUrl,
            query: webhookManifest.query,
          },
        });

        logger.debug("Webhook updated");
        modifiedWebhooks.push(webhookId);
      }
    } else {
      logger.debug("Theres no webhooks to update");
    }

    if (webhookIdsToBeRemoved.length) {
      logger.debug("Removing webhooks");

      for (const webhookId of webhookIdsToBeRemoved) {
        const response = await removeAppWebhook({ client, webhookId });

        removedWebhooks.push(webhookId);
      }
    }
  } catch (e) {
    logger.error(e, "Error during update procedure, rolling back changes");

    if (addedWebhooks.length) {
      logger.info("Removing added webhooks");
      await Promise.all(
        addedWebhooks.map((webhook) => removeAppWebhook({ client, webhookId: webhook.id })),
      );
    }

    if (modifiedWebhooks.length) {
      logger.info("Rollback modified webhooks");
      await Promise.all(
        modifiedWebhooks.map((webhookId) => {
          const webhook = existingWebhooksData.find((webhook) => webhook.id === webhookId);

          if (!webhook) {
            // TODO: better message
            logger.error("This should not happen");
            throw new Error("This should not happen");
          }

          return modifyAppWebhook({
            client,
            webhookId,
            input: {
              asyncEvents: webhook.asyncEvents.map((event) => event.eventType),
              syncEvents: webhook.syncEvents.map((event) => event.eventType),
              isActive: webhook.isActive,
              name: webhook.name,
              targetUrl: webhook.targetUrl,
              query: webhook.subscriptionQuery,
            },
          });
        }),
      );
    }

    if (removedWebhooks.length) {
      logger.debug("Rollback removed webhooks");

      await Promise.all(
        modifiedWebhooks.map((webhookId) => {
          const webhook = existingWebhooksData.find((webhook) => webhook.id === webhookId);

          if (!webhook) {
            // TODO: better message
            logger.error("This should not happen");
            throw new Error("This should not happen");
          }

          return createAppWebhook({
            client,
            input: {
              asyncEvents: webhook.asyncEvents.map((event) => event.eventType),
              syncEvents: webhook.syncEvents.map((event) => event.eventType),
              isActive: webhook.isActive,
              name: webhook.name,
              targetUrl: webhook.targetUrl,
              query: webhook.subscriptionQuery,
            },
          });
        }),
      );
    }
  }
  logger.debug("Changes applied");
};
