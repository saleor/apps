import { SyncWebhookResponsesMap } from "@saleor/app-sdk/handlers/next";
import { TaxBaseFragment } from "../../../generated/graphql";
import { ChannelConfig } from "../channels-configuration/channels-config";

export type ResponseTaxPayload = SyncWebhookResponsesMap["ORDER_CALCULATE_TAXES"];

export interface ProviderWebhookService {
  calculateTaxes: (payload: TaxBaseFragment, channel: ChannelConfig) => Promise<ResponseTaxPayload>;
  createOrder: (payload: TaxBaseFragment, channel: ChannelConfig) => Promise<any>;
}
