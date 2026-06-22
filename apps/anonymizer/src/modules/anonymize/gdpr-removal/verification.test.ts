import { describe, expect, it } from "vitest";

import { buildVerificationSummary, isRemovalFullyVerified } from "./verification";

const allRemoved = {
  remainingOrders: 0,
  remainingCheckouts: 0,
  remainingGiftCards: 0,
  customerStillExists: false,
};

const fullScope = { checkoutsApplicable: true, hadCustomerAccount: true };

describe("buildVerificationSummary", () => {
  it("marks every line ok when nothing remains", () => {
    const lines = buildVerificationSummary(allRemoved, fullScope);

    expect(lines.map((line) => line.status)).toStrictEqual(["ok", "ok", "ok", "ok"]);
    expect(isRemovalFullyVerified(lines)).toBe(true);
  });

  it("flags the types that still have leftover data", () => {
    const lines = buildVerificationSummary(
      {
        remainingOrders: 2,
        remainingCheckouts: 0,
        remainingGiftCards: 1,
        customerStillExists: true,
      },
      fullScope,
    );

    const byType = Object.fromEntries(lines.map((line) => [line.type, line.status]));

    expect(byType).toStrictEqual({
      orders: "failed",
      checkouts: "ok",
      giftCards: "failed",
      customer: "failed",
    });
    expect(isRemovalFullyVerified(lines)).toBe(false);
  });

  it("reports checkouts as skipped (not failed) when checkout deletion is unsupported", () => {
    const lines = buildVerificationSummary(
      { ...allRemoved, remainingCheckouts: 5 },
      { checkoutsApplicable: false, hadCustomerAccount: true },
    );

    const checkouts = lines.find((line) => line.type === "checkouts");

    expect(checkouts?.status).toBe("skipped");
    // A skipped check must not fail overall verification.
    expect(isRemovalFullyVerified(lines)).toBe(true);
  });

  it("omits the customer line when there was no account", () => {
    const lines = buildVerificationSummary(allRemoved, {
      checkoutsApplicable: true,
      hadCustomerAccount: false,
    });

    expect(lines.some((line) => line.type === "customer")).toBe(false);
  });
});
