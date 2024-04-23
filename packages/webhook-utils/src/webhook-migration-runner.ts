import { WebhookManifest } from "@saleor/app-sdk/types";
import { Client } from "urql";
import { AppPermissionDeniedError, NetworkError, UnknownConnectionError } from "./errors";
import {
  AppDetails,
  getAppDetailsAndWebhooksData,
} from "./operations/get-app-details-and-webhooks-data";
import {
  SaleorInstanceDetails,
  getSaleorInstanceDetails,
} from "./operations/get-saleor-instance-details";
import { Logger } from "./types";
import { WebhookUpdater } from "./webhook-updater";

export class WebhookMigrationRunner {
  private dryRun: boolean;
  private logger: Logger;

  constructor(args: { dryRun: boolean; logger: Logger }) {
    this.dryRun = args.dryRun;
    this.logger = args.logger;
  }

  public migrate = async ({
    getManifests,
    saleorApiUrl,
    client,
  }: {
    getManifests: ({
      appDetails,
      instanceDetails,
    }: {
      appDetails: AppDetails;
      instanceDetails: SaleorInstanceDetails;
    }) => Promise<Array<WebhookManifest>>;
    saleorApiUrl: string;
    client: Client;
  }) => {
    try {
      this.logger.debug("Getting app details and webhooks data");

      const appDetails = await getAppDetailsAndWebhooksData({ client });

      this.logger.debug("Getting Saleor instance details");

      const instanceDetails = await getSaleorInstanceDetails({ client });

      this.logger.debug("Generate list of webhook manifests");

      const newWebhookManifests = await getManifests({ appDetails, instanceDetails });

      const updater = new WebhookUpdater({
        dryRun: this.dryRun,
        logger: this.logger,
        client,
        webhookManifests: newWebhookManifests,
        existingWebhooksData: appDetails.webhooks || [],
      });

      await updater.update();

      this.logger.info(`${saleorApiUrl}: Migration finished successfully.`);
    } catch (error) {
      switch (true) {
        case error instanceof AppPermissionDeniedError:
          this.logger.warn(
            `${saleorApiUrl}: wasn't migrated due to request being denied (app probably uninstalled)`,
            {
              error,
              reason: "App probably uninstalled",
            },
          );
          break;
        case error instanceof NetworkError:
          this.logger.warn(
            `${saleorApiUrl}: wasn't migrated due to network error (Saleor not available)`,
            {
              error,
              reason: "Saleor not available",
            },
          );
          break;
        case error instanceof UnknownConnectionError:
          this.logger.error(`${saleorApiUrl}: Error while fetching data from Saleor`, { error });
          break;
        default:
          this.logger.error(`${saleorApiUrl}: Error while running migrations`, { error });
      }
    }
  };
}
