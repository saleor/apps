import { it, describe, expect } from "vitest";
import { getFeatureFlags } from "./get-feature-flags";

describe("getFeatureFlags", function () {
  it("Flag should be turned off, when using too old version", () => {
    expect(getFeatureFlags({ saleorVersion: "3.10.0" }).giftCardSentEvent).toEqual(false);
  });
  it("Flag should be turned on, when using version with feature support", () => {
    expect(getFeatureFlags({ saleorVersion: "3.13.0" }).giftCardSentEvent).toEqual(true);
  });
});
