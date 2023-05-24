import { TaxForOrderRes } from "taxjar/dist/types/returnTypes";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";
import { Response } from "./taxjar-calculate-taxes-adapter";
import { TaxJarCalculateTaxesResponseShippingTransformer } from "./taxjar-calculate-taxes-response-shipping-transformer";
import { ExpectedError } from "../../taxes/tax-provider-error";

export class TaxJarCalculateTaxesResponseTransformer {
  private mapLines(res: TaxForOrderRes["tax"]): Response["lines"] {
    const lines = res.breakdown?.line_items ?? [];

    return lines.map((line) => ({
      total_gross_amount: taxProviderUtils.resolveOptionalOrThrow(
        line.taxable_amount + line.tax_collectable,
        new Error("Line taxable amount and tax collectable are required to calculate gross amount")
      ),
      total_net_amount: taxProviderUtils.resolveOptionalOrThrow(
        line.taxable_amount,
        new Error("Line taxable amount is required to calculate net amount")
      ),
      tax_rate: taxProviderUtils.resolveOptionalOrThrow(
        line.combined_tax_rate,
        new Error("Line combined tax rate is required to calculate net amount")
      ),
    }));
  }

  /*
   * TaxJar operates on the idea of sales tax nexus. Nexus is a place where the company has a physical presence.
   * If the company has no nexus in the state where the customer is located, the company is not required to collect sales tax.
   * Therefore, if has_nexus = false, we don't calculate taxes.
   * See: https://www.taxjar.com/sales-tax/nexus
   */
  private resolveResponseNexus(response: TaxForOrderRes) {
    if (!response.tax.has_nexus) {
      throw new ExpectedError(
        "The company has no nexus in the state where the customer is located",
        { cause: "taxjar_no_nexus" }
      );
    }

    return response;
  }

  transform(response: TaxForOrderRes): Response {
    this.resolveResponseNexus(response);
    const shippingTransformer = new TaxJarCalculateTaxesResponseShippingTransformer();
    const shipping = shippingTransformer.transform(response);

    return {
      ...shipping,
      lines: this.mapLines(response.tax),
    };
  }
}
