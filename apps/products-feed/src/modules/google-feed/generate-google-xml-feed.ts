import { XMLBuilder } from "fast-xml-parser";
import { GoogleFeedProductVariantFragment } from "../../../generated/graphql";
import { productToProxy } from "./product-to-proxy";
import { shopDetailsToProxy } from "./shop-details-to-proxy";
import { EditorJsPlaintextRenderer } from "../editor-js/editor-js-plaintext-renderer";
import { RootConfig } from "../app-configuration/app-config";
import { getMappedAttributes } from "./attribute-mapping";
import { priceMapping } from "./price-mapping";

interface GenerateGoogleXmlFeedArgs {
  productVariants: GoogleFeedProductVariantFragment[];
  storefrontUrl: string;
  productStorefrontUrl: string;
  attributeMapping?: RootConfig["attributeMapping"];
  shopName: string;
  shopDescription?: string;
}

export const generateGoogleXmlFeed = ({
  attributeMapping,
  productVariants,
  storefrontUrl,
  productStorefrontUrl,
  shopName,
  shopDescription,
}: GenerateGoogleXmlFeedArgs) => {
  const items = productVariants.map((variant) => {
    const attributes = getMappedAttributes({
      attributeMapping: attributeMapping,
      variant,
    });

    const pricing = priceMapping({ pricing: variant.pricing });

    return productToProxy({
      storefrontUrlTemplate: productStorefrontUrl,
      id: variant.product.id,
      name: `${variant.product.name} - ${variant.name}`,
      slug: variant.product.slug,
      variantId: variant.id,
      sku: variant.sku || undefined,
      description: EditorJsPlaintextRenderer({ stringData: variant.product.description }),
      availability:
        variant.quantityAvailable && variant.quantityAvailable > 0 ? "in_stock" : "out_of_stock",
      category: variant.product.category?.name || "unknown",
      googleProductCategory: variant.product.category?.googleCategoryId || "",
      imageUrl: variant.product.thumbnail?.url || "",
      material: attributes?.material,
      color: attributes?.color,
      brand: attributes?.brand,
      pattern: attributes?.pattern,
      size: attributes?.size,
      ...pricing,
    });
  });

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

  const channelData = shopDetailsToProxy({
    title: shopName,
    description: shopDescription,
    storefrontUrl,
  });

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
          // @ts-ignore - This is "just an object" that is transformed to XML. I dont see good way to type it, other than "any"
          channel: channelData.concat(items),
        },
      ],
      ":@": {
        "@_xmlns:g": "http://base.google.com/ns/1.0",
        "@_version": "2.0",
      },
    },
  ];

  return builder.build(data);
};
