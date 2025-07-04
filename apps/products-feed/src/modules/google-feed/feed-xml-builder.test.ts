import { describe, expect, it } from "vitest";

import { FeedXmlBuilder } from "./feed-xml-builder";
import { productVariantToProxy } from "./product-variant-to-proxy";
import { shopDetailsToProxy } from "./shop-details-to-proxy";

describe("FeedXmlBuilder", () => {
  it("Builds root XML for channel without products initially", () => {
    const builder = new FeedXmlBuilder();

    const channelData = shopDetailsToProxy({
      title: "Shop",
      description: "Description",
      storefrontUrl: "https://www.google.com",
    });

    const result = builder.buildRootXml({
      channelData: channelData,
    });

    expect(result).toMatchInlineSnapshot(`
      "<?xml version="1.0" encoding="utf-8"?>
      <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
        <channel>
          <title>Shop</title>
          <link>https://www.google.com</link>
          <description>Description</description>
        </channel>
      </rss>"
    `);
  });

  it("Injects product items inside root feed", () => {
    const builder = new FeedXmlBuilder();

    const channelData = shopDetailsToProxy({
      title: "Shop",
      description: "Description",
      storefrontUrl: "https://www.google.com",
    });

    const root = builder.buildRootXml({
      channelData: channelData,
    });

    const productsXml = `<item>test</item><item>test</item>`;

    const result = builder.injectProductsString(root, productsXml);

    expect(result).toMatchInlineSnapshot(`
      "<?xml version="1.0" encoding="utf-8"?>
      <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
        <channel>
          <title>Shop</title>
          <link>https://www.google.com</link>
          <description>Description</description>
        <item>test</item><item>test</item>
      </channel>
      </rss>"
    `);
  });

  it("Converts products data do XML", () => {
    const builder = new FeedXmlBuilder();

    const item = productVariantToProxy({
      productStorefrontUrl: "https://google.com/p/{{variant.product.slug}}",
      titleTemplate: "{{variant.product.name}} - {{variant.name}}",
      attributeMapping: null,
      variant: {
        attributes: [],
        name: "test variant",
        sku: "sku-1",
        id: "aabbcc",
        __typename: "ProductVariant",
        pricing: {
          __typename: "VariantPricingInfo",
          price: {
            __typename: "TaxedMoney",
            gross: {
              amount: 1,
              currency: "USD",
            },
          },
          priceUndiscounted: {
            __typename: "TaxedMoney",
            gross: {
              amount: 2,
              currency: "USD",
            },
          },
        },
        product: {
          __typename: "Product",
          attributes: [],
          category: {
            __typename: "Category",
            googleCategoryId: "google-category-id",
            id: "saleor-cat-1",
            name: "cat name",
          },
          description: "desc product",
          id: "product id",
          media: [],
          name: "product name",
          slug: "product-slug",
          productType: {
            __typename: "ProductType",
            isShippingRequired: false,
          },
        },
        quantityAvailable: 5,
        weight: { unit: "KG", value: 50 },
      },
    });

    const result = builder.buildItemsChunk([item]);

    expect(result).toMatchInlineSnapshot(`
      "
      <item>
        <g:id>sku-1</g:id>
        <g:item_group_id>product id</g:item_group_id>
        <title>product name - test variant</title>
        <g:condition>new</g:condition>
        <g:availability>in_stock</g:availability>
        <g:product_type>cat name</g:product_type>
        <g:google_product_category>google-category-id</g:google_product_category>
        <link>https://google.com/p/product-slug</link>
        <g:price>2.00 USD</g:price>
        <g:sale_price>1.00 USD</g:sale_price>
      </item>"
    `);
  });
});
