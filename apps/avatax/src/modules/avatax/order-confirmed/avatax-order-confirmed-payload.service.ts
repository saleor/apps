import { AuthData } from "@saleor/app-sdk/APL";

import { SaleorOrderConfirmedEvent } from "../../saleor";
import { CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { PriceReductionDiscountsStrategy } from "../discounts";
import { AvataxTaxCodeMatchesService } from "../tax-code/avatax-tax-code-matches.service";
import { AvataxOrderConfirmedPayloadTransformer } from "./avatax-order-confirmed-payload-transformer";

export class AvataxOrderConfirmedPayloadService {
  constructor(
    private avataxOrderConfirmedPayloadTransformer: AvataxOrderConfirmedPayloadTransformer,
  ) {}

  private getMatches(authData: AuthData) {
    const taxCodeMatchesService = AvataxTaxCodeMatchesService.createFromAuthData(authData);

    return taxCodeMatchesService.getAll();
  }

  async getPayload(
    confirmedOrderEvent: SaleorOrderConfirmedEvent,
    avataxConfig: AvataxConfig,
    authData: AuthData,
    discountsStrategy: PriceReductionDiscountsStrategy,
  ): Promise<CreateTransactionArgs> {
    const matches = await this.getMatches(authData);

    return this.avataxOrderConfirmedPayloadTransformer.transform({
      confirmedOrderEvent,
      avataxConfig,
      matches,
      discountsStrategy,
    });
  }
}
