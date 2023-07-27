import { SyncWebhookResponsesMap } from "@saleor/app-sdk/handlers/next";
import {
  OrderCancelledEventSubscriptionFragment,
  OrderCreatedSubscriptionFragment,
  OrderFulfilledSubscriptionFragment,
  TaxBaseFragment,
} from "../../../generated/graphql";

export type CalculateTaxesResponse = SyncWebhookResponsesMap["ORDER_CALCULATE_TAXES"];

export type CreateOrderResponse = { id: string };

export interface ProviderWebhookService {
  calculateTaxes: (payload: TaxBaseFragment) => Promise<CalculateTaxesResponse>;
  createOrder: (payload: OrderCreatedSubscriptionFragment) => Promise<CreateOrderResponse>;
  fulfillOrder: (payload: OrderFulfilledSubscriptionFragment) => Promise<{ ok: boolean }>;
  cancelOrder: (payload: OrderCancelledEventSubscriptionFragment) => Promise<any>;
}
