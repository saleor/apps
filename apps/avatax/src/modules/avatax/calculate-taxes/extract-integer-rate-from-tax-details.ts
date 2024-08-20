const MAX_AVATAX_DECIMAL_PLACES = 6;

/**
 * Saleor expects tax rate to be returned in integer value
 * https://docs.saleor.io/docs/3.x/developer/extending/webhooks/synchronous-events/tax#fields-1
 */
export function extractIntegerRateFromTaxDetailsRates(
  rates: Array<number | undefined> | undefined = [],
) {
  const rawSum =
    // @ts-expect-error - update TypeScript to 5.5.4 and remove this line
    rates.filter((num) => num !== undefined).reduce((acc, rate) => acc + rate, 0) * 100;

  return parseFloat(rawSum.toPrecision(MAX_AVATAX_DECIMAL_PLACES));
}
