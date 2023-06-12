import { SyncWebhookResponsesMap } from "@saleor/app-sdk/handlers/next";
import {
  OrderCreatedSubscriptionFragment,
  OrderFulfilledSubscriptionFragment,
  TaxBaseFragment,
} from "../../../generated/graphql";
import { ChannelConfig } from "../channel-configuration/channel-config";

export type CalculateTaxesResponse = SyncWebhookResponsesMap["ORDER_CALCULATE_TAXES"];

export type CreateOrderResponse = { id: string };

export interface ProviderWebhookService {
  calculateTaxes: (payload: TaxBaseFragment) => Promise<CalculateTaxesResponse>;
  createOrder: (payload: OrderCreatedSubscriptionFragment) => Promise<CreateOrderResponse>;
  fulfillOrder: (payload: OrderFulfilledSubscriptionFragment) => Promise<{ ok: boolean }>;
}
