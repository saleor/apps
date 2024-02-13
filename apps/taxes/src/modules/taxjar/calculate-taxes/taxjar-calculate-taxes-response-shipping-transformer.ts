import { TaxForOrderRes } from "taxjar/dist/types/returnTypes";
import { numbers } from "../../taxes/numbers";
import {
  TaxJarCalculateTaxesResponse,
  TaxJarCalculateTaxesPayload,
} from "./taxjar-calculate-taxes-adapter";

export class TaxJarCalculateTaxesResponseShippingTransformer {
  transform(
    taxBase: TaxJarCalculateTaxesPayload["taxBase"],
    res: TaxForOrderRes,
  ): Pick<
    TaxJarCalculateTaxesResponse,
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

    const isTaxIncluded = taxBase.pricesEnteredWithTax;

    const shippingDetails = tax.breakdown!.shipping!;
    const shippingTaxableAmount = shippingDetails.taxable_amount;
    const shippingTaxCollectable = shippingDetails.tax_collectable;

    const shippingPriceGross = isTaxIncluded
      ? shippingTaxableAmount
      : shippingTaxableAmount + shippingTaxCollectable;
    const shippingPriceNet = isTaxIncluded
      ? shippingTaxableAmount - shippingTaxCollectable
      : shippingTaxableAmount;
    const shippingTaxRate = shippingDetails.combined_tax_rate;

    return {
      shipping_price_gross_amount: numbers.roundFloatToTwoDecimals(shippingPriceGross),
      shipping_price_net_amount: numbers.roundFloatToTwoDecimals(shippingPriceNet),
      shipping_tax_rate: shippingTaxRate,
    };
  }
}
