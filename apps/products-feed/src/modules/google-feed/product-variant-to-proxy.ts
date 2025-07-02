import { EditorJsPlaintextRenderer } from "@saleor/apps-shared/editor-js-plaintext-renderer";

import { renderHandlebarsTemplate } from "../handlebarsTemplates/render-handlebars-template";
import { transformTemplateFormat } from "../handlebarsTemplates/transform-template-format";
import { getMappedAttributes } from "./attribute-mapping";
import { ProductVariant } from "./fetch-product-data";
import { getRelatedMedia, getVariantMediaMap } from "./get-related-media";
import { getWeightAttributeValue } from "./get-weight-attribute-value";
import { priceMapping } from "./price-mapping";
import { productToProxy } from "./product-to-proxy";

export const productVariantToProxy = ({
  variant,
  productStorefrontUrl,
  titleTemplate,
  attributeMapping,
}: {
  variant: ProductVariant;
  titleTemplate: string;
  productStorefrontUrl: string;
  attributeMapping: any; //todo
}) => {
  const attributes = getMappedAttributes({
    attributeMapping: attributeMapping,
    variant,
  });

  const pricing = priceMapping({ pricing: variant.pricing });

  let title = "";

  try {
    title = renderHandlebarsTemplate({
      data: {
        variant,
        googleAttributes: attributes,
      },
      template: titleTemplate,
    });
  } catch {}

  let link = undefined;

  const { additionalImages, thumbnailUrl } = getRelatedMedia({
    productMedia: variant.product.media || [],
    productVariantId: variant.id,
    variantMediaMap: getVariantMediaMap({ variant }) || [],
  });

  try {
    link = renderHandlebarsTemplate({
      data: {
        variant,
        googleAttributes: attributes,
      },
      template: transformTemplateFormat({ template: productStorefrontUrl }),
    });
  } catch {}

  const weight = getWeightAttributeValue({
    isShippingRequired: variant.product.productType.isShippingRequired,
    weight: variant.weight || undefined,
  });

  return productToProxy({
    link,
    title: title || "",
    id: variant.product.id,
    slug: variant.product.slug,
    variantId: variant.id,
    sku: variant.sku || undefined,
    description: EditorJsPlaintextRenderer({ stringData: variant.product.description ?? "" }),
    availability:
      variant.quantityAvailable && variant.quantityAvailable > 0 ? "in_stock" : "out_of_stock",
    category: variant.product.category?.name || "unknown",
    googleProductCategory: variant.product.category?.googleCategoryId || "",
    imageUrl: thumbnailUrl,
    additionalImageLinks: additionalImages,
    material: attributes?.material,
    color: attributes?.color,
    brand: attributes?.brand,
    pattern: attributes?.pattern,
    size: attributes?.size,
    gtin: attributes?.gtin,
    shipping_label: attributes?.shipping_label,
    weight,
    ...pricing,
  });
};
