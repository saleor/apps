import { describe, expect, it } from "vitest";

import { AtobaraiMerchantCode, createAtobaraiMerchantCode } from "./atobarai-merchant-code";

describe("createAtobaraiMerchantCode", () => {
  it("should create a valid AtobaraiMerchantCode from a non-empty string", () => {
    const result = createAtobaraiMerchantCode("MERCHANT123");

    expect(result).toBe("MERCHANT123");
  });

  it("should throw ZodError when input is an empty string", () => {
    expect(() => createAtobaraiMerchantCode("")).toThrowErrorMatchingInlineSnapshot(`
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

  it("shouldn't be assignable without createAtobaraiMerchantCode", () => {
    // @ts-expect-error - if this fails - it means the type is not branded
    const testValue: AtobaraiMerchantCode = "";

    expect(testValue).toBe("");
  });
});
