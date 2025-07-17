import { describe, expect, it } from "vitest";

import { AtobaraiSecretSpCode, createAtobaraiSecretSpCode } from "./atobarai-secret-sp-code";

describe("createAtobaraiSecretSpCode", () => {
  it("should create a valid AtobaraiSpCode from a non-empty string", () => {
    const result = createAtobaraiSecretSpCode("SP_CODE");

    expect(result).toBe("SP_CODE");
  });

  it("should throw ZodError when input is an empty string", () => {
    expect(() => createAtobaraiSecretSpCode("")).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "code": "too_small",
          "minimum": 1,
          "type": "string",
          "inclusive": true,
          "exact": false,
          "message": "String must contain at least 1 character(s)",
          "path": []
        }
      ]]
    `);
  });

  it("shouldn't be assignable without createAtobaraiSecretSpCode", () => {
    // @ts-expect-error - if this fails - it means the type is not branded
    const testValue: AtobaraiSecretSpCode = "";

    expect(testValue).toBe("");
  });
});
