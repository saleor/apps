import { describe, expect, it } from "vitest";
import { channelListingToAlgoliaIndexId, productAndVariantToAlgolia } from "./algoliaUtils";
import { AttributeInputTypeEnum } from "../../../generated/graphql";

describe("algoliaUtils", function () {
  describe("channelListingToAlgoliaIndexId", function () {
    it("Creates proper index from channel and defined prefix", () => {
      const result = channelListingToAlgoliaIndexId(
        {
          channel: { slug: "usd", currencyCode: "USD" },
        },
        "staging",
      );

      expect(result).toEqual("staging.usd.USD.products");
    });

    it("Creates proper index from channel and empty string prefix", () => {
      const result = channelListingToAlgoliaIndexId(
        {
          channel: { slug: "usd", currencyCode: "USD" },
        },
        "",
      );

      expect(result).toEqual("usd.USD.products");
    });

    it("Creates proper index from channel and undefined prefix", () => {
      const result = channelListingToAlgoliaIndexId(
        {
          channel: { slug: "usd", currencyCode: "USD" },
        },
        undefined,
      );

      expect(result).toEqual("usd.USD.products");
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
                  inputType: AttributeInputTypeEnum.Boolean,
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
                  inputType: AttributeInputTypeEnum.Boolean,
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
                    inputType: AttributeInputTypeEnum.Boolean,
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
                    inputType: AttributeInputTypeEnum.Boolean,
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
  });
});
