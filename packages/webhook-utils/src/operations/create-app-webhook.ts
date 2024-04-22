import { Client } from "urql";
import { CreateAppWebhookDocument, WebhookCreateInput } from "../../generated/graphql";
import {
  AppPermissionDeniedError,
  NetworkError,
  UnknownConnectionError,
  doesErrorCodeExistsInErrors,
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
    throw new AppPermissionDeniedError(
      "App cannot be migrated because app token permission is no longer valid",
    );
  }

  if (error?.networkError) {
    throw new NetworkError("Network error while creating app webhook", {
      cause: error.networkError,
    });
  }

  const webhook = data?.webhookCreate?.webhook;

  if (!webhook) {
    throw new UnknownConnectionError(
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
