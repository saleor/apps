import { describe, expect, it } from "vitest";
import { fillUrlTemplate } from "./fill-url-template";
import { z } from "zod";

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

  /**
   * Not likely to happen, but better safe than sorry
   */
  it("Encodes components so special characters are not passed to URL", () => {
    const resultUrl = fillUrlTemplate({
      urlTemplate: `https://example.com/p/{productSlug}/{productId}/{variantId}`,
      productId: "productId <   ",
      productSlug: "product/slug",
      variantId: "variantId%12!",
    });

    /**
     * Validate URL with URL api
     */
    expect(() => new URL(resultUrl)).not.toThrow();

    expect(resultUrl).toEqual(
      "https://example.com/p/product%2Fslug/productId%20%3C%20%20%20/variantId%2512!"
    );
  });
});
