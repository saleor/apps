import { TaxForOrderRes } from "taxjar/dist/types/returnTypes";
import { numbers } from "../../taxes/numbers";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";
import { Response } from "./taxjar-calculate-taxes-adapter";

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

  private mapShipping(
    res: TaxForOrderRes["tax"]
  ): Pick<
    Response,
    "shipping_price_gross_amount" | "shipping_price_net_amount" | "shipping_tax_rate"
  > {
    const shippingDetails = res.breakdown?.shipping;
    const shippingTaxableAmount = taxProviderUtils.resolveOptionalOrThrow(
      shippingDetails?.taxable_amount,
      new Error("Shipping taxable amount is required to calculate gross amount")
    );

    const shippingPriceGross =
      shippingTaxableAmount +
      taxProviderUtils.resolveOptionalOrThrow(
        shippingDetails?.tax_collectable,
        new Error("Shipping tax collectable is required to calculate gross amount")
      );
    const shippingPriceNet = shippingTaxableAmount;
    const shippingTaxRate = shippingDetails?.combined_tax_rate ?? 0;

    return {
      shipping_price_gross_amount: numbers.roundFloatToTwoDecimals(shippingPriceGross),
      shipping_price_net_amount: numbers.roundFloatToTwoDecimals(shippingPriceNet),
      shipping_tax_rate: shippingTaxRate,
    };
  }

  transform(response: TaxForOrderRes): Response {
    const shipping = this.mapShipping(response.tax);

    return {
      ...shipping,
      lines: this.mapLines(response.tax),
    };
  }
}
