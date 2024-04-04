import { describe, expect, it } from "vitest";
import { avataxCustomerCode } from "./avatax-customer-code-resolver";

describe("avataxCustomerCode", () => {
  describe("resolve", () => {
    const avataxCustomerCodeFromCheckout = "CC-2137";
    const legacyAvataxCustomerCode = "2137";
    const legacyUserId = "user:42";

    it("returns avataxCustomerCode when present on checkout", () => {
      const customerCode = avataxCustomerCode.resolve({
        avataxCustomerCode: avataxCustomerCodeFromCheckout,
        legacyAvataxCustomerCode: legacyAvataxCustomerCode,
        legacyUserId: legacyUserId,
        source: "Checkout",
      });

      expect(customerCode).toBe(avataxCustomerCodeFromCheckout);
    });

    it("returns avataxCustomerCode when present in legacy sourceObject", () => {
      const customerCode = avataxCustomerCode.resolve({
        avataxCustomerCode: null,
        legacyAvataxCustomerCode: legacyAvataxCustomerCode,
        legacyUserId: legacyUserId,
        source: "Checkout",
      });

      expect(customerCode).toBe(legacyAvataxCustomerCode);
    });

    it("returns user id when present in legacy sourceObject", () => {
      const customerCode = avataxCustomerCode.resolve({
        avataxCustomerCode: null,
        legacyAvataxCustomerCode: null,
        legacyUserId: legacyUserId,
        source: "Checkout",
      });

      expect(customerCode).toBe(legacyUserId);
    });

    it("returns 0 as fallback", () => {
      const customerCode = avataxCustomerCode.resolve({
        avataxCustomerCode: null,
        legacyAvataxCustomerCode: null,
        legacyUserId: null,
        source: "Checkout",
      });

      expect(customerCode).toBe("0");
    });
  });
});
