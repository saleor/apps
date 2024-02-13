import { AuthData } from "@saleor/app-sdk/APL";
import { OrderConfirmedSubscriptionFragment } from "../../../../generated/graphql";
import { TaxJarTaxCodeMatchesService } from "../tax-code/taxjar-tax-code-matches.service";
import { TaxJarConfig } from "../taxjar-connection-schema";
import { TaxJarOrderConfirmedPayloadTransformer } from "./taxjar-order-confirmed-payload-transformer";
import { CreateOrderArgs } from "../taxjar-client";

export class TaxJarOrderConfirmedPayloadService {
  constructor(private authData: AuthData) {}

  private getMatches() {
    const taxCodeMatchesService = new TaxJarTaxCodeMatchesService(this.authData);

    return taxCodeMatchesService.getAll();
  }

  async getPayload(
    order: OrderConfirmedSubscriptionFragment,
    taxJarConfig: TaxJarConfig
  ): Promise<CreateOrderArgs> {
    const matches = await this.getMatches();
    const payloadTransformer = new TaxJarOrderConfirmedPayloadTransformer();

    return payloadTransformer.transform(order, taxJarConfig, matches);
  }
}
