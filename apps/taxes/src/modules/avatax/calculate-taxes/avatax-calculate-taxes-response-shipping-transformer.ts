import { TransactionModel } from "avatax/lib/models/TransactionModel";
import { numbers } from "../../taxes/numbers";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";
import { CalculateTaxesResponse } from "../../taxes/tax-provider-webhook";
import { SHIPPING_ITEM_CODE } from "./avatax-calculate-taxes-adapter";
import { TaxIncompleteResponseError } from "../../taxes/tax-error";

export class AvataxCalculateTaxesResponseShippingTransformer {
  transform(
    transaction: TransactionModel,
  ): Pick<
    CalculateTaxesResponse,
    "shipping_price_gross_amount" | "shipping_price_net_amount" | "shipping_tax_rate"
  > {
    const shippingLine = transaction.lines?.find((line) => line.itemCode === SHIPPING_ITEM_CODE);

    if (!shippingLine) {
      return {
        shipping_price_gross_amount: 0,
        shipping_price_net_amount: 0,
        shipping_tax_rate: 0,
      };
    }

    if (!shippingLine.isItemTaxable) {
      return {
        shipping_price_gross_amount: taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
          shippingLine.lineAmount,
          new TaxIncompleteResponseError("shippingLine.lineAmount is undefined"),
        ),
        shipping_price_net_amount: taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
          shippingLine.lineAmount,
          new TaxIncompleteResponseError("shippingLine.lineAmount is undefined"),
        ),
        /*
         * avatax doesn't return combined tax rate
         * // todo: calculate percentage tax rate
         */
        shipping_tax_rate: 0,
      };
    }

    const shippingTaxCalculated = taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
      shippingLine.taxCalculated,
      new TaxIncompleteResponseError("shippingLine.taxCalculated is undefined"),
    );
    const shippingTaxableAmount = taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
      shippingLine.taxableAmount,
      new TaxIncompleteResponseError("shippingLine.taxableAmount is undefined"),
    );
    const shippingGrossAmount = numbers.roundFloatToTwoDecimals(
      shippingTaxableAmount + shippingTaxCalculated,
    );

    return {
      shipping_price_gross_amount: shippingGrossAmount,
      shipping_price_net_amount: shippingTaxableAmount,
      shipping_tax_rate: 0,
    };
  }
}
