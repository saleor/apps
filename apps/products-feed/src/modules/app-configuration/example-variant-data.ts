import { GoogleFeedProductVariantFragment } from "../../../generated/graphql";

export const exampleVariantData: GoogleFeedProductVariantFragment = {
  id: "UHJvZHVjdFZhcmlhbnQ6MzYx", // cspell:disable-line
  name: "M",
  sku: "218223580",
  pricing: {
    price: {
      gross: {
        currency: "USD",
        amount: 45,
      },
    },
  },
  quantityAvailable: 50,
  attributes: [
    {
      attribute: {
        id: "QXR0cmlidXRlOjM4", // cspell:disable-line
      },
      values: [
        {
          value: "",
          name: "M",
        },
      ],
    },
  ],
  product: {
    id: "UHJvZHVjdDoxMzc=",
    name: "Blue Polygon Shirt",
    slug: "blue-polygon-shirt",
    description:
      '{"time": 1653425319677, "blocks": [{"id": "sMEIn2NR8s", "data": {"text": "<b>Ever have those days where you feel a bit geometric?</b> Can\'t quite shape yourself up right? Show your different sides with a Saleor styles."}, "type": "paragraph"}], "version": "2.22.2"}',
    seoDescription: "",
    productType: {
      isShippingRequired: true,
    },
    attributes: [
      {
        attribute: {
          id: "QXR0cmlidXRlOjM2", // cspell:disable-line
        },
        values: [
          {
            value: "",
            name: "Cotton",
          },
        ],
      },
    ],
    thumbnail: {
      url: "https://example.eu.saleor.cloud/media/thumbnails/products/saleor-blue-polygon-tee-front_thumbnail_256.png",
    },
    category: {
      id: "Q2F0ZWdvcnk6Mzk=", // cspell:disable-line
      name: "T-shirts",
      googleCategoryId: "42",
    },
  },
};
