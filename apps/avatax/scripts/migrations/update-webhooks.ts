import { AuthData } from "@saleor/app-sdk/APL";
import { webhookMigrationRunner } from "@saleor/webhook-utils";
import { createInstrumentedGraphqlClient } from "../../src/lib/create-instrumented-graphql-client";
import { createLogger } from "../../src/logger";
import { loggerContext } from "../../src/logger-context";
import { appWebhooks } from "../../webhooks";

export const updateWebhooks = async ({
  authData,
  dryRun,
  logger,
}: {
  authData: AuthData;
  dryRun: boolean;
  logger: ReturnType<typeof createLogger>;
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
    logger,
    loggerContext,
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
