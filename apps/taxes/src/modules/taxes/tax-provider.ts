import { TaxBaseFragment } from "../../../generated/graphql";
import { ResponseTaxPayload } from "./types";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { TaxProviderName } from "./providers/config";

type ExternalValidationResult = { ok: boolean; error?: string };

export interface TaxProvider {
  name: TaxProviderName;
  calculate: (payload: TaxBaseFragment, channel: ChannelConfig) => Promise<ResponseTaxPayload>;
}
