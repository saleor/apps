import { describe, expect, it } from "vitest";

import { AtobaraiMoney, createAtobaraiMoney } from "./atobarai-money";

describe("createAtobaraiMoney", () => {
  it("should create a valid AtobaraiMoney", () => {
    const result = createAtobaraiMoney({
      amount: 1000,
      currency: "JPY",
    });

    expect(result).toStrictEqual({ amount: 1000, currency: "JPY" });
  });

  it("should throw ZodError when currency is an empty string", () => {
    expect(() => createAtobaraiMoney({ amount: 1000, currency: "" }))
      .toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "received": "",
          "code": "invalid_literal",
          "expected": "JPY",
          "path": [
            "currency"
          ],
          "message": "Invalid literal value, expected \\"JPY\\""
        }
      ]]
    `);
  });

  it("should throw ZodError when currency is a non JPY", () => {
    expect(() => createAtobaraiMoney({ amount: 1000, currency: "USD" }))
      .toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "received": "USD",
          "code": "invalid_literal",
          "expected": "JPY",
          "path": [
            "currency"
          ],
          "message": "Invalid literal value, expected \\"JPY\\""
        }
      ]]
    `);
  });

  it("shouldn't be assignable without createAtobaraiMoney", () => {
    // @ts-expect-error - if this fails - it means the type is not branded
    const testValue: AtobaraiMoney = { amount: 1000, currency: "JPY" };

    expect(testValue).toStrictEqual({ amount: 1000, currency: "JPY" });
  });
});
