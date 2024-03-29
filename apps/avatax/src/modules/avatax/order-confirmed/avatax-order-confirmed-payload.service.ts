import { AuthData } from "@saleor/app-sdk/APL";
import { DeprecatedOrderConfirmedSubscriptionFragment, SaleorOrder } from "../../saleor";
import { AvataxClient, CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxTaxCodeMatchesService } from "../tax-code/avatax-tax-code-matches.service";
import { AvataxOrderConfirmedPayloadTransformer } from "./avatax-order-confirmed-payload-transformer";
import { AvataxTaxCodeMatchRepository } from "../tax-code/avatax-tax-code-match-repository";
import { createSettingsManager } from "../../app/metadata-manager";
import { metadataCache } from "../../../lib/app-metadata-cache";
import { AvataxCalculateTaxesPayloadService } from "../calculate-taxes/avatax-calculate-taxes-payload.service";
import { AvataxCalculateTaxesPayloadTransformer } from "../calculate-taxes/avatax-calculate-taxes-payload-transformer";
import { createInstrumentedGraphqlClient } from "../../../lib/create-instrumented-graphql-client";

export class AvataxOrderConfirmedPayloadService {
  constructor(private avataxClient: AvataxClient) {}

  private getMatches(authData: AuthData) {
    const client = createInstrumentedGraphqlClient({
      saleorApiUrl: authData.saleorApiUrl,
      token: authData.token,
    });
    const { appId, saleorApiUrl } = authData;

    const settingsManager = createSettingsManager(client, appId, metadataCache);

    const taxCodeMatchRepository = new AvataxTaxCodeMatchRepository(settingsManager, saleorApiUrl);

    const taxCodeMatchesService = new AvataxTaxCodeMatchesService(taxCodeMatchRepository);

    return taxCodeMatchesService.getAll();
  }

  async getPayload(
    order: DeprecatedOrderConfirmedSubscriptionFragment,
    saleorOrder: SaleorOrder,
    avataxConfig: AvataxConfig,
    authData: AuthData,
  ): Promise<CreateTransactionArgs> {
    const matches = await this.getMatches(authData);
    const payloadTransformer = new AvataxOrderConfirmedPayloadTransformer(this.avataxClient);

    return payloadTransformer.transform(order, saleorOrder, avataxConfig, matches);
  }
}
