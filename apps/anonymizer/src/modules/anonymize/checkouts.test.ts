import { describe, expect, it } from "vitest";

import { checkoutMatchesEmail } from "./checkouts";

describe("checkoutMatchesEmail", () => {
  it("matches the checkout email case-insensitively", () => {
    expect(checkoutMatchesEmail({ email: "Customer@Example.com" }, "customer@example.com")).toBe(
      true,
    );
    expect(checkoutMatchesEmail({ email: "customer@example.com" }, "  CUSTOMER@EXAMPLE.COM ")).toBe(
      true,
    );
  });

  it("does not match a different email", () => {
    expect(checkoutMatchesEmail({ email: "other@example.com" }, "customer@example.com")).toBe(
      false,
    );
  });

  it("does not match when the checkout has no email", () => {
    expect(checkoutMatchesEmail({ email: null }, "customer@example.com")).toBe(false);
    expect(checkoutMatchesEmail({}, "customer@example.com")).toBe(false);
  });

  it("never matches an empty lookup email", () => {
    expect(checkoutMatchesEmail({ email: "customer@example.com" }, "")).toBe(false);
    expect(checkoutMatchesEmail({ email: "customer@example.com" }, "   ")).toBe(false);
  });
});
