import { describe, expect, it } from "vitest";

import { SaleorMoney } from "./saleor-money";

describe("SaleorMoney", () => {
  describe("createFromStripe", () => {
    it("creates a valid money object for valid input", () => {
      const result = SaleorMoney.createFromStripe({ amount: 1000, currency: "usd" });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toBeInstanceOf(SaleorMoney);
    });

    it("rejects negative amounts", () => {
      const result = SaleorMoney.createFromStripe({ amount: -100, currency: "usd" });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(SaleorMoney.ValdationError);
    });

    it("rejects invalid currency code length", () => {
      const result = SaleorMoney.createFromStripe({ amount: 100, currency: "usdd" });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(SaleorMoney.ValdationError);
    });

    it("rejects unsupported currency codes", () => {
      const result = SaleorMoney.createFromStripe({ amount: 100, currency: "abc" });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(SaleorMoney.ValdationError);
    });
  });

  describe("amount", () => {
    it("handles 0-digit currencies", () => {
      const money = SaleorMoney.createFromStripe({
        amount: 2137,
        currency: "jpy",
      })._unsafeUnwrap();

      expect(money.amount).toBe(2137);
    });

    it("handles 2-digit currencies", () => {
      const money = SaleorMoney.createFromStripe({
        amount: 1099,
        currency: "usd",
      })._unsafeUnwrap();

      expect(money.amount).toBe(10.99);
    });

    it("handles 3-digit currencies", () => {
      const money = SaleorMoney.createFromStripe({
        amount: 10123,
        currency: "iqd",
      })._unsafeUnwrap();

      expect(money.amount).toBe(10.123);
    });

    it("handles 4-digit currencies", () => {
      const money = SaleorMoney.createFromStripe({
        amount: 101234,
        currency: "uyw",
      })._unsafeUnwrap();

      expect(money.amount).toBe(10.1234);
    });
  });

  describe("currency", () => {
    it("returns currency in uppercase", () => {
      const result = SaleorMoney.createFromStripe({ amount: 1000, currency: "usd" });

      expect(result._unsafeUnwrap().currency).toBe("USD");
    });
  });
});
