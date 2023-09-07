import { Client } from "urql";
import { WebhookEventTypeAsyncEnum, WebhookEventTypeSyncEnum } from "../generated/graphql";
import { WebhookManifest } from "@saleor/app-sdk/types";
import { modifyAppWebhook } from "./operations/modify-app-webhook";

interface ModifyAppWebhookFromManifestArgs {
  client: Client;
  webhookId: string;
  webhookManifest: WebhookManifest;
}

export const modifyAppWebhookFromManifest = async ({
  client,
  webhookId,
  webhookManifest,
}: ModifyAppWebhookFromManifestArgs) => {
  return modifyAppWebhook({
    client,
    webhookId,
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
