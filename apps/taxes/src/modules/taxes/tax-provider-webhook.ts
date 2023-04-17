import { SyncWebhookResponsesMap } from "@saleor/app-sdk/handlers/next";
import {
  OrderCreatedSubscriptionFragment,
  OrderFulfilledSubscriptionFragment,
  TaxBaseFragment,
} from "../../../generated/graphql";
import { ChannelConfig } from "../channels-configuration/channels-config";

export type CalculateTaxesResponse = SyncWebhookResponsesMap["ORDER_CALCULATE_TAXES"];

export type CreateOrderResponse = { id: string };

export interface ProviderWebhookService {
  calculateTaxes: (
    payload: TaxBaseFragment,
    channel: ChannelConfig
  ) => Promise<CalculateTaxesResponse>;
  createOrder: (
    payload: OrderCreatedSubscriptionFragment,
    channel: ChannelConfig
  ) => Promise<CreateOrderResponse>;
  fulfillOrder: (
    payload: OrderFulfilledSubscriptionFragment,
    channel: ChannelConfig
  ) => Promise<{ ok: boolean }>;
}
