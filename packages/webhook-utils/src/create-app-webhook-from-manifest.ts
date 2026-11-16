import { type WebhookManifest } from "@saleor/app-sdk/types";
import { type Client } from "urql";

import {
  type WebhookEventTypeAsyncEnum,
  type WebhookEventTypeSyncEnum,
} from "../generated/graphql";
import { createAppWebhook } from "./operations/create-app-webhook";

interface CreateAppWebhookFromManifestArgs {
  client: Client;
  webhookManifest: WebhookManifest;
}

export const createAppWebhookFromManifest = async ({
  client,
  webhookManifest,
}: CreateAppWebhookFromManifestArgs) => {
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
