import { beforeEach, describe, expect, it } from "vitest";

import {
  acquireCashAppPaymentLock,
  hasCashAppPaymentLock,
  releaseCashAppPaymentLock,
} from "./cash-app-payment-lock";

describe("Cash App payment lock", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists and releases a lock for one payment scope", () => {
    const scope = "checkout:gateway:cash-app-pay";
    const firstIdempotencyKey = acquireCashAppPaymentLock(scope);

    expect(hasCashAppPaymentLock(scope)).toBe(true);
    expect(acquireCashAppPaymentLock(scope)).toBe(firstIdempotencyKey);

    releaseCashAppPaymentLock(scope);

    expect(hasCashAppPaymentLock(scope)).toBe(false);
    expect(acquireCashAppPaymentLock(scope)).not.toBe(firstIdempotencyKey);
  });

  it("does not lock a different payment scope", () => {
    acquireCashAppPaymentLock("checkout-a:gateway:cash-app-pay");

    expect(hasCashAppPaymentLock("checkout-b:gateway:cash-app-pay")).toBe(false);
  });
});
