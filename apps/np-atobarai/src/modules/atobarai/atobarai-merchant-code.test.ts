import { describe, expect, it } from "vitest";

import { AtobaraiMerchantCode, createAtobaraiMerchantCode } from "./atobarai-merchant-code";

describe("createAtobaraiMerchantCode", () => {
  it("should create a valid AtobaraiMerchantCode from a non-empty string", () => {
    const result = createAtobaraiMerchantCode("MERCHANT123");

    expect(result).toBe("MERCHANT123");
  });

  it("should throw validation error when input is an empty string", () => {
    expect(() => createAtobaraiMerchantCode("")).toThrow(
      "Invalid merchant code: String must contain at least 1 character(s)",
    );
  });

  it("shouldn't be assignable without createAtobaraiMerchantCode", () => {
    // @ts-expect-error - if this fails - it means the type is not branded
    const testValue: AtobaraiMerchantCode = "";

    expect(testValue).toBe("");
  });
});
