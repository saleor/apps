import { TaxExternalError } from "../taxes/tax-error";
import { describe, it, expect } from "vitest";
import { AvalaraError } from "avatax/lib/AvaTaxClient";
import { normalizeAvaTaxError } from "./avatax-error-normalizer";

describe("normalizeAvaTaxError", () => {
  it("should return a TaxExternalError with the original error message", () => {
    const errorMessage = "An error occurred";
    const error: unknown = new Error(errorMessage);

    const result = normalizeAvaTaxError(error);

    expect(result).toBeInstanceOf(TaxExternalError);
    expect(result.message).toBe(errorMessage);
  });

  it("should return a TaxExternalError with a custom message if the error is a AvalaraError", () => {
    const error = new AvalaraError("Invalid API key");

    const result = normalizeAvaTaxError(error);

    expect(result).toBeInstanceOf(TaxExternalError);
    expect(result.message).toBe("Invalid API key");
  });
});
