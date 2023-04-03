import { TaxBaseFragment } from "../../../generated/graphql";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { ResponseTaxPayload } from "./types";

export interface ProviderWebhookService {
  calculateTaxes: (payload: TaxBaseFragment, channel: ChannelConfig) => Promise<ResponseTaxPayload>;
  createOrder: (...args: any) => Promise<any>;
}
