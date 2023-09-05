import { Client } from "urql";
import { AppDetailsFragmentFragment } from "../generated/graphql";
import { WebhookManifest } from "@saleor/app-sdk/types";
import { getAppDetailsAndWebhooksData } from "./operations/get-app-details-and-webhooks-data";
import { createLogger } from "@saleor/apps-shared";
import { updateWebhooks } from "./update-webhooks";

const logger = createLogger({ name: "updateScript" });

interface WebhookMigrationRunnerArgs {
  client: Client;
  getManifests: ({
    appDetails,
  }: {
    appDetails: AppDetailsFragmentFragment;
  }) => Promise<Array<WebhookManifest>>;
}

export const webhookMigrationRunner = async ({
  client,
  getManifests,
}: WebhookMigrationRunnerArgs) => {
  logger.info("Getting app details and webhooks data");

  let appDetails: AppDetailsFragmentFragment | undefined;

  try {
    appDetails = await getAppDetailsAndWebhooksData({ client });
  } catch (e) {
    logger.error(e, "Couldn't fetch the app details.");
    return;
  }

  if (!appDetails) {
    logger.error("No app details.");
    return;
  }

  logger.debug("Got app details and webhooks data. Generate list of webhook manifests");
  let newWebhookManifests: Array<WebhookManifest> = [];

  try {
    newWebhookManifests = await getManifests({ appDetails });
  } catch (e) {
    logger.error(e, "Couldn't prepare list of manifests.");
    return;
  }

  logger.debug("Got list of webhook manifests. Updating webhooks");
  await updateWebhooks({
    client,
    webhookManifests: newWebhookManifests,
    existingWebhooksData: appDetails.webhooks || [],
  });
  logger.info("Migration finished.");
};
