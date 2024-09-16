import { beforeEach, describe, expect, it, vi } from "vitest";

import { AvataxInvalidAddressError, AvataxTaxCalculationError } from "../taxes/tax-error";
import { AvataxErrorsParser } from "./avatax-errors-parser";

describe("AvataxErrorsParser", () => {
  const mockErrorCapture = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should parse know error", () => {
    const parser = new AvataxErrorsParser();
    const error = {
      code: "InvalidAddress",
      details: [
        {
          description: "The address is invalid.",
          helpLink: "https://developer.avalara.com/avatax/errors/InvalidAddress",
          message: "The address is invalid.",
        },
      ],
    };

    const result = parser.parse(error, mockErrorCapture);

    expect(result).toBeInstanceOf(AvataxInvalidAddressError);
    expect(mockErrorCapture).not.toHaveBeenCalled();
  });

  it("should normalize unknown error and capture it into error tracking", () => {
    const parser = new AvataxErrorsParser();
    const error = {
      code: "UnknownError",
      details: [],
    };

    const result = parser.parse(error, mockErrorCapture);

    expect(result).toBeInstanceOf(AvataxTaxCalculationError);
    expect(mockErrorCapture).toHaveBeenCalledWith(
      expect.any(AvataxErrorsParser.UnhandledErrorShapeError),
    );
  });
});
