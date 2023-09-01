import { describe, expect, it } from "vitest";
import { getRelatedMedia } from "./get-related-media";
import { ProductMediaType } from "../../../generated/graphql";

describe("getRelatedMedia", () => {
  it("Returns thumbnail, when set to the product", () => {
    expect(
      getRelatedMedia({
        productMedia: [
          {
            id: "id-1",
            type: ProductMediaType.Image,
            url: "http://example.com/1.jpg",
          },
        ],
        productVariantId: "variant-1",
        variantMediaMap: {},
      }),
    ).toStrictEqual({
      thumbnailUrl: "http://example.com/1.jpg",
      additionalImages: [],
    });
  });
  it("Returns undefined as thumbnail URL, when product has no media", () => {
    expect(
      getRelatedMedia({
        productMedia: [],
        productVariantId: "variant-1",
        variantMediaMap: {},
      }),
    ).toStrictEqual({
      thumbnailUrl: undefined,
      additionalImages: [],
    });
  });
  it("Returns thumbnail and additional images, when all images are set to the product", () => {
    expect(
      getRelatedMedia({
        productMedia: [
          {
            id: "id-1",
            type: ProductMediaType.Image,
            url: "http://example.com/1.jpg",
          },
          {
            id: "id-2",
            type: ProductMediaType.Image,
            url: "http://example.com/2.jpg",
          },
          {
            id: "id-3",
            type: ProductMediaType.Image,
            url: "http://example.com/3.jpg",
          },
        ],
        productVariantId: "variant-1",
        variantMediaMap: {},
      }),
    ).toStrictEqual({
      thumbnailUrl: "http://example.com/1.jpg",
      additionalImages: ["http://example.com/2.jpg", "http://example.com/3.jpg"],
    });
  });
  it("Returns filtered list of images, when some of the images are assigned to the other variants", () => {
    expect(
      getRelatedMedia({
        productMedia: [
          {
            id: "id-1",
            type: ProductMediaType.Image,
            url: "http://example.com/1.jpg",
          },
          {
            id: "id-other-variant",
            type: ProductMediaType.Image,
            url: "http://example.com/2-other-variant.jpg",
          },
          {
            id: "id-3",
            type: ProductMediaType.Image,
            url: "http://example.com/3.jpg",
          },
        ],
        productVariantId: "variant-1",
        variantMediaMap: {
          "variant-2": [
            {
              id: "id-other-variant",
              type: ProductMediaType.Image,
              url: "http://example.com/2-other-variant.jpg",
            },
          ],
        },
      }),
    ).toStrictEqual({
      thumbnailUrl: "http://example.com/1.jpg",
      additionalImages: ["http://example.com/3.jpg"],
    });
  });
  it("Returns only URLs to photos, when product has both Image and Video media types", () => {
    expect(
      getRelatedMedia({
        productMedia: [
          {
            id: "id-1",
            type: ProductMediaType.Image,
            url: "http://example.com/image-1.jpg",
          },
          {
            id: "id-2",
            type: ProductMediaType.Video,
            url: "http://example.com/video-2.mp4",
          },
          {
            id: "id-3",
            type: ProductMediaType.Image,
            url: "http://example.com/image-3.jpg",
          },
        ],
        productVariantId: "variant-1",
        variantMediaMap: {},
      }),
    ).toStrictEqual({
      thumbnailUrl: "http://example.com/image-1.jpg",
      additionalImages: ["http://example.com/image-3.jpg"],
    });
  });
});
