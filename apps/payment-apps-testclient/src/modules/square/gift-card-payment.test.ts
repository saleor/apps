import { describe, expect, it } from "vitest";

import {
  createSandboxGiftCardTokenResult,
  getRemainingGiftCardAmount,
  isGiftCardAuthorizationLive,
  parseGiftCardAuthorizationState,
} from "./gift-card-payment";

describe("getRemainingGiftCardAmount", () => {
  it("returns the amount the card payment must cover", () => {
    expect(
      getRemainingGiftCardAmount({
        amountDue: 20,
        chargedAmount: 5,
        currency: "USD",
      }),
    ).toBe(15);
  });

  it("rounds the remainder using the currency precision", () => {
    expect(
      getRemainingGiftCardAmount({
        amountDue: 20,
        chargedAmount: 4.999,
        currency: "USD",
      }),
    ).toBe(15);
  });
});

describe("parseGiftCardAuthorizationState", () => {
  it("restores valid gift-card display state without provider identifiers", () => {
    expect(
      parseGiftCardAuthorizationState(
        JSON.stringify({
          remainingAmount: 15,
          currency: "USD",
          expiresAt: "2026-08-25T10:30:00.000Z",
          cardLast4: "0005",
        }),
      ),
    ).toStrictEqual({
      remainingAmount: 15,
      currency: "USD",
      expiresAt: "2026-08-25T10:30:00.000Z",
      cardLast4: "0005",
    });
  });

  it.each([null, "not-json", "{}", '{"remainingAmount":0}'])(
    "rejects missing or invalid persisted state",
    (value) => {
      expect(parseGiftCardAuthorizationState(value)).toBeNull();
    },
  );
});

describe("isGiftCardAuthorizationLive", () => {
  const authorization = {
    remainingAmount: 15,
    currency: "USD",
    expiresAt: "2026-08-25T10:30:00.000Z",
  };

  it("accepts matching partial Saleor authorization state before expiry", () => {
    expect(
      isGiftCardAuthorizationLive({
        authorization,
        authorizeStatus: "PARTIAL",
        chargeStatus: "NONE",
        checkoutTotal: { amount: 20, currency: "USD" },
        now: Date.parse("2026-08-25T10:10:00.000Z"),
      }),
    ).toBe(true);
  });

  it.each([
    {
      name: "expired",
      authorizeStatus: "PARTIAL",
      chargeStatus: "NONE",
      checkoutTotal: { amount: 20, currency: "USD" },
      now: Date.parse("2026-08-25T10:30:00.000Z"),
    },
    {
      name: "canceled in Saleor",
      authorizeStatus: "NONE",
      chargeStatus: "NONE",
      checkoutTotal: { amount: 20, currency: "USD" },
      now: Date.parse("2026-08-25T10:10:00.000Z"),
    },
    {
      name: "remainder that does not represent a partial payment",
      authorizeStatus: "PARTIAL",
      chargeStatus: "NONE",
      checkoutTotal: { amount: 15, currency: "USD" },
      now: Date.parse("2026-08-25T10:10:00.000Z"),
    },
  ])("rejects $name state", ({ authorizeStatus, chargeStatus, checkoutTotal, now }) => {
    expect(
      isGiftCardAuthorizationLive({
        authorization,
        authorizeStatus,
        chargeStatus,
        checkoutTotal,
        now,
      }),
    ).toBe(false);
  });
});

describe("createSandboxGiftCardTokenResult", () => {
  it("uses a pasted Sandbox gift card ID as the payment source", () => {
    expect(createSandboxGiftCardTokenResult("  gift-card-id  ")).toStrictEqual({
      status: "OK",
      token: "gift-card-id",
    });
  });

  it("rejects an empty Sandbox gift card ID", () => {
    expect(createSandboxGiftCardTokenResult("   ")).toStrictEqual({
      status: "ERROR",
      errors: [{ message: "Enter a Square Sandbox gift card ID." }],
    });
  });
});
