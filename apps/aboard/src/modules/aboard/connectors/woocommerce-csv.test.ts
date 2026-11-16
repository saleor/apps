import { describe, expect, it } from "vitest";

import { parseWoocommerceCsvCatalog, WoocommerceCsvValidationError } from "./woocommerce-csv";

const headers = [
  "ID",
  "Type",
  "SKU",
  "Name",
  "Published",
  "Short description",
  "Description",
  "Sale price",
  "Regular price",
  "Categories",
  "Tags",
  "Images",
  "Parent",
  "External URL",
  "Attribute 1 name",
  "Attribute 1 value(s)",
  "Attribute 1 visible",
  "Attribute 1 global",
  "Attribute 2 name",
  "Attribute 2 value(s)",
  "Attribute 2 visible",
  "Attribute 2 global",
].join(",");
const wooOptions = { currencyCode: "USD", decimalSeparator: "." as const };

describe("parseWoocommerceCsvCatalog", () => {
  it("maps WooCommerce simple and variation rows into a Saleor draft catalog", () => {
    const catalog = parseWoocommerceCsvCatalog(
      [
        headers,
        '100,variable,woo-shirt,Shirt,1,Short,Long,,,"Clothing > Shirts",summer,"https://example.com/shirt.jpg",,,Color,"Blue, Red",1,1,Size,"S, M",1,1',
        "101,variation,woo-shirt-blue,Shirt - Blue,1,,Variant,,19.99,,,https://example.com/shirt-blue.jpg,woo-shirt,,Color,Blue,,1,Size,S,,1",
        "102,variation,woo-shirt-red,Shirt - Red,1,,Variant,15.99,19.99,,,https://example.com/shirt-red.jpg,woo-shirt,,Color,Red,,1,Size,M,,1",
        '200,simple,woo-mug,Mug,0,Short mug,Long mug,,12.50,Home,drinkware,https://example.com/mug.jpg,,,Color,White,1,1,Material,"Ceramic, Stoneware",1,0',
      ].join("\n"),
      wooOptions,
      { fileName: "woo.csv" },
    )._unsafeUnwrap();

    expect(catalog).toMatchObject({
      source: {
        connectorId: "woocommerce-csv",
        version: "woocommerce-10.8.1",
        name: "WooCommerce CSV: woo.csv",
      },
      channel: {
        name: "WooCommerce CSV Import: woo.csv (USD)",
        slug: expect.stringMatching(/^woocommerce-csv-import-usd-[a-f0-9]{10}$/),
        currencyCode: "USD",
      },
      products: [
        {
          id: "woocommerce-csv:woo-shirt",
          name: "Shirt",
          description: "Long",
          productType: "WooCommerce Product",
          categoryId: "woocommerce-category:clothing/shirts",
          isPublished: true,
          metadata: [
            { attribute: "woocommerce.id", value: "100" },
            { attribute: "woocommerce.sku", value: "woo-shirt" },
            { attribute: "woocommerce.type", value: "variable" },
            { attribute: "woocommerce.tags", value: "summer" },
            { attribute: "woocommerce.attribute.color.visible", value: "true" },
            { attribute: "woocommerce.attribute.color.global", value: "true" },
            { attribute: "woocommerce.attribute.size.visible", value: "true" },
            { attribute: "woocommerce.attribute.size.global", value: "true" },
          ],
          media: [
            { url: "https://example.com/shirt.jpg" },
            { url: "https://example.com/shirt-blue.jpg" },
            { url: "https://example.com/shirt-red.jpg" },
          ],
          variants: [
            {
              id: "woocommerce-csv:woo-shirt-blue",
              name: "Shirt - Blue",
              sku: "woo-shirt-blue",
              attributes: [
                { attribute: "Color", value: "Blue" },
                { attribute: "Size", value: "S" },
              ],
              price: { currency: "USD", amount: 19.99 },
            },
            {
              id: "woocommerce-csv:woo-shirt-red",
              name: "Shirt - Red",
              sku: "woo-shirt-red",
              attributes: [
                { attribute: "Color", value: "Red" },
                { attribute: "Size", value: "M" },
              ],
              price: { currency: "USD", amount: 15.99 },
            },
          ],
        },
        {
          id: "woocommerce-csv:woo-mug",
          name: "Mug",
          isPublished: false,
          attributes: [
            { attribute: "Color", value: "White" },
            { attribute: "Material", value: "Ceramic, Stoneware" },
          ],
          variants: [
            {
              id: "woocommerce-csv:woo-mug",
              sku: "woo-mug",
              attributes: [],
              price: { currency: "USD", amount: 12.5 },
            },
          ],
        },
      ],
    });
    expect(catalog.categories).toStrictEqual([
      { id: "woocommerce-category:clothing", name: "Clothing", slug: "clothing" },
      {
        id: "woocommerce-category:clothing/shirts",
        name: "Shirts",
        slug: "shirts",
        parentId: "woocommerce-category:clothing",
      },
      { id: "woocommerce-category:home", name: "Home", slug: "home" },
    ]);
  });

  it("reports row and column validation issues", () => {
    const error = parseWoocommerceCsvCatalog(
      [
        headers,
        "100,variable,woo-shirt,Shirt,1,Short,Long,,,,,,,,Color,Blue,1,1,,,,",
        "101,variation,woo-shirt-blue,Shirt - Blue,yes,,Variant,,nope,,,https://example.com/shirt-blue.jpg,missing-parent,,Color,Blue,,1,,,,",
      ].join("\n"),
      wooOptions,
    )._unsafeUnwrapErr();

    expect(error).toBeInstanceOf(WoocommerceCsvValidationError);
    expect(error.issues).toStrictEqual([
      {
        row: 3,
        column: "Parent",
        message: "Set Parent to a variable product SKU or id:ID from this CSV.",
      },
      {
        row: 2,
        column: "Type",
        message: "WooCommerce product woo-shirt has no importable priced simple or variation rows.",
      },
    ]);
  });

  it("uses the selected currency and decimal separator", () => {
    const catalog = parseWoocommerceCsvCatalog(
      [
        "ID,Type,SKU,Name,Published,Sale price,Regular price",
        '200,simple,woo-mug,Mug,1,,"12,50"',
      ].join("\n"),
      { currencyCode: "EUR", decimalSeparator: "," },
      { fileName: "woo.csv" },
    )._unsafeUnwrap();

    expect(catalog.channel.currencyCode).toBe("EUR");
    expect(catalog.products[0]?.variants?.[0]?.price).toStrictEqual({
      currency: "EUR",
      amount: 12.5,
    });
  });

  it("blocks external, virtual, and downloadable products", () => {
    expect(
      parseWoocommerceCsvCatalog(
        [
          "ID,Type,SKU,Name,Published,Regular price,Virtual,Downloadable,Downloads,External URL",
          "1,external,external-item,External item,1,10,0,0,,https://example.com/buy",
          "2,simple,virtual-item,Virtual item,1,10,1,0,,",
          '3,simple,download-item,Download item,1,10,0,1,"file.zip::https://example.com/file.zip",',
        ].join("\n"),
        wooOptions,
      )._unsafeUnwrapErr().message,
    ).toContain("WooCommerce CSV has 3 validation errors");
  });
});
