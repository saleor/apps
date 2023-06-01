import { XMLBuilder } from "fast-xml-parser";
import { GoogleFeedProductVariantFragment } from "../../../generated/graphql";
import { productToProxy } from "./product-to-proxy";
import { shopDetailsToProxy } from "./shop-details-to-proxy";
import { EditorJsPlaintextRenderer } from "../editor-js/editor-js-plaintext-renderer";

interface GenerateGoogleXmlFeedArgs {
  productVariants: GoogleFeedProductVariantFragment[];
  storefrontUrl: string;
  productStorefrontUrl: string;
  shopName: string;
  shopDescription?: string;
}

/**
 * Price format has to be altered from the en format to the one expected by Google
 * eg. 1.00 USD, 5.00 PLN
 */
const formatCurrency = (currency: string, amount: number) => {
  return (
    new Intl.NumberFormat("en-EN", {
      useGrouping: false,
      minimumFractionDigits: 2,
      style: "decimal",
      currencyDisplay: "code",
      currency: currency,
    }).format(amount) + ` ${currency}`
  );
};

export const generateGoogleXmlFeed = ({
  productVariants,
  storefrontUrl,
  productStorefrontUrl,
  shopName,
  shopDescription,
}: GenerateGoogleXmlFeedArgs) => {
  const items = productVariants.map((variant) => {
    const currency = variant.pricing?.price?.gross.currency;
    const amount = variant.pricing?.price?.gross.amount;

    const price = currency ? formatCurrency(currency, amount!) : undefined;

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
      price: price,
      imageUrl: variant.product.thumbnail?.url || "",
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
