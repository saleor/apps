import { AuthData } from "@saleor/app-sdk/APL";
import { OrderCreatedSubscriptionFragment } from "../../../../generated/graphql";
import { TaxJarTaxCodeMatchesService } from "../tax-code/taxjar-tax-code-matches.service";
import { TaxJarConfig } from "../taxjar-connection-schema";
import { TaxJarOrderCreatedPayloadTransformer } from "./taxjar-order-created-payload-transformer";
import { CreateOrderArgs } from "../taxjar-client";

export class TaxJarOrderCreatedPayloadService {
  constructor(private authData: AuthData) {}

  private getMatches() {
    const taxCodeMatchesService = new TaxJarTaxCodeMatchesService(this.authData);

    return taxCodeMatchesService.getAll();
  }

  async getPayload(
    order: OrderCreatedSubscriptionFragment,
    taxJarConfig: TaxJarConfig
  ): Promise<CreateOrderArgs> {
    const matches = await this.getMatches();
    const payloadTransformer = new TaxJarOrderCreatedPayloadTransformer();

    return payloadTransformer.transform(order, taxJarConfig, matches);
  }
}
