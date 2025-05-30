import { AuthData } from "@saleor/app-sdk/APL";
import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";
import { WebhookMigrationRunner } from "@saleor/webhook-utils";

export const updateWebhooksScript = async ({
  authData,
  dryRun,
}: {
  authData: AuthData;
  dryRun: boolean;
}) => {
  const client = createGraphQLClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });

  const runner = new WebhookMigrationRunner({
    dryRun,
    logger: console,
    client,
    saleorApiUrl: authData.saleorApiUrl,
    getManifests: async ({ appDetails }) => {
      // Products feed application has currently no webhooks, so we return empty array
      return [];
    },
  });

  await runner.migrate();
};
