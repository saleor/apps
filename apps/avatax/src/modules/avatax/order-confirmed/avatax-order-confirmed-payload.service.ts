import { type AuthData } from "@saleor/app-sdk/APL";

import { type SaleorOrderConfirmedEvent } from "../../saleor";
import { type CreateTransactionArgs } from "../avatax-client";
import { type AvataxConfig } from "../avatax-connection-schema";
import { type PriceReductionDiscountsStrategy } from "../discounts";
import { AvataxTaxCodeMatchesService } from "../tax-code/avatax-tax-code-matches.service";
import { type AvataxOrderConfirmedPayloadTransformer } from "./avatax-order-confirmed-payload-transformer";

export class AvataxOrderConfirmedPayloadService {
  constructor(
    private avataxOrderConfirmedPayloadTransformer: AvataxOrderConfirmedPayloadTransformer,
  ) {}

  private getMatches(authData: AuthData) {
    const taxCodeMatchesService = AvataxTaxCodeMatchesService.createFromAuthData(authData);

    return taxCodeMatchesService.getAll();
  }

  async getPayload({
    confirmedOrderEvent,
    avataxConfig,
    authData,
    discountsStrategy,
  }: {
    confirmedOrderEvent: SaleorOrderConfirmedEvent;
    avataxConfig: AvataxConfig;
    authData: AuthData;
    discountsStrategy: PriceReductionDiscountsStrategy;
  }): Promise<CreateTransactionArgs> {
    const matches = await this.getMatches(authData);

    return this.avataxOrderConfirmedPayloadTransformer.transform({
      confirmedOrderEvent,
      avataxConfig,
      matches,
      discountsStrategy,
    });
  }
}
