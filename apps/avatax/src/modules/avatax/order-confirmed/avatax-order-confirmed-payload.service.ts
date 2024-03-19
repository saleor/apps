import { AuthData } from "@saleor/app-sdk/APL";
import { CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxAppOrder, DeprecatedOrderConfirmedSubscriptionFragment } from "../order-parser";
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
    avataxAppOrder: AvataxAppOrder,
    avataxConfig: AvataxConfig,
  ): Promise<CreateTransactionArgs> {
    const matches = await this.getMatches();
    const payloadTransformer = new AvataxOrderConfirmedPayloadTransformer();

    return payloadTransformer.transform(order, avataxAppOrder, avataxConfig, matches);
  }
}
