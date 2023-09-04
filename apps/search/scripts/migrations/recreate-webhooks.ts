/* eslint-disable turbo/no-undeclared-env-vars */

import { createGraphQLClient } from "@saleor/apps-shared";
import { AuthData } from "@saleor/app-sdk/APL";
import { recreateWebhooks, updateScript } from "@saleor/webhook-utils";
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

  await updateScript({
    client,
    getManifests: async ({ appDetails }) => {
      const webhooks = appDetails.webhooks;

      if (!webhooks?.length) {
        console.info("The environment does not have any webhooks, skipping");
        return [];
      }

      // All webhooks in this application are turned on or off. If any of them is enabled, we enable all of them.
      const enabled = webhooks.some((w) => w.isActive);

      const targetUrl = appDetails.appUrl;

      if (!targetUrl?.length) {
        throw new Error("App has no defined appUrl, skipping");
      }

      const baseUrl = new URL(targetUrl).origin;

      return appWebhooks.map((w) => ({ ...w.getWebhookManifest(baseUrl), enabled }));
    },
  });
};
