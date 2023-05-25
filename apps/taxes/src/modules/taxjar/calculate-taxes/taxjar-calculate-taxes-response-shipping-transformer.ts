import { TaxForOrderRes } from "taxjar/dist/types/returnTypes";
import { numbers } from "../../taxes/numbers";
import { Response } from "./taxjar-calculate-taxes-adapter";

export class TaxJarCalculateTaxesResponseShippingTransformer {
  transform(
    res: TaxForOrderRes
  ): Pick<
    Response,
    "shipping_price_gross_amount" | "shipping_price_net_amount" | "shipping_tax_rate"
  > {
    const { tax } = res;

    /*
     * If the shipping is not taxable, we return the same values as in the payload.
     * If freight_taxable = true, tax.breakdown.shipping exists
     */
    if (!tax.freight_taxable) {
      return {
        shipping_price_gross_amount: tax.shipping,
        shipping_price_net_amount: tax.shipping,
        shipping_tax_rate: 0,
      };
    }

    const shippingDetails = tax.breakdown!.shipping!;
    const shippingTaxableAmount = shippingDetails.taxable_amount;
    const shippingPriceGross = shippingTaxableAmount + shippingDetails.tax_collectable;
    const shippingPriceNet = shippingTaxableAmount;
    const shippingTaxRate = shippingDetails.combined_tax_rate;

    return {
      shipping_price_gross_amount: numbers.roundFloatToTwoDecimals(shippingPriceGross),
      shipping_price_net_amount: numbers.roundFloatToTwoDecimals(shippingPriceNet),
      shipping_tax_rate: shippingTaxRate,
    };
  }
}
