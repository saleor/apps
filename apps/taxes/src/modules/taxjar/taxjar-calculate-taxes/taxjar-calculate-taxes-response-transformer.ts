import { TaxForOrderRes } from "taxjar/dist/types/returnTypes";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";
import { Response } from "./taxjar-calculate-taxes-adapter";
import { TaxJarCalculateTaxesResponseShippingTransformer } from "./taxjar-calculate-taxes-response-shipping-transformer";

export class TaxJarCalculateTaxesResponseTransformer {
  private mapLines(res: TaxForOrderRes["tax"]): Response["lines"] {
    const lines = res.breakdown?.line_items ?? [];

    return lines.map((line) => ({
      total_gross_amount: taxProviderUtils.resolveOptionalOrThrow(
        line.taxable_amount + line.tax_collectable,
        new Error("Taxable amount and tax collectable are required to calculate gross amount")
      ),
      total_net_amount: taxProviderUtils.resolveOptionalOrThrow(
        line.taxable_amount,
        new Error("Taxable amount is required to calculate net amount")
      ),
      tax_rate: line.combined_tax_rate ?? 0,
    }));
  }

  transform(response: TaxForOrderRes): Response {
    const shippingTransformer = new TaxJarCalculateTaxesResponseShippingTransformer();
    const shipping = shippingTransformer.transform(response.tax);

    return {
      ...shipping,
      lines: this.mapLines(response.tax),
    };
  }
}
