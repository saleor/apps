import { TaxBaseFragment } from "../../../../generated/graphql";
import { ChannelConfig } from "../../channels-configuration/channels-config";
import { CalculateTaxesResponse } from "../../taxes/tax-provider-webhook";
import { FetchTaxForOrderArgs, TaxJarClient } from "../taxjar-client";
import { TaxJarConfig } from "../taxjar-config";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { TaxJarCalculateTaxesPayloadTransformer } from "./taxjar-calculate-taxes-payload-transformer";
import { TaxJarCalculateTaxesResponseTransformer } from "./taxjar-calculate-taxes-response-transformer";

export type Payload = {
  taxBase: TaxBaseFragment;
  channelConfig: ChannelConfig;
};

export type Target = FetchTaxForOrderArgs;
export type Response = CalculateTaxesResponse;

export class TaxJarCalculateTaxesAdapter implements WebhookAdapter<Payload, Response> {
  constructor(private readonly config: TaxJarConfig) {}

  async send(payload: Payload): Promise<Response> {
    const payloadTransformer = new TaxJarCalculateTaxesPayloadTransformer();
    const target = payloadTransformer.transform(payload);

    const client = new TaxJarClient(this.config);
    const response = await client.fetchTaxForOrder(target);

    const responseTransformer = new TaxJarCalculateTaxesResponseTransformer();
    const transformedResponse = responseTransformer.transform(response);

    return transformedResponse;
  }
}
