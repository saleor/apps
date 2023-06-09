import { TaxBaseFragment } from "../../../../generated/graphql";
import { Logger, createLogger } from "../../../lib/logger";
import { CalculateTaxesResponse } from "../../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { FetchTaxForOrderArgs, TaxJarClient } from "../taxjar-client";
import { TaxJarConfig } from "../taxjar-connection-schema";
import { TaxJarCalculateTaxesPayloadTransformer } from "./taxjar-calculate-taxes-payload-transformer";
import { TaxJarCalculateTaxesResponseTransformer } from "./taxjar-calculate-taxes-response-transformer";

export type TaxJarCalculateTaxesPayload = {
  taxBase: TaxBaseFragment;
};

export type TaxJarCalculateTaxesTarget = FetchTaxForOrderArgs;
export type TaxJarCalculateTaxesResponse = CalculateTaxesResponse;

export class TaxJarCalculateTaxesAdapter
  implements WebhookAdapter<TaxJarCalculateTaxesPayload, TaxJarCalculateTaxesResponse>
{
  private logger: Logger;
  constructor(private readonly config: TaxJarConfig) {
    this.logger = createLogger({ location: "TaxJarCalculateTaxesAdapter" });
  }

  async send(payload: TaxJarCalculateTaxesPayload): Promise<TaxJarCalculateTaxesResponse> {
    this.logger.debug({ payload }, "Transforming the following Saleor payload:");
    const payloadTransformer = new TaxJarCalculateTaxesPayloadTransformer(this.config);
    const target = payloadTransformer.transform(payload);

    this.logger.debug(
      { transformedPayload: target },
      "Will call TaxJar fetchTaxForOrder with transformed payload:"
    );

    const client = new TaxJarClient(this.config);
    const response = await client.fetchTaxForOrder(target);

    this.logger.debug({ response }, "TaxJar fetchTaxForOrder responded with:");

    const responseTransformer = new TaxJarCalculateTaxesResponseTransformer();
    const transformedResponse = responseTransformer.transform(payload, response);

    this.logger.debug({ transformedResponse }, "Transformed TaxJar fetchTaxForOrder response to:");

    return transformedResponse;
  }
}
