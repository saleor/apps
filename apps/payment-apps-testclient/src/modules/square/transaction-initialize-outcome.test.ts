import { describe, expect, it } from "vitest";

import { getTransactionInitializeOutcome } from "./transaction-initialize-outcome";

describe("getTransactionInitializeOutcome", () => {
  it("accepts only a successful charge as payment success", () => {
    expect(getTransactionInitializeOutcome({ type: "CHARGE_SUCCESS" })).toBe("success");
  });

  it("recognizes a successful partial authorization", () => {
    expect(getTransactionInitializeOutcome({ type: "AUTHORIZATION_SUCCESS" })).toBe(
      "authorization",
    );
  });

  it("treats a failed webhook delivery event as payment failure", () => {
    expect(getTransactionInitializeOutcome({ type: "CHARGE_FAILURE" })).toBe("failure");
  });

  it.each([null, { type: null }, { type: "CHARGE_REQUEST" }])(
    "keeps an unconfirmed result retry-safe",
    (transactionEvent) => {
      expect(getTransactionInitializeOutcome(transactionEvent)).toBe("unknown");
    },
  );
});
