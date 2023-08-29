/* eslint-disable turbo/no-undeclared-env-vars */

import { createGraphQLClient } from "@saleor/apps-shared";
import { WebhookActivityTogglerService } from "../../src/domain/WebhookActivityToggler.service";
import { FetchOwnWebhooksDocument } from "../../generated/graphql";
import { AuthData } from "@saleor/app-sdk/APL";

export const recreateWebhooks = async ({
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
  const webhooks = await client
    .query(FetchOwnWebhooksDocument, {
      id: authData.appId,
    })
    .toPromise()
    .then((r) => r.data?.app?.webhooks);

  if (!webhooks?.length) {
    console.error("The environment does not have any webhooks, skipping");
    return;
  }

  // Use currently existing webhook data to determine a proper baseUrl and enabled state
  const targetUrl = webhooks[0].targetUrl;
  const enabled = webhooks[0].isActive;

  const baseUrl = new URL(targetUrl).origin;

  if (dryRun) {
    console.log("Necessary data gathered, skipping recreation of webhooks due to dry run mode");
    return;
  }

  const webhookService = new WebhookActivityTogglerService(authData.appId, client);

  try {
    await webhookService.recreateOwnWebhooks({ baseUrl, enableWebhooks: enabled });
    console.log("✅ Webhooks recreated successfully");
  } catch (e) {
    console.error("🛑 Failed to recreate webhooks: ", e);
  }
};
