import { createLogger } from "../../logger";
import { RootConfig } from "../app-configuration/app-config";
import { FeedXmlBuilder } from "./feed-xml-builder";
import { ProductVariant } from "./fetch-product-data";
import { productVariantToProxy } from "./product-variant-to-proxy";
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
    return productVariantToProxy({
      attributeMapping,
      titleTemplate,
      productStorefrontUrl,
      variant,
    });
  });

  logger.trace("Product data mapped to proxy format", {
    first: productVariants[0],
    totalLength: productVariants.length,
  });

  logger.trace("Creating XMLBuilder");

  logger.trace("XMLBuilder created");

  const channelData = shopDetailsToProxy({
    title: shopName,
    description: shopDescription,
    storefrontUrl,
  });

  const xmlBuilder = new FeedXmlBuilder();

  return xmlBuilder.buildRootXml({
    items,
    channelData,
  });
};
