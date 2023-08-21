import { describe, expect, it } from "vitest";

import { AvataxValidationErrorResolver } from "./avatax-validation-error-resolver";

describe("AvataxValidationErrorResolver", () => {
  const errorResolver = new AvataxValidationErrorResolver();

  it("when AuthenticationException error, should return error with specific message", () => {
    const result = errorResolver.resolve({
      code: "AuthenticationException",
      details: [
        {
          message: "message 1",
          description: "description 1",
          helpLink: "helpLink 1",
          code: "code 1",
          faultCode: "faultCode 1",
        },
        {
          message: "message 2",
          description: "description 2",
          helpLink: "helpLink 2",
          code: "code 2",
          faultCode: "faultCode 2",
        },
      ],
    });

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("Invalid AvaTax credentials.");
  });
  it("when other AvaTax error, should return error with first message", () => {
    const result = errorResolver.resolve({
      code: "error",
      details: [
        {
          message: "message 1",
          description: "description 1",
          helpLink: "helpLink 1",
          code: "code 1",
          faultCode: "faultCode 1",
        },
        {
          message: "message 2",
          description: "description 2",
          helpLink: "helpLink 2",
          code: "code 2",
          faultCode: "faultCode 2",
        },
      ],
    });

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("message 1");
  });
  it("when unknown error, should return error with generic message", () => {
    const result = errorResolver.resolve("error");

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("Unknown error while validating AvaTax configuration.");
  });
});
