import { AuthData } from "@saleor/app-sdk/APL";
import { WebhookMigrationRunner } from "@saleor/webhook-utils";

import { createInstrumentedGraphqlClient } from "../../src/lib/create-instrumented-graphql-client";
import { appWebhooks } from "../../webhooks";
import { createMigrationScriptLogger } from "./migration-logger";

const logger = createMigrationScriptLogger("updateWebhooksScript");

export const updateWebhooksScript = async ({
  authData,
  dryRun,
}: {
  authData: AuthData;
  dryRun: boolean;
}) => {
  logger.info("Working on env: ", authData.saleorApiUrl);

  const client = createInstrumentedGraphqlClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });

  const runner = new WebhookMigrationRunner({
    dryRun,
    logger,
    client,
    saleorApiUrl: authData.saleorApiUrl,
    getManifests: async ({ appDetails }) => {
      const webhooks = appDetails.webhooks;

      if (!webhooks?.length) {
        logger.info("The environment does not have any webhooks, skipping");

        return [];
      }

      // All webhooks in this application are turned on or off. If any of them is enabled, we enable all of them.
      const isActive = webhooks.some((w) => w.isActive);

      const targetUrl = appDetails.appUrl;

      if (!targetUrl?.length) {
        throw new Error("App has no defined appUrl, skipping");
      }

      const baseUrl = new URL(targetUrl).origin;

      return appWebhooks.map((w) => ({ ...w.getWebhookManifest(baseUrl), isActive }));
    },
  });

  await runner.migrate();
};
