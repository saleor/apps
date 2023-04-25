import { describe, expect, it } from "vitest";
import { channelListingToAlgoliaIndexId } from "./algoliaUtils";

describe("algoliaUtils", function () {
  describe("channelListingToAlgoliaIndexId", function () {
    it("Creates proper index from channel and defined prefix", () => {
      const result = channelListingToAlgoliaIndexId(
        {
          channel: { slug: "usd", currencyCode: "USD" },
        },
        "staging"
      );

      expect(result).toEqual("staging.usd.USD.products");
    });

    it("Creates proper index from channel and empty string prefix", () => {
      const result = channelListingToAlgoliaIndexId(
        {
          channel: { slug: "usd", currencyCode: "USD" },
        },
        ""
      );

      expect(result).toEqual("usd.USD.products");
    });

    it("Creates proper index from channel and undefined prefix", () => {
      const result = channelListingToAlgoliaIndexId(
        {
          channel: { slug: "usd", currencyCode: "USD" },
        },
        undefined
      );

      expect(result).toEqual("usd.USD.products");
    });
  });
});
