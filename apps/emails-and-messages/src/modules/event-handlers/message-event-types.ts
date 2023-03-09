import { AsyncWebhookEventType } from "@saleor/app-sdk/types";

export const messageEventTypes = [
  "ORDER_CREATED",
  "ORDER_FULFILLED",
  "ORDER_CONFIRMED",
  "ORDER_CANCELLED",
  "ORDER_FULLY_PAID",
  "INVOICE_SENT",
] as const;

type Subset<K, T extends K> = T;

export type MessageEventTypes = Subset<AsyncWebhookEventType, (typeof messageEventTypes)[number]>;

export const messageEventTypesLabels: Record<MessageEventTypes, string> = {
  ORDER_CREATED: "Order created",
  ORDER_FULFILLED: "Order fulfilled",
  ORDER_CONFIRMED: "Order confirmed",
  ORDER_CANCELLED: "Order cancelled",
  ORDER_FULLY_PAID: "Order fully paid",
  INVOICE_SENT: "Invoice sent",
};
