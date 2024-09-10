import { CalculateTaxesPayload } from "../../webhooks/payloads/calculate-taxes-payload";
import { CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AutomaticallyDistributedProductLinesDiscountsStrategy } from "../discounts";
import { AvataxTaxCodeMatchesService } from "../tax-code/avatax-tax-code-matches.service";
import { AvataxCalculateTaxesPayloadTransformer } from "./avatax-calculate-taxes-payload-transformer";

export class AvataxCalculateTaxesPayloadService {
  constructor(
    private taxCodeMatchesService: AvataxTaxCodeMatchesService,
    private payloadTransformer: AvataxCalculateTaxesPayloadTransformer,
  ) {}

  private getMatches() {
    return this.taxCodeMatchesService.getAll();
  }

  async getPayload(
    payload: CalculateTaxesPayload,
    avataxConfig: AvataxConfig,
    discountsStrategy: AutomaticallyDistributedProductLinesDiscountsStrategy,
  ): Promise<CreateTransactionArgs> {
    const matches = await this.getMatches();

    return this.payloadTransformer.transform(payload, avataxConfig, matches, discountsStrategy);
  }
}
