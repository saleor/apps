import { AuthData } from "@saleor/app-sdk/APL";
import { TaxBaseFragment } from "../../../../generated/graphql";
import { ClientLogger } from "../../logs/client-logger";
import { CalculateTaxesResponse } from "../../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { FetchTaxForOrderArgs, TaxJarClient } from "../taxjar-client";
import { TaxJarConfig } from "../taxjar-connection-schema";
import { normalizeTaxJarError } from "../taxjar-error-normalizer";
import { TaxJarCalculateTaxesPayloadService } from "./taxjar-calculate-taxes-payload-service";
import { TaxJarCalculateTaxesResponseTransformer } from "./taxjar-calculate-taxes-response-transformer";
import { createLogger } from "../../../logger";

export type TaxJarCalculateTaxesPayload = {
  taxBase: TaxBaseFragment;
};

export type TaxJarCalculateTaxesTarget = FetchTaxForOrderArgs;
export type TaxJarCalculateTaxesResponse = CalculateTaxesResponse;

export class TaxJarCalculateTaxesAdapter
  implements WebhookAdapter<TaxJarCalculateTaxesPayload, TaxJarCalculateTaxesResponse>
{
  private logger = createLogger("TaxJarCalculateTaxesAdapter");
  private authData: AuthData;
  private readonly config: TaxJarConfig;
  private readonly clientLogger: ClientLogger;

  constructor({
    config,
    clientLogger,
    authData,
  }: {
    config: TaxJarConfig;
    clientLogger: ClientLogger;
    authData: AuthData;
  }) {
    this.clientLogger = clientLogger;
    this.authData = authData;
    this.config = config;
  }

  // todo: refactor because its getting too big
  async send(payload: TaxJarCalculateTaxesPayload): Promise<TaxJarCalculateTaxesResponse> {
    this.logger.debug("Transforming the Saleor payload for calculating taxes with TaxJar...");
    const payloadService = new TaxJarCalculateTaxesPayloadService(this.config, this.authData);
    const target = await payloadService.getPayload(payload);

    this.logger.debug("Calling TaxJar fetchTaxForOrder with transformed payload...");

    const client = new TaxJarClient(this.config);

    try {
      const response = await client.fetchTaxForOrder(target);

      this.logger.debug("TaxJar fetchTaxForOrder responded with:");

      const responseTransformer = new TaxJarCalculateTaxesResponseTransformer();
      const transformedResponse = responseTransformer.transform(payload, response);

      this.logger.debug("Transformed TaxJar fetchTaxForOrder response to");

      return transformedResponse;
    } catch (e) {
      const error = normalizeTaxJarError(e);

      this.clientLogger.push({
        event: "[CalculateTaxes] fetchTaxForOrder",
        status: "error",
        payload: {
          input: target,
          output: error.message,
        },
      });

      throw error;
    }
  }
}
