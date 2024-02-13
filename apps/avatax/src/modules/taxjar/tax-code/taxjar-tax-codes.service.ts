import { CategoriesRes } from "taxjar/dist/types/returnTypes";
import { TaxJarClient } from "../taxjar-client";
import { TaxJarConfig } from "../taxjar-connection-schema";
import type { TaxCode } from "../../taxes/tax-code";

export class TaxJarTaxCodesService {
  private client: TaxJarClient;

  constructor(config: TaxJarConfig) {
    this.client = new TaxJarClient(config);
  }

  private adapt(response: CategoriesRes): TaxCode[] {
    return response.categories.map((category) => ({
      description: category.name,
      code: category.product_tax_code,
    }));
  }

  async getAll() {
    const response = await this.client.getTaxCodes();

    return this.adapt(response);
  }
}
