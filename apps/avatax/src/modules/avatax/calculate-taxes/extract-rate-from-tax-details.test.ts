import { describe, expect, it } from "vitest";

import { extractIntegerRateFromTaxDetailsRates } from "./extract-integer-rate-from-tax-details";

describe("extractIntegerRateFromTaxDetailsRates", () => {
  it.each([
    { rates: [], expected: 0 },
    {
      // prettier-ignore
      rates: [0.047500, 0.020000],
      expected: 6.75,
    },
    {
      // prettier-ignore
      rates: [0.047532, 0.021234, 0.012512],
      expected: 8.1278,
    },
    {
      rates: [0.047532, undefined, 0.012512],
      expected: 6.0044,
    },
    {
      rates: [undefined, undefined],
      expected: 0,
    },
    {
      rates: undefined,
      expected: 0,
    },
    {
      rates: [0.1, 0.2],
      expected: 30,
    },
  ])(`Extracts array of tax rates: $rates into $expected`, ({ rates, expected }) => {
    expect(extractIntegerRateFromTaxDetailsRates(rates)).toEqual(expected);
  });
});
