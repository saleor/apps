import { TransactionModel } from "avatax/lib/models/TransactionModel";

import { createLogger } from "../../../logger";
import { numbers } from "../../taxes/numbers";
import { TaxBadProviderResponseError } from "../../taxes/tax-error";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";
import { CalculateTaxesResponse } from "../../taxes/tax-provider-webhook";
import { avataxShippingLine } from "./avatax-shipping-line";
import { extractIntegerRateFromTaxDetails } from "./extract-integer-rate-from-tax-details";

const logger = createLogger("transformAvataxTransactionModelIntoShipping");

export function transformAvataxTransactionModelIntoShipping(
  transaction: TransactionModel,
): Pick<
  CalculateTaxesResponse,
  "shipping_price_gross_amount" | "shipping_price_net_amount" | "shipping_tax_rate"
> {
  const shippingLine = avataxShippingLine.getFromAvaTaxTransactionModel(transaction);

  if (!shippingLine) {
    logger.info(
      "Shipping line was not found in the response from AvaTax. The app will return 0s for shipping fields.",
    );

    return {
      shipping_price_gross_amount: 0,
      shipping_price_net_amount: 0,
      shipping_tax_rate: 0,
    };
  }

  const rate = extractIntegerRateFromTaxDetails(shippingLine.details ?? []);

  if (!shippingLine.isItemTaxable) {
    logger.info(
      "Transforming non-taxable shipping line from AvaTax to Saleor CalculateTaxesResponse",
      {
        shipping_price_gross_amount: shippingLine.lineAmount,
        shipping_price_net_amount: shippingLine.lineAmount,
        tax_code: shippingLine.taxCode,
        shipping_tax_rate: rate,
      },
    );

    return {
      shipping_price_gross_amount: taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
        shippingLine.lineAmount,
        new TaxBadProviderResponseError("shippingLine.lineAmount is undefined"),
      ),
      shipping_price_net_amount: taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
        shippingLine.lineAmount,
        new TaxBadProviderResponseError("shippingLine.lineAmount is undefined"),
      ),

      shipping_tax_rate: rate,
    };
  }

  const shippingTaxCalculated = taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
    shippingLine.taxCalculated,
    new TaxBadProviderResponseError("shippingLine.taxCalculated is undefined"),
  );
  const shippingTaxableAmount = taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
    shippingLine.taxableAmount,
    new TaxBadProviderResponseError("shippingLine.taxableAmount is undefined"),
  );
  const shippingGrossAmount = numbers.roundFloatToTwoDecimals(
    shippingTaxableAmount + shippingTaxCalculated,
  );

  logger.info("Transforming taxable shipping line from AvaTax to Saleor CalculateTaxesResponse", {
    shipping_price_gross_amount: shippingGrossAmount,
    shipping_price_net_amount: shippingTaxableAmount,
    tax_code: shippingLine.taxCode,
    shipping_tax_rate: rate,
  });

  return {
    shipping_price_gross_amount: shippingGrossAmount,
    shipping_price_net_amount: shippingTaxableAmount,
    shipping_tax_rate: rate,
  };
}
