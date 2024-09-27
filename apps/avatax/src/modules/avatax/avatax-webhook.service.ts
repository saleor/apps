import { AuthData } from "@saleor/app-sdk/APL";

import { AvataxCalculateTaxesPayloadService } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-payload.service";
import { AvataxCalculateTaxesPayloadTransformer } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-payload-transformer";
import { AvataxTaxCodeMatchesService } from "@/modules/avatax/tax-code/avatax-tax-code-matches.service";

import { DeprecatedOrderConfirmedSubscriptionFragment, SaleorOrderConfirmedEvent } from "../saleor";
import { CancelOrderPayload } from "../taxes/tax-provider-webhook";
import { CalculateTaxesPayload } from "../webhooks/payloads/calculate-taxes-payload";
import { AvataxConfig } from "./avatax-connection-schema";
import { AvataxCalculateTaxesAdapter } from "./calculate-taxes/avatax-calculate-taxes-adapter";
import {
  AutomaticallyDistributedProductLinesDiscountsStrategy,
  PriceReductionDiscountsStrategy,
} from "./discounts";
import { AvataxOrderCancelledAdapter } from "./order-cancelled/avatax-order-cancelled-adapter";
import { AvataxOrderConfirmedAdapter } from "./order-confirmed/avatax-order-confirmed-adapter";

/**
 * @deprecated use services below and delete this abstraction
 */
export class AvataxWebhookService {
  constructor(
    private calculateTaxesAdapter: AvataxCalculateTaxesAdapter,
    private calculateTaxesPayloadTransformer: AvataxCalculateTaxesPayloadTransformer,
    private avaTaxOrderCancelledAdapter: AvataxOrderCancelledAdapter,
    private avataxOrderConfirmedAdapter: AvataxOrderConfirmedAdapter,
  ) {}

  /**
   * @deprecated
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

  async confirmOrder(
    order: DeprecatedOrderConfirmedSubscriptionFragment,
    confirmedOrderEvent: SaleorOrderConfirmedEvent,
    avataxConfig: AvataxConfig,
    authData: AuthData,
    discountStrategy: PriceReductionDiscountsStrategy,
  ) {
    const response = await this.avataxOrderConfirmedAdapter.send(
      { order, confirmedOrderEvent },
      avataxConfig,
      authData,
      discountStrategy,
    );

    return response;
  }

  async cancelOrder(payload: CancelOrderPayload, avataxConfig: AvataxConfig) {
    await this.avaTaxOrderCancelledAdapter.send(payload, avataxConfig);
  }
}
