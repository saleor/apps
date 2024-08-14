import { AuthData } from "@saleor/app-sdk/APL";
import * as Sentry from "@sentry/nextjs";

import { createLogger } from "../../../logger";
import { CalculateTaxesResponse } from "../../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { CalculateTaxesPayload } from "../../webhooks/payloads/calculate-taxes-payload";
import { AvataxClient, CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxErrorsParser } from "../avatax-errors-parser";
import { AutomaticallyDistributedDiscountsStrategy } from "../discounts";
import { extractTransactionRedactedLogProperties } from "../extract-transaction-redacted-log-properties";
import { AvataxTaxCodeMatchesService } from "../tax-code/avatax-tax-code-matches.service";
import { AvataxCalculateTaxesPayloadService } from "./avatax-calculate-taxes-payload.service";
import { AvataxCalculateTaxesPayloadTransformer } from "./avatax-calculate-taxes-payload-transformer";
import { AvataxCalculateTaxesResponseTransformer } from "./avatax-calculate-taxes-response-transformer";

export type AvataxCalculateTaxesTarget = CreateTransactionArgs;
export type AvataxCalculateTaxesResponse = CalculateTaxesResponse;

const errorParser = new AvataxErrorsParser(Sentry.captureException);

export class AvataxCalculateTaxesAdapter
  implements WebhookAdapter<CalculateTaxesPayload, AvataxCalculateTaxesResponse>
{
  private logger = createLogger("AvataxCalculateTaxesAdapter");

  constructor(private avataxClient: AvataxClient) {}

  async send(
    payload: CalculateTaxesPayload,
    config: AvataxConfig,
    authData: AuthData,
    discountStrategy: AutomaticallyDistributedDiscountsStrategy,
  ): Promise<AvataxCalculateTaxesResponse> {
    this.logger.debug("Transforming the Saleor payload for calculating taxes with AvaTax...");

    const payloadService = new AvataxCalculateTaxesPayloadService(
      AvataxTaxCodeMatchesService.createFromAuthData(authData),
      new AvataxCalculateTaxesPayloadTransformer(),
    );

    const target = await payloadService.getPayload(payload, config, discountStrategy);

    this.logger.info(
      "Calling AvaTax createTransaction with transformed payload for calculate taxes event",
      {
        ...extractTransactionRedactedLogProperties(target.model),
      },
    );

    try {
      const response = await this.avataxClient.createTransaction(target);

      this.logger.info("AvaTax createTransaction successfully responded", {
        taxCalculationSummary: response.summary,
      });

      const responseTransformer = new AvataxCalculateTaxesResponseTransformer();

      const transformedResponse = responseTransformer.transform(response);

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
