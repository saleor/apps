import { afterEach, describe, expect, it, vi } from "vitest";

import { importDraftCatalogToSaleor } from "./import-catalog";
import { createSaleorImportClient } from "./saleor-import-client";
import { type SaleorDraftCatalog } from "./types";

const response = (data: unknown) =>
  new Response(JSON.stringify({ data }), { headers: { "content-type": "application/json" } });

const client = () =>
  createSaleorImportClient({
    saleorApiUrl: "https://saleor.example/graphql/",
    getToken: () => "token",
  });

const baseCatalog = (categoryId: string, categories: SaleorDraftCatalog["categories"]) => ({
  source: {
    connectorId: "product-csv",
    version: "v1",
    name: "Product CSV",
    instanceId: "upload-1",
  },
  channel: {
    name: "Product CSV Import",
    slug: "product-csv-import",
    currencyCode: "USD",
  },
  categories,
  products: [
    {
      id: "p-1",
      name: "Test product",
      productType: "Default",
      categoryId,
      isAvailableForPurchase: false,
      variants: [
        {
          id: "v-1",
          sku: "SKU-1",
          price: {
            currency: "USD",
            amount: 10,
          },
        },
      ],
    },
  ],
});

describe("importDraftCatalogToSaleor categories", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates and assigns the default import category", async () => {
    let productBulkCreateVariables: Record<string, unknown> | undefined;
    let productLookupVariables: Record<string, unknown> | undefined;
    const fetch = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body)) as {
        query: string;
        variables?: Record<string, unknown>;
      };

      if (body.query.includes("ExistingImportChannel")) {
        return response({ channels: [] });
      }

      if (body.query.includes("CreateImportChannel")) {
        return response({ channelCreate: { channel: { id: "channel-id" }, errors: [] } });
      }

      if (body.query.includes("ProductTypeBySlug")) {
        return response({ productTypes: { edges: [] } });
      }

      if (body.query.includes("CreateImportProductType")) {
        return response({
          productTypeCreate: { productType: { id: "product-type-id" }, errors: [] },
        });
      }

      if (body.query.includes("CategoryBySlug")) {
        return response({ categories: { edges: [] } });
      }

      if (body.query.includes("CreateImportCategory")) {
        return response({ categoryCreate: { category: { id: "category-id" }, errors: [] } });
      }

      if (body.query.includes("ProductByExternalReference")) {
        productLookupVariables = body.variables;

        return response({ product: null });
      }

      if (body.query.includes("BulkCreateImportedProducts")) {
        productBulkCreateVariables = body.variables;

        return response({
          productBulkCreate: {
            count: 1,
            errors: [],
            results: [
              { product: { id: "product-id", productVariants: { totalCount: 1 } }, errors: [] },
            ],
          },
        });
      }

      throw new Error(`Unexpected query: ${body.query}`);
    });

    vi.stubGlobal("fetch", fetch);

    await importDraftCatalogToSaleor(
      client(),
      baseCatalog("category:imported-products", [
        { id: "category:imported-products", name: "Imported Products", slug: "imported-products" },
      ]),
    );

    expect(productBulkCreateVariables).toMatchObject({
      products: [
        {
          category: "category-id",
          channelListings: [{ isAvailableForPurchase: false }],
          externalReference: expect.stringMatching(/^aboard:product:[a-f0-9]{20}:p-1$/),
          privateMetadata: expect.arrayContaining([
            { key: "aboard.sourceInstanceId", value: "upload-1" },
          ]),
          variants: [
            {
              externalReference: expect.stringMatching(/^aboard:variant:[a-f0-9]{20}:v-1$/),
            },
          ],
        },
      ],
    });
    expect(productLookupVariables).toMatchObject({
      externalReference: expect.stringMatching(/^aboard:product:[a-f0-9]{20}:p-1$/),
    });
  });

  it("rejects a scoped reference owned by another source", async () => {
    const fetch = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body)) as { query: string };

      if (body.query.includes("ExistingImportChannel")) {
        return response({ channels: [] });
      }

      if (body.query.includes("CreateImportChannel")) {
        return response({ channelCreate: { channel: { id: "channel-id" }, errors: [] } });
      }

      if (body.query.includes("ProductTypeBySlug")) {
        return response({ productTypes: { edges: [] } });
      }

      if (body.query.includes("CreateImportProductType")) {
        return response({
          productTypeCreate: { productType: { id: "product-type-id" }, errors: [] },
        });
      }

      if (body.query.includes("ProductByExternalReference")) {
        return response({
          product: {
            id: "foreign-product-id",
            managed: null,
            connectorId: null,
            sourceInstanceId: null,
          },
        });
      }

      throw new Error(`Unexpected query: ${body.query}`);
    });

    vi.stubGlobal("fetch", fetch);

    expect(
      (await importDraftCatalogToSaleor(client(), baseCatalog("", [])))._unsafeUnwrapErr().message,
    ).toContain("not managed by this Aboard source");
  });

  it("adds newly encountered attributes to a reused product type", async () => {
    let updateVariables: Record<string, unknown> | undefined;
    let productBulkCreateVariables: Record<string, unknown> | undefined;
    const fetch = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body)) as {
        query: string;
        variables?: Record<string, unknown>;
      };

      if (body.query.includes("ExistingImportChannel")) {
        return response({ channels: [] });
      }

      if (body.query.includes("CreateImportChannel")) {
        return response({ channelCreate: { channel: { id: "channel-id" }, errors: [] } });
      }

      if (body.query.includes("AttributeByExternalReference")) {
        return response({ attribute: null });
      }

      if (body.query.includes("CreateImportAttribute")) {
        return response({ attributeCreate: { attribute: { id: "brand-id" }, errors: [] } });
      }

      if (body.query.includes("ProductTypeBySlug")) {
        return response({
          productTypes: {
            edges: [
              {
                node: {
                  id: "product-type-id",
                  productAttributes: [{ id: "existing-id" }],
                  assignedVariantAttributes: [],
                },
              },
            ],
          },
        });
      }

      if (body.query.includes("UpdateImportProductType")) {
        updateVariables = body.variables;

        return response({
          productTypeUpdate: { productType: { id: "product-type-id" }, errors: [] },
        });
      }

      if (body.query.includes("ProductByExternalReference")) {
        return response({ product: null });
      }

      if (body.query.includes("BulkCreateImportedProducts")) {
        productBulkCreateVariables = body.variables;

        return response({
          productBulkCreate: {
            count: 1,
            errors: [],
            results: [
              { product: { id: "product-id", productVariants: { totalCount: 1 } }, errors: [] },
            ],
          },
        });
      }

      throw new Error(`Unexpected query: ${body.query}`);
    });

    vi.stubGlobal("fetch", fetch);

    const base = baseCatalog("", []);
    const catalog = {
      ...base,
      products: [
        {
          ...base.products[0],
          attributes: [{ attribute: "Brand", value: "Saleor" }],
        },
      ],
    };

    const result = (await importDraftCatalogToSaleor(client(), catalog))._unsafeUnwrap();

    expect(updateVariables).toStrictEqual({
      id: "product-type-id",
      input: {
        productAttributes: ["existing-id", "brand-id"],
        variantAttributes: [],
      },
    });
    expect(productBulkCreateVariables).toMatchObject({
      products: [{ attributes: [{ id: "brand-id", dropdown: { value: "Saleor" } }] }],
    });
    expect(result.createdVariants).toBe(1);
  });

  it("reuses an existing category path before creating missing children", async () => {
    const createdCategories: Array<Record<string, unknown>> = [];
    let productBulkCreateVariables: Record<string, unknown> | undefined;
    const fetch = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body)) as {
        query: string;
        variables?: Record<string, unknown>;
      };

      if (body.query.includes("ExistingImportChannel")) {
        return response({ channels: [] });
      }

      if (body.query.includes("CreateImportChannel")) {
        return response({ channelCreate: { channel: { id: "channel-id" }, errors: [] } });
      }

      if (body.query.includes("ProductTypeBySlug")) {
        return response({ productTypes: { edges: [] } });
      }

      if (body.query.includes("CreateImportProductType")) {
        return response({
          productTypeCreate: { productType: { id: "product-type-id" }, errors: [] },
        });
      }

      if (body.query.includes("CategoryBySlug") && body.variables?.slug === "apparel") {
        return response({
          categories: {
            edges: [
              {
                node: {
                  id: "existing-apparel-id",
                  slug: "apparel",
                  privateMetafield: null,
                  parent: null,
                },
              },
            ],
          },
        });
      }

      if (body.query.includes("CategoryBySlug")) {
        return response({ categories: { edges: [] } });
      }

      if (body.query.includes("CreateImportCategory")) {
        createdCategories.push(body.variables ?? {});

        return response({ categoryCreate: { category: { id: "created-shirts-id" }, errors: [] } });
      }

      if (body.query.includes("ProductByExternalReference")) {
        return response({ product: null });
      }

      if (body.query.includes("BulkCreateImportedProducts")) {
        productBulkCreateVariables = body.variables;

        return response({
          productBulkCreate: {
            count: 1,
            errors: [],
            results: [
              { product: { id: "product-id", productVariants: { totalCount: 1 } }, errors: [] },
            ],
          },
        });
      }

      throw new Error(`Unexpected query: ${body.query}`);
    });

    vi.stubGlobal("fetch", fetch);

    await importDraftCatalogToSaleor(
      client(),
      baseCatalog("category:apparel/shirts", [
        { id: "category:apparel", name: "Apparel", slug: "apparel" },
        {
          id: "category:apparel/shirts",
          name: "Shirts",
          slug: "shirts",
          parentId: "category:apparel",
        },
      ]),
    );

    expect(createdCategories).toMatchObject([
      {
        parent: "existing-apparel-id",
        input: {
          slug: "shirts",
        },
      },
    ]);
    expect(productBulkCreateVariables).toMatchObject({
      products: [
        {
          category: "created-shirts-id",
        },
      ],
    });
  });

  it("returns exact retry details when every product row is rejected", async () => {
    const fetch = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body)) as {
        query: string;
        variables?: Record<string, unknown>;
      };

      if (body.query.includes("ExistingImportChannel")) {
        return response({ channels: [] });
      }

      if (body.query.includes("CreateImportChannel")) {
        return response({ channelCreate: { channel: { id: "channel-id" }, errors: [] } });
      }

      if (body.query.includes("ProductTypeBySlug")) {
        return response({ productTypes: { edges: [] } });
      }

      if (body.query.includes("CreateImportProductType")) {
        return response({
          productTypeCreate: { productType: { id: "product-type-id" }, errors: [] },
        });
      }

      if (body.query.includes("ProductByExternalReference")) {
        return response({ product: null });
      }

      if (body.query.includes("BulkCreateImportedProducts")) {
        return response({
          productBulkCreate: {
            count: 0,
            errors: [],
            results: [
              {
                product: null,
                errors: [{ path: "products.0.media.0.mediaUrl", message: "Could not fetch media" }],
              },
            ],
          },
        });
      }

      throw new Error(`Unexpected query: ${body.query}`);
    });

    vi.stubGlobal("fetch", fetch);

    const result = (
      await importDraftCatalogToSaleor(client(), {
        ...baseCatalog("", []),
        products: [
          {
            ...baseCatalog("", []).products[0],
            media: [{ url: "https://cdn.example.com/missing.jpg" }],
          },
        ],
      })
    )._unsafeUnwrap();

    expect(result).toMatchObject({
      createdProducts: 0,
      errors: [expect.stringContaining("Could not fetch media")],
      failedProducts: [
        {
          sourceId: "p-1",
          name: "Test product",
          error: expect.stringContaining("Could not fetch media"),
        },
      ],
    });
  });

  it("rejects oversized catalogs before the first Saleor request", async () => {
    const fetch = vi.fn();
    const base = baseCatalog("", []);

    vi.stubGlobal("fetch", fetch);

    expect(
      (
        await importDraftCatalogToSaleor(client(), {
          ...base,
          products: Array.from({ length: 1_001 }, (_, index) => ({
            ...base.products[0],
            id: `product-${index}`,
          })),
        })
      )._unsafeUnwrapErr().message,
    ).toContain("limited to 1000 products");
    expect(fetch).not.toHaveBeenCalled();
  });
});
