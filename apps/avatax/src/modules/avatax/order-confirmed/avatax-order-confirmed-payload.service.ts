import { AuthData } from "@saleor/app-sdk/APL";
import { DeprecatedOrderConfirmedSubscriptionFragment, SaleorOrder } from "../../saleor";
import { AvataxClient, CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxTaxCodeMatchesService } from "../tax-code/avatax-tax-code-matches.service";
import { AvataxOrderConfirmedPayloadTransformer } from "./avatax-order-confirmed-payload-transformer";

export class AvataxOrderConfirmedPayloadService {
  constructor(private client: AvataxClient) {}

  private getMatches(authData: AuthData) {
    const taxCodeMatchesService = new AvataxTaxCodeMatchesService(authData);

    return taxCodeMatchesService.getAll();
  }

  async getPayload(
    order: DeprecatedOrderConfirmedSubscriptionFragment,
    saleorOrder: SaleorOrder,
    avataxConfig: AvataxConfig,
    authData: AuthData,
  ): Promise<CreateTransactionArgs> {
    const matches = await this.getMatches(authData);
    const payloadTransformer = new AvataxOrderConfirmedPayloadTransformer(this.client);

    return payloadTransformer.transform(order, saleorOrder, avataxConfig, matches);
  }
}
