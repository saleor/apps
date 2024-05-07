import { Client } from "urql";
import { GetAppDetailsAndWebhooksDataDocument } from "../../generated/graphql";
import {
  AppPermissionDeniedError,
  NetworkError,
  UnknownConnectionError,
  doesErrorCodeExistsInErrors,
} from "../errors";
import { WebhookData } from "../types";

interface GetAppWebhooksArgs {
  client: Client;
}

export type AppDetails = {
  appUrl: string | null | undefined;
  webhooks: Array<WebhookData> | undefined;
};

export const getAppDetailsAndWebhooksData = async ({
  client,
}: GetAppWebhooksArgs): Promise<AppDetails> => {
  const { data, error } = await client.query(GetAppDetailsAndWebhooksDataDocument, {}).toPromise();

  if (doesErrorCodeExistsInErrors(error?.graphQLErrors, "PermissionDenied")) {
    throw new AppPermissionDeniedError(
      "App cannot be migrated because app token permission is no longer valid",
    );
  }

  if (error?.networkError) {
    throw new NetworkError("Network error while fetching app details", {
      cause: error.networkError,
    });
  }

  const app = data?.app;

  if (!app) {
    throw new UnknownConnectionError("Cannot fetch app details", { cause: error });
  }

  return {
    appUrl: app.appUrl,
    webhooks: app.webhooks?.map((webhook) => ({
      isActive: webhook.isActive,
      id: webhook.id,
      name: webhook.name,
      targetUrl: webhook.targetUrl,
      query: webhook.subscriptionQuery,
      asyncEventsTypes: webhook.asyncEvents.map((event) => event.eventType),
      syncEventsTypes: webhook.syncEvents.map((event) => event.eventType),
    })),
  };
};
