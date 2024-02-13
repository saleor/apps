import { AuthData } from "@saleor/app-sdk/APL";
import { TaxJarTaxCodeMatchesService } from "../tax-code/taxjar-tax-code-matches.service";
import { TaxJarConfig } from "../taxjar-connection-schema";
import {
  TaxJarCalculateTaxesPayload,
  TaxJarCalculateTaxesTarget,
} from "./taxjar-calculate-taxes-adapter";
import { TaxJarCalculateTaxesPayloadTransformer } from "./taxjar-calculate-taxes-payload-transformer";

export class TaxJarCalculateTaxesPayloadService {
  constructor(
    private readonly config: TaxJarConfig,
    private authData: AuthData,
  ) {}

  private getMatches() {
    const taxCodeMatchesService = new TaxJarTaxCodeMatchesService(this.authData);

    return taxCodeMatchesService.getAll();
  }

  async getPayload(payload: TaxJarCalculateTaxesPayload): Promise<TaxJarCalculateTaxesTarget> {
    const payloadTransformer = new TaxJarCalculateTaxesPayloadTransformer(this.config);

    const matches = await this.getMatches();

    return payloadTransformer.transform(payload.taxBase, matches);
  }
}
