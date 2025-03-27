import { describe, expect, it } from "vitest";

import { shopDetailsToProxy } from "./shop-details-to-proxy";

describe("shopDetailsToProxy", () => {
  it("Renders title and storefront url", () => {
    expect(
      shopDetailsToProxy({
        description: "Shop description",
        storefrontUrl: "https://example.com",
        title: "Shop title",
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "title": [
            {
              "#text": "Shop title",
            },
          ],
        },
        {
          "link": [
            {
              "#text": "https://example.com",
            },
          ],
        },
        {
          "description": [
            {
              "#text": "Shop description",
            },
          ],
        },
      ]
    `);
  });

  it("Renders without description if not provided", () => {
    expect(
      shopDetailsToProxy({
        storefrontUrl: "https://example.com",
        title: "Shop title",
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "title": [
            {
              "#text": "Shop title",
            },
          ],
        },
        {
          "link": [
            {
              "#text": "https://example.com",
            },
          ],
        },
      ]
    `);
  });
});
