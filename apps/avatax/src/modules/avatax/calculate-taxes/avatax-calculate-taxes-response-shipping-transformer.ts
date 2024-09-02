import { TransactionModel } from "avatax/lib/models/TransactionModel";
import Decimal from "decimal.js-light";

import { createLogger } from "../../../logger";
import { TaxBadProviderResponseError } from "../../taxes/tax-error";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";
import { CalculateTaxesResponse } from "../../taxes/tax-provider-webhook";
import { avataxShippingLine } from "./avatax-shipping-line";
import { extractIntegerRateFromTaxDetailsRates } from "./extract-integer-rate-from-tax-details";

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

  if (!shippingLine.isItemTaxable) {
    const lineAmount = taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
      shippingLine.lineAmount,
      new TaxBadProviderResponseError("shippingLine.lineAmount is undefined"),
    );
    const discountAmount = taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
      shippingLine.discountAmount,
      new TaxBadProviderResponseError("shippingLine.discountAmount is undefined"),
    );
    const totalAmount = new Decimal(lineAmount).sub(new Decimal(discountAmount)).toNumber();

    logger.info(
      "Transforming non-taxable shipping line from AvaTax to Saleor CalculateTaxesResponse",
      {
        shipping_price_gross_amount: totalAmount,
        shipping_price_net_amount: totalAmount,
        tax_code: shippingLine.taxCode,
        shipping_tax_rate: 0,
      },
    );

    return {
      shipping_price_gross_amount: totalAmount,
      shipping_price_net_amount: totalAmount,
      shipping_tax_rate: 0, // as the line is not taxable
    };
  }

  const rate = extractIntegerRateFromTaxDetailsRates(
    shippingLine.details?.map((details) => details.rate),
  );

  const shippingTaxCalculated = taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
    shippingLine.taxCalculated,
    new TaxBadProviderResponseError("shippingLine.taxCalculated is undefined"),
  );
  const shippingTaxableAmount = taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
    shippingLine.taxableAmount,
    new TaxBadProviderResponseError("shippingLine.taxableAmount is undefined"),
  );
  const shippingGrossAmount = new Decimal(shippingTaxableAmount)
    .add(new Decimal(shippingTaxCalculated))
    .toDecimalPlaces(2)
    .toNumber();

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
