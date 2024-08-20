// AvaTax API maximum decimal places for tax rate is 6 digits - it is based on their API responses (there is no official documentation about it)
const MAX_AVATAX_DECIMAL_PLACES = 6;

/**
 * Saleor expects tax rate to be returned in integer value
 * https://docs.saleor.io/docs/3.x/developer/extending/webhooks/synchronous-events/tax#fields-1
 */
export function extractIntegerRateFromTaxDetailsRates(
  rates: Array<number | undefined> | undefined = [],
) {
  const rawSum =
    rates.filter((num) => num !== undefined).reduce((acc, rate) => acc + rate, 0) * 100;

  return parseFloat(rawSum.toPrecision(MAX_AVATAX_DECIMAL_PLACES));
}
