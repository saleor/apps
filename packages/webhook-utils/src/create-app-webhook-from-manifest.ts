import { Client } from "urql";
import { WebhookEventTypeAsyncEnum, WebhookEventTypeSyncEnum } from "../generated/graphql";
import { WebhookManifest } from "@saleor/app-sdk/types";
import { createAppWebhook } from "./operations/create-app-webhook";

interface CreateAppWebhookArgs {
  client: Client;
  webhookManifest: WebhookManifest;
}

export const createAppWebhookFromManifest = async ({
  client,
  webhookManifest,
}: CreateAppWebhookArgs) => {
  return createAppWebhook({
    client,
    input: {
      asyncEvents: webhookManifest.asyncEvents as WebhookEventTypeAsyncEnum[],
      syncEvents: webhookManifest.syncEvents as WebhookEventTypeSyncEnum[],
      isActive: webhookManifest.isActive,
      name: webhookManifest.name,
      targetUrl: webhookManifest.targetUrl,
      query: webhookManifest.query,
    },
  });
};
