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
  private dryRun: boolean;
  private logger: Logger;
  private client: Client;
  private webhookManifests: Array<WebhookManifest>;
  private existingWebhooksData: Array<WebhookData>;
  private addedWebhooks: Array<WebhookData>;
  private modifiedWebhooks: Array<WebhookData>;
  private removedWebhooks: Array<WebhookData>;

  constructor(args: {
    dryRun: boolean;
    logger: Logger;
    client: Client;
    webhookManifests: Array<WebhookManifest>;
    existingWebhooksData: Array<WebhookData>;
  }) {
    this.dryRun = args.dryRun;
    this.logger = args.logger;
    this.client = args.client;
    this.webhookManifests = args.webhookManifests;
    this.existingWebhooksData = args.existingWebhooksData;
    this.addedWebhooks = [];
    this.modifiedWebhooks = [];
    this.removedWebhooks = [];
  }

  public update = async () => {
    this.logger.debug("Updating webhooks");

    try {
      this.logger.debug("Preparing list of changes to be executed");

      // Based on names, find the ones which should be added
      const webhookManifestsToBeAdded = webhooksToAdd({
        existingWebhooksPartial: this.existingWebhooksData,
        newWebhookManifests: this.webhookManifests,
      });

      // Based on names, find the ones which should be updated
      const webhookIdsAndManifestsToBeUpdated = getWebhookIdsAndManifestsToUpdate({
        existingWebhooksPartial: this.existingWebhooksData,
        newWebhookManifests: this.webhookManifests,
      });

      // Based on names, find the ones which should be removed
      const webhookToBeRemoved = webhooksToRemove({
        existingWebhooksPartial: this.existingWebhooksData,
        newWebhookManifests: this.webhookManifests,
      });

      this.logger.info(
        `Scheduled changes: ${webhookIdsAndManifestsToBeUpdated.length} to be updated, ${webhookManifestsToBeAdded.length} to be added, ${webhookToBeRemoved.length} to be removed`,
      );

      if (this.dryRun) {
        this.logger.info("Dry run mode, changes will not be executed. Exiting.");
        return;
      }

      for (const webhookManifest of webhookManifestsToBeAdded) {
        this.logger.debug(`Adding webhook ${webhookManifest.name}`);
        const createdWebhook = await createAppWebhookFromManifest({
          client: this.client,
          webhookManifest,
        });

        this.logger.debug("Webhook added");
        this.addedWebhooks.push(createdWebhook);
      }

      for (const updateData of webhookIdsAndManifestsToBeUpdated) {
        const { webhookId, webhookManifest } = updateData;

        this.logger.debug(`Updating webhook ${webhookManifest.name}`);
        const response = await modifyAppWebhookFromManifest({
          client: this.client,
          webhookId,
          webhookManifest,
        });

        this.logger.debug("Webhook updated");
        this.modifiedWebhooks.push(response);
      }

      for (const webhookDetails of webhookToBeRemoved) {
        this.logger.debug(`Removing webhook ${webhookDetails.name}`);

        await removeAppWebhook({ client: this.client, webhookId: webhookDetails.id });

        this.logger.debug("Webhook removed");
        this.removedWebhooks.push(webhookDetails);
      }

      this.logger.info("Migration finished successfully");
    } catch (error) {
      this.logger.error("Error during update procedure, rolling back changes", { error });

      await this.rollback();

      this.logger.info("Changes rolled back");
    }
  };

  private rollback = async () => {
    if (this.addedWebhooks.length) {
      this.logger.info("Removing added webhooks");
      await Promise.allSettled(
        this.addedWebhooks.map((webhook) =>
          removeAppWebhook({ client: this.client, webhookId: webhook.id }),
        ),
      );
    }

    if (this.modifiedWebhooks.length) {
      this.logger.info("Rollback modified webhooks");
      await Promise.allSettled(
        this.modifiedWebhooks.map((modifiedWebhook) => {
          const webhookDetails = this.existingWebhooksData.find(
            (existingWebhook) => existingWebhook.id === modifiedWebhook.id,
          );

          if (!webhookDetails) {
            this.logger.error("This should not happen");
            throw new Error("This should not happen");
          }

          return modifyAppWebhookFromWebhookDetails({ client: this.client, webhookDetails });
        }),
      );
    }

    if (this.removedWebhooks.length) {
      this.logger.debug("Rollback removed webhooks");

      await Promise.allSettled(
        this.modifiedWebhooks.map((webhookDetails) => {
          return createAppWebhookFromWebhookDetailsFragment({
            client: this.client,
            webhookDetails,
          });
        }),
      );
    }
  };
}
