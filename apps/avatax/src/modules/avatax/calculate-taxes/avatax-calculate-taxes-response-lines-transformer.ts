import { TransactionModel } from "avatax/lib/models/TransactionModel";

import { createLogger } from "@/logger";

import { numbers } from "../../taxes/numbers";
import { TaxBadPayloadError } from "../../taxes/tax-error";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";
import { CalculateTaxesResponse } from "../../taxes/tax-provider-webhook";
import { SHIPPING_ITEM_CODE } from "./avatax-shipping-line";
import { extractIntegerRateFromTaxDetails } from "./extract-integer-rate-from-tax-details";

export class AvataxCalculateTaxesResponseLinesTransformer {
  private logger = createLogger("AvataxCalculateTaxesResponseLinesTransformer");

  transform(transaction: TransactionModel): CalculateTaxesResponse["lines"] {
    const productLines = transaction.lines?.filter((line) => line.itemCode !== SHIPPING_ITEM_CODE);

    return (
      productLines?.map((line) => {
        const rate = extractIntegerRateFromTaxDetails(line.details ?? []);

        if (!line.isItemTaxable) {
          this.logger.info(
            "Transforming non-taxable product line from AvaTax to Saleor CalculateTaxesResponse",
            {
              total_gross_amount: line.lineAmount,
              total_net_amount: line.lineAmount,
              tax_code: line.taxCode,
              tax_rate: rate,
            },
          );
          return {
            total_gross_amount: taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
              line.lineAmount,
              new TaxBadPayloadError("line.lineAmount is undefined"),
            ),
            total_net_amount: taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
              line.lineAmount,
              new TaxBadPayloadError("line.lineAmount is undefined"),
            ),
            tax_rate: rate,
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

        this.logger.info(
          "Transforming taxable product line from AvaTax to Saleor CalculateTaxesResponse",
          {
            total_gross_amount: lineTotalGrossAmount,
            total_net_amount: lineTotalNetAmount,
            tax_code: line.taxCode,
            tax_rate: rate,
          },
        );

        return {
          total_gross_amount: lineTotalGrossAmount,
          total_net_amount: lineTotalNetAmount,
          tax_rate: rate,
        };
      }) ?? []
    );
  }
}
