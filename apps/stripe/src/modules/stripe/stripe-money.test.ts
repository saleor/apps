import { describe, expect, it } from "vitest";

import { StripeMoney } from "./stripe-money";

describe("StripeMoney", () => {
  describe("createFromSaleorAmount", () => {
    it("creates a valid StripeMoney instance", () => {
      const money = StripeMoney.createFromSaleorAmount({
        amount: 10.0,
        currency: "USD",
      })._unsafeUnwrap();

      expect(money.getAmount()).toBe(1000);
      expect(money.getCurrency()).toBe("usd");
    });

    it("handles different currency precisions correctly", () => {
      const money = StripeMoney.createFromSaleorAmount({
        amount: 10.0,
        currency: "JPY",
      })._unsafeUnwrap();

      expect(money.getAmount()).toBe(10);
      expect(money.getCurrency()).toBe("jpy");
    });

    it("returns error for negative amount", () => {
      const money = StripeMoney.createFromSaleorAmount({
        amount: -10.0,
        currency: "USD",
      });

      expect(money._unsafeUnwrapErr()).toBeInstanceOf(StripeMoney.ValdationError);
    });

    it("returns error for invalid currency code length", () => {
      const money = StripeMoney.createFromSaleorAmount({
        amount: 100.0,
        currency: "USDD",
      });

      expect(money._unsafeUnwrapErr()).toBeInstanceOf(StripeMoney.ValdationError);
    });

    it("returns error for unsupported currency", () => {
      const money = StripeMoney.createFromSaleorAmount({
        amount: 100.0,
        currency: "ABC",
      });

      expect(money._unsafeUnwrapErr()).toBeInstanceOf(StripeMoney.ValdationError);
    });
  });

  describe("getAmount", () => {
    it("handles 0-digit currencies", () => {
      const money = StripeMoney.createFromSaleorAmount({
        amount: 2137,
        currency: "JPY",
      })._unsafeUnwrap();

      expect(money.getAmount()).toBe(2137);
    });

    it("handles 2-digit currencies", () => {
      const money = StripeMoney.createFromSaleorAmount({
        amount: 10.99,
        currency: "USD",
      })._unsafeUnwrap();

      expect(money.getAmount()).toBe(1099);
    });

    it("handles 3-digit currencies", () => {
      const money = StripeMoney.createFromSaleorAmount({
        amount: 10.123,
        currency: "IQD",
      })._unsafeUnwrap();

      expect(money.getAmount()).toBe(10123);
    });

    it("handles 4-digit currencies", () => {
      const money = StripeMoney.createFromSaleorAmount({
        amount: 10.1234,
        currency: "UYW",
      })._unsafeUnwrap();

      expect(money.getAmount()).toBe(101234);
    });
  });

  describe("getCurrency", () => {
    it("returns lowercase currency code", () => {
      const money = StripeMoney.createFromSaleorAmount({
        amount: 1000,
        currency: "EUR",
      })._unsafeUnwrap();

      expect(money.getCurrency()).toBe("eur");
    });
  });
});
