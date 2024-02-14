import { TransactionModel } from "avatax/lib/models/TransactionModel";
import { numbers } from "../../taxes/numbers";
import { TaxBadPayloadError } from "../../taxes/tax-error";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";
import { CalculateTaxesResponse } from "../../taxes/tax-provider-webhook";
import { SHIPPING_ITEM_CODE } from "./avatax-calculate-taxes-adapter";

export class AvataxCalculateTaxesResponseLinesTransformer {
  transform(transaction: TransactionModel): CalculateTaxesResponse["lines"] {
    const productLines = transaction.lines?.filter((line) => line.itemCode !== SHIPPING_ITEM_CODE);

    return (
      productLines?.map((line) => {
        if (!line.isItemTaxable) {
          return {
            total_gross_amount: taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
              line.lineAmount,
              new TaxBadPayloadError("line.lineAmount is undefined"),
            ),
            total_net_amount: taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
              line.lineAmount,
              new TaxBadPayloadError("line.lineAmount is undefined"),
            ),
            tax_rate: 0,
          };
        }

        const lineTaxCalculated = taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
          line.taxCalculated,
          new TaxBadPayloadError("line.taxCalculated is undefined"),
        );
        const lineTotalNetAmount = taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
          line.taxableAmount,
          new TaxBadPayloadError("line.taxableAmount is undefined"),
        );
        const lineTotalGrossAmount = numbers.roundFloatToTwoDecimals(
          lineTotalNetAmount + lineTaxCalculated,
        );

        return {
          total_gross_amount: lineTotalGrossAmount,
          total_net_amount: lineTotalNetAmount,
          /*
           * avatax doesn't return combined tax rate
           * // todo: calculate percentage tax rate
           */ tax_rate: 0,
        };
      }) ?? []
    );
  }
}
