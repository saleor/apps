import { describe, expect, it } from "vitest";

import { aggregateBalancesByCurrency, formatBalances, giftCardMatchesEmail } from "./gift-cards";

describe("giftCardMatchesEmail", () => {
  it("matches on createdByEmail case-insensitively", () => {
    expect(giftCardMatchesEmail({ createdByEmail: "Buyer@Example.com" }, "buyer@example.com")).toBe(
      true,
    );
  });

  it("matches on usedByEmail case-insensitively", () => {
    expect(
      giftCardMatchesEmail({ usedByEmail: "redeemer@example.com" }, "REDEEMER@example.com"),
    ).toBe(true);
  });

  it("matches the 'send to customer' recipient email stored on an event", () => {
    expect(
      giftCardMatchesEmail(
        {
          createdByEmail: "staff@example.com",
          events: [{ email: null }, { email: "Recipient@Example.com" }],
        },
        "recipient@example.com",
      ),
    ).toBe(true);
  });

  it("does not match when neither email nor any event matches", () => {
    expect(
      giftCardMatchesEmail(
        {
          createdByEmail: "a@example.com",
          usedByEmail: "b@example.com",
          events: [{ email: "d@example.com" }],
        },
        "c@example.com",
      ),
    ).toBe(false);
  });

  it("does not match against empty/null event emails", () => {
    expect(
      giftCardMatchesEmail({ events: [{ email: null }, { email: "" }] }, "a@example.com"),
    ).toBe(false);
  });

  it("does not match when both emails are null/undefined", () => {
    expect(giftCardMatchesEmail({ createdByEmail: null, usedByEmail: null }, "a@example.com")).toBe(
      false,
    );
    expect(giftCardMatchesEmail({}, "a@example.com")).toBe(false);
  });

  it("never matches an empty lookup email", () => {
    expect(giftCardMatchesEmail({ createdByEmail: "a@example.com" }, "  ")).toBe(false);
  });
});

describe("aggregateBalancesByCurrency", () => {
  it("sums balances per currency, sorted by currency code", () => {
    expect(
      aggregateBalancesByCurrency([
        { currentBalance: { amount: 100, currency: "USD" } },
        { currentBalance: { amount: 50, currency: "EUR" } },
        { currentBalance: { amount: 25.5, currency: "USD" } },
      ]),
    ).toStrictEqual([
      { currency: "EUR", amount: 50 },
      { currency: "USD", amount: 125.5 },
    ]);
  });

  it("returns an empty list for no cards", () => {
    expect(aggregateBalancesByCurrency([])).toStrictEqual([]);
  });
});

describe("formatBalances", () => {
  it("formats per-currency totals with two decimals", () => {
    expect(
      formatBalances([
        { currency: "USD", amount: 1250 },
        { currency: "EUR", amount: 300.5 },
      ]),
    ).toBe("1250.00 USD, 300.50 EUR");
  });

  it("returns an empty string for no balances", () => {
    expect(formatBalances([])).toBe("");
  });
});
