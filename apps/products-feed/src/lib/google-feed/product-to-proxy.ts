import { fillUrlTemplate } from "../fill-url-template";
import { ProductEntry } from "./types";

export const productToProxy = (p: ProductEntry) => {
  const item: any[] = [
    {
      "g:id": [
        {
          "#text": p.sku || p.id,
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
      "g:google_product_category": [
        {
          "#text": p.googleProductCategory,
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
  return {
    item,
  };
};
