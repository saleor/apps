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

  if (data?.webhookCreate?.errors) {
    throw new WebhookMigrationUnknownError("Webhook creation failed. The API returned an error", {
      errors: data.webhookCreate.errors,
    });
  }

  const webhook = data?.webhookCreate?.webhook;

  if (!webhook) {
    throw new WebhookMigrationUnknownError(
      "Webhook creation response is empty. The API returned no additional error.",
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
