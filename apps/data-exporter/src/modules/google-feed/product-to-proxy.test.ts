import { describe, it, expect } from "vitest";
import { productToProxy } from "./product-to-proxy";

describe("productToProxy", () => {
  it("Falls back product ID, if product SKU doesn't exist", () => {
    const result = productToProxy({
      slug: "slug",
      availability: "in_stock",
      category: "1",
      condition: "new",
      id: "product-id",
      title: "title",
      variantId: "variant-id",
      additionalImageLinks: [],
    });

    expect(result.item).toEqual(
      expect.arrayContaining([
        {
          "g:id": expect.arrayContaining([{ "#text": "variant-id" }]),
        },
      ]),
    );
  });

  it('Falls back g:condition to "new" if product condition doesn\'t exist', () => {
    const result = productToProxy({
      slug: "slug",
      availability: "in_stock",
      category: "1",
      /*
       * Missing condition field:
       * condition: "new",
       */
      id: "product-id",
      title: "title",
      variantId: "variant-id",
      additionalImageLinks: [],
    });

    expect(result.item).toEqual(
      expect.arrayContaining([
        {
          "g:condition": expect.arrayContaining([{ "#text": "new" }]),
        },
      ]),
    );
  });

  it("Fills product description if exist", () => {
    const result = productToProxy({
      slug: "slug",
      availability: "in_stock",
      category: "1",
      condition: "new",
      id: "product-id",
      title: "title",
      variantId: "variant-id",
      description: "Product description",
      additionalImageLinks: [],
    });

    expect(result.item).toEqual(
      expect.arrayContaining([
        {
          "g:description": expect.arrayContaining([{ "#text": "Product description" }]),
        },
      ]),
    );
  });

  it("Fills google product category if exist", () => {
    const result = productToProxy({
      slug: "slug",
      availability: "in_stock",
      category: "1",
      condition: "new",
      googleProductCategory: "1",
      id: "product-id",
      title: "title",
      variantId: "variant-id",
      additionalImageLinks: [],
    });

    expect(result.item).toEqual(
      expect.arrayContaining([
        {
          "g:google_product_category": expect.arrayContaining([{ "#text": "1" }]),
        },
      ]),
    );
  });

  it("Adds link section, when url is provided", () => {
    const result = productToProxy({
      slug: "slug",
      availability: "in_stock",
      category: "1",
      condition: "new",
      googleProductCategory: "1",
      id: "product-id",
      title: "title",
      variantId: "variant-id",
      link: "https://example.com/p/product-id",
      additionalImageLinks: [],
    });

    expect(result.item).toEqual(
      expect.arrayContaining([
        {
          link: expect.arrayContaining([
            {
              "#text": "https://example.com/p/product-id",
            },
          ]),
        },
      ]),
    );
  });

  it("Adds g:image_link if imageUrl exist in product", () => {
    const result = productToProxy({
      slug: "slug",
      availability: "in_stock",
      category: "1",
      condition: "new",
      googleProductCategory: "1",
      id: "product-id",
      title: "title",
      variantId: "variant-id",
      imageUrl: "https://image.example.com",
      additionalImageLinks: [],
    });

    expect(result.item).toEqual(
      expect.arrayContaining([
        {
          "g:image_link": expect.arrayContaining([{ "#text": "https://image.example.com" }]),
        },
      ]),
    );
  });

  it("Adds g:price if product price exists", () => {
    const result = productToProxy({
      slug: "slug",
      availability: "in_stock",
      category: "1",
      condition: "new",
      googleProductCategory: "1",
      id: "product-id",
      title: "title",
      variantId: "variant-id",
      imageUrl: "https://image.example.com",
      price: "50.00 USD",
      additionalImageLinks: [],
    });

    expect(result.item).toEqual(
      expect.arrayContaining([
        {
          "g:price": expect.arrayContaining([{ "#text": "50.00 USD" }]),
        },
      ]),
    );
  });
});
