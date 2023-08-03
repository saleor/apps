import { fillUrlTemplate } from "../feed-url/fill-url-template";
import { GoogleProxyItem, ProductEntry } from "./types";

export const productToProxy = (p: ProductEntry) => {
  const item: GoogleProxyItem[] = [
    {
      "g:id": [
        {
          "#text": p.sku || p.variantId,
        },
      ],
    },
    {
      "g:item_group_id": [
        {
          "#text": p.id,
        },
      ],
    },
    {
      title: [
        {
          "#text": p.name,
        },
      ],
    },
    {
      "g:condition": [
        {
          "#text": p.condition || "new",
        },
      ],
    },

    {
      "g:availability": [
        {
          "#text": p.availability,
        },
      ],
    },
    {
      "g:product_type": [
        {
          "#text": p.category,
        },
      ],
    },
  ];

  if (p.description?.length) {
    item.push({
      "g:description": [
        {
          "#text": p.description,
        },
      ],
    });
  }

  /**
   * This field is optional and Google automatically match category if not has been provided
   *
   * https://support.google.com/merchants/answer/6324436?hl=en
   */

  if (p.googleProductCategory?.length) {
    item.push({
      "g:google_product_category": [
        {
          "#text": p.googleProductCategory,
        },
      ],
    });
  }

  if (p.storefrontUrlTemplate?.length) {
    item.push({
      link: [
        {
          "#text": fillUrlTemplate({
            urlTemplate: p.storefrontUrlTemplate,
            productId: p.id,
            productSlug: p.slug,
            variantId: p.variantId,
          }),
        },
      ],
    });
  }

  if (p.imageUrl?.length) {
    item.push({
      "g:image_link": [
        {
          "#text": p.imageUrl,
        },
      ],
    });
  }

  if (p.price?.length) {
    item.push({
      "g:price": [
        {
          "#text": p.price,
        },
      ],
    });
  }

  if (p.material) {
    item.push({
      "g:material": [
        {
          "#text": p.material,
        },
      ],
    });
  }

  if (p.brand) {
    item.push({
      "g:brand": [
        {
          "#text": p.brand,
        },
      ],
    });
  }

  if (p.color) {
    item.push({
      "g:color": [
        {
          "#text": p.color,
        },
      ],
    });
  }

  if (p.size) {
    item.push({
      "g:size": [
        {
          "#text": p.size,
        },
      ],
    });
  }

  if (p.pattern) {
    item.push({
      "g:pattern": [
        {
          "#text": p.pattern,
        },
      ],
    });
  }

  return {
    item,
  };
};
