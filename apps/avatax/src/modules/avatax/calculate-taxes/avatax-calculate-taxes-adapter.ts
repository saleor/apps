import { createLogger } from "../../../logger";
import { CalculateTaxesResponse } from "../../taxes/tax-provider-webhook";
import { AvataxClient, CreateTransactionArgs } from "../avatax-client";
import { AvataxErrorsParser } from "../avatax-errors-parser";
import { extractTransactionRedactedLogProperties } from "../extract-transaction-redacted-log-properties";
import { AvataxCalculateTaxesResponseTransformer } from "./avatax-calculate-taxes-response-transformer";

export type AvataxCalculateTaxesTarget = CreateTransactionArgs;
export type AvataxCalculateTaxesResponse = CalculateTaxesResponse;

const errorParser = new AvataxErrorsParser();

export class AvataxCalculateTaxesAdapter {
  private logger = createLogger("AvataxCalculateTaxesAdapter");

  constructor(
    private avataxClient: AvataxClient,
    private avataxCalculateTaxesResponseTransformer: AvataxCalculateTaxesResponseTransformer,
  ) {}

  async send(avataxModel: AvataxCalculateTaxesTarget): Promise<AvataxCalculateTaxesResponse> {
    this.logger.debug("Transforming the Saleor payload for calculating taxes with AvaTax...");

    this.logger.info(
      "Calling AvaTax createTransaction with transformed payload for calculate taxes event",
      {
        ...extractTransactionRedactedLogProperties(avataxModel.model),
      },
    );

    try {
      const response = await this.avataxClient.createTransaction(avataxModel);

      this.logger.info("AvaTax createTransaction successfully responded", {
        taxCalculationSummary: response.summary,
      });

      const transformedResponse = this.avataxCalculateTaxesResponseTransformer.transform(response);

      this.logger.debug("Transformed AvaTax createTransaction response");

      return transformedResponse;
    } catch (e) {
      const error = errorParser.parse(e);

      /**
       * TODO: Refactor errors so we are able to print error only for unhandled cases, otherwise use warnings etc
       */
      this.logger.error("Error calculating taxes", { error });

      throw error;
    }
  }
}
