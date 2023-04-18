import { XMLBuilder } from "fast-xml-parser";
import { GoogleFeedProductVariantFragment } from "../../../generated/graphql";
import { productToProxy } from "./product-to-proxy";
import { shopDetailsToProxy } from "./shop-details-to-proxy";
interface GenerateGoogleXmlFeedArgs {
  productVariants: GoogleFeedProductVariantFragment[];
  storefrontUrl: string;
  productStorefrontUrl: string;
  shopName: string;
  shopDescription?: string;
}

export const generateGoogleXmlFeed = ({
  productVariants,
  storefrontUrl,
  productStorefrontUrl,
  shopName,
  shopDescription,
}: GenerateGoogleXmlFeedArgs) => {
  const items = productVariants.map((v) => {
    // Price format has to be altered from the en format to the one expected by Google
    const price = v.pricing?.price?.gross.currency
      ? new Intl.NumberFormat("en-EN", {
          useGrouping: false,
          minimumFractionDigits: 2,
          style: "decimal",
          currencyDisplay: "code",
          currency: v.pricing?.price?.gross.currency,
        }).format(v.pricing?.price?.gross.amount) + ` ${v.pricing?.price?.gross.currency}`
      : undefined;

    return productToProxy({
      storefrontUrlTemplate: productStorefrontUrl,
      id: v.product.id,
      name: `${v.product.name} - ${v.name}`,
      slug: v.product.slug,
      variantId: v.id,
      sku: v.sku || undefined,
      description: v.product.seoDescription || v.product.description,
      availability: v.quantityAvailable && v.quantityAvailable > 0 ? "in_stock" : "out_of_stock",
      category: v.product.category?.name || "unknown",
      googleProductCategory: v.product.category?.googleCategoryId || "",
      price: price,
      imageUrl: v.product.thumbnail?.url || "",
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
