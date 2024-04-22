import { AuthData } from "@saleor/app-sdk/APL";
import { createLogger } from "@saleor/apps-logger";
import { webhookMigrationRunner } from "@saleor/webhook-utils";
import { createInstrumentedGraphqlClient } from "../../src/lib/create-instrumented-graphql-client";
import { appWebhooks } from "../../webhooks";

const logger = createLogger("UpdateWebhooks");

export const updateWebhooks = async ({
  authData,
  dryRun,
}: {
  authData: AuthData;
  dryRun: boolean;
}) => {
  logger.debug("Working on environment: ", authData.saleorApiUrl);

  const client = createInstrumentedGraphqlClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });

  await webhookMigrationRunner({
    apiUrl: authData.saleorApiUrl,
    client,
    dryRun,
    getManifests: async ({ appDetails, instanceDetails }) => {
      const webhooks = appDetails.webhooks;

      if (!webhooks?.length) {
        logger.info("The environment does not have any webhooks, skipping", {
          apiUrl: authData.saleorApiUrl,
          saleorVersion: instanceDetails.version,
        });
        return [];
      }

      const enabled = webhooks.some((w) => w.isActive);

      const targetUrl = appDetails.appUrl;

      if (!targetUrl?.length) {
        logger.error("App has no defined appUrl, skipping", {
          apiUrl: authData.saleorApiUrl,
          saleorVersion: instanceDetails.version,
        });
        return [];
      }

      const baseUrl = new URL(targetUrl).origin;

      // All webhooks in this application are turned on or off. If any of them is enabled, we enable all of them.
      return appWebhooks.map((w) => ({ ...w.getWebhookManifest(baseUrl), enabled }));
    },
  });
};
