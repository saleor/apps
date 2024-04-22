import { WebhookEventTypeAsyncEnum, WebhookEventTypeSyncEnum } from "../generated/graphql";

export type WebhookData = {
  id: string;
  name: string | null | undefined;
  isActive: boolean;
  targetUrl: string;
  query: string | null | undefined;
  asyncEventsTypes: Array<WebhookEventTypeAsyncEnum>;
  syncEventsTypes: Array<WebhookEventTypeSyncEnum>;
};
