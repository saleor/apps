import { AuthData } from "@saleor/app-sdk/APL";
import { TaxBaseFragment } from "../../../../generated/graphql";
import { CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxTaxCodeMatchesService } from "../tax-code/avatax-tax-code-matches.service";
import { AvataxCalculateTaxesPayloadTransformer } from "./avatax-calculate-taxes-payload-transformer";
import { CalculateTaxesPayload } from "../../../pages/api/webhooks/checkout-calculate-taxes";

export class AvataxCalculateTaxesPayloadService {
  constructor(private authData: AuthData) {}

  private getMatches() {
    const taxCodeMatchesService = new AvataxTaxCodeMatchesService(this.authData);

    return taxCodeMatchesService.getAll();
  }

  async getPayload(
    payload: CalculateTaxesPayload,
    avataxConfig: AvataxConfig,
  ): Promise<CreateTransactionArgs> {
    const matches = await this.getMatches();
    const payloadTransformer = new AvataxCalculateTaxesPayloadTransformer();

    return payloadTransformer.transform(payload, avataxConfig, matches);
  }
}
