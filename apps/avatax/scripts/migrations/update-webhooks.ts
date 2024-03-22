import { AuthData } from "@saleor/app-sdk/APL";
import { webhookMigrationRunner } from "@saleor/webhook-utils";
import { createInstrumentedGraphqlClient } from "../../src/lib/create-instrumented-graphql-client";
import { appWebhooks } from "../../webhooks";

export const updateWebhooks = async ({
  authData,
  dryRun,
  silent,
}: {
  authData: AuthData;
  dryRun: boolean;
  silent: boolean;
}) => {
  if (!silent) {
    console.log("Working on environment: ", authData.saleorApiUrl);
  }

  const client = createInstrumentedGraphqlClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });

  await webhookMigrationRunner({
    client,
    dryRun,
    getManifests: async ({ appDetails }) => {
      const webhooks = appDetails.webhooks;

      if (!webhooks?.length) {
        console.info("The environment does not have any webhooks, skipping");
        return [];
      }

      const enabled = webhooks.some((w) => w.isActive);

      const targetUrl = appDetails.appUrl;

      if (!targetUrl?.length) {
        throw new Error("App has no defined appUrl, skipping");
      }

      const baseUrl = new URL(targetUrl).origin;

      // All webhooks in this application are turned on or off. If any of them is enabled, we enable all of them.
      return appWebhooks.map((w) => ({ ...w.getWebhookManifest(baseUrl), enabled }));
    },
  });
};
