import { describe, expect, it } from "vitest";

import {
  AtobaraiShippingCompanyCode,
  createAtobaraiShippingCompanyCode,
} from "./atobarai-shipping-company-code";

describe("createAtobaraiShippingCompanyCode", () => {
  it("should create a valid AtobaraiShippingCompanyCode from a valid shipping company code", () => {
    const result = createAtobaraiShippingCompanyCode("50000");

    expect(result).toBe("50000");
  });

  it("should throw validation error when input is an invalid shipping company code", () => {
    expect(() => createAtobaraiShippingCompanyCode("99999")).toThrow(
      'Invalid shipping company code "99999"',
    );
  });

  it("shouldn't be assignable without createAtobaraiShippingCompanyCode", () => {
    // @ts-expect-error - if this fails - it means the type is not branded
    const testValue: AtobaraiShippingCompanyCode = "50000";

    expect(testValue).toBe("50000");
  });
});
