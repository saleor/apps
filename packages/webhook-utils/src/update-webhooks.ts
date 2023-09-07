import { WebhookManifest } from "@saleor/app-sdk/types";
import { Client } from "urql";
import { webhooksToRemove } from "./filters/webhooks-to-remove";
import { getWebhookIdsAndManifestsToUpdate } from "./filters/get-webhook-ids-and-manifests-to-update";
import { webhooksToAdd } from "./filters/webhooks-to-add";
import { createLogger } from "@saleor/apps-shared";
import { removeAppWebhook } from "./operations/remove-app-webhook";
import { WebhookDetailsFragment } from "../generated/graphql";
import { createAppWebhookFromManifest } from "./create-app-webhook-from-manifest";
import { modifyAppWebhookFromManifest } from "./modify-app-webhook-from-manifest";
import { createAppWebhookFromWebhookDetailsFragment } from "./create-app-webhook-from-webhook-details-fragment";
import { modifyAppWebhookFromWebhookDetails } from "./modify-app-webhook-from-webhook-details";

const logger = createLogger({ name: "updateWebhooks" });

interface RollbackArgs {
  client: Client;
  webhookManifests: Array<WebhookManifest>;
  existingWebhooksData: Array<WebhookDetailsFragment>;
  addedWebhooks: Array<WebhookDetailsFragment>;
  modifiedWebhooks: Array<WebhookDetailsFragment>;
  removedWebhooks: Array<WebhookDetailsFragment>;
}

const rollback = async ({
  client,
  addedWebhooks,
  modifiedWebhooks,
  existingWebhooksData,
  removedWebhooks,
}: RollbackArgs) => {
  if (addedWebhooks.length) {
    logger.info("Removing added webhooks");
    await Promise.allSettled(
      addedWebhooks.map((webhook) => removeAppWebhook({ client, webhookId: webhook.id })),
    );
  }

  if (modifiedWebhooks.length) {
    logger.info("Rollback modified webhooks");
    await Promise.allSettled(
      modifiedWebhooks.map((modifiedWebhook) => {
        const webhookDetails = existingWebhooksData.find(
          (existingWebhook) => existingWebhook.id === modifiedWebhook.id,
        );

        if (!webhookDetails) {
          logger.error("This should not happen");
          throw new Error("This should not happen");
        }

        return modifyAppWebhookFromWebhookDetails({ client, webhookDetails });
      }),
    );
  }

  if (removedWebhooks.length) {
    logger.debug("Rollback removed webhooks");

    await Promise.allSettled(
      modifiedWebhooks.map((webhookDetails) => {
        return createAppWebhookFromWebhookDetailsFragment({
          client,
          webhookDetails,
        });
      }),
    );
  }
};

interface UpdateWebhooksArgs {
  client: Client;
  webhookManifests: Array<WebhookManifest>;
  existingWebhooksData: Array<WebhookDetailsFragment>;
  dryRun?: boolean;
}

/*
 * Based on given list of existing and new webhooks:
 * - remove the ones which are not in the new list
 * - create the ones which are not in the existing list
 * - update queries the ones which are in both lists
 *
 * If any of the operations fails, rollback all changes to the initial state
 */
export const updateWebhooks = async ({
  client,
  webhookManifests,
  existingWebhooksData,
  dryRun,
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
    const webhookIdsAndManifestsToBeUpdated = getWebhookIdsAndManifestsToUpdate({
      existingWebhooksPartial: existingWebhooksData,
      newWebhookManifests: webhookManifests,
    });

    // Based on names, find the ones which should be removed
    const webhookToBeRemoved = webhooksToRemove({
      existingWebhooksPartial: existingWebhooksData,
      newWebhookManifests: webhookManifests,
    });

    logger.info(
      `Scheduled changes: ${webhookIdsAndManifestsToBeUpdated.length} to be updated, ${webhookManifestsToBeAdded.length} to be added, ${webhookToBeRemoved.length} to be removed`,
    );

    if (dryRun) {
      logger.info("Dry run mode, changes will not be executed. Exiting.");
      return;
    }

    for (const webhookManifest of webhookManifestsToBeAdded) {
      logger.debug(`Adding webhook ${webhookManifest.name}`);
      const createdWebhook = await createAppWebhookFromManifest({ client, webhookManifest });

      logger.debug("Webhook added");
      addedWebhooks.push(createdWebhook);
    }

    for (const updateData of webhookIdsAndManifestsToBeUpdated) {
      const { webhookId, webhookManifest } = updateData;

      logger.debug(`Updating webhook ${webhookManifest.name}`);
      const response = await modifyAppWebhookFromManifest({ client, webhookId, webhookManifest });

      logger.debug("Webhook updated");
      modifiedWebhooks.push(response);
    }

    for (const webhookDetails of webhookToBeRemoved) {
      logger.debug(`Removing webhook ${webhookDetails.name}`);

      await removeAppWebhook({ client, webhookId: webhookDetails.id });

      logger.debug("Webhook removed");
      removedWebhooks.push(webhookDetails);
    }

    logger.info("Migration finished successfully");
  } catch (e) {
    logger.error(e, "Error during update procedure, rolling back changes");
    await rollback({
      client,
      addedWebhooks,
      existingWebhooksData,
      modifiedWebhooks,
      webhookManifests,
      removedWebhooks,
    });
    logger.info("Changes rolled back");
  }
};
