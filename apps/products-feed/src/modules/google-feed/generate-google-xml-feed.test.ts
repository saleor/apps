import { describe, expect, it } from "vitest";
import { GoogleFeedProductVariantFragment, WeightUnitsEnum } from "../../../generated/graphql";
import { generateGoogleXmlFeed } from "./generate-google-xml-feed";

const productBase: GoogleFeedProductVariantFragment["product"] = {
  name: "Product",
  __typename: "Product",
  id: "product-id",
  category: {
    id: "cat-id",
    __typename: "Category",
    name: "Category Name",
    googleCategoryId: "1",
  },
  description: "Product description",
  seoDescription: "Seo description",
  slug: "product-slug",
  thumbnail: { __typename: "Image", url: "" },
  attributes: [],
  productType: {
    isShippingRequired: true,
  },
};

const priceBase: GoogleFeedProductVariantFragment["pricing"] = {
  __typename: "VariantPricingInfo",
  price: {
    __typename: "TaxedMoney",
    gross: {
      __typename: "Money",
      amount: 1,
      currency: "USD",
    },
  },
  priceUndiscounted: {
    __typename: "TaxedMoney",
    gross: {
      __typename: "Money",
      amount: 2,
      currency: "USD",
    },
  },
};

describe("generateGoogleXmlFeed", () => {
  it("Generates feed", () => {
    const result = generateGoogleXmlFeed({
      productStorefrontUrl: "https://example.com/p/{{ variant.product.slug }}",
      shopDescription: "Description",
      shopName: "Example",
      storefrontUrl: "https://example.com",
      titleTemplate: "{{ variant.product.name }} - {{ variant.name }}",
      productVariants: [
        {
          id: "id1",
          __typename: "ProductVariant",
          sku: "sku1",
          quantityAvailable: 1,
          pricing: priceBase,
          name: "Product variant",
          product: productBase,
          attributes: [],
          weight: {
            unit: WeightUnitsEnum.Kg,
            value: 1,
          },
        },
        {
          id: "id2",
          __typename: "ProductVariant",
          sku: "sku2",
          quantityAvailable: 0,
          pricing: priceBase,
          name: "Product variant 2",
          product: productBase,
          attributes: [],
        },
      ],
    });

    expect(result).toMatchInlineSnapshot(`
      "<?xml version=\\"1.0\\" encoding=\\"utf-8\\"?>
      <rss xmlns:g=\\"http://base.google.com/ns/1.0\\" version=\\"2.0\\">
        <channel>
          <title>Example</title>
          <link>https://example.com</link>
          <description>Description</description>
          <item>
            <g:id>sku1</g:id>
            <g:item_group_id>product-id</g:item_group_id>
            <title>Product - Product variant</title>
            <g:condition>new</g:condition>
            <g:availability>in_stock</g:availability>
            <g:product_type>Category Name</g:product_type>
            <g:shipping_weight>1 kg</g:shipping_weight>
            <g:google_product_category>1</g:google_product_category>
            <link>https://example.com/p/product-slug</link>
            <g:price>2.00 USD</g:price>
            <g:sale_price>1.00 USD</g:sale_price>
          </item>
          <item>
            <g:id>sku2</g:id>
            <g:item_group_id>product-id</g:item_group_id>
            <title>Product - Product variant 2</title>
            <g:condition>new</g:condition>
            <g:availability>out_of_stock</g:availability>
            <g:product_type>Category Name</g:product_type>
            <g:google_product_category>1</g:google_product_category>
            <link>https://example.com/p/product-slug</link>
            <g:price>2.00 USD</g:price>
            <g:sale_price>1.00 USD</g:sale_price>
          </item>
        </channel>
      </rss>"
    `);
  });

  it("Generates feed with rendered urls, when provided old style URL template", () => {
    const result = generateGoogleXmlFeed({
      productStorefrontUrl: "https://example.com/p/{productSlug}",
      shopDescription: "Description",
      shopName: "Example",
      storefrontUrl: "https://example.com",
      titleTemplate: "{{ variant.product.name }} - {{ variant.name }}",
      productVariants: [
        {
          id: "id1",
          __typename: "ProductVariant",
          sku: "sku1",
          quantityAvailable: 1,
          pricing: priceBase,
          name: "Product variant",
          product: productBase,
          attributes: [],
        },
        {
          id: "id2",
          __typename: "ProductVariant",
          sku: "sku2",
          quantityAvailable: 0,
          pricing: priceBase,
          name: "Product variant 2",
          product: productBase,
          attributes: [],
        },
      ],
    });

    expect(result).toMatchInlineSnapshot(`
      "<?xml version=\\"1.0\\" encoding=\\"utf-8\\"?>
      <rss xmlns:g=\\"http://base.google.com/ns/1.0\\" version=\\"2.0\\">
        <channel>
          <title>Example</title>
          <link>https://example.com</link>
          <description>Description</description>
          <item>
            <g:id>sku1</g:id>
            <g:item_group_id>product-id</g:item_group_id>
            <title>Product - Product variant</title>
            <g:condition>new</g:condition>
            <g:availability>in_stock</g:availability>
            <g:product_type>Category Name</g:product_type>
            <g:google_product_category>1</g:google_product_category>
            <link>https://example.com/p/product-slug</link>
            <g:price>2.00 USD</g:price>
            <g:sale_price>1.00 USD</g:sale_price>
          </item>
          <item>
            <g:id>sku2</g:id>
            <g:item_group_id>product-id</g:item_group_id>
            <title>Product - Product variant 2</title>
            <g:condition>new</g:condition>
            <g:availability>out_of_stock</g:availability>
            <g:product_type>Category Name</g:product_type>
            <g:google_product_category>1</g:google_product_category>
            <link>https://example.com/p/product-slug</link>
            <g:price>2.00 USD</g:price>
            <g:sale_price>1.00 USD</g:sale_price>
          </item>
        </channel>
      </rss>"
    `);
  });
});
