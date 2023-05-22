import { TaxForOrderRes } from "taxjar/dist/types/returnTypes";
import { Response } from "./taxjar-calculate-taxes-adapter";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";
import { numbers } from "../../taxes/numbers";

export class TaxJarCalculateTaxesResponseShippingTransformer {
  transform(
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
}
