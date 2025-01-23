import { describe, expect, it } from "vitest";

import { suspiciousLineCalculationCheck } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-adapter";

describe("suspiciousLineCalculationCheck", () => {
  it("Returns false if line is zero", () => {
    expect(
      suspiciousLineCalculationCheck({
        total_gross_amount: 0,
        total_net_amount: 0,
        tax_rate: 0.2, // If its zero-line, it doesn matter
      }),
    ).toBe(false);
  });

  it("Returns true if net & gross is the same, but rate is not: 1.00 + 1.00 + rate 0.08", () => {
    expect(
      suspiciousLineCalculationCheck({
        total_gross_amount: 1,
        total_net_amount: 1,
        tax_rate: 0.08, // If its zero-line, it doesn matter
      }),
    ).toBe(true);
  });

  it("Returns true for small numbers: 0.06 + 0.06 + rate 0.07", () => {
    expect(
      suspiciousLineCalculationCheck({
        total_gross_amount: 0.06,
        total_net_amount: 0.06,
        tax_rate: 0.07, // If its zero-line, it doesn matter
      }),
    ).toBe(true);
  });
});
