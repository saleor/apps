import { AvataxClient } from "../avatax-client";
import { TaxCode } from "../../tax-codes/tax-code-match-schema";
import { TaxCodeModel } from "avatax/lib/models/TaxCodeModel";
import { FetchResult } from "avatax/lib/utils/fetch_result";
import { AvataxConfig } from "../avatax-connection-schema";

export class AvataxTaxCodeAdapter {
  private avataxClient: AvataxClient;
  constructor(config: AvataxConfig) {
    this.avataxClient = new AvataxClient(config);
  }

  private adapt(response: FetchResult<TaxCodeModel>): TaxCode[] {
    return response.value.map((taxCode) => ({
      code: taxCode.taxCode,
      name: String(taxCode.id!),
    }));
  }

  async getAll(): Promise<TaxCode[]> {
    const taxCodes = await this.avataxClient.getTaxCodes();

    return this.adapt(taxCodes);
  }
}
