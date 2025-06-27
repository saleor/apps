import { EditorJsPlaintextRenderer } from "@saleor/apps-shared/editor-js-plaintext-renderer";
import { XMLBuilder } from "fast-xml-parser";

import { xmlBuilder } from "../../lib/xml";
import { createLogger } from "../../logger";
import { RootConfig } from "../app-configuration/app-config";
import { renderHandlebarsTemplate } from "../handlebarsTemplates/render-handlebars-template";
import { transformTemplateFormat } from "../handlebarsTemplates/transform-template-format";
import { getMappedAttributes } from "./attribute-mapping";
import { ProductVariant } from "./fetch-product-data";
import { getRelatedMedia, getVariantMediaMap } from "./get-related-media";
import { getWeightAttributeValue } from "./get-weight-attribute-value";
import { priceMapping } from "./price-mapping";
import { productToProxy } from "./product-to-proxy";
import { shopDetailsToProxy } from "./shop-details-to-proxy";

interface GenerateGoogleXmlFeedArgs {
  productVariants: ProductVariant[];
  storefrontUrl: string;
  productStorefrontUrl: string;
  titleTemplate: string;
  attributeMapping?: RootConfig["attributeMapping"];
  shopName: string;
  shopDescription?: string;
}

const logger = createLogger("generateGoogleXmlFeed");

// todo make it frontend-side
export const generateGoogleXmlFeed = ({
  attributeMapping,
  productVariants,
  storefrontUrl,
  titleTemplate,
  productStorefrontUrl,
  shopName,
  shopDescription,
}: GenerateGoogleXmlFeedArgs) => {
  logger.debug("Generating Google XML feed");

  const items = productVariants.map((variant) => {
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
  });

  logger.trace("Product data mapped to proxy format", {
    first: productVariants[0],
    totalLength: productVariants.length,
  });

  const channelData = shopDetailsToProxy({
    title: shopName,
    description: shopDescription,
    storefrontUrl,
  });

  logger.trace("Coverted shop details to proxy format");

  const data = [
    {
      "?xml": [
        {
          "#text": "",
        },
      ],
      ":@": {
        "@_version": "1.0",
        "@_encoding": "utf-8",
      },
    },

    {
      rss: [
        {
          // @ts-ignore - This is "just an object" that is transformed to XML. I don't see good way to type it, other than "any"
          channel: channelData.concat(items),
        },
      ],
      ":@": {
        "@_xmlns:g": "http://base.google.com/ns/1.0",
        "@_version": "2.0",
      },
    },
  ];

  logger.debug("Feed generated. Returning formatted XML");

  return xmlBuilder.build(data);
};
