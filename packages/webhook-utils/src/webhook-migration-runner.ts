import { WebhookManifest } from "@saleor/app-sdk/types";
import { Client } from "urql";

import { AppPermissionDeniedError, NetworkError, UnknownConnectionError } from "./errors";
import {
  AppDetails,
  getAppDetailsAndWebhooksData,
} from "./operations/get-app-details-and-webhooks-data";
import {
  getSaleorInstanceDetails,
  SaleorInstanceDetails,
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
  constructor(
    private args: {
      dryRun: boolean;
      logger: Logger;
      client: Client;
      saleorApiUrl: string;
      getManifests: GetManifestFunction;
    },
  ) {}

  public migrate = async () => {
    const { dryRun, logger, client, getManifests, saleorApiUrl } = this.args;

    try {
      logger.debug("Getting app details and webhooks data");

      const appDetails = await getAppDetailsAndWebhooksData({ client });

      logger.debug("Getting Saleor instance details");

      const instanceDetails = await getSaleorInstanceDetails({ client });

      logger.debug("Generate list of webhook manifests");

      const newWebhookManifests = await getManifests({ appDetails, instanceDetails });

      const updater = new WebhookUpdater({
        dryRun,
        logger,
        client,
        webhookManifests: newWebhookManifests,
        existingWebhooksData: appDetails.webhooks || [],
      });

      await updater.update();

      logger.info(`Migration finished successfully for ${saleorApiUrl}`);
    } catch (error) {
      switch (true) {
        case error instanceof AppPermissionDeniedError:
          logger.warn(
            `Migration finished with warning for ${saleorApiUrl}: request being denied (app probably uninstalled)`,
          );
          break;
        case error instanceof NetworkError:
          logger.warn(
            `Migration finished with warning for ${saleorApiUrl}: network error (Saleor not available)`,
          );
          break;
        case error instanceof UnknownConnectionError:
          logger.error(
            `Migration finished with error for ${saleorApiUrl} while fetching data from Saleor`,
          );
          throw error;
        default:
          logger.error(
            `Migration finished with error for ${saleorApiUrl} while running migrations`,
          );
          throw error;
      }
    }
  };
}
