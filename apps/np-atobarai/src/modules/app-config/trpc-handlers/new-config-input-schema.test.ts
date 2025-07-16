import { describe, expect, it } from "vitest";

import { newConfigInputSchema } from "@/modules/app-config/trpc-handlers/new-config-input-schema";

describe("newConfigInputSchema", () => {
  it("Properly parses valid input", () => {
    expect(
      newConfigInputSchema.parse({
        name: "test",
        fillMissingAddress: true,
        merchantCode: "test-merchant",
        shippingCompanyCode: "50000",
        skuAsName: true,
        spCode: "test-sp",
        terminalId: "test-terminal",
        useSandbox: true,
      }),
    ).toStrictEqual({
      name: "test",
      fillMissingAddress: true,
      merchantCode: "test-merchant",
      shippingCompanyCode: "50000",
      skuAsName: true,
      spCode: "test-sp",
      terminalId: "test-terminal",
      useSandbox: true,
    });
  });

  it("Returns list of errors for invalid input", () => {
    expect(() =>
      newConfigInputSchema.parse({
        name: "",
        fillMissingAddress: true,
        merchantCode: "test-merchant",
        shippingCompanyCode: "aaaaaaaaaa",
        skuAsName: true,
        spCode: "test-sp",
        terminalId: "test-terminal",
        useSandbox: true,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "code": "too_small",
          "minimum": 1,
          "type": "string",
          "inclusive": true,
          "exact": false,
          "message": "String must contain at least 1 character(s)",
          "path": [
            "name"
          ]
        },
        {
          "code": "too_big",
          "maximum": 5,
          "type": "string",
          "inclusive": true,
          "exact": true,
          "message": "String must contain exactly 5 character(s)",
          "path": [
            "shippingCompanyCode"
          ]
        }
      ]]
    `);
  });
});
