import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  AvataxGetTaxSystemError,
  AvataxGetTaxWrongUserInputError,
  AvataxInvalidAddressError,
  AvataxTaxCalculationError,
} from "../taxes/tax-error";
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

  it("should parse unknown street GetTaxError as user input error", () => {
    const parser = new AvataxErrorsParser();
    const error = {
      code: "GetTaxError",
      details: [
        {
          faultCode: "Client",
          faultSubCode: "AddressUnknownStreetError",
          description: "An exact street name match could not be found",
          message: "An exact street name match could not be found",
        },
      ],
    };

    const result = parser.parse(error, mockErrorCapture);

    expect(result).toBeInstanceOf(AvataxGetTaxWrongUserInputError);
    expect(mockErrorCapture).not.toHaveBeenCalled();
  });

  it("should parse GetTaxError with unknown fault sub code as system error and capture it into error tracking", () => {
    const parser = new AvataxErrorsParser();
    const error = {
      code: "GetTaxError",
      details: [
        {
          faultCode: "Client",
          faultSubCode: "SomeNewAvataxError",
          description: "Something new happened",
          message: "Something new happened",
        },
      ],
    };

    const result = parser.parse(error, mockErrorCapture);

    expect(result).toBeInstanceOf(AvataxGetTaxSystemError);
    expect(result).toHaveProperty("faultSubCode", "SomeNewAvataxError");
    expect(mockErrorCapture.mock.calls[0][0]).toBeInstanceOf(
      AvataxErrorsParser.UnknownFaultSubCodeError,
    );
  });

  it("should normalize unknown error and capture it into error tracking", () => {
    const parser = new AvataxErrorsParser();
    const error = {
      code: "UnknownError",
      details: [],
    };

    const result = parser.parse(error, mockErrorCapture);

    expect(result).toBeInstanceOf(AvataxTaxCalculationError);

    expect(mockErrorCapture.mock.calls[0][0]).toMatchInlineSnapshot(`
      [UnhandledErrorShapeError: {"code":"UnknownError","details":[]}
      AvaTax returned error with unknown shape]
    `);
  });
});
