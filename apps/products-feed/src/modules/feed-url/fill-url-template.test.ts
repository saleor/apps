import { describe, expect, it } from "vitest";
import { fillUrlTemplate } from "./fill-url-template";

describe("fillUrlTemplate", () => {
  it("Replaces template strings in url", () => {
    expect(
      fillUrlTemplate({
        urlTemplate: `https://example.com/p/{productSlug}/{productId}/{variantId}`,
        productId: "PRODUCT_ID",
        productSlug: "PRODUCT_SLUG",
        variantId: "VARIANT_ID",
      })
    ).toEqual("https://example.com/p/PRODUCT_SLUG/PRODUCT_ID/VARIANT_ID");
  });
});
