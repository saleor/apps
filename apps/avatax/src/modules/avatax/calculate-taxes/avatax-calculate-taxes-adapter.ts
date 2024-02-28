import { AuthData } from "@saleor/app-sdk/APL";
import { ClientLogger } from "../../logs/client-logger";
import { CalculateTaxesResponse } from "../../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { AvataxClient, CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { normalizeAvaTaxError } from "../avatax-error-normalizer";
import { AvataxCalculateTaxesPayloadService } from "./avatax-calculate-taxes-payload.service";
import { AvataxCalculateTaxesResponseTransformer } from "./avatax-calculate-taxes-response-transformer";
import { createLogger } from "../../../logger";
import { CalculateTaxesPayload } from "../../webhooks/calculate-taxes-payload";

export type AvataxCalculateTaxesTarget = CreateTransactionArgs;
export type AvataxCalculateTaxesResponse = CalculateTaxesResponse;

export class AvataxCalculateTaxesAdapter
  implements WebhookAdapter<CalculateTaxesPayload, AvataxCalculateTaxesResponse>
{
  private logger = createLogger("AvataxCalculateTaxesAdapter");
  private readonly clientLogger: ClientLogger;

  constructor({ clientLogger }: { clientLogger: ClientLogger }) {
    this.clientLogger = clientLogger;
  }

  async send({
    payload,
    config,
    authData,
  }: {
    payload: CalculateTaxesPayload;
    config: AvataxConfig;
    authData: AuthData;
  }): Promise<AvataxCalculateTaxesResponse> {
    this.logger.debug("Transforming the Saleor payload for calculating taxes with AvaTax...");
    const payloadService = new AvataxCalculateTaxesPayloadService(authData);
    const target = await payloadService.getPayload(payload, config);

    this.logger.debug("Calling AvaTax createTransaction with transformed payload...");

    const client = new AvataxClient(config);

    try {
      const response = await client.createTransaction(target);

      this.logger.debug("AvaTax createTransaction successfully responded");

      const responseTransformer = new AvataxCalculateTaxesResponseTransformer();
      const transformedResponse = responseTransformer.transform(response);

      this.logger.debug("Transformed AvaTax createTransaction response");

      return transformedResponse;
    } catch (e) {
      const error = normalizeAvaTaxError(e);

      this.clientLogger.push({
        event: "[CalculateTaxes] createTransaction",
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
