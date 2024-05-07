import { Client } from "urql";
import { ModifyAppWebhookDocument, WebhookUpdateInput } from "../../generated/graphql";
import {
  AppPermissionDeniedError,
  NetworkError,
  UnknownConnectionError,
  doesErrorCodeExistsInErrors,
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
    throw new AppPermissionDeniedError(
      "App cannot be migrated because app token permission is no longer valid",
    );
  }

  if (error?.networkError) {
    throw new NetworkError("Network error while modifying app webhook", {
      cause: error.networkError,
    });
  }

  const webhook = data?.webhookUpdate?.webhook;

  if (!webhook) {
    throw new UnknownConnectionError(
      "Webhook modify response is empty. The API returned no additional error.",
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
