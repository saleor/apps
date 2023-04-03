import { SyncWebhookResponsesMap } from "@saleor/app-sdk/handlers/next";
import { OrderSubscriptionFragment, TaxBaseFragment } from "../../../generated/graphql";
import { ChannelConfig } from "../channels-configuration/channels-config";

export type CalculateTaxesResponse = SyncWebhookResponsesMap["ORDER_CALCULATE_TAXES"];

export interface ProviderWebhookService {
  calculateTaxes: (
    payload: TaxBaseFragment,
    channel: ChannelConfig
  ) => Promise<CalculateTaxesResponse>;
  createOrder: (
    payload: OrderSubscriptionFragment,
    channel: ChannelConfig
  ) => Promise<{ ok: boolean }>;
}
