import { AuthData } from "@saleor/app-sdk/APL";
import { createLogger } from "../../../logger";
import { CalculateTaxesResponse } from "../../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { CalculateTaxesPayload } from "../../webhooks/payloads/calculate-taxes-payload";
import { AvataxClient, CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxErrorsParser } from "../avatax-errors-parser";
import { extractTransactionArgsProperites } from "../create-transaction-args-properties";
import { AvataxTaxCodeMatchesService } from "../tax-code/avatax-tax-code-matches.service";
import { AvataxCalculateTaxesPayloadTransformer } from "./avatax-calculate-taxes-payload-transformer";
import { AvataxCalculateTaxesPayloadService } from "./avatax-calculate-taxes-payload.service";
import { AvataxCalculateTaxesResponseTransformer } from "./avatax-calculate-taxes-response-transformer";

export type AvataxCalculateTaxesTarget = CreateTransactionArgs;
export type AvataxCalculateTaxesResponse = CalculateTaxesResponse;

export class AvataxCalculateTaxesAdapter
  implements WebhookAdapter<CalculateTaxesPayload, AvataxCalculateTaxesResponse>
{
  private logger = createLogger("AvataxCalculateTaxesAdapter");

  constructor(private avataxClient: AvataxClient) {}

  async send(
    payload: CalculateTaxesPayload,
    config: AvataxConfig,
    authData: AuthData,
  ): Promise<AvataxCalculateTaxesResponse> {
    this.logger.debug("Transforming the Saleor payload for calculating taxes with AvaTax...");

    const payloadService = new AvataxCalculateTaxesPayloadService(
      AvataxTaxCodeMatchesService.createFromAuthData(authData),
      new AvataxCalculateTaxesPayloadTransformer(),
    );

    const target = await payloadService.getPayload(payload, config);

    this.logger.info(
      "Calling AvaTax createTransaction with transformed payload for calculate taxes event",
      {
        ...extractTransactionArgsProperites(target.model),
      },
    );

    try {
      const response = await this.avataxClient.createTransaction(target);

      this.logger.info("AvaTax createTransaction successfully responded");

      const responseTransformer = new AvataxCalculateTaxesResponseTransformer();
      const transformedResponse = responseTransformer.transform(response);

      this.logger.debug("Transformed AvaTax createTransaction response");

      return transformedResponse;
    } catch (e) {
      const errorParser = new AvataxErrorsParser();
      const error = errorParser.parse(e);

      /**
       * TODO: Refactor errors so we are able to print error only for unhandled cases, otherwise use warnings etc
       */
      this.logger.error("Error calculating taxes", { error });

      throw error;
    }
  }
}
