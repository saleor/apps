import { describe, expect, it } from "vitest";

import { AtobaraiSecretSpCode, createAtobaraiSecretSpCode } from "./atobarai-secret-sp-code";

describe("createAtobaraiSecretSpCode", () => {
  it("should create a valid AtobaraiSpCode from a non-empty string", () => {
    const result = createAtobaraiSecretSpCode("SP_CODE");

    expect(result).toBe("SP_CODE");
  });

  it("should throw validation error when input is an empty string", () => {
    expect(() => createAtobaraiSecretSpCode("")).toThrowErrorMatchingInlineSnapshot(
      `
      [AtobaraiSecretSpCodeValidationError: [
        {
          "code": "too_small",
          "minimum": 1,
          "type": "string",
          "inclusive": true,
          "exact": false,
          "message": "String must contain at least 1 character(s)",
          "path": []
        }
      ]
      ZodValidationError: Validation error: String must contain at least 1 character(s)
      Invalid secret SP code: Validation error: String must contain at least 1 character(s)]
    `,
    );
  });

  it("shouldn't be assignable without createAtobaraiSecretSpCode", () => {
    // @ts-expect-error - if this fails - it means the type is not branded
    const testValue: AtobaraiSecretSpCode = "";

    expect(testValue).toBe("");
  });
});
