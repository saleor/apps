import { describe, expect, it } from "vitest";

import { getFeatureFlags } from "./get-feature-flags";

describe("getFeatureFlags", function () {
  it("Flag should be turned off, when using too old version", () => {
    expect(getFeatureFlags({ saleorVersion: "3.22.0" }).giftCardPaymentMethodDetails).toStrictEqual(
      false,
    );
  });
  it("Flag should be turned on, when using version with feature support", () => {
    expect(getFeatureFlags({ saleorVersion: "3.23.0" }).giftCardPaymentMethodDetails).toStrictEqual(
      true,
    );
  });
});
