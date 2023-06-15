import { CategoriesRes } from "taxjar/dist/types/returnTypes";
import { TaxJarClient } from "../taxjar-client";
import { TaxJarConfig } from "../taxjar-connection-schema";
import { TaxCode } from "../../tax-codes/tax-code-match-schema";

export class TaxJarTaxCodeAdapter {
  private taxJarClient: TaxJarClient;
  constructor(config: TaxJarConfig) {
    this.taxJarClient = new TaxJarClient(config);
  }

  private adapt(response: CategoriesRes): TaxCode[] {
    return response.categories.map((category) => ({
      code: category.product_tax_code,
      name: category.name,
    }));
  }

  async getAll(): Promise<TaxCode[]> {
    const taxCodes = await this.taxJarClient.getTaxCodes();

    return this.adapt(taxCodes);
  }
}
