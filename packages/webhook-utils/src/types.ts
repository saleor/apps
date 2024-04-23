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

export type Logger = {
  info: (message: string, meta?: Record<string, unknown>) => void;
  debug: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
};
