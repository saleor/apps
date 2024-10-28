import { Client } from "urql";

import { CreateAppWebhookDocument, WebhookCreateInput } from "../../generated/graphql";
import {
  doesErrorCodeExistsInErrors,
  WebhookMigrationAppPermissionDeniedError,
  WebhookMigrationNetworkError,
  WebhookMigrationUnknownError,
} from "../errors";
import { WebhookData } from "../types";

interface CreateAppWebhookArgs {
  client: Client;
  input: WebhookCreateInput;
}

export const createAppWebhook = async ({
  client,
  input,
}: CreateAppWebhookArgs): Promise<WebhookData> => {
  const { data, error } = await client.mutation(CreateAppWebhookDocument, { input }).toPromise();

  if (doesErrorCodeExistsInErrors(error?.graphQLErrors, "PermissionDenied")) {
    throw new WebhookMigrationAppPermissionDeniedError(
      "App cannot be migrated because app token permission is no longer valid",
    );
  }

  if (error?.networkError) {
    throw new WebhookMigrationNetworkError("Network error while creating app webhook", {
      cause: error.networkError,
    });
  }

  const webhook = data?.webhookCreate?.webhook;

  if (!webhook) {
    throw new WebhookMigrationUnknownError("Webhook create failed. The API returned an error", {
      errors: data?.webhookCreate?.errors.map((e) => WebhookMigrationUnknownError.normalize(e)),
    });
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
