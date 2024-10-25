import { Client } from "urql";

import { ModifyAppWebhookDocument, WebhookUpdateInput } from "../../generated/graphql";
import {
  doesErrorCodeExistsInErrors,
  WebhookMigrationAppPermissionDeniedError,
  WebhookMigrationNetworkError,
  WebhookMigrationUnknownError,
} from "../errors";
import { WebhookData } from "../types";

interface ModifyAppWebhookArgs {
  client: Client;
  webhookId: string;
  input: WebhookUpdateInput;
}

export const modifyAppWebhook = async ({
  client,
  webhookId,
  input,
}: ModifyAppWebhookArgs): Promise<WebhookData> => {
  const { data, error } = await client
    .mutation(ModifyAppWebhookDocument, { id: webhookId, input })
    .toPromise();

  if (doesErrorCodeExistsInErrors(error?.graphQLErrors, "PermissionDenied")) {
    throw new WebhookMigrationAppPermissionDeniedError(
      "App cannot be migrated because app token permission is no longer valid",
    );
  }

  if (error?.networkError) {
    throw new WebhookMigrationNetworkError("Network error while modifying app webhook", {
      cause: error.networkError,
    });
  }

  if (data?.webhookUpdate?.errors) {
    throw new WebhookMigrationUnknownError("Webhook update failed. The API returned an error", {
      errors: data.webhookUpdate.errors,
    });
  }

  const webhook = data?.webhookUpdate?.webhook;

  if (!webhook) {
    throw new WebhookMigrationUnknownError(
      "Webhook update response is empty. The API returned no additional error.",
      { cause: error },
    );
  }

  return {
    isActive: webhook.isActive,
    id: webhook.id,
    name: webhook.name,
    targetUrl: webhook.targetUrl,
    query: webhook.subscriptionQuery,
    asyncEventsTypes: webhook.asyncEvents.map((event) => event.eventType),
    syncEventsTypes: webhook.syncEvents.map((event) => event.eventType),
  };
};
