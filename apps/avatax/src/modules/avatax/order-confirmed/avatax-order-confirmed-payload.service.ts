import { AuthData } from "@saleor/app-sdk/APL";
import { DeprecatedOrderConfirmedSubscriptionFragment, SaleorOrder } from "../../saleor";
import { CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxTaxCodeMatchesService } from "../tax-code/avatax-tax-code-matches.service";
import { AvataxOrderConfirmedPayloadTransformer } from "./avatax-order-confirmed-payload-transformer";

export class AvataxOrderConfirmedPayloadService {
  constructor(private authData: AuthData) {}

  private getMatches() {
    const taxCodeMatchesService = new AvataxTaxCodeMatchesService(this.authData);

    return taxCodeMatchesService.getAll();
  }

  async getPayload(
    order: DeprecatedOrderConfirmedSubscriptionFragment,
    saleorOrder: SaleorOrder,
    avataxConfig: AvataxConfig,
  ): Promise<CreateTransactionArgs> {
    const matches = await this.getMatches();
    const payloadTransformer = new AvataxOrderConfirmedPayloadTransformer();

    return payloadTransformer.transform(order, saleorOrder, avataxConfig, matches);
  }
}
