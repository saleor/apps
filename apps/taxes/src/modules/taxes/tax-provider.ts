import { TaxBaseFragment } from "../../../generated/graphql";
import { ResponseTaxPayload } from "../../lib/saleor/types";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { TaxProviderName } from "./providers";

type ExternalValidationResult = { ok: boolean; error?: string };

export interface TaxProvider {
  name: TaxProviderName;
  calculate: (payload: TaxBaseFragment, channel: ChannelConfig) => Promise<ResponseTaxPayload>;
  validate?: () => Promise<ExternalValidationResult>;
}
