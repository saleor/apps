import { describe, expect, it } from "vitest";
import { UserFragment } from "../../../generated/graphql";
import { avataxCustomerCode } from "./avatax-customer-code-resolver";

describe("avataxCustomerCode", () => {
  describe("resolve", () => {
    it("returns user id when present in sourceObject", () => {
      const customerCode = avataxCustomerCode.resolve({
        email: "demo@saleor.io",
        id: "123",
      });

      expect(customerCode).toBe("123");
    });
    it("returns avataxCustomerCode when present in sourceObject", () => {
      const customerCode = avataxCustomerCode.resolve({
        email: "demo@saleor.io",
        id: "123",
        avataxCustomerCode: "456",
      });

      expect(customerCode).toBe("456");
    });
    it("returns 0 when no user id", () => {
      const customerCode = avataxCustomerCode.resolve({
        email: "demo@saleor.io",
      } as UserFragment);

      expect(customerCode).toBe("0");
    });
  });
});
