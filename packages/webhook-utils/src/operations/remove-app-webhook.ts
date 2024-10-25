import { Client } from "urql";

import { RemoveAppWebhookDocument } from "../../generated/graphql";
import {
  doesErrorCodeExistsInErrors,
  WebhookMigrationAppPermissionDeniedError,
  WebhookMigrationNetworkError,
  WebhookMigrationUnknownError,
} from "../errors";

interface RemoveAppWebhookArgs {
  client: Client;
  webhookId: string;
}

export const removeAppWebhook = async ({ client, webhookId }: RemoveAppWebhookArgs) => {
  const { error } = await client.mutation(RemoveAppWebhookDocument, { id: webhookId }).toPromise();

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

  if (error) {
    throw new WebhookMigrationUnknownError(`Webhook creation failed. The API returned an error`, {
      cause: error,
    });
  }

  return;
};
