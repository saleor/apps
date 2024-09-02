import { SyncWebhookResponsesMap } from "@saleor/app-sdk/handlers/next";

export type CalculateTaxesResponse = SyncWebhookResponsesMap["ORDER_CALCULATE_TAXES"];

export type CreateOrderResponse = { id: string };

export type CancelOrderPayload = { avataxId: string };
