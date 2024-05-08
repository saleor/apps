import { WebhookManifest } from "@saleor/app-sdk/types";
import { Client } from "urql";
import { createAppWebhookFromManifest } from "./create-app-webhook-from-manifest";
import { createAppWebhookFromWebhookDetailsFragment } from "./create-app-webhook-from-webhook-details-fragment";
import { getWebhookIdsAndManifestsToUpdate } from "./filters/get-webhook-ids-and-manifests-to-update";
import { webhooksToAdd } from "./filters/webhooks-to-add";
import { webhooksToRemove } from "./filters/webhooks-to-remove";
import { modifyAppWebhookFromManifest } from "./modify-app-webhook-from-manifest";
import { modifyAppWebhookFromWebhookDetails } from "./modify-app-webhook-from-webhook-details";
import { removeAppWebhook } from "./operations/remove-app-webhook";
import { Logger, WebhookData } from "./types";

export class WebhookUpdater {
  private addedWebhooks: Array<WebhookData>;
  private modifiedWebhooks: Array<WebhookData>;
  private removedWebhooks: Array<WebhookData>;

  constructor(
    private args: {
      dryRun: boolean;
      logger: Logger;
      client: Client;
      webhookManifests: Array<WebhookManifest>;
      existingWebhooksData: Array<WebhookData>;
    },
  ) {
    this.addedWebhooks = [];
    this.modifiedWebhooks = [];
    this.removedWebhooks = [];
  }

  public update = async () => {
    const { dryRun, logger, client, webhookManifests, existingWebhooksData } = this.args;

    logger.debug("Updating webhooks");

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
        const createdWebhook = await createAppWebhookFromManifest({
          client,
          webhookManifest,
        });

        logger.debug("Webhook added");
        this.addedWebhooks.push(createdWebhook);
      }

      for (const updateData of webhookIdsAndManifestsToBeUpdated) {
        const { webhookId, webhookManifest } = updateData;

        logger.debug(`Updating webhook ${webhookManifest.name}`);
        const response = await modifyAppWebhookFromManifest({
          client,
          webhookId,
          webhookManifest,
        });

        logger.debug("Webhook updated");
        this.modifiedWebhooks.push(response);
      }

      for (const webhookDetails of webhookToBeRemoved) {
        logger.debug(`Removing webhook ${webhookDetails.name}`);

        await removeAppWebhook({ client, webhookId: webhookDetails.id });

        logger.debug("Webhook removed");
        this.removedWebhooks.push(webhookDetails);
      }
    } catch (error) {
      logger.error("Error during update procedure, rolling back changes", { error });

      await this.rollback();

      logger.info("Changes rolled back");
    }
  };

  private rollback = async () => {
    const { logger, client, existingWebhooksData } = this.args;

    if (this.addedWebhooks.length) {
      logger.info("Removing added webhooks");
      await Promise.allSettled(
        this.addedWebhooks.map((webhook) => removeAppWebhook({ client, webhookId: webhook.id })),
      );
    }

    if (this.modifiedWebhooks.length) {
      logger.info("Rollback modified webhooks");
      await Promise.allSettled(
        this.modifiedWebhooks.map((modifiedWebhook) => {
          const webhookDetails = existingWebhooksData.find(
            (existingWebhook) => existingWebhook.id === modifiedWebhook.id,
          );

          if (!webhookDetails) {
            throw new Error("This should not happen");
          }

          return modifyAppWebhookFromWebhookDetails({ client, webhookDetails });
        }),
      );
    }

    if (this.removedWebhooks.length) {
      logger.debug("Rollback removed webhooks");

      await Promise.allSettled(
        this.modifiedWebhooks.map((webhookDetails) => {
          return createAppWebhookFromWebhookDetailsFragment({
            client,
            webhookDetails,
          });
        }),
      );
    }
  };
}
