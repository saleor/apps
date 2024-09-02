// AvaTax API maximum decimal places for tax rate is 6 digits - it is based on their API responses (there is no official documentation about it)
import Decimal from "decimal.js-light";

const MAX_AVATAX_DECIMAL_PLACES = 6;

/**
 * Saleor expects tax rate to be returned in integer value
 * https://docs.saleor.io/docs/3.x/developer/extending/webhooks/synchronous-events/tax#fields-1
 */
export function extractIntegerRateFromTaxDetailsRates(
  rates: Array<number | undefined> | undefined = [],
) {
  return new Decimal(
    rates
      .filter((num) => num !== undefined)
      .reduce((acc, rate) => new Decimal(acc).add(rate), new Decimal(0))
      .times(100)
      .toPrecision(MAX_AVATAX_DECIMAL_PLACES),
  ).toNumber();
}
