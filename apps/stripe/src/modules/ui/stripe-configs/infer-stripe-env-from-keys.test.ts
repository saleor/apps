import { describe, expect, it } from "vitest";

import { inferStripeEnvFromKeys } from "./infer-stripe-env-from-keys";

describe("inferStripeEnvFromKeys", () => {
  it("stays silent when both fields are empty", () => {
    expect(inferStripeEnvFromKeys({ publishableKey: "", restrictedKey: "" })).toBeNull();
  });

  it("reads sandbox from a pasted publishable key", () => {
    expect(inferStripeEnvFromKeys({ publishableKey: "pk_test_abc", restrictedKey: "" })).toBe(
      "TEST",
    );
  });

  it("reads live from a pasted restricted key", () => {
    expect(inferStripeEnvFromKeys({ publishableKey: "", restrictedKey: "rk_live_abc" })).toBe(
      "LIVE",
    );
  });

  it("ignores incomplete prefixes so typing pk_t does not flash a pill", () => {
    expect(inferStripeEnvFromKeys({ publishableKey: "pk_test", restrictedKey: "" })).toBeNull();
  });

  it("stays silent when the two keys disagree", () => {
    expect(
      inferStripeEnvFromKeys({ publishableKey: "pk_test_abc", restrictedKey: "rk_live_abc" }),
    ).toBeNull();
  });

  it("trims pasted whitespace", () => {
    expect(inferStripeEnvFromKeys({ publishableKey: "  pk_live_abc\n", restrictedKey: "" })).toBe(
      "LIVE",
    );
  });

  it("treats undefined watch values as empty", () => {
    expect(
      inferStripeEnvFromKeys({ publishableKey: undefined, restrictedKey: undefined }),
    ).toBeNull();
  });

  it("keeps the saved environment when the restricted key is left empty on edit", () => {
    expect(
      inferStripeEnvFromKeys({
        publishableKey: "pk_test_abc",
        restrictedKey: "",
        keptRestrictedKeyEnv: "TEST",
      }),
    ).toBe("TEST");
  });

  it("hides the pill when only the publishable key switches environment on edit", () => {
    expect(
      inferStripeEnvFromKeys({
        publishableKey: "pk_live_abc",
        restrictedKey: "",
        keptRestrictedKeyEnv: "TEST",
      }),
    ).toBeNull();
  });
});
