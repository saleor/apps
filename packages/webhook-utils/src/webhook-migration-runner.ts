import { WebhookManifest } from "@saleor/app-sdk/types";
import { Client } from "urql";
import { AppPermissionDeniedError, NetworkError, UnknownConnectionError } from "./errors";
import { createLogger } from "./logger";
import { OBSERVABILITY_ATTRIBUTES, loggerContext } from "./logger-context";
import {
  AppDetails,
  getAppDetailsAndWebhooksData,
} from "./operations/get-app-details-and-webhooks-data";
import {
  SaleorInstanceDetails,
  getSaleorInstanceDetails,
} from "./operations/get-saleor-instance-details";
import { updateWebhooks } from "./update-webhooks";

const logger = createLogger("WebhookMigrationRunner");

interface WebhookMigrationRunnerArgs {
  client: Client;
  getManifests: ({
    appDetails,
    instanceDetails,
  }: {
    appDetails: AppDetails;
    instanceDetails: SaleorInstanceDetails;
  }) => Promise<Array<WebhookManifest>>;
  dryRun?: boolean;
  apiUrl: string;
}

export const webhookMigrationRunner = async ({
  client,
  getManifests,
  dryRun,
  apiUrl,
}: WebhookMigrationRunnerArgs) => {
  try {
    loggerContext.set(OBSERVABILITY_ATTRIBUTES.API_URL, apiUrl);

    logger.debug("Getting app details and webhooks data");

    const appDetails = await getAppDetailsAndWebhooksData({ client });

    logger.debug("Getting Saleor instance details");

    const instanceDetails = await getSaleorInstanceDetails({ client });

    loggerContext.set(OBSERVABILITY_ATTRIBUTES.SALEOR_VERSION, instanceDetails.version);

    logger.debug("Generate list of webhook manifests");

    const newWebhookManifests = await getManifests({ appDetails, instanceDetails });

    logger.debug("Updating webhooks");

    await updateWebhooks({
      client,
      webhookManifests: newWebhookManifests,
      existingWebhooksData: appDetails.webhooks || [],
      dryRun,
    });
    logger.info(`${apiUrl}: Migration finished successfully.`);
  } catch (error) {
    switch (true) {
      case error instanceof AppPermissionDeniedError:
        logger.warn(
          `⚠️ ${apiUrl}: wasn't migrated due to request being denied (app probably uninstalled)`,
          {
            error,
            reason: "App probably uninstalled",
          },
        );
        break;
      case error instanceof NetworkError:
        logger.warn(`${apiUrl}: wasn't migrated due to network error (Saleor not available)`, {
          error,
          reason: "Saleor not available",
        });
        break;
      case error instanceof UnknownConnectionError:
        logger.error(`${apiUrl}: Error while fetching data from Saleor`, { error });
        break;
      default:
        logger.error(`${apiUrl}: Error while running migrations`, { error });
    }
  }
};
