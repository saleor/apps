import { Client } from "urql";
import { AppDetailsFragmentFragment } from "../generated/graphql";
import { WebhookManifest } from "@saleor/app-sdk/types";
import { getAppDetailsAndWebhooksData } from "./operations/get-app-details-and-webhooks-data";
import { createLogger } from "@saleor/apps-shared";
import { updateWebhooks } from "./update-webhooks";

const logger = createLogger({ name: "updateScript" });

interface updateScriptArgs {
  client: Client;
  getManifests: ({
    appDetails,
  }: {
    appDetails: AppDetailsFragmentFragment;
  }) => Promise<Array<WebhookManifest>>;
}

export const updateScript = async ({ client, getManifests }: updateScriptArgs) => {
  logger.info("Getting app details and webhooks data");

  let appDetails: AppDetailsFragmentFragment | undefined;

  try {
    appDetails = await getAppDetailsAndWebhooksData({ client });
  } catch (e) {
    logger.error(e, "Couldn't fetch the app details.");
    logger.error("Exiting...");
    return;
  }

  if (!appDetails) {
    logger.error("No app details.");
    return;
  }

  logger.debug("Got app details and webhooks data. Generate list of webhook manifests");
  const newWebhookManifests = await getManifests({ appDetails });

  logger.debug("Got list of webhook manifests. Updating webhooks");
  await updateWebhooks({
    client,
    webhookManifests: newWebhookManifests,
    existingWebhooksData: appDetails.webhooks || [],
  });
  logger.info("Webhooks migrated successfully");
};
