import { WebhookManifest } from "@saleor/app-sdk/types";
import { Client } from "urql";
import { getAppDetailsAndWebhooksData } from "./operations/get-app-details-and-webhooks-data";

interface updateWebhooksArgs {
  client: Client;
  webhookManifests: Array<WebhookManifest>;
}

export const updateWebhooks = async ({ client, webhookManifests }: updateWebhooksArgs) => {
  // Get all existing webhooks
  const appDetails = await getAppDetailsAndWebhooksData({ client });

  // Based on names, find the ones which should be removed
  const webhookDefinitions: Array<WebhookManifest> = [];

  // Based on names, find the ones which should be added

  // Based on names, find the ones which should be updated
};
