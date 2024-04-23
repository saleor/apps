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

type GetManifestFunction = ({
  appDetails,
  instanceDetails,
}: {
  appDetails: AppDetails;
  instanceDetails: SaleorInstanceDetails;
}) => Promise<Array<WebhookManifest>>;

export class WebhookMigrationRunner {
  private dryRun: boolean;
  private logger: Logger;
  private client: Client;
  private getManifests: GetManifestFunction;

  constructor(args: {
    dryRun: boolean;
    logger: Logger;
    client: Client;
    getManifests: GetManifestFunction;
  }) {
    this.dryRun = args.dryRun;
    this.logger = args.logger;
    this.client = args.client;
    this.getManifests = args.getManifests;
  }

  public migrate = async () => {
    try {
      this.logger.debug("Getting app details and webhooks data");

      const appDetails = await getAppDetailsAndWebhooksData({ client: this.client });

      this.logger.debug("Getting Saleor instance details");

      const instanceDetails = await getSaleorInstanceDetails({ client: this.client });

      this.logger.debug("Generate list of webhook manifests");

      const newWebhookManifests = await this.getManifests({ appDetails, instanceDetails });

      const updater = new WebhookUpdater({
        dryRun: this.dryRun,
        logger: this.logger,
        client: this.client,
        webhookManifests: newWebhookManifests,
        existingWebhooksData: appDetails.webhooks || [],
      });

      await updater.update();

      this.logger.info(`Migration finished successfully.`);
    } catch (error) {
      switch (true) {
        case error instanceof AppPermissionDeniedError:
          this.logger.warn(
            `Migration finished with warning: request being denied (app probably uninstalled)`,
            {
              error,
              reason: "App probably uninstalled",
            },
          );
          break;
        case error instanceof NetworkError:
          this.logger.warn(
            `Migration finished with warning: network error (Saleor not available)`,
            {
              error,
              reason: "Saleor not available",
            },
          );
          break;
        case error instanceof UnknownConnectionError:
          this.logger.error(`Migration finished with error while fetching data from Saleor`, {
            error,
          });
          break;
        default:
          this.logger.error(`Migration finished with error while running migrations`, { error });
      }
    }
  };
}
