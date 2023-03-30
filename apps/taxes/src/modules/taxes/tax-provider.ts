import { TaxBaseFragment } from "../../../generated/graphql";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { TaxProviderName } from "./providers/config";
import { ResponseTaxPayload } from "./types";

export interface TaxProvider {
  name: TaxProviderName;
  calculate: (payload: TaxBaseFragment, channel: ChannelConfig) => Promise<ResponseTaxPayload>;
}
