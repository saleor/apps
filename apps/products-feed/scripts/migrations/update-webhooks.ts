/* eslint-disable turbo/no-undeclared-env-vars */

import { AuthData } from "@saleor/app-sdk/APL";
import { createGraphQLClient } from "@saleor/apps-shared";
import { WebhookMigrationRunner } from "@saleor/webhook-utils";

export const updateWebhooksScript = async ({
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

  const runner = new WebhookMigrationRunner({
    dryRun,
    logger: console,
    client,
    getManifests: async ({ appDetails }) => {
      // Products feed application has currently no webhooks, so we return empty array
      return [];
    },
  });

  await runner.migrate();
};
