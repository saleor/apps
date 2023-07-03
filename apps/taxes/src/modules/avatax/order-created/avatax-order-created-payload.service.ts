import { AuthData } from "@saleor/app-sdk/APL";
import { OrderCreatedSubscriptionFragment } from "../../../../generated/graphql";
import { CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxTaxCodeMatchesService } from "../tax-code/avatax-tax-code-matches.service";
import { AvataxOrderCreatedPayloadTransformer } from "./avatax-order-created-payload-transformer";

export class AvataxOrderCreatedPayloadService {
  constructor(private authData: AuthData) {}

  private getMatches() {
    const taxCodeMatchesService = new AvataxTaxCodeMatchesService(this.authData);

    return taxCodeMatchesService.getAll();
  }

  async getPayload(
    order: OrderCreatedSubscriptionFragment,
    avataxConfig: AvataxConfig
  ): Promise<CreateTransactionArgs> {
    const matches = await this.getMatches();
    const payloadTransformer = new AvataxOrderCreatedPayloadTransformer();

    return payloadTransformer.transform(order, avataxConfig, matches);
  }
}
