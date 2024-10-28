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
  const { data, error } = await client
    .mutation(RemoveAppWebhookDocument, { id: webhookId })
    .toPromise();

  if (doesErrorCodeExistsInErrors(error?.graphQLErrors, "PermissionDenied")) {
    throw new WebhookMigrationAppPermissionDeniedError(
      "App cannot be migrated because app token permission is no longer valid",
    );
  }

  if (error?.networkError) {
    throw new WebhookMigrationNetworkError("Network error while deleting app webhook", {
      cause: error.networkError,
    });
  }

  if (!data?.webhookDelete?.webhook?.id) {
    throw new WebhookMigrationUnknownError("Webhook deletion failed. The API returned an error", {
      errors: data?.webhookDelete?.errors.map((e) => WebhookMigrationUnknownError.normalize(e)),
    });
  }

  return;
};
