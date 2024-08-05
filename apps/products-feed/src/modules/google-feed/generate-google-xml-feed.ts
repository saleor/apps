import { XMLBuilder } from "fast-xml-parser";
import { GoogleFeedProductFragment } from "../../../generated/graphql";
import { productToProxy } from "./product-to-proxy";
import { shopDetailsToProxy } from "./shop-details-to-proxy";
import { RootConfig } from "../app-configuration/app-config";
import { getMappedAttributes } from "./attribute-mapping";
import { priceMapping } from "./price-mapping";
import { renderHandlebarsTemplate } from "../handlebarsTemplates/render-handlebars-template";
import { transformTemplateFormat } from "../handlebarsTemplates/transform-template-format";
import { EditorJsPlaintextRenderer } from "@saleor/apps-shared";
import { getRelatedMedia, getVariantMediaMap } from "./get-related-media";
import { getWeightAttributeValue } from "./get-weight-attribute-value";
import { createLogger } from "../../logger";

interface GenerateGoogleXmlFeedArgs {
  products: GoogleFeedProductFragment[];
  storefrontUrl: string;
  productStorefrontUrl: string;
  titleTemplate: string;
  attributeMapping?: RootConfig["attributeMapping"];
  shopName: string;
  shopDescription?: string;
}

const logger = createLogger("generateGoogleXmlFeed");

export const generateGoogleXmlFeed = ({
  attributeMapping,
  products,
  storefrontUrl,
  titleTemplate,
  productStorefrontUrl,
  shopName,
  shopDescription,
}: GenerateGoogleXmlFeedArgs) => {
  logger.debug("Generating Google XML feed");

  const items = products.reduce((prevs, product) => {
    const variantMap = product.variants!.map((variant) => {
      const attributes = getMappedAttributes({
        product,
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
        productMedia: product.media || [],
        productVariantId: variant.id,
        variantMediaMap: getVariantMediaMap({ product }) || [],
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
        isShippingRequired: product.productType.isShippingRequired,
        weight: variant.weight || undefined,
      });

      return productToProxy({
        link,
        title: title || "",
        id: product.id,
        slug: product.slug,
        variantId: variant.id,
        sku: variant.sku || undefined,
        description: EditorJsPlaintextRenderer({ stringData: product.description }),
        availability:
          variant.quantityAvailable && variant.quantityAvailable > 0 ? "in_stock" : "out_of_stock",
        category: product.category?.name || "unknown",
        googleProductCategory: product.category?.googleCategoryId || "",
        imageUrl: thumbnailUrl,
        additionalImageLinks: additionalImages,
        material: attributes?.material,
        color: attributes?.color,
        brand: attributes?.brand,
        pattern: attributes?.pattern,
        size: attributes?.size,
        gtin: attributes?.gtin,
        weight,
        ...pricing,
      });
    });

    return prevs.concat(variantMap);
  }, []);

  /*
   * logger.trace("Product data mapped to proxy format", {
   *   first: productVariants[0],
   *   totalLength: productVariants.length,
   * });
   */

  logger.trace("Creating XMLBuilder");

  const builder = new XMLBuilder({
    attributeNamePrefix: "@_",
    attributesGroupName: "@",
    textNodeName: "#text",
    ignoreAttributes: false,
    format: true,
    indentBy: "  ",
    suppressEmptyNode: false,
    preserveOrder: true,
  });

  logger.trace("XMLBuilder created");

  const channelData = shopDetailsToProxy({
    title: shopName,
    description: shopDescription,
    storefrontUrl,
  });

  logger.trace("Coverted shop details to proxy format", { channelData });

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

  return builder.build(data);
};
