import { describe, expect, it } from "vitest";

import { parseProductCsvCatalog, ProductCsvValidationError } from "./product-csv";

describe("parseProductCsvCatalog", () => {
  it("keeps catalog identity stable when a later export changes", () => {
    const first = parseProductCsvCatalog(
      ["product_id,product_name,sku,price", "p-1,Gift Card,GC-10,10"].join("\n"),
      { fileName: "first.csv", sourceInstanceId: "saved-source-1" },
    )._unsafeUnwrap();
    const changed = parseProductCsvCatalog(
      ["product_id,product_name,sku,price", "p-1,Gift Card,GC-10,12"].join("\n"),
      { fileName: "later.csv", sourceInstanceId: "saved-source-1" },
    )._unsafeUnwrap();
    const otherSource = parseProductCsvCatalog(
      ["product_id,product_name,sku,price", "p-1,Gift Card,GC-10,12"].join("\n"),
      { fileName: "later.csv", sourceInstanceId: "saved-source-2" },
    )._unsafeUnwrap();

    expect(changed.source.instanceId).toBe(first.source.instanceId);
    expect(changed.channel.slug).toBe(first.channel.slug);
    expect(otherSource.channel.slug).not.toBe(first.channel.slug);
  });

  it("maps variant rows into a Saleor draft catalog", () => {
    const catalog = parseProductCsvCatalog(
      [
        "product_id,product_name,product_slug,product_description,product_type,category_path,is_published,variant_id,variant_name,sku,currency,price,product_attribute:Brand,variant_attribute:Color,variant_attribute:Size,image_url,image_alt",
        "p-1,T-Shirt,t-shirt,Soft cotton tee,Apparel,Apparel > Shirts,true,v-1,Red / M,TS-RED-M,USD,19.99,Acme,Red,M,https://example.com/t-shirt.jpg,T-Shirt",
        "p-1,T-Shirt,t-shirt,Soft cotton tee,Apparel,Apparel > Shirts,true,v-2,Black / L,TS-BLK-L,USD,21.50,Acme,Black,L,,",
      ].join("\n"),
      { fileName: "products.csv" },
    )._unsafeUnwrap();

    expect(catalog).toMatchObject({
      source: {
        connectorId: "product-csv",
        version: "v1",
        name: "Product CSV: products.csv",
      },
      channel: {
        name: "Product CSV Import: products.csv (USD)",
        slug: expect.stringMatching(/^product-csv-import-usd-[a-f0-9]{10}$/),
        currencyCode: "USD",
      },
      products: [
        {
          id: "p-1",
          name: "T-Shirt",
          slug: "t-shirt",
          description: "Soft cotton tee",
          productType: "Apparel",
          categoryId: "category:apparel/shirts",
          attributes: [{ attribute: "Brand", value: "Acme" }],
          media: [{ url: "https://example.com/t-shirt.jpg", alt: "T-Shirt" }],
          variants: [
            {
              id: "v-1",
              sku: "TS-RED-M",
              price: { currency: "USD", amount: 19.99 },
              attributes: [
                { attribute: "Color", value: "Red" },
                { attribute: "Size", value: "M" },
              ],
            },
            {
              id: "v-2",
              sku: "TS-BLK-L",
              price: { currency: "USD", amount: 21.5 },
              attributes: [
                { attribute: "Color", value: "Black" },
                { attribute: "Size", value: "L" },
              ],
            },
          ],
        },
      ],
    });
    expect(catalog.categories).toStrictEqual([
      { id: "category:apparel", name: "Apparel", slug: "apparel" },
      {
        id: "category:apparel/shirts",
        name: "Shirts",
        slug: "shirts",
        parentId: "category:apparel",
      },
    ]);
  });

  it("applies defaults and derives variant ids from product id and sku", () => {
    const catalog = parseProductCsvCatalog(
      ["product_id,product_name,sku,price", "p-1,Gift Card,GC-10,10"].join("\n"),
    )._unsafeUnwrap();

    expect(catalog.channel.currencyCode).toBe("USD");
    expect(catalog.products[0]).toMatchObject({
      productType: "Default",
      categoryId: "category:imported-products",
      isPublished: true,
      variants: [
        {
          id: "p-1:GC-10",
          sku: "GC-10",
          price: { currency: "USD", amount: 10 },
        },
      ],
    });
    expect(catalog.categories).toStrictEqual([
      {
        id: "category:imported-products",
        name: "Imported Products",
        slug: "imported-products",
      },
    ]);
  });

  it("reports row and column validation issues", () => {
    const error = parseProductCsvCatalog(
      [
        "product_id,product_name,sku,price,category_path",
        "p-1,T-Shirt,TS-1,19.99,Apparel",
        "p-1,Renamed,TS-2,nope,Apparel",
      ].join("\n"),
    )._unsafeUnwrapErr();

    expect(error).toBeInstanceOf(ProductCsvValidationError);
    expect(error.issues).toStrictEqual([
      { row: 3, column: "price", message: "Use a non-negative numeric price." },
      { row: 3, column: "product_name", message: "Keep product_name the same for product p-1." },
    ]);
  });

  it("rejects a variant id reused by another product", () => {
    const error = parseProductCsvCatalog(
      [
        "product_id,product_name,variant_id,price",
        "p-1,First Product,v-1,10",
        "p-2,Second Product,v-1,20",
      ].join("\n"),
    )._unsafeUnwrapErr();

    expect(error).toBeInstanceOf(ProductCsvValidationError);
    expect(error.issues).toContainEqual({
      row: 3,
      column: "variant_id",
      message: "Variant v-1 is duplicated.",
    });
  });

  it("rejects uploads above the product limit during preview parsing", () => {
    const rows = Array.from(
      { length: 1_001 },
      (_, index) => `p-${index},Product ${index},sku-${index},10`,
    );

    expect(
      parseProductCsvCatalog(
        ["product_id,product_name,sku,price", ...rows].join("\n"),
      )._unsafeUnwrapErr().message,
    ).toContain("CSV has 1 validation error");
  });
});
