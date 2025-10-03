import { describe, expect, it } from "vitest";

import { channelListingToAlgoliaIndexId, productAndVariantToAlgolia } from "./algoliaUtils";

describe("algoliaUtils", function () {
  describe("channelListingToAlgoliaIndexId", function () {
    it("Creates proper index from channel and defined prefix", () => {
      const result = channelListingToAlgoliaIndexId(
        {
          channel: { slug: "usd", currencyCode: "USD" },
        },
        "staging",
      );

      expect(result).toStrictEqual("staging.usd.USD.products");
    });

    it("Creates proper index from channel and empty string prefix", () => {
      const result = channelListingToAlgoliaIndexId(
        {
          channel: { slug: "usd", currencyCode: "USD" },
        },
        "",
      );

      expect(result).toStrictEqual("usd.USD.products");
    });

    it("Creates proper index from channel and undefined prefix", () => {
      const result = channelListingToAlgoliaIndexId(
        {
          channel: { slug: "usd", currencyCode: "USD" },
        },
        undefined,
      );

      expect(result).toStrictEqual("usd.USD.products");
    });
  });

  describe("productAndVariantToAlgolia", () => {
    /**
     * SHOPX-332 -> "false" attribute was mapped to ""
     */
    it("Maps boolean attributes correctly", () => {
      const mappedEntity = productAndVariantToAlgolia({
        channel: "test",
        enabledKeys: ["attributes"],
        variant: {
          id: "id",
          attributes: [
            {
              attribute: {
                name: "booleanTrue",
              },
              values: [
                {
                  name: "true",
                  inputType: "BOOLEAN",
                  boolean: true,
                },
              ],
            },
            {
              attribute: {
                name: "booleanFalse",
              },
              values: [
                {
                  name: "true",
                  inputType: "BOOLEAN",
                  boolean: false,
                },
              ],
            },
          ],
          name: "product name",
          metadata: [],
          product: {
            __typename: undefined,
            id: "",
            name: "",
            description: undefined,
            slug: "",
            variants: undefined,
            category: undefined,
            thumbnail: undefined,
            media: undefined,
            attributes: [
              {
                attribute: {
                  name: "booleanTrue",
                },
                values: [
                  {
                    name: "true",
                    inputType: "BOOLEAN",
                    boolean: true,
                  },
                ],
              },
              {
                attribute: {
                  name: "booleanFalse",
                },
                values: [
                  {
                    name: "true",
                    inputType: "BOOLEAN",
                    boolean: false,
                  },
                ],
              },
            ],
            channelListings: undefined,
            collections: undefined,
            metadata: [],
          },
        },
      });

      /**
       * Expect only root attributes, because variant and product attributes are merged
       */
      // @ts-expect-error - record is not typed (attributes are dynamic keys)
      expect(mappedEntity.attributes["booleanTrue"]).toBe(true);
      // @ts-expect-error - record is not typed (attributes are dynamic keys)
      expect(mappedEntity.attributes["booleanFalse"]).toBe(false);
    });

    it("Maps single-value non-boolean attribute as string", () => {
      const mappedEntity = productAndVariantToAlgolia({
        channel: "test",
        enabledKeys: ["attributes"],
        variant: {
          id: "id",
          attributes: [
            {
              attribute: {
                name: "size",
              },
              values: [
                {
                  name: "Large",
                  inputType: "DROPDOWN",
                  boolean: null,
                },
              ],
            },
          ],
          name: "product name",
          metadata: [],
          product: {
            __typename: undefined,
            id: "",
            name: "",
            description: undefined,
            slug: "",
            variants: undefined,
            category: undefined,
            thumbnail: undefined,
            media: undefined,
            attributes: [],
            channelListings: undefined,
            collections: undefined,
            metadata: [],
          },
        },
      });

      // @ts-expect-error - record is not typed (attributes are dynamic keys)
      expect(mappedEntity.attributes["size"]).toBe("Large");
    });

    it("Maps multi-value attributes as array of strings", () => {
      const mappedEntity = productAndVariantToAlgolia({
        channel: "test",
        enabledKeys: ["attributes"],
        variant: {
          id: "id",
          attributes: [
            {
              attribute: {
                name: "colors",
              },
              values: [
                {
                  name: "Red",
                  inputType: "MULTISELECT",
                  boolean: null,
                },
                {
                  name: "Blue",
                  inputType: "MULTISELECT",
                  boolean: null,
                },
                {
                  name: "Green",
                  inputType: "MULTISELECT",
                  boolean: null,
                },
              ],
            },
          ],
          name: "product name",
          metadata: [],
          product: {
            __typename: undefined,
            id: "",
            name: "",
            description: undefined,
            slug: "",
            variants: undefined,
            category: undefined,
            thumbnail: undefined,
            media: undefined,
            attributes: [],
            channelListings: undefined,
            collections: undefined,
            metadata: [],
          },
        },
      });

      // @ts-expect-error - record is not typed (attributes are dynamic keys)
      expect(mappedEntity.attributes["colors"]).toStrictEqual(["Red", "Blue", "Green"]);
      // @ts-expect-error - record is not typed (attributes are dynamic keys)
      expect(Array.isArray(mappedEntity.attributes["colors"])).toBe(true);
    });

    it("Filters out inactive variants from otherVariants", () => {
      const currentChannel = "channel-1";
      const mappedEntity = productAndVariantToAlgolia({
        channel: currentChannel,
        enabledKeys: ["otherVariants"],
        variant: {
          id: "variant-1",
          attributes: [],
          name: "Variant 1",
          metadata: [],
          product: {
            __typename: undefined,
            id: "product-1",
            name: "Product 1",
            description: undefined,
            slug: "product-1",
            variants: [
              // Current variant - should be excluded
              {
                id: "variant-1",
                channelListings: [
                  {
                    id: "cl-1",
                    channel: {
                      slug: currentChannel,
                      currencyCode: "USD",
                    },
                  },
                ],
              },
              // Active variant in current channel - should be included
              {
                id: "variant-2",
                channelListings: [
                  {
                    id: "cl-2",
                    channel: {
                      slug: currentChannel,
                      currencyCode: "USD",
                    },
                  },
                ],
              },
              // Inactive variant (no channel listing) - should be excluded
              {
                id: "variant-3",
                channelListings: [],
              },
              // Variant with other channel listing - should be excluded
              {
                id: "variant-4",
                channelListings: [
                  {
                    id: "cl-4",
                    channel: {
                      slug: "other-channel",
                      currencyCode: "EUR",
                    },
                  },
                ],
              },
              // Variant with multiple channels including current one - should be included
              {
                id: "variant-5",
                channelListings: [
                  {
                    id: "cl-5a",
                    channel: {
                      slug: "other-channel",
                      currencyCode: "EUR",
                    },
                  },
                  {
                    id: "cl-5b",
                    channel: {
                      slug: currentChannel,
                      currencyCode: "USD",
                    },
                  },
                ],
              },
            ],
            category: undefined,
            thumbnail: undefined,
            media: undefined,
            attributes: [],
            channelListings: undefined,
            collections: undefined,
            metadata: [],
          },
        },
      });

      // Should only include variant-2 and variant-5 (active in current channel)
      expect(mappedEntity.otherVariants).toHaveLength(2);
      expect(mappedEntity.otherVariants).toContain("variant-2");
      expect(mappedEntity.otherVariants).toContain("variant-5");
      // Should not include current variant or inactive variants
      expect(mappedEntity.otherVariants).not.toContain("variant-1");
      expect(mappedEntity.otherVariants).not.toContain("variant-3");
      expect(mappedEntity.otherVariants).not.toContain("variant-4");
    });
  });
});
