/* eslint-disable turbo/no-undeclared-env-vars */

import { createGraphQLClient } from "@saleor/apps-shared";
import { AuthData } from "@saleor/app-sdk/APL";
import { getAppDetailsAndWebhooksData, recreateWebhooks } from "@saleor/webhook-utils";
import { appWebhooks } from "../../webhooks";

export const recreateWebhooksScript = async ({
  authData,
  dryRun,
}: {
  authData: AuthData;
  dryRun: boolean;
}) => {
  console.log("Working on env: ", authData.saleorApiUrl);

  const client = createGraphQLClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });

  const appData = await getAppDetailsAndWebhooksData({ client });

  const webhooks = appData?.webhooks;

  if (!webhooks?.length) {
    console.error("The environment does not have any webhooks, skipping");
    return;
  }

  // Use currently existing webhook data to determine a proper baseUrl and enabled state
  const targetUrl = appData?.appUrl; // TODO: validate if thats always populated

  if (!targetUrl?.length) {
    console.error("App has no defined appUrl, skipping");
    return;
  }

  const enabled = webhooks[0].isActive;

  const baseUrl = new URL(targetUrl).origin;

  if (dryRun) {
    console.log("Necessary data gathered, skipping recreation of webhooks due to dry run mode");
    return;
  }

  try {
    await recreateWebhooks({
      client,
      webhookManifests: appWebhooks.map((w) => ({ ...w.getWebhookManifest(baseUrl), enabled })),
    });
    console.log("✅ Webhooks recreated successfully");
  } catch (e) {
    console.error("🛑 Failed to recreate webhooks: ", e);
  }
};
