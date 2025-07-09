import { describe, expect, it } from "vitest";

import { AtobaraiShopOrderDate, createAtobaraiShopOrderDate } from "./atobarai-shop-order-date";

describe("createAtobaraiShopOrderDate", () => {
  it("should create a valid AtobaraiShopOrderDate from a valid date string", () => {
    const result = createAtobaraiShopOrderDate("2025-07-08T00:00:00Z");

    expect(result).toBe("2025-07-08");
  });

  it("should throw ZodError when input is an empty string", () => {
    expect(() => createAtobaraiShopOrderDate("")).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "code": "invalid_string",
          "validation": "datetime",
          "message": "Invalid datetime",
          "path": []
        }
      ]]
    `);
  });

  it("shouldn't be assignable without createAtobaraiShopOrderDate", () => {
    // @ts-expect-error - if this fails - it means the type is not branded
    const testValue: AtobaraiShopOrderDate = "";

    expect(testValue).toBe("");
  });
});
