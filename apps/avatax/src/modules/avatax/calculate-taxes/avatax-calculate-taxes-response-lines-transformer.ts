import { TransactionModel } from "avatax/lib/models/TransactionModel";
import Decimal from "decimal.js-light";

import { createLogger } from "@/logger";
import { TaxBadPayloadError } from "@/modules/taxes/tax-error";
import { taxProviderUtils } from "@/modules/taxes/tax-provider-utils";
import { CalculateTaxesResponse } from "@/modules/taxes/tax-provider-webhook";

import { SHIPPING_ITEM_CODE } from "./avatax-shipping-line";
import { extractIntegerRateFromTaxDetailsRates } from "./extract-integer-rate-from-tax-details";

export class AvataxCalculateTaxesResponseLinesTransformer {
  private logger = createLogger("AvataxCalculateTaxesResponseLinesTransformer");

  transform(transaction: TransactionModel): CalculateTaxesResponse["lines"] {
    const productLines = transaction.lines?.filter((line) => line.itemCode !== SHIPPING_ITEM_CODE);

    return (
      productLines?.map((line) => {
        if (!line.isItemTaxable) {
          const lineAmount = taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
            line.lineAmount,
            new TaxBadPayloadError("line.lineAmount is undefined"),
          );
          const discountAmount = taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
            line.discountAmount,
            new TaxBadPayloadError("line.discountAmount is undefined"),
          );
          const totalAmount = new Decimal(lineAmount).sub(discountAmount).toNumber();

          this.logger.info(
            "Transforming non-taxable product line from AvaTax to Saleor CalculateTaxesResponse",
            {
              total_gross_amount: totalAmount,
              total_net_amount: totalAmount,
              tax_code: line.taxCode,
              tax_rate: 0,
            },
          );
          return {
            total_gross_amount: totalAmount,
            total_net_amount: totalAmount,
            tax_rate: 0, // as the line is not taxable
          };
        }

        const rate = extractIntegerRateFromTaxDetailsRates(
          line.details?.map((details) => details.rate),
        );

        const lineTaxCalculated = taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
          line.taxCalculated,
          new TaxBadPayloadError("line.taxCalculated is undefined"),
        );
        const lineTotalNetAmount = taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
          line.taxableAmount,
          new TaxBadPayloadError("line.taxableAmount is undefined"),
        );
        const lineTotalGrossAmount = new Decimal(lineTotalNetAmount)
          .add(new Decimal(lineTaxCalculated))
          .toDecimalPlaces(2)
          .toNumber();

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
