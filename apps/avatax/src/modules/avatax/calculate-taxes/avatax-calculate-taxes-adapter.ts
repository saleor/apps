import { AuthData } from "@saleor/app-sdk/APL";
import { createLogger } from "../../../logger";
import { CalculateTaxesResponse } from "../../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { CalculateTaxesPayload } from "../../webhooks/payloads/calculate-taxes-payload";
import { AvataxClient, CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { normalizeAvaTaxError } from "../avatax-error-normalizer";
import { AvataxCalculateTaxesPayloadService } from "./avatax-calculate-taxes-payload.service";
import { AvataxCalculateTaxesResponseTransformer } from "./avatax-calculate-taxes-response-transformer";

export type AvataxCalculateTaxesTarget = CreateTransactionArgs;
export type AvataxCalculateTaxesResponse = CalculateTaxesResponse;

export class AvataxCalculateTaxesAdapter
  implements WebhookAdapter<CalculateTaxesPayload, AvataxCalculateTaxesResponse>
{
  private logger = createLogger("AvataxCalculateTaxesAdapter");
  private readonly config: AvataxConfig;
  private readonly authData: AuthData;

  constructor({ config, authData }: { config: AvataxConfig; authData: AuthData }) {
    this.config = config;
    this.authData = authData;
  }

  async send(payload: CalculateTaxesPayload): Promise<AvataxCalculateTaxesResponse> {
    this.logger.debug("Transforming the Saleor payload for calculating taxes with AvaTax...");
    const payloadService = new AvataxCalculateTaxesPayloadService(this.authData);
    const target = await payloadService.getPayload(payload, this.config);

    this.logger.debug("Calling AvaTax createTransaction with transformed payload...");

    const client = new AvataxClient(this.config);

    try {
      const response = await client.createTransaction(target);

      this.logger.info("AvaTax createTransaction successfully responded");

      const responseTransformer = new AvataxCalculateTaxesResponseTransformer();
      const transformedResponse = responseTransformer.transform(response);

      this.logger.debug("Transformed AvaTax createTransaction response");

      return transformedResponse;
    } catch (e) {
      const error = normalizeAvaTaxError(e);

      /**
       * TODO: Add handling of specific cases
       */
      this.logger.error("Error calculating taxes", { error });

      throw error;
    }
  }
}
