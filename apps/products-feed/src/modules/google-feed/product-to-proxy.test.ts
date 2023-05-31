import { describe, it, expect } from "vitest";
import { productToProxy } from "./product-to-proxy";

describe("productToProxy", () => {
  it("Falls back product ID, if product SKU doesnt exist", () => {
    const result = productToProxy({
      slug: "slug",
      availability: "in_stock",
      category: "1",
      condition: "new",
      id: "id",
      name: "Name",
      variantId: "variant-id",
    });

    expect(result.item).toEqual(
      expect.arrayContaining([
        {
          "g:id": expect.arrayContaining([{ "#text": "id" }]),
        },
      ])
    );
  });

  it('Falls back g:condition to "new" if product condition doesnt exist', () => {
    const result = productToProxy({
      slug: "slug",
      availability: "in_stock",
      category: "1",
      /*
       * Missing condition field:
       * condition: "new",
       */
      id: "id",
      name: "Name",
      variantId: "variant-id",
    });

    expect(result.item).toEqual(
      expect.arrayContaining([
        {
          "g:condition": expect.arrayContaining([{ "#text": "new" }]),
        },
      ])
    );
  });

  it("Fills product description if exist", () => {
    const result = productToProxy({
      slug: "slug",
      availability: "in_stock",
      category: "1",
      condition: "new",
      id: "id",
      name: "Name",
      variantId: "variant-id",
      description: "Product description",
    });

    expect(result.item).toEqual(
      expect.arrayContaining([
        {
          "g:description": expect.arrayContaining([{ "#text": "Product description" }]),
        },
      ])
    );
  });

  it("Fills google product category if exist", () => {
    const result = productToProxy({
      slug: "slug",
      availability: "in_stock",
      category: "1",
      condition: "new",
      googleProductCategory: "1",
      id: "id",
      name: "Name",
      variantId: "variant-id",
    });

    expect(result.item).toEqual(
      expect.arrayContaining([
        {
          "g:google_product_category": expect.arrayContaining([{ "#text": "1" }]),
        },
      ])
    );
  });

  it("Adds link section with filled product url template", () => {
    const result = productToProxy({
      slug: "slug",
      availability: "in_stock",
      category: "1",
      condition: "new",
      googleProductCategory: "1",
      id: "id",
      name: "Name",
      variantId: "variant-id",
      storefrontUrlTemplate: "https://example.com/p/{productSlug}/{productId}/{variantId}",
    });

    expect(result.item).toEqual(
      expect.arrayContaining([
        {
          link: expect.arrayContaining([
            {
              "#text": "https://example.com/p/slug/id/variant-id",
            },
          ]),
        },
      ])
    );
  });

  it("Adds g:image_link if imageUrl exist in product", () => {
    const result = productToProxy({
      slug: "slug",
      availability: "in_stock",
      category: "1",
      condition: "new",
      googleProductCategory: "1",
      id: "id",
      name: "Name",
      variantId: "variant-id",
      imageUrl: "https://image.example.com",
    });

    expect(result.item).toEqual(
      expect.arrayContaining([
        {
          "g:image_link": expect.arrayContaining([{ "#text": "https://image.example.com" }]),
        },
      ])
    );
  });

  it("Adds g:price if product price exists", () => {
    const result = productToProxy({
      slug: "slug",
      availability: "in_stock",
      category: "1",
      condition: "new",
      googleProductCategory: "1",
      id: "id",
      name: "Name",
      variantId: "variant-id",
      imageUrl: "https://image.example.com",
      price: "50.00 USD",
    });

    expect(result.item).toEqual(
      expect.arrayContaining([
        {
          "g:price": expect.arrayContaining([{ "#text": "50.00 USD" }]),
        },
      ])
    );
  });
});
