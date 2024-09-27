import { AuthData } from "@saleor/app-sdk/APL";

import { AvataxCalculateTaxesPayloadService } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-payload.service";
import { AvataxCalculateTaxesPayloadTransformer } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-payload-transformer";
import { AvataxTaxCodeMatchesService } from "@/modules/avatax/tax-code/avatax-tax-code-matches.service";

import { CalculateTaxesPayload } from "../webhooks/payloads/calculate-taxes-payload";
import { AvataxConfig } from "./avatax-connection-schema";
import { AvataxCalculateTaxesAdapter } from "./calculate-taxes/avatax-calculate-taxes-adapter";
import { AutomaticallyDistributedProductLinesDiscountsStrategy } from "./discounts";

/**
 * @deprecated use services below and delete this abstraction
 */
export class AvataxWebhookService {
  constructor(
    private calculateTaxesAdapter: AvataxCalculateTaxesAdapter,
    private calculateTaxesPayloadTransformer: AvataxCalculateTaxesPayloadTransformer,
  ) {}

  /**
   * @deprecated - use dependencies and call them directly
   */
  async calculateTaxes(
    payload: CalculateTaxesPayload,
    avataxConfig: AvataxConfig,
    authData: AuthData,
    discountStrategy: AutomaticallyDistributedProductLinesDiscountsStrategy,
  ) {
    const payloadService = new AvataxCalculateTaxesPayloadService(
      AvataxTaxCodeMatchesService.createFromAuthData(authData),
      this.calculateTaxesPayloadTransformer,
    );

    const avataxModel = await payloadService.getPayload(payload, avataxConfig, discountStrategy);

    const response = await this.calculateTaxesAdapter.send(avataxModel);

    return response;
  }
}
