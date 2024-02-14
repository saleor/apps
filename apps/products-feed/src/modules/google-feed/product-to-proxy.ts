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
          "#text": p.title,
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

  if (p.weight) {
    item.push({
      "g:shipping_weight": [
        {
          "#text": p.weight,
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

  if (p.link?.length) {
    item.push({
      link: [
        {
          "#text": p.link,
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

  for (const additional_image of p.additionalImageLinks) {
    item.push({
      "g:additional_image_link": [
        {
          "#text": additional_image,
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

  if (p.salePrice?.length) {
    item.push({
      "g:sale_price": [
        {
          "#text": p.salePrice,
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

  if (p.gtin) {
    item.push({
      "g:gtin": [
        {
          "#text": p.gtin,
        },
      ],
    });
  }

  return {
    item,
  };
};
