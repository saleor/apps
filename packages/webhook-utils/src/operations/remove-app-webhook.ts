import { Client } from "urql";
import { RemoveAppWebhookDocument } from "../../generated/graphql";
import {
  AppPermissionDeniedError,
  NetworkError,
  UnknownConnectionError,
  doesErrorCodeExistsInErrors,
} from "../errors";

interface RemoveAppWebhookArgs {
  client: Client;
  webhookId: string;
}

export const removeAppWebhook = async ({ client, webhookId }: RemoveAppWebhookArgs) => {
  const { error } = await client.mutation(RemoveAppWebhookDocument, { id: webhookId }).toPromise();

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

  if (error) {
    throw new UnknownConnectionError(`Webhook creation failed. The API returned an error`, {
      cause: error,
    });
  }

  return;
};
