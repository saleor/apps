import { describe, expect, it } from "vitest";

import { getFeatureFlags } from "./get-feature-flags";

describe("getFeatureFlags", function () {
  it("Flag should be turned off, when using too old version", () => {
    expect(getFeatureFlags({ saleorVersion: "3.10.0" }).giftCardSentEvent).toStrictEqual(false);
  });
  it("Flag should be turned on, when using version with feature support", () => {
    expect(getFeatureFlags({ saleorVersion: "3.13.0" }).giftCardSentEvent).toStrictEqual(true);
  });

  it("customerDeletedEvent flag should be off for Saleor < 3.23", () => {
    expect(getFeatureFlags({ saleorVersion: "3.22.0" }).customerDeletedEvent).toStrictEqual(false);
  });

  it("customerDeletedEvent flag should be on for Saleor >= 3.23", () => {
    expect(getFeatureFlags({ saleorVersion: "3.23.0" }).customerDeletedEvent).toStrictEqual(true);
  });
});
