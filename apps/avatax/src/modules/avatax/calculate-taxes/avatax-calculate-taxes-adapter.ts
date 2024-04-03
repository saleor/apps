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
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import { InvalidAppAddressError } from "../../taxes/tax-error";
import { AvataxTaxCodeMatchesService } from "../tax-code/avatax-tax-code-matches.service";
import { AvataxCalculateTaxesPayloadTransformer } from "./avatax-calculate-taxes-payload-transformer";

export type AvataxCalculateTaxesTarget = CreateTransactionArgs;
export type AvataxCalculateTaxesResponse = CalculateTaxesResponse;

export class AvataxCalculateTaxesAdapter
  implements WebhookAdapter<CalculateTaxesPayload, AvataxCalculateTaxesResponse>
{
  private logger = createLogger("AvataxCalculateTaxesAdapter");

  constructor(private avataxClient: AvataxClient) {}

  /**
   * Catch specific domain errors and transform them to errors that can be handled properly on the higher level.
   * TODO: This should be part of larger refactor of the app architecture, how errors are handled.
   */
  private parseAvataxError(err: unknown) {
    const errorDetailSchema = z.object({
      /**
       * In avatax response this field contains specific issue, like invalid postal code.
       * Other fields are too generic - they contain error group and messages which we don't want ot parse
       */
      faultSubCode: z.string(),
    });

    const errorShape = z.object({
      details: z.array(errorDetailSchema),
    });

    const parsedError = errorShape.safeParse(err);

    if (!parsedError.success) {
      Sentry.addBreadcrumb({
        level: "error",
        data: err as Error,
      });
      Sentry.captureException("Avatax returned error with unknown shape");

      return normalizeAvaTaxError(err);
    }

    if (
      parsedError.data.details.some((detail) => {
        /**
         * Check against address errors.
         * TODO: This list will grow, we should have centralized placed for exhaustive checks for every errors.
         *   Current implementation is temporary fix for specific issues we already faced in Sentry
         */
        switch (detail.faultSubCode) {
          case "InvalidZipForStateError":
          case "PostalCodeException": {
            return true;
          }
          default:
            return false;
        }
      })
    ) {
      return InvalidAppAddressError.normalize(err);
    }

    /**
     * Pass through previous, default behavior.
     */
    return normalizeAvaTaxError(err);
  }

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

    this.logger.debug("Calling AvaTax createTransaction with transformed payload...");

    try {
      const response = await this.avataxClient.createTransaction(target);

      this.logger.info("AvaTax createTransaction successfully responded");

      const responseTransformer = new AvataxCalculateTaxesResponseTransformer();
      const transformedResponse = responseTransformer.transform(response);

      this.logger.debug("Transformed AvaTax createTransaction response");

      return transformedResponse;
    } catch (e) {
      const error = this.parseAvataxError(e);

      /**
       * TODO: Refactor errors so we are able to print error only for unhandled cases, otherwise use warnings etc
       */
      this.logger.error("Error calculating taxes", { error });

      throw error;
    }
  }
}
