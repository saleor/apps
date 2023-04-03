import { TaxBaseFragment } from "../../../generated/graphql";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { TaxProviderName } from "./provider-config";
import { ResponseTaxPayload } from "./types";

export interface TaxProvider {
  name: TaxProviderName;
  calculate: (payload: TaxBaseFragment, channel: ChannelConfig) => Promise<ResponseTaxPayload>;
}
