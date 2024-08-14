import { AvalaraError } from "avatax/lib/AvaTaxClient";
import { describe, expect, it } from "vitest";

import { AvataxTaxCalculationError } from "../taxes/tax-error";
import { normalizeAvaTaxError } from "./avatax-error-normalizer";

describe("normalizeAvaTaxError", () => {
  it("should return a TaxExternalError with the original error message", () => {
    const errorMessage = "An error occurred";
    const error: unknown = new Error(errorMessage);

    const result = normalizeAvaTaxError(error);

    expect(result).toBeInstanceOf(AvataxTaxCalculationError);
    expect(result.message).toBe(errorMessage);
  });

  it("should return a TaxExternalError with a custom message if the error is a AvalaraError", () => {
    const error = new AvalaraError("Invalid API key");

    const result = normalizeAvaTaxError(error);

    expect(result).toBeInstanceOf(AvataxTaxCalculationError);
    expect(result.message).toBe("Invalid API key");
  });
});
